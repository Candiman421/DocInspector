// ============================================================================
// CHUNK 2.3: COMPREHENSIVE ANALYSIS - COMPLETE FEATURE SET WITH SAFETY
// ES3 COMPATIBLE VERSION - FULL ANALYSIS WITH RISKY COLLECTION PRE-TESTING
// ============================================================================

// ============================================================================
// COMPREHENSIVE MODE: FULL ANALYSIS WITH ENHANCED SAFETY CONTROLS
// ============================================================================

function createComprehensiveDocumentReport(doc) {
    enhancedStatusLog("COMPREHENSIVE", "Starting comprehensive analysis", 0, 20, 
        "Full feature analysis with risky collection pre-testing");
    
    // Start with standard report as foundation - TRUE PROGRESSIVE SAFETY
    enhancedStatusLog("COMPREHENSIVE", "Building on standard analysis", 1, 20, "Getting standard report foundation");
    var report = createStandardDocumentReport(doc);
    
    // If standard failed or had significant issues, don't proceed to comprehensive
    if (report.error || report.fallbackToMinimal || report.standardModeSkipped || hasSignificantIssues(report)) {
        enhancedStatusLog("COMPREHENSIVE", "Standard analysis issues", 2, 20, "Cannot proceed to comprehensive mode safely");
        report.comprehensiveModeSkipped = true;
        report.skipReason = "Standard analysis had issues - staying in standard mode for safety";
        return report;
    }
    
    // Upgrade to comprehensive mode
    report.analysisVersion = "2.1-estk-comprehensive";
    report.mode = "COMPREHENSIVE_FULL_ANALYSIS";
    report.safetyLevel = "comprehensive_with_pre_testing";
    
    var comprehensiveStartTime = new Date().getTime();
    var comprehensiveTimeout = ENHANCED_ANALYSIS_CONFIG.modes.comprehensive.timeout;
    
    try {
        // Pre-test ALL collections including risky ones
        enhancedStatusLog("COMPREHENSIVE", "Pre-testing all collections", 3, 20, "Including risky collections with safety");
        report.comprehensivePreTestResults = preTestRiskyCollections(doc);
        
        // Enhanced pages analysis - build on existing page info
        enhancedStatusLog("COMPREHENSIVE", "Enhancing pages analysis", 5, 20, "Detailed page properties");
        report.pages = emergencyAnalyzeSection("comprehensivePages", function() {
            return getComprehensivePagesInfo(doc, report.comprehensivePreTestResults);
        }, comprehensiveTimeout / 6, 6, 20);
        
        // Enhanced layers analysis - build on existing layer info
        enhancedStatusLog("COMPREHENSIVE", "Enhancing layers analysis", 7, 20, "Layer properties and structure");
        report.layers = emergencyAnalyzeSection("comprehensiveLayers", function() {
            return getComprehensiveLayersInfo(doc, report.comprehensivePreTestResults);
        }, comprehensiveTimeout / 6, 8, 20);
        
        // Styles analysis - safe collections
        enhancedStatusLog("COMPREHENSIVE", "Adding styles analysis", 9, 20, "Paragraph and character styles");
        report.styles = emergencyAnalyzeSection("styles", function() {
            return getStylesInfo(doc, report.comprehensivePreTestResults);
        }, comprehensiveTimeout / 6, 10, 20);
        
        // Colors analysis - safe collections
        enhancedStatusLog("COMPREHENSIVE", "Adding colors analysis", 11, 20, "Color definitions and swatches");
        report.colors = emergencyAnalyzeSection("colors", function() {
            return getColorsInfo(doc, report.comprehensivePreTestResults);
        }, comprehensiveTimeout / 6, 12, 20);
        
        // Fonts analysis - moderate risk
        enhancedStatusLog("COMPREHENSIVE", "Adding fonts analysis", 13, 20, "Font usage and availability");
        report.fonts = emergencyAnalyzeSection("fonts", function() {
            return getFontsInfo(doc, report.comprehensivePreTestResults);
        }, comprehensiveTimeout / 6, 14, 20);
        
        // Images analysis - RISKY - only if pre-testing passed
        if (report.comprehensivePreTestResults && arrayIndexOf(report.comprehensivePreTestResults.riskyButSafe, 'images') !== -1) {
            enhancedStatusLog("COMPREHENSIVE", "Adding images analysis", 15, 20, "Pre-tested safe image analysis");
            report.images = emergencyAnalyzeSection("images", function() {
                return getImagesInfo(doc, report.comprehensivePreTestResults);
            }, comprehensiveTimeout / 8, 16, 20); // Shorter timeout for risky section
        } else {
            enhancedStatusLog("COMPREHENSIVE", "Skipping images analysis", 15, 20, "Images collection failed pre-testing");
            report.images = {
                skipped: true,
                reason: "Images collection failed safety pre-testing",
                recommendation: "Images collection may cause hanging - skipped for safety"
            };
        }
        
        // Links analysis - RISKY - only if pre-testing passed  
        if (report.comprehensivePreTestResults && arrayIndexOf(report.comprehensivePreTestResults.riskyButSafe, 'links') !== -1) {
            enhancedStatusLog("COMPREHENSIVE", "Adding links analysis", 17, 20, "Pre-tested safe links analysis");
            report.links = emergencyAnalyzeSection("links", function() {
                return getLinksInfo(doc, report.comprehensivePreTestResults);
            }, comprehensiveTimeout / 8, 18, 20); // Shorter timeout for risky section
        } else {
            enhancedStatusLog("COMPREHENSIVE", "Skipping links analysis", 17, 20, "Links collection failed pre-testing");
            report.links = {
                skipped: true,
                reason: "Links collection failed safety pre-testing",
                recommendation: "Links collection may cause hanging - skipped for safety"
            };
        }
        
        // PageItems analysis - RISKY - only if pre-testing passed
        if (report.comprehensivePreTestResults && arrayIndexOf(report.comprehensivePreTestResults.riskyButSafe, 'pageItems') !== -1) {
            enhancedStatusLog("COMPREHENSIVE", "Adding pageItems analysis", 19, 20, "Pre-tested safe pageItems analysis");
            report.pageItems = emergencyAnalyzeSection("pageItems", function() {
                return getPageItemsInfo(doc, report.comprehensivePreTestResults);
            }, comprehensiveTimeout / 8, 19, 20); // Shorter timeout for risky section
        } else {
            enhancedStatusLog("COMPREHENSIVE", "Skipping pageItems analysis", 19, 20, "PageItems collection failed pre-testing");
            report.pageItems = {
                skipped: true,
                reason: "PageItems collection failed safety pre-testing",
                recommendation: "PageItems collection may be slow - skipped for safety"
            };
        }
        
        var comprehensiveDuration = new Date().getTime() - comprehensiveStartTime;
        report.comprehensiveProcessingTime = comprehensiveDuration;
        
        enhancedStatusLog("COMPREHENSIVE", "Comprehensive analysis completed", 20, 20, 
            "Full analysis completed in " + comprehensiveDuration + "ms");
        
        // Check processing time
        if (comprehensiveDuration > comprehensiveTimeout) {
            report.warnings = report.warnings || [];
            report.warnings.push("Comprehensive analysis exceeded timeout (" + comprehensiveDuration + "ms) - document is complex");
        }
        
        // Add comprehensive statistics
        report.discoveryStats = generateComprehensiveStats(report);
        
    } catch (exc) {
        enhancedStatusLog("COMPREHENSIVE", "Comprehensive analysis failed", 20, 20, "Error: " + exc.message);
        report.errors = report.errors || [];
        report.errors.push("Comprehensive analysis failed: " + exc.message);
        report.partialResults = true;
        report.comprehensiveProcessingTime = new Date().getTime() - comprehensiveStartTime;
    }
    
    return report;
}

