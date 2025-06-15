// ============================================================================
// MODULE 1.0: CONFIGURATION & SAFETY FRAMEWORK (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced Safety & ES3 Compliance
// ES3 Compatible - Core Configuration with Best Practice Safety
// ============================================================================

// GLOBAL CONFIGURATION - Enhanced with best practices from chunks
var QUERY_CONFIG = {
    version: "3.1-enhanced",
    
    // SAFETY FRAMEWORK - Inherited from chunk wisdom
    safety: {
        useEmergencyFunctions: true,
        emergencyTimeoutMs: 500,
        maxMemoryMB: 16,
        enableProgressTracking: true,
        enableDOMSafeAccess: true,
        preventHanging: true
    },
    
    // ANALYSIS TARGETS - Configurable analysis elements
    targets: {
        documentProperties: { enabled: true, safe: true, description: "Core document info" },
        pages: { enabled: true, safe: true, description: "Page collection" },
        textFrames: { enabled: true, safe: true, description: "Text frame objects" },
        stories: { enabled: true, safe: true, description: "Story objects" },
        layers: { enabled: true, safe: true, description: "Layer information" },
        images: { enabled: false, safe: false, description: "Image objects (slow)" },
        links: { enabled: false, safe: false, description: "Link information (slow)" },
        pageItems: { enabled: false, safe: false, description: "All page items (very slow)" },
        styles: { enabled: true, safe: true, description: "Paragraph/character styles" },
        colors: { enabled: true, safe: true, description: "Color definitions" },
        fonts: { enabled: true, safe: true, description: "Font information" },
        masterPages: { enabled: false, safe: true, description: "Master page info" }
    },
    
    // TRAVERSAL SETTINGS - Controls depth and scope
    traversal: {
        maxDepth: 3,
        sampleLimit: 5,
        timeoutMs: 3000,
        showEmpty: false,
        showUndefined: false,
        emergencyBailouts: true,
        verboseProgress: false,
        pathTracking: true
    },
    
    // PATHS - File system paths
    paths: {
        documentPath: "",
        outputPath: ""
    },
    
    // PROGRESS TRACKING - Real-time status
    progress: {
        currentTarget: "",
        currentPath: "",
        currentResult: "",
        completedTargets: 0,
        totalTargets: 0,
        percentage: 0,
        status: "ready"
    },
    
    // RUNTIME STATE - Execution control
    runtime: {
        analysisActive: false,
        startTime: 0,
        results: {},
        progressCallback: undefined,
        errorCount: 0,
        successCount: 0
    }
};

// PRESET CONFIGURATIONS - Quick setup options
var QUERY_PRESETS = {
    basicSafe: {
        name: "Basic Safe",
        description: "Only safest collections, depth 2, 5 samples",
        config: {
            targets: ["documentProperties", "pages", "textFrames", "layers"],
            maxDepth: 2,
            sampleLimit: 5,
            timeoutMs: 2000
        }
    },
    textOnly: {
        name: "Text Analysis Only",
        description: "Focus on text-related properties",
        config: {
            targets: ["documentProperties", "textFrames", "stories"],
            maxDepth: 3,
            sampleLimit: 10,
            timeoutMs: 3000
        }
    },
    fullScan: {
        name: "Complete Document Scan",
        description: "All collections with safety limits",
        config: {
            targets: ["documentProperties", "pages", "textFrames", "stories", "layers", "styles", "colors", "fonts"],
            maxDepth: 4,
            sampleLimit: 8,
            timeoutMs: 5000
        }
    }
};

// ============================================================================
// BEST PRACTICE SAFETY FUNCTIONS - Inherited from chunk analysis
// ============================================================================

// EMERGENCY PROPERTY ACCESS - Ultra-safe with zero hanging risk
function emergencyGetProperty(obj, prop, defaultVal) {
    var startTime = new Date().getTime();
    var maxTime = QUERY_CONFIG.safety.emergencyTimeoutMs;
    
    try {
        updateProgress("property", "obj." + prop, "emergency access", "working");
        
        if (!obj) {
            updateProgress("property", "obj." + prop, "object is undefined", "undefined");
            return { value: defaultVal, status: "undefined_object", path: "obj." + prop };
        }
        
        // Timeout check before property access
        if (new Date().getTime() - startTime > maxTime) {
            updateProgress("property", "obj." + prop, "EMERGENCY TIMEOUT", "timeout");
            return { value: defaultVal, status: "emergency_timeout", path: "obj." + prop };
        }
        
        var value = defaultVal;
        
        // Ultra-safe property access
        if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
            value = obj[prop];
        } else if (typeof obj[prop] !== "undefined") {
            value = obj[prop];
        }
        
        var result = analyzeValueSafely(value, "obj." + prop);
        updateProgress("property", "obj." + prop, result.description, result.status);
        
        return {
            value: value,
            status: result.status,
            type: result.type,
            description: result.description,
            path: "obj." + prop,
            processingTime: new Date().getTime() - startTime
        };
        
    } catch (exc) {
        updateProgress("property", "obj." + prop, "ERROR: " + exc.message, "error");
        QUERY_CONFIG.runtime.errorCount++;
        return { 
            value: defaultVal, 
            status: "error", 
            error: exc.message, 
            path: "obj." + prop,
            processingTime: new Date().getTime() - startTime
        };
    }
}

// SAFE VALUE ANALYSIS - Analyze value without null keyword issues
function analyzeValueSafely(value, path) {
    if (typeof value === "undefined") {
        return { status: "undefined", type: "undefined", description: "undefined" };
    }
    if (value === "") {
        return { status: "empty", type: "string", description: "empty string" };
    }
    if (value && typeof value === "string") {
        var preview = value.length > 50 ? value.substring(0, 50) + "..." : value;
        return { status: "success", type: "string", description: preview };
    }
    if (typeof value === "number") {
        return { status: "success", type: "number", description: String(value) };
    }
    if (typeof value === "boolean") {
        return { status: "success", type: "boolean", description: String(value) };
    }
    if (typeof value === "object") {
        if (value === undefined || !value) {
            return { status: "empty_object", type: "object", description: "empty or undefined object" };
        }
        return { status: "success", type: "object", description: "object" };
    }
    
    return { status: "unknown", type: typeof value, description: "unknown type" };
}

// EMERGENCY LENGTH GETTER - Safe collection length with timeout
function emergencyGetLength(collection, maxTimeMs) {
    var startTime = new Date().getTime();
    var timeout = maxTimeMs || QUERY_CONFIG.safety.emergencyTimeoutMs;
    
    try {
        if (!collection) {
            return { length: 0, status: "undefined_collection" };
        }
        
        // Check timeout before access
        if (new Date().getTime() - startTime > timeout) {
            return { length: 0, status: "emergency_timeout" };
        }
        
        var length = 0;
        
        // Try multiple safe length access methods
        if (typeof collection.length !== "undefined") {
            length = collection.length;
        } else if (typeof collection.count !== "undefined") {
            length = collection.count;
        } else if (collection.hasOwnProperty && collection.hasOwnProperty("length")) {
            length = collection.length;
        }
        
        return { 
            length: length, 
            status: "success",
            processingTime: new Date().getTime() - startTime
        };
        
    } catch (exc) {
        QUERY_CONFIG.runtime.errorCount++;
        return { 
            length: 0, 
            status: "error", 
            error: exc.message,
            processingTime: new Date().getTime() - startTime
        };
    }
}

// PROGRESS UPDATE FUNCTION - Enhanced tracking
function updateProgress(target, path, result, status) {
    QUERY_CONFIG.progress.currentTarget = target || "";
    QUERY_CONFIG.progress.currentPath = path || "";
    QUERY_CONFIG.progress.currentResult = result || "";
    QUERY_CONFIG.progress.status = status || "working";
    
    // Calculate percentage
    if (QUERY_CONFIG.progress.totalTargets > 0) {
        QUERY_CONFIG.progress.percentage = Math.floor(
            (QUERY_CONFIG.progress.completedTargets / QUERY_CONFIG.progress.totalTargets) * 100
        );
    }
    
    // Count successes and errors
    if (status === "success") {
        QUERY_CONFIG.runtime.successCount++;
    } else if (status === "error") {
        QUERY_CONFIG.runtime.errorCount++;
    }
    
    // Call progress callback if available
    if (QUERY_CONFIG.runtime.progressCallback && typeof QUERY_CONFIG.runtime.progressCallback === "function") {
        try {
            QUERY_CONFIG.runtime.progressCallback(QUERY_CONFIG.progress);
        } catch (e) {
            // Ignore callback errors
        }
    }
    
    // Console logging for debugging
    if (QUERY_CONFIG.traversal.verboseProgress) {
        $.writeln("[PROGRESS] " + target + " | " + path + " | " + result + " | " + status);
    }
}

// ============================================================================
// PRESET MANAGEMENT - Quick configuration setup
// ============================================================================

function applyPreset(presetName) {
    if (!QUERY_PRESETS[presetName]) {
        updateProgress("preset", presetName, "Preset not found", "error");
        return false;
    }
    
    var preset = QUERY_PRESETS[presetName];
    updateProgress("preset", presetName, "Applying preset configuration", "working");
    
    // Reset all targets first
    for (var target in QUERY_CONFIG.targets) {
        QUERY_CONFIG.targets[target].enabled = false;
    }
    
    // Enable preset targets
    for (var i = 0; i < preset.config.targets.length; i++) {
        var targetName = preset.config.targets[i];
        if (QUERY_CONFIG.targets[targetName]) {
            QUERY_CONFIG.targets[targetName].enabled = true;
        }
    }
    
    // Apply other settings
    QUERY_CONFIG.traversal.maxDepth = preset.config.maxDepth;
    QUERY_CONFIG.traversal.sampleLimit = preset.config.sampleLimit;
    QUERY_CONFIG.traversal.timeoutMs = preset.config.timeoutMs;
    
    updateProgress("preset", presetName, "applied", "success");
    return true;
}

// UTILITY FUNCTIONS - ES3 compatible helpers
function getEnabledTargets() {
    var enabled = [];
    for (var target in QUERY_CONFIG.targets) {
        if (QUERY_CONFIG.targets[target].enabled) {
            enabled.push(target);
        }
    }
    return enabled;
}

function resetProgress() {
    QUERY_CONFIG.progress.currentTarget = "";
    QUERY_CONFIG.progress.currentPath = "";
    QUERY_CONFIG.progress.currentResult = "";
    QUERY_CONFIG.progress.completedTargets = 0;
    QUERY_CONFIG.progress.totalTargets = 0;
    QUERY_CONFIG.progress.percentage = 0;
    QUERY_CONFIG.progress.status = "ready";
    QUERY_CONFIG.runtime.errorCount = 0;
    QUERY_CONFIG.runtime.successCount = 0;
}

function isAnalysisActive() {
    return QUERY_CONFIG.runtime.analysisActive;
}

// MEMORY MANAGEMENT - Enhanced cleanup
function performMemoryCleanup() {
    try {
        updateProgress("memory", "cleanup", "Performing memory cleanup", "working");
        
        // Clear runtime data
        QUERY_CONFIG.runtime.results = {};
        
        // Garbage collection hint
        if (typeof $.gc === "function") {
            $.gc();
        }
        
        updateProgress("memory", "cleanup", "Memory cleanup completed", "success");
    } catch (e) {
        updateProgress("memory", "cleanup", "Memory cleanup failed: " + e.message, "error");
    }
}

// ES3 COMPATIBILITY HELPERS - Safe array functions
function indexOf(array, searchElement) {
    if (!array || !array.length) return -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === searchElement) {
            return i;
        }
    }
    return -1;
}

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

// ENVIRONMENT VALIDATION - Check for required features
function validateEnvironment() {
    var checks = {
        indesign: typeof app !== "undefined" && app.name.indexOf("InDesign") !== -1,
        documents: typeof app !== "undefined" && typeof app.documents !== "undefined",
        filesystem: typeof File !== "undefined" && typeof Folder !== "undefined",
        ui: typeof Window !== "undefined"
    };
    
    var allPassed = true;
    for (var check in checks) {
        if (!checks[check]) {
            allPassed = false;
            updateProgress("environment", check, "Environment check failed", "error");
        }
    }
    
    if (allPassed) {
        updateProgress("environment", "validation", "Environment validation passed", "success");
    }
    
    return allPassed;
}

$.writeln("Module 1.0: Enhanced Configuration & Safety Framework loaded");