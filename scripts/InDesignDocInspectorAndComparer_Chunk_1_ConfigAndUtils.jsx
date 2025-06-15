//
// Enhanced InDesign Document Inspector & Comparison Tool v2.1 - ESTK Optimized Edition  
// Robust property change detection with API error handling
// Chunk 1: Core Configuration & Utility Functions
// Optimized for ExtendScript Toolkit (ESTK) development environment
// ES3 COMPATIBLE VERSION
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
    
    // SAFETY LIMITS - Replace all hardcoded values
    maxSafetyLimit: 50, // For safeIterateCollection safety override
    pageItemSampleLimit: 30, // For getPageItemsInfo sampling
    
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
// ES3 COMPATIBILITY HELPER FUNCTIONS - CRITICAL FOR EXTENDSCRIPT
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

// Helper function to check if character is whitespace - FIXED: char -> character
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
        // Fallback to basic string representation
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

// Helper function for string repetition (already exists but ensuring ES3 compatibility)
function repeatString(str, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += str;
    }
    return result;
}

// ============================================================================
// ENHANCED PROGRESS REPORTING FUNCTIONS - NEW FOR HANGING PREVENTION
// ============================================================================

// Enhanced progress reporting with detailed operational information
function enhancedStatusLog(section, operation, current, total, details) {
    if (ANALYSIS_CONFIG.enableESTKDebugging) {
        var progress = total > 0 ? Math.round((current / total) * 100) : 0;
        var timestamp = new Date().toLocaleTimeString();
        $.writeln("[PROGRESS] [" + timestamp + "] " + section + " (" + progress + "%): " + operation);
        if (details) {
            $.writeln("  └─ " + details);
        }
        if (current % 5 === 0 || current === total) { // Every 5 items or completion
            $.writeln("  └─ Processed " + current + "/" + total + " items");
        }
    }
}

// ============================================================================
// DOCUMENT VALIDATION FUNCTIONS - NEW FOR API FAILURE PREVENTION
// ============================================================================

// Comprehensive document validation before analysis
function validateDocumentState(doc) {
    enhancedStatusLog("VALIDATION", "Starting document validation", 0, 5, "Checking document object");
    
    var validation = {
        isValid: false,
        errors: [],
        warnings: [],
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
        
        // Test 2: Essential properties with safe access
        enhancedStatusLog("VALIDATION", "Testing essential properties", 2, 5, "Checking name, saved status");
        var docName = safeGetProperty(doc, 'name');
        var docSaved = safeGetProperty(doc, 'saved');
        
        if (docName) {
            validation.capabilities.hasBasicProperties = true;
            enhancedStatusLog("VALIDATION", "Basic properties OK", 2, 5, "name: " + docName);
        } else {
            validation.warnings.push("Cannot access document name property");
        }
        
        // Test 3: Collection access
        enhancedStatusLog("VALIDATION", "Testing collection access", 3, 5, "Checking pages, textFrames");
        var pagesCollection = safeGetProperty(doc, 'pages');
        var textFramesCollection = safeGetProperty(doc, 'textFrames');
        
        if (pagesCollection || textFramesCollection) {
            validation.capabilities.hasCollections = true;
            var pageCount = safeGetLength(pagesCollection);
            var frameCount = safeGetLength(textFramesCollection);
            enhancedStatusLog("VALIDATION", "Collections accessible", 3, 5, 
                "pages: " + pageCount + ", textFrames: " + frameCount);
        } else {
            validation.errors.push("Cannot access basic collections (pages, textFrames)");
        }
        
        // Test 4: Advanced properties
        enhancedStatusLog("VALIDATION", "Testing advanced properties", 4, 5, "Checking viewPreferences, links");
        var viewPrefs = safeGetProperty(doc, 'viewPreferences');
        var linksCollection = safeGetProperty(doc, 'links');
        
        if (viewPrefs || linksCollection) {
            validation.capabilities.hasAdvancedProperties = true;
            enhancedStatusLog("VALIDATION", "Advanced properties accessible", 4, 5, "viewPrefs and links OK");
        } else {
            validation.warnings.push("Advanced properties may not be accessible");
        }
        
        // Test 5: Final validation
        enhancedStatusLog("VALIDATION", "Completing validation", 5, 5, "Determining analysis capability");
        
        if (validation.capabilities.hasBasicProperties && validation.capabilities.hasCollections) {
            validation.isValid = true;
            enhancedStatusLog("VALIDATION", "Document validation PASSED", 5, 5, "Ready for analysis");
        } else {
            validation.errors.push("Document lacks minimum required capabilities for analysis");
            enhancedStatusLog("VALIDATION", "Document validation FAILED", 5, 5, "Cannot proceed with analysis");
        }
        
    } catch (exc) {
        validation.errors.push("Validation failed with exception: " + exc.message);
        enhancedStatusLog("VALIDATION", "Validation exception", 5, 5, "Error: " + exc.message);
    }
    
    return validation;
}

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