// Check if standard report has significant issues that prevent comprehensive mode
function hasSignificantIssues(standardReport) {
    if (!standardReport) return true;
    
    // Check for timeouts or emergency bailouts in key sections
    var keySections = ['textFrames', 'stories', 'textContent'];
    var bailoutCount = 0;
    
    for (var i = 0; i < keySections.length; i++) {
        var section = standardReport[keySections[i]];
        if (section && (section.emergencyBailout || section.skipped)) {
            bailoutCount++;
        }
    }
    
    // If too many sections had issues, don't proceed to comprehensive
    return bailoutCount >= 2;
}

// Pre-test risky collections with enhanced safety protocols
function preTestRiskyCollections(doc) {
    var testResults = {
        tested: [],
        safe: [],
        unsafe: [],
        riskyButSafe: [], // Risky collections that passed testing
        dangerous: [],    // Collections that are too dangerous
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    // Get all collections for comprehensive mode
    var comprehensiveCollections = createModeFilteredCollectionList("comprehensive");
    
    // Separate into safety categories
    var safeCollections = [];
    var moderateCollections = [];
    var riskyCollections = [];
    var dangerousCollections = [];
    
    for (var i = 0; i < comprehensiveCollections.length; i++) {
        var collName = comprehensiveCollections[i];
        var riskLevel = ENHANCED_ANALYSIS_CONFIG.collectionSafety[collName];
        
        if (riskLevel === "safe") {
            safeCollections.push(collName);
        } else if (riskLevel === "moderate") {
            moderateCollections.push(collName);
        } else if (riskLevel === "risky") {
            riskyCollections.push(collName);
        } else if (riskLevel === "dangerous") {
            dangerousCollections.push(collName);
        }
    }
    
    enhancedStatusLog("COMPREHENSIVE_PRETEST", "Testing comprehensive collections", 0, comprehensiveCollections.length, 
        "Safe: " + safeCollections.length + ", Moderate: " + moderateCollections.length + 
        ", Risky: " + riskyCollections.length + ", Dangerous: " + dangerousCollections.length);
    
    var testIndex = 0;
    
    // Test safe collections (should all pass)
    for (var i = 0; i < safeCollections.length; i++) {
        var collName = safeCollections[i];
        testIndex++;
        
        var testResult = testCollectionSafety(doc, collName, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 4);
        
        testResults.tested.push({ name: collName, result: testResult, category: "safe" });
        
        if (testResult.safety === "safe" || testResult.safety === "moderate") {
            testResults.safe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " confirmed safe", testIndex, comprehensiveCollections.length, 
                "Category: safe, Result: " + testResult.safety);
        } else {
            testResults.unsafe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " unexpected unsafe", testIndex, comprehensiveCollections.length, 
                "Expected safe but got: " + testResult.safety);
        }
    }
    
    // Test moderate collections
    for (var i = 0; i < moderateCollections.length; i++) {
        var collName = moderateCollections[i];
        testIndex++;
        
        var testResult = testCollectionSafety(doc, collName, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 3);
        
        testResults.tested.push({ name: collName, result: testResult, category: "moderate" });
        
        if (testResult.safety === "safe" || testResult.safety === "moderate") {
            testResults.safe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " safe", testIndex, comprehensiveCollections.length, 
                "Category: moderate, Result: " + testResult.safety);
        } else {
            testResults.unsafe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " unsafe", testIndex, comprehensiveCollections.length, 
                "Moderate collection failed: " + testResult.safety);
        }
    }
    
    // Test risky collections with enhanced caution
    for (var i = 0; i < riskyCollections.length; i++) {
        var collName = riskyCollections[i];
        testIndex++;
        
        enhancedStatusLog("COMPREHENSIVE_PRETEST", "Testing RISKY collection: " + collName, testIndex, comprehensiveCollections.length, 
            "Enhanced safety testing");
        
        var testResult = testCollectionSafety(doc, collName, 200); // Very short timeout for risky collections
        
        testResults.tested.push({ name: collName, result: testResult, category: "risky" });
        
        if (testResult.safety === "safe" || testResult.safety === "moderate") {
            testResults.riskyButSafe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " risky but safe", testIndex, comprehensiveCollections.length, 
                "Risky collection passed testing: " + testResult.safety);
        } else {
            testResults.unsafe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " too risky", testIndex, comprehensiveCollections.length, 
                "Risky collection failed: " + testResult.safety + " - " + testResult.error);
        }
    }
    
    // Test dangerous collections with extreme caution
    for (var i = 0; i < dangerousCollections.length; i++) {
        var collName = dangerousCollections[i];
        testIndex++;
        
        enhancedStatusLog("COMPREHENSIVE_PRETEST", "Testing DANGEROUS collection: " + collName, testIndex, comprehensiveCollections.length, 
            "Extreme caution testing");
        
        var testResult = testCollectionSafety(doc, collName, 100); // Ultra-short timeout for dangerous collections
        
        testResults.tested.push({ name: collName, result: testResult, category: "dangerous" });
        
        if (testResult.safety === "safe") {
            testResults.riskyButSafe.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " dangerous but safe", testIndex, comprehensiveCollections.length, 
                "Dangerous collection unexpectedly safe: " + testResult.safety);
        } else {
            testResults.dangerous.push(collName);
            enhancedStatusLog("COMPREHENSIVE_PRETEST", collName + " confirmed dangerous", testIndex, comprehensiveCollections.length, 
                "Dangerous collection failed as expected: " + testResult.safety);
        }
    }
    
    testResults.processingTime = new Date().getTime() - startTime;
    
    enhancedStatusLog("COMPREHENSIVE_PRETEST", "Comprehensive pre-testing completed", comprehensiveCollections.length, comprehensiveCollections.length, 
        "Safe: " + testResults.safe.length + 
        ", Risky-but-safe: " + testResults.riskyButSafe.length + 
        ", Unsafe: " + testResults.unsafe.length + 
        ", Dangerous: " + testResults.dangerous.length);
    
    return testResults;
}

