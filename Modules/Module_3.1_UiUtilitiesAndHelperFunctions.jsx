// ============================================================================
// MODULE 3.1: UI UTILITIES AND HELPER FUNCTIONS
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition  
// ES3 Compatible - Supporting functions for Module 3.0
// ============================================================================

// ============================================================================
// EMERGENCY PROPERTY ACCESS FUNCTIONS - FIXED RESERVED WORDS
// ============================================================================

// Emergency property getter with timeout protection
function emergencyGetProperty(objRef, propName, defaultValue, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || 1000;
    
    try {
        if (!objRef) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Check timeout before access
        if (new Date().getTime() - startTime > maxTime) {
            debugLog("Timeout before property access: " + propName, "TIMEOUT");
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        // Try multiple access methods
        var propValue;
        
        // Method 1: Direct property access
        if (objRef.hasOwnProperty && objRef.hasOwnProperty(propName)) {
            propValue = objRef[propName];
            if (propValue !== undefined) {
                return propValue;
            }
        }
        
        // Method 2: Bracket notation
        propValue = objRef[propName];
        if (propValue !== undefined) {
            return propValue;
        }
        
        // Method 3: Try alternative property names
        var alternativeNames = getPropertyAlternatives(propName);
        for (var i = 0; i < alternativeNames.length; i++) {
            var altName = alternativeNames[i];
            if (objRef[altName] !== undefined) {
                debugLog("Using alternative property: " + altName + " for " + propName, "INFO");
                return objRef[altName];
            }
        }
        
        return defaultValue !== undefined ? defaultValue : null;
        
    } catch (exc) {
        debugLog("Emergency property access failed: " + propName + " - " + exc.message, "ERROR");
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Emergency collection length getter with timeout
function emergencyGetLength(collectionRef, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || 1000;
    
    try {
        if (!collectionRef) {
            return 0;
        }
        
        // Check timeout
        if (new Date().getTime() - startTime > maxTime) {
            debugLog("Timeout getting collection length", "TIMEOUT");
            return 0;
        }
        
        // Try length property
        if (collectionRef.length !== undefined) {
            return parseInt(collectionRef.length) || 0;
        }
        
        // Try count property
        if (collectionRef.count !== undefined) {
            return parseInt(collectionRef.count) || 0;
        }
        
        return 0;
        
    } catch (exc) {
        debugLog("Emergency length access failed: " + exc.message, "ERROR");
        return 0;
    }
}

// Emergency collection item getter with timeout and fallbacks
function emergencyGetCollectionItem(collectionRef, itemIndex, timeoutMs) {
    var startTime = new Date().getTime();
    var maxTime = timeoutMs || 1000;
    
    try {
        if (!collectionRef || itemIndex < 0) {
            return null;
        }
        
        // Check timeout
        if (new Date().getTime() - startTime > maxTime) {
            debugLog("Timeout getting collection item " + itemIndex, "TIMEOUT");
            return null;
        }
        
        // Method 1: Direct array-style access
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
        debugLog("Emergency collection item access failed: " + itemIndex + " - " + exc.message, "ERROR");
        return null;
    }
}

// Get alternative property names for fallback access
function getPropertyAlternatives(propName) {
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
        'height': ['h', 'pageHeight']
    };
    
    return alternatives[propName] || [];
}

// ============================================================================
// ENHANCED DEBUGGING AND LOGGING - FIXED RESERVED WORDS
// ============================================================================

// Enhanced debug logging with categorization
function debugLog(message, categoryName) {
    try {
        var timestamp = toISOString(new Date());
        var logEntry = "[" + timestamp + "] [" + (categoryName || "DEBUG") + "] " + message;
        
        // Output to ExtendScript console
        $.writeln(logEntry);
        
        // Store in memory log if needed
        if (typeof QUERY_CONFIG !== "undefined" && QUERY_CONFIG.runtime) {
            if (!QUERY_CONFIG.runtime.debugLog) {
                QUERY_CONFIG.runtime.debugLog = [];
            }
            
            QUERY_CONFIG.runtime.debugLog.push({
                timestamp: timestamp,
                category: categoryName || "DEBUG",
                message: message
            });
            
            // Limit log size
            if (QUERY_CONFIG.runtime.debugLog.length > 1000) {
                QUERY_CONFIG.runtime.debugLog.splice(0, 500);
            }
        }
        
    } catch (exc) {
        // Fallback logging
        $.writeln("DEBUG LOG ERROR: " + exc.message);
    }
}

// Enhanced error logging with categorization
function logError(errorMessage, errorCategory, severityLevel) {
    try {
        var timestamp = toISOString(new Date());
        var logEntry = "[" + timestamp + "] [ERROR:" + (severityLevel || "MEDIUM") + "] [" + 
                      (errorCategory || "GENERAL") + "] " + errorMessage;
        
        // Output to console with error marking
        $.writeln("!!! " + logEntry);
        
        // Store error for analysis
        if (typeof QUERY_CONFIG !== "undefined" && QUERY_CONFIG.runtime) {
            if (!QUERY_CONFIG.runtime.errors) {
                QUERY_CONFIG.runtime.errors = [];
            }
            
            QUERY_CONFIG.runtime.errors.push({
                timestamp: timestamp,
                category: errorCategory || "GENERAL",
                severity: severityLevel || "MEDIUM",
                message: errorMessage
            });
            
            // Limit error log size
            if (QUERY_CONFIG.runtime.errors.length > 100) {
                QUERY_CONFIG.runtime.errors.splice(0, 50);
            }
        }
        
    } catch (exc) {
        $.writeln("ERROR LOGGING FAILED: " + exc.message);
    }
}

// ============================================================================
// ES3 COMPATIBILITY FUNCTIONS - ALL RESERVED WORDS FIXED
// ============================================================================

// ES3-compatible indexOf for arrays - FIXED RESERVED WORD
function arrayIndexOf(arrayRef, searchElement) {
    if (!arrayRef || !arrayRef.length) return -1;
    
    for (var i = 0; i < arrayRef.length; i++) {
        if (arrayRef[i] === searchElement) {
            return i;
        }
    }
    return -1;
}

// ES3-compatible indexOf for strings - FIXED RESERVED WORD
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

// ES3-compatible Object.keys function
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

// ES3-compatible Date.toISOString function
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

// ES3-compatible string trim function
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

// Helper function to check if character is whitespace - FIXED RESERVED WORD
function isWhitespaceCharacter(characterRef) {
    return characterRef === ' ' || characterRef === '\t' || 
           characterRef === '\n' || characterRef === '\r' || 
           characterRef === '\f';
}

// ES3-compatible array filter function
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
            debugLog("Array filter callback error at index " + i + ": " + exc.message, "WARN");
        }
    }
    return resultArray;
}

