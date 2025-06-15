// ============================================================================
// CHUNK 2.1: MINIMAL ANALYSIS MODE - PROGRESSIVE SAFETY SYSTEM (FIXED)
// ES3 COMPATIBLE VERSION - TRUE MODE-BASED SAFETY IMPLEMENTATION
// ============================================================================

// Analysis modes configuration - ENHANCED WITH PROPER DESCRIPTIONS
var ANALYSIS_MODES = {
    EMERGENCY: "emergency",       // Properties only, zero collections
    MINIMAL: "minimal",          // Safe collections only with pre-testing
    BASIC: "basic",              // Safe + moderate collections with timeouts
    STANDARD: "standard",        // Basic + limited text content sampling
    COMPREHENSIVE: "comprehensive" // Full analysis with pre-tested risky collections
};

// Current analysis mode (can be changed via UI)
var CURRENT_ANALYSIS_MODE = ANALYSIS_MODES.BASIC;

// ============================================================================
// MODE MANAGEMENT FUNCTIONS - ENHANCED WITH SAFETY CONTROLS
// ============================================================================

function setAnalysisMode(mode) {
    var modeKey = mode.toUpperCase();
    if (ANALYSIS_MODES[modeKey]) {
        var previousMode = CURRENT_ANALYSIS_MODE;
        CURRENT_ANALYSIS_MODE = ANALYSIS_MODES[modeKey];
        ENHANCED_ANALYSIS_CONFIG.runtime.currentMode = CURRENT_ANALYSIS_MODE;
        
        enhancedStatusLog("MODE", "Analysis mode changed", 0, 1, 
            "From: " + previousMode + " → To: " + CURRENT_ANALYSIS_MODE);
        return true;
    } else {
        enhancedStatusLog("MODE", "Invalid analysis mode", 0, 1, "Unknown mode: " + mode);
        return false;
    }
}

function getCurrentAnalysisMode() {
    return CURRENT_ANALYSIS_MODE;
}

// Get mode description for UI display - ENHANCED WITH ACCURATE SAFETY INFO
function getModeDescription(mode) {
    var descriptions = {
        emergency: "EMERGENCY MODE (Ultra-Safe)\n" +
                  "• Properties only - NO collection access\n" +
                  "• 500ms timeout maximum\n" +
                  "• For completely broken documents\n" +
                  "• Zero hanging risk\n" +
                  "• Minimal memory usage (1MB limit)",
                
        minimal: "MINIMAL MODE (Very Safe)\n" +
              "• Only safe collections (pages)\n" +
              "• 1-second timeout\n" +
              "• Pre-tests all collection access\n" +
              "• Essential information only\n" +
              "• Safe for problematic documents\n" +
              "• Low memory usage (2MB limit)",
              
        basic: "BASIC MODE (Safe)\n" +
             "• Safe + moderate collections (pages, textFrames, layers)\n" +
             "• 3-second timeout\n" +
             "• Collection pre-testing enabled\n" +
             "• No text content processing\n" +
             "• Good performance with safety\n" +
             "• Moderate memory usage (4MB limit)",
             
        standard: "STANDARD MODE (Balanced)\n" +
                 "• Text content sampling included\n" +
                 "• Limited collection analysis\n" +
                 "• 8-second timeout\n" +
                 "• Comprehensive text tracking\n" +
                 "• Pre-tests risky collections\n" +
                 "• Higher memory usage (8MB limit)",
                 
        comprehensive: "COMPREHENSIVE MODE (Complete)\n" +
                      "• Full feature analysis with safety\n" +
                      "• All collections with pre-testing\n" +
                      "• 15-second timeout\n" +
                      "• Images, links with safety checks\n" +
                      "• Maximum detail and memory (16MB limit)\n" +
                      "• Uses emergency bailouts for risky operations"
    };
    
    return descriptions[mode] || "Unknown analysis mode - using emergency mode safety";
}