// ============================================================================
// COMPREHENSIVE ANALYSIS FUNCTIONS - FULL FEATURE SET WITH SAFETY
// ============================================================================

function getComprehensivePagesInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_PAGES", "Comprehensive pages analysis", 0, 5, "Full page analysis with safety");
    
    // Check if pages collection is safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'pages') === -1) {
        return {
            error: "Pages collection not safe for comprehensive analysis",
            recommendation: "Use standard mode for this document"
        };
    }
    
    var pages = progressiveCollectionAccess(doc, 'pages', 'comprehensive');
    if (!pages) {
        return {
            error: "Progressive collection access denied pages for comprehensive mode"
        };
    }
    
    var pageCount = emergencyGetLength(pages, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess);
    
    if (pageCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No pages found"
        };
    }
    
    // Use enhanced iteration with progress reporting
    return enhancedSafeIterateCollection(pages, function(page, itemIndex) {
        if (itemIndex % 3 === 0) { // Progress every 3 pages
            enhancedStatusLog("COMP_PAGES", "Processing pages", itemIndex + 1, pageCount, 
                "Page " + (itemIndex + 1) + " of " + pageCount);
        }
        
        return analyzePageComprehensively(page, itemIndex);
    }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "pages");
}

function analyzePageComprehensively(page, pageIndex) {
    var analysis = {
        index: pageIndex,
        mode: "comprehensive",
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess;
    
    try {
        // Basic page properties with emergency access
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(page, 'id'),
                name: emergencyGetProperty(page, 'name'),
                bounds: emergencyGetProperty(page, 'bounds'),
                side: emergencyGetProperty(page, 'side'),
                documentOffset: emergencyGetProperty(page, 'documentOffset')
            };
        }, timeout / 2);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.name = basicProps.result.name;
            analysis.bounds = basicProps.result.bounds;
            analysis.side = basicProps.result.side;
            analysis.documentOffset = basicProps.result.documentOffset;
        }
        
        // Advanced page properties
        var advancedProps = emergencyBailoutHandler(function() {
            return {
                appliedMaster: safeGetProperty(safeGetProperty(page, 'appliedMaster'), 'name'),
                pageItems: safeGetLength(safeGetProperty(page, 'pageItems')),
                margins: extractMarginInfo(page),
                orientation: emergencyGetProperty(page, 'orientation')
            };
        }, timeout / 2);
        
        if (!advancedProps.bailout) {
            analysis.appliedMaster = advancedProps.result.appliedMaster;
            analysis.pageItems = advancedProps.result.pageItems;
            analysis.margins = advancedProps.result.margins;
            analysis.orientation = advancedProps.result.orientation;
        }
        
        // Item counts with safety
        var itemCounts = emergencyBailoutHandler(function() {
            return {
                textFrameCount: safeGetLength(safeGetProperty(page, 'textFrames')),
                imageCount: safeGetLength(safeGetProperty(page, 'images'))
            };
        }, timeout / 2);
        
        if (!itemCounts.bailout) {
            analysis.textFrameCount = itemCounts.result.textFrameCount;
            analysis.imageCount = itemCounts.result.imageCount;
        }
        
        analysis.analysisMode = "comprehensive";
        analysis.processingTime = new Date().getTime() - startTime;
        
    } catch (exc) {
        analysis.error = "Comprehensive page analysis failed: " + exc.message;
        analysis.processingTime = new Date().getTime() - startTime;
    }
    
    return analysis;
}

function getComprehensiveLayersInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_LAYERS", "Comprehensive layers analysis", 0, 3, "Full layer analysis with safety");
    
    // Check if layers collection is safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'layers') === -1) {
        return {
            error: "Layers collection not safe for comprehensive analysis",
            recommendation: "Use standard mode for this document"
        };
    }
    
    var layers = progressiveCollectionAccess(doc, 'layers', 'comprehensive');
    if (!layers) {
        return {
            error: "Progressive collection access denied layers for comprehensive mode"
        };
    }
    
    var layerCount = emergencyGetLength(layers, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess);
    
    if (layerCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No layers found"
        };
    }
    
    return enhancedSafeIterateCollection(layers, function(layer, itemIndex) {
        return analyzeLayerComprehensively(layer, itemIndex);
    }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "layers");
}

function analyzeLayerComprehensively(layer, layerIndex) {
    var analysis = {
        index: layerIndex,
        mode: "comprehensive"
    };
    
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess;
    
    try {
        // Basic layer properties
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(layer, 'id'),
                name: emergencyGetProperty(layer, 'name'),
                visible: emergencyGetProperty(layer, 'visible', true),
                locked: emergencyGetProperty(layer, 'locked', false),
                color: emergencyGetProperty(layer, 'layerColor')
            };
        }, timeout / 2);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.name = basicProps.result.name;
            analysis.visible = basicProps.result.visible;
            analysis.locked = basicProps.result.locked;
            analysis.color = basicProps.result.color;
        }
        
        // Advanced layer properties
        var advancedProps = emergencyBailoutHandler(function() {
            return {
                pageItems: safeGetLength(safeGetProperty(layer, 'pageItems')),
                printable: emergencyGetProperty(layer, 'printable'),
                showGuides: emergencyGetProperty(layer, 'showGuides'),
                textFrameCount: safeGetLength(safeGetProperty(layer, 'textFrames')),
                imageCount: safeGetLength(safeGetProperty(layer, 'images'))
            };
        }, timeout / 2);
        
        if (!advancedProps.bailout) {
            analysis.pageItems = advancedProps.result.pageItems;
            analysis.printable = advancedProps.result.printable;
            analysis.showGuides = advancedProps.result.showGuides;
            analysis.layerOrder = layerIndex;
            analysis.textFrameCount = advancedProps.result.textFrameCount;
            analysis.imageCount = advancedProps.result.imageCount;
        }
        
        analysis.analysisMode = "comprehensive";
        
    } catch (exc) {
        analysis.error = "Comprehensive layer analysis failed: " + exc.message;
    }
    
    return analysis;
}

function getStylesInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_STYLES", "Analyzing styles", 0, 4, "Paragraph and character styles analysis");
    
    var stylesInfo = {
        analysisMode: "comprehensive",
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Paragraph styles analysis
        enhancedStatusLog("COMP_STYLES", "Analyzing paragraph styles", 1, 4, "Paragraph style properties");
        if (preTestResults && arrayIndexOf(preTestResults.safe, 'paragraphStyles') !== -1) {
            var paragraphStyles = progressiveCollectionAccess(doc, 'paragraphStyles', 'comprehensive');
            if (paragraphStyles) {
                stylesInfo.paragraphStyles = enhancedSafeIterateCollection(paragraphStyles, function(style, itemIndex) {
                    return analyzeStyleComprehensively(style, itemIndex, "paragraph");
                }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "paragraphStyles");
            } else {
                stylesInfo.paragraphStyles = { error: "Progressive access denied" };
            }
        } else {
            stylesInfo.paragraphStyles = { skipped: true, reason: "ParagraphStyles not available or safe" };
        }
        
        // Character styles analysis
        enhancedStatusLog("COMP_STYLES", "Analyzing character styles", 3, 4, "Character style properties");
        if (preTestResults && arrayIndexOf(preTestResults.safe, 'characterStyles') !== -1) {
            var characterStyles = progressiveCollectionAccess(doc, 'characterStyles', 'comprehensive');
            if (characterStyles) {
                stylesInfo.characterStyles = enhancedSafeIterateCollection(characterStyles, function(style, itemIndex) {
                    return analyzeStyleComprehensively(style, itemIndex, "character");
                }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "characterStyles");
            } else {
                stylesInfo.characterStyles = { error: "Progressive access denied" };
            }
        } else {
            stylesInfo.characterStyles = { skipped: true, reason: "CharacterStyles not available or safe" };
        }
        
        stylesInfo.processingTime = new Date().getTime() - startTime;
        enhancedStatusLog("COMP_STYLES", "Styles analysis completed", 4, 4, 
            "Completed in " + stylesInfo.processingTime + "ms");
        
    } catch (exc) {
        stylesInfo.error = "Styles analysis failed: " + exc.message;
        stylesInfo.processingTime = new Date().getTime() - startTime;
    }
    
    return stylesInfo;
}

