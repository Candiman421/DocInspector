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

// ENHANCED text capture - BETTER IDENTIFICATION (50-60 chars for proper change detection) - FIXED
function safeTextCapture(textFrame) {
    try {
        if (!textFrame) {
            return "[NO TEXT]";
        }
        
        var content = safeGetProperty(textFrame, 'contents');
        if (!content || typeof content !== 'string') {
            return "[NO TEXT]";
        }
        
        // Enhanced limit for proper identification - meaningful content preview
        var preview = content.substring(0, ANALYSIS_CONFIG.maxTextPreviewLength).replace(/\s+/g, ' ').trim();
        if (content.length > ANALYSIS_CONFIG.maxTextPreviewLength) {
            preview += "...";
        }
        
        return preview || "[EMPTY]";
    } catch (e) {
        debugLog("Text capture failed: " + e.message, "ERROR");
        return "[ERROR:" + e.message.substring(0, 15) + "]";
    }
}

// BULLETPROOF property accessor - handles dotted paths, arrays, nulls, everything
function safeGetProperty(obj, prop, defaultValue) {
    try {
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
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
        
        // Handle string properties (simple and dotted paths)
        if (typeof prop === 'string') {
            // Skip known problematic properties
            for (var i = 0; i < ANALYSIS_CONFIG.problematicProperties.length; i++) {
                if (prop.indexOf(ANALYSIS_CONFIG.problematicProperties[i]) !== -1) {
                    debugLog("Skipping problematic property: " + prop, "SKIP");
                    return defaultValue !== undefined ? defaultValue : null;
                }
            }
            
            // Handle dotted paths like 'viewPreferences.horizontalMeasurementUnits'
            if (prop.indexOf('.') !== -1) {
                return safeGetNestedProperty(obj, prop, defaultValue);
            }
            
            // Handle simple properties with multiple fallback methods
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
            
            // Try multiple access methods for each part
            var nextValue = null;
            
            // Method 1: hasOwnProperty check
            if (current.hasOwnProperty && current.hasOwnProperty(part)) {
                nextValue = current[part];
            }
            // Method 2: Direct access
            else if (current[part] !== undefined) {
                nextValue = current[part];
            }
            // Method 3: Try alternatives
            else {
                var alternatives = getPropertyAlternatives(part);
                for (var j = 0; j < alternatives.length; j++) {
                    try {
                        if (current[alternatives[j]] !== undefined) {
                            nextValue = current[alternatives[j]];
                            debugLog("Used alternative: " + alternatives[j] + " for " + part, "ALT");
                            ANALYSIS_CONFIG.discoveredAlternatives[part] = alternatives[j];
                            break;
                        }
                    } catch (e) {
                        // Continue to next alternative
                    }
                }
            }
            
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
        
        // Method 3: Try alternative property names for InDesign inconsistencies
        var alternatives = getPropertyAlternatives(prop);
        for (var i = 0; i < alternatives.length; i++) {
            try {
                if (obj[alternatives[i]] !== undefined) {
                    debugLog("Used alternative property: " + alternatives[i] + " for " + prop, "ALT");
                    ANALYSIS_CONFIG.discoveredAlternatives[prop] = alternatives[i];
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

// Enhanced collection length getter with comprehensive fallbacks
function safeGetLength(collection) {
    try {
        if (!collection) return 0;
        
        // Handle null/undefined
        if (collection === null || collection === undefined) return 0;
        
        // Try standard length property
        if (typeof collection.length !== 'undefined' && collection.length !== null) {
            var len = collection.length;
            // Validate length is a reasonable number
            if (typeof len === 'number' && len >= 0 && len < 1000000) {
                return len;
            }
        }
        
        // Try InDesign's count property
        if (typeof collection.count !== 'undefined' && collection.count !== null) {
            var count = collection.count;
            if (typeof count === 'number' && count >= 0 && count < 1000000) {
                return count;
            }
        }
        
        // Try to enumerate items manually (with safety limit)
        try {
            var manualCount = 0;
            for (var i = 0; i < 1000; i++) { // Safety limit
                try {
                    var item = collection[i];
                    if (item === undefined || item === null) {
                        break;
                    }
                    manualCount++;
                } catch (e) {
                    break; // No more items
                }
            }
            if (manualCount > 0) {
                return manualCount;
            }
        } catch (e) {
            debugLog("Manual enumeration failed: " + e.message, "WARN");
        }
        
        // Try .item() method enumeration
        try {
            if (collection.item) {
                var itemCount = 0;
                for (var i = 0; i < 1000; i++) { // Safety limit
                    try {
                        var item = collection.item(i);
                        if (!item) break;
                        itemCount++;
                    } catch (e) {
                        break; // No more items
                    }
                }
                if (itemCount > 0) {
                    return itemCount;
                }
            }
        } catch (e) {
            debugLog("Item method enumeration failed: " + e.message, "WARN");
        }
        
        debugLog("Could not determine collection length, defaulting to 0", "WARN");
        return 0;
        
    } catch (e) {
        debugLog("Collection length access failed: " + e.message, "ERROR");
        return 0;
    }
}

// Enhanced collection iterator with maximum safety and error recovery
function safeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) {
        debugLog("Invalid collection or callback provided to safeIterateCollection", "WARN");
        return [];
    }
    
    var results = [];
    var startTime = new Date().getTime();
    maxItems = Math.min(maxItems || ANALYSIS_CONFIG.maxCollectionSample, 50); // Increased safety limit
    
    debugLog("Starting enhanced collection iteration: " + (collectionName || "unknown"), "ITER");
    
    try {
        var length = safeGetLength(collection);
        debugLog("Collection length determined: " + length, "ITER");
        
        if (length === 0) {
            debugLog("Empty collection: " + (collectionName || "unknown"), "ITER");
            return results;
        }
        
        // Enhanced iteration with multiple access methods
        for (var i = 0; i < Math.min(length, maxItems); i++) {
            // Enhanced timeout protection
            if (new Date().getTime() - startTime > ANALYSIS_CONFIG.timeoutThreshold) {
                debugLog("Collection iteration timed out at item " + i, "TIMEOUT");
                results.push({
                    notice: "Processing timed out at item " + i + " of " + length,
                    timeout: true,
                    collectionName: collectionName || "unknown",
                    timeoutThreshold: ANALYSIS_CONFIG.timeoutThreshold
                });
                break;
            }
            
            try {
                var item = null;
                var accessMethod = "unknown";
                
                // Method 1: Standard array access
                try {
                    item = collection[i];
                    accessMethod = "array[" + i + "]";
                    if (item) {
                        debugLog("Item " + i + " accessed via array method", "ITER_DETAIL");
                    }
                } catch (e1) {
                    debugLog("Array access failed for item " + i + ": " + e1.message, "ITER_DETAIL");
                }
                
                // Method 2: InDesign .item() method
                if (!item && collection.item) {
                    try {
                        item = collection.item(i);
                        accessMethod = "collection.item(" + i + ")";
                        if (item) {
                            debugLog("Item " + i + " accessed via .item() method", "ITER_DETAIL");
                        }
                    } catch (e2) {
                        debugLog(".item() access failed for item " + i + ": " + e2.message, "ITER_DETAIL");
                    }
                }
                
                // Method 3: itemByRange as last resort
                if (!item && collection.itemByRange) {
                    try {
                        var rangeResult = collection.itemByRange(i, i);
                        if (rangeResult && safeGetLength(rangeResult) > 0) {
                            item = rangeResult[0];
                            accessMethod = "collection.itemByRange(" + i + ", " + i + ")";
                            debugLog("Item " + i + " accessed via .itemByRange() method", "ITER_DETAIL");
                        }
                    } catch (e3) {
                        debugLog("itemByRange access failed for item " + i + ": " + e3.message, "ITER_DETAIL");
                    }
                }
                
                // Process item if we got it
                if (item) {
                    try {
                        var result = callback(item, i);
                        if (result !== null && result !== undefined) {
                            // Add access method info for debugging
                            if (typeof result === 'object') {
                                result._accessMethod = accessMethod;
                            }
                            results.push(result);
                        }
                    } catch (callbackError) {
                        debugLog("Callback failed for item " + i + ": " + callbackError.message, "ERROR");
                        // Add error info to results for debugging
                        results.push({
                            error: "Callback processing failed",
                            index: i,
                            errorMessage: callbackError.message,
                            accessMethod: accessMethod,
                            collectionName: collectionName || "unknown",
                            recoverable: true
                        });
                    }
                } else {
                    debugLog("Could not access item " + i + " with any method", "WARN");
                    // Only add error for first few items to avoid spam
                    if (i < 3) {
                        results.push({
                            error: "Item access failed with all methods",
                            index: i,
                            collectionName: collectionName || "unknown",
                            recoverable: false
                        });
                    }
                }
                
            } catch (itemError) {
                debugLog("Item " + i + " processing failed: " + itemError.message, "ERROR");
                
                // Only add detailed errors for first few items
                if (i < 3) {
                    results.push({
                        error: "Item processing failed",
                        index: i,
                        errorType: categorizeAPIError(itemError.message),
                        errorMessage: itemError.message,
                        collectionName: collectionName || "unknown",
                        recoverable: true
                    });
                }
            }
        }
        
        // Add comprehensive truncation notice
        if (length > maxItems) {
            results.push({
                notice: "Collection truncated for performance and safety",
                totalItems: length,
                shownItems: maxItems,
                collectionName: collectionName || "unknown",
                processingTime: new Date().getTime() - startTime,
                recommendation: "Increase ANALYSIS_CONFIG.maxCollectionSample if needed for more thorough analysis"
            });
        }
        
        debugLog("Enhanced collection iteration completed: " + results.length + " results in " + 
                (new Date().getTime() - startTime) + "ms", "ITER");
        
    } catch (e) {
        var collectionError = {
            error: "Collection iteration completely failed: " + e.message,
            collectionName: collectionName || "unknown",
            errorType: categorizeAPIError(e.message),
            processingTime: new Date().getTime() - startTime,
            recoverable: false
        };
        
        debugLog("Collection iteration completely failed: " + e.message, "CRITICAL");
        results.push(collectionError);
        
        if (ANALYSIS_CONFIG.logErrors) {
            logError("Collection iteration failed for " + (collectionName || "unknown") + ": " + e.message, 'collection', 'high');
        }
    }
    
    return results;
}

// Enhanced section analyzer with comprehensive error handling and recovery
function safeAnalyzeSection(sectionName, analyzeFunction) {
    var startTime = new Date().getTime();
    var sectionConfig = {
        name: sectionName,
        timeout: ANALYSIS_CONFIG.timeoutThreshold || 8000,
        retryCount: 0,
        maxRetries: 3, // Increased for more resilience
        retryDelay: 100 // Brief delay between retries
    };
    
    debugLog("Starting enhanced section analysis: " + sectionName, "SECTION");
    statusLog("Section Analysis", sectionName, 0);
    
    function attemptAnalysis() {
        var attemptStartTime = new Date().getTime();
        
        try {
            // Pre-execution validation
            if (typeof analyzeFunction !== 'function') {
                throw new Error("Invalid analyze function provided");
            }
            
            debugLog("Executing analysis function for: " + sectionName + " (attempt " + (sectionConfig.retryCount + 1) + ")", "SECTION");
            
            var result = analyzeFunction();
            var duration = new Date().getTime() - attemptStartTime;
            
            debugLog("Section " + sectionName + " completed in " + duration + "ms", "SECTION");
            statusLog("Section Analysis", sectionName + " completed", 100);
            
            // Enhanced timeout detection and retry logic
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
                    logError("Section " + sectionName + " timed out after " + duration + "ms with " + sectionConfig.retryCount + " retries", 'timeout', 'high');
                    return {
                        error: "Section analysis timed out after multiple attempts",
                        timeout: true,
                        duration: duration,
                        retryCount: sectionConfig.retryCount,
                        sectionName: sectionName,
                        partialData: result,
                        recommendation: "Consider increasing ANALYSIS_CONFIG.timeoutThreshold or simplifying analysis"
                    };
                }
            }
            
            // Validate result
            if (result === undefined) {
                debugLog("Section " + sectionName + " returned undefined result", "WARN");
                return {
                    warning: "Section returned undefined result",
                    sectionName: sectionName,
                    duration: duration,
                    data: null
                };
            }
            
            return result;
            
        } catch (error) {
            var duration = new Date().getTime() - attemptStartTime;
            debugLog("Section " + sectionName + " failed: " + error.message + " (attempt " + (sectionConfig.retryCount + 1) + ")", "ERROR");
            
            // Enhanced retry logic for different error types
            var shouldRetry = false;
            var errorCategory = categorizeAPIError(error.message);
            
            if (sectionConfig.retryCount < sectionConfig.maxRetries) {
                // Retry for certain error types
                if (errorCategory === 'timeout' || 
                    errorCategory === 'access_denied' || 
                    errorCategory === 'invalid_index' ||
                    error.message.indexOf('busy') !== -1 ||
                    error.message.indexOf('not available') !== -1) {
                    shouldRetry = true;
                }
            }
            
            if (shouldRetry) {
                sectionConfig.retryCount++;
                debugLog("Section " + sectionName + " failed, retrying (" + sectionConfig.retryCount + "/" + sectionConfig.maxRetries + "): " + error.message, "RETRY");
                
                // Adaptive delay based on error type
                var retryDelay = sectionConfig.retryDelay * (sectionConfig.retryCount * 2); // Increasing delay
                var delayStart = new Date().getTime();
                while (new Date().getTime() - delayStart < retryDelay) {
                    // Adaptive delay
                }
                
                return attemptAnalysis();
            } else {
                logError("Section " + sectionName + " analysis failed permanently: " + error.message, 'sectionFailure', 'high');
                return {
                    error: "Section analysis failed: " + error.message,
                    sectionName: sectionName,
                    line: error.line || "unknown",
                    recoverable: sectionConfig.retryCount < sectionConfig.maxRetries,
                    retryCount: sectionConfig.retryCount,
                    errorType: errorCategory,
                    duration: duration,
                    troubleshooting: generateErrorTroubleshooting(errorCategory, sectionName)
                };
            }
        }
    }
    
    return attemptAnalysis();
}

// Generate troubleshooting guidance for specific error types
function generateErrorTroubleshooting(errorCategory, sectionName) {
    var guidance = [];
    
    switch (errorCategory) {
        case 'unsupported_property':
            guidance.push("Check if property exists in your InDesign version");
            guidance.push("Try alternative property names for " + sectionName);
            break;
        case 'access_denied':
            guidance.push("Verify document is not locked or protected");
            guidance.push("Check user permissions for document access");
            break;
        case 'invalid_index':
            guidance.push("Collection size may have changed during analysis");
            guidance.push("Use smaller sample sizes for " + sectionName);
            break;
        case 'timeout':
            guidance.push("Increase ANALYSIS_CONFIG.timeoutThreshold");
            guidance.push("Process " + sectionName + " in smaller batches");
            break;
        default:
            guidance.push("Use comprehensive error handling for " + sectionName);
            guidance.push("Test with simpler documents first");
    }
    
    return guidance;
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