// ES3-compatible array some function
function arraySome(arrayRef, callbackFn) {
    if (!arrayRef || !arrayRef.length) return false;
    
    for (var i = 0; i < arrayRef.length; i++) {
        try {
            if (callbackFn(arrayRef[i], i, arrayRef)) {
                return true;
            }
        } catch (exc) {
            // Continue checking other elements
            debugLog("Array some callback error at index " + i + ": " + exc.message, "WARN");
        }
    }
    return false;
}

// ============================================================================
// STRING BUILDING AND FORMATTING UTILITIES
// ============================================================================

// ES3-compatible efficient string builder
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
                
                // Check memory limits
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

// String repetition helper
function repeatString(stringValue, repeatCount) {
    var resultString = "";
    for (var i = 0; i < repeatCount; i++) {
        resultString += stringValue;
    }
    return resultString;
}

// ============================================================================
// UI VALIDATION AND HELPER FUNCTIONS
// ============================================================================

// Validate numeric input with bounds checking
function validateNumericInput(inputValue, minValue, maxValue, defaultValue) {
    try {
        var numericValue = parseInt(inputValue);
        
        if (isNaN(numericValue)) {
            return defaultValue;
        }
        
        if (minValue !== undefined && numericValue < minValue) {
            return minValue;
        }
        
        if (maxValue !== undefined && numericValue > maxValue) {
            return maxValue;
        }
        
        return numericValue;
        
    } catch (exc) {
        debugLog("Numeric validation error: " + exc.message, "VALIDATION");
        return defaultValue;
    }
}

// Validate document state for analysis
function validateDocumentState() {
    var validation = {
        isValid: false,
        issues: [],
        warnings: []
    };
    
    try {
        // Check if InDesign is available
        if (typeof app === "undefined") {
            validation.issues.push("InDesign application not available");
            return validation;
        }
        
        // Check if documents are open
        if (!app.documents || app.documents.length === 0) {
            validation.issues.push("No documents are open");
            return validation;
        }
        
        // Check active document
        var doc = app.activeDocument;
        if (!doc) {
            validation.issues.push("No active document");
            return validation;
        }
        
        // Check if document is saved
        var saved = emergencyGetProperty(doc, 'saved', false);
        if (!saved) {
            validation.warnings.push("Document is not saved");
        }
        
        // Check document name
        var docName = emergencyGetProperty(doc, 'name', '');
        if (!docName || docName === 'Untitled') {
            validation.warnings.push("Document appears to be untitled");
        }
        
        // Basic accessibility test
        try {
            var pageCount = emergencyGetLength(doc.pages, 1000);
            if (pageCount === 0) {
                validation.warnings.push("Document has no pages");
            }
        } catch (exc) {
            validation.warnings.push("Cannot access document pages: " + exc.message);
        }
        
        validation.isValid = validation.issues.length === 0;
        
    } catch (exc) {
        validation.issues.push("Document validation failed: " + exc.message);
    }
    
    return validation;
}

// Check file system access permissions
function validateFileSystemAccess(folderPath) {
    try {
        if (!folderPath) {
            return false;
        }
        
        var folder = new Folder(folderPath);
        if (!folder.exists) {
            return false;
        }
        
        // Try to create a test file
        var testFile = new File(folder.fsName + "/test_write_access.tmp");
        try {
            testFile.open("w");
            testFile.write("test");
            testFile.close();
            testFile.remove();
            return true;
        } catch (exc) {
            debugLog("File system write test failed: " + exc.message, "VALIDATION");
            return false;
        }
        
    } catch (exc) {
        debugLog("File system validation error: " + exc.message, "VALIDATION");
        return false;
    }
}

// ============================================================================
// MEMORY AND PERFORMANCE UTILITIES
// ============================================================================

// Memory usage monitoring
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
        
        if (typeof QUERY_CONFIG !== "undefined" && QUERY_CONFIG.runtime) {
            // Count debug log entries
            if (QUERY_CONFIG.runtime.debugLog) {
                estimatedBytes += QUERY_CONFIG.runtime.debugLog.length * 200; // rough estimate
            }
            
            // Count error log entries
            if (QUERY_CONFIG.runtime.errors) {
                estimatedBytes += QUERY_CONFIG.runtime.errors.length * 150;
            }
            
            // Count results data
            if (UI_STATE && UI_STATE.lastResults) {
                estimatedBytes += 50000; // rough estimate for results
            }
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
        }
        
    } catch (exc) {
        memoryInfo.status = "error";
        memoryInfo.recommendations.push("Memory check failed: " + exc.message);
    }
    
    return memoryInfo;
}

// Performance timing utility
function createPerformanceTimer(operationName) {
    return {
        name: operationName || "Operation",
        startTime: new Date().getTime(),
        endTime: null,
        duration: 0,
        
        stop: function() {
            this.endTime = new Date().getTime();
            this.duration = this.endTime - this.startTime;
            debugLog("Performance: " + this.name + " took " + this.duration + "ms", "PERF");
            return this.duration;
        },
        
        getDuration: function() {
            if (this.endTime) {
                return this.duration;
            } else {
                return new Date().getTime() - this.startTime;
            }
        }
    };
}

// ============================================================================
// ERROR HANDLING AND RECOVERY UTILITIES
// ============================================================================

// Enhanced error handler with categorization
function handleError(errorObj, operationName, recoveryActions) {
    var errorInfo = {
        timestamp: toISOString(new Date()),
        operation: operationName || "Unknown",
        message: errorObj.message || String(errorObj),
        category: categorizeError(errorObj),
        severity: determineSeverity(errorObj),
        recovered: false,
        recoveryAction: null
    };
    
    try {
        // Log the error
        logError(errorInfo.message, errorInfo.category, errorInfo.severity);
        
        // Attempt recovery if actions provided
        if (recoveryActions && recoveryActions.length > 0) {
            for (var i = 0; i < recoveryActions.length; i++) {
                var recoveryAction = recoveryActions[i];
                try {
                    if (typeof recoveryAction === 'function') {
                        recoveryAction();
                        errorInfo.recovered = true;
                        errorInfo.recoveryAction = "Custom function " + i;
                        break;
                    }
                } catch (recoveryError) {
                    debugLog("Recovery action " + i + " failed: " + recoveryError.message, "RECOVERY");
                }
            }
        }
        
    } catch (handlingError) {
        $.writeln("Error handling failed: " + handlingError.message);
    }
    
    return errorInfo;
}