function analyzeStyleComprehensively(style, styleIndex, styleType) {
    var analysis = {
        index: styleIndex,
        type: styleType,
        mode: "comprehensive"
    };
    
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess;
    
    try {
        // Basic style properties
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(style, 'id'),
                name: emergencyGetProperty(style, 'name'),
                basedOn: safeGetProperty(safeGetProperty(style, 'basedOn'), 'name')
            };
        }, timeout / 3);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.name = basicProps.result.name;
            analysis.basedOn = basicProps.result.basedOn;
        }
        
        // Font and formatting properties
        var formatProps = emergencyBailoutHandler(function() {
            return {
                fontFamily: safeGetProperty(safeGetProperty(style, 'appliedFont'), 'fontFamily'),
                fontSize: emergencyGetProperty(style, 'pointSize'),
                color: safeGetProperty(safeGetProperty(style, 'fillColor'), 'name')
            };
        }, timeout / 3);
        
        if (!formatProps.bailout) {
            analysis.fontFamily = formatProps.result.fontFamily;
            analysis.fontSize = formatProps.result.fontSize;
            analysis.color = formatProps.result.color;
        }
        
        // Additional properties for paragraph styles
        if (styleType === "paragraph") {
            var paraProps = emergencyBailoutHandler(function() {
                return {
                    leading: emergencyGetProperty(style, 'leading'),
                    spaceAfter: emergencyGetProperty(style, 'spaceAfter'),
                    spaceBefore: emergencyGetProperty(style, 'spaceBefore')
                };
            }, timeout / 3);
            
            if (!paraProps.bailout) {
                analysis.leading = paraProps.result.leading;
                analysis.spaceAfter = paraProps.result.spaceAfter;
                analysis.spaceBefore = paraProps.result.spaceBefore;
            }
        } else if (styleType === "character") {
            var charProps = emergencyBailoutHandler(function() {
                return {
                    fontStyle: emergencyGetProperty(style, 'fontStyle')
                };
            }, timeout / 3);
            
            if (!charProps.bailout) {
                analysis.fontStyle = charProps.result.fontStyle;
            }
        }
        
    } catch (exc) {
        analysis.error = "Style analysis failed: " + exc.message;
    }
    
    return analysis;
}

function getColorsInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_COLORS", "Analyzing colors", 0, 1, "Color definitions and swatches");
    
    // Check if colors collection is safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'colors') === -1) {
        return {
            skipped: true,
            reason: "Colors collection not safe for comprehensive analysis",
            recommendation: "Use standard mode for this document"
        };
    }
    
    var colors = progressiveCollectionAccess(doc, 'colors', 'comprehensive');
    if (!colors) {
        return {
            error: "Progressive collection access denied colors for comprehensive mode"
        };
    }
    
    return enhancedSafeIterateCollection(colors, function(color, itemIndex) {
        return analyzeColorComprehensively(color, itemIndex);
    }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "colors");
}

function analyzeColorComprehensively(color, colorIndex) {
    var analysis = {
        index: colorIndex,
        mode: "comprehensive"
    };
    
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess;
    
    try {
        var colorProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(color, 'id'),
                name: emergencyGetProperty(color, 'name'),
                model: safeGetProperty(color, 'model'),
                space: safeGetProperty(color, 'space'),
                colorValue: emergencyGetProperty(color, 'colorValue'),
                colorType: safeGetProperty(color, 'colorType'),
                inkName: emergencyGetProperty(color, 'inkName'),
                tint: emergencyGetProperty(color, 'tint')
            };
        }, timeout);
        
        if (!colorProps.bailout) {
            analysis.id = colorProps.result.id;
            analysis.name = colorProps.result.name;
            analysis.model = colorProps.result.model ? colorProps.result.model.toString() : 'unknown';
            analysis.space = colorProps.result.space ? colorProps.result.space.toString() : 'unknown';
            analysis.colorValue = colorProps.result.colorValue;
            analysis.colorType = colorProps.result.colorType ? colorProps.result.colorType.toString() : 'unknown';
            analysis.inkName = colorProps.result.inkName;
            analysis.tint = colorProps.result.tint;
        }
        
    } catch (exc) {
        analysis.error = "Color analysis failed: " + exc.message;
    }
    
    return analysis;
}

function getFontsInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_FONTS", "Analyzing fonts", 0, 1, "Font usage and availability");
    
    // Check if fonts collection is safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'fonts') === -1) {
        return {
            skipped: true,
            reason: "Fonts collection not safe for comprehensive analysis",
            recommendation: "Use standard mode for this document"
        };
    }
    
    var fonts = progressiveCollectionAccess(doc, 'fonts', 'comprehensive');
    if (!fonts) {
        return {
            error: "Progressive collection access denied fonts for comprehensive mode"
        };
    }
    
    return enhancedSafeIterateCollection(fonts, function(font, itemIndex) {
        return analyzeFontComprehensively(font, itemIndex);
    }, ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, "fonts");
}

function analyzeFontComprehensively(font, fontIndex) {
    var analysis = {
        index: fontIndex,
        mode: "comprehensive"
    };
    
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess;
    
    try {
        var fontProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(font, 'id'),
                name: emergencyGetProperty(font, 'name'),
                fontFamily: emergencyGetProperty(font, 'fontFamily'),
                fontStyleName: emergencyGetProperty(font, 'fontStyleName'),
                postScriptName: emergencyGetProperty(font, 'postScriptName'),
                status: safeGetProperty(font, 'status'),
                location: emergencyGetProperty(font, 'location'),
                version: emergencyGetProperty(font, 'version'),
                fontType: safeGetProperty(font, 'fontType'),
                platform: emergencyGetProperty(font, 'platformName')
            };
        }, timeout);
        
        if (!fontProps.bailout) {
            analysis.id = fontProps.result.id;
            analysis.name = fontProps.result.name;
            analysis.fontFamily = fontProps.result.fontFamily;
            analysis.fontStyleName = fontProps.result.fontStyleName;
            analysis.postScriptName = fontProps.result.postScriptName;
            analysis.status = fontProps.result.status ? fontProps.result.status.toString() : 'unknown';
            analysis.location = fontProps.result.location;
            analysis.version = fontProps.result.version;
            analysis.fontType = fontProps.result.fontType ? fontProps.result.fontType.toString() : 'unknown';
            analysis.platform = fontProps.result.platform;
        }
        
    } catch (exc) {
        analysis.error = "Font analysis failed: " + exc.message;
    }
    
    return analysis;
}

// RISKY COLLECTION ANALYSIS - ONLY IF PRE-TESTING PASSED

function getImagesInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_IMAGES", "Analyzing images (RISKY)", 0, 1, "Pre-tested image analysis with caution");
    
    // Only proceed if images passed risky collection pre-testing
    if (!preTestResults || arrayIndexOf(preTestResults.riskyButSafe, 'images') === -1) {
        return {
            skipped: true,
            reason: "Images collection failed risky collection pre-testing",
            recommendation: "Images collection may cause hanging - analysis skipped for safety"
        };
    }
    
    var images = progressiveCollectionAccess(doc, 'images', 'comprehensive');
    if (!images) {
        return {
            error: "Progressive collection access denied images despite pre-testing",
            recommendation: "Images collection access was denied by safety system"
        };
    }
    
    // Use shorter timeout and smaller sample for risky collection
    var riskyTimeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 4;
    var riskySampleLimit = Math.min(ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, 10);
    
    enhancedStatusLog("COMP_IMAGES", "Processing risky images collection", 0, 1, 
        "Limited sample (" + riskySampleLimit + ") with enhanced safety");
    
    return enhancedSafeIterateCollection(images, function(image, itemIndex) {
        return analyzeImageSafely(image, itemIndex, riskyTimeout / riskySampleLimit);
    }, riskySampleLimit, "images");
}

function analyzeImageSafely(image, imageIndex, timeoutMs) {
    var analysis = {
        index: imageIndex,
        mode: "comprehensive",
        riskLevel: "risky_but_pre_tested"
    };
    
    try {
        // Basic image properties with strict timeout
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(image, 'id'),
                bounds: emergencyGetProperty(image, 'bounds'),
                actualPpi: emergencyGetProperty(image, 'actualPpi'),
                effectivePpi: emergencyGetProperty(image, 'effectivePpi'),
                imageTypeName: emergencyGetProperty(image, 'imageTypeName')
            };
        }, timeoutMs / 2);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.bounds = basicProps.result.bounds;
            analysis.actualPpi = basicProps.result.actualPpi;
            analysis.effectivePpi = basicProps.result.effectivePpi;
            analysis.imageTypeName = basicProps.result.imageTypeName;
        }
        
        // Item link information (often problematic)
        var linkProps = emergencyBailoutHandler(function() {
            var itemLink = emergencyGetProperty(image, 'itemLink');
            if (itemLink) {
                return {
                    name: emergencyGetProperty(itemLink, 'name'),
                    status: safeGetProperty(itemLink, 'status'),
                    filePath: emergencyGetProperty(itemLink, 'filePath'),
                    size: emergencyGetProperty(itemLink, 'size'),
                    date: emergencyGetProperty(itemLink, 'date'),
                    linkType: safeGetProperty(itemLink, 'linkType')
                };
            }
            return null;
        }, timeoutMs / 2);
        
        if (!linkProps.bailout && linkProps.result) {
            analysis.itemLink = {
                name: linkProps.result.name,
                status: linkProps.result.status ? linkProps.result.status.toString() : 'unknown',
                filePath: linkProps.result.filePath,
                size: linkProps.result.size,
                date: linkProps.result.date,
                linkType: linkProps.result.linkType ? linkProps.result.linkType.toString() : 'unknown'
            };
        } else {
            analysis.itemLink = null;
        }
        
        // Parent information
        var parentProps = emergencyBailoutHandler(function() {
            var parentObj = emergencyGetProperty(image, 'parent');
            var constructor = safeGetProperty(parentObj, 'constructor');
            return constructor ? safeGetProperty(constructor, 'name', 'unknown') : 'unknown';
        }, timeoutMs / 4);
        
        analysis.parent = parentProps.bailout ? 'unknown' : parentProps.result;
        
        // Transparency settings
        var transparencyProps = emergencyBailoutHandler(function() {
            return emergencyGetProperty(image, 'transparencySettings.blendingSettings.opacity');
        }, timeoutMs / 4);
        
        analysis.transparencySettings = transparencyProps.bailout ? null : transparencyProps.result;
        
    } catch (exc) {
        analysis.error = "Risky image analysis failed: " + exc.message;
        analysis.safetyNote = "Image analysis failed safely - continuing with other images";
    }
    
    return analysis;
}

function getLinksInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_LINKS", "Analyzing links (RISKY)", 0, 1, "Pre-tested links analysis with caution");
    
    // Only proceed if links passed risky collection pre-testing
    if (!preTestResults || arrayIndexOf(preTestResults.riskyButSafe, 'links') === -1) {
        return {
            skipped: true,
            reason: "Links collection failed risky collection pre-testing",
            recommendation: "Links collection may cause hanging - analysis skipped for safety"
        };
    }
    
    var links = progressiveCollectionAccess(doc, 'links', 'comprehensive');
    if (!links) {
        return {
            error: "Progressive collection access denied links despite pre-testing",
            recommendation: "Links collection access was denied by safety system"
        };
    }
    
    // Use shorter timeout and smaller sample for risky collection
    var riskyTimeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 4;
    var riskySampleLimit = Math.min(ENHANCED_ANALYSIS_CONFIG.maxCollectionSample, 10);
    
    enhancedStatusLog("COMP_LINKS", "Processing risky links collection", 0, 1, 
        "Limited sample (" + riskySampleLimit + ") with enhanced safety");
    
    return enhancedSafeIterateCollection(links, function(link, itemIndex) {
        return analyzeLinkSafely(link, itemIndex, riskyTimeout / riskySampleLimit);
    }, riskySampleLimit, "links");
}

