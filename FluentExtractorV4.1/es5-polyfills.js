/**
 * Complete ExtendScript ECMA-3 Compatible Polyfills v2.1
 * Based on MDN official polyfills and es5-shim standards
 * Fully ES3 compatible for Adobe ExtendScript environments
 * 
 * Compatible with: Photoshop CS5+, After Effects CS5+, Illustrator CS5+, InDesign CS5+, Premiere Pro CS5+
 * Tested against: ExtendScript Toolkit, UXP, CEP environments
 * 
 * @fileoverview Essential polyfills for modern JavaScript functionality in ExtendScript
 * @version 2.1.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Include at the start of your script
 * ```javascript
 * // At the very beginning of your .jsx file:
 * #include "es5-polyfills.js"
 * 
 * // Now you can use modern JavaScript:
 * var boldRanges = styleRanges.filter(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticBold');
 * });
 * 
 * var fontNames = boldRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * fontNames.forEach(function(name) {
 *   $.writeln('Bold font: ' + name);
 * });
 * ```
 * 
 * @example Good - Using with ActionManager Navigator
 * ```javascript
 * #include "es5-polyfills.js"
 * #include "ActionDescriptorNavigator.js"
 * 
 * var layer = ActionDescriptorNavigator.forCurrentLayer();
 * var allBoldRanges = layer.getObject('textKey')
 *   .getList('textStyleRange')
 *   .getAllWhere(function(range) {
 *     return range.getObject('textStyle').getBoolean('syntheticBold');
 *   });
 * 
 * // Use modern array methods
 * var fontSizes = allBoldRanges.map(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey');
 * });
 * 
 * var uniqueSizes = fontSizes.filter(function(size, index, arr) {
 *   return arr.indexOf(size) === index;
 * });
 * ```
 * 
 * @example Incorrect - Don't assume these exist in ExtendScript
 * ```javascript
 * // These will fail in ExtendScript without polyfills:
 * var filtered = array.filter(callback);     // NOT available natively
 * var mapped = array.map(callback);          // NOT available natively  
 * var found = array.indexOf(item);           // NOT available natively
 * var keys = Object.keys(obj);               // NOT available natively
 * var bound = func.bind(context);            // NOT available natively
 * ```
 */

// =============================================================================
// BASIC TYPE CHECKING UTILITIES (ES3 Compatible)
// =============================================================================

/**
 * Check if object is a function
 * 
 * @param {*} obj - Object to test
 * @returns {boolean} true if object is a function
 * 
 * @example Straightforward - Function detection
 * ```javascript
 * if (isFunction(callback)) {
 *   callback(result);
 * }
 * ```
 */
function isFunction(obj) {
    return typeof obj === 'function';
}

/**
 * Check if object is an object (not null)
 * 
 * @param {*} obj - Object to test
 * @returns {boolean} true if object is an object and not null
 * 
 * @example Good - Object validation
 * ```javascript
 * if (isObject(data) && data.hasOwnProperty('fontName')) {
 *   processFont(data.fontName);
 * }
 * ```
 */
function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

/**
 * Check if object is a string
 * 
 * @param {*} obj - Object to test
 * @returns {boolean} true if object is a string
 */
function isString(obj) {
    return typeof obj === 'string';
}

/**
 * Check if object is a number (and not NaN)
 * 
 * @param {*} obj - Object to test
 * @returns {boolean} true if object is a valid number
 * 
 * @example Good - Number validation
 * ```javascript
 * if (isNumber(fontSize) && fontSize > 0) {
 *   applyFontSize(fontSize);
 * }
 * ```
 */
function isNumber(obj) {
    return typeof obj === 'number' && !isNaN(obj);
}

// =============================================================================
// CORE ARRAY METHODS - Essential for ExtendScript
// =============================================================================

/**
 * Determine if the passed value is an array
 * 
 * @param {*} arg - The object to be checked
 * @returns {boolean} true if the object is an array, false otherwise
 * 
 * @example Best - Array detection
 * ```javascript
 * if (Array.isArray(styleRanges)) {
 *   styleRanges.forEach(function(range) {
 *     processRange(range);
 *   });
 * }
 * ```
 */
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

/**
 * Extract a section of an array and return a new array
 * 
 * @param {number} start - Zero-based index at which to begin extraction
 * @param {number} end - Zero-based index before which to end extraction
 * @returns {Array} A new array containing the extracted elements
 * 
 * @example Best - Array slicing for analysis
 * ```javascript
 * var allRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getInteger('from') >= 0;
 * });
 * 
 * var firstThree = allRanges.slice(0, 3);          // First 3 ranges
 * var lastTwo = allRanges.slice(-2);               // Last 2 ranges
 * var middle = allRanges.slice(2, 5);              // Ranges 2, 3, 4
 * ```
 * 
 * @example Good - Font name extraction
 * ```javascript
 * var fontNames = ['Arial-Bold', 'Times-Roman', 'Helvetica-Light'];
 * var fontFamilies = fontNames.map(function(name) {
 *   return name.slice(0, name.indexOf('-'));  // Extract family name
 * });
 * // Result: ['Arial', 'Times', 'Helvetica']
 * ```
 */
