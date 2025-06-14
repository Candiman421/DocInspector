//
// Enhanced InDesign Document Inspector & Comparison Tool v2.1 - ESTK Optimized Edition  
// Robust property change detection with API error handling
// Chunk 1: Core Configuration & Utility Functions
// Optimized for ExtendScript Toolkit (ESTK) development environment
//

// ROBUST CONFIGURATION FOR CLUNKY INDESIGN APIS
var ANALYSIS_CONFIG = {
    version: "2.1-estk",
    maxRecursionDepth: 3, // Balanced for thorough analysis without recursion hell
    enableDeepScan: false, // Keep disabled for performance
    skipEmptyProperties: true,
    timeoutThreshold: 8000, // 8 seconds for complex documents
    safeMode: true,
    logErrors: true,
    errors: [],
    maxErrorsPerSection: 5, // More error tracking for API issues
    skipProblematicProperties: true,
    
    // ENHANCED TEXT CAPTURE - PROPER IDENTIFICATION + CHANGE DETECTION
    enableTextCapture: true,
    enableAutoDiscovery: false, // Disabled to avoid recursive discovery
    enablePropertyTracking: true, // ESSENTIAL for change detection
    maxTextPreviewLength: 60, // Increased for better identification
    maxCollectionSample: 20, // Increased for thorough change detection
    maxReportSize: 3000000, // 3MB limit - larger for comprehensive analysis
    
    // Runtime tracking - ESSENTIAL for change detection
    textItemsProcessed: 0,
    processingStartTime: null,
    brokenPropertiesFound: [],
    discoveredAlternatives: {},
    
    // Known problematic properties with ESTK-tested alternatives
    problematicProperties: [
        'parent.parent.parent',
        'selection.item', 
        'activeWindow.panels',
        'preferences.dictionary',
        'preferences.workspace',
        'links.parent.parent'
    ],
    
    // ESTK debugging enabled
    enableESTKDebugging: true,
    debugPrefix: "[InDesign Inspector]"
};

// Utility configuration  
var UTILITY_CONFIG = {
    version: "2.1-estk",
    requiredInspectorVersion: "2.1-estk", 
    enableProgressDialogs: true,
    maxReportFileSize: 10000000, // 10MB limit for comprehensive reports
    autoSaveReports: true,
    createBackups: true, // ESSENTIAL for safety
    enableESTKDebugging: true
};

// Global state
var UTILITY_STATE = {
    lastAnalysisReport: null,
    lastComparisonResult: null,
    currentDocument: null,
    reportFiles: {}
};

// ============================================================================
// CORE UTILITY FUNCTIONS - ESTK OPTIMIZED WITH ROBUST ERROR HANDLING
// ============================================================================

// ESTK debugging function - CRITICAL for development
function debugLog(message, category) {
    if (ANALYSIS_CONFIG.enableESTKDebugging) {
        var timestamp = new Date().toLocaleTimeString();
        var logMessage = ANALYSIS_CONFIG.debugPrefix + " [" + timestamp + "] [" + (category || "INFO") + "] " + message;
        $.writeln(logMessage);
    }
}

// Enhanced status logging for complex operations
function statusLog(operation, details, progress) {
    if (ANALYSIS_CONFIG.enableESTKDebugging) {
        var progressStr = progress ? " (" + progress + "%)" : "";
        $.writeln("[STATUS] " + operation + progressStr + ": " + details);
    }
}