function analyzeLinkSafely(link, linkIndex, timeoutMs) {
    var analysis = {
        index: linkIndex,
        mode: "comprehensive",
        riskLevel: "risky_but_pre_tested"
    };
    
    try {
        // Basic link properties with strict timeout
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(link, 'id'),
                name: emergencyGetProperty(link, 'name'),
                filePath: emergencyGetProperty(link, 'filePath'),
                status: safeGetProperty(link, 'status'),
                size: emergencyGetProperty(link, 'size'),
                date: emergencyGetProperty(link, 'date'),
                linkType: safeGetProperty(link, 'linkType')
            };
        }, timeoutMs / 2);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.name = basicProps.result.name;
            analysis.filePath = basicProps.result.filePath;
            analysis.status = basicProps.result.status ? basicProps.result.status.toString() : 'unknown';
            analysis.size = basicProps.result.size;
            analysis.date = basicProps.result.date;
            analysis.linkType = basicProps.result.linkType ? basicProps.result.linkType.toString() : 'unknown';
        }
        
        // Additional link properties
        var advancedProps = emergencyBailoutHandler(function() {
            return {
                needed: emergencyGetProperty(link, 'needed'),
                canEmbed: emergencyGetProperty(link, 'canEmbed'),
                canUnembed: emergencyGetProperty(link, 'canUnembed'),
                linkResourceURI: emergencyGetProperty(link, 'linkResourceURI'),
                versionState: safeGetProperty(link, 'versionState')
            };
        }, timeoutMs / 2);
        
        if (!advancedProps.bailout) {
            analysis.needed = advancedProps.result.needed;
            analysis.canEmbed = advancedProps.result.canEmbed;
            analysis.canUnembed = advancedProps.result.canUnembed;
            analysis.linkResourceURI = advancedProps.result.linkResourceURI;
            analysis.versionState = advancedProps.result.versionState ? advancedProps.result.versionState.toString() : 'unknown';
        }
        
    } catch (exc) {
        analysis.error = "Risky link analysis failed: " + exc.message;
        analysis.safetyNote = "Link analysis failed safely - continuing with other links";
    }
    
    return analysis;
}

function getPageItemsInfo(doc, preTestResults) {
    enhancedStatusLog("COMP_PAGEITEMS", "Analyzing page items (RISKY)", 0, 1, "Pre-tested pageItems analysis");
    
    // Only proceed if pageItems passed risky collection pre-testing
    if (!preTestResults || arrayIndexOf(preTestResults.riskyButSafe, 'pageItems') === -1) {
        return {
            skipped: true,
            reason: "PageItems collection failed risky collection pre-testing",
            recommendation: "PageItems collection may be slow - analysis skipped for safety"
        };
    }
    
    var pageItems = progressiveCollectionAccess(doc, 'pageItems', 'comprehensive');
    if (!pageItems) {
        return {
            error: "Progressive collection access denied pageItems despite pre-testing"
        };
    }
    
    var pageItemsInfo = {
        totalCount: emergencyGetLength(pageItems, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 4),
        byType: {},
        sample: [],
        riskLevel: "risky_but_pre_tested",
        mode: "comprehensive"
    };
    
    // Conservative sampling for risky collection
    var riskySampleLimit = Math.min(pageItemsInfo.totalCount, 10);
    var riskyTimeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.collectionAccess / 4;
    
    enhancedStatusLog("COMP_PAGEITEMS", "Sampling page items safely", 0, 1, 
        "Processing " + riskySampleLimit + " of " + pageItemsInfo.totalCount + " items");
    
    pageItemsInfo.sample = enhancedSafeIterateCollection(pageItems, function(item, itemIndex) {
        return analyzePageItemSafely(item, itemIndex, pageItemsInfo, riskyTimeout / riskySampleLimit);
    }, riskySampleLimit, "pageItems");
    
    return pageItemsInfo;
}

function analyzePageItemSafely(item, itemIndex, pageItemsInfo, timeoutMs) {
    var analysis = {
        index: itemIndex,
        mode: "comprehensive",
        riskLevel: "risky_but_pre_tested"
    };
    
    try {
        // Get item type safely
        var typeResult = emergencyBailoutHandler(function() {
            var itemConstructor = emergencyGetProperty(item, 'constructor');
            return itemConstructor ? safeGetProperty(itemConstructor, 'name', 'unknown') : 'unknown';
        }, timeoutMs / 4);
        
        var itemType = typeResult.bailout ? 'unknown' : typeResult.result;
        analysis.type = itemType;
        
        // Count by type
        if (!pageItemsInfo.byType[itemType]) {
            pageItemsInfo.byType[itemType] = 0;
        }
        pageItemsInfo.byType[itemType]++;
        
        // Basic item properties
        var basicProps = emergencyBailoutHandler(function() {
            return {
                id: emergencyGetProperty(item, 'id'),
                bounds: emergencyGetProperty(item, 'bounds'),
                visible: emergencyGetProperty(item, 'visible', true),
                locked: emergencyGetProperty(item, 'locked', false)
            };
        }, timeoutMs / 2);
        
        if (!basicProps.bailout) {
            analysis.id = basicProps.result.id;
            analysis.bounds = basicProps.result.bounds;
            analysis.visible = basicProps.result.visible;
            analysis.locked = basicProps.result.locked;
        }
        
        // Layer and parent information
        var contextProps = emergencyBailoutHandler(function() {
            var layer = safeGetProperty(item, 'itemLayer');
            var layerName = layer ? emergencyGetProperty(layer, 'name') : null;
            
            var parentObj = emergencyGetProperty(item, 'parent');
            var parentConstructor = safeGetProperty(parentObj, 'constructor');
            var parentType = parentConstructor ? safeGetProperty(parentConstructor, 'name', 'unknown') : 'unknown';
            
            return {
                layer: layerName,
                parent: parentType
            };
        }, timeoutMs / 4);
        
        if (!contextProps.bailout) {
            analysis.layer = contextProps.result.layer;
            analysis.parent = contextProps.result.parent;
        }
        
        // Additional properties for change detection
        var additionalProps = emergencyBailoutHandler(function() {
            return {
                rotation: emergencyGetProperty(item, 'rotationAngle'),
                opacity: emergencyGetProperty(item, 'transparencySettings.blendingSettings.opacity')
            };
        }, timeoutMs / 4);
        
        if (!additionalProps.bailout) {
            analysis.rotation = additionalProps.result.rotation;
            analysis.opacity = additionalProps.result.opacity;
        }
        
    } catch (exc) {
        analysis.error = "Page item analysis failed: " + exc.message;
        analysis.safetyNote = "Page item analysis failed safely - continuing with other items";
    }
    
    return analysis;
}