// Enhanced status logging for complex operations - DEPRECATED, use enhancedStatusLog
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

// Enhanced text capture with comprehensive safety - ES3 COMPATIBLE
function safeTextCapture(textFrame) {
    try {
        if (!textFrame) {
            return "[NO TEXT]";
        }
        
        // Multiple attempts to get content
        var content = null;
        
        // Method 1: Use safe property access
        content = safeGetProperty(textFrame, 'contents');
        
        // Method 2: Try alternative content properties
        if (!content) {
            content = safeGetProperty(textFrame, 'content');
        }
        if (!content) {
            content = safeGetProperty(textFrame, 'text');
        }
        if (!content) {
            content = safeGetProperty(textFrame, 'string');
        }
        
        // Validate content type
        if (!content) {
            return "[NO TEXT]";
        }
        
        if (typeof content !== 'string') {
            // Try to convert to string safely
            try {
                content = String(content);
            } catch (e) {
                return "[NON-STRING]";
            }
        }
        
        // Enhanced content processing with safety checks
        var previewLength = ANALYSIS_CONFIG.maxTextPreviewLength || 60;
        var preview = content.substring(0, previewLength);
        
        // Clean whitespace safely - ES3 compatible
        try {
            // Replace multiple whitespace with single space
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
        
        // Add truncation indicator
        if (content.length > previewLength) {
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
            // Skip known problematic properties - ES3 compatible
            for (var i = 0; i < ANALYSIS_CONFIG.problematicProperties.length; i++) {
                if (stringIndexOf(prop, ANALYSIS_CONFIG.problematicProperties[i]) !== -1) {
                    debugLog("Skipping problematic property: " + prop, "SKIP");
                    return defaultValue !== undefined ? defaultValue : null;
                }
            }
            
            // Handle dotted paths like 'viewPreferences.horizontalMeasurementUnits'
            if (stringIndexOf(prop, '.') !== -1) {
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
            timestamp: toISOString(new Date()),
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

// Enhanced collection length getter with comprehensive fallbacks
function safeGetLength(collection) {
    try {
        if (!collection) return 0;
        
        // Handle null/undefined
        if (collection === null || collection === undefined) return 0;
        
        // Try standard length property
        if (typeof collection.length !== 'undefined' && collection.length !== null) {
            var collectionLength = collection.length;
            // Validate length is a reasonable number
            if (typeof collectionLength === 'number' && collectionLength >= 0 && collectionLength < 1000000) {
                return collectionLength;
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

// ============================================================================
// ENHANCED COLLECTION ITERATION WITH DETAILED PROGRESS REPORTING - NEW
// ============================================================================

// Enhanced collection iteration with detailed progress and timeout protection
function enhancedSafeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) {
        enhancedStatusLog("ITERATION", "Invalid parameters", 0, 0, "collection or callback missing");
        return [];
    }
    
    var results = [];
    var startTime = new Date().getTime();
    maxItems = Math.min(maxItems || ANALYSIS_CONFIG.maxCollectionSample, ANALYSIS_CONFIG.maxSafetyLimit);
    
    enhancedStatusLog("ITERATION", "Starting collection analysis", 0, 0, collectionName || "unknown");
    
    try {
        var collectionLength = safeGetLength(collection);
        var actualMax = Math.min(collectionLength, maxItems);
        
        enhancedStatusLog("ITERATION", "Collection size determined", 0, actualMax, 
            "Length: " + collectionLength + ", Processing: " + actualMax);
        
        if (collectionLength === 0) {
            enhancedStatusLog("ITERATION", "Empty collection", 0, 0, collectionName + " has no items");
            return results;
        }
        
        // Enhanced iteration with detailed progress
        for (var i = 0; i < actualMax; i++) {
            // Enhanced timeout protection
            if (new Date().getTime() - startTime > ANALYSIS_CONFIG.timeoutThreshold) {
                enhancedStatusLog("ITERATION", "TIMEOUT PROTECTION", i, actualMax, 
                    "Stopped at item " + i + " after " + ANALYSIS_CONFIG.timeoutThreshold + "ms");
                results.push({
                    notice: "Processing timed out at item " + i + " of " + collectionLength,
                    timeout: true,
                    collectionName: collectionName || "unknown",
                    timeoutThreshold: ANALYSIS_CONFIG.timeoutThreshold
                });
                break;
            }
            
            // Progress reporting every 5 items or on important milestones
            if (i % 5 === 0 || i === actualMax - 1) {
                enhancedStatusLog("ITERATION", "Processing items", i + 1, actualMax, 
                    collectionName + " item " + (i + 1));
            }
            
            try {
                var item = null;
                var accessMethod = "unknown";
                
                // Enhanced access method reporting
                try {
                    item = collection[i];
                    accessMethod = "array[" + i + "]";
                    if (item && i % 10 === 0) { // Report every 10th successful access
                        enhancedStatusLog("ITERATION", "Access method working", i + 1, actualMax, 
                            "Using " + accessMethod);
                    }
                } catch (e1) {
                    if (i < 3) { // Only log first few failures
                        enhancedStatusLog("ITERATION", "Array access failed", i + 1, actualMax, 
                            "Item " + i + ": " + e1.message);
                    }
                }
                
                // Fallback to .item() method
                if (!item && collection.item) {
                    try {
                        item = collection.item(i);
                        accessMethod = "collection.item(" + i + ")";
                        if (item && i % 10 === 0) {
                            enhancedStatusLog("ITERATION", "Fallback method working", i + 1, actualMax, 
                                "Using " + accessMethod);
                        }
                    } catch (e2) {
                        if (i < 3) {
                            enhancedStatusLog("ITERATION", ".item() access failed", i + 1, actualMax, 
                                "Item " + i + ": " + e2.message);
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
                            }
                            results.push(result);
                        }
                    } catch (callbackError) {
                        enhancedStatusLog("ITERATION", "Callback failed", i + 1, actualMax, 
                            "Item " + i + ": " + callbackError.message);
                        results.push({
                            error: "Callback processing failed",
                            index: i,
                            errorMessage: callbackError.message,
                            accessMethod: accessMethod,
                            collectionName: collectionName || "unknown"
                        });
                    }
                } else {
                    if (i < 3) { // Only report first few access failures
                        enhancedStatusLog("ITERATION", "Item access failed", i + 1, actualMax, 
                            "Could not access item " + i + " with any method");
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
            collectionName + ": " + results.length + " results in " + totalTime + "ms");
        
    } catch (exc) {
        enhancedStatusLog("ITERATION", "Collection analysis FAILED", 0, 0, 
            collectionName + ": " + exc.message);
        results.push({
            error: "Collection iteration completely failed: " + exc.message,
            collectionName: collectionName || "unknown",
            errorType: categorizeAPIError(exc.message)
        });
    }
    
    return results;
}

// Enhanced collection iterator with maximum safety and error recovery (LEGACY - use enhancedSafeIterateCollection)
function safeIterateCollection(collection, callback, maxItems, collectionName) {
    if (!collection || !callback) {
        debugLog("Invalid collection or callback provided to safeIterateCollection", "WARN");
        return [];
    }
    
    var results = [];
    var startTime = new Date().getTime();
    maxItems = Math.min(maxItems || ANALYSIS_CONFIG.maxCollectionSample, ANALYSIS_CONFIG.maxSafetyLimit);
    
    debugLog("Starting enhanced collection iteration: " + (collectionName || "unknown"), "ITER");
    
    try {
        var collectionLength = safeGetLength(collection);
        debugLog("Collection length determined: " + collectionLength, "ITER");
        
        if (collectionLength === 0) {
            debugLog("Empty collection: " + (collectionName || "unknown"), "ITER");
            return results;
        }
        
        // Enhanced iteration with multiple access methods
        for (var i = 0; i < Math.min(collectionLength, maxItems); i++) {
            // Enhanced timeout protection
            if (new Date().getTime() - startTime > ANALYSIS_CONFIG.timeoutThreshold) {
                debugLog("Collection iteration timed out at item " + i, "TIMEOUT");
                results.push({
                    notice: "Processing timed out at item " + i + " of " + collectionLength,
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
        if (collectionLength > maxItems) {
            results.push({
                notice: "Collection truncated for performance and safety",
                totalItems: collectionLength,
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
    enhancedStatusLog("SECTION", "Section analysis starting", 0, 1, sectionName);
    
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
            enhancedStatusLog("SECTION", "Section analysis completed", 1, 1, sectionName + " - " + duration + "ms");
            
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
            
        } catch (exc) {
            var duration = new Date().getTime() - attemptStartTime;
            debugLog("Section " + sectionName + " failed: " + exc.message + " (attempt " + (sectionConfig.retryCount + 1) + ")", "ERROR");
            
            // Enhanced retry logic for different error types
            var shouldRetry = false;
            var errorCategory = categorizeAPIError(exc.message);
            
            if (sectionConfig.retryCount < sectionConfig.maxRetries) {
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
                
                // Adaptive delay based on error type
                var retryDelay = sectionConfig.retryDelay * (sectionConfig.retryCount * 2); // Increasing delay
                var delayStart = new Date().getTime();
                while (new Date().getTime() - delayStart < retryDelay) {
                    // Adaptive delay
                }
                
                return attemptAnalysis();
            } else {
                logError("Section " + sectionName + " analysis failed permanently: " + exc.message, 'sectionFailure', 'high');
                return {
                    error: "Section analysis failed: " + exc.message,
                    sectionName: sectionName,
                    line: exc.line || "unknown",
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