if (!Array.prototype.slice) {
    Array.prototype.slice = function(start, end) {
        var result = [];
        var len = this.length >>> 0;
        
        start = parseInt(start) || 0;
        if (start < 0) {
            start = Math.max(0, len + start);
        }
        
        if (end === undefined) {
            end = len;
        } else {
            end = parseInt(end);
            if (end < 0) {
                end = len + end;
            }
        }
        end = Math.min(end, len);
        
        for (var i = start; i < end; i++) {
            if (i in this) {
                result[result.length] = this[i];
            }
        }
        
        return result;
    };
}

/**
 * Add one or more elements to the end of an array
 * 
 * @param {...*} element - The elements to add to the end of the array
 * @returns {number} The new length of the array
 * 
 * @example Best - Building analysis results
 * ```javascript
 * var fontSizes = [];
 * 
 * allBoldRanges.forEach(function(range) {
 *   var size = range.getObject('textStyle').getUnitDouble('sizeKey');
 *   fontSizes.push(size);
 * });
 * 
 * // Add multiple sizes at once
 * fontSizes.push(12, 14, 16, 18);
 * ```
 */
if (!Array.prototype.push) {
    Array.prototype.push = function() {
        for (var i = 0; i < arguments.length; i++) {
            this[this.length] = arguments[i];
        }
        return this.length;
    };
}

/**
 * Remove the last element from an array and return it
 * 
 * @returns {*} The removed element from the array; undefined if the array is empty
 * 
 * @example Straightforward - Stack operations
 * ```javascript
 * var processQueue = [range1, range2, range3];
 * 
 * while (processQueue.length > 0) {
 *   var current = processQueue.pop();
 *   processTextRange(current);
 * }
 * ```
 */
if (!Array.prototype.pop) {
    Array.prototype.pop = function() {
        if (this.length === 0) {
            return undefined;
        }
        var last = this[this.length - 1];
        this.length = this.length - 1;
        return last;
    };
}

/**
 * Remove the first element from an array and return it
 * 
 * @returns {*} The removed element from the array; undefined if the array is empty
 */
if (!Array.prototype.shift) {
    Array.prototype.shift = function() {
        if (this.length === 0) {
            return undefined;
        }
        var first = this[0];
        for (var i = 1; i < this.length; i++) {
            this[i - 1] = this[i];
        }
        this.length = this.length - 1;
        return first;
    };
}

/**
 * Add one or more elements to the beginning of an array
 * 
 * @param {...*} element - The elements to add to the front of the array
 * @returns {number} The new length of the array
 */
if (!Array.prototype.unshift) {
    Array.prototype.unshift = function() {
        var argLen = arguments.length;
        if (argLen === 0) {
            return this.length;
        }
        
        for (var i = this.length - 1; i >= 0; i--) {
            this[i + argLen] = this[i];
        }
        
        for (var j = 0; j < argLen; j++) {
            this[j] = arguments[j];
        }
        
        return this.length;
    };
}

/**
 * Join all elements of an array into a string
 * 
 * @param {string} separator - String to separate each pair of adjacent elements
 * @returns {string} A string with all array elements joined
 * 
 * @example Best - Font name reporting
 * ```javascript
 * var fontNames = allTextRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * var uniqueFonts = fontNames.filter(function(name, index, arr) {
 *   return arr.indexOf(name) === index;
 * });
 * 
 * var report = 'Fonts used: ' + uniqueFonts.join(', ');
 * $.writeln(report);  // "Fonts used: ArialMT, TimesNewRomanPSMT, HelveticaNeue"
 * ```
 */
if (!Array.prototype.join) {
    Array.prototype.join = function(separator) {
        if (separator === undefined) {
            separator = ',';
        }
        
        if (this.length === 0) {
            return '';
        }
        
        var result = '';
        for (var i = 0; i < this.length; i++) {
            if (i > 0) {
                result += separator;
            }
            if (this[i] !== null && this[i] !== undefined) {
                result += String(this[i]);
            }
        }
        return result;
    };
}

/**
 * Merge two or more arrays
 * 
 * @param {...*} arrayN - Arrays and/or values to concatenate into a new array
 * @returns {Array} A new Array instance
 * 
 * @example Good - Combining analysis results
 * ```javascript
 * var boldRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticBold');
 * });
 * 
 * var italicRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticItalic');
 * });
 * 
 * var styledRanges = boldRanges.concat(italicRanges);  // Combine both arrays
 * var allRanges = styledRanges.concat([headerRange, footerRange]);  // Add individual items
 * ```
 */
