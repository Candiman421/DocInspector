//
// Enhanced InDesign Document Inspector & Comparison Tool v2.1 - ESTK Optimized Edition  
// Robust property change detection with API error handling
// Chunk 1: Enhanced Configuration & Utility Functions - COMPREHENSIVE ARCHITECTURE FIX
// Optimized for ExtendScript Toolkit (ESTK) development environment
// ES3 COMPATIBLE VERSION
//

// ============================================================================
// ENHANCED CONFIGURATION SYSTEM - COMPLETE OVERHAUL FOR MODE-BASED SAFETY
// ============================================================================

// ENHANCED ANALYSIS CONFIGURATION - COMPLETE ARCHITECTURAL OVERHAUL
var ENHANCED_ANALYSIS_CONFIG = {
    version: "2.1-estk-enhanced",
    
    // MODE-BASED SAFETY SYSTEM
    modes: {
        emergency: {
            description: "Ultra-safe mode for broken documents",
            timeout: 500,
            collections: [],  // NO collection access
            memoryLimit: 1048576,  // 1MB
            reportComplexity: "minimal",
            propertyTesting: "emergency_only"
        },
        minimal: {
            description: "Basic safe mode with limited collection access",
            timeout: 1000,
            collections: ["pages"],  // Only safest collection
            memoryLimit: 2097152,  // 2MB
            reportComplexity: "basic",
            propertyTesting: "safe_only"
        },
        basic: {
            description: "Moderate mode with safe collections",
            timeout: 3000,
            collections: ["pages", "textFrames", "layers"],
            memoryLimit: 4194304,  // 4MB
            reportComplexity: "structured",
            propertyTesting: "safe_and_moderate"
        },
        standard: {
            description: "Balanced mode with content sampling",
            timeout: 8000,
            collections: ["pages", "textFrames", "layers", "stories"],
            memoryLimit: 8388608,  // 8MB
            reportComplexity: "detailed",
            propertyTesting: "comprehensive_safe"
        },
        comprehensive: {
            description: "Complete analysis with pre-tested risky collections",
            timeout: 15000,
            collections: ["pages", "textFrames", "layers", "stories", "styles", "colors", "fonts", "images", "links", "pageItems"],
            memoryLimit: 16777216,  // 16MB
            reportComplexity: "full",
            propertyTesting: "all_with_pretesting"
        }
    },
    
    // COLLECTION SAFETY MATRIX - CRITICAL FOR PROGRESSIVE ACCESS
    collectionSafety: {
        "pages": "safe",           // Reliable access
        "textFrames": "safe",      // Usually reliable
        "layers": "safe",          // Generally safe
        "stories": "moderate",     // Can be slow but usually works
        "styles": "moderate",      // Generally reliable
        "colors": "moderate",      // Usually works
        "fonts": "moderate",       // Can have issues with missing fonts
        "pageItems": "risky",      // Can be slow, complex hierarchy
        "images": "dangerous",     // Frequently causes hanging
        "links": "dangerous"       // Frequently causes hanging
    },
    
    // PROGRESSIVE TIMEOUT SYSTEM
    progressiveTimeouts: {
        emergency: {
            propertyAccess: 50,      // 50ms max per property
            collectionAccess: 0,     // No collection access
            totalOperation: 500      // 500ms total
        },
        minimal: {
            propertyAccess: 100,
            collectionAccess: 200,
            totalOperation: 1000
        },
        basic: {
            propertyAccess: 200,
            collectionAccess: 500,
            totalOperation: 3000
        },
        standard: {
            propertyAccess: 500,
            collectionAccess: 1000,
            totalOperation: 8000
        },
        comprehensive: {
            propertyAccess: 1000,
            collectionAccess: 2000,
            totalOperation: 15000
        }
    },
    
    // DOCUMENT CAPABILITY TESTING PARAMETERS
    capabilityTesting: {
        enablePreTesting: true,
        collectionTestTimeout: 100,     // 100ms to test if collection is accessible
        propertyTestTimeout: 50,        // 50ms to test if property exists
        maxTestRetries: 2,
        testSampleSize: 3               // Test first 3 items in collections
    },
    
    // MEMORY MANAGEMENT CONFIGURATION
    memoryManagement: {
        enableActiveCleanup: true,
        cleanupFrequency: 5,            // Every 5 operations
        gcHint: true,                   // Call $.gc() when available
        stringBufferSize: 1000,         // For ES3 optimized string building
        maxReportSize: {
            emergency: 524288,          // 512KB
            minimal: 1048576,           // 1MB
            basic: 2097152,             // 2MB
            standard: 4194304,          // 4MB
            comprehensive: 8388608      // 8MB
        }
    },
    
    // ENHANCED ERROR HANDLING
    errorHandling: {
        enableRetryLogic: true,
        maxRetries: 3,
        retryDelay: 100,                // ms between retries
        enableGracefulDegradation: true,
        enableModeDowngrade: true,
        logErrors: true,
        maxErrorsPerSection: 10
    },
    
    // ANALYSIS STATE MANAGEMENT
    stateManagement: {
        preventConcurrent: true,
        enableProgressTracking: true,
        enableSessionPersistence: false,  // Disabled for simplicity
        maxSessionDuration: 60000         // 60 seconds max
    },
    
    // ESTK DEBUGGING CONFIGURATION
    debugging: {
        enableESTKDebugging: true,
        debugPrefix: "[Enhanced Inspector]",
        verboseLogging: true,
        performanceMonitoring: true
    },
    
    // RUNTIME STATE
    runtime: {
        currentMode: "basic",
        currentDocument: null,
        analysisInProgress: false,
        sessionStartTime: null,
        errors: [],
        discoveredAlternatives: {},
        documentCapabilities: null
    }
};

// MODE HIERARCHY FOR PROGRESSIVE SAFETY
var MODE_HIERARCHY = ["emergency", "minimal", "basic", "standard", "comprehensive"];

// COLLECTION RISK LEVELS - ORGANIZED BY SAFETY
var COLLECTION_RISK_LEVELS = {
    safe: ["pages", "textFrames", "layers"],
    moderate: ["stories", "styles", "colors", "fonts"],
    risky: ["pageItems"],
    dangerous: ["images", "links"]
};

// EMERGENCY TIMEOUTS FOR ULTRA-FAST BAILOUTS
var EMERGENCY_TIMEOUTS = {
    PROPERTY_ACCESS: 50,     // 50ms max for any property access
    COLLECTION_TEST: 100,    // 100ms max to test collection existence
    TOTAL_EMERGENCY: 500     // 500ms max for entire emergency operation
};

