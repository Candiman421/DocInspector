//
// 1.0_safe-foundation.jsx
// InDesign DOM Discovery Builder - Ultra-Safe Foundation Module
// CORE PURPOSE: Rock-solid safe property access without value retrieval
// DEPENDENCIES: NONE (Foundation module)
// SAFETY: Never crashes, never accesses property values during discovery
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// ULTRA-SAFE PROPERTY CHECKING - NO VALUE ACCESS
// ============================================================================

/**
 * Check property type without accessing its value
 * SAFETY: Uses typeof operator only, never retrieves actual value
 * @param {Object} obj - Object to check
 * @param {String} propName - Property name to check
 * @returns {String} - 'undefined'|'string'|'number'|'boolean'|'object'|'function'|'error'
 */
function safeTypeCheck(obj, propName) {
    try {
        if (!obj) return 'undefined';
        if (typeof obj !== 'object') return 'undefined';
        return typeof obj[propName];
    } catch (exc) {
        return 'error';
    }
}

/**
 * Check if property exists without accessing it
 * SAFETY: Uses 'in' operator only, never retrieves value
 * @param {Object} obj - Object to check
 * @param {String} propName - Property name to check
 * @returns {Boolean} - true if property exists
 */
function safeHasProperty(obj, propName) {
    try {
        if (!obj) return false;
        if (typeof obj !== 'object') return false;
        return propName in obj;
    } catch (exc) {
        return false;
    }
}

/**
 * Get collection size safely without accessing items
 * SAFETY: Only accesses length/count/size properties, never iterates
 * @param {Object} collection - Collection object to check
 * @returns {Number} - Size or -1 if inaccessible
 */
function safeGetLength(collection) {
    try {
        if (!collection) return -1;
        if (typeof collection !== 'object') return -1;
        
        if (safeTypeCheck(collection, 'length') === 'number') {
            return collection.length;
        }
        if (safeTypeCheck(collection, 'count') === 'number') {
            return collection.count;
        }
        if (safeTypeCheck(collection, 'size') === 'number') {
            return collection.size;
        }
        return -1;
    } catch (exc) {
        return -1;
    }
}

// ============================================================================
// RESERVED WORD AND DANGER DETECTION
// ============================================================================

/**
 * Check if property name is ES3 reserved word
 * SAFETY: Pure string comparison, no object access
 * @param {String} propName - Property name to check
 * @returns {Boolean} - true if reserved word
 */
function isReservedWord(propName) {
    var reservedWords = [
        'break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 
        'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 
        'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 
        'var', 'void', 'while', 'with', 'class', 'const', 'enum', 
        'export', 'extends', 'import', 'super'
    ];
    
    for (var i = 0; i < reservedWords.length; i++) {
        if (propName === reservedWords[i]) {
            return true;
        }
    }
    return false;
}

/**
 * Check if property name matches dangerous patterns
 * SAFETY: String pattern matching only, prevents common crash sources
 * @param {String} propName - Property name to check
 * @returns {Boolean} - true if potentially dangerous
 */
function isDangerousProperty(propName) {
    var dangerousPatterns = [
        'parent', 'item', 'selection', 'app', 'activeDocument', 
        'activeWindow', 'activeLayer', 'activeStory', 'activeSpread'
    ];
    
    // Check exact matches
    for (var i = 0; i < dangerousPatterns.length; i++) {
        if (propName.toLowerCase() === dangerousPatterns[i].toLowerCase()) {
            return true;
        }
    }
    
    // Check if ends with dangerous patterns (like "parentLayer")
    for (var i = 0; i < dangerousPatterns.length; i++) {
        var pattern = dangerousPatterns[i].toLowerCase();
        if (propName.toLowerCase().indexOf(pattern) !== -1) {
            return true;
        }
    }
    
    return false;
}

// ============================================================================
// TIMEOUT AND EXECUTION CONTROL
// ============================================================================

/**
 * Create timeout checker for long operations
 * SAFETY: Uses Date.getTime() for reliable timeout detection
 * @param {Number} maxMs - Maximum milliseconds allowed
 * @returns {Function} - Function that returns true if timeout exceeded
 */
function createTimeoutChecker(maxMs) {
    var startTime = new Date().getTime();
    var timeoutMs = maxMs || 5000;
    
    return function() {
        return (new Date().getTime() - startTime) > timeoutMs;
    };
}

/**
 * Create operation counter with limit
 * SAFETY: Prevents infinite loops during enumeration
 * @param {Number} maxOps - Maximum operations allowed
 * @returns {Object} - {check: function, increment: function, getCount: function}
 */
