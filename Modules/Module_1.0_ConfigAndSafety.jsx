// ============================================================================
// MODULE 1.0: ENHANCED CONFIGURATION & SAFETY FRAMEWORK
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// ============================================================================
// CORE CONFIGURATION OBJECT - ENHANCED WITH SAFETY FEATURES
// ============================================================================

var QUERY_CONFIG = {
    // Analysis targets - configurable through UI
    targets: {
        documentProperties: { 
            enabled: true, 
            safetyLevel: "safe",
            description: "Basic document information and metadata"
        },
        pageCollection: { 
            enabled: true, 
            safetyLevel: "safe",
            description: "Page objects and basic properties"
        },
        textFrames: { 
            enabled: true, 
            safetyLevel: "safe",
            description: "Text frame objects and properties"
        },
        textContent: { 
            enabled: false, 
            safetyLevel: "moderate",
            description: "Text content sampling and analysis"
        },
        images: { 
            enabled: false, 
            safetyLevel: "moderate",
            description: "Image objects and graphic properties"
        },
        links: { 
            enabled: false, 
            safetyLevel: "risky",
            description: "Linked files and asset references"
        },
        styles: { 
            enabled: false, 
            safetyLevel: "moderate",
            description: "Style definitions and applications"
        },
        colors: { 
            enabled: false, 
            safetyLevel: "safe",
            description: "Color definitions and usage"
        },
        layers: { 
            enabled: true, 
            safetyLevel: "safe",
            description: "Layer information and visibility"
        },
        pageItems: { 
            enabled: false, 
            safetyLevel: "risky",
            description: "All page items and objects"
        }
    },
    
    // Enhanced traversal configuration
    traversal: {
        maxDepth: 3,
        sampleLimit: 10,
        timeoutMs: 5000,
        verboseProgress: true,
        enableEmergencyBailout: true,
        maxMemoryUsage: 8388608, // 8MB
        progressUpdateInterval: 100
    },
    
    // Safety mode configuration
    safetyMode: {
        current: "basic",
        modes: {
            emergency: {
                timeout: 500,
                sampleLimit: 3,
                maxDepth: 1,
                collectionsAllowed: false,
                description: "Ultra-safe mode for problematic documents"
            },
            minimal: {
                timeout: 1000,
                sampleLimit: 5,
                maxDepth: 2,
                collectionsAllowed: true,
                description: "Minimal analysis with basic safety"
            },
            basic: {
                timeout: 3000,
                sampleLimit: 10,
                maxDepth: 3,
                collectionsAllowed: true,
                description: "Balanced safety and functionality"
            },
            standard: {
                timeout: 8000,
                sampleLimit: 15,
                maxDepth: 4,
                collectionsAllowed: true,
                description: "Standard analysis with text content"
            },
            comprehensive: {
                timeout: 15000,
                sampleLimit: 25,
                maxDepth: 5,
                collectionsAllowed: true,
                description: "Complete analysis with all features"
            }
        }
    },
    
    // Progress tracking
    progress: {
        currentTarget: "",
        currentPath: "",
        currentResult: "",
        completedTargets: 0,
        totalTargets: 0,
        percentage: 0,
        status: "ready",
        errors: 0,
        warnings: 0
    },
    
    // Runtime state management
    runtime: {
        analysisActive: false,
        errorCount: 0,
        successCount: 0,
        startTime: null,
        lastError: null,
        debugLog: [],
        emergencyBailouts: 0,
        alternativeAccessUsed: 0,
        results: {},
        memoryWarnings: 0
    },
    
    // Export configuration
    exportFormat: {
        includeMetadata: true,
        includeErrors: true,
        includeTiming: true,
        format: "text",
        maxFileSize: 5242880 // 5MB
    }
};

// ============================================================================
// ENHANCED EMERGENCY ACCESS FUNCTIONS - FIXED RESERVED WORDS
// ============================================================================

function emergencyGetProperty(objRef, propName, defaultValue, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || QUERY_CONFIG.safetyMode.modes[QUERY_CONFIG.safetyMode.current].timeout;
    
    try {
        if (!objRef) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Check timeout before access
        if (new Date().getTime() - startTime > maxTime) {
            QUERY_CONFIG.runtime.emergencyBailouts++;
            debugLog("Emergency timeout: " + propName, "TIMEOUT");
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Method 1: hasOwnProperty check (safest)
        if (objRef.hasOwnProperty && objRef.hasOwnProperty(propName)) {
            var propValue = objRef[propName];
            if (propValue !== undefined) {
                return propValue;
            }
        }
        
        // Method 2: Direct property access
        var directValue = objRef[propName];
        if (directValue !== undefined) {
            return directValue;
        }
        
        // Method 3: Alternative property names
        var alternativeNames = getAlternativePropertyNames(propName);
        for (var i = 0; i < alternativeNames.length; i++) {
            var altName = alternativeNames[i];
            if (objRef[altName] !== undefined) {
                QUERY_CONFIG.runtime.alternativeAccessUsed++;
                debugLog("Using alternative property: " + altName + " for " + propName, "ALT");
                return objRef[altName];
            }
        }
        
        return defaultValue !== undefined ? defaultValue : null;
        
    } catch (exc) {
        QUERY_CONFIG.runtime.errorCount++;
        debugLog("Emergency property access failed: " + propName + " - " + exc.message, "ERROR");
        return defaultValue !== undefined ? defaultValue : null;
    }
}

function emergencyGetLength(collectionRef, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || QUERY_CONFIG.safetyMode.modes[QUERY_CONFIG.safetyMode.current].timeout;
    
    try {
        if (!collectionRef) {
            return 0;
        }
        
        // Check timeout
        if (new Date().getTime() - startTime > maxTime) {
            QUERY_CONFIG.runtime.emergencyBailouts++;
            debugLog("Emergency timeout getting collection length", "TIMEOUT");
            return 0;
        }
        
        // Try length property first
        if (collectionRef.length !== undefined) {
            var lengthValue = parseInt(collectionRef.length);
            return isNaN(lengthValue) ? 0 : lengthValue;
        }
        
        // Try count property as alternative
        if (collectionRef.count !== undefined) {
            var countValue = parseInt(collectionRef.count);
            return isNaN(countValue) ? 0 : countValue;
        }
        
        return 0;
        
    } catch (exc) {
        QUERY_CONFIG.runtime.errorCount++;
        debugLog("Emergency length access failed: " + exc.message, "ERROR");
        return 0;
    }
}

function emergencyGetCollectionItem(collectionRef, itemIndex, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || QUERY_CONFIG.safetyMode.modes[QUERY_CONFIG.safetyMode.current].timeout;
    
    try {
        if (!collectionRef || itemIndex < 0) {
            return null;
        }
        
        // Check timeout
        if (new Date().getTime() - startTime > maxTime) {
            QUERY_CONFIG.runtime.emergencyBailouts++;
            debugLog("Emergency timeout getting collection item " + itemIndex, "TIMEOUT");
            return null;
        }
        
        // Method 1: Array-style access
        if (collectionRef[itemIndex] !== undefined) {
            return collectionRef[itemIndex];
        }
        
        // Method 2: item() method
        if (collectionRef.item && typeof collectionRef.item === 'function') {
            return collectionRef.item(itemIndex);
        }
        
        // Method 3: itemByIndex() method  
        if (collectionRef.itemByIndex && typeof collectionRef.itemByIndex === 'function') {
            return collectionRef.itemByIndex(itemIndex);
        }
        
        return null;
        
    } catch (exc) {
        QUERY_CONFIG.runtime.errorCount++;
        debugLog("Emergency collection item access failed: " + itemIndex + " - " + exc.message, "ERROR");
        return null;
    }
}

function getAlternativePropertyNames(propName) {
    var alternatives = {
        'contents': ['content', 'text', 'textContents'],
        'content': ['contents', 'text', 'textContent'],
        'text': ['contents', 'content', 'textContents'],
        'length': ['count', 'size'],
        'count': ['length', 'size'],
        'name': ['title', 'label', 'displayName'],
        'id': ['ID', 'identifier', 'uid'],
        'visible': ['visibility', 'isVisible'],
        'locked': ['isLocked', 'lockState'],
        'width': ['w', 'pageWidth'],
        'height': ['h', 'pageHeight'],
        'bounds': ['geometricBounds', 'visibleBounds']
    };
    
    return alternatives[propName] || [];
}

// ============================================================================
// ENHANCED PROGRESS TRACKING - FROM CHUNKS
// ============================================================================

function updateProgress(sectionName, operationName, message, statusType) {
    QUERY_CONFIG.progress.currentTarget = sectionName || "";
    QUERY_CONFIG.progress.currentPath = operationName || "";
    QUERY_CONFIG.progress.currentResult = message || "";
    QUERY_CONFIG.progress.status = statusType || "working";
    
    // Update error/warning counts
    if (statusType === "error") {
        QUERY_CONFIG.progress.errors++;
        QUERY_CONFIG.runtime.errorCount++;
    } else if (statusType === "warning") {
        QUERY_CONFIG.progress.warnings++;
    } else if (statusType === "success") {
        QUERY_CONFIG.runtime.successCount++;
    }
    
    // Update percentage if we have target info
    if (QUERY_CONFIG.progress.totalTargets > 0) {
        QUERY_CONFIG.progress.percentage = Math.round(
            (QUERY_CONFIG.progress.completedTargets / QUERY_CONFIG.progress.totalTargets) * 100
        );
    }
    
    // Debug logging if enabled
    if (QUERY_CONFIG.traversal.verboseProgress) {
        debugLog("[" + sectionName + "] " + operationName + ": " + message, statusType.toUpperCase());
    }
}

function resetProgress() {
    QUERY_CONFIG.progress.currentTarget = "";
    QUERY_CONFIG.progress.currentPath = "";
    QUERY_CONFIG.progress.currentResult = "";
    QUERY_CONFIG.progress.completedTargets = 0;
    QUERY_CONFIG.progress.totalTargets = 0;
    QUERY_CONFIG.progress.percentage = 0;
    QUERY_CONFIG.progress.status = "ready";
    QUERY_CONFIG.progress.errors = 0;
    QUERY_CONFIG.progress.warnings = 0;
    QUERY_CONFIG.runtime.errorCount = 0;
    QUERY_CONFIG.runtime.successCount = 0;
    QUERY_CONFIG.runtime.emergencyBailouts = 0;
    QUERY_CONFIG.runtime.alternativeAccessUsed = 0;
}

// ============================================================================
// ENHANCED DEBUGGING AND LOGGING - FIXED RESERVED WORDS
// ============================================================================

function debugLog(message, categoryName) {
    try {
        var timestamp = toISOString(new Date());
        var logEntry = "[" + timestamp + "] [" + (categoryName || "DEBUG") + "] " + message;
        
        // Output to ExtendScript console
        $.writeln(logEntry);
        
        // Store in memory log
        if (!QUERY_CONFIG.runtime.debugLog) {
            QUERY_CONFIG.runtime.debugLog = [];
        }
        
        QUERY_CONFIG.runtime.debugLog.push({
            timestamp: timestamp,
            category: categoryName || "DEBUG",
            message: message
        });
        
        // Limit log size for memory management
        if (QUERY_CONFIG.runtime.debugLog.length > 1000) {
            QUERY_CONFIG.runtime.debugLog.splice(0, 500);
        }
        
    } catch (exc) {
        // Fallback logging
        $.writeln("DEBUG LOG ERROR: " + exc.message);
    }
}

function logError(errorMessage, errorCategory, severityLevel) {
    try {
        var timestamp = toISOString(new Date());
        var logEntry = "[" + timestamp + "] [ERROR:" + (severityLevel || "MEDIUM") + "] [" + 
                      (errorCategory || "GENERAL") + "] " + errorMessage;
        
        // Output to console with error marking
        $.writeln("!!! " + logEntry);
        
        // Store error for analysis
        if (!QUERY_CONFIG.runtime.errors) {
            QUERY_CONFIG.runtime.errors = [];
        }
        
        QUERY_CONFIG.runtime.errors.push({
            timestamp: timestamp,
            category: errorCategory || "GENERAL",
            severity: severityLevel || "MEDIUM",
            message: errorMessage
        });
        
        // Update last error reference
        QUERY_CONFIG.runtime.lastError = {
            message: errorMessage,
            timestamp: timestamp,
            category: errorCategory
        };
        
        // Limit error log size
        if (QUERY_CONFIG.runtime.errors.length > 100) {
            QUERY_CONFIG.runtime.errors.splice(0, 50);
        }
        
    } catch (exc) {
        $.writeln("ERROR LOGGING FAILED: " + exc.message);
    }
}

// ============================================================================
// ES3 COMPATIBILITY FUNCTIONS - ALL RESERVED WORDS FIXED
// ============================================================================

function arrayIndexOf(arrayRef, searchElement) {
    if (!arrayRef || !arrayRef.length) return -1;
    
    for (var i = 0; i < arrayRef.length; i++) {
        if (arrayRef[i] === searchElement) {
            return i;
        }
    }
    return -1;
}

function stringIndexOf(stringRef, searchValue, fromIndex) {
    if (!stringRef) return -1;
    fromIndex = fromIndex || 0;
    
    for (var i = fromIndex; i < stringRef.length; i++) {
        var isMatch = true;
        for (var j = 0; j < searchValue.length; j++) {
            if (i + j >= stringRef.length || stringRef.charAt(i + j) !== searchValue.charAt(j)) {
                isMatch = false;
                break;
            }
        }
        if (isMatch) return i;
    }
    return -1;
}

function objectKeys(objRef) {
    var keysList = [];
    if (!objRef) return keysList;
    
    for (var keyName in objRef) {
        if (objRef.hasOwnProperty && objRef.hasOwnProperty(keyName)) {
            keysList.push(keyName);
        }
    }
    return keysList;
}

function toISOString(dateRef) {
    try {
        if (!dateRef) dateRef = new Date();
        
        var yearPart = dateRef.getFullYear();
        var monthPart = ('0' + (dateRef.getMonth() + 1)).slice(-2);
        var dayPart = ('0' + dateRef.getDate()).slice(-2);
        var hoursPart = ('0' + dateRef.getHours()).slice(-2);
        var minutesPart = ('0' + dateRef.getMinutes()).slice(-2);
        var secondsPart = ('0' + dateRef.getSeconds()).slice(-2);
        
        return yearPart + '-' + monthPart + '-' + dayPart + 'T' + 
               hoursPart + ':' + minutesPart + ':' + secondsPart + 'Z';
    } catch (exc) {
        try {
            return dateRef.toString();
        } catch (exc2) {
            return "Invalid Date";
        }
    }
}

function stringTrim(stringRef) {
    if (!stringRef) return "";
    
    // Remove leading whitespace
    var startPos = 0;
    while (startPos < stringRef.length && isWhitespaceCharacter(stringRef.charAt(startPos))) {
        startPos++;
    }
    
    // Remove trailing whitespace
    var endPos = stringRef.length - 1;
    while (endPos >= startPos && isWhitespaceCharacter(stringRef.charAt(endPos))) {
        endPos--;
    }
    
    return stringRef.substring(startPos, endPos + 1);
}

function isWhitespaceCharacter(characterRef) {
    return characterRef === ' ' || characterRef === '\t' || 
           characterRef === '\n' || characterRef === '\r' || 
           characterRef === '\f';
}

function arrayFilter(arrayRef, callbackFn) {
    var resultArray = [];
    if (!arrayRef || !arrayRef.length) return resultArray;
    
    for (var i = 0; i < arrayRef.length; i++) {
        try {
            if (callbackFn(arrayRef[i], i, arrayRef)) {
                resultArray.push(arrayRef[i]);
            }
        } catch (exc) {
            // Continue processing other elements
        }
    }
    return resultArray;
}

function arraySome(arrayRef, callbackFn) {
    if (!arrayRef || !arrayRef.length) return false;
    
    for (var i = 0; i < arrayRef.length; i++) {
        try {
            if (callbackFn(arrayRef[i], i, arrayRef)) {
                return true;
            }
        } catch (exc) {
            // Continue checking other elements
        }
    }
    return false;
}

function repeatString(stringValue, countValue) {
    var resultString = "";
    for (var i = 0; i < countValue; i++) {
        resultString += stringValue;
    }
    return resultString;
}

// ============================================================================
// ENHANCED MEMORY MANAGEMENT
// ============================================================================

function checkMemoryUsage() {
    var memoryInfo = {
        timestamp: toISOString(new Date()),
        estimatedUsage: 0,
        status: "unknown",
        recommendations: []
    };
    
    try {
        // Estimate memory usage based on stored data
        var estimatedBytes = 0;
        
        // Count debug log entries
        if (QUERY_CONFIG.runtime.debugLog) {
            estimatedBytes += QUERY_CONFIG.runtime.debugLog.length * 200;
        }
        
        // Count error log entries
        if (QUERY_CONFIG.runtime.errors) {
            estimatedBytes += QUERY_CONFIG.runtime.errors.length * 150;
        }
        
        // Count results data
        if (QUERY_CONFIG.runtime.results) {
            estimatedBytes += 50000; // Rough estimate
        }
        
        memoryInfo.estimatedUsage = estimatedBytes;
        
        // Categorize memory usage
        if (estimatedBytes < 1048576) { // < 1MB
            memoryInfo.status = "good";
        } else if (estimatedBytes < 5242880) { // < 5MB
            memoryInfo.status = "moderate";
            memoryInfo.recommendations.push("Consider clearing old results");
        } else {
            memoryInfo.status = "high";
            memoryInfo.recommendations.push("Clear results and logs");
            memoryInfo.recommendations.push("Restart script if performance degrades");
            QUERY_CONFIG.runtime.memoryWarnings++;
        }
        
    } catch (exc) {
        memoryInfo.status = "error";
        memoryInfo.recommendations.push("Memory check failed: " + exc.message);
    }
    
    return memoryInfo;
}

function performMemoryCleanup() {
    try {
        updateProgress("memory", "cleanup", "Performing memory cleanup", "working");
        
        // Clear runtime data
        QUERY_CONFIG.runtime.results = {};
        QUERY_CONFIG.runtime.debugLog = [];
        QUERY_CONFIG.runtime.errors = [];
        
        // Reset counters but keep important metrics
        var emergencyBailouts = QUERY_CONFIG.runtime.emergencyBailouts;
        var alternativeAccessUsed = QUERY_CONFIG.runtime.alternativeAccessUsed;
        
        QUERY_CONFIG.runtime.emergencyBailouts = emergencyBailouts;
        QUERY_CONFIG.runtime.alternativeAccessUsed = alternativeAccessUsed;
        
        // Garbage collection hint
        if (typeof $.gc === "function") {
            $.gc();
        }
        
        updateProgress("memory", "cleanup", "Memory cleanup completed", "success");
        
    } catch (exc) {
        updateProgress("memory", "cleanup", "Memory cleanup failed: " + exc.message, "error");
    }
}

// ============================================================================
// ENVIRONMENT VALIDATION - Enhanced
// ============================================================================

function validateEnvironment() {
    var environmentChecks = {
        indesign: typeof app !== "undefined" && app.name && stringIndexOf(app.name.toLowerCase(), "indesign") !== -1,
        documents: typeof app !== "undefined" && typeof app.documents !== "undefined",
        filesystem: typeof File !== "undefined" && typeof Folder !== "undefined",
        ui: typeof Window !== "undefined",
        extendscript: typeof $ !== "undefined"
    };
    
    var allChecksPassed = true;
    var failedChecks = [];
    
    for (var checkName in environmentChecks) {
        if (!environmentChecks[checkName]) {
            allChecksPassed = false;
            failedChecks.push(checkName);
            updateProgress("environment", checkName, "Environment check failed", "error");
        }
    }
    
    if (allChecksPassed) {
        updateProgress("environment", "validation", "Environment validation passed", "success");
    } else {
        updateProgress("environment", "validation", "Failed checks: " + failedChecks.join(", "), "error");
    }
    
    return allChecksPassed;
}

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

function setSafetyMode(modeName) {
    if (QUERY_CONFIG.safetyMode.modes[modeName]) {
        var previousMode = QUERY_CONFIG.safetyMode.current;
        QUERY_CONFIG.safetyMode.current = modeName;
        
        // Update traversal config based on mode
        var modeConfig = QUERY_CONFIG.safetyMode.modes[modeName];
        QUERY_CONFIG.traversal.timeoutMs = modeConfig.timeout;
        QUERY_CONFIG.traversal.sampleLimit = modeConfig.sampleLimit;
        QUERY_CONFIG.traversal.maxDepth = modeConfig.maxDepth;
        
        debugLog("Safety mode changed from " + previousMode + " to " + modeName, "CONFIG");
        return true;
    } else {
        debugLog("Invalid safety mode: " + modeName, "CONFIG");
        return false;
    }
}

function getCurrentSafetyMode() {
    return QUERY_CONFIG.safetyMode.current;
}

function getSafetyModeConfig(modeName) {
    return QUERY_CONFIG.safetyMode.modes[modeName || QUERY_CONFIG.safetyMode.current];
}

function enableTarget(targetName, enabled) {
    if (QUERY_CONFIG.targets[targetName]) {
        QUERY_CONFIG.targets[targetName].enabled = enabled;
        debugLog("Target " + targetName + " " + (enabled ? "enabled" : "disabled"), "CONFIG");
        return true;
    } else {
        debugLog("Unknown target: " + targetName, "CONFIG");
        return false;
    }
}

function getEnabledTargets() {
    var enabledList = [];
    for (var targetKey in QUERY_CONFIG.targets) {
        if (QUERY_CONFIG.targets[targetKey].enabled) {
            enabledList.push(targetKey);
        }
    }
    return enabledList;
}

function isAnalysisActive() {
    return QUERY_CONFIG.runtime.analysisActive;
}

function setAnalysisActive(active) {
    QUERY_CONFIG.runtime.analysisActive = active;
    if (active) {
        QUERY_CONFIG.runtime.startTime = new Date().getTime();
        resetProgress();
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function createStringBuilder(initialCapacity) {
    return {
        parts: [],
        capacity: initialCapacity || 8192,
        currentLength: 0,
        
        append: function(stringValue) {
            if (stringValue !== null && stringValue !== undefined) {
                var stringPart = String(stringValue);
                this.parts.push(stringPart);
                this.currentLength += stringPart.length;
                
                if (this.currentLength > this.capacity) {
                    debugLog("String builder exceeding capacity: " + this.currentLength, "MEMORY");
                }
            }
        },
        
        appendLine: function(stringValue) {
            this.append(stringValue + "\n");
        },
        
        toString: function() {
            return this.parts.join("");
        },
        
        clear: function() {
            this.parts = [];
            this.currentLength = 0;
        },
        
        getLength: function() {
            return this.currentLength;
        }
    };
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getSystemStatus() {
    var status = {
        environment: validateEnvironment(),
        memory: checkMemoryUsage(),
        safetyMode: getCurrentSafetyMode(),
        targetsEnabled: getEnabledTargets().length,
        analysisActive: isAnalysisActive(),
        errorCount: QUERY_CONFIG.runtime.errorCount,
        emergencyBailouts: QUERY_CONFIG.runtime.emergencyBailouts,
        timestamp: toISOString(new Date())
    };
    
    return status;
}

$.writeln("Module 1.0: Enhanced Configuration & Safety Framework loaded (All reserved words fixed)");