// Mode-based report creation - CORE FUNCTION FOR TRUE MODE CONTROL
function createModeBasedReport(doc) {
    var currentMode = getCurrentAnalysisMode();
    enhancedStatusLog("MODE", "Creating report for mode", 0, 1, "Mode: " + currentMode);
    
    // Start analysis session with state management
    if (!startAnalysisSession(doc, currentMode)) {
        return {
            error: "Analysis session could not start - concurrent analysis detected",
            mode: currentMode,
            recommendation: "Wait for current analysis to complete"
        };
    }
    
    try {
        switch (currentMode) {
            case ANALYSIS_MODES.EMERGENCY:
                return createEmergencyPropertyDump(doc);
                
            case ANALYSIS_MODES.MINIMAL:
                return createMinimalPropertyDump(doc);
                
            case ANALYSIS_MODES.BASIC:
                return createBasicDocumentReport(doc);
                
            case ANALYSIS_MODES.STANDARD:
                return createStandardDocumentReport(doc);
                
            case ANALYSIS_MODES.COMPREHENSIVE:
                return createComprehensiveDocumentReport(doc);
                
            default:
                enhancedStatusLog("MODE", "Unknown mode - using emergency", 0, 1, "Fallback to emergency mode");
                return createEmergencyPropertyDump(doc);
        }
    } finally {
        // End analysis session
        endAnalysisSession();
    }
}

// Replace the main document analysis function - ENSURES MODE COMPLIANCE
function createValidatedDocumentReport(doc) {
    return createModeBasedReport(doc);
}

// ============================================================================
// MINIMAL MODE: SAFE PROPERTY EXPLORATION WITH LIMITED COLLECTIONS
// ============================================================================

function createMinimalPropertyDump(doc) {
    enhancedStatusLog("MINIMAL", "Starting minimal analysis", 0, 8, "Safe collections with pre-testing");
    
    var dump = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk-minimal",
        mode: "MINIMAL_SAFE_ANALYSIS",
        safetyLevel: "high_safety",
        documentProperties: {},
        collectionSizes: {},
        accessibleProperties: [],
        failedProperties: [],
        preTestResults: {},
        processingTime: 0,
        errors: [],
        warnings: []
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Step 1: Document validation first
        enhancedStatusLog("MINIMAL", "Validating document", 1, 8, "Mode-appropriate validation");
        var validation = validateDocumentState(doc);
        dump.validationResults = validation;
        
        if (!validation.isValid) {
            enhancedStatusLog("MINIMAL", "Validation failed", 2, 8, "Falling back to emergency mode");
            dump.warnings.push("Document validation failed - recommend emergency mode");
            dump.fallbackToEmergency = true;
            return dump;
        }
        
        // Step 2: Test basic document properties
        enhancedStatusLog("MINIMAL", "Testing document properties", 2, 8, "Safe property exploration");
        dump.documentProperties = exploreDocumentPropertiesSafely(doc);
        
        // Step 3: Pre-test collections before access
        enhancedStatusLog("MINIMAL", "Pre-testing collections", 4, 8, "Collection safety verification");
        dump.preTestResults = preTestMinimalCollections(doc);
        
        // Step 4: Get sizes for safe collections only
        enhancedStatusLog("MINIMAL", "Getting safe collection sizes", 6, 8, "Minimal collection access");
        dump.collectionSizes = exploreMinimalCollectionSizes(doc, dump.preTestResults);
        
        // Step 5: Test property accessibility safely
        enhancedStatusLog("MINIMAL", "Testing property access", 7, 8, "Safe property compatibility check");
        var accessTest = testMinimalPropertyAccess(doc);
        dump.accessibleProperties = accessTest.accessible;
        dump.failedProperties = accessTest.failed;
        
        dump.processingTime = new Date().getTime() - startTime;
        
        enhancedStatusLog("MINIMAL", "Minimal analysis completed", 8, 8, 
            "Found " + dump.accessibleProperties.length + " accessible properties, " + 
            "processed in " + dump.processingTime + "ms");
        
        // Check if processing time was reasonable for minimal mode
        var minimalTimeout = ENHANCED_ANALYSIS_CONFIG.modes.minimal.timeout;
        if (dump.processingTime > minimalTimeout) {
            dump.warnings.push("Minimal analysis exceeded timeout (" + dump.processingTime + "ms) - document may be problematic");
        }
        
    } catch (exc) {
        dump.errors.push("Minimal analysis failed: " + exc.message);
        dump.processingTime = new Date().getTime() - startTime;
        enhancedStatusLog("MINIMAL", "Minimal analysis failed", 8, 8, "Error: " + exc.message);
    }
    
    return dump;
}