function createOperationCounter(maxOps) {
    var count = 0;
    var limit = maxOps || 1000;
    
    return {
        check: function() {
            return count >= limit;
        },
        increment: function() {
            count++;
        },
        getCount: function() {
            return count;
        }
    };
}

// ============================================================================
// MEMORY MANAGEMENT AND CLEANUP
// ============================================================================

/**
 * Explicit memory cleanup for large operations
 * SAFETY: Sets variables to null and hints garbage collection
 * @param {Array} objsToNull - Array of variables to null out
 */
function memoryCleanup(objsToNull) {
    try {
        if (objsToNull && typeof objsToNull.length === 'number') {
            for (var i = 0; i < objsToNull.length; i++) {
                objsToNull[i] = null;
            }
        }
        
        // Hint garbage collection if available
        if (typeof $.gc === 'function') {
            $.gc();
        }
    } catch (exc) {
        // Cleanup failure is not critical, continue silently
    }
}

// ============================================================================
// DOCUMENT VALIDATION
// ============================================================================

/**
 * Validate InDesign environment and document state
 * SAFETY: Checks basic requirements before any DOM operations
 * @returns {Object} - {valid: boolean, error: string, document: object}
 */
function validateInDesignEnvironment() {
    var result = {
        valid: false,
        error: '',
        document: null
    };
    
    try {
        // Check if we're in InDesign
        if (typeof app === 'undefined') {
            result.error = 'Not running in InDesign application';
            return result;
        }
        
        // Check if documents collection exists
        if (!safeHasProperty(app, 'documents')) {
            result.error = 'Cannot access documents collection';
            return result;
        }
        
        // Check if any document is open
        var docCount = safeGetLength(app.documents);
        if (docCount <= 0) {
            result.error = 'No document is currently open';
            return result;
        }
        
        // Try to access active document
        if (!safeHasProperty(app, 'activeDocument')) {
            result.error = 'Cannot access active document';
            return result;
        }
        
        var doc = app.activeDocument;
        if (!doc) {
            result.error = 'Active document is null';
            return result;
        }
        
        result.valid = true;
        result.document = doc;
        return result;
        
    } catch (exc) {
        result.error = 'Environment validation failed: ' + exc.message;
        return result;
    }
}

/**
 * Check if document is in safe state for enumeration
 * SAFETY: Validates document permissions and state
 * @param {Object} doc - InDesign document object
 * @returns {Object} - {safe: boolean, warnings: array}
 */
function validateDocumentState(doc) {
    var result = {
        safe: true,
        warnings: []
    };
    
    try {
        // Check if document is saved (safer for enumeration)
        if (safeTypeCheck(doc, 'saved') === 'boolean') {
            if (!doc.saved) {
                result.warnings.push('Document is not saved - enumeration may be slower');
            }
        }
        
        // Check if document name is accessible
        if (safeTypeCheck(doc, 'name') !== 'string') {
            result.warnings.push('Cannot access document name');
        }
        
        // Document is considered safe unless proven otherwise
        return result;
        
    } catch (exc) {
        result.safe = false;
        result.warnings.push('Document state validation failed: ' + exc.message);
        return result;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe string builder for large text construction
 * SAFETY: Manages memory during large string operations
 * @returns {Object} - {append: function, toString: function, clear: function}
 */
function createStringBuilder() {
    var parts = [];
    
    return {
        append: function(text) {
            parts.push(String(text));
        },
        appendLine: function(text) {
            parts.push(String(text) + '\n');
        },
        toString: function() {
            return parts.join('');
        },
        clear: function() {
            parts = [];
        },
        getLength: function() {
            return parts.length;
        }
    };
}

/**
 * Get current timestamp in readable format
 * SAFETY: Simple date formatting without external dependencies
 * @returns {String} - Formatted timestamp
 */
function getCurrentTimestamp() {
    var now = new Date();
    return now.getFullYear() + '-' + 
           ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
           ('0' + now.getDate()).slice(-2) + ' ' +
           ('0' + now.getHours()).slice(-2) + ':' +
           ('0' + now.getMinutes()).slice(-2) + ':' +
           ('0' + now.getSeconds()).slice(-2);
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize safe foundation module
 * SAFETY: Validates all foundation functions are available
 * @returns {Boolean} - true if initialization successful
 */
function initializeSafeFoundation() {
    try {
        // Test core functions exist
        var requiredFunctions = [
            'safeTypeCheck', 'safeHasProperty', 'safeGetLength',
            'isReservedWord', 'isDangerousProperty', 'createTimeoutChecker',
            'memoryCleanup', 'validateInDesignEnvironment', 'createStringBuilder'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('1.0_safe-foundation.jsx: All functions initialized successfully');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Safe foundation initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeSafeFoundation();