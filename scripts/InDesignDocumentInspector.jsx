//
// Enhanced InDesign Document Inspector Script v2.1
// Comprehensive analysis with bulletproof error handling, text capture, and auto-discovery
// Main inspector script - must be loaded before using the comparison utility
//

// Global configuration for analysis depth, safety, and new features
var ANALYSIS_CONFIG = {
    version: "2.1",
    maxRecursionDepth: 10,
    enableDeepScan: true,
    skipEmptyProperties: true,
    timeoutThreshold: 30000, // 30 seconds max per section
    safeMode: true,
    logErrors: true,
    errors: [],
    maxErrorsPerSection: 5,
    skipProblematicProperties: true,
    
    // Enhanced features for v2.1
    enableTextCapture: true,
    enableAutoDiscovery: true,
    enablePropertyTracking: true,
    maxTextPreviewLength: 500,
    maxCollectionSample: 50,
    
    // Runtime tracking
    discoveredCollections: [],
    textItemsProcessed: 0,
    brokenPropertiesFound: [],
    processingStartTime: null,
    
    // Known problematic properties to skip
    problematicProperties: [
        'parent.parent.parent', // Deep nesting issues
        'selection.item', // Selection-dependent
        'activeWindow.panels', // UI-dependent
        'preferences.dictionary', // Often causes crashes
        'preferences.workspace', // Version-dependent
        'links.parent.parent' // Complex relationships
    ]
};

