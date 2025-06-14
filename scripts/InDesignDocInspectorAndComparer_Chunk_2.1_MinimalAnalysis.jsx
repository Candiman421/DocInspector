// ============================================================================
// CHUNK 2.1: BASIC DOCUMENT ANALYSIS - MINIMAL/SAFE OPERATIONS
// ES3 COMPATIBLE VERSION - EMERGENCY BAILOUTS INTEGRATED
// ============================================================================

// Analysis modes configuration
var ANALYSIS_MODES = {
    MINIMAL: "minimal",        // Just property dump
    BASIC: "basic",           // Document info + counts
    STANDARD: "standard",     // Basic + text content  
    COMPREHENSIVE: "comprehensive"  // Everything
};

// Current analysis mode (can be changed via UI)
var CURRENT_ANALYSIS_MODE = ANALYSIS_MODES.BASIC;

// Emergency timeouts by analysis mode
var MODE_TIMEOUTS = {
    minimal: 1000,        // 1 second
    basic: 3000,          // 3 seconds  
    standard: 8000,       // 8 seconds
    comprehensive: 15000  // 15 seconds
};

// ============================================================================
// MINIMAL MODE: DOM PROPERTY EXPLORER
// ============================================================================

function createMinimalPropertyDump(doc) {
    enhancedStatusLog("MINIMAL", "Starting property dump", 0, 5, "Exploring document DOM safely");
    
    var dump = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk-minimal",
        mode: "MINIMAL_PROPERTY_DUMP",
        documentProperties: {},
        collectionSizes: {},
        accessibleProperties: [],
        failedProperties: [],
        emergencyBailouts: 0
    };
    
    // Test basic document properties
    enhancedStatusLog("MINIMAL", "Testing document properties", 1, 5, "Safe property exploration");
    dump.documentProperties = exploreDocumentProperties(doc);
    
    // Test collection sizes only (no iteration)
    enhancedStatusLog("MINIMAL", "Testing collection sizes", 2, 5, "Collection length checking");
    dump.collectionSizes = exploreCollectionSizes(doc);
    
    // Test property accessibility
    enhancedStatusLog("MINIMAL", "Testing property access", 3, 5, "API compatibility check");
    var accessTest = testPropertyAccess(doc);
    dump.accessibleProperties = accessTest.accessible;
    dump.failedProperties = accessTest.failed;
    
    enhancedStatusLog("MINIMAL", "Property dump completed", 5, 5, 
        "Found " + dump.accessibleProperties.length + " accessible properties");
    
    return dump;
}

function exploreDocumentProperties(doc) {
    var props = {};
    var basicProps = [
        'name', 'saved', 'modified', 'readonly', 'visible', 'id', 
        'filePath', 'fullName', 'documentOffset'
    ];
    
    for (var i = 0; i < basicProps.length; i++) {
        var prop = basicProps[i];
        try {
            var value = safeGetProperty(doc, prop);
            if (value !== null && value !== undefined) {
                // Convert to string for safety
                props[prop] = {
                    value: String(value),
                    type: typeof value,
                    accessible: true
                };
            } else {
                props[prop] = {
                    value: null,
                    accessible: false,
                    reason: "Property returned null/undefined"
                };
            }
        } catch (exc) {
            props[prop] = {
                accessible: false,
                error: exc.message,
                reason: "Property access threw exception"
            };
        }
    }
    
    return props;
}

function exploreCollectionSizes(doc) {
    var collections = {};
    var collectionNames = [
        'pages', 'textFrames', 'stories', 'layers', 'images', 'links', 
        'colors', 'fonts', 'pageItems', 'styles', 'paragraphStyles', 'characterStyles'
    ];
    
    for (var i = 0; i < collectionNames.length; i++) {
        var collName = collectionNames[i];
        try {
            var collection = safeGetProperty(doc, collName);
            if (collection) {
                var size = safeGetLength(collection);
                collections[collName] = {
                    size: size,
                    accessible: true,
                    hasItems: size > 0
                };
            } else {
                collections[collName] = {
                    accessible: false,
                    reason: "Collection not found"
                };
            }
        } catch (exc) {
            collections[collName] = {
                accessible: false,
                error: exc.message
            };
        }
    }
    
    return collections;
}

function testPropertyAccess(doc) {
    var result = {
        accessible: [],
        failed: []
    };
    
    // Test nested properties that commonly cause issues
    var testPaths = [
        'viewPreferences',
        'viewPreferences.horizontalMeasurementUnits',
        'documentPreferences', 
        'documentPreferences.pageHeight',
        'activeLayer',
        'activeLayer.name',
        'selection',
        'zeroPoint'
    ];
    
    for (var i = 0; i < testPaths.length; i++) {
        var path = testPaths[i];
        try {
            var value = safeGetProperty(doc, path);
            if (value !== null && value !== undefined) {
                result.accessible.push({
                    path: path,
                    type: typeof value,
                    preview: String(value).substring(0, 50)
                });
            } else {
                result.failed.push({
                    path: path,
                    reason: "Returned null/undefined"
                });
            }
        } catch (exc) {
            result.failed.push({
                path: path,
                reason: exc.message
            });
        }
    }
    
    return result;
}

// ============================================================================
// BASIC MODE: SAFE DOCUMENT ANALYSIS  
// ============================================================================

function createBasicDocumentReport(doc) {
    enhancedStatusLog("BASIC", "Starting basic document analysis", 0, 10, "Safe essential analysis");
    
    // Validate document state first
    var validation = validateDocumentState(doc);
    if (!validation.isValid) {
        enhancedStatusLog("BASIC", "Document validation failed", 1, 10, "Falling back to minimal mode");
        return createMinimalPropertyDump(doc);
    }
    
    var report = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk-basic",
        mode: "BASIC_SAFE_ANALYSIS",
        validationResults: validation
    };
    
    // Use emergency timeouts for basic mode
    var timeout = MODE_TIMEOUTS.basic;
    
    try {
        // Essential document info (with bailout)
        report.documentInfo = emergencyAnalyzeSection("documentInfo", function() {
            return getBasicDocumentInfo(doc);
        }, timeout, 2, 10);
        
        // Page count only (no iteration)
        report.pageInfo = emergencyAnalyzeSection("pageInfo", function() {
            return getBasicPageInfo(doc);
        }, timeout, 4, 10);
        
        // Text frame count only (no content)
        report.textInfo = emergencyAnalyzeSection("textInfo", function() {
            return getBasicTextInfo(doc);
        }, timeout, 6, 10);
        
        // Layer count only
        report.layerInfo = emergencyAnalyzeSection("layerInfo", function() {
            return getBasicLayerInfo(doc);
        }, timeout, 8, 10);
        
        enhancedStatusLog("BASIC", "Basic analysis completed", 10, 10, "Safe analysis successful");
        
    } catch (exc) {
        enhancedStatusLog("BASIC", "Basic analysis failed", 10, 10, "Error: " + exc.message);
        report.error = "Basic analysis failed: " + exc.message;
        report.fallbackToMinimal = true;
    }
    
    return report;
}

// Emergency section analyzer with integrated bailouts
function emergencyAnalyzeSection(sectionName, analyzeFunction, timeoutMs, step, totalSteps) {
    var startTime = new Date().getTime();
    enhancedStatusLog("EMERGENCY", "Analyzing " + sectionName, step, totalSteps, 
        "Emergency timeout: " + timeoutMs + "ms");
    
    try {
        // Create timeout promise-like mechanism (ES3 compatible)
        var completed = false;
        var result = null;
        var timedOut = false;
        
        // Start timeout timer
        var timeoutStart = new Date().getTime();
        
        // Try to execute function
        try {
            result = analyzeFunction();
            completed = true;
        } catch (funcError) {
            throw funcError;
        }
        
        // Check if we timed out during execution
        var duration = new Date().getTime() - timeoutStart;
        if (duration > timeoutMs) {
            timedOut = true;
            throw new Error("Emergency timeout after " + duration + "ms");
        }
        
        enhancedStatusLog("EMERGENCY", sectionName + " completed", step, totalSteps, 
            "Success in " + duration + "ms");
        
        return result;
        
    } catch (exc) {
        var duration = new Date().getTime() - startTime;
        enhancedStatusLog("EMERGENCY", sectionName + " BAILOUT", step, totalSteps, 
            "Failed after " + duration + "ms: " + exc.message);
        
        return {
            emergencyBailout: true,
            sectionName: sectionName,
            error: exc.message,
            duration: duration,
            timeoutMs: timeoutMs,
            recommendation: "Section caused timeout - analysis skipped for safety"
        };
    }
}

// ============================================================================
// BASIC ANALYSIS FUNCTIONS - MINIMAL AND SAFE
// ============================================================================

function getBasicDocumentInfo(doc) {
    enhancedStatusLog("BASIC_DOC", "Getting basic document info", 0, 1, "Essential properties only");
    
    return {
        name: safeGetProperty(doc, 'name', 'Unknown'),
        saved: safeGetProperty(doc, 'saved', false),
        modified: safeGetProperty(doc, 'modified', false),
        readonly: safeGetProperty(doc, 'readonly', false),
        visible: safeGetProperty(doc, 'visible', true),
        filePath: (function() {
            var path = safeGetProperty(doc, 'filePath');
            return path ? path.toString() : null;
        })(),
        analysisMode: "basic",
        limitedAnalysis: true
    };
}

function getBasicPageInfo(doc) {
    enhancedStatusLog("BASIC_PAGES", "Getting page count", 0, 1, "Count only - no iteration");
    
    var pages = safeGetProperty(doc, 'pages');
    return {
        totalPages: safeGetLength(pages),
        analysisMode: "basic",
        note: "Page count only - no detailed page analysis in basic mode"
    };
}

function getBasicTextInfo(doc) {
    enhancedStatusLog("BASIC_TEXT", "Getting text info", 0, 2, "Counts only - no content");
    
    var textFrames = safeGetProperty(doc, 'textFrames');
    var stories = safeGetProperty(doc, 'stories');
    
    enhancedStatusLog("BASIC_TEXT", "Text analysis completed", 2, 2, "Safe counts obtained");
    
    return {
        totalTextFrames: safeGetLength(textFrames),
        totalStories: safeGetLength(stories),
        analysisMode: "basic",
        note: "Text frame and story counts only - no content analysis in basic mode"
    };
}

function getBasicLayerInfo(doc) {
    enhancedStatusLog("BASIC_LAYERS", "Getting layer count", 0, 1, "Count only");
    
    var layers = safeGetProperty(doc, 'layers');
    return {
        totalLayers: safeGetLength(layers),
        analysisMode: "basic",
        note: "Layer count only - no detailed layer analysis in basic mode"
    };
}

// ============================================================================
// MODE SELECTION AND VALIDATION
// ============================================================================

function setAnalysisMode(mode) {
    if (ANALYSIS_MODES[mode.toUpperCase()]) {
        CURRENT_ANALYSIS_MODE = ANALYSIS_MODES[mode.toUpperCase()];
        enhancedStatusLog("MODE", "Analysis mode set", 0, 1, "Mode: " + CURRENT_ANALYSIS_MODE);
        return true;
    } else {
        enhancedStatusLog("MODE", "Invalid analysis mode", 0, 1, "Unknown mode: " + mode);
        return false;
    }
}

function getCurrentAnalysisMode() {
    return CURRENT_ANALYSIS_MODE;
}

// Mode-based report creation
function createModeBasedReport(doc) {
    enhancedStatusLog("MODE", "Creating report for mode", 0, 1, "Mode: " + CURRENT_ANALYSIS_MODE);
    
    switch (CURRENT_ANALYSIS_MODE) {
        case ANALYSIS_MODES.MINIMAL:
            return createMinimalPropertyDump(doc);
            
        case ANALYSIS_MODES.BASIC:
            return createBasicDocumentReport(doc);
            
        case ANALYSIS_MODES.STANDARD:
            // Will be implemented in Chunk 2B
            return createStandardDocumentReport(doc);
            
        case ANALYSIS_MODES.COMPREHENSIVE:
            // Will be implemented in Chunk 2C
            return createComprehensiveDocumentReport(doc);
            
        default:
            enhancedStatusLog("MODE", "Unknown mode - using basic", 0, 1, "Fallback to basic mode");
            return createBasicDocumentReport(doc);
    }
}

// Replace the main document analysis function
function createValidatedDocumentReport(doc) {
    return createModeBasedReport(doc);
}