if (!Array.prototype.concat) {
    Array.prototype.concat = function() {
        var result = [];
        var resultLength = 0;
        
        for (var i = 0; i < this.length; i++) {
            if (i in this) {
                result[resultLength++] = this[i];
            }
        }
        
        for (var j = 0; j < arguments.length; j++) {
            var arg = arguments[j];
            if (Array.isArray && Array.isArray(arg)) {
                for (var k = 0; k < arg.length; k++) {
                    if (k in arg) {
                        result[resultLength++] = arg[k];
                    }
                }
            } else {
                result[resultLength++] = arg;
            }
        }
        
        return result;
    };
}

/**
 * Reverse an array in place
 * 
 * @returns {Array} The reversed array
 * 
 * @example Straightforward - Process in reverse order
 * ```javascript
 * var layers = document.getAllLayers();
 * var reversedLayers = layers.slice().reverse();  // Copy first, then reverse
 * 
 * reversedLayers.forEach(function(layer) {
 *   // Process from back to front
 *   processLayer(layer);
 * });
 * ```
 */
if (!Array.prototype.reverse) {
    Array.prototype.reverse = function() {
        var len = this.length;
        var middle = Math.floor(len / 2);
        
        for (var i = 0; i < middle; i++) {
            var temp = this[i];
            this[i] = this[len - 1 - i];
            this[len - 1 - i] = temp;
        }
        
        return this;
    };
}

/**
 * Sort the elements of an array in place
 * 
 * @param {function} compareFn - Function that defines the sort order
 * @returns {Array} The sorted array
 * 
 * @example Best - Sort font sizes for analysis
 * ```javascript
 * var fontSizes = allTextRanges.map(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey');
 * });
 * 
 * // Sort sizes in ascending order
 * fontSizes.sort(function(a, b) {
 *   return a - b;
 * });
 * 
 * // Sort layer names alphabetically
 * var layerNames = layers.map(function(layer) {
 *   return layer.getString('name');
 * });
 * 
 * layerNames.sort(function(a, b) {
 *   if (a < b) return -1;
 *   if (a > b) return 1;
 *   return 0;
 * });
 * ```
 */
if (!Array.prototype.sort) {
    Array.prototype.sort = function(compareFn) {
        var len = this.length;
        
        if (!isFunction(compareFn)) {
            compareFn = function(a, b) {
                var aStr = String(a);
                var bStr = String(b);
                if (aStr < bStr) return -1;
                if (aStr > bStr) return 1;
                return 0;
            };
        }
        
        // Simple bubble sort (sufficient for ExtendScript)
        for (var i = 0; i < len - 1; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                if (compareFn(this[j], this[j + 1]) > 0) {
                    var temp = this[j];
                    this[j] = this[j + 1];
                    this[j + 1] = temp;
                }
            }
        }
        
        return this;
    };
}

