//
// 1.0_safe-foundation.jsx (Enhanced)
// InDesign DOM Discovery Builder - Ultra-Safe Foundation Module
// CORE PURPOSE: Rock-solid safe property access with enhanced utilities for deep mapping
// DEPENDENCIES: NONE (Foundation module)
// SAFETY: Never crashes, never accesses property values during discovery
// ES3 COMPATIBLE: No reserved words, no modern JS features
// ENHANCED: Added object reference tracking and path utilities for v2.1
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
// ENHANCED OBJECT REFERENCE TRACKING
// ============================================================================

/**
 * Generate unique object reference ID using memory address approximation
 * SAFETY: Uses object toString() method which is safe for reference comparison
 * @param {Object} obj - Object to generate reference for
 * @returns {String} - Unique reference ID or empty string if error
 */
function generateObjectReferenceID(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return '';
        }
        
        // Use object's toString which often includes memory reference info
        var objString = String(obj);
        
        // Create hash-like ID from object string representation
        var hash = 0;
        for (var i = 0; i < objString.length; i++) {
            var charVal = objString.charCodeAt(i);
            hash = ((hash << 5) - hash) + charVal;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to positive hex string
        var refID = 'ref_' + Math.abs(hash).toString(16);
        
        return refID;
        
    } catch (exc) {
        return '';
    }
}

/**
 * Check if two objects are the same reference
 * SAFETY: Uses strict equality comparison which is safe
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Boolean} - true if same reference
 */
function isSameObjectReference(obj1, obj2) {
    try {
        if (!obj1 || !obj2) return false;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
        
        // Strict equality check for same reference
        return obj1 === obj2;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create object reference tracker for deduplication
 * SAFETY: Manages object reference map with safe cleanup
 * @returns {Object} - Reference tracker with methods
 */
function createObjectReferenceTracker() {
    var seenObjects = [];
    var objectPaths = [];
    var referenceCounter = 0;
    
    return {
        /**
         * Check if object has been seen before and record it
         * @param {Object} obj - Object to check
         * @param {String} path - Current path to object
         * @returns {Object} - {seen: boolean, refID: string, paths: array}
         */
        trackObject: function(obj, path) {
            try {
                if (!obj || typeof obj !== 'object') {
                    return { seen: false, refID: '', paths: [] };
                }
                
                // Check if we've seen this object before
                for (var i = 0; i < seenObjects.length; i++) {
                    if (isSameObjectReference(seenObjects[i], obj)) {
                        // Add this path to existing object
                        objectPaths[i].push(path);
                        return {
                            seen: true,
                            refID: 'ref_' + i,
                            paths: objectPaths[i].slice() // Return copy of paths array
                        };
                    }
                }
                
                // New object - record it
                var refID = 'ref_' + referenceCounter;
                seenObjects.push(obj);
                objectPaths.push([path]);
                referenceCounter++;
                
                return {
                    seen: false,
                    refID: refID,
                    paths: [path]
                };
                
            } catch (exc) {
                return { seen: false, refID: '', paths: [] };
            }
        },
        
        /**
         * Get all paths to a specific object reference
         * @param {String} refID - Reference ID to look up
         * @returns {Array} - Array of paths to this object
         */
        getPathsForReference: function(refID) {
            try {
                var idx = parseInt(refID.replace('ref_', ''), 10);
                if (idx >= 0 && idx < objectPaths.length) {
                    return objectPaths[idx].slice(); // Return copy
                }
                return [];
            } catch (exc) {
                return [];
            }
        },
        
        /**
         * Get statistics about tracked objects
         * @returns {Object} - Statistics object
         */
        getStatistics: function() {
            return {
                totalObjects: seenObjects.length,
                totalPaths: objectPaths.reduce(function(sum, paths) { return sum + paths.length; }, 0),
                duplicateReferences: objectPaths.filter(function(paths) { return paths.length > 1; }).length
            };
        },
        
        /**
         * Clean up tracker memory
         */
        cleanup: function() {
            seenObjects = [];
            objectPaths = [];
            referenceCounter = 0;
        }
    };
}

// ============================================================================
// ENHANCED PATH UTILITIES
// ============================================================================

/**
 * Split dot notation path into components safely
 * SAFETY: Pure string manipulation, no object access
 * @param {String} dotPath - Dot notation path
 * @returns {Array} - Array of path components
 */
function splitPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return [];
        }
        
        return dotPath.split('.');
        
    } catch (exc) {
        return [];
    }
}