// Legacy configuration for backwards compatibility
var ANALYSIS_CONFIG = ENHANCED_ANALYSIS_CONFIG;
var UTILITY_CONFIG = {
    version: "2.1-estk-enhanced",
    requiredInspectorVersion: "2.1-estk-enhanced", 
    enableProgressDialogs: true,
    maxReportFileSize: 10000000,
    autoSaveReports: true,
    createBackups: true,
    enableESTKDebugging: true
};

// Global state
var UTILITY_STATE = {
    lastAnalysisReport: null,
    lastComparisonResult: null,
    currentDocument: null,
    reportFiles: {},
    analysisSession: null
};

// ============================================================================
// DOCUMENT CAPABILITY DETECTION SYSTEM - NEW CORE FUNCTIONALITY
// ============================================================================

// Detect document capabilities and build safety matrix
function detectDocumentCapabilities(doc) {
    enhancedStatusLog("CAPABILITY", "Starting document capability detection", 0, 10, "Testing document safety");
    
    var capabilities = {
        timestamp: toISOString(new Date()),
        documentName: safeGetProperty(doc, 'name', 'unknown'),
        overallSafety: "unknown",
        collectionSafety: {},
        propertySafety: {},
        recommendedMode: "emergency",
        testResults: {
            basicProperties: false,
            collectionAccess: false,
            advancedProperties: false
        },
        errors: []
    };
    
    try {
        // Test 1: Basic document properties
        enhancedStatusLog("CAPABILITY", "Testing basic properties", 1, 10, "Document name, saved status");
        capabilities.testResults.basicProperties = testBasicDocumentProperties(doc, capabilities);
        
        // Test 2: Safe collection access
        enhancedStatusLog("CAPABILITY", "Testing safe collections", 3, 10, "Pages, textFrames, layers");
        capabilities.testResults.collectionAccess = testSafeCollections(doc, capabilities);
        
        // Test 3: Moderate risk collections
        enhancedStatusLog("CAPABILITY", "Testing moderate collections", 5, 10, "Stories, styles, fonts");
        testModerateCollections(doc, capabilities);
        
        // Test 4: Risky collections (with caution)
        enhancedStatusLog("CAPABILITY", "Testing risky collections", 7, 10, "PageItems (with timeout)");
        testRiskyCollections(doc, capabilities);
        
        // Test 5: Dangerous collections (minimal testing)
        enhancedStatusLog("CAPABILITY", "Testing dangerous collections", 8, 10, "Images, links (quick test)");
        testDangerousCollections(doc, capabilities);
        
        // Determine overall safety and recommended mode
        enhancedStatusLog("CAPABILITY", "Analyzing results", 9, 10, "Determining recommended mode");
        determineDocumentSafetyLevel(capabilities);
        
        enhancedStatusLog("CAPABILITY", "Capability detection completed", 10, 10, 
            "Recommended mode: " + capabilities.recommendedMode);
        
    } catch (exc) {
        capabilities.errors.push("Capability detection failed: " + exc.message);
        capabilities.overallSafety = "dangerous";
        capabilities.recommendedMode = "emergency";
        enhancedStatusLog("CAPABILITY", "Detection failed", 10, 10, "Error: " + exc.message);
    }
    
    return capabilities;
}

// Test basic document properties for accessibility
function testBasicDocumentProperties(doc, capabilities) {
    var basicProps = ['name', 'saved', 'modified', 'visible'];
    var successCount = 0;
    
    for (var i = 0; i < basicProps.length; i++) {
        var prop = basicProps[i];
        try {
            var startTime = new Date().getTime();
            var value = emergencyGetProperty(doc, prop);
            var duration = new Date().getTime() - startTime;
            
            if (value !== null && duration < EMERGENCY_TIMEOUTS.PROPERTY_ACCESS) {
                capabilities.propertySafety[prop] = "safe";
                successCount++;
            } else {
                capabilities.propertySafety[prop] = "slow";
            }
        } catch (exc) {
            capabilities.propertySafety[prop] = "failed";
            capabilities.errors.push("Property test failed: " + prop + " - " + exc.message);
        }
    }
    
    return successCount >= 3; // At least 3 basic properties should work
}

// Test safe collections for basic accessibility
function testSafeCollections(doc, capabilities) {
    var safeCollections = COLLECTION_RISK_LEVELS.safe;
    var successCount = 0;
    
    for (var i = 0; i < safeCollections.length; i++) {
        var collName = safeCollections[i];
        var result = testCollectionSafety(doc, collName, ENHANCED_ANALYSIS_CONFIG.capabilityTesting.collectionTestTimeout);
        
        capabilities.collectionSafety[collName] = result.safety;
        if (result.safety === "safe") {
            successCount++;
        }
        
        if (result.error) {
            capabilities.errors.push("Safe collection test failed: " + collName + " - " + result.error);
        }
    }
    
    return successCount >= 2; // At least 2 safe collections should work
}

// Test moderate risk collections
function testModerateCollections(doc, capabilities) {
    var moderateCollections = COLLECTION_RISK_LEVELS.moderate;
    
    for (var i = 0; i < moderateCollections.length; i++) {
        var collName = moderateCollections[i];
        var result = testCollectionSafety(doc, collName, ENHANCED_ANALYSIS_CONFIG.capabilityTesting.collectionTestTimeout * 2);
        
        capabilities.collectionSafety[collName] = result.safety;
        if (result.error) {
            capabilities.errors.push("Moderate collection test: " + collName + " - " + result.error);
        }
    }
}

// Test risky collections with enhanced caution
function testRiskyCollections(doc, capabilities) {
    var riskyCollections = COLLECTION_RISK_LEVELS.risky;
    
    for (var i = 0; i < riskyCollections.length; i++) {
        var collName = riskyCollections[i];
        var result = testCollectionSafety(doc, collName, ENHANCED_ANALYSIS_CONFIG.capabilityTesting.collectionTestTimeout);
        
        capabilities.collectionSafety[collName] = result.safety;
        if (result.error) {
            capabilities.errors.push("Risky collection test: " + collName + " - " + result.error);
        }
    }
}

// Test dangerous collections with minimal testing
function testDangerousCollections(doc, capabilities) {
    var dangerousCollections = COLLECTION_RISK_LEVELS.dangerous;
    
    for (var i = 0; i < dangerousCollections.length; i++) {
        var collName = dangerousCollections[i];
        // Very quick test for dangerous collections
        var result = testCollectionSafety(doc, collName, 50); // Only 50ms test
        
        capabilities.collectionSafety[collName] = result.safety;
        if (result.error) {
            capabilities.errors.push("Dangerous collection test: " + collName + " - " + result.error);
        }
    }
}