/**
 * Return the first index at which a given element can be found
 * 
 * @param {*} searchElement - Element to locate in the array
 * @param {number} fromIndex - Index to start the search at
 * @returns {number} The first index of the element in the array; -1 if not found
 * 
 * @example Best - Finding duplicate fonts
 * ```javascript
 * var fontNames = allTextRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * // Remove duplicates
 * var uniqueFonts = fontNames.filter(function(name, index) {
 *   return fontNames.indexOf(name) === index;
 * });
 * 
 * // Check if specific font is used
 * if (fontNames.indexOf('ArialMT') !== -1) {
 *   $.writeln('Arial is used in this document');
 * }
 * ```
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        if (this === null || this === undefined) {
            throw new TypeError('"this" is null or not defined');
        }
        
        var o = Object(this);
        var len = parseInt(o.length) || 0;
        
        if (len === 0) {
            return -1;
        }
        
        var n = parseInt(fromIndex) || 0;
        if (n >= len) {
            return -1;
        }
        
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        
        for (; k < len; k++) {
            if (k in o && o[k] === searchElement) {
                return k;
            }
        }
        
        return -1;
    };
}

/**
 * Return the last index at which a given element can be found
 * 
 * @param {*} searchElement - Element to locate in the array
 * @param {number} fromIndex - Index to start the search backwards from
 * @returns {number} The last index of the element in the array; -1 if not found
 */
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement, fromIndex) {
        if (this === null || this === undefined) {
            throw new TypeError('"this" is null or not defined');
        }
        
        var t = Object(this);
        var len = parseInt(t.length) || 0;
        
        if (len === 0) {
            return -1;
        }
        
        var n = len - 1;
        if (arguments.length > 1) {
            n = parseInt(fromIndex);
            if (n !== n) {
                n = 0;
            } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        
        var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
        
        for (; k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        
        return -1;
    };
}

// =============================================================================
// ARRAY HIGHER-ORDER METHODS - Essential for functional programming
// =============================================================================

/**
 * Execute a provided function once for each array element
 * 
 * @param {function} callback - Function to execute for each element
 * @param {*} thisArg - Value to use as this when executing callback
 * 
 * @example Best - Process all text ranges
 * ```javascript
 * var allBoldRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticBold');
 * });
 * 
 * allBoldRanges.forEach(function(range, index) {
 *   var from = range.getInteger('from');
 *   var to = range.getInteger('to');
 *   var fontSize = range.getObject('textStyle').getUnitDouble('sizeKey');
 *   
 *   $.writeln('Bold range ' + index + ': chars ' + from + '-' + to + ', size ' + fontSize + 'pt');
 * });
 * ```
 * 
 * @example Good - Layer analysis
 * ```javascript
 * var textLayers = layers.getAllWhere(function(layer) {
 *   return layer.hasKey('textKey');
 * });
 * 
 * textLayers.forEach(function(layer) {
 *   var name = layer.getString('name');
 *   var opacity = layer.getInteger('opacity');
 *   var bounds = layer.getBounds();
 *   
 *   if (hasValidBounds(bounds)) {
 *     reportLayer(name, opacity, bounds.width, bounds.height);
 *   }
 * });
 * ```
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        if (this === null || this === undefined) {
            throw new TypeError('this is null or not defined');
        }
        
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        
        if (!isFunction(callback)) {
            throw new TypeError(callback + ' is not a function');
        }
        
        var T;
        if (arguments.length > 1) {
            T = thisArg;
        }
        
        var k = 0;
        while (k < len) {
            if (k in O) {
                callback.call(T, O[k], k, O);
            }
            k++;
        }
    };
}

/**
 * Create a new array with the results of calling a function for every array element
 * 
 * @param {function} callback - Function that produces an element of the new Array
 * @param {*} thisArg - Value to use as this when executing callback
 * @returns {Array} A new array with each element being the result of the callback function
 * 
 * @example Best - Extract font properties for analysis
 * ```javascript
 * var allTextRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getInteger('from') >= 0;
 * });
 * 
 * // Extract font data for analysis
 * var fontData = allTextRanges.map(function(range) {
 *   var style = range.getObject('textStyle');
 *   var color = style.getObject('color');
 *   
 *   return {
 *     // Raw target values for algorithmic processing
 *     fontName: style.getString('fontPostScriptName'),
 *     fontSize: style.getUnitDouble('sizeKey'),        // Exact size from ActionManager
 *     tracking: style.getInteger('tracking'),          // Raw tracking value
 *     bold: style.getBoolean('syntheticBold'),
 *     red: color.getDouble('red'),                     // Raw RGB values
 *     green: color.getDouble('green'),
 *     blue: color.getDouble('blue'),
 *     from: range.getInteger('from'),                  // Character positions
 *     to: range.getInteger('to')
 *   };
 * });
 * 
 * // Now apply your tolerance algorithms to the raw fontData
 * ```
 * 
 * @example Good - Layer name extraction
 * ```javascript
 * var visibleLayers = layers.getAllWhere(function(layer) {
 *   return layer.getBoolean('visible') === true;
 * });
 * 
 * var layerNames = visibleLayers.map(function(layer) {
 *   return layer.getString('name');
 * });
 * 
 * $.writeln('Visible layers: ' + layerNames.join(', '));
 * ```
 */
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        if (this === null || this === undefined) {
            throw new TypeError('this is null or not defined');
        }
        
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        
        if (!isFunction(callback)) {
            throw new TypeError(callback + ' is not a function');
        }
        
        var T;
        if (arguments.length > 1) {
            T = thisArg;
        }
        
        var A = new Array(len);
        var k = 0;
        
        while (k < len) {
            if (k in O) {
                A[k] = callback.call(T, O[k], k, O);
            }
            k++;
        }
        
        return A;
    };
}

/**
 * Create a new array with all elements that pass the test implemented by the provided function
 * 
 * @param {function} callback - Function to test each element
 * @param {*} thisArg - Value to use as this when executing callback
 * @returns {Array} A new array with the elements that pass the test
 * 
 * @example Best - Filter font sizes for analysis
 * ```javascript
 * var allRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getInteger('from') >= 0;
 * });
 * 
 * var fontSizes = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey');
 * });
 * 
 * // Filter for large fonts
 * var largeSizes = fontSizes.filter(function(size) {
 *   return size > 24;
 * });
 * 
 * // Filter for valid sizes (not sentinel values)
 * var validSizes = fontSizes.filter(function(size) {
 *   return size !== -1 && size > 0;
 * });
 * 
 * // Remove duplicates
 * var uniqueSizes = fontSizes.filter(function(size, index, arr) {
 *   return arr.indexOf(size) === index;
 * });
 * ```
 * 
 * @example Good - Layer filtering
 * ```javascript
 * var allLayers = document.getAllLayers();
 * 
 * // Filter visible text layers
 * var visibleTextLayers = allLayers.filter(function(layer) {
 *   return layer.getBoolean('visible') && layer.hasKey('textKey');
 * });
 * 
 * // Filter layers with effects
 * var effectLayers = allLayers.filter(function(layer) {
 *   return layer.getBoolean('layerFXVisible');
 * });
 * ```
 */