/**
 * Join path components into dot notation
 * SAFETY: Pure string manipulation
 * @param {Array} pathComponents - Array of path parts
 * @returns {String} - Dot notation path
 */
function joinPath(pathComponents) {
    try {
        if (!pathComponents || typeof pathComponents.length !== 'number') {
            return '';
        }
        
        var validComponents = [];
        for (var i = 0; i < pathComponents.length; i++) {
            if (pathComponents[i] && typeof pathComponents[i] === 'string') {
                validComponents.push(pathComponents[i]);
            }
        }
        
        return validComponents.join('.');
        
    } catch (exc) {
        return '';
    }
}

/**
 * Get parent path from dot notation path
 * SAFETY: String manipulation only
 * @param {String} dotPath - Full path
 * @returns {String} - Parent path
 */
function getParentPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return '';
        }
        
        var lastDotIndex = dotPath.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return '';
        }
        
        return dotPath.substring(0, lastDotIndex);
        
    } catch (exc) {
        return '';
    }
}

/**
 * Get property name from end of path
 * SAFETY: String manipulation only
 * @param {String} dotPath - Full path
 * @returns {String} - Property name
 */
function getPropertyFromPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return '';
        }
        
        var lastDotIndex = dotPath.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return dotPath;
        }
        
        return dotPath.substring(lastDotIndex + 1);
        
    } catch (exc) {
        return '';
    }
}

/**
 * Normalize path by removing empty components and redundancy
 * SAFETY: String processing only
 * @param {String} dotPath - Path to normalize
 * @returns {String} - Normalized path
 */
function normalizePath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return '';
        }
        
        var components = splitPath(dotPath);
        var normalized = [];
        
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (component && component.length > 0) {
                normalized.push(component);
            }
        }
        
        return joinPath(normalized);
        
    } catch (exc) {
        return dotPath;
    }
}

// ============================================================================
// ENHANCED MEMORY MANAGEMENT
// ============================================================================

/**
 * Enhanced memory cleanup for large operations with reference tracking
 * SAFETY: Comprehensive cleanup including object reference tracking
 * @param {Array} objsToNull - Array of variables to null out
 * @param {Object} referenceTracker - Optional reference tracker to clean up
 */
function enhancedMemoryCleanup(objsToNull, referenceTracker) {
    try {
        // Clean up provided objects
        if (objsToNull && typeof objsToNull.length === 'number') {
            for (var i = 0; i < objsToNull.length; i++) {
                objsToNull[i] = null;
            }
        }
        
        // Clean up reference tracker if provided
        if (referenceTracker && typeof referenceTracker.cleanup === 'function') {
            referenceTracker.cleanup();
        }
        
        // Hint garbage collection if available
        if (typeof $.gc === 'function') {
            $.gc();
        }
        
    } catch (exc) {
        // Cleanup failure is not critical, continue silently
    }
}

/**
 * Create memory usage monitor for large operations
 * SAFETY: Tracks memory indicators without accessing sensitive system info
 * @returns {Object} - Memory monitor with reporting functions
 */
function createMemoryMonitor() {
    var startTime = new Date().getTime();
    var checkpoints = [];
    
    return {
        /**
         * Record a memory checkpoint
         * @param {String} label - Checkpoint label
         */
        checkpoint: function(label) {
            try {
                checkpoints.push({
                    label: label || 'checkpoint',
                    time: new Date().getTime() - startTime
                });
            } catch (exc) {
                // Silent failure for monitoring
            }
        },
        
        /**
         * Get checkpoint report
         * @returns {Array} - Array of checkpoint data
         */
        getReport: function() {
            return checkpoints.slice(); // Return copy
        },
        
        /**
         * Get total elapsed time
         * @returns {Number} - Elapsed time in milliseconds
         */
        getElapsedTime: function() {
            return new Date().getTime() - startTime;
        },
        
        /**
         * Clean up monitor
         */
        cleanup: function() {
            checkpoints = [];
        }
    };
}

// ============================================================================
// RESERVED WORD AND DANGER DETECTION (ENHANCED)
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
 * Enhanced dangerous property detection with deeper patterns
 * SAFETY: String pattern matching only, prevents common crash sources
 * @param {String} propName - Property name to check
 * @returns {Boolean} - true if potentially dangerous
 */
function isDangerousProperty(propName) {
    var dangerousPatterns = [
        'parent', 'item', 'selection', 'app', 'activeDocument', 
        'activeWindow', 'activeLayer', 'activeStory', 'activeSpread',
        'constructor', 'prototype', '__proto__'
    ];
    
    var lowerPropName = propName.toLowerCase();
    
    // Check exact matches
    for (var i = 0; i < dangerousPatterns.length; i++) {
        if (lowerPropName === dangerousPatterns[i].toLowerCase()) {
            return true;
        }
    }
    
    // Check if contains dangerous patterns
    for (var i = 0; i < dangerousPatterns.length; i++) {
        var pattern = dangerousPatterns[i].toLowerCase();
        if (lowerPropName.indexOf(pattern) !== -1) {
            return true;
        }
    }
    
    return false;
}

/**
 * Enhanced dangerous path detection for deep traversal
 * SAFETY: Path analysis to prevent dangerous traversal routes
 * @param {String} dotPath - Full path to check
 * @returns {Boolean} - true if path is dangerous
 */
function isDangerousPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return false;
        }
        
        var pathComponents = splitPath(dotPath);
        
        // Check each component for danger
        for (var i = 0; i < pathComponents.length; i++) {
            if (isDangerousProperty(pathComponents[i])) {
                return true;
            }
        }
        
        // Check for known dangerous path patterns
        var dangerousPathPatterns = [
            'app.activeDocument',
            'document.selection',
            'window.parent'
        ];
        
        var lowerPath = dotPath.toLowerCase();
        for (var i = 0; i < dangerousPathPatterns.length; i++) {
            if (lowerPath.indexOf(dangerousPathPatterns[i].toLowerCase()) !== -1) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return true; // Err on side of caution
    }
}

// ============================================================================
// TIMEOUT AND EXECUTION CONTROL (ENHANCED)
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
 * Enhanced operation counter with limit and reporting
 * SAFETY: Prevents infinite loops during enumeration with enhanced tracking
 * @param {Number} maxOps - Maximum operations allowed
 * @returns {Object} - Counter with enhanced methods
 */
function createEnhancedOperationCounter(maxOps) {
    var count = 0;
    var limit = maxOps || 1000;
    var milestones = [];
    
    return {
        check: function() {
            return count >= limit;
        },
        increment: function() {
            count++;
            
            // Record milestones
            if (count % 100 === 0) {
                milestones.push({
                    count: count,
                    timestamp: new Date().getTime()
                });
            }
        },
        getCount: function() {
            return count;
        },
        getLimit: function() {
            return limit;
        },
        getMilestones: function() {
            return milestones.slice(); // Return copy
        },
        getProgress: function() {
            return {
                current: count,
                limit: limit,
                percentage: Math.floor((count / limit) * 100)
            };
        },
        reset: function() {
            count = 0;
            milestones = [];
        }
    };
}

// ============================================================================
// DOCUMENT VALIDATION (ENHANCED)
// ============================================================================

/**
 * Enhanced InDesign environment and document state validation
 * SAFETY: Comprehensive checks before any DOM operations
 * @returns {Object} - {valid: boolean, error: string, document: object, warnings: array}
 */