// Memory management and cleanup
function clearLargeObjects() {
    try {
        debugLog("Clearing large objects from memory", "MEMORY");
        ANALYSIS_CONFIG.errors = [];
        ANALYSIS_CONFIG.brokenPropertiesFound = [];
        UTILITY_STATE.lastAnalysisReport = null;
        UTILITY_STATE.lastComparisonResult = null;
        $.gc(); // Garbage collection hint
        debugLog("Memory cleanup completed", "MEMORY");
    } catch (e) {
        debugLog("Memory cleanup failed: " + e.message, "ERROR");
    }
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

// ENHANCED text capture - BETTER IDENTIFICATION (50-60 chars for proper change detection)
function safeTextCapture(textFrame) {
    try {
        if (!textFrame || !textFrame.contents) {
            return "[NO TEXT]";
        }
        
        var content = textFrame.contents;
        if (typeof content !== 'string') {
            return "[NON-STRING]";
        }
        
        // Enhanced limit for proper identification - meaningful content preview
        var preview = content.substring(0, 60).replace(/\s+/g, ' ').trim();
        if (content.length > 60) {
            preview += "...";
        }
        
        return preview || "[EMPTY]";
    } catch (e) {
        debugLog("Text capture failed: " + e.message, "ERROR");
        return "[ERROR:" + e.message.substring(0, 15) + "]";
    }
}

// ROBUST property accessor with API error categorization and recovery
function safeGetProperty(obj, prop, defaultValue) {
    try {
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Skip known problematic properties
        if (typeof prop === 'string') {
            for (var i = 0; i < ANALYSIS_CONFIG.problematicProperties.length; i++) {
                if (prop.indexOf(ANALYSIS_CONFIG.problematicProperties[i]) !== -1) {
                    debugLog("Skipping problematic property: " + prop, "SKIP");
                    return defaultValue !== undefined ? defaultValue : null;
                }
            }
        }
        
        // Handle array-like access with bounds checking
        if (typeof prop === 'number') {
            if (obj.length !== undefined && prop >= 0 && prop < obj.length) {
                var value = obj[prop];
                return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
            }
            debugLog("Array index out of bounds: " + prop, "WARN");
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Enhanced string property access with multiple fallbacks
        if (typeof prop === 'string') {
            // Method 1: hasOwnProperty (safest)
            if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
                var value = obj[prop];
                return value !== undefined ? value : (defaultValue !== undefined ? defaultValue : null);
            }
            
            // Method 2: Direct access fallback
            if (obj[prop] !== undefined) {
                return obj[prop];
            }
            
            // Method 3: Try alternative property names for InDesign inconsistencies
            var alternatives = getPropertyAlternatives(prop);
            for (var i = 0; i < alternatives.length; i++) {
                try {
                    if (obj[alternatives[i]] !== undefined) {
                        debugLog("Used alternative property: " + alternatives[i] + " for " + prop, "ALT");
                        // Store successful alternative for future use
                        ANALYSIS_CONFIG.discoveredAlternatives[prop] = alternatives[i];
                        return obj[alternatives[i]];
                    }
                } catch (e) {
                    // Continue to next alternative
                }
            }
        }
        
        return defaultValue !== undefined ? defaultValue : null;
    } catch (e) {
        if (ANALYSIS_CONFIG.logErrors) {
            logError("Property access failed: " + prop + " - " + e.message, 'propertyAccess', 'medium');
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Get alternative property names for InDesign API inconsistencies
function getPropertyAlternatives(prop) {
    var alternatives = [];
    
    // Common InDesign property name variations
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
    
    if (alternativeMap[prop]) {
        alternatives = alternativeMap[prop];
    }
    
    return alternatives;
}

// Enhanced error logging with API error categorization
function logError(message, category, severity) {
    try {
        if (!ANALYSIS_CONFIG.errors) {
            ANALYSIS_CONFIG.errors = [];
        }
        
        var errorEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            category: category || 'general',
            severity: severity || 'medium',
            apiCategory: categorizeAPIError(message)
        };
        
        ANALYSIS_CONFIG.errors.push(errorEntry);
        debugLog("Error logged: " + message, "ERROR");
        
        // Limit error log size
        if (ANALYSIS_CONFIG.errors.length > 100) {
            ANALYSIS_CONFIG.errors.splice(0, 50);
        }
    } catch (e) {
        debugLog("Failed to log error: " + e.message, "CRITICAL");
    }
}

// Categorize API errors for better troubleshooting
function categorizeAPIError(errorMessage) {
    var msg = errorMessage.toLowerCase();
    
    if (msg.indexOf('object does not support') !== -1) {
        return 'unsupported_property';
    } else if (msg.indexOf('access denied') !== -1) {
        return 'access_denied';
    } else if (msg.indexOf('invalid index') !== -1) {
        return 'invalid_index';
    } else if (msg.indexOf('timeout') !== -1) {
        return 'timeout';
    } else if (msg.indexOf('permission') !== -1) {
        return 'permission_error';
    } else if (msg.indexOf('not found') !== -1) {
        return 'not_found';
    } else {
        return 'unknown';
    }
}

// Safe collection length getter with multiple fallbacks
function safeGetLength(collection) {
    try {
        if (!collection) return 0;
        
        // Try standard length property
        if (typeof collection.length !== 'undefined') return collection.length;
        
        // Try InDesign's count property
        if (typeof collection.count !== 'undefined') return collection.count;
        
        // Try accessing through DOM if available
        try {
            var tempLength = 0;
            for (var i = 0; i < 1000; i++) { // Reasonable limit
                if (collection[i] !== undefined) {
                    tempLength++;
                } else {
                    break;
                }
            }
            return tempLength;
        } catch (e) {
            debugLog("Could not determine collection length", "WARN");
            return 0;
        }
    } catch (e) {
        debugLog("Collection length access failed: " + e.message, "ERROR");
        return 0;
    }
}

// ROBUST collection iterator with enhanced error handling for InDesign APIs
function safeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) return [];
    
    var results = [];
    var startTime = new Date().getTime();
    maxItems = Math.min(maxItems || 20, 25); // Increased limit for better change detection
    
    debugLog("Starting collection iteration: " + (collectionName || "unknown"), "ITER");
    
    try {
        var length = safeGetLength(collection);
        debugLog("Collection length: " + length, "ITER");
        
        if (length === 0) {
            debugLog("Empty collection: " + (collectionName || "unknown"), "ITER");
            return results;
        }
        
        for (var i = 0; i < Math.min(length, maxItems); i++) {
            // Timeout protection with reasonable limit
            if (new Date().getTime() - startTime > 10000) { // 10 second limit per collection
                debugLog("Collection iteration timed out at item " + i, "TIMEOUT");
                results.push({
                    notice: "Processing timed out at item " + i + " of " + length,
                    timeout: true,
                    collectionName: collectionName || "unknown"
                });
                break;
            }
            
            try {
                var item = null;
                
                // Try multiple access methods for robust InDesign API handling
                try {
                    item = collection[i]; // Standard array access
                } catch (e1) {
                    try {
                        item = collection.item(i); // InDesign .item() method
                    } catch (e2) {
                        try {
                            // Try itemByRange as last resort
                            var rangeResult = collection.itemByRange(i, i);
                            if (rangeResult && rangeResult.length > 0) {
                                item = rangeResult[0];
                            }
                        } catch (e3) {
                            debugLog("Failed all access methods for item " + i + ": " + e3.message, "ERROR");
                            continue;
                        }
                    }
                }
                
                if (item) {
                    var result = callback(item, i);
                    if (result !== null && result !== undefined) {
                        results.push(result);
                    }
                }
            } catch (itemError) {
                // Enhanced error reporting for API issues
                var errorInfo = {
                    error: "Item processing failed",
                    index: i,
                    errorType: categorizeAPIError(itemError.message),
                    collectionName: collectionName || "unknown",
                    recoverable: true
                };
                
                debugLog("Item " + i + " processing failed: " + itemError.message, "ERROR");
                
                // Only add error to results if it's the first few items (important for debugging)
                if (i < 3) {
                    results.push(errorInfo);
                }
            }
        }
        
        // Add truncation notice with helpful information
        if (length > maxItems) {
            results.push({
                notice: "Collection truncated for performance",
                totalItems: length,
                shownItems: maxItems,
                collectionName: collectionName || "unknown",
                recommendation: "Increase maxCollectionSample if needed for more thorough analysis"
            });
        }
        
        debugLog("Collection iteration completed: " + results.length + " results", "ITER");
        
    } catch (e) {
        var collectionError = {
            error: "Collection iteration failed: " + e.message,
            collectionName: collectionName || "unknown",
            errorType: categorizeAPIError(e.message),
            recoverable: false
        };
        
        debugLog("Collection iteration failed: " + e.message, "CRITICAL");
        results.push(collectionError);
        
        if (ANALYSIS_CONFIG.logErrors) {
            logError("Collection iteration failed for " + (collectionName || "unknown") + ": " + e.message, 'collection', 'high');
        }
    }
    
    return results;
}

// Enhanced section analyzer with robust timeout and retry logic
function safeAnalyzeSection(sectionName, analyzeFunction) {
    var startTime = new Date().getTime();
    var sectionConfig = {
        name: sectionName,
        timeout: ANALYSIS_CONFIG.timeoutThreshold,
        retryCount: 0,
        maxRetries: 2
    };
    
    debugLog("Starting section analysis: " + sectionName, "SECTION");
    statusLog("Section Analysis", sectionName, 0);
    
    function attemptAnalysis() {
        try {
            var result = analyzeFunction();
            var duration = new Date().getTime() - startTime;
            
            debugLog("Section " + sectionName + " completed in " + duration + "ms", "SECTION");
            statusLog("Section Analysis", sectionName + " completed", 100);
            
            if (duration > sectionConfig.timeout) {
                if (sectionConfig.retryCount < sectionConfig.maxRetries) {
                    sectionConfig.retryCount++;
                    sectionConfig.timeout *= 1.5; // Increase timeout for retry
                    debugLog("Section " + sectionName + " timed out, retrying with extended timeout", "RETRY");
                    return attemptAnalysis();
                } else {
                    logError("Section " + sectionName + " timed out after " + duration + "ms with " + sectionConfig.retryCount + " retries", 'timeout', 'high');
                    return {
                        error: "Section analysis timed out",
                        timeout: true,
                        duration: duration,
                        retryCount: sectionConfig.retryCount,
                        sectionName: sectionName,
                        partialData: result
                    };
                }
            }
            
            return result;
            
        } catch (error) {
            debugLog("Section " + sectionName + " failed: " + error.message, "ERROR");
            
            if (sectionConfig.retryCount < sectionConfig.maxRetries && 
                error.message.indexOf('timeout') === -1) {
                sectionConfig.retryCount++;
                debugLog("Section " + sectionName + " failed, retrying: " + error.message, "RETRY");
                return attemptAnalysis();
            } else {
                logError("Section " + sectionName + " analysis failed: " + error.message, 'sectionFailure', 'high');
                return {
                    error: "Section analysis failed: " + error.message,
                    sectionName: sectionName,
                    line: error.line || "unknown",
                    recoverable: true,
                    retryCount: sectionConfig.retryCount,
                    errorType: categorizeAPIError(error.message)
                };
            }
        }
    }
    
    return attemptAnalysis();
}

// Enhanced memory and size limit checking
function checkMemoryLimits(dataSize, operation) {
    try {
        debugLog("Checking memory limits for " + operation + ": " + Math.round(dataSize / 1024) + "KB", "MEMORY");
        
        if (dataSize > ANALYSIS_CONFIG.maxReportSize) {
            debugLog("Report size limit exceeded: " + Math.round(dataSize / 1024 / 1024) + "MB", "WARN");
            alert("Report size limit exceeded (" + Math.round(dataSize / 1024 / 1024) + "MB).\nUsing summary mode for: " + operation);
            return false;
        }
        
        // Check available memory by testing object creation
        try {
            var testArray = new Array(1000);
            testArray = null;
            return true;
        } catch (memError) {
            debugLog("Low memory detected: " + memError.message, "WARN");
            alert("Low memory detected. Using minimal analysis mode.");
            return false;
        }
        
    } catch (e) {
        debugLog("Memory check failed: " + e.message, "ERROR");
        return true; // If we can't check, continue anyway
    }
}

// Helper function for string repetition
function repeatString(str, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += str;
    }
    return result;
}