if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback, thisArg) {
        if (this === null || this === undefined) {
            throw new TypeError();
        }
        
        var t = Object(this);
        var len = t.length >>> 0;
        
        if (!isFunction(callback)) {
            throw new TypeError();
        }
        
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (callback.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }
        
        return res;
    };
}

/**
 * Test whether all elements in the array pass the test implemented by the provided function
 * 
 * @param {function} callbackfn - Function to test for each element
 * @param {*} thisArg - Value to use as this when executing callbackfn
 * @returns {boolean} true if all elements pass the test, false otherwise
 * 
 * @example Good - Validation checks
 * ```javascript
 * var fontSizes = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey');
 * });
 * 
 * // Check if all fonts are valid (not sentinel)
 * var allValid = fontSizes.every(function(size) {
 *   return size !== -1 && size > 0;
 * });
 * 
 * // Check if all fonts are large
 * var allLarge = fontSizes.every(function(size) {
 *   return size > 12;
 * });
 * 
 * if (allValid) {
 *   $.writeln('All font sizes are valid');
 * }
 * ```
 */
if (!Array.prototype.every) {
    Array.prototype.every = function(callbackfn, thisArg) {
        if (this === null || this === undefined) {
            throw new TypeError('this is null or not defined');
        }
        
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        
        if (!isFunction(callbackfn)) {
            throw new TypeError();
        }
        
        var T;
        if (arguments.length > 1) {
            T = thisArg;
        }
        
        var k = 0;
        while (k < len) {
            if (k in O) {
                var testResult = callbackfn.call(T, O[k], k, O);
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        
        return true;
    };
}

/**
 * Test whether at least one element in the array passes the test implemented by the provided function
 * 
 * @param {function} callback - Function to test for each element
 * @param {*} thisArg - Value to use as this when executing callback
 * @returns {boolean} true if at least one element passes the test, false otherwise
 * 
 * @example Best - Existence checks
 * ```javascript
 * var allRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getInteger('from') >= 0;
 * });
 * 
 * // Check if any text is bold
 * var hasBoldText = allRanges.some(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticBold');
 * });
 * 
 * // Check if any font is large
 * var hasLargeFonts = allRanges.some(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey') > 24;
 * });
 * 
 * // Check if any color is not black
 * var hasColoredText = allRanges.some(function(range) {
 *   var color = range.getObject('textStyle').getObject('color');
 *   var r = color.getDouble('red');
 *   var g = color.getDouble('green');
 *   var b = color.getDouble('blue');
 *   return !(r === 0 && g === 0 && b === 0);
 * });
 * ```
 */
if (!Array.prototype.some) {
    Array.prototype.some = function(callback, thisArg) {
        if (this === null || this === undefined) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }
        
        if (!isFunction(callback)) {
            throw new TypeError();
        }
        
        var t = Object(this);
        var len = t.length >>> 0;
        
        for (var i = 0; i < len; i++) {
            if (i in t && callback.call(thisArg, t[i], i, t)) {
                return true;
            }
        }
        
        return false;
    };
}

/**
 * Apply a function against an accumulator and each element in the array to reduce it to a single value
 * 
 * @param {function} callback - Function to execute on each element
 * @param {*} initialValue - Value to use as the first argument to the first call of the callback
 * @returns {*} The final result of the reduction
 * 
 * @example Best - Font size analysis
 * ```javascript
 * var fontSizes = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getUnitDouble('sizeKey');
 * }).filter(function(size) {
 *   return size > 0;  // Filter out sentinel values
 * });
 * 
 * // Find maximum font size
 * var maxSize = fontSizes.reduce(function(max, size) {
 *   return size > max ? size : max;
 * }, 0);
 * 
 * // Calculate total of all font sizes
 * var totalSize = fontSizes.reduce(function(sum, size) {
 *   return sum + size;
 * }, 0);
 * 
 * // Calculate average font size
 * var avgSize = totalSize / fontSizes.length;
 * 
 * $.writeln('Font size analysis:');
 * $.writeln('  Max: ' + maxSize + 'pt');
 * $.writeln('  Average: ' + avgSize.toFixed(1) + 'pt');
 * ```
 * 
 * @example Good - Build font usage report
 * ```javascript
 * var fontNames = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * // Count font usage
 * var fontCount = fontNames.reduce(function(counts, font) {
 *   counts[font] = (counts[font] || 0) + 1;
 *   return counts;
 * }, {});
 * 
 * // Result: { "ArialMT": 3, "TimesNewRomanPSMT": 1, "HelveticaNeue": 2 }
 * ```
 */
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback, initialValue) {
        if (this === null || this === undefined) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        
        if (!isFunction(callback)) {
            throw new TypeError(callback + ' is not a function');
        }
        
        var o = Object(this);
        var len = o.length >>> 0;
        var k = 0;
        var value;
        
        if (arguments.length >= 2) {
            value = initialValue;
        } else {
            while (k < len && !(k in o)) {
                k++;
            }
            if (k >= len) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            value = o[k++];
        }
        
        while (k < len) {
            if (k in o) {
                value = callback(value, o[k], k, o);
            }
            k++;
        }
        
        return value;
    };
}