// Pre-test collections before accessing them in minimal mode
function preTestMinimalCollections(doc) {
    var testResults = {
        tested: [],
        safe: [],
        unsafe: [],
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    // Get collections allowed in minimal mode
    var minimalCollections = getMinimalSafeCollections();
    
    enhancedStatusLog("MINIMAL_PRETEST", "Testing minimal collections", 0, minimalCollections.length, 
        "Pre-testing " + minimalCollections.length + " collections");
    
    for (var i = 0; i < minimalCollections.length; i++) {
        var collName = minimalCollections[i];
        
        try {
            enhancedStatusLog("MINIMAL_PRETEST", "Testing " + collName, i + 1, minimalCollections.length, 
                "Collection safety test");
            
            var testResult = testCollectionSafety(doc, collName, 
                ENHANCED_ANALYSIS_CONFIG.capabilityTesting.collectionTestTimeout);
            
            testResults.tested.push({
                name: collName,
                result: testResult
            });
            
            if (testResult.safety === "safe" || testResult.safety === "moderate") {
                testResults.safe.push(collName);
                enhancedStatusLog("MINIMAL_PRETEST", collName + " is safe", i + 1, minimalCollections.length, 
                    "Safety: " + testResult.safety + ", Length: " + testResult.length);
            } else {
                testResults.unsafe.push(collName);
                enhancedStatusLog("MINIMAL_PRETEST", collName + " is unsafe", i + 1, minimalCollections.length, 
                    "Safety: " + testResult.safety + ", Error: " + testResult.error);
            }
            
        } catch (exc) {
            testResults.unsafe.push(collName);
            testResults.tested.push({
                name: collName,
                error: exc.message
            });
            enhancedStatusLog("MINIMAL_PRETEST", collName + " test failed", i + 1, minimalCollections.length, 
                "Error: " + exc.message);
        }
    }
    
    testResults.processingTime = new Date().getTime() - startTime;
    
    enhancedStatusLog("MINIMAL_PRETEST", "Pre-testing completed", minimalCollections.length, minimalCollections.length, 
        "Safe: " + testResults.safe.length + ", Unsafe: " + testResults.unsafe.length);
    
    return testResults;
}

// Get collections that are safe for minimal mode - CRITICAL SAFETY FUNCTION
function getMinimalSafeCollections() {
    // MINIMAL MODE: Only the safest collections, pre-tested
    // NO images, links, pageItems - these cause hanging!
    return ["pages"]; // Start with only the safest collection
}

// Create filtered collection list based on mode - ESSENTIAL FOR PROGRESSIVE SAFETY
function createModeFilteredCollectionList(mode) {
    var collections = {
        emergency: [],  // NO collections in emergency mode
        minimal: ["pages"],  // Only the safest
        basic: ["pages", "textFrames", "layers"],  // Safe collections only
        standard: ["pages", "textFrames", "layers", "stories"],  // Add moderate risk
        comprehensive: ["pages", "textFrames", "layers", "stories", "styles", "colors", "fonts", "images", "links", "pageItems"]  // All collections with pre-testing
    };
    
    return collections[mode] || collections.emergency;
}

// Explore document properties safely with minimal mode constraints
function exploreDocumentPropertiesSafely(doc) {
    var props = {};
    
    // MINIMAL MODE: Only the most essential, safest properties
    var minimalProps = [
        'name', 'saved', 'modified', 'visible', 'id'
        // NOTE: NO nested properties, NO complex paths
        // This is minimal mode - ultra-safe property access only
    ];
    
    enhancedStatusLog("MINIMAL_PROPS", "Exploring minimal properties", 0, minimalProps.length, 
        "Testing " + minimalProps.length + " essential properties");
    
    for (var i = 0; i < minimalProps.length; i++) {
        var prop = minimalProps[i];
        
        try {
            enhancedStatusLog("MINIMAL_PROPS", "Testing " + prop, i + 1, minimalProps.length, 
                "Safe property access");
            
            var propResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(doc, prop);
            }, ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.minimal.propertyAccess);
            
            if (!propResult.bailout && propResult.result !== null && propResult.result !== undefined) {
                props[prop] = {
                    value: String(propResult.result),
                    type: typeof propResult.result,
                    accessible: true,
                    responseTime: propResult.duration
                };
                enhancedStatusLog("MINIMAL_PROPS", prop + " accessible", i + 1, minimalProps.length, 
                    "Value: " + String(propResult.result).substring(0, 20));
            } else {
                props[prop] = {
                    accessible: false,
                    reason: propResult.bailout ? "Timeout in minimal mode" : "Property returned null/undefined",
                    responseTime: propResult.duration
                };
                enhancedStatusLog("MINIMAL_PROPS", prop + " not accessible", i + 1, minimalProps.length, 
                    "Reason: " + (propResult.bailout ? "timeout" : "null result"));
            }
            
        } catch (exc) {
            props[prop] = {
                accessible: false,
                error: exc.message,
                reason: "Property access threw exception"
            };
            enhancedStatusLog("MINIMAL_PROPS", prop + " failed", i + 1, minimalProps.length, 
                "Error: " + exc.message);
        }
    }
    
    return props;
}

// Explore collection sizes with minimal mode safety - FIXED TO PREVENT HANGING
function exploreMinimalCollectionSizes(doc, preTestResults) {
    var collections = {};
    
    // Only process collections that passed pre-testing
    var safeCollections = preTestResults.safe || [];
    
    enhancedStatusLog("MINIMAL_COLL", "Exploring safe collections", 0, safeCollections.length, 
        "Processing " + safeCollections.length + " pre-tested safe collections");
    
    if (safeCollections.length === 0) {
        enhancedStatusLog("MINIMAL_COLL", "No safe collections", 0, 1, "All collections failed pre-test");
        return {
            note: "No collections passed safety pre-testing in minimal mode",
            recommendation: "Use emergency mode for this document"
        };
    }
    
    for (var i = 0; i < safeCollections.length; i++) {
        var collName = safeCollections[i];
        
        try {
            enhancedStatusLog("MINIMAL_COLL", "Processing " + collName, i + 1, safeCollections.length, 
                "Safe collection size check");
            
            var collection = progressiveCollectionAccess(doc, collName, "minimal");
            
            if (collection) {
                var size = emergencyGetLength(collection, 
                    ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.minimal.collectionAccess);
                
                collections[collName] = {
                    size: size,
                    accessible: true,
                    hasItems: size > 0,
                    safetyLevel: "pre_tested_safe",
                    mode: "minimal"
                };
                enhancedStatusLog("MINIMAL_COLL", collName + " processed", i + 1, safeCollections.length, 
                    "Size: " + size + " items");
            } else {
                collections[collName] = {
                    accessible: false,
                    reason: "Progressive access denied for minimal mode",
                    mode: "minimal"
                };
                enhancedStatusLog("MINIMAL_COLL", collName + " denied", i + 1, safeCollections.length, 
                    "Access denied by progressive safety system");
            }
            
        } catch (exc) {
            collections[collName] = {
                accessible: false,
                error: exc.message,
                mode: "minimal"
            };
            enhancedStatusLog("MINIMAL_COLL", collName + " failed", i + 1, safeCollections.length, 
                "Error: " + exc.message);
        }
    }
    
    return collections;
}