// Enhanced safe property accessor with comprehensive error handling and type checking
function safeGetProperty(obj, prop, defaultValue) {
    try {
        // Handle null/undefined object
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Skip known problematic properties
        if (typeof prop === 'string') {
            for (var i = 0; i < ANALYSIS_CONFIG.problematicProperties.length; i++) {
                if (prop.indexOf(ANALYSIS_CONFIG.problematicProperties[i]) !== -1) {
                    return defaultValue !== undefined ? defaultValue : null;
                }
            }
        }
        
        // Handle array-like access (e.g., obj[0])
        if (typeof prop === 'number') {
            if (obj.length !== undefined && prop >= 0 && prop < obj.length) {
                var value = obj[prop];
                return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
            }
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Handle string property access
        if (typeof prop === 'string') {
            // Try hasOwnProperty first (safer)
            if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
                var value = obj[prop];
                return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
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
            logError("safeGetProperty failed for prop '" + prop + "': " + e.message, 'propertyAccess', 'medium');
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Safe nested property accessor for complex paths with enhanced path parsing
function safeGetNestedProperty(obj, path, defaultValue) {
    try {
        if (!obj || !path) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Convert path to string and split by dots, handling array notation
        var pathStr = path.toString();
        var pathArray = pathStr.split('.');
        var current = obj;
        
        for (var i = 0; i < pathArray.length; i++) {
            var segment = pathArray[i];
            
            // Handle array notation like "pages[0]" or "items[5]"
            if (segment.indexOf('[') !== -1) {
                var arrayMatch = segment.match(/^([^[]+)\[(\d+)\]$/);
                if (arrayMatch) {
                    var propName = arrayMatch[1];
                    var index = parseInt(arrayMatch[2]);
                    
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
            logError("safeGetNestedProperty failed for path '" + path + "': " + e.message, 'nestedAccess', 'medium');
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Enhanced error logging with categorization
function logError(message, category, severity) {
    try {
        if (!ANALYSIS_CONFIG.errors) {
            ANALYSIS_CONFIG.errors = [];
        }
        
        var errorEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            category: category || 'general',
            severity: severity || 'medium'
        };
        
        ANALYSIS_CONFIG.errors.push(errorEntry);
        
        // Limit error log size to prevent memory issues
        if (ANALYSIS_CONFIG.errors.length > 200) {
            ANALYSIS_CONFIG.errors.splice(0, 100); // Remove oldest 100 entries
        }
    } catch (e) {
        // Can't even log the error - just continue
    }
}

// Safe collection length getter with type checking
function safeGetLength(collection) {
    try {
        if (!collection) return 0;
        if (typeof collection.length !== 'undefined') return collection.length;
        if (typeof collection.count !== 'undefined') return collection.count;
        
        // Try to determine length by iteration (as last resort)
        var count = 0;
        try {
            for (var i = 0; i < 1000; i++) { // Limit to prevent infinite loops
                if (collection[i] !== undefined) {
                    count++;
                } else {
                    break;
                }
            }
            return count;
        } catch (e) {
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

// Enhanced safe collection iterator with progress tracking and discovery
function safeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) return [];
    
    maxItems = maxItems || ANALYSIS_CONFIG.maxCollectionSample;
    var results = [];
    
    try {
        var length = safeGetLength(collection);
        
        // Auto-discovery: Track discovered collections
        if (ANALYSIS_CONFIG.enableAutoDiscovery && collectionName) {
            var discoveryInfo = {
                name: collectionName,
                length: length,
                accessible: true,
                sampleTypes: [],
                processingTime: 0,
                errorCount: 0
            };
            
            var discoveryStartTime = new Date().getTime();
            
            // Sample first few items to determine types
            for (var sampleIndex = 0; sampleIndex < Math.min(3, length); sampleIndex++) {
                try {
                    var sampleItem = collection[sampleIndex];
                    if (sampleItem && sampleItem.constructor) {
                        var typeName = sampleItem.constructor.name;
                        if (discoveryInfo.sampleTypes.indexOf(typeName) === -1) {
                            discoveryInfo.sampleTypes.push(typeName);
                        }
                    }
                } catch (e) {
                    discoveryInfo.errorCount++;
                }
            }
            
            discoveryInfo.processingTime = new Date().getTime() - discoveryStartTime;
            ANALYSIS_CONFIG.discoveredCollections.push(discoveryInfo);
        }
        
        // Process collection items with timeout protection
        var processingStartTime = new Date().getTime();
        for (var i = 0; i < Math.min(length, maxItems); i++) {
            // Timeout protection for very large collections
            if (new Date().getTime() - processingStartTime > ANALYSIS_CONFIG.timeoutThreshold) {
                results.push({
                    notice: "Collection processing timed out at item " + i,
                    timeoutProtection: true,
                    itemsProcessed: i,
                    totalItems: length
                });
                break;
            }
            
            try {
                var item = collection[i];
                if (item) {
                    var result = callback(item, i);
                    if (result !== null && result !== undefined) {
                        results.push(result);
                    }
                }
            } catch (itemError) {
                if (ANALYSIS_CONFIG.logErrors) {
                    logError("Collection item processing failed at index " + i + ": " + itemError.message, 'collectionItem', 'low');
                }
                results.push({
                    error: "Failed to process item " + i + ": " + itemError.message,
                    index: i,
                    recoverable: true,
                    collectionName: collectionName || 'unknown'
                });
            }
        }
        
        // If we hit the max items limit, note it
        if (length > maxItems) {
            results.push({
                notice: "Collection truncated: showing first " + maxItems + " of " + length + " items",
                totalItems: length,
                shownItems: maxItems,
                truncationReason: "Performance optimization"
            });
        }
        
    } catch (e) {
        results.push({
            error: "Collection iteration failed: " + e.message,
            collectionName: collectionName || 'unknown',
            recoverable: false,
            errorType: 'collection_failure'
        });
        
        if (ANALYSIS_CONFIG.logErrors) {
            logError("Collection iteration failed for " + (collectionName || 'unknown') + ": " + e.message, 'collection', 'high');
        }
    }
    
    return results;
}

// Enhanced safe section inspector with timeout protection and retry logic
function safeAnalyzeSection(sectionName, analyzeFunction) {
    var startTime = new Date().getTime();
    var sectionConfig = {
        name: sectionName,
        timeout: ANALYSIS_CONFIG.timeoutThreshold,
        retryCount: 0,
        maxRetries: 2
    };
    
    function attemptAnalysis() {
        try {
            var result = analyzeFunction();
            var duration = new Date().getTime() - startTime;
            
            if (duration > sectionConfig.timeout) {
                if (sectionConfig.retryCount < sectionConfig.maxRetries) {
                    sectionConfig.retryCount++;
                    sectionConfig.timeout *= 1.5; // Increase timeout for retry
                    logError("Section " + sectionName + " timed out, retrying with extended timeout", 'timeout', 'medium');
                    return attemptAnalysis();
                } else {
                    logError("Section " + sectionName + " timed out after " + duration + "ms with " + sectionConfig.retryCount + " retries", 'timeout', 'high');
                    return {
                        error: "Section analysis timed out after " + duration + "ms",
                        partialData: result,
                        timeout: true,
                        retryCount: sectionConfig.retryCount,
                        sectionName: sectionName
                    };
                }
            }
            
            return result;
            
        } catch (error) {
            if (sectionConfig.retryCount < sectionConfig.maxRetries && 
                error.message.indexOf('timeout') === -1) {
                sectionConfig.retryCount++;
                logError("Section " + sectionName + " failed, retrying: " + error.message, 'sectionRetry', 'medium');
                return attemptAnalysis();
            } else {
                logError("Section " + sectionName + " analysis failed: " + error.message, 'sectionFailure', 'high');
                return {
                    error: "Section analysis failed: " + error.message,
                    sectionName: sectionName,
                    line: error.line || "unknown",
                    recoverable: true,
                    retryCount: sectionConfig.retryCount,
                    errorType: categorizeError(error)
                };
            }
        }
    }
    
    return attemptAnalysis();
}

// Enhanced error categorization
function categorizeError(error) {
    var message = error.message || '';
    if (message.indexOf('timeout') !== -1) return 'timeout';
    if (message.indexOf('access') !== -1) return 'access_denied';
    if (message.indexOf('property') !== -1) return 'property_error';
    if (message.indexOf('Object does not support') !== -1) return 'unsupported_property';
    if (message.indexOf('permission') !== -1) return 'permission_error';
    return 'unknown';
}

// Main enhanced document report creation with comprehensive features
function createDocumentReport(doc) {
    // Initialize runtime tracking
    ANALYSIS_CONFIG.processingStartTime = new Date().getTime();
    ANALYSIS_CONFIG.errors = [];
    ANALYSIS_CONFIG.discoveredCollections = [];
    ANALYSIS_CONFIG.textItemsProcessed = 0;
    ANALYSIS_CONFIG.brokenPropertiesFound = [];
    
    var report = {
        timestamp: new Date().toISOString(),
        analysisVersion: "2.1",
        analysisConfig: {
            enableTextCapture: ANALYSIS_CONFIG.enableTextCapture,
            enableAutoDiscovery: ANALYSIS_CONFIG.enableAutoDiscovery,
            enablePropertyTracking: ANALYSIS_CONFIG.enablePropertyTracking,
            maxRecursionDepth: ANALYSIS_CONFIG.maxRecursionDepth,
            safeMode: ANALYSIS_CONFIG.safeMode
        },
        
        // Core document analysis
        documentInfo: safeAnalyzeSection("documentInfo", function() { return getDocumentInfo(doc); }),
        documentPreferences: safeAnalyzeSection("documentPreferences", function() { return getDocumentPreferences(doc); }),
        pages: safeAnalyzeSection("pages", function() { return getPagesInfo(doc); }),
        spreads: safeAnalyzeSection("spreads", function() { return getSpreadsInfo(doc); }),
        masterSpreads: safeAnalyzeSection("masterSpreads", function() { return getMasterSpreadsInfo(doc); }),
        layers: safeAnalyzeSection("layers", function() { return getLayersInfo(doc); }),
        stories: safeAnalyzeSection("stories", function() { return getStoriesInfo(doc); }),
        pageItems: safeAnalyzeSection("pageItems", function() { return getPageItemsInfo(doc); }),
        
        // Enhanced content analysis
        images: safeAnalyzeSection("images", function() { return getComprehensiveImagesInfo(doc); }),
        graphics: safeAnalyzeSection("graphics", function() { return getComprehensiveGraphicsInfo(doc); }),
        textFrames: safeAnalyzeSection("textFrames", function() { return getTextFramesInfo(doc); }),
        
        // New comprehensive text analysis
        textContent: safeAnalyzeSection("textContent", function() { return getComprehensiveTextContent(doc); }),
        
        // Style and asset analysis
        styles: safeAnalyzeSection("styles", function() { return getStylesInfo(doc); }),
        colors: safeAnalyzeSection("colors", function() { return getColorsInfo(doc); }),
        fonts: safeAnalyzeSection("fonts", function() { return getFontsInfo(doc); }),
        links: safeAnalyzeSection("links", function() { return getLinksInfo(doc); }),
        preferences: safeAnalyzeSection("preferences", function() { return getPreferencesInfo(doc); }),
        metadata: safeAnalyzeSection("metadata", function() { return getMetadataInfo(doc); }),
        
        // Advanced analysis features
        objectHierarchy: safeAnalyzeSection("objectHierarchy", function() { return getObjectHierarchy(doc); }),
        autoDiscoveredCollections: safeAnalyzeSection("autoDiscoveredCollections", function() { return getAutoDiscoveredCollections(doc); }),
        commonPaths: safeAnalyzeSection("commonPaths", function() { return generateCommonPathsReference(doc); }),
        brokenProperties: safeAnalyzeSection("brokenProperties", function() { return trackBrokenProperties(doc); }),
        
        // Analysis metadata
        processingTime: 0,
        discoveryStats: {},
        errors: []
    };
    
    // Add processing time and discovery stats
    report.processingTime = new Date().getTime() - ANALYSIS_CONFIG.processingStartTime;
    report.discoveryStats = {
        collectionsDiscovered: ANALYSIS_CONFIG.discoveredCollections.length,
        textItemsProcessed: ANALYSIS_CONFIG.textItemsProcessed,
        brokenPropertiesFound: ANALYSIS_CONFIG.brokenPropertiesFound.length,
        errorsEncountered: ANALYSIS_CONFIG.errors.length
    };
    report.errors = ANALYSIS_CONFIG.errors;
    
    return report;
}

// Enhanced comprehensive text content analysis with full text capture
function getComprehensiveTextContent(doc) {
    if (!ANALYSIS_CONFIG.enableTextCapture) {
        return { disabled: "Text capture disabled in configuration" };
    }
    
    var textAnalysis = {
        summary: {
            totalTextFrames: 0,
            totalStories: 0,
            totalCharacters: 0,
            totalWords: 0,
            totalParagraphs: 0,
            overflowingFrames: 0,
            emptyFrames: 0,
            processingTime: 0
        },
        textFrameDetails: [],
        storyDetails: [],
        textPaths: [],
        textSamples: [],
        tableText: [],
        footnoteText: [],
        textInGroups: [],
        textStatistics: {}
    };
    
    var textStartTime = new Date().getTime();
    
    // Comprehensive text frame analysis
    try {
        textAnalysis.textFrameDetails = safeIterateCollection(doc.textFrames, function(textFrame, index) {
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
                    isEmpty: true,
                    hasSpecialCharacters: false,
                    encoding: "utf-8"
                },
                paragraphs: [],
                appliedStyles: {
                    paragraphStyles: [],
                    characterStyles: []
                },
                textStatistics: {
                    averageWordsPerParagraph: 0,
                    averageCharactersPerWord: 0,
                    lineCount: 0
                }
            };
            
            // Get page information
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
            
            // Extract comprehensive text content
            try {
                if (textFrame.contents) {
                    var fullText = textFrame.contents;
                    frameAnalysis.textContent.fullText = fullText;
                    frameAnalysis.textContent.preview = fullText.length > ANALYSIS_CONFIG.maxTextPreviewLength ? 
                        fullText.substring(0, ANALYSIS_CONFIG.maxTextPreviewLength) + "..." : fullText;
                    frameAnalysis.textContent.characterCount = fullText.length;
                    frameAnalysis.textContent.isEmpty = fullText.length === 0;
                    
                    // Check for special characters
                    frameAnalysis.textContent.hasSpecialCharacters = /[^\x00-\x7F]/.test(fullText);
                    
                    // Enhanced word counting with better tokenization
                    var words = fullText.split(/\s+/).filter(function(word) { 
                        return word.length > 0 && word.match(/\w/); 
                    });
                    frameAnalysis.textContent.wordCount = words.length;
                    
                    // Calculate text statistics
                    if (words.length > 0) {
                        var totalChars = words.join('').length;
                        frameAnalysis.textStatistics.averageCharactersPerWord = Math.round(totalChars / words.length * 10) / 10;
                    }
                }
                
                // Enhanced paragraph analysis
                if (textFrame.paragraphs) {
                    frameAnalysis.textContent.paragraphCount = safeGetLength(textFrame.paragraphs);
                    
                    if (frameAnalysis.textContent.wordCount > 0 && frameAnalysis.textContent.paragraphCount > 0) {
                        frameAnalysis.textStatistics.averageWordsPerParagraph = 
                            Math.round(frameAnalysis.textContent.wordCount / frameAnalysis.textContent.paragraphCount * 10) / 10;
                    }
                    
                    // Analyze paragraphs for styles and content
                    frameAnalysis.paragraphs = safeIterateCollection(textFrame.paragraphs, function(paragraph, pIndex) {
                        if (pIndex < 10) { // Sample first 10 paragraphs
                            var paragraphContent = safeGetProperty(paragraph, 'contents', '');
                            return {
                                index: pIndex,
                                path: "doc.textFrames[" + index + "].paragraphs[" + pIndex + "]",
                                contents: paragraphContent.substring(0, 200),
                                fullContents: paragraphContent,
                                appliedParagraphStyle: safeGetProperty(paragraph.appliedParagraphStyle, 'name'),
                                characterCount: safeGetLength(paragraph.characters),
                                wordCount: safeGetLength(paragraph.words),
                                isEmpty: paragraphContent.length === 0
                            };
                        }
                        return null;
                    }, 10, "paragraphs");
                }
                
                // Get line count
                if (textFrame.lines) {
                    frameAnalysis.textStatistics.lineCount = safeGetLength(textFrame.lines);
                }
                
                // Track applied styles comprehensively
                frameAnalysis.appliedStyles = getTextFrameStyles(textFrame);
                
            } catch (e) {
                frameAnalysis.textContentError = "Failed to extract text content: " + e.message;
                logError("Text extraction failed for frame " + index + ": " + e.message, 'textContent', 'medium');
            }
            
            // Update global summary
            textAnalysis.summary.totalTextFrames++;
            if (frameAnalysis.textContent.characterCount > 0) {
                textAnalysis.summary.totalCharacters += frameAnalysis.textContent.characterCount;
                textAnalysis.summary.totalWords += frameAnalysis.textContent.wordCount;
                textAnalysis.summary.totalParagraphs += frameAnalysis.textContent.paragraphCount;
            }
            if (frameAnalysis.overflows) textAnalysis.summary.overflowingFrames++;
            if (frameAnalysis.textContent.isEmpty) textAnalysis.summary.emptyFrames++;
            
            ANALYSIS_CONFIG.textItemsProcessed++;
            
            return frameAnalysis;
        }, ANALYSIS_CONFIG.maxCollectionSample, "textFrames");
    } catch (e) {
        textAnalysis.textFrameDetailsError = "Failed to analyze text frames: " + e.message;
        logError("Text frames analysis failed: " + e.message, 'textContent', 'high');
    }
    
    // Enhanced story analysis
    try {
        textAnalysis.storyDetails = safeIterateCollection(doc.stories, function(story, index) {
            var storyAnalysis = {
                index: index,
                id: safeGetProperty(story, 'id'),
                path: "doc.stories[" + index + "]",
                length: safeGetProperty(story, 'length', 0),
                textFrameCount: safeGetLength(story.textFrames),
                overflows: safeGetProperty(story, 'overflows', false),
                textContent: {
                    preview: null,
                    fullPreview: null,
                    firstParagraph: null,
                    lastParagraph: null,
                    characterCount: 0,
                    wordCount: 0
                },
                threading: {
                    isThreaded: false,
                    threadLength: 0,
                    frameIds: []
                }
            };
            
            // Get comprehensive story content
            try {
                if (story.contents) {
                    var storyText = story.contents;
                    storyAnalysis.textContent.preview = storyText.substring(0, 300);
                    storyAnalysis.textContent.fullPreview = storyText.substring(0, ANALYSIS_CONFIG.maxTextPreviewLength);
                    storyAnalysis.textContent.characterCount = storyText.length;
                    
                    // Count words in story
                    var storyWords = storyText.split(/\s+/).filter(function(word) { 
                        return word.length > 0 && word.match(/\w/); 
                    });
                    storyAnalysis.textContent.wordCount = storyWords.length;
                    
                    // Get first and last paragraph content
                    if (story.paragraphs && story.paragraphs.length > 0) {
                        storyAnalysis.textContent.firstParagraph = {
                            content: safeGetProperty(story.paragraphs[0], 'contents', '').substring(0, 200),
                            path: "doc.stories[" + index + "].paragraphs[0]"
                        };
                        
                        if (story.paragraphs.length > 1) {
                            var lastIndex = story.paragraphs.length - 1;
                            storyAnalysis.textContent.lastParagraph = {
                                content: safeGetProperty(story.paragraphs[lastIndex], 'contents', '').substring(0, 200),
                                path: "doc.stories[" + index + "].paragraphs[" + lastIndex + "]"
                            };
                        }
                    }
                }
                
                // Analyze threading
                if (story.textFrames && story.textFrames.length > 1) {
                    storyAnalysis.threading.isThreaded = true;
                    storyAnalysis.threading.threadLength = story.textFrames.length;
                    
                    // Get frame IDs for threading analysis
                    for (var tf = 0; tf < Math.min(story.textFrames.length, 10); tf++) {
                        var frameId = safeGetProperty(story.textFrames[tf], 'id');
                        if (frameId) {
                            storyAnalysis.threading.frameIds.push(frameId);
                        }
                    }
                }
                
            } catch (e) {
                storyAnalysis.textContentError = "Failed to extract story content: " + e.message;
                logError("Story content extraction failed for story " + index + ": " + e.message, 'textContent', 'medium');
            }
            
            textAnalysis.summary.totalStories++;
            ANALYSIS_CONFIG.textItemsProcessed++;
            
            return storyAnalysis;
        }, ANALYSIS_CONFIG.maxCollectionSample, "stories");
    } catch (e) {
        textAnalysis.storyDetailsError = "Failed to analyze stories: " + e.message;
        logError("Stories analysis failed: " + e.message, 'textContent', 'high');
    }
    
    // Generate text access paths
    textAnalysis.textPaths = generateTextAccessPaths(doc);
    
    // Extract representative text samples
    textAnalysis.textSamples = extractTextSamples(doc);
    
    // Analyze table text
    textAnalysis.tableText = analyzeTableText(doc);
    
    // Find text in groups and nested objects
    textAnalysis.textInGroups = findTextInGroups(doc);
    
    // Calculate overall text statistics
    textAnalysis.textStatistics = calculateTextStatistics(textAnalysis);
    
    textAnalysis.summary.processingTime = new Date().getTime() - textStartTime;
    
    return textAnalysis;
}

// Enhanced text frame styles analysis
function getTextFrameStyles(textFrame) {
    var styles = {
        paragraphStyles: [],
        characterStyles: [],
        objectStyles: []
    };
    
    try {
        // Get paragraph styles
        if (textFrame.paragraphs) {
            for (var i = 0; i < Math.min(textFrame.paragraphs.length, 10); i++) {
                try {
                    var paragraph = textFrame.paragraphs[i];
                    var styleName = safeGetProperty(paragraph.appliedParagraphStyle, 'name');
                    if (styleName && styles.paragraphStyles.indexOf(styleName) === -1) {
                        styles.paragraphStyles.push({
                            name: styleName,
                            path: "doc.textFrames[n].paragraphs[" + i + "].appliedParagraphStyle"
                        });
                    }
                } catch (e) {
                    // Skip problematic paragraph
                }
            }
        }
        
        // Get character styles (sample)
        if (textFrame.characters && textFrame.characters.length > 0) {
            for (var i = 0; i < Math.min(textFrame.characters.length, 50); i += 10) {
                try {
                    var character = textFrame.characters[i];
                    var styleName = safeGetProperty(character.appliedCharacterStyle, 'name');
                    if (styleName && styles.characterStyles.indexOf(styleName) === -1) {
                        styles.characterStyles.push({
                            name: styleName,
                            path: "doc.textFrames[n].characters[" + i + "].appliedCharacterStyle"
                        });
                    }
                } catch (e) {
                    // Skip problematic character
                }
            }
        }
        
        // Get object style
        try {
            var objectStyleName = safeGetProperty(textFrame.appliedObjectStyle, 'name');
            if (objectStyleName) {
                styles.objectStyles.push({
                    name: objectStyleName,
                    path: "doc.textFrames[n].appliedObjectStyle"
                });
            }
        } catch (e) {
            // Object style not available
        }
        
    } catch (e) {
        logError("Text frame styles analysis failed: " + e.message, 'styles', 'medium');
    }
    
    return styles;
}

// Enhanced auto-discovery of collections and properties
function getAutoDiscoveredCollections(doc) {
    if (!ANALYSIS_CONFIG.enableAutoDiscovery) {
        return { disabled: "Auto-discovery disabled in configuration" };
    }
    
    var discoveryResults = {
        summary: {
            totalCollectionsFound: 0,
            accessibleCollections: 0,
            inaccessibleCollections: 0,
            newCollectionsThisRun: 0
        },
        discoveredCollections: [],
        propertyMap: {},
        accessPatterns: [],
        recommendations: []
    };
    
    // Use the collections discovered during processing
    discoveryResults.discoveredCollections = ANALYSIS_CONFIG.discoveredCollections;
    discoveryResults.summary.totalCollectionsFound = ANALYSIS_CONFIG.discoveredCollections.length;
    
    // Count accessible vs inaccessible
    for (var i = 0; i < ANALYSIS_CONFIG.discoveredCollections.length; i++) {
        var collection = ANALYSIS_CONFIG.discoveredCollections[i];
        if (collection.accessible) {
            discoveryResults.summary.accessibleCollections++;
        } else {
            discoveryResults.summary.inaccessibleCollections++;
        }
    }
    
    // Generate property map from discovered collections
    try {
        for (var i = 0; i < ANALYSIS_CONFIG.discoveredCollections.length; i++) {
            var collection = ANALYSIS_CONFIG.discoveredCollections[i];
            var propertyKey = collection.name;
            
            discoveryResults.propertyMap[propertyKey] = {
                collectionType: collection.sampleTypes,
                length: collection.length,
                accessible: collection.accessible,
                recommendedAccess: "doc." + collection.name + "[index]",
                alternativeAccess: ["doc." + collection.name + ".item(index)", "doc." + collection.name + ".itemByRange(start, end)"],
                processingTime: collection.processingTime,
                errorCount: collection.errorCount
            };
        }
    } catch (e) {
        logError("Property map generation failed: " + e.message, 'autoDiscovery', 'medium');
    }
    
    // Generate access pattern recommendations
    discoveryResults.accessPatterns = generateAccessPatterns(discoveryResults.propertyMap);
    
    // Generate recommendations based on discoveries
    discoveryResults.recommendations = generateDiscoveryRecommendations(discoveryResults);
    
    return discoveryResults;
}

// Enhanced broken property tracking with comprehensive detection
function trackBrokenProperties(doc) {
    if (!ANALYSIS_CONFIG.enablePropertyTracking) {
        return { disabled: "Property tracking disabled in configuration" };
    }
    
    var brokenTracking = {
        summary: {
            totalPropertiesChecked: 0,
            brokenProperties: 0,
            inaccessibleProperties: 0,
            nullProperties: 0,
            undefinedProperties: 0,
            timeoutProperties: 0
        },
        brokenByCategory: {
            documentLevel: [],
            pageLevel: [],
            contentLevel: [],
            styleLevel: [],
            linkLevel: [],
            collectionLevel: []
        },
        commonIssues: [],
        propertyReliability: {},
        recommendations: [],
        testResults: {}
    };
    
    // Comprehensive property testing framework
    var testSuites = {
        document: [
            { prop: 'name', expected: 'string', critical: true },
            { prop: 'filePath', expected: 'object', nullable: true },
            { prop: 'saved', expected: 'boolean', critical: true },
            { prop: 'selection', expected: 'object', nullable: true },
            { prop: 'activeLayer', expected: 'object', nullable: true },
            { prop: 'zeroPoint', expected: 'object', nullable: true },
            { prop: 'modified', expected: 'boolean' },
            { prop: 'visible', expected: 'boolean' },
            { prop: 'readonly', expected: 'boolean' }
        ],
        page: [
            { prop: 'name', expected: 'string', critical: true },
            { prop: 'bounds', expected: 'object', critical: true },
            { prop: 'appliedMaster', expected: 'object', nullable: true },
            { prop: 'marginPreferences', expected: 'object', critical: true },
            { prop: 'side', expected: 'number', nullable: true },
            { prop: 'documentOffset', expected: 'number' }
        ],
        textFrame: [
            { prop: 'contents', expected: 'string', nullable: true, critical: true },
            { prop: 'overflows', expected: 'boolean', critical: true },
            { prop: 'parentStory', expected: 'object', nullable: true },
            { prop: 'bounds', expected: 'object', critical: true },
            { prop: 'itemLayer', expected: 'object', nullable: true }
        ]
    };
    
    // Test document-level properties
    brokenTracking.testResults.document = runPropertyTests(doc, testSuites.document, 'doc', brokenTracking);
    
    // Test page-level properties (if pages exist)
    if (doc.pages && doc.pages.length > 0) {
        try {
            brokenTracking.testResults.page = runPropertyTests(doc.pages[0], testSuites.page, 'doc.pages[0]', brokenTracking);
        } catch (e) {
            brokenTracking.brokenByCategory.pageLevel.push({
                property: "pages[0]",
                path: "doc.pages[0]",
                error: "Failed to access first page: " + e.message,
                accessible: false,
                critical: true
            });
        }
    }
    
    // Analyze reliability patterns
    brokenTracking.propertyReliability = analyzePropertyReliability(brokenTracking);
    
    // Generate comprehensive recommendations
    brokenTracking.recommendations = generatePropertyRecommendations(brokenTracking);
    
    // Track broken properties globally
    ANALYSIS_CONFIG.brokenPropertiesFound = brokenTracking.brokenByCategory;
    
    return brokenTracking;
}

// Run property tests with enhanced error detection
function runPropertyTests(obj, tests, basePath, brokenTracking) {
    var results = [];
    
    for (var i = 0; i < tests.length; i++) {
        var test = tests[i];
        var result = testPropertyAccess(obj, test.prop, basePath + '.' + test.prop, test.expected, test.nullable);
        
        result.critical = test.critical || false;
        results.push(result);
        
        brokenTracking.summary.totalPropertiesChecked++;
        
        if (!result.accessible) {
            brokenTracking.summary.brokenProperties++;
            
            // Categorize by base path
            if (basePath.indexOf('pages') !== -1) {
                brokenTracking.brokenByCategory.pageLevel.push(result);
            } else if (basePath.indexOf('doc.') === 0 && basePath.indexOf('.') === basePath.lastIndexOf('.')) {
                brokenTracking.brokenByCategory.documentLevel.push(result);
            } else {
                brokenTracking.brokenByCategory.contentLevel.push(result);
            }
        } else if (result.value === null) {
            brokenTracking.summary.nullProperties++;
        } else if (result.value === undefined) {
            brokenTracking.summary.undefinedProperties++;
        }
    }
    
    return results;
}

// Enhanced property access testing
function testPropertyAccess(obj, propName, propPath, expectedType, nullable) {
    var result = {
        property: propName,
        path: propPath,
        expectedType: expectedType,
        actualType: null,
        value: null,
        accessible: false,
        error: null,
        nullable: nullable || false,
        testTime: 0,
        timeout: false
    };
    
    var startTime = new Date().getTime();
    
    try {
        var value = obj[propName];
        result.testTime = new Date().getTime() - startTime;
        
        // Check for timeout
        if (result.testTime > 1000) { // 1 second timeout for property access
            result.timeout = true;
        }
        
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
        result.testTime = new Date().getTime() - startTime;
        result.error = e.message;
        result.accessible = false;
        
        // Categorize error types
        if (e.message.indexOf('Access denied') !== -1) {
            result.errorType = 'access_denied';
        } else if (e.message.indexOf('Object does not support') !== -1) {
            result.errorType = 'property_not_supported';
        } else if (e.message.indexOf('Invalid index') !== -1) {
            result.errorType = 'invalid_index';
        } else {
            result.errorType = 'unknown';
        }
    }
    
    return result;
}

// Standard document analysis functions with enhanced error handling
function getDocumentInfo(doc) {
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
        documentOffset: safeGetProperty(doc, 'documentOffset'),
        rulers: {
            horizontalMeasurementUnits: safeGetProperty(doc, 'viewPreferences.horizontalMeasurementUnits'),
            verticalMeasurementUnits: safeGetProperty(doc, 'viewPreferences.verticalMeasurementUnits')
        }
    };
}

function getDocumentPreferences(doc) {
    var prefs = {};
    try {
        var prefCategories = ['documentPreferences', 'marginPreferences', 'bleedPreferences', 'slugPreferences'];
        
        for (var i = 0; i < prefCategories.length; i++) {
            var category = prefCategories[i];
            var categoryPrefs = safeGetProperty(doc, category);
            if (categoryPrefs) {
                prefs[category] = extractObjectProperties(categoryPrefs, category);
            }
        }
    } catch (e) {
        logError("Document preferences extraction failed: " + e.message, 'preferences', 'medium');
        prefs.error = e.message;
    }
    
    return prefs;
}

function getPagesInfo(doc) {
    return safeIterateCollection(doc.pages, function(page, index) {
        return {
            index: index,
            id: safeGetProperty(page, 'id'),
            name: safeGetProperty(page, 'name'),
            bounds: safeGetProperty(page, 'bounds'),
            side: safeGetProperty(page, 'side'),
            documentOffset: safeGetProperty(page, 'documentOffset'),
            appliedMaster: safeGetProperty(page.appliedMaster, 'name'),
            marginPreferences: extractObjectProperties(safeGetProperty(page, 'marginPreferences'), 'marginPreferences'),
            pageItems: safeGetLength(page.pageItems)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "pages");
}

function getSpreadsInfo(doc) {
    return safeIterateCollection(doc.spreads, function(spread, index) {
        return {
            index: index,
            id: safeGetProperty(spread, 'id'),
            name: safeGetProperty(spread, 'name'),
            pages: safeGetLength(spread.pages),
            pageItems: safeGetLength(spread.pageItems),
            bounds: safeGetProperty(spread, 'bounds'),
            bleedOffset: safeGetProperty(spread, 'bleedOffset'),
            slugOffset: safeGetProperty(spread, 'slugOffset')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "spreads");
}

function getMasterSpreadsInfo(doc) {
    return safeIterateCollection(doc.masterSpreads, function(master, index) {
        return {
            index: index,
            id: safeGetProperty(master, 'id'),
            name: safeGetProperty(master, 'name'),
            basedOn: safeGetProperty(master.basedOn, 'name'),
            pages: safeGetLength(master.pages),
            pageItems: safeGetLength(master.pageItems)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "masterSpreads");
}

function getLayersInfo(doc) {
    return safeIterateCollection(doc.layers, function(layer, index) {
        return {
            index: index,
            id: safeGetProperty(layer, 'id'),
            name: safeGetProperty(layer, 'name'),
            visible: safeGetProperty(layer, 'visible', true),
            locked: safeGetProperty(layer, 'locked', false),
            color: safeGetProperty(layer, 'layerColor'),
            pageItems: safeGetLength(layer.pageItems)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "layers");
}

function getStoriesInfo(doc) {
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
            textContainerCount: safeGetLength(story.textContainers)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "stories");
}

function getPageItemsInfo(doc) {
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
            locked: safeGetProperty(item, 'locked', false)
        };
    }, Math.min(ANALYSIS_CONFIG.maxCollectionSample, 100), "pageItems");
    
    return pageItemsInfo;
}

function getComprehensiveImagesInfo(doc) {
    var imagesInfo = {
        direct: [],
        nested: [],
        summary: {
            totalImages: 0,
            linkedImages: 0,
            embeddedImages: 0,
            missingImages: 0,
            modifiedImages: 0
        }
    };
    
    // Direct images
    imagesInfo.direct = safeIterateCollection(doc.images, function(image, index) {
        var imageInfo = {
            index: index,
            id: safeGetProperty(image, 'id'),
            itemLink: safeGetProperty(image, 'itemLink') ? {
                name: safeGetProperty(image.itemLink, 'name'),
                status: safeGetProperty(image.itemLink, 'status') ? image.itemLink.status.toString() : 'unknown',
                filePath: safeGetProperty(image.itemLink, 'filePath')
            } : null,
            bounds: safeGetProperty(image, 'bounds'),
            actualPpi: safeGetProperty(image, 'actualPpi'),
            effectivePpi: safeGetProperty(image, 'effectivePpi'),
            parent: safeGetProperty(image.parent, 'constructor') ? image.parent.constructor.name : 'unknown'
        };
        
        // Update summary
        imagesInfo.summary.totalImages++;
        if (imageInfo.itemLink) {
            imagesInfo.summary.linkedImages++;
            var status = imageInfo.itemLink.status;
            if (status.indexOf('Missing') !== -1) imagesInfo.summary.missingImages++;
            if (status.indexOf('Modified') !== -1) imagesInfo.summary.modifiedImages++;
        } else {
            imagesInfo.summary.embeddedImages++;
        }
        
        return imageInfo;
    }, ANALYSIS_CONFIG.maxCollectionSample, "images");
    
    // Find nested images in graphics and groups
    imagesInfo.nested = findNestedImages(doc);
    
    return imagesInfo;
}

function getComprehensiveGraphicsInfo(doc) {
    return safeIterateCollection(doc.graphics, function(graphic, index) {
        return {
            index: index,
            id: safeGetProperty(graphic, 'id'),
            bounds: safeGetProperty(graphic, 'bounds'),
            images: safeGetLength(graphic.images),
            parent: safeGetProperty(graphic.parent, 'constructor') ? graphic.parent.constructor.name : 'unknown',
            itemLink: safeGetProperty(graphic, 'itemLink') ? {
                name: safeGetProperty(graphic.itemLink, 'name'),
                status: safeGetProperty(graphic.itemLink, 'status') ? graphic.itemLink.status.toString() : 'unknown'
            } : null
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "graphics");
}

function getTextFramesInfo(doc) {
    return safeIterateCollection(doc.textFrames, function(textFrame, index) {
        return {
            index: index,
            id: safeGetProperty(textFrame, 'id'),
            bounds: safeGetProperty(textFrame, 'bounds'),
            overflows: safeGetProperty(textFrame, 'overflows', false),
            parentStory: safeGetProperty(textFrame.parentStory, 'id'),
            layer: safeGetProperty(textFrame.itemLayer, 'name'),
            contents: safeGetProperty(textFrame, 'contents') ? 
                     (textFrame.contents.length > 100 ? textFrame.contents.substring(0, 100) + "..." : textFrame.contents) 
                     : null,
            characters: safeGetLength(textFrame.characters),
            words: safeGetLength(textFrame.words),
            paragraphs: safeGetLength(textFrame.paragraphs),
            lines: safeGetLength(textFrame.lines)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "textFrames");
}

function getStylesInfo(doc) {
    return {
        paragraphStyles: getStylesCollection(doc.paragraphStyles, "paragraphStyles"),
        characterStyles: getStylesCollection(doc.characterStyles, "characterStyles"),
        objectStyles: getStylesCollection(doc.objectStyles, "objectStyles"),
        cellStyles: getStylesCollection(doc.cellStyles, "cellStyles"),
        tableStyles: getStylesCollection(doc.tableStyles, "tableStyles")
    };
}

function getStylesCollection(collection, name) {
    return safeIterateCollection(collection, function(style, index) {
        return {
            index: index,
            id: safeGetProperty(style, 'id'),
            name: safeGetProperty(style, 'name'),
            basedOn: safeGetProperty(style.basedOn, 'name'),
            appliedTo: safeGetProperty(style, 'appliedTo') ? safeGetLength(style.appliedTo) : 0
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, name);
}

function getColorsInfo(doc) {
    return safeIterateCollection(doc.colors, function(color, index) {
        return {
            index: index,
            id: safeGetProperty(color, 'id'),
            name: safeGetProperty(color, 'name'),
            model: safeGetProperty(color, 'model') ? color.model.toString() : 'unknown',
            space: safeGetProperty(color, 'space') ? color.space.toString() : 'unknown',
            colorValue: safeGetProperty(color, 'colorValue')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "colors");
}

function getFontsInfo(doc) {
    return safeIterateCollection(doc.fonts, function(font, index) {
        return {
            index: index,
            id: safeGetProperty(font, 'id'),
            name: safeGetProperty(font, 'name'),
            fontFamily: safeGetProperty(font, 'fontFamily'),
            fontStyleName: safeGetProperty(font, 'fontStyleName'),
            postScriptName: safeGetProperty(font, 'postScriptName'),
            status: safeGetProperty(font, 'status') ? font.status.toString() : 'unknown'
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "fonts");
}

function getLinksInfo(doc) {
    return safeIterateCollection(doc.links, function(link, index) {
        return {
            index: index,
            id: safeGetProperty(link, 'id'),
            name: safeGetProperty(link, 'name'),
            filePath: safeGetProperty(link, 'filePath'),
            status: safeGetProperty(link, 'status') ? link.status.toString() : 'unknown',
            size: safeGetProperty(link, 'size'),
            date: safeGetProperty(link, 'date'),
            linkType: safeGetProperty(link, 'linkType') ? link.linkType.toString() : 'unknown'
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "links");
}

function getPreferencesInfo(doc) {
    var preferences = {};
    
    var prefCategories = [
        'viewPreferences', 'pasteboardPreferences', 'guidePreferences',
        'gridPreferences', 'textPreferences', 'textWrapPreferences'
    ];
    
    for (var i = 0; i < prefCategories.length; i++) {
        var category = prefCategories[i];
        try {
            var categoryPrefs = safeGetProperty(doc, category);
            if (categoryPrefs) {
                preferences[category] = extractObjectProperties(categoryPrefs, category);
            }
        } catch (e) {
            preferences[category] = { error: "Failed to extract: " + e.message };
        }
    }
    
    return preferences;
}

function getMetadataInfo(doc) {
    var metadata = {};
    
    try {
        var metadataPreference = safeGetProperty(doc, 'metadataPreferences');
        if (metadataPreference) {
            metadata = {
                author: safeGetProperty(metadataPreference, 'author'),
                description: safeGetProperty(metadataPreference, 'description'),
                documentTitle: safeGetProperty(metadataPreference, 'documentTitle'),
                keywords: safeGetProperty(metadataPreference, 'keywords'),
                subject: safeGetProperty(metadataPreference, 'subject'),
                creator: safeGetProperty(metadataPreference, 'creator'),
                format: safeGetProperty(metadataPreference, 'format'),
                creationDate: safeGetProperty(metadataPreference, 'creationDate'),
                modificationDate: safeGetProperty(metadataPreference, 'modificationDate')
            };
        }
    } catch (e) {
        metadata.error = "Failed to extract metadata: " + e.message;
    }
    
    return metadata;
}

function getObjectHierarchy(doc) {
    var hierarchy = {
        spreads: [],
        pages: [],
        masterSpreads: [],
        layers: []
    };
    
    try {
        // Build a simplified hierarchy map
        hierarchy.spreads = safeIterateCollection(doc.spreads, function(spread, index) {
            return {
                index: index,
                name: safeGetProperty(spread, 'name'),
                pages: safeGetLength(spread.pages),
                pageItems: safeGetLength(spread.pageItems)
            };
        }, 10, "spreads");
        
        hierarchy.pages = safeIterateCollection(doc.pages, function(page, index) {
            return {
                index: index,
                name: safeGetProperty(page, 'name'),
                parent: safeGetProperty(page.parent, 'name'),
                pageItems: safeGetLength(page.pageItems)
            };
        }, 20, "pages");
        
    } catch (e) {
        hierarchy.error = "Failed to build hierarchy: " + e.message;
    }
    
    return hierarchy;
}

function generateCommonPathsReference(doc) {
    return {
        document: [
            { path: "doc.name", description: "Document name" },
            { path: "doc.saved", description: "Document saved status" },
            { path: "doc.filePath", description: "Document file path" }
        ],
        pages: [
            { path: "doc.pages.length", description: "Number of pages" },
            { path: "doc.pages[n].name", description: "Page name" },
            { path: "doc.pages[n].bounds", description: "Page bounds" }
        ],
        text: [
            { path: "doc.textFrames[n].contents", description: "Text frame contents" },
            { path: "doc.stories[n].length", description: "Story character count" },
            { path: "doc.textFrames[n].overflows", description: "Text overflow status" }
        ],
        images: [
            { path: "doc.images[n].itemLink.name", description: "Linked image name" },
            { path: "doc.images[n].itemLink.status", description: "Link status" },
            { path: "doc.images[n].actualPpi", description: "Image resolution" }
        ]
    };
}

// Helper functions
function extractObjectProperties(obj, objName) {
    var extracted = {};
    if (!obj) return extracted;
    
    var commonProps = ['top', 'left', 'bottom', 'right', 'width', 'height', 
                      'x', 'y', 'name', 'value', 'enabled', 'visible'];
    
    for (var i = 0; i < commonProps.length; i++) {
        var prop = commonProps[i];
        var value = safeGetProperty(obj, prop);
        if (value !== null && value !== undefined) {
            extracted[prop] = value;
        }
    }
    
    return extracted;
}

function generateAccessPatterns(propertyMap) {
    var patterns = [];
    
    for (var propName in propertyMap) {
        var prop = propertyMap[propName];
        
        patterns.push({
            property: propName,
            pattern: "Safe iteration pattern",
            code: [
                "// Safe iteration for " + propName,
                "if (doc." + propName + " && doc." + propName + ".length > 0) {",
                "    for (var i = 0; i < doc." + propName + ".length; i++) {",
                "        try {",
                "            var item = doc." + propName + "[i];",
                "            if (item) {",
                "                // Process item safely",
                "            }",
                "        } catch (e) {",
                "            // Handle individual item errors",
                "        }",
                "    }",
                "}"
            ],
            safetyLevel: "high",
            recommended: true
        });
    }
    
    return patterns;
}

function generateDiscoveryRecommendations(discoveryResults) {
    var recommendations = [];
    
    if (discoveryResults.summary.inaccessibleCollections > 0) {
        recommendations.push({
            priority: "high",
            category: "accessibility",
            title: "Inaccessible Collections Found",
            description: discoveryResults.summary.inaccessibleCollections + " collections could not be accessed safely",
            action: "Use try-catch blocks and alternative access methods"
        });
    }
    
    if (discoveryResults.summary.totalCollectionsFound > 20) {
        recommendations.push({
            priority: "medium",
            category: "performance",
            title: "Large Number of Collections",
            description: "Document has " + discoveryResults.summary.totalCollectionsFound + " collections",
            action: "Consider processing in batches or filtering to essential collections"
        });
    }
    
    return recommendations;
}

function analyzePropertyReliability(brokenTracking) {
    var reliability = {};
    
    // Analyze patterns in broken properties
    for (var category in brokenTracking.brokenByCategory) {
        var categoryItems = brokenTracking.brokenByCategory[category];
        reliability[category] = {
            totalTested: categoryItems.length,
            accessible: 0,
            broken: 0,
            reliability: 0
        };
        
        for (var i = 0; i < categoryItems.length; i++) {
            if (categoryItems[i].accessible) {
                reliability[category].accessible++;
            } else {
                reliability[category].broken++;
            }
        }
        
        if (reliability[category].totalTested > 0) {
            reliability[category].reliability = 
                Math.round((reliability[category].accessible / reliability[category].totalTested) * 100);
        }
    }
    
    return reliability;
}

function generatePropertyRecommendations(brokenTracking) {
    var recommendations = [];
    
    if (brokenTracking.summary.brokenProperties > brokenTracking.summary.totalPropertiesChecked * 0.2) {
        recommendations.push({
            priority: "high",
            category: "reliability",
            title: "High Property Failure Rate",
            description: "More than 20% of properties are inaccessible",
            action: "Review document structure and InDesign version compatibility"
        });
    }
    
    return recommendations;
}

function calculateTextStatistics(textAnalysis) {
    var stats = {
        totalUniqueWords: 0,
        averageWordsPerFrame: 0,
        averageCharactersPerFrame: 0,
        longestTextFrame: null,
        shortestTextFrame: null,
        textDistribution: {
            emptyFrames: 0,
            smallFrames: 0,
            mediumFrames: 0,
            largeFrames: 0
        }
    };
    
    try {
        var maxLength = 0;
        var minLength = Infinity;
        
        for (var i = 0; i < textAnalysis.textFrameDetails.length; i++) {
            var frame = textAnalysis.textFrameDetails[i];
            if (frame.error) continue;
            
            var charCount = frame.textContent.characterCount;
            
            if (charCount > maxLength) {
                maxLength = charCount;
                stats.longestTextFrame = {
                    index: frame.index,
                    characterCount: charCount,
                    preview: frame.textContent.preview
                };
            }
            
            if (charCount < minLength && charCount > 0) {
                minLength = charCount;
                stats.shortestTextFrame = {
                    index: frame.index,
                    characterCount: charCount,
                    preview: frame.textContent.preview
                };
            }
            
            // Categorize frame size
            if (charCount === 0) {
                stats.textDistribution.emptyFrames++;
            } else if (charCount < 100) {
                stats.textDistribution.smallFrames++;
            } else if (charCount < 1000) {
                stats.textDistribution.mediumFrames++;
            } else {
                stats.textDistribution.largeFrames++;
            }
        }
        
        // Calculate averages
        if (textAnalysis.summary.totalTextFrames > 0) {
            stats.averageWordsPerFrame = Math.round(textAnalysis.summary.totalWords / textAnalysis.summary.totalTextFrames * 10) / 10;
            stats.averageCharactersPerFrame = Math.round(textAnalysis.summary.totalCharacters / textAnalysis.summary.totalTextFrames * 10) / 10;
        }
        
    } catch (e) {
        logError("Text statistics calculation failed: " + e.message, 'textStatistics', 'medium');
        stats.error = "Statistics calculation failed: " + e.message;
    }
    
    return stats;
}

function generateTextAccessPaths(doc) {
    return [
        { path: "doc.textFrames[n].contents", description: "Direct text content access" },
        { path: "doc.stories[n].contents", description: "Full story text content" },
        { path: "doc.textFrames[n].paragraphs[n].contents", description: "Individual paragraph content" },
        { path: "doc.textFrames[n].overflows", description: "Text overflow detection" }
    ];
}

function extractTextSamples(doc) {
    var samples = [];
    
    try {
        for (var i = 0; i < Math.min(doc.textFrames.length, 5); i++) {
            var textFrame = doc.textFrames[i];
            var content = safeGetProperty(textFrame, 'contents');
            if (content && content.length > 10) {
                samples.push({
                    frameIndex: i,
                    sample: content.substring(0, 100),
                    fullLength: content.length
                });
            }
        }
    } catch (e) {
        samples.push({ error: "Failed to extract text samples: " + e.message });
    }
    
    return samples;
}

function analyzeTableText(doc) {
    var tableText = [];
    
    try {
        if (doc.tables && doc.tables.length > 0) {
            for (var i = 0; i < Math.min(doc.tables.length, 5); i++) {
                var table = doc.tables[i];
                tableText.push({
                    index: i,
                    rows: safeGetLength(table.rows),
                    columns: safeGetLength(table.columns),
                    cells: safeGetLength(table.cells)
                });
            }
        }
    } catch (e) {
        tableText.push({ error: "Table analysis failed: " + e.message });
    }
    
    return tableText;
}

function findTextInGroups(doc) {
    var textInGroups = [];
    
    try {
        if (doc.groups && doc.groups.length > 0) {
            for (var i = 0; i < Math.min(doc.groups.length, 10); i++) {
                var group = doc.groups[i];
                var textFrames = safeGetLength(group.textFrames);
                if (textFrames > 0) {
                    textInGroups.push({
                        groupIndex: i,
                        textFrames: textFrames,
                        path: "doc.groups[" + i + "].textFrames"
                    });
                }
            }
        }
    } catch (e) {
        textInGroups.push({ error: "Group text analysis failed: " + e.message });
    }
    
    return textInGroups;
}

function findNestedImages(doc) {
    var nestedImages = [];
    
    try {
        // Look for images in graphics
        if (doc.graphics && doc.graphics.length > 0) {
            for (var i = 0; i < Math.min(doc.graphics.length, 20); i++) {
                var graphic = doc.graphics[i];
                var imageCount = safeGetLength(graphic.images);
                if (imageCount > 0) {
                    nestedImages.push({
                        graphicIndex: i,
                        imageCount: imageCount,
                        path: "doc.graphics[" + i + "].images"
                    });
                }
            }
        }
    } catch (e) {
        nestedImages.push({ error: "Nested image search failed: " + e.message });
    }
    
    return nestedImages;
}

// Enhanced comparison function for use by the utility
function compareDocumentReports(report1, report2) {
    var differences = {
        timestamp: new Date().toISOString(),
        summary: {
            hasChanges: false,
            changedSections: []
        },
        changes: {},
        errors: [],
        discoveryInfo: {
            totalCollections: 0,
            newCollections: 0,
            removedCollections: 0,
            textItemsProcessed: 0,
            textItemsChanged: 0,
            accessibleProperties: 0,
            brokenProperties: 0,
            newlyBrokenProperties: 0,
            newlyAccessibleProperties: 0
        }
    };
    
    try {
        // Enhanced section comparison with discovery tracking
        var sections = ['documentInfo', 'documentPreferences', 'pages', 'spreads', 'masterSpreads', 
                       'layers', 'stories', 'pageItems', 'images', 'graphics', 'textFrames', 
                       'textContent', 'styles', 'colors', 'fonts', 'links', 'preferences', 
                       'metadata', 'objectHierarchy', 'autoDiscoveredCollections', 'brokenProperties'];
        
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
                logError("Section comparison failed: " + section + " - " + e.message, 'comparison', 'high');
            }
        }
        
        // Calculate discovery info
        differences.discoveryInfo = calculateDiscoveryInfo(report1, report2);
        
    } catch (e) {
        differences.errors.push("Overall comparison failed: " + e.message);
        logError("Overall comparison failed: " + e.message, 'comparison', 'critical');
    }
    
    return differences;
}

function calculateDiscoveryInfo(report1, report2) {
    var info = {
        totalCollections: 0,
        newCollections: 0,
        removedCollections: 0,
        textItemsProcessed: 0,
        textItemsChanged: 0,
        accessibleProperties: 0,
        brokenProperties: 0,
        newlyBrokenProperties: 0,
        newlyAccessibleProperties: 0
    };
    
    try {
        // Discovery stats from reports
        if (report2.discoveryStats) {
            info.totalCollections = report2.discoveryStats.collectionsDiscovered || 0;
            info.textItemsProcessed = report2.discoveryStats.textItemsProcessed || 0;
        }
        
        // Compare collections between reports
        var collections1 = report1.autoDiscoveredCollections ? report1.autoDiscoveredCollections.discoveredCollections || [] : [];
        var collections2 = report2.autoDiscoveredCollections ? report2.autoDiscoveredCollections.discoveredCollections || [] : [];
        
        var collection1Names = {};
        var collection2Names = {};
        
        for (var i = 0; i < collections1.length; i++) {
            collection1Names[collections1[i].name] = true;
        }
        
        for (var i = 0; i < collections2.length; i++) {
            collection2Names[collections2[i].name] = true;
            
            if (!collection1Names[collections2[i].name]) {
                info.newCollections++;
            }
        }
        
        for (var name in collection1Names) {
            if (!collection2Names[name]) {
                info.removedCollections++;
            }
        }
        
        // Compare broken properties
        var broken1 = report1.brokenProperties ? report1.brokenProperties.summary : null;
        var broken2 = report2.brokenProperties ? report2.brokenProperties.summary : null;
        
        if (broken1 && broken2) {
            info.brokenProperties = broken2.brokenProperties || 0;
            info.accessibleProperties = broken2.totalPropertiesChecked - broken2.brokenProperties;
            
            var diff = broken2.brokenProperties - broken1.brokenProperties;
            if (diff > 0) {
                info.newlyBrokenProperties = diff;
            } else if (diff < 0) {
                info.newlyAccessibleProperties = Math.abs(diff);
            }
        }
        
        // Text analysis changes
        var text1 = report1.textContent ? report1.textContent.summary : null;
        var text2 = report2.textContent ? report2.textContent.summary : null;
        
        if (text1 && text2) {
            info.textItemsChanged = Math.abs((text2.totalCharacters || 0) - (text1.totalCharacters || 0)) > 0 ? 1 : 0;
        }
        
    } catch (e) {
        logError("Discovery info calculation failed: " + e.message, 'comparison', 'medium');
    }
    
    return info;
}

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
            // Enhanced array comparison
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
            // Enhanced object comparison
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
            // Enhanced primitive comparison with special handling for text
            if (section1 !== section2) {
                var changeType = "value_change";
                
                // Special handling for text content changes
                if (sectionName.indexOf('text') !== -1 || sectionName.indexOf('contents') !== -1) {
                    changeType = "text_content_change";
                }
                
                changes.push(createSafeChangeObject({
                    type: changeType,
                    path: sectionName,
                    oldValue: section1,
                    newValue: section2
                }, sectionName));
            }
        }
    } catch (e) {
        logError("compareSection failed for " + sectionName + ": " + e.message, 'comparison', 'medium');
        changes.push(createSafeChangeObject({
            type: "comparison_error",
            path: sectionName,
            error: e.message
        }, sectionName));
    }
    
    return changes;
}

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
    
    // Generate access path and safety notes with comprehensive error handling
    try {
        safeChange.accessPath = generateAccessPath(analysisPath);
        safeChange.safetyNotes = getSafetyNotes(analysisPath);
    } catch (e) {
        logError("Failed to generate access info for " + analysisPath + ": " + e.message, 'accessPath', 'medium');
        
        // Provide fallback access path
        safeChange.accessPath = {
            primary: "// Error: Could not generate access path for " + analysisPath,
            alternatives: ["// Manual access required", "// Check path: " + analysisPath],
            collectionMethod: "// Check manually",
            safetyLevel: "error",
            errorMessage: e.message
        };
        
        safeChange.safetyNotes = [
            "Error generating safety notes: " + e.message,
            "Use comprehensive try-catch pattern",
            "Test access carefully with your specific documents"
        ];
    }
    
    return safeChange;
}

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
        
        var cleanPath = analysisPath.replace(/^\/+|\/+$/g, '').replace(/\s+/g, '');
        var docPath = "doc." + cleanPath;
        accessInfo.primary = docPath;
        accessInfo.collectionMethod = "Direct property access";
        
        // Enhanced pattern matching with comprehensive coverage
        if (cleanPath.indexOf('textContent') !== -1) {
            if (cleanPath.indexOf('textFrameDetails[') !== -1) {
                var frameMatch = safeRegexMatch(cleanPath, /textFrameDetails\[(\d+)\]\.textContent\.(\w+)/);
                if (frameMatch && frameMatch.length >= 3) {
                    var frameIndex = frameMatch[1];
                    accessInfo.primary = "doc.textFrames[" + frameIndex + "].contents";
                    accessInfo.alternatives = [
                        "doc.textFrames.item(" + frameIndex + ").contents",
                        "doc.stories[n].textFrames[m].contents // if threaded"
                    ];
                    accessInfo.collectionMethod = "Length: doc.textFrames.length";
                    accessInfo.safetyLevel = "high";
                }
            } else {
                accessInfo.primary = "doc.textFrames[n].contents";
                accessInfo.alternatives = [
                    "doc.stories[n].contents",
                    "doc.textFrames.item(n).contents"
                ];
                accessInfo.safetyLevel = "high";
            }
        } else if (cleanPath.indexOf('autoDiscoveredCollections') !== -1) {
            accessInfo.primary = "// Auto-discovered collection - check report for actual path";
            accessInfo.alternatives = [
                "// Collection discovered during analysis",
                "// Use report.autoDiscoveredCollections for details"
            ];
            accessInfo.safetyLevel = "medium";
        } else if (cleanPath.indexOf('brokenProperties') !== -1) {
            accessInfo.primary = "// Property may be inaccessible - use try-catch";
            accessInfo.alternatives = [
                "try { var value = " + docPath + "; } catch (e) { /* handle error */ }",
                "// Check brokenProperties report for alternatives"
            ];
            accessInfo.safetyLevel = "low";
        } else if (cleanPath.indexOf('pages[') !== -1) {
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
        }
        // Add more patterns as needed...
        
    } catch (e) {
        logError("generateAccessPath failed completely: " + e.message, 'accessPath', 'high');
        accessInfo.primary = "// Error generating access path: " + e.message;
        accessInfo.errorMessage = "Path generation failed: " + e.message;
        accessInfo.safetyLevel = "error";
    }
    
    return accessInfo;
}

function getSafetyNotes(analysisPath) {
    var notes = [];
    
    try {
        if (!analysisPath || typeof analysisPath !== 'string') {
            notes.push("Invalid path - cannot generate safety notes");
            return notes;
        }
        
        var pathLower = analysisPath.toLowerCase();
        
        // Enhanced safety rules with comprehensive coverage
        var safetyRules = [
            { 
                pattern: 'textcontent', 
                notes: [
                    'Text content may be very large - consider using substring() for previews',
                    'May contain special characters, line breaks, and formatting codes',
                    'Always check if contents property exists before accessing'
                ] 
            },
            { 
                pattern: 'autodiscovered', 
                notes: [
                    'Auto-discovered properties may not exist in all document types',
                    'Use comprehensive try-catch blocks for auto-discovered collections',
                    'Verify collection length before accessing items'
                ] 
            },
            { 
                pattern: 'brokenproperties', 
                notes: [
                    'These properties are known to be problematic or inaccessible',
                    'Always use try-catch when accessing broken properties',
                    'Consider alternative access methods or properties'
                ] 
            }
        ];
        
        // Apply safety rules
        for (var i = 0; i < safetyRules.length; i++) {
            var rule = safetyRules[i];
            if (pathLower.indexOf(rule.pattern) !== -1) {
                for (var j = 0; j < rule.notes.length; j++) {
                    if (notes.indexOf(rule.notes[j]) === -1) {
                        notes.push(rule.notes[j]);
                    }
                }
                break;
            }
        }
        
        // Universal safety patterns
        if (pathLower.indexOf('[') !== -1) {
            notes.push("Array/collection access - always check length first");
            notes.push("Use try-catch for individual item access");
        }
        
        // Ensure we always have basic safety guidance
        if (notes.length === 0) {
            notes.push("Use comprehensive try-catch blocks for property access");
            notes.push("Always validate objects and properties before use");
            notes.push("Test thoroughly with your specific document types");
        }
        
    } catch (e) {
        logError("getSafetyNotes failed: " + e.message, 'safetyNotes', 'medium');
        notes = [
            "Error generating safety notes: " + e.message,
            "Use comprehensive try-catch pattern for all property access"
        ];
    }
    
    return notes;
}

function safeRegexMatch(str, regex) {
    try {
        if (!str || typeof str !== 'string') {
            return null;
        }
        return str.match(regex);
    } catch (e) {
        logError("Regex match failed: " + e.message, 'regex', 'low');
        return null;
    }
}

// Enhanced main analysis function
function analyzeDocument() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return null;
    }
    
    var doc = app.activeDocument;
    var startTime = new Date().getTime();
    
    try {
        // Check if document is saved
        if (!doc.saved && (!doc.filePath || doc.filePath.toString() === "")) {
            var shouldSave = confirm("Document must be saved before analysis. Save now?");
            if (shouldSave) {
                var saveFile = File.saveDialog("Save document for analysis", "*.indd");
                if (saveFile) {
                    doc.save(saveFile);
                } else {
                    alert("Analysis cancelled - document must be saved.");
                    return null;
                }
            } else {
                alert("Analysis cancelled - document must be saved.");
                return null;
            }
        }
        
        var report = createDocumentReport(doc);
        
        if (!report) {
            alert("Failed to create document report. Check document and try again.");
            return null;
        }
        
        // Save comprehensive report
        var docName = doc.name.replace(/\.[^\.]+$/, "");
        var docPath = doc.filePath;
        var reportFile = File(docPath + "/" + docName + "_analysis.json");
        var jsonString = JSON.stringify(report, null, 2);
        
        reportFile.open("w");
        reportFile.write(jsonString);
        reportFile.close();
        
        var duration = (new Date().getTime() - startTime) / 1000;
        
        // Create summary of key findings
        var summary = "Enhanced Document Analysis Complete! (" + duration + "s)\n\n";
        summary += "✓ Collections discovered: " + (report.discoveryStats.collectionsDiscovered || 0) + "\n";
        summary += "✓ Text items processed: " + (report.discoveryStats.textItemsProcessed || 0) + "\n";
        summary += "✓ Properties checked: " + (report.brokenProperties.summary ? report.brokenProperties.summary.totalPropertiesChecked : 0) + "\n";
        summary += "✓ Broken properties found: " + (report.discoveryStats.brokenPropertiesFound || 0) + "\n";
        summary += "✓ Errors handled: " + (report.discoveryStats.errorsEncountered || 0) + "\n\n";
        summary += "Report saved as: " + reportFile.name + "\n\n";
        summary += "Next: Run the Comparison Utility to track changes!";
        
        alert(summary);
        return report;
        
    } catch (error) {
        var errorMsg = "Analysis failed: " + error.message;
        if (error.line) errorMsg += "\nLine: " + error.line;
        
        // Save error report for debugging
        try {
            var errorFile = File(doc.filePath + "/" + doc.name.replace(/\.[^\.]+$/, "") + "_error.txt");
            errorFile.open("w");
            errorFile.write("Analysis Error Report\n");
            errorFile.write("Generated: " + new Date().toString() + "\n\n");
            errorFile.write("Error: " + error.message + "\n");
            errorFile.write("Line: " + (error.line || "unknown") + "\n");
            errorFile.write("Stack: " + (error.stack || "not available") + "\n");
            errorFile.close();
            
            errorMsg += "\n\nError details saved to: " + errorFile.name;
        } catch (e) {
            // Couldn't save error file
        }
        
        alert(errorMsg);
        return null;
    }
}

// Additional utility functions for enhanced functionality
function testContentProperties(doc, brokenTracking, testSuites) {
    // Test text frame properties if available
    if (doc.textFrames && doc.textFrames.length > 0) {
        try {
            brokenTracking.testResults.textFrame = runPropertyTests(doc.textFrames[0], testSuites.textFrame, 'doc.textFrames[0]', brokenTracking);
        } catch (e) {
            brokenTracking.brokenByCategory.contentLevel.push({
                property: "textFrames[0]",
                path: "doc.textFrames[0]",
                error: "Failed to access first text frame: " + e.message,
                accessible: false,
                critical: true
            });
        }
    }
    
    // Test image properties if available
    if (doc.images && doc.images.length > 0) {
        try {
            var testSuite = [
                { prop: 'itemLink', expected: 'object', nullable: true, critical: true },
                { prop: 'actualPpi', expected: 'object', nullable: true },
                { prop: 'bounds', expected: 'object', critical: true },
                { prop: 'parent', expected: 'object', nullable: true }
            ];
            brokenTracking.testResults.image = runPropertyTests(doc.images[0], testSuite, 'doc.images[0]', brokenTracking);
        } catch (e) {
            brokenTracking.brokenByCategory.contentLevel.push({
                property: "images[0]",
                path: "doc.images[0]",
                error: "Failed to access first image: " + e.message,
                accessible: false,
                critical: true
            });
        }
    }
}

function testStyleProperties(doc, brokenTracking, testSuites) {
    // Test paragraph styles if available
    if (doc.paragraphStyles && doc.paragraphStyles.length > 0) {
        try {
            var styleTestSuite = [
                { prop: 'name', expected: 'string', critical: true },
                { prop: 'basedOn', expected: 'object', nullable: true },
                { prop: 'appliedTo', expected: 'object', nullable: true }
            ];
            brokenTracking.testResults.style = runPropertyTests(doc.paragraphStyles[0], styleTestSuite, 'doc.paragraphStyles[0]', brokenTracking);
        } catch (e) {
            brokenTracking.brokenByCategory.styleLevel.push({
                property: "paragraphStyles[0]",
                path: "doc.paragraphStyles[0]",
                error: "Failed to access first paragraph style: " + e.message,
                accessible: false,
                critical: true
            });
        }
    }
}

function testLinkProperties(doc, brokenTracking, testSuites) {
    // Test links if available
    if (doc.links && doc.links.length > 0) {
        try {
            var linkTestSuite = [
                { prop: 'name', expected: 'string', critical: true },
                { prop: 'filePath', expected: 'string', nullable: true },
                { prop: 'status', expected: 'object', nullable: true },
                { prop: 'size', expected: 'number', nullable: true }
            ];
            brokenTracking.testResults.link = runPropertyTests(doc.links[0], linkTestSuite, 'doc.links[0]', brokenTracking);
        } catch (e) {
            brokenTracking.brokenByCategory.linkLevel.push({
                property: "links[0]",
                path: "doc.links[0]",
                error: "Failed to access first link: " + e.message,
                accessible: false,
                critical: true
            });
        }
    }
}

function testCollectionProperties(doc, brokenTracking) {
    var collectionTests = [
        { name: 'pages', path: 'doc.pages' },
        { name: 'stories', path: 'doc.stories' },
        { name: 'textFrames', path: 'doc.textFrames' },
        { name: 'images', path: 'doc.images' },
        { name: 'layers', path: 'doc.layers' },
        { name: 'paragraphStyles', path: 'doc.paragraphStyles' },
        { name: 'colors', path: 'doc.colors' },
        { name: 'fonts', path: 'doc.fonts' },
        { name: 'links', path: 'doc.links' }
    ];
    
    for (var i = 0; i < collectionTests.length; i++) {
        var test = collectionTests[i];
        
        try {
            var collection = doc[test.name];
            var collectionResult = {
                collection: test.name,
                path: test.path,
                accessible: true,
                length: safeGetLength(collection),
                indexAccessible: false,
                itemAccessible: false,
                lengthAccessible: false
            };
            
            // Test length access
            try {
                var length = collection.length;
                collectionResult.lengthAccessible = true;
            } catch (e) {
                collectionResult.lengthError = e.message;
            }
            
            // Test index access (if collection has items)
            if (collectionResult.length > 0) {
                try {
                    var firstItem = collection[0];
                    collectionResult.indexAccessible = true;
                } catch (e) {
                    collectionResult.indexError = e.message;
                }
                
                // Test item() method access
                try {
                    var itemMethod = collection.item(0);
                    collectionResult.itemAccessible = true;
                } catch (e) {
                    collectionResult.itemError = e.message;
                }
            }
            
            brokenTracking.brokenByCategory.collectionLevel.push(collectionResult);
            
        } catch (e) {
            brokenTracking.brokenByCategory.collectionLevel.push({
                collection: test.name,
                path: test.path,
                accessible: false,
                error: e.message
            });
        }
    }
}

// Missing helper functions that are called by the main analysis
function generateTextAccessPaths(doc) {
    return [
        { path: "doc.textFrames[n].contents", description: "Direct text content access" },
        { path: "doc.stories[n].contents", description: "Full story text content" },
        { path: "doc.textFrames[n].paragraphs[n].contents", description: "Individual paragraph content" },
        { path: "doc.textFrames[n].overflows", description: "Text overflow detection" }
    ];
}

function extractTextSamples(doc) {
    var samples = [];
    
    try {
        for (var i = 0; i < Math.min(doc.textFrames.length, 5); i++) {
            var textFrame = doc.textFrames[i];
            var content = safeGetProperty(textFrame, 'contents');
            if (content && content.length > 10) {
                samples.push({
                    frameIndex: i,
                    sample: content.substring(0, 100),
                    fullLength: content.length
                });
            }
        }
    } catch (e) {
        samples.push({ error: "Failed to extract text samples: " + e.message });
    }
    
    return samples;
}

function analyzeTableText(doc) {
    var tableText = [];
    
    try {
        if (doc.tables && doc.tables.length > 0) {
            for (var i = 0; i < Math.min(doc.tables.length, 5); i++) {
                var table = doc.tables[i];
                tableText.push({
                    index: i,
                    rows: safeGetLength(table.rows),
                    columns: safeGetLength(table.columns),
                    cells: safeGetLength(table.cells)
                });
            }
        }
    } catch (e) {
        tableText.push({ error: "Table analysis failed: " + e.message });
    }
    
    return tableText;
}

function findTextInGroups(doc) {
    var textInGroups = [];
    
    try {
        if (doc.groups && doc.groups.length > 0) {
            for (var i = 0; i < Math.min(doc.groups.length, 10); i++) {
                var group = doc.groups[i];
                var textFrames = safeGetLength(group.textFrames);
                if (textFrames > 0) {
                    textInGroups.push({
                        groupIndex: i,
                        textFrames: textFrames,
                        path: "doc.groups[" + i + "].textFrames"
                    });
                }
            }
        }
    } catch (e) {
        textInGroups.push({ error: "Group text analysis failed: " + e.message });
    }
    
    return textInGroups;
}

function findNestedImages(doc) {
    var nestedImages = [];
    
    try {
        // Look for images in graphics
        if (doc.graphics && doc.graphics.length > 0) {
            for (var i = 0; i < Math.min(doc.graphics.length, 20); i++) {
                var graphic = doc.graphics[i];
                var imageCount = safeGetLength(graphic.images);
                if (imageCount > 0) {
                    nestedImages.push({
                        graphicIndex: i,
                        imageCount: imageCount,
                        path: "doc.graphics[" + i + "].images"
                    });
                }
            }
        }
    } catch (e) {
        nestedImages.push({ error: "Nested image search failed: " + e.message });
    }
    
    return nestedImages;
}

// Helper function for string repetition - Fixed: 'char' is a reserved word in ExtendScript
function repeatString(charToRepeat, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += charToRepeat;
    }
    return result;
}

// Expose key functions for utility script
this.safeGetProperty = safeGetProperty;
this.safeGetNestedProperty = safeGetNestedProperty;
this.createDocumentReport = createDocumentReport;
this.compareDocumentReports = compareDocumentReports;
this.ANALYSIS_CONFIG = ANALYSIS_CONFIG;

// Enhanced script completion message
try {
    alert("Enhanced InDesign Document Inspector v2.1 loaded successfully!\n\n" +
          "NEW FEATURES:\n" +
          "✓ Comprehensive text content capture and analysis\n" +
          "✓ Auto-discovery of collections and properties\n" +
          "✓ Enhanced broken property detection and tracking\n" +
          "✓ Comprehensive error handling and recovery\n" +
          "✓ Advanced access path generation with safety guidance\n" +
          "✓ Performance optimizations and timeout protection\n\n" +
          "READY FOR USE:\n" +
          "• Run analyzeDocument() to analyze current document\n" +
          "• Use with Enhanced Comparison Utility for change tracking\n" +
          "• All functions available for advanced users\n\n" +
          "The inspector is now bulletproof and ready for any document!");
          
} catch (error) {
    // Even the alert failed - try a different approach
    try {
        var dialog = app.dialogs.add({name: "Enhanced Inspector Loaded"});
        dialog.show();
        dialog.destroy();
    } catch (e) {
        // Script loaded but can't show completion message
    }
}