/**
 * Apply a function against an accumulator and each value of the array (from right-to-left) to reduce it to a single value
 * 
 * @param {function} callback - Function to execute on each value in the array
 * @param {*} initialValue - Value to use as the first argument to the first call of the callback
 * @returns {*} The value that results from the reduction
 */
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(callback, initialValue) {
        if (this === null || this === undefined) {
            throw new TypeError('Array.prototype.reduceRight called on null or undefined');
        }
        
        if (!isFunction(callback)) {
            throw new TypeError(callback + ' is not a function');
        }
        
        var t = Object(this);
        var len = parseInt(t.length) || 0;
        var k = len - 1;
        var value;
        
        if (arguments.length >= 2) {
            value = initialValue;
        } else {
            while (k >= 0 && !(k in t)) {
                k--;
            }
            if (k < 0) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            value = t[k--];
        }
        
        for (; k >= 0; k--) {
            if (k in t) {
                value = callback(value, t[k], k, t);
            }
        }
        
        return value;
    };
}

// =============================================================================
// STRING METHODS - Essential for text processing
// =============================================================================

/**
 * Remove whitespace from both ends of a string
 * 
 * @returns {string} A new string with whitespace removed from both ends
 * 
 * @example Best - Clean font names and layer names
 * ```javascript
 * var layerNames = allLayers.map(function(layer) {
 *   return layer.getString('name').trim();  // Remove leading/trailing spaces
 * }).filter(function(name) {
 *   return name.length > 0;  // Remove empty names
 * });
 * 
 * var fontFamilies = fontNames.map(function(name) {
 *   return name.split('-')[0].trim();  // Extract and clean family name
 * });
 * ```
 */
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

/**
 * Split a string into an array of substrings
 * 
 * @param {string|RegExp} separator - The pattern describing where each split should occur
 * @param {number} limit - A limit on the number of substrings to be included in the array
 * @returns {Array} An Array of strings, split at each point where the separator occurs
 * 
 * @example Best - Font name parsing
 * ```javascript
 * var fontNames = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * var fontFamilies = fontNames.map(function(name) {
 *   var parts = name.split('-');          // Split "Arial-Bold" -> ["Arial", "Bold"]
 *   return parts[0];                      // Get family name
 * });
 * 
 * var fontWeights = fontNames.map(function(name) {
 *   var parts = name.split('-');
 *   return parts.length > 1 ? parts[1] : 'Regular';  // Get weight or default
 * });
 * ```
 * 
 * @example Good - Layer name parsing
 * ```javascript
 * var layerNames = layers.map(function(layer) {
 *   return layer.getString('name');
 * });
 * 
 * // Parse "Section_01_Title" -> ["Section", "01", "Title"]
 * var nameParts = layerNames.map(function(name) {
 *   return name.split('_');
 * });
 * ```
 */
if (!String.prototype.split) {
    String.prototype.split = function(separator, limit) {
        if (separator === undefined) {
            return [String(this)];
        }
        
        var result = [];
        var str = String(this);
        var sep = String(separator);
        
        if (sep === '') {
            for (var i = 0; i < str.length && (limit === undefined || result.length < limit); i++) {
                result.push(str.charAt(i));
            }
            return result;
        }
        
        var start = 0;
        var index = str.indexOf(sep);
        
        while (index !== -1 && (limit === undefined || result.length < limit - 1)) {
            result.push(str.substring(start, index));
            start = index + sep.length;
            index = str.indexOf(sep, start);
        }
        
        if (limit === undefined || result.length < limit) {
            result.push(str.substring(start));
        }
        
        return result;
    };
}

/**
 * Return the character at the specified index
 * 
 * @param {number} index - An integer between 0 and the length of the string
 * @returns {string} The character at the specified index
 */
if (!String.prototype.charAt) {
    String.prototype.charAt = function(index) {
        var str = String(this);
        var i = parseInt(index) || 0;
        if (i < 0 || i >= str.length) {
            return '';
        }
        return str.substring(i, i + 1);
    };
}

/**
 * Return the part of the string between the start and end indexes
 * 
 * @param {number} start - The index of the first character to include
 * @param {number} end - The index of the first character to exclude
 * @returns {string} A new string containing the specified part of the given string
 */