// Test property access with minimal mode constraints
function testMinimalPropertyAccess(doc) {
    var result = {
        accessible: [],
        failed: []
    };
    
    // Test only basic, essential property paths in minimal mode
    // NO complex nested paths that might cause hanging
    var testPaths = [
        'name',
        'saved',
        'visible',
        'id'
        // NOTE: NO viewPreferences, NO documentPreferences, NO nested paths
        // Minimal mode = minimal risk
    ];
    
    enhancedStatusLog("MINIMAL_ACCESS", "Testing minimal property access", 0, testPaths.length, 
        "Testing " + testPaths.length + " basic property paths");
    
    for (var i = 0; i < testPaths.length; i++) {
        var path = testPaths[i];
        
        try {
            enhancedStatusLog("MINIMAL_ACCESS", "Testing " + path, i + 1, testPaths.length, 
                "Safe property path test");
            
            var testResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(doc, path);
            }, ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.minimal.propertyAccess);
            
            if (!testResult.bailout && testResult.result !== null && testResult.result !== undefined) {
                result.accessible.push({
                    path: path,
                    type: typeof testResult.result,
                    preview: String(testResult.result).substring(0, 30),
                    responseTime: testResult.duration,
                    mode: "minimal"
                });
                enhancedStatusLog("MINIMAL_ACCESS", path + " accessible", i + 1, testPaths.length, 
                    "Response time: " + testResult.duration + "ms");
            } else {
                result.failed.push({
                    path: path,
                    reason: testResult.bailout ? "Timeout in minimal mode" : "Returned null/undefined",
                    responseTime: testResult.duration,
                    mode: "minimal"
                });
                enhancedStatusLog("MINIMAL_ACCESS", path + " failed", i + 1, testPaths.length, 
                    "Reason: " + (testResult.bailout ? "timeout" : "null result"));
            }
            
        } catch (exc) {
            result.failed.push({
                path: path,
                reason: exc.message,
                mode: "minimal"
            });
            enhancedStatusLog("MINIMAL_ACCESS", path + " exception", i + 1, testPaths.length, 
                "Error: " + exc.message);
        }
    }
    
    return result;
}

// Minimal document validation - ultra-safe validation for minimal mode
function minimalDocumentValidation(doc) {
    var validation = {
        isValid: false,
        mode: "minimal",
        errors: [],
        warnings: [],
        basicAccessible: false,
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        enhancedStatusLog("MINIMAL_VAL", "Starting minimal validation", 0, 3, "Ultra-safe document validation");
        
        // Test 1: Document exists
        if (!doc) {
            validation.errors.push("Document object is null or undefined");
            return validation;
        }
        
        // Test 2: Basic accessibility with emergency timeout
        enhancedStatusLog("MINIMAL_VAL", "Testing basic accessibility", 1, 3, "Emergency-level property test");
        
        var nameResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(doc, 'name');
        }, EMERGENCY_TIMEOUTS.PROPERTY_ACCESS);
        
        if (!nameResult.bailout && nameResult.result) {
            validation.basicAccessible = true;
            enhancedStatusLog("MINIMAL_VAL", "Basic access confirmed", 2, 3, "Document name: " + nameResult.result);
        } else {
            validation.warnings.push("Document name not accessible - may be problematic");
        }
        
        // Test 3: Final validation for minimal mode
        enhancedStatusLog("MINIMAL_VAL", "Completing minimal validation", 3, 3, "Determining minimal mode suitability");
        
        if (validation.basicAccessible) {
            validation.isValid = true;
            enhancedStatusLog("MINIMAL_VAL", "Minimal validation PASSED", 3, 3, "Document suitable for minimal analysis");
        } else {
            validation.errors.push("Document not suitable for minimal mode - use emergency mode");
            enhancedStatusLog("MINIMAL_VAL", "Minimal validation FAILED", 3, 3, "Recommend emergency mode");
        }
        
    } catch (exc) {
        validation.errors.push("Minimal validation failed: " + exc.message);
        enhancedStatusLog("MINIMAL_VAL", "Minimal validation exception", 3, 3, "Error: " + exc.message);
    }
    
    validation.processingTime = new Date().getTime() - startTime;
    return validation;
}

// ============================================================================
// BASIC MODE: SAFE DOCUMENT ANALYSIS WITH MODERATE COLLECTIONS
// ============================================================================

function createBasicDocumentReport(doc) {
    enhancedStatusLog("BASIC", "Starting basic document analysis", 0, 12, "Safe analysis with moderate collections");
    
    // Validate document state first with mode-appropriate validation
    var validation = validateDocumentState(doc);
    if (!validation.isValid) {
        enhancedStatusLog("BASIC", "Document validation failed", 1, 12, "Falling back to minimal mode");
        return createMinimalPropertyDump(doc);
    }
    
    var report = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk-basic",
        mode: "BASIC_SAFE_ANALYSIS",
        safetyLevel: "moderate_safety",
        validationResults: validation,
        processingTime: 0,
        errors: [],
        warnings: []
    };
    
    var startTime = new Date().getTime();
    var basicTimeout = ENHANCED_ANALYSIS_CONFIG.modes.basic.timeout;
    
    try {
        // Step 1: Pre-test collections for basic mode
        enhancedStatusLog("BASIC", "Pre-testing basic collections", 2, 12, "Testing safe and moderate collections");
        report.preTestResults = preTestBasicCollections(doc);
        
        // Step 2: Essential document info (with bailout)
        enhancedStatusLog("BASIC", "Getting document info", 4, 12, "Essential document properties");
        report.documentInfo = emergencyAnalyzeSection("documentInfo", function() {
            return getBasicDocumentInfo(doc);
        }, basicTimeout / 4, 4, 12);
        
        // Step 3: Page info with collection pre-testing
        enhancedStatusLog("BASIC", "Analyzing pages", 6, 12, "Page count and basic properties");
        report.pageInfo = emergencyAnalyzeSection("pageInfo", function() {
            return getBasicPageInfo(doc, report.preTestResults);
        }, basicTimeout / 4, 6, 12);
        
        // Step 4: Text frame info (count only, no content)
        enhancedStatusLog("BASIC", "Analyzing text frames", 8, 12, "Text frame count and basic properties");
        report.textInfo = emergencyAnalyzeSection("textInfo", function() {
            return getBasicTextInfo(doc, report.preTestResults);
        }, basicTimeout / 4, 8, 12);
        
        // Step 5: Layer info with safety checks
        enhancedStatusLog("BASIC", "Analyzing layers", 10, 12, "Layer count and properties");
        report.layerInfo = emergencyAnalyzeSection("layerInfo", function() {
            return getBasicLayerInfo(doc, report.preTestResults);
        }, basicTimeout / 4, 10, 12);
        
        report.processingTime = new Date().getTime() - startTime;
        
        enhancedStatusLog("BASIC", "Basic analysis completed", 12, 12, 
            "Completed in " + report.processingTime + "ms");
        
        // Check processing time against basic mode limits
        if (report.processingTime > basicTimeout) {
            report.warnings.push("Basic analysis exceeded timeout (" + report.processingTime + "ms) - consider minimal mode");
        }
        
    } catch (exc) {
        report.errors.push("Basic analysis failed: " + exc.message);
        report.processingTime = new Date().getTime() - startTime;
        enhancedStatusLog("BASIC", "Basic analysis failed", 12, 12, "Error: " + exc.message);
    }
    
    return report;
}