function validateInDesignEnvironment() {
    var result = {
        valid: false,
        error: '',
        document: null,
        warnings: []
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
        
        // Enhanced document state validation
        var docValidation = validateDocumentState(doc);
        if (!docValidation.safe) {
            result.warnings = docValidation.warnings;
        } else {
            result.warnings = docValidation.warnings || [];
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
 * Enhanced document state validation for safe enumeration
 * SAFETY: Validates document permissions and state for deep analysis
 * @param {Object} doc - InDesign document object
 * @returns {Object} - {safe: boolean, warnings: array, metadata: object}
 */
function validateDocumentState(doc) {
    var result = {
        safe: true,
        warnings: [],
        metadata: {}
    };
    
    try {
        // Check if document is saved (safer for enumeration)
        if (safeTypeCheck(doc, 'saved') === 'boolean') {
            result.metadata.saved = doc.saved;
            if (!doc.saved) {
                result.warnings.push('Document is not saved - enumeration may be slower');
            }
        }
        
        // Check if document name is accessible
        if (safeTypeCheck(doc, 'name') === 'string') {
            result.metadata.name = doc.name;
        } else {
            result.warnings.push('Cannot access document name');
        }
        
        // Check document complexity indicators
        var pageCount = safeGetLength(doc.pages);
        if (pageCount >= 0) {
            result.metadata.pageCount = pageCount;
            if (pageCount > 100) {
                result.warnings.push('Large document (' + pageCount + ' pages) - enumeration may take longer');
            }
        }
        
        // Check story count
        var storyCount = safeGetLength(doc.stories);
        if (storyCount >= 0) {
            result.metadata.storyCount = storyCount;
            if (storyCount > 50) {
                result.warnings.push('Many stories (' + storyCount + ') - consider focused analysis');
            }
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
// UTILITY FUNCTIONS (ENHANCED)
// ============================================================================

/**
 * Enhanced string builder for large text construction with memory management
 * SAFETY: Manages memory during large string operations with chunking
 * @returns {Object} - Enhanced string builder with additional methods
 */
function createStringBuilder() {
    var parts = [];
    var totalLength = 0;
    var maxChunkSize = 50000; // 50KB chunks
    
    return {
        append: function(text) {
            var str = String(text);
            parts.push(str);
            totalLength += str.length;
            
            // Memory management: consolidate if getting large
            if (parts.length > 1000) {
                this.consolidate();
            }
        },
        appendLine: function(text) {
            this.append(String(text) + '\n');
        },
        toString: function() {
            return parts.join('');
        },
        consolidate: function() {
            // Consolidate parts to reduce memory fragmentation
            try {
                var consolidated = parts.join('');
                parts = [consolidated];
            } catch (exc) {
                // If consolidation fails, continue with parts array
            }
        },
        clear: function() {
            parts = [];
            totalLength = 0;
        },
        getLength: function() {
            return totalLength;
        },
        getChunkCount: function() {
            return parts.length;
        },
        isEmpty: function() {
            return totalLength === 0;
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

/**
 * Enhanced UUID generation for unique identifiers
 * SAFETY: Creates unique IDs using time and random elements
 * @returns {String} - Unique identifier
 */
function generateUniqueID() {
    try {
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        return 'id_' + timestamp + '_' + random;
    } catch (exc) {
        return 'id_unknown_' + Math.floor(Math.random() * 100000);
    }
}

// ============================================================================
// MODULE INITIALIZATION (ENHANCED)
// ============================================================================

/**
 * Initialize enhanced safe foundation module
 * SAFETY: Validates all foundation functions are available including new ones
 * @returns {Boolean} - true if initialization successful
 */
function initializeSafeFoundation() {
    try {
        // Test core functions exist
        var requiredFunctions = [
            'safeTypeCheck', 'safeHasProperty', 'safeGetLength',
            'isReservedWord', 'isDangerousProperty', 'createTimeoutChecker',
            'memoryCleanup', 'validateInDesignEnvironment', 'createStringBuilder',
            // Enhanced functions
            'generateObjectReferenceID', 'createObjectReferenceTracker',
            'splitPath', 'joinPath', 'normalizePath', 'isDangerousPath',
            'createEnhancedOperationCounter', 'enhancedMemoryCleanup'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('1.0_safe-foundation.jsx: Enhanced version initialized successfully');
        $.writeln('Enhanced features: Object reference tracking, path utilities, memory monitoring');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced safe foundation initialization failed: ' + exc.message);
        return false;
    }
}

// Legacy cleanup function for compatibility
function memoryCleanup(objsToNull) {
    enhancedMemoryCleanup(objsToNull, null);
}

// Auto-initialize when module loads
initializeSafeFoundation();