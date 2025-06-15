// ============================================================================
// MODULE 1.0: CORE CONFIGURATION & SAFETY FRAMEWORK
// InDesign Document Query Tool v3.0 - Configurable Analysis
// ES3 Compatible - Lightweight & Targeted
// ============================================================================

// QUERY TOOL CONFIGURATION - Simplified and Focused
var QUERY_CONFIG = {
    version: "3.0-query-tool",
    
    // Analysis targets with user control
    targets: {
        documentProperties: { enabled: true, safe: true, timeout: 100 },
        pages: { enabled: true, safe: true, timeout: 200 },
        textFrames: { enabled: true, safe: true, timeout: 300 },
        stories: { enabled: true, safe: false, timeout: 500 },
        layers: { enabled: true, safe: true, timeout: 150 },
        images: { enabled: false, safe: false, timeout: 1000 },
        links: { enabled: false, safe: false, timeout: 1000 },
        pageItems: { enabled: false, safe: false, timeout: 800 },
        styles: { enabled: true, safe: true, timeout: 300 },
        colors: { enabled: true, safe: true, timeout: 200 },
        fonts: { enabled: true, safe: true, timeout: 200 },
        masterPages: { enabled: false, safe: false, timeout: 400 }
    },
    
    // Traversal settings
    traversal: {
        maxDepth: 3,
        sampleLimit: 10,
        timeoutMs: 500,
        showEmpty: true,
        showNull: true,
        showBroken: true,
        verboseProgress: true,
        pathTracking: true,
        emergencyBailouts: true
    },
    
    // Progress tracking
    progress: {
        currentTarget: "",
        currentPath: "",
        totalTargets: 0,
        completedTargets: 0,
        currentResult: "",
        status: "ready"
    },
    
    // File paths
    paths: {
        documentPath: "",
        outputPath: "",
        currentDocument: null
    },
    
    // Runtime state
    runtime: {
        analysisActive: false,
        startTime: 0,
        results: {},
        progressCallback: null
    }
};

// PROGRESS TRACKING SYSTEM - Visual feedback for user
function updateProgress(target, path, result, status) {
    QUERY_CONFIG.progress.currentTarget = target || "";
    QUERY_CONFIG.progress.currentPath = path || "";
    QUERY_CONFIG.progress.currentResult = result || "";
    QUERY_CONFIG.progress.status = status || "working";
    
    // Update progress percentage
    if (QUERY_CONFIG.progress.totalTargets > 0) {
        var percentage = Math.round((QUERY_CONFIG.progress.completedTargets / QUERY_CONFIG.progress.totalTargets) * 100);
        QUERY_CONFIG.progress.percentage = percentage;
    }
    
    // Call progress callback if set (for UI updates)
    if (QUERY_CONFIG.runtime.progressCallback && typeof QUERY_CONFIG.runtime.progressCallback === 'function') {
        QUERY_CONFIG.runtime.progressCallback(QUERY_CONFIG.progress);
    }
    
    // Console logging for ESTK debugging
    var timestamp = new Date().toLocaleTimeString();
    var resultSymbol = getResultSymbol(result, status);
    $.writeln("[QUERY] [" + timestamp + "] " + target + ": " + path + " → " + result + " " + resultSymbol);
}

function getResultSymbol(result, status) {
    if (status === "error" || status === "timeout") return "✗";
    if (status === "empty" || status === "null") return "⚠";
    if (status === "success" || result) return "✓";
    return "?";
}

// SAFE PROPERTY ACCESS - Inherited from chunk wisdom
function queryGetProperty(obj, prop, defaultValue) {
    var startTime = new Date().getTime();
    var timeout = QUERY_CONFIG.traversal.timeoutMs;
    var path = "obj." + prop;
    
    try {
        updateProgress("property", path, "accessing...", "working");
        
        if (!obj) {
            updateProgress("property", path, "null object", "null");
            return { value: null, status: "null_object", path: path };
        }
        
        // Check timeout
        if (new Date().getTime() - startTime > timeout) {
            updateProgress("property", path, "TIMEOUT", "timeout");
            return { value: defaultValue, status: "timeout", path: path };
        }
        
        var value = null;
        
        // Try hasOwnProperty first (safest)
        if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
            value = obj[prop];
        } else if (obj[prop] !== undefined) {
            value = obj[prop];
        }
        
        var result = analyzeValue(value, path);
        updateProgress("property", path, result.description, result.status);
        
        return {
            value: value,
            status: result.status,
            type: result.type,
            description: result.description,
            path: path,
            processingTime: new Date().getTime() - startTime
        };
        
    } catch (exc) {
        updateProgress("property", path, "ERROR: " + exc.message, "error");
        return { 
            value: defaultValue, 
            status: "error", 
            error: exc.message, 
            path: path,
            processingTime: new Date().getTime() - startTime
        };
    }
}

function analyzeValue(value, path) {
    if (value === null) {
        return { status: "null", type: "null", description: "null" };
    }
    if (value === undefined) {
        return { status: "undefined", type: "undefined", description: "undefined" };
    }
    if (value === "") {
        return { status: "empty", type: "string", description: "empty string" };
    }
    if (typeof value === "string") {
        var preview = value.length > 50 ? value.substring(0, 50) + "..." : value;
        return { status: "success", type: "string", description: '"' + preview + '"' };
    }
    if (typeof value === "number") {
        return { status: "success", type: "number", description: value.toString() };
    }
    if (typeof value === "boolean") {
        return { status: "success", type: "boolean", description: value.toString() };
    }
    if (typeof value === "object" && value.constructor === Array) {
        return { status: "success", type: "array", description: "Array[" + value.length + "]" };
    }
    if (typeof value === "object") {
        return { status: "success", type: "object", description: "Object{...}" };
    }
    
    return { status: "success", type: typeof value, description: String(value) };
}

// SAFE COLLECTION ACCESS - Inherited wisdom with query focus
function queryGetCollection(doc, collectionName) {
    var target = QUERY_CONFIG.targets[collectionName];
    if (!target || !target.enabled) {
        updateProgress(collectionName, "doc." + collectionName, "DISABLED", "disabled");
        return { collection: null, status: "disabled", reason: "Collection disabled in config" };
    }
    
    var startTime = new Date().getTime();
    var timeout = target.timeout || QUERY_CONFIG.traversal.timeoutMs;
    var path = "doc." + collectionName;
    
    try {
        updateProgress(collectionName, path, "accessing collection...", "working");
        
        // Quick timeout check for dangerous collections
        if (!target.safe && timeout > 200) {
            timeout = 200; // Force shorter timeout for unsafe collections
        }
        
        if (new Date().getTime() - startTime > timeout) {
            updateProgress(collectionName, path, "TIMEOUT", "timeout");
            return { collection: null, status: "timeout", reason: "Collection access timeout" };
        }
        
        var collection = doc[collectionName];
        
        if (!collection) {
            updateProgress(collectionName, path, "NULL", "null");
            return { collection: null, status: "null", reason: "Collection is null" };
        }
        
        // Get length safely
        var length = 0;
        try {
            if (typeof collection.length === 'number') {
                length = collection.length;
            } else if (typeof collection.count === 'number') {
                length = collection.count;
            }
        } catch (lengthError) {
            updateProgress(collectionName, path, "LENGTH ERROR", "error");
            return { collection: null, status: "error", reason: "Cannot get collection length" };
        }
        
        updateProgress(collectionName, path, "Collection[" + length + "]", "success");
        
        return {
            collection: collection,
            status: "success",
            length: length,
            path: path,
            processingTime: new Date().getTime() - startTime
        };
        
    } catch (exc) {
        updateProgress(collectionName, path, "ERROR: " + exc.message, "error");
        return { 
            collection: null, 
            status: "error", 
            error: exc.message, 
            reason: "Collection access failed",
            path: path,
            processingTime: new Date().getTime() - startTime
        };
    }
}

// DOM TREE NODE CREATION - Structure for tree output
function createTreeNode(name, value, type, status, path, children) {
    return {
        name: name || "unknown",
        value: value,
        type: type || "unknown",
        status: status || "unknown",
        path: path || "",
        children: children || [],
        hasChildren: children && children.length > 0,
        expanded: false,
        depth: (path.split('.').length - 1)
    };
}

// EMERGENCY BAILOUT - Prevent hanging with timeout wrapper
function queryEmergencyBailout(operation, timeoutMs, operationName) {
    var startTime = new Date().getTime();
    var timeout = timeoutMs || QUERY_CONFIG.traversal.timeoutMs;
    var name = operationName || "operation";
    
    updateProgress("bailout", name, "starting...", "working");
    
    try {
        var result = operation();
        var duration = new Date().getTime() - startTime;
        
        if (duration > timeout) {
            updateProgress("bailout", name, "TIMEOUT (" + duration + "ms)", "timeout");
            return { bailout: true, duration: duration, timeout: timeout, result: null };
        }
        
        updateProgress("bailout", name, "completed (" + duration + "ms)", "success");
        return { bailout: false, duration: duration, result: result };
        
    } catch (exc) {
        var duration = new Date().getTime() - startTime;
        updateProgress("bailout", name, "ERROR: " + exc.message, "error");
        return { bailout: true, duration: duration, error: exc.message, result: null };
    }
}

// CONFIGURATION PRESETS - Quick setup options
var QUERY_PRESETS = {
    basicSafe: {
        name: "Basic Safe",
        description: "Only safe collections with minimal depth",
        config: {
            targets: ["documentProperties", "pages", "layers"],
            maxDepth: 2,
            sampleLimit: 5,
            timeoutMs: 300
        }
    },
    
    textOnly: {
        name: "Text Analysis",
        description: "Focus on text content and frames",
        config: {
            targets: ["documentProperties", "textFrames", "stories", "styles", "fonts"],
            maxDepth: 3,
            sampleLimit: 10,
            timeoutMs: 500
        }
    },
    
    fullScan: {
        name: "Complete Scan",
        description: "All available collections with safety limits",
        config: {
            targets: ["documentProperties", "pages", "textFrames", "stories", "layers", "styles", "colors", "fonts"],
            maxDepth: 4,
            sampleLimit: 15,
            timeoutMs: 800
        }
    }
};

function applyPreset(presetName) {
    var preset = QUERY_PRESETS[presetName];
    if (!preset) return false;
    
    // Disable all targets first
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
}

function isAnalysisActive() {
    return QUERY_CONFIG.runtime.analysisActive;
}

$.writeln("Module A: Core Configuration & Safety Framework loaded");