// Extract margin information safely
function extractMarginInfo(page) {
    try {
        var marginsResult = emergencyBailoutHandler(function() {
            var margins = safeGetProperty(page, 'marginPreferences');
            if (margins) {
                return {
                    top: emergencyGetProperty(margins, 'top'),
                    left: emergencyGetProperty(margins, 'left'),
                    bottom: emergencyGetProperty(margins, 'bottom'),
                    right: emergencyGetProperty(margins, 'right'),
                    columnCount: emergencyGetProperty(margins, 'columnCount'),
                    columnGutter: emergencyGetProperty(margins, 'columnGutter')
                };
            }
            return null;
        }, ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.comprehensive.propertyAccess / 4);
        
        return marginsResult.bailout ? null : marginsResult.result;
    } catch (e) {
        debugLog("Failed to extract margin info: " + e.message, "WARN");
        return null;
    }
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
        skippedSections: 0,
        totalItems: 0,
        riskyCollectionsProcessed: 0,
        riskyCollectionsSkipped: 0,
        processingTime: 0
    };
    
    try {
        // Count sections and items
        var sections = ['documentInfo', 'pages', 'layers', 'textFrames', 'stories', 
                       'textContent', 'styles', 'colors', 'fonts', 'images', 'links', 'pageItems'];
        
        for (var i = 0; i < sections.length; i++) {
            var sectionName = sections[i];
            var section = safeGetProperty(report, sectionName);
            
            if (section) {
                stats.sectionsAnalyzed++;
                
                if (safeGetProperty(section, 'emergencyBailout')) {
                    stats.bailoutSections++;
                } else if (safeGetProperty(section, 'skipped')) {
                    stats.skippedSections++;
                    
                    // Count skipped risky collections
                    if (sectionName === 'images' || sectionName === 'links' || sectionName === 'pageItems') {
                        stats.riskyCollectionsSkipped++;
                    }
                } else {
                    stats.successfulSections++;
                    
                    // Count processed risky collections
                    if (sectionName === 'images' || sectionName === 'links' || sectionName === 'pageItems') {
                        stats.riskyCollectionsProcessed++;
                    }
                    
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
        
        // Calculate success rate
        stats.successRate = stats.sectionsAnalyzed > 0 ? 
            Math.round((stats.successfulSections / stats.sectionsAnalyzed) * 100) : 0;
        
        // Calculate risky collection success rate
        stats.riskyCollectionSuccessRate = (stats.riskyCollectionsProcessed + stats.riskyCollectionsSkipped) > 0 ?
            Math.round((stats.riskyCollectionsProcessed / (stats.riskyCollectionsProcessed + stats.riskyCollectionsSkipped)) * 100) : 0;
        
        // Get processing times
        stats.processingTime = (safeGetProperty(report, 'processingTime', 0)) + 
                              (safeGetProperty(report, 'standardProcessingTime', 0)) + 
                              (safeGetProperty(report, 'comprehensiveProcessingTime', 0));
        
    } catch (exc) {
        stats.error = "Statistics generation failed: " + exc.message;
    }
    
    return stats;
}

// Comprehensive collection strategy for safe access
function comprehensiveCollectionStrategy(doc) {
    var strategy = {
        safeCollections: [],
        moderateCollections: [],
        riskyCollections: [],
        skipCollections: [],
        processingOrder: []
    };
    
    try {
        // Pre-test all collections to determine strategy
        var preTestResults = preTestRiskyCollections(doc);
        
        strategy.safeCollections = preTestResults.safe || [];
        strategy.riskyCollections = preTestResults.riskyButSafe || [];
        strategy.skipCollections = (preTestResults.unsafe || []).concat(preTestResults.dangerous || []);
        
        // Determine processing order (safe first, risky last)
        strategy.processingOrder = strategy.safeCollections.concat(strategy.riskyCollections);
        
    } catch (exc) {
        debugLog("Comprehensive collection strategy failed: " + exc.message, "ERROR");
    }
    
    return strategy;
}

// Graceful collection degradation when collections fail
function gracefulCollectionDegradation(doc, collectionName, error) {
    var degradation = {
        originalCollection: collectionName,
        degradedTo: null,
        reason: error,
        success: false
    };
    
    try {
        // Attempt to degrade to safer alternatives
        var alternatives = {
            'images': 'pageItems', // Try pageItems instead of images
            'links': 'pageItems',  // Try pageItems instead of links
            'pageItems': 'textFrames', // Try textFrames instead of pageItems
            'textFrames': 'pages', // Try pages instead of textFrames
            'stories': 'textFrames' // Try textFrames instead of stories
        };
        
        var alternative = alternatives[collectionName];
        if (alternative) {
            var testResult = testCollectionSafety(doc, alternative, 500); // Quick test
            if (testResult.safety === "safe" || testResult.safety === "moderate") {
                degradation.degradedTo = alternative;
                degradation.success = true;
                debugLog("Successfully degraded " + collectionName + " to " + alternative, "DEGRADE");
            }
        }
        
    } catch (exc) {
        debugLog("Collection degradation failed: " + exc.message, "ERROR");
    }
    
    return degradation;
}

// NOTE: OLD createDocumentReport FUNCTION REMOVED
// The old comprehensive function that was causing confusion and wasn't being used
// has been completely removed to clean up the architecture and prevent conflicts.