// Test individual collection safety with timeout protection
function testCollectionSafety(doc, collectionName, timeoutMs) {
    var result = {
        collectionName: collectionName,
        safety: "unknown",
        accessible: false,
        length: 0,
        duration: 0,
        error: null
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Test 1: Can we get the collection reference?
        var collection = emergencyGetProperty(doc, collectionName);
        
        if (!collection) {
            result.safety = "failed";
            result.error = "Collection not found";
            return result;
        }
        
        result.accessible = true;
        
        // Test 2: Can we get the length safely?
        var lengthTestStart = new Date().getTime();
        var collectionLength = emergencyGetLength(collection, timeoutMs);
        var lengthDuration = new Date().getTime() - lengthTestStart;
        
        if (lengthDuration > timeoutMs) {
            result.safety = "timeout";
            result.error = "Length access timed out (" + lengthDuration + "ms)";
            return result;
        }
        
        result.length = collectionLength;
        result.duration = new Date().getTime() - startTime;
        
        // Determine safety based on performance
        if (result.duration < timeoutMs / 4) {
            result.safety = "safe";
        } else if (result.duration < timeoutMs / 2) {
            result.safety = "moderate";
        } else if (result.duration < timeoutMs) {
            result.safety = "slow";
        } else {
            result.safety = "timeout";
        }
        
    } catch (exc) {
        result.duration = new Date().getTime() - startTime;
        result.safety = "failed";
        result.error = exc.message;
    }
    
    return result;
}

// Determine overall document safety level and recommend mode
function determineDocumentSafetyLevel(capabilities) {
    var safeCollectionCount = 0;
    var moderateCollectionCount = 0;
    var failedCollectionCount = 0;
    
    // Count collection safety levels
    for (var collName in capabilities.collectionSafety) {
        var safety = capabilities.collectionSafety[collName];
        if (safety === "safe") {
            safeCollectionCount++;
        } else if (safety === "moderate" || safety === "slow") {
            moderateCollectionCount++;
        } else {
            failedCollectionCount++;
        }
    }
    
    // Determine overall safety and recommend mode
    if (!capabilities.testResults.basicProperties) {
        capabilities.overallSafety = "dangerous";
        capabilities.recommendedMode = "emergency";
    } else if (safeCollectionCount === 0) {
        capabilities.overallSafety = "risky";
        capabilities.recommendedMode = "emergency";
    } else if (safeCollectionCount >= 2 && failedCollectionCount <= 1) {
        capabilities.overallSafety = "safe";
        if (moderateCollectionCount >= 3) {
            capabilities.recommendedMode = "comprehensive";
        } else if (moderateCollectionCount >= 2) {
            capabilities.recommendedMode = "standard";
        } else {
            capabilities.recommendedMode = "basic";
        }
    } else if (safeCollectionCount >= 1) {
        capabilities.overallSafety = "moderate";
        capabilities.recommendedMode = "basic";
    } else {
        capabilities.overallSafety = "risky";
        capabilities.recommendedMode = "minimal";
    }
}

// Recommend safe mode based on document capabilities
function recommendSafeMode(doc) {
    try {
        var capabilities = detectDocumentCapabilities(doc);
        return capabilities.recommendedMode;
    } catch (exc) {
        debugLog("Mode recommendation failed: " + exc.message, "ERROR");
        return "emergency"; // Safest fallback
    }
}

// ============================================================================
// ENHANCED SAFE PROPERTY ACCESS SYSTEM
// ============================================================================

// Emergency property access with ultra-fast timeout
function emergencyGetProperty(obj, prop, fallback) {
    var startTime = new Date().getTime();
    
    try {
        if (!obj) {
            return fallback !== undefined ? fallback : null;
        }
        
        // Ultra-fast timeout check
        if (new Date().getTime() - startTime > EMERGENCY_TIMEOUTS.PROPERTY_ACCESS) {
            return fallback !== undefined ? fallback : null;
        }
        
        // Try direct access first (fastest)
        if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
            var value = obj[prop];
            return value !== undefined ? value : (fallback !== undefined ? fallback : null);
        }
        
        // Fallback access
        if (obj[prop] !== undefined) {
            return obj[prop];
        }
        
        return fallback !== undefined ? fallback : null;
        
    } catch (exc) {
        return fallback !== undefined ? fallback : null;
    }
}

// Emergency length getter with timeout protection
function emergencyGetLength(collection, timeoutMs) {
    var startTime = new Date().getTime();
    var timeout = timeoutMs || EMERGENCY_TIMEOUTS.COLLECTION_TEST;
    
    try {
        if (!collection) return 0;
        
        // Quick timeout check
        if (new Date().getTime() - startTime > timeout) {
            return 0;
        }
        
        // Try length first
        if (typeof collection.length === 'number' && collection.length >= 0) {
            return collection.length;
        }
        
        // Try count as fallback
        if (typeof collection.count === 'number' && collection.count >= 0) {
            return collection.count;
        }
        
        return 0;
        
    } catch (exc) {
        return 0;
    }
}

// Progressive collection access based on mode
function progressiveCollectionAccess(doc, collectionName, mode) {
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    if (!modeConfig) {
        return null; // Invalid mode
    }
    
    // Check if collection is allowed in this mode
    if (arrayIndexOf(modeConfig.collections, collectionName) === -1) {
        debugLog("Collection " + collectionName + " not allowed in " + mode + " mode", "MODE");
        return null;
    }
    
    // Check collection safety level
    var collectionRisk = ENHANCED_ANALYSIS_CONFIG.collectionSafety[collectionName];
    if (!collectionRisk) {
        debugLog("Unknown collection risk level: " + collectionName, "WARN");
        return null;
    }
    
    // Pre-test collection if enabled
    if (ENHANCED_ANALYSIS_CONFIG.capabilityTesting.enablePreTesting) {
        var testResult = testCollectionSafety(doc, collectionName, modeConfig.timeout / 4);
        if (testResult.safety === "failed" || testResult.safety === "timeout") {
            debugLog("Collection pre-test failed: " + collectionName + " - " + testResult.error, "SAFETY");
            return null;
        }
    }
    
    // Access collection with mode-appropriate safety
    try {
        return safeGetProperty(doc, collectionName);
    } catch (exc) {
        debugLog("Progressive collection access failed: " + collectionName + " - " + exc.message, "ERROR");
        return null;
    }
}

// Emergency bailout handler for ultra-fast operations
function emergencyBailoutHandler(operation, maxTime) {
    var startTime = new Date().getTime();
    var timeout = maxTime || EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY;
    
    try {
        var result = operation();
        var duration = new Date().getTime() - startTime;
        
        if (duration > timeout) {
            debugLog("Emergency bailout triggered after " + duration + "ms", "BAILOUT");
            return {
                bailout: true,
                duration: duration,
                timeout: timeout,
                result: null
            };
        }
        
        return {
            bailout: false,
            duration: duration,
            result: result
        };
        
    } catch (exc) {
        var duration = new Date().getTime() - startTime;
        debugLog("Emergency operation failed: " + exc.message, "ERROR");
        return {
            bailout: true,
            duration: duration,
            error: exc.message,
            result: null
        };
    }
}

// ============================================================================
// ANALYSIS STATE MANAGEMENT SYSTEM
// ============================================================================

// Start analysis session with state management
function startAnalysisSession(doc, mode) {
    // Prevent concurrent analysis
    if (ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress) {
        debugLog("Analysis already in progress - preventing concurrent execution", "STATE");
        return false;
    }
    
    ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress = true;
    ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime = new Date().getTime();
    ENHANCED_ANALYSIS_CONFIG.runtime.currentDocument = doc;
    ENHANCED_ANALYSIS_CONFIG.runtime.currentMode = mode;
    ENHANCED_ANALYSIS_CONFIG.runtime.errors = [];
    
    debugLog("Analysis session started - Mode: " + mode, "STATE");
    return true;
}

// Track analysis progress with detailed reporting
function trackAnalysisProgress(section, progress, total, details) {
    if (ENHANCED_ANALYSIS_CONFIG.debugging.enableESTKDebugging) {
        var sessionDuration = new Date().getTime() - ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime;
        var percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
        
        $.writeln("[PROGRESS] [" + sessionDuration + "ms] " + section + " (" + percentage + "%): " + details);
        
        // Check for session timeout
        if (sessionDuration > ENHANCED_ANALYSIS_CONFIG.stateManagement.maxSessionDuration) {
            $.writeln("[WARNING] Analysis session exceeding maximum duration (" + sessionDuration + "ms)");
        }
    }
}

// Prevent concurrent analysis
function preventConcurrentAnalysis(doc) {
    if (!ENHANCED_ANALYSIS_CONFIG.stateManagement.preventConcurrent) {
        return true; // Allow if not configured to prevent
    }
    
    return !ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress;
}

// End analysis session
function endAnalysisSession() {
    var sessionDuration = new Date().getTime() - ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime;
    
    ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress = false;
    ENHANCED_ANALYSIS_CONFIG.runtime.currentDocument = null;
    ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime = null;
    
    debugLog("Analysis session ended - Duration: " + sessionDuration + "ms", "STATE");
    
    // Cleanup memory
    clearLargeObjects();
    
    return sessionDuration;
}

// ============================================================================
// ES3 OPTIMIZED STRING BUILDING SYSTEM
// ============================================================================