if (!String.prototype.substring) {
    String.prototype.substring = function(start, end) {
        var str = String(this);
        var len = str.length;
        
        start = parseInt(start) || 0;
        if (start < 0) start = 0;
        if (start > len) start = len;
        
        if (end === undefined) {
            end = len;
        } else {
            end = parseInt(end) || 0;
            if (end < 0) end = 0;
            if (end > len) end = len;
        }
        
        if (start > end) {
            var temp = start;
            start = end;
            end = temp;
        }
        
        var result = '';
        for (var i = start; i < end; i++) {
            result += str.charAt(i);
        }
        return result;
    };
}

/**
 * Return a new string with some or all matches of a pattern replaced by a replacement
 * 
 * @param {string|RegExp} searchValue - The pattern to search for
 * @param {string} replaceValue - The string to replace matches with
 * @returns {string} A new string with some or all matches replaced
 * 
 * @example Good - Font name normalization
 * ```javascript
 * var fontNames = allRanges.map(function(range) {
 *   var name = range.getObject('textStyle').getString('fontPostScriptName');
 *   return name.replace('MT', '').replace('PS', '');  // Normalize suffixes
 * });
 * ```
 */
if (!String.prototype.replace) {
    String.prototype.replace = function(searchValue, replaceValue) {
        var str = String(this);
        var search = String(searchValue);
        var replace = String(replaceValue);
        
        var index = str.indexOf(search);
        if (index === -1) {
            return str;
        }
        
        return str.substring(0, index) + replace + str.substring(index + search.length);
    };
}

/**
 * Return the string converted to lower case
 * 
 * @returns {string} The calling string value converted to lower case
 * 
 * @example Good - Case-insensitive comparisons
 * ```javascript
 * var fontNames = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName').toLowerCase();
 * });
 * 
 * // Check for Arial family fonts (case-insensitive)
 * var hasArial = fontNames.some(function(name) {
 *   return name.indexOf('arial') !== -1;
 * });
 * ```
 */
if (!String.prototype.toLowerCase) {
    String.prototype.toLowerCase = function() {
        return this.replace(/[A-Z]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) + 32);
        });
    };
}

/**
 * Return the string converted to upper case
 * 
 * @returns {string} The calling string value converted to upper case
 */
if (!String.prototype.toUpperCase) {
    String.prototype.toUpperCase = function() {
        return this.replace(/[a-z]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 32);
        });
    };
}

/**
 * Determine whether a string contains the characters of a specified string
 * 
 * @param {string} search - The string to search for
 * @param {number} start - The position in this string at which to begin searching
 * @returns {boolean} true if the search string is found, false otherwise
 * 
 * @example Best - Font family detection
 * ```javascript
 * var fontNames = allRanges.map(function(range) {
 *   return range.getObject('textStyle').getString('fontPostScriptName');
 * });
 * 
 * // Find fonts that include "Arial"
 * var arialFonts = fontNames.filter(function(name) {
 *   return name.includes('Arial');
 * });
 * 
 * // Check if any fonts are web safe
 * var webSafeFonts = ['Arial', 'Times', 'Helvetica', 'Georgia'];
 * var hasWebSafeFont = fontNames.some(function(name) {
 *   return webSafeFonts.some(function(webFont) {
 *     return name.includes(webFont);
 *   });
 * });
 * ```
 */
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// =============================================================================
// OBJECT METHODS - Essential for data processing
// =============================================================================

/**
 * Return an array of a given object's own enumerable property names
 * 
 * @param {Object} obj - The object whose enumerable properties are to be returned
 * @returns {Array} An array of strings that represent all the enumerable properties of the given object
 * 
 * @example Best - Font analysis reporting
 * ```javascript
 * var fontData = allRanges.map(function(range) {
 *   var style = range.getObject('textStyle');
 *   return {
 *     name: style.getString('fontPostScriptName'),
 *     size: style.getUnitDouble('sizeKey'),
 *     bold: style.getBoolean('syntheticBold'),
 *     italic: style.getBoolean('syntheticItalic')
 *   };
 * });
 * 
 * // Group fonts by properties
 * var fontUsage = fontData.reduce(function(usage, font) {
 *   var key = font.name + '_' + font.size;
 *   if (!usage[key]) {
 *     usage[key] = font;
 *     usage[key].count = 0;
 *   }
 *   usage[key].count++;
 *   return usage;
 * }, {});
 * 
 * // Generate report
 * Object.keys(fontUsage).forEach(function(key) {
 *   var font = fontUsage[key];
 *   $.writeln(font.name + ' ' + font.size + 'pt: used ' + font.count + ' times');
 * });
 * ```
 * 
 * @example Good - Layer analysis
 * ```javascript
 * var layerData = {
 *   visible: 15,
 *   hidden: 3,
 *   text: 8,
 *   image: 10
 * };
 * 
 * Object.keys(layerData).forEach(function(type) {
 *   $.writeln(type + ' layers: ' + layerData[type]);
 * });
 * ```
 */
if (!Object.keys) {
    Object.keys = (function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
        var dontEnums = [
            'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
            'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ];
        var dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (!isObject(obj) && !isFunction(obj)) {
                throw new TypeError('Object.keys called on non-object');
            }
            
            var result = [];
            var prop;
            var i;
            
            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }
            
            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            
            return result;
        };
    }());
}

// =============================================================================
// FUNCTION METHODS - Essential for context management
// =============================================================================

/**
 * Create a new function that, when called, has its this keyword set to the provided value
 * 
 * @param {*} oThis - The value to be passed as the this parameter
 * @param {...*} aArgs - Arguments to prepend to arguments provided to the bound function
 * @returns {Function} A bound function with the specified this value and initial arguments
 * 
 * @example Good - Context binding for callbacks
 * ```javascript
 * var TextAnalyzer = {
 *   minSize: 12,
 *   
 *   isLargeFont: function(range) {
 *     var size = range.getObject('textStyle').getUnitDouble('sizeKey');
 *     return size > this.minSize;
 *   },
 *   
 *   analyze: function(ranges) {
 *     // Bind context for filter callback
 *     var largeRanges = ranges.filter(this.isLargeFont.bind(this));
 *     return largeRanges;
 *   }
 * };
 * 
 * var allRanges = styleRanges.getAllWhere(function(range) {
 *   return range.getInteger('from') >= 0;
 * });
 * 
 * var analysis = TextAnalyzer.analyze(allRanges);
 * ```
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (!isFunction(this)) {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        
        var aArgs = Array.prototype.slice.call(arguments, 1);
        var fToBind = this;
        var fNOP = function() {};
        var fBound = function() {
            return fToBind.apply(
                this instanceof fNOP ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments))
            );
        };
        
        if (this.prototype) {
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();
        
        return fBound;
    };
}

// =============================================================================
// MATH METHODS - Basic mathematical operations
// =============================================================================

/**
 * Return the largest of zero or more numbers
 * 
 * @param {...number} valueN - Numbers to compare
 * @returns {number} The largest of the given numbers
 */
if (!Math.max) {
    Math.max = function() {
        var max = -Infinity;
        for (var i = 0; i < arguments.length; i++) {
            var val = Number(arguments[i]);
            if (isNaN(val)) return NaN;
            if (val > max) max = val;
        }
        return max;
    };
}

/**
 * Return the smallest of zero or more numbers
 * 
 * @param {...number} valueN - Numbers to compare
 * @returns {number} The smallest of the given numbers
 */
if (!Math.min) {
    Math.min = function() {
        var min = Infinity;
        for (var i = 0; i < arguments.length; i++) {
            var val = Number(arguments[i]);
            if (isNaN(val)) return NaN;
            if (val < min) min = val;
        }
        return min;
    };
}

// =============================================================================
// DATE METHODS - Basic date functionality
// =============================================================================

/**
 * Return the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
 * 
 * @returns {number} The number of milliseconds since the Unix Epoch
 * 
 * @example Straightforward - Performance timing
 * ```javascript
 * var startTime = Date.now();
 * 
 * // Process all text ranges
 * var results = styleRanges.getAllWhere(function(range) {
 *   return range.getObject('textStyle').getBoolean('syntheticBold');
 * });
 * 
 * var endTime = Date.now();
 * $.writeln('Processing took ' + (endTime - startTime) + 'ms');
 * ```
 */
if (!Date.now) {
    Date.now = function() {
        return new Date().getTime();
    };
}

// =============================================================================
// COMPATIBILITY VERIFICATION - Ensure all polyfills loaded correctly
// =============================================================================

/**
 * Verify that all essential polyfills are available
 * This runs automatically when the script is included
 */
(function() {
    var requiredMethods = [
        'Array.isArray',
        'Array.prototype.slice',
        'Array.prototype.push',
        'Array.prototype.indexOf',
        'Array.prototype.forEach',
        'Array.prototype.map',
        'Array.prototype.filter',
        'Array.prototype.some',
        'Array.prototype.every',
        'Array.prototype.reduce',
        'String.prototype.trim',
        'String.prototype.split',
        'String.prototype.includes',
        'Object.keys',
        'Function.prototype.bind',
        'Date.now'
    ];
    
    var missing = [];
    
    for (var i = 0; i < requiredMethods.length; i++) {
        var method = requiredMethods[i];
        var parts = method.split('.');
        var obj = this;
        
        for (var j = 0; j < parts.length; j++) {
            if (parts[j] === 'prototype') {
                obj = obj.prototype;
            } else {
                obj = obj[parts[j]];
                if (!obj) break;
            }
        }
        
        if (!obj) {
            missing.push(method);
        }
    }
    
    if (missing.length > 0 && typeof $ !== 'undefined' && $ && $.writeln) {
        $.writeln('ExtendScript Polyfills: Missing methods after polyfill load: ' + missing.join(', '));
    } else if (missing.length === 0 && typeof $ !== 'undefined' && $ && $.writeln) {
        $.writeln('ExtendScript Polyfills: All essential methods loaded successfully');
    }
})();