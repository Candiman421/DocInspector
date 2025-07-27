// =============================================================================
// Complete ExtendScript ECMA-3 Compatible Polyfills v2.1
// Based on MDN official polyfills and es5-shim standards
// Fully ES3 compatible for Adobe ExtendScript
// 
// Compatible with: Photoshop, After Effects, Illustrator, InDesign, Premiere Pro
// Tested against: ExtendScript Toolkit, UXP, CEP environments
// =============================================================================

// =============================================================================
// BASIC TYPE CHECKING UTILITIES (ES3 Compatible)
// =============================================================================

function isFunction(obj) {
    return typeof obj === 'function';
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isString(obj) {
    return typeof obj === 'string';
}

function isNumber(obj) {
    return typeof obj === 'number' && !isNaN(obj);
}

// =============================================================================
// CORE ARRAY METHODS - Essential for ExtendScript
// =============================================================================

if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

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

if (!Array.prototype.push) {
    Array.prototype.push = function() {
        for (var i = 0; i < arguments.length; i++) {
            this[this.length] = arguments[i];
        }
        return this.length;
    };
}

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
// ARRAY HIGHER-ORDER METHODS
// =============================================================================

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
// STRING METHODS
// =============================================================================

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

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

if (!String.prototype.toLowerCase) {
    String.prototype.toLowerCase = function() {
        return this.replace(/[A-Z]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) + 32);
        });
    };
}

if (!String.prototype.toUpperCase) {
    String.prototype.toUpperCase = function() {
        return this.replace(/[a-z]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 32);
        });
    };
}

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
// OBJECT METHODS
// =============================================================================

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
// FUNCTION METHODS
// =============================================================================

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
// MATH METHODS
// =============================================================================

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
// DATE METHODS
// =============================================================================

if (!Date.now) {
    Date.now = function() {
        return new Date().getTime();
    };
}

// =============================================================================
// COMPATIBILITY VERIFICATION
// =============================================================================

(function() {
    var requiredMethods = [
        'Array.isArray',
        'Array.prototype.slice',
        'Array.prototype.push',
        'Array.prototype.indexOf',
        'Array.prototype.forEach',
        'Array.prototype.map',
        'Array.prototype.filter',
        'String.prototype.trim',
        'String.prototype.split',
        'Object.keys',
        'Function.prototype.bind'
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
    }
})();