// ES3-compatible efficient string builder
function es3OptimizedStringBuilder(initialCapacity) {
    return {
        parts: [],
        capacity: initialCapacity || ENHANCED_ANALYSIS_CONFIG.memoryManagement.stringBufferSize,
        length: 0,
        
        append: function(str) {
            this.parts.push(String(str));
            this.length += str.length;
            
            // Check memory limits
            if (this.length > this.capacity) {
                debugLog("String builder exceeding capacity: " + this.length, "MEMORY");
            }
        },
        
        appendLine: function(str) {
            this.append(str + "\n");
        },
        
        toString: function() {
            var result = this.parts.join("");
            return result;
        },
        
        clear: function() {
            this.parts = [];
            this.length = 0;
        },
        
        getLength: function() {
            return this.length;
        }
    };
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS - UPDATED FOR MODE AWARENESS
// ============================================================================

// Enhanced safeGetProperty with mode awareness
function safeGetProperty(obj, prop, defaultValue) {
    try {
        // Get current mode timeout
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
        var timeouts = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[currentMode];
        var maxTime = timeouts ? timeouts.propertyAccess : 1000;
        
        var startTime = new Date().getTime();
        
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Handle array-like access with bounds checking
        if (typeof prop === 'number') {
            if (obj.length !== undefined && prop >= 0 && prop < obj.length) {
                var value = obj[prop];
                
                // Check timeout
                if (new Date().getTime() - startTime > maxTime) {
                    debugLog("Property access timeout: array[" + prop + "]", "TIMEOUT");
                    return defaultValue !== undefined ? defaultValue : null;
                }
                
                return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
            }
            debugLog("Array index out of bounds: " + prop, "WARN");
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Handle string properties
        if (typeof prop === 'string') {
            // Skip known problematic properties in safer modes
            if (currentMode === "emergency" || currentMode === "minimal") {
                for (var i = 0; i < ANALYSIS_CONFIG.problematicProperties.length; i++) {
                    if (stringIndexOf(prop, ANALYSIS_CONFIG.problematicProperties[i]) !== -1) {
                        debugLog("Skipping problematic property in " + currentMode + " mode: " + prop, "SKIP");
                        return defaultValue !== undefined ? defaultValue : null;
                    }
                }
            }
            
            // Handle dotted paths
            if (stringIndexOf(prop, '.') !== -1) {
                return safeGetNestedProperty(obj, prop, defaultValue);
            }
            
            // Handle simple properties
            return safeGetSimpleProperty(obj, prop, defaultValue);
        }
        
        return defaultValue !== undefined ? defaultValue : null;
    } catch (e) {
        if (ANALYSIS_CONFIG.logErrors) {
            logError("Property access failed: " + prop + " - " + e.message, 'propertyAccess', 'medium');
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Enhanced safeGetLength with mode-based safety
function safeGetLength(collection) {
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var timeouts = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts[currentMode];
    var maxTime = timeouts ? timeouts.collectionAccess : 1000;
    
    return emergencyGetLength(collection, maxTime);
}

// Enhanced memory cleanup with mode awareness
function clearLargeObjects() {
    try {
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
        var memoryConfig = ENHANCED_ANALYSIS_CONFIG.memoryManagement;
        
        debugLog("Clearing large objects - Mode: " + currentMode, "MEMORY");
        
        // Clear mode-specific objects
        ENHANCED_ANALYSIS_CONFIG.runtime.errors = [];
        ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives = {};
        UTILITY_STATE.lastAnalysisReport = null;
        UTILITY_STATE.lastComparisonResult = null;
        
        // Garbage collection hint
        if (memoryConfig.gcHint) {
            try {
                $.gc();
            } catch (gcError) {
                // Ignore GC errors
            }
        }
        
        debugLog("Memory cleanup completed for " + currentMode + " mode", "MEMORY");
    } catch (e) {
        debugLog("Memory cleanup failed: " + e.message, "ERROR");
    }
}

// ============================================================================
// ES3 COMPATIBILITY HELPER FUNCTIONS - ENHANCED
// ============================================================================

// ES3-compatible indexOf function
function arrayIndexOf(array, searchElement) {
    if (!array || !array.length) return -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === searchElement) {
            return i;
        }
    }
    return -1;
}

// ES3-compatible string indexOf function
function stringIndexOf(str, searchValue, fromIndex) {
    if (!str) return -1;
    fromIndex = fromIndex || 0;
    
    for (var i = fromIndex; i < str.length; i++) {
        var match = true;
        for (var j = 0; j < searchValue.length; j++) {
            if (i + j >= str.length || str.charAt(i + j) !== searchValue.charAt(j)) {
                match = false;
                break;
            }
        }
        if (match) return i;
    }
    return -1;
}

// ES3-compatible array filter function
function arrayFilter(array, callback) {
    var result = [];
    if (!array || !array.length) return result;
    
    for (var i = 0; i < array.length; i++) {
        try {
            if (callback(array[i], i, array)) {
                result.push(array[i]);
            }
        } catch (e) {
            // Continue processing other elements
        }
    }
    return result;
}

// ES3-compatible array some function
function arraySome(array, callback) {
    if (!array || !array.length) return false;
    
    for (var i = 0; i < array.length; i++) {
        try {
            if (callback(array[i], i, array)) {
                return true;
            }
        } catch (e) {
            // Continue checking other elements
        }
    }
    return false;
}

// ES3-compatible string trim function
function stringTrim(str) {
    if (!str) return "";
    
    // Remove leading whitespace
    var start = 0;
    while (start < str.length && isWhitespace(str.charAt(start))) {
        start++;
    }
    
    // Remove trailing whitespace
    var end = str.length - 1;
    while (end >= start && isWhitespace(str.charAt(end))) {
        end--;
    }
    
    return str.substring(start, end + 1);
}

// Helper function to check if character is whitespace
function isWhitespace(character) {
    return character === ' ' || character === '\t' || character === '\n' || character === '\r' || character === '\f';
}

// ES3-compatible Date.toISOString function
function toISOString(date) {
    try {
        if (!date) date = new Date();
        
        var year = date.getFullYear();
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var day = ('0' + date.getDate()).slice(-2);
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);
        var seconds = ('0' + date.getSeconds()).slice(-2);
        
        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
    } catch (e) {
        try {
            return date.toString();
        } catch (e2) {
            return "Invalid Date";
        }
    }
}

// ES3-compatible Object.keys function
function objectKeys(obj) {
    var keys = [];
    if (!obj) return keys;
    
    for (var key in obj) {
        if (obj.hasOwnProperty && obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

// Helper function for string repetition
function repeatString(str, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += str;
    }
    return result;
}

// ============================================================================
// ENHANCED PROGRESS REPORTING FUNCTIONS
// ============================================================================

// Enhanced progress reporting with mode awareness
function enhancedStatusLog(section, operation, current, total, details) {
    if (ENHANCED_ANALYSIS_CONFIG.debugging.enableESTKDebugging) {
        var progress = total > 0 ? Math.round((current / total) * 100) : 0;
        var timestamp = new Date().toLocaleTimeString();
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "unknown";
        
        $.writeln("[" + currentMode.toUpperCase() + "] [" + timestamp + "] " + section + " (" + progress + "%): " + operation);
        if (details) {
            $.writeln("  └─ " + details);
        }
        
        // Track progress in state management
        trackAnalysisProgress(section, current, total, operation + " - " + details);
    }
}

// ESTK debugging function
function debugLog(message, category) {
    if (ENHANCED_ANALYSIS_CONFIG.debugging.enableESTKDebugging) {
        var timestamp = new Date().toLocaleTimeString();
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "unknown";
        var logMessage = ENHANCED_ANALYSIS_CONFIG.debugging.debugPrefix + " [" + currentMode + "] [" + timestamp + "] [" + (category || "INFO") + "] " + message;
        $.writeln(logMessage);
    }
}

// ============================================================================
// ENHANCED VALIDATION AND SAFETY FUNCTIONS
// ============================================================================

// Enhanced document validation with mode-appropriate safety
function validateDocumentState(doc) {
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    enhancedStatusLog("VALIDATION", "Starting document validation", 0, 5, "Mode: " + currentMode);
    
    var validation = {
        isValid: false,
        errors: [],
        warnings: [],
        mode: currentMode,
        capabilities: {
            hasBasicProperties: false,
            hasCollections: false,
            hasAdvancedProperties: false
        }
    };
    
    try {
        // Test 1: Basic document object
        enhancedStatusLog("VALIDATION", "Testing basic document object", 1, 5, "Checking if doc exists");
        if (!doc) {
            validation.errors.push("Document object is null or undefined");
            return validation;
        }
        
        // Test 2: Essential properties with emergency access
        enhancedStatusLog("VALIDATION", "Testing essential properties", 2, 5, "Using mode-appropriate safety");
        var docName = emergencyGetProperty(doc, 'name');
        var docSaved = emergencyGetProperty(doc, 'saved');
        
        if (docName) {
            validation.capabilities.hasBasicProperties = true;
            enhancedStatusLog("VALIDATION", "Basic properties OK", 2, 5, "name: " + docName);
        } else {
            validation.warnings.push("Cannot access document name property");
        }
        
        // Test 3: Collection access (mode-dependent)
        if (currentMode !== "emergency") {
            enhancedStatusLog("VALIDATION", "Testing collection access", 3, 5, "Mode-appropriate collections");
            var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
            
            if (modeConfig && modeConfig.collections.length > 0) {
                var accessibleCollections = 0;
                
                for (var i = 0; i < modeConfig.collections.length; i++) {
                    var collName = modeConfig.collections[i];
                    var collection = progressiveCollectionAccess(doc, collName, currentMode);
                    
                    if (collection) {
                        accessibleCollections++;
                    }
                }
                
                if (accessibleCollections > 0) {
                    validation.capabilities.hasCollections = true;
                    enhancedStatusLog("VALIDATION", "Collections accessible", 3, 5, 
                        accessibleCollections + " of " + modeConfig.collections.length + " collections");
                } else {
                    validation.errors.push("Cannot access any collections for " + currentMode + " mode");
                }
            }
        } else {
            enhancedStatusLog("VALIDATION", "Skipping collection test", 3, 5, "Emergency mode - no collections");
            validation.capabilities.hasCollections = true; // Not required in emergency mode
        }
        
        // Test 4: Advanced properties (only for higher modes)
        if (currentMode === "standard" || currentMode === "comprehensive") {
            enhancedStatusLog("VALIDATION", "Testing advanced properties", 4, 5, "Higher mode validation");
            var viewPrefs = emergencyGetProperty(doc, 'viewPreferences');
            
            if (viewPrefs) {
                validation.capabilities.hasAdvancedProperties = true;
                enhancedStatusLog("VALIDATION", "Advanced properties accessible", 4, 5, "viewPrefs OK");
            } else {
                validation.warnings.push("Advanced properties may not be accessible");
            }
        } else {
            enhancedStatusLog("VALIDATION", "Skipping advanced properties", 4, 5, "Not required for " + currentMode + " mode");
            validation.capabilities.hasAdvancedProperties = true; // Not required for basic modes
        }
        
        // Test 5: Final validation
        enhancedStatusLog("VALIDATION", "Completing validation", 5, 5, "Determining analysis capability");
        
        if (validation.capabilities.hasBasicProperties && validation.capabilities.hasCollections) {
            validation.isValid = true;
            enhancedStatusLog("VALIDATION", "Document validation PASSED", 5, 5, "Ready for " + currentMode + " analysis");
        } else {
            validation.errors.push("Document lacks minimum required capabilities for " + currentMode + " mode");
            enhancedStatusLog("VALIDATION", "Document validation FAILED", 5, 5, "Cannot proceed with " + currentMode + " analysis");
        }
        
    } catch (exc) {
        validation.errors.push("Validation failed with exception: " + exc.message);
        enhancedStatusLog("VALIDATION", "Validation exception", 5, 5, "Error: " + exc.message);
    }
    
    return validation;
}

// ============================================================================
// REMAINING UTILITY FUNCTIONS (PRESERVED FROM ORIGINAL)
// ============================================================================

// Enhanced text capture with comprehensive safety
function safeTextCapture(textFrame) {
    try {
        if (!textFrame) {
            return "[NO TEXT]";
        }
        
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
        var maxLength = currentMode === "emergency" ? 20 : 
                       currentMode === "minimal" ? 30 : 
                       ENHANCED_ANALYSIS_CONFIG.modes[currentMode] ? 60 : 60;
        
        // Multiple attempts to get content
        var content = emergencyGetProperty(textFrame, 'contents');
        
        if (!content) {
            content = emergencyGetProperty(textFrame, 'content');
        }
        if (!content) {
            content = emergencyGetProperty(textFrame, 'text');
        }
        
        if (!content) {
            return "[NO TEXT]";
        }
        
        if (typeof content !== 'string') {
            try {
                content = String(content);
            } catch (e) {
                return "[NON-STRING]";
            }
        }
        
        var preview = content.substring(0, maxLength);
        
        // Clean whitespace safely - ES3 compatible
        try {
            var cleanPreview = "";
            var lastWasSpace = false;
            for (var i = 0; i < preview.length; i++) {
                var currentChar = preview.charAt(i);
                if (isWhitespace(currentChar)) {
                    if (!lastWasSpace) {
                        cleanPreview += " ";
                        lastWasSpace = true;
                    }
                } else {
                    cleanPreview += currentChar;
                    lastWasSpace = false;
                }
            }
            preview = stringTrim(cleanPreview);
        } catch (e) {
            // If cleaning fails, use original
        }
        
        if (content.length > maxLength) {
            preview += "...";
        }
        
        return preview || "[EMPTY]";
        
    } catch (e) {
        debugLog("Text capture failed: " + e.message, "ERROR");
        return "[ERROR:" + e.message.substring(0, 15) + "]";
    }
}

// Enhanced error logging with mode awareness
function logError(message, category, severity) {
    try {
        if (!ENHANCED_ANALYSIS_CONFIG.runtime.errors) {
            ENHANCED_ANALYSIS_CONFIG.runtime.errors = [];
        }
        
        var errorEntry = {
            timestamp: toISOString(new Date()),
            message: message,
            category: category || 'general',
            severity: severity || 'medium',
            mode: ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || 'unknown',
            apiCategory: categorizeAPIError(message)
        };
        
        ENHANCED_ANALYSIS_CONFIG.runtime.errors.push(errorEntry);
        debugLog("Error logged: " + message, "ERROR");
        
        // Limit error log size
        if (ENHANCED_ANALYSIS_CONFIG.runtime.errors.length > 100) {
            ENHANCED_ANALYSIS_CONFIG.runtime.errors.splice(0, 50);
        }
    } catch (e) {
        debugLog("Failed to log error: " + e.message, "CRITICAL");
    }
}

// Categorize API errors for better troubleshooting
function categorizeAPIError(errorMessage) {
    var msg = errorMessage.toLowerCase();
    
    if (stringIndexOf(msg, 'object does not support') !== -1) {
        return 'unsupported_property';
    } else if (stringIndexOf(msg, 'access denied') !== -1) {
        return 'access_denied';
    } else if (stringIndexOf(msg, 'invalid index') !== -1) {
        return 'invalid_index';
    } else if (stringIndexOf(msg, 'timeout') !== -1) {
        return 'timeout';
    } else if (stringIndexOf(msg, 'permission') !== -1) {
        return 'permission_error';
    } else if (stringIndexOf(msg, 'not found') !== -1) {
        return 'not_found';
    } else {
        return 'unknown';
    }
}

// Handle nested/dotted property paths safely
function safeGetNestedProperty(obj, dotPath, defaultValue) {
    try {
        var pathParts = dotPath.split('.');
        var current = obj;
        
        for (var i = 0; i < pathParts.length; i++) {
            var part = pathParts[i];
            
            if (!current) {
                debugLog("Null object encountered in path: " + dotPath + " at part: " + part, "WARN");
                return defaultValue !== undefined ? defaultValue : null;
            }
            
            var nextValue = emergencyGetProperty(current, part);
            
            if (nextValue === undefined || nextValue === null) {
                debugLog("Property not found in path: " + dotPath + " at part: " + part, "WARN");
                return defaultValue !== undefined ? defaultValue : null;
            }
            
            current = nextValue;
        }
        
        return current !== undefined ? current : (defaultValue !== undefined ? defaultValue : null);
        
    } catch (e) {
        debugLog("Nested property access failed: " + dotPath + " - " + e.message, "ERROR");
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Handle simple (non-dotted) properties with enhanced fallbacks
function safeGetSimpleProperty(obj, prop, defaultValue) {
    try {
        // Method 1: hasOwnProperty (safest)
        if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
            var value = obj[prop];
            return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
        }
        
        // Method 2: Direct access fallback
        if (obj[prop] !== undefined) {
            return obj[prop];
        }
        
        // Method 3: Try alternative property names
        var alternatives = getPropertyAlternatives(prop);
        for (var i = 0; i < alternatives.length; i++) {
            try {
                if (obj[alternatives[i]] !== undefined) {
                    debugLog("Used alternative property: " + alternatives[i] + " for " + prop, "ALT");
                    ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives[prop] = alternatives[i];
                    return obj[alternatives[i]];
                }
            } catch (e) {
                // Continue to next alternative
            }
        }
        
        return defaultValue !== undefined ? defaultValue : null;
        
    } catch (e) {
        debugLog("Simple property access failed: " + prop + " - " + e.message, "ERROR");
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Get alternative property names for InDesign API inconsistencies
function getPropertyAlternatives(prop) {
    var alternativeMap = {
        'length': ['count', 'size'],
        'count': ['length', 'size'],
        'name': ['label', 'title'],
        'bounds': ['geometricBounds', 'visibleBounds'],
        'contents': ['content', 'text', 'string'],
        'visible': ['isVisible', 'visibility'],
        'locked': ['isLocked', 'lockState'],
        'filePath': ['fullName', 'fsName'],
        'date': ['modified', 'dateModified'],
        'size': ['length', 'fileSize']
    };
    
    return alternativeMap[prop] || [];
}

// Check file system access permissions
function checkFileAccess(folderPath) {
    try {
        debugLog("Checking file access for: " + folderPath, "FILE");
        var testFile = File(folderPath + "/indesign_test_write.tmp");
        testFile.open("w");
        testFile.write("test");
        testFile.close();
        testFile.remove();
        debugLog("File access confirmed", "FILE");
        return true;
    } catch (e) {
        debugLog("File access denied: " + e.message, "ERROR");
        return false;
    }
}

// Enhanced memory and size limit checking
function checkMemoryLimits(dataSize, operation) {
    try {
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
        var memoryLimit = modeConfig ? modeConfig.memoryLimit : 4194304; // Default 4MB
        
        debugLog("Checking memory limits for " + operation + ": " + Math.round(dataSize / 1024) + "KB (limit: " + Math.round(memoryLimit / 1024) + "KB)", "MEMORY");
        
        if (dataSize > memoryLimit) {
            debugLog("Memory limit exceeded for " + currentMode + " mode: " + Math.round(dataSize / 1024 / 1024) + "MB", "WARN");
            alert("Memory limit exceeded (" + Math.round(dataSize / 1024 / 1024) + "MB) for " + currentMode + " mode.\nUsing summary mode for: " + operation);
            return false;
        }
        
        return true;
        
    } catch (e) {
        debugLog("Memory check failed: " + e.message, "ERROR");
        return true; // If we can't check, continue anyway
    }
}

// Enhanced collection iteration with mode awareness
function enhancedSafeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) {
        enhancedStatusLog("ITERATION", "Invalid parameters", 0, 0, "collection or callback missing");
        return [];
    }
    
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    var modeTimeout = modeConfig ? modeConfig.timeout : 3000;
    
    var results = [];
    var startTime = new Date().getTime();
    maxItems = Math.min(maxItems || 20, 50); // Cap at 50 items max
    
    enhancedStatusLog("ITERATION", "Starting collection analysis", 0, 0, collectionName || "unknown");
    
    try {
        var collectionLength = emergencyGetLength(collection, modeTimeout / 4);
        var actualMax = Math.min(collectionLength, maxItems);
        
        enhancedStatusLog("ITERATION", "Collection size determined", 0, actualMax, 
            "Length: " + collectionLength + ", Processing: " + actualMax);
        
        if (collectionLength === 0) {
            enhancedStatusLog("ITERATION", "Empty collection", 0, 0, collectionName + " has no items");
            return results;
        }
        
        // Enhanced iteration with mode-aware timeouts
        for (var i = 0; i < actualMax; i++) {
            // Mode-aware timeout protection
            if (new Date().getTime() - startTime > modeTimeout) {
                enhancedStatusLog("ITERATION", "MODE TIMEOUT", i, actualMax, 
                    "Stopped at item " + i + " after " + modeTimeout + "ms (" + currentMode + " mode)");
                results.push({
                    notice: "Processing timed out at item " + i + " of " + collectionLength,
                    timeout: true,
                    mode: currentMode,
                    collectionName: collectionName || "unknown",
                    timeoutThreshold: modeTimeout
                });
                break;
            }
            
            // Progress reporting every 5 items
            if (i % 5 === 0 || i === actualMax - 1) {
                enhancedStatusLog("ITERATION", "Processing items", i + 1, actualMax, 
                    collectionName + " item " + (i + 1));
            }
            
            try {
                var item = null;
                var accessMethod = "unknown";
                
                // Try array access first
                try {
                    item = collection[i];
                    accessMethod = "array[" + i + "]";
                } catch (e1) {
                    // Try .item() method
                    if (collection.item) {
                        try {
                            item = collection.item(i);
                            accessMethod = "collection.item(" + i + ")";
                        } catch (e2) {
                            // Item access failed
                        }
                    }
                }
                
                // Process item if we got it
                if (item) {
                    try {
                        var result = callback(item, i);
                        if (result !== null && result !== undefined) {
                            if (typeof result === 'object') {
                                result._accessMethod = accessMethod;
                                result._mode = currentMode;
                            }
                            results.push(result);
                        }
                    } catch (callbackError) {
                        enhancedStatusLog("ITERATION", "Callback failed", i + 1, actualMax, 
                            "Item " + i + ": " + callbackError.message);
                        
                        // Only add error details for first few failures
                        if (i < 3) {
                            results.push({
                                error: "Callback processing failed",
                                index: i,
                                errorMessage: callbackError.message,
                                accessMethod: accessMethod,
                                mode: currentMode,
                                collectionName: collectionName || "unknown"
                            });
                        }
                    }
                }
                
            } catch (itemError) {
                if (i < 3) {
                    enhancedStatusLog("ITERATION", "Item processing failed", i + 1, actualMax, 
                        "Item " + i + ": " + itemError.message);
                }
            }
        }
        
        var totalTime = new Date().getTime() - startTime;
        enhancedStatusLog("ITERATION", "Collection analysis complete", actualMax, actualMax, 
            collectionName + ": " + results.length + " results in " + totalTime + "ms (" + currentMode + " mode)");
        
    } catch (exc) {
        enhancedStatusLog("ITERATION", "Collection analysis FAILED", 0, 0, 
            collectionName + ": " + exc.message);
        results.push({
            error: "Collection iteration completely failed: " + exc.message,
            collectionName: collectionName || "unknown",
            mode: currentMode,
            errorType: categorizeAPIError(exc.message)
        });
    }
    
    return results;
}

// Legacy function for backwards compatibility
function safeIterateCollection(collection, callback, maxItems, collectionName) {
    return enhancedSafeIterateCollection(collection, callback, maxItems, collectionName);
}

// Enhanced section analyzer with mode awareness
function safeAnalyzeSection(sectionName, analyzeFunction) {
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    var sectionTimeout = modeConfig ? modeConfig.timeout : 3000;
    
    var startTime = new Date().getTime();
    var sectionConfig = {
        name: sectionName,
        timeout: sectionTimeout,
        retryCount: 0,
        maxRetries: ENHANCED_ANALYSIS_CONFIG.errorHandling.maxRetries,
        retryDelay: ENHANCED_ANALYSIS_CONFIG.errorHandling.retryDelay,
        mode: currentMode
    };
    
    debugLog("Starting section analysis: " + sectionName + " (mode: " + currentMode + ")", "SECTION");
    enhancedStatusLog("SECTION", "Section analysis starting", 0, 1, sectionName + " (" + currentMode + " mode)");
    
    function attemptAnalysis() {
        var attemptStartTime = new Date().getTime();
        
        try {
            if (typeof analyzeFunction !== 'function') {
                throw new Error("Invalid analyze function provided");
            }
            
            debugLog("Executing analysis function for: " + sectionName + " (attempt " + (sectionConfig.retryCount + 1) + ")", "SECTION");
            
            var result = analyzeFunction();
            var duration = new Date().getTime() - attemptStartTime;
            
            debugLog("Section " + sectionName + " completed in " + duration + "ms", "SECTION");
            enhancedStatusLog("SECTION", "Section analysis completed", 1, 1, sectionName + " - " + duration + "ms");
            
            // Enhanced timeout detection with mode awareness
            if (duration > sectionConfig.timeout) {
                if (sectionConfig.retryCount < sectionConfig.maxRetries) {
                    sectionConfig.retryCount++;
                    sectionConfig.timeout *= 1.5; // Increase timeout for retry
                    debugLog("Section " + sectionName + " exceeded timeout (" + duration + "ms), retrying with extended timeout (" + sectionConfig.timeout + "ms)", "RETRY");
                    
                    // Brief delay before retry
                    var delayStart = new Date().getTime();
                    while (new Date().getTime() - delayStart < sectionConfig.retryDelay) {
                        // Brief delay
                    }
                    
                    return attemptAnalysis();
                } else {
                    logError("Section " + sectionName + " timed out after " + duration + "ms with " + sectionConfig.retryCount + " retries (mode: " + currentMode + ")", 'timeout', 'high');
                    return {
                        error: "Section analysis timed out after multiple attempts",
                        timeout: true,
                        duration: duration,
                        retryCount: sectionConfig.retryCount,
                        sectionName: sectionName,
                        mode: currentMode,
                        partialData: result,
                        recommendation: "Consider using a lower analysis mode or increasing timeout"
                    };
                }
            }
            
            return result;
            
        } catch (exc) {
            var duration = new Date().getTime() - attemptStartTime;
            debugLog("Section " + sectionName + " failed: " + exc.message + " (attempt " + (sectionConfig.retryCount + 1) + ")", "ERROR");
            
            // Enhanced retry logic with mode awareness
            var shouldRetry = false;
            var errorCategory = categorizeAPIError(exc.message);
            
            if (sectionConfig.retryCount < sectionConfig.maxRetries && ENHANCED_ANALYSIS_CONFIG.errorHandling.enableRetryLogic) {
                // Retry for certain error types
                if (errorCategory === 'timeout' || 
                    errorCategory === 'access_denied' || 
                    errorCategory === 'invalid_index' ||
                    stringIndexOf(exc.message, 'busy') !== -1 ||
                    stringIndexOf(exc.message, 'not available') !== -1) {
                    shouldRetry = true;
                }
            }
            
            if (shouldRetry) {
                sectionConfig.retryCount++;
                debugLog("Section " + sectionName + " failed, retrying (" + sectionConfig.retryCount + "/" + sectionConfig.maxRetries + "): " + exc.message, "RETRY");
                
                var retryDelay = sectionConfig.retryDelay * (sectionConfig.retryCount * 2);
                var delayStart = new Date().getTime();
                while (new Date().getTime() - delayStart < retryDelay) {
                    // Adaptive delay
                }
                
                return attemptAnalysis();
            } else {
                logError("Section " + sectionName + " analysis failed permanently: " + exc.message + " (mode: " + currentMode + ")", 'sectionFailure', 'high');
                return {
                    error: "Section analysis failed: " + exc.message,
                    sectionName: sectionName,
                    line: exc.line || "unknown",
                    recoverable: sectionConfig.retryCount < sectionConfig.maxRetries,
                    retryCount: sectionConfig.retryCount,
                    errorType: errorCategory,
                    duration: duration,
                    mode: currentMode,
                    troubleshooting: generateErrorTroubleshooting(errorCategory, sectionName, currentMode)
                };
            }
        }
    }
    
    return attemptAnalysis();
}

// Generate troubleshooting guidance with mode awareness
function generateErrorTroubleshooting(errorCategory, sectionName, mode) {
    var guidance = [];
    
    switch (errorCategory) {
        case 'unsupported_property':
            guidance.push("Check if property exists in your InDesign version");
            guidance.push("Try alternative property names for " + sectionName);
            if (mode !== "emergency") {
                guidance.push("Consider switching to emergency mode for ultra-safe access");
            }
            break;
        case 'access_denied':
            guidance.push("Verify document is not locked or protected");
            guidance.push("Check user permissions for document access");
            break;
        case 'invalid_index':
            guidance.push("Collection size may have changed during analysis");
            guidance.push("Use smaller sample sizes for " + sectionName);
            if (mode === "comprehensive" || mode === "standard") {
                guidance.push("Consider using basic or minimal mode");
            }
            break;
        case 'timeout':
            guidance.push("Increase timeout thresholds or use a lower analysis mode");
            guidance.push("Process " + sectionName + " in smaller batches");
            if (mode !== "minimal") {
                guidance.push("Try minimal mode for problematic documents");
            }
            break;
        default:
            guidance.push("Use comprehensive error handling for " + sectionName);
            guidance.push("Test with simpler documents first");
            if (mode !== "emergency") {
                guidance.push("Try emergency mode for maximum safety");
            }
    }
    
    return guidance;
}

// Legacy status logging for backwards compatibility
function statusLog(operation, details, progress) {
    enhancedStatusLog("LEGACY", operation, progress || 0, 100, details);
}