// Categorize errors for better handling
function categorizeError(errorObj) {
    var errorMessage = errorObj.message || String(errorObj);
    var messageLower = errorMessage.toLowerCase();
    
    if (stringIndexOf(messageLower, 'object does not support') !== -1) {
        return 'UNSUPPORTED_PROPERTY';
    } else if (stringIndexOf(messageLower, 'access denied') !== -1) {
        return 'ACCESS_DENIED';
    } else if (stringIndexOf(messageLower, 'invalid index') !== -1) {
        return 'INVALID_INDEX';
    } else if (stringIndexOf(messageLower, 'timeout') !== -1) {
        return 'TIMEOUT';
    } else if (stringIndexOf(messageLower, 'permission') !== -1) {
        return 'PERMISSION';
    } else if (stringIndexOf(messageLower, 'not found') !== -1) {
        return 'NOT_FOUND';
    } else if (stringIndexOf(messageLower, 'memory') !== -1) {
        return 'MEMORY';
    } else {
        return 'GENERAL';
    }
}

// Determine error severity
function determineSeverity(errorObj) {
    var errorMessage = errorObj.message || String(errorObj);
    var messageLower = errorMessage.toLowerCase();
    
    if (stringIndexOf(messageLower, 'critical') !== -1 || 
        stringIndexOf(messageLower, 'fatal') !== -1) {
        return 'CRITICAL';
    } else if (stringIndexOf(messageLower, 'access denied') !== -1 ||
               stringIndexOf(messageLower, 'permission') !== -1) {
        return 'HIGH';
    } else if (stringIndexOf(messageLower, 'timeout') !== -1 ||
               stringIndexOf(messageLower, 'invalid') !== -1) {
        return 'MEDIUM';
    } else {
        return 'LOW';
    }
}

// ============================================================================
// UTILITY INITIALIZATION AND CLEANUP
// ============================================================================

// Initialize utility systems
function initializeUtilities() {
    debugLog("Initializing UI utilities", "INIT");
    
    try {
        // Initialize memory tracking
        var memoryCheck = checkMemoryUsage();
        debugLog("Initial memory status: " + memoryCheck.status, "MEMORY");
        
        // Validate environment
        var docValidation = validateDocumentState();
        if (!docValidation.isValid) {
            debugLog("Document validation issues: " + docValidation.issues.join(", "), "VALIDATION");
        }
        
        debugLog("UI utilities initialized successfully", "INIT");
        return true;
        
    } catch (exc) {
        logError("Utility initialization failed: " + exc.message, "INIT", "HIGH");
        return false;
    }
}

// Cleanup utility systems
function cleanupUtilities() {
    debugLog("Cleaning up UI utilities", "CLEANUP");
    
    try {
        // Clear logs if they're too large
        if (typeof QUERY_CONFIG !== "undefined" && QUERY_CONFIG.runtime) {
            if (QUERY_CONFIG.runtime.debugLog && QUERY_CONFIG.runtime.debugLog.length > 500) {
                QUERY_CONFIG.runtime.debugLog.splice(0, QUERY_CONFIG.runtime.debugLog.length - 100);
                debugLog("Debug log trimmed for memory management", "CLEANUP");
            }
            
            if (QUERY_CONFIG.runtime.errors && QUERY_CONFIG.runtime.errors.length > 50) {
                QUERY_CONFIG.runtime.errors.splice(0, QUERY_CONFIG.runtime.errors.length - 25);
                debugLog("Error log trimmed for memory management", "CLEANUP");
            }
        }
        
        // Trigger garbage collection if available
        if (typeof $.gc === "function") {
            $.gc();
            debugLog("Garbage collection triggered", "CLEANUP");
        }
        
        debugLog("UI utilities cleanup completed", "CLEANUP");
        return true;
        
    } catch (exc) {
        logError("Utility cleanup failed: " + exc.message, "CLEANUP", "MEDIUM");
        return false;
    }
}

$.writeln("Module 3.1: UI Utilities loaded (Emergency Functions & ES3 Compatibility)");