// Pre-test collections for basic mode
function preTestBasicCollections(doc) {
    var basicCollections = createModeFilteredCollectionList("basic");
    var testResults = {
        tested: [],
        safe: [],
        unsafe: [],
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    enhancedStatusLog("BASIC_PRETEST", "Testing basic collections", 0, basicCollections.length, 
        "Pre-testing " + basicCollections.length + " collections");
    
    for (var i = 0; i < basicCollections.length; i++) {
        var collName = basicCollections[i];
        
        try {
            var testResult = testCollectionSafety(doc, collName, 
                ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.basic.collectionAccess / 4);
            
            testResults.tested.push({
                name: collName,
                result: testResult
            });
            
            if (testResult.safety === "safe" || testResult.safety === "moderate") {
                testResults.safe.push(collName);
                enhancedStatusLog("BASIC_PRETEST", collName + " is accessible", i + 1, basicCollections.length, 
                    "Safety: " + testResult.safety);
            } else {
                testResults.unsafe.push(collName);
                enhancedStatusLog("BASIC_PRETEST", collName + " is not safe", i + 1, basicCollections.length, 
                    "Safety: " + testResult.safety);
            }
            
        } catch (exc) {
            testResults.unsafe.push(collName);
            enhancedStatusLog("BASIC_PRETEST", collName + " test failed", i + 1, basicCollections.length, 
                "Error: " + exc.message);
        }
    }
    
    testResults.processingTime = new Date().getTime() - startTime;
    return testResults;
}

// Emergency section analyzer with integrated bailouts - ENHANCED VERSION
function emergencyAnalyzeSection(sectionName, analyzeFunction, timeoutMs, step, totalSteps) {
    var startTime = new Date().getTime();
    var currentMode = getCurrentAnalysisMode();
    var timeout = timeoutMs || ENHANCED_ANALYSIS_CONFIG.modes[currentMode].timeout / 4;
    
    enhancedStatusLog("EMERGENCY_SECTION", "Analyzing " + sectionName, step, totalSteps, 
        "Emergency timeout: " + timeout + "ms (" + currentMode + " mode)");
    
    try {
        var result = emergencyBailoutHandler(analyzeFunction, timeout);
        
        if (result.bailout) {
            enhancedStatusLog("EMERGENCY_SECTION", sectionName + " BAILOUT", step, totalSteps, 
                "Emergency bailout after " + result.duration + "ms");
            
            return {
                emergencyBailout: true,
                sectionName: sectionName,
                error: result.error || "Emergency timeout",
                duration: result.duration,
                timeoutMs: timeout,
                mode: currentMode,
                recommendation: "Section caused timeout in " + currentMode + " mode - try lower mode"
            };
        } else {
            enhancedStatusLog("EMERGENCY_SECTION", sectionName + " completed", step, totalSteps, 
                "Success in " + result.duration + "ms");
            return result.result;
        }
        
    } catch (exc) {
        var duration = new Date().getTime() - startTime;
        enhancedStatusLog("EMERGENCY_SECTION", sectionName + " FAILED", step, totalSteps, 
            "Exception after " + duration + "ms: " + exc.message);
        
        return {
            emergencyBailout: true,
            sectionName: sectionName,
            error: exc.message,
            duration: duration,
            timeoutMs: timeout,
            mode: currentMode,
            recommendation: "Section failed in " + currentMode + " mode - analysis error"
        };
    }
}

// ============================================================================
// BASIC ANALYSIS FUNCTIONS - MODE-AWARE AND SAFE
// ============================================================================

function getBasicDocumentInfo(doc) {
    enhancedStatusLog("BASIC_DOC", "Getting basic document info", 0, 1, "Essential properties with mode safety");
    
    var currentMode = getCurrentAnalysisMode();
    var propertyTimeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[currentMode].propertyAccess;
    
    var info = {
        mode: currentMode,
        safetyLevel: "mode_appropriate"
    };
    
    // Get properties with mode-appropriate timeouts
    var nameResult = emergencyBailoutHandler(function() {
        return emergencyGetProperty(doc, 'name', 'Unknown');
    }, propertyTimeout);
    
    var savedResult = emergencyBailoutHandler(function() {
        return emergencyGetProperty(doc, 'saved', false);
    }, propertyTimeout);
    
    var modifiedResult = emergencyBailoutHandler(function() {
        return emergencyGetProperty(doc, 'modified', false);
    }, propertyTimeout);
    
    // Build info object with bailout protection
    info.name = nameResult.bailout ? 'Unknown (timeout)' : nameResult.result;
    info.saved = savedResult.bailout ? false : savedResult.result;
    info.modified = modifiedResult.bailout ? false : modifiedResult.result;
    info.readonly = false; // Skip risky properties in basic mode
    info.visible = true;   // Assume visible if we can't check safely
    
    // File path only in higher modes
    if (currentMode === "standard" || currentMode === "comprehensive") {
        var pathResult = emergencyBailoutHandler(function() {
            var path = emergencyGetProperty(doc, 'filePath');
            return path ? path.toString() : null;
        }, propertyTimeout);
        
        info.filePath = pathResult.bailout ? null : pathResult.result;
    } else {
        info.filePath = null; // Skip in basic/minimal modes for safety
    }
    
    info.analysisMode = currentMode;
    info.limitedAnalysis = currentMode !== "comprehensive";
    
    return info;
}

function getBasicPageInfo(doc, preTestResults) {
    enhancedStatusLog("BASIC_PAGES", "Getting page info", 0, 1, "Page count with safety checks");
    
    var pageInfo = {
        mode: getCurrentAnalysisMode(),
        analysisType: "basic_safe"
    };
    
    // Only access pages collection if it passed pre-testing
    if (preTestResults && arrayIndexOf(preTestResults.safe, 'pages') !== -1) {
        var pages = progressiveCollectionAccess(doc, 'pages', getCurrentAnalysisMode());
        pageInfo.totalPages = pages ? emergencyGetLength(pages, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[getCurrentAnalysisMode()].collectionAccess) : 0;
        pageInfo.accessible = true;
        enhancedStatusLog("BASIC_PAGES", "Pages accessible", 1, 1, "Count: " + pageInfo.totalPages);
    } else {
        pageInfo.totalPages = 0;
        pageInfo.accessible = false;
        pageInfo.reason = "Pages collection failed pre-testing";
        enhancedStatusLog("BASIC_PAGES", "Pages not accessible", 1, 1, "Failed pre-test");
    }
    
    pageInfo.note = "Page count only - no detailed page analysis in " + getCurrentAnalysisMode() + " mode";
    return pageInfo;
}

function getBasicTextInfo(doc, preTestResults) {
    enhancedStatusLog("BASIC_TEXT", "Getting text info", 0, 2, "Text frame and story counts");
    
    var textInfo = {
        mode: getCurrentAnalysisMode(),
        analysisType: "basic_safe"
    };
    
    // TextFrames collection
    if (preTestResults && arrayIndexOf(preTestResults.safe, 'textFrames') !== -1) {
        var textFrames = progressiveCollectionAccess(doc, 'textFrames', getCurrentAnalysisMode());
        textInfo.totalTextFrames = textFrames ? emergencyGetLength(textFrames, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[getCurrentAnalysisMode()].collectionAccess) : 0;
        textInfo.textFramesAccessible = true;
        enhancedStatusLog("BASIC_TEXT", "TextFrames accessible", 1, 2, "Count: " + textInfo.totalTextFrames);
    } else {
        textInfo.totalTextFrames = 0;
        textInfo.textFramesAccessible = false;
        textInfo.textFramesReason = "TextFrames collection failed pre-testing";
    }
    
    // Stories collection (if available in basic mode)
    var currentMode = getCurrentAnalysisMode();
    var basicCollections = createModeFilteredCollectionList(currentMode);
    
    if (arrayIndexOf(basicCollections, 'stories') !== -1 && 
        preTestResults && arrayIndexOf(preTestResults.safe, 'stories') !== -1) {
        var stories = progressiveCollectionAccess(doc, 'stories', currentMode);
        textInfo.totalStories = stories ? emergencyGetLength(stories, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[currentMode].collectionAccess) : 0;
        textInfo.storiesAccessible = true;
        enhancedStatusLog("BASIC_TEXT", "Stories accessible", 2, 2, "Count: " + textInfo.totalStories);
    } else {
        textInfo.totalStories = 0;
        textInfo.storiesAccessible = false;
        textInfo.storiesReason = "Stories not available in " + currentMode + " mode or failed pre-testing";
    }
    
    textInfo.note = "Text frame and story counts only - no content analysis in " + currentMode + " mode";
    return textInfo;
}

function getBasicLayerInfo(doc, preTestResults) {
    enhancedStatusLog("BASIC_LAYERS", "Getting layer info", 0, 1, "Layer count with safety");
    
    var layerInfo = {
        mode: getCurrentAnalysisMode(),
        analysisType: "basic_safe"
    };
    
    // Layers collection
    if (preTestResults && arrayIndexOf(preTestResults.safe, 'layers') !== -1) {
        var layers = progressiveCollectionAccess(doc, 'layers', getCurrentAnalysisMode());
        layerInfo.totalLayers = layers ? emergencyGetLength(layers, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[getCurrentAnalysisMode()].collectionAccess) : 0;
        layerInfo.accessible = true;
        enhancedStatusLog("BASIC_LAYERS", "Layers accessible", 1, 1, "Count: " + layerInfo.totalLayers);
    } else {
        layerInfo.totalLayers = 0;
        layerInfo.accessible = false;
        layerInfo.reason = "Layers collection failed pre-testing";
        enhancedStatusLog("BASIC_LAYERS", "Layers not accessible", 1, 1, "Failed pre-test");
    }
    
    layerInfo.note = "Layer count only - no detailed layer analysis in " + getCurrentAnalysisMode() + " mode";
    return layerInfo;
}