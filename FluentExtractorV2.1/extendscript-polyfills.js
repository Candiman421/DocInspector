// =============================================================================
// Industry-Standard ExtendScript ECMA-3 Polyfills 
// Based on MDN official polyfills and es5-shim
// Fully spec-compliant with proper error handling
// =============================================================================

// =============================================================================
// STRING METHODS
// =============================================================================

// String.prototype.trim - Official MDN polyfill
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

// String case methods - simplified but working versions for ExtendScript
if (!String.prototype.toLowerCase) {
    String.prototype.toLowerCase = function () {
        return this.replace(/[A-Z]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) + 32);
        });
    };
}

if (!String.prototype.toUpperCase) {
    String.prototype.toUpperCase = function () {
        return this.replace(/[a-z]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) - 32);
        });
    };
}

// String.prototype.includes - MDN polyfill
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
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
// ARRAY METHODS - MDN/es5-shim compliant
// =============================================================================

// Array.isArray - Critical static method
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

// Array.prototype.indexOf - es5-shim compliant
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        'use strict';
        var k;
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = parseInt(o.length) || 0;
        if (len === 0) {
            return -1;
        }
        var n = parseInt(fromIndex) || 0;
        var k;
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in o && o[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

// Array.prototype.lastIndexOf - es5-shim compliant
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
        'use strict';
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var n, k;
        var t = Object(this);
        var len = parseInt(t.length) || 0;
        if (len === 0) {
            return -1;
        }
        n = len - 1;
        if (arguments.length > 1) {
            n = parseInt(fromIndex);
            if (n != n) {
                n = 0;
            } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

// Array.prototype.every - MDN polyfill
if (!Array.prototype.every) {
    Array.prototype.every = function (callbackfn, thisArg) {
        'use strict';
        var T, k;
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                var testResult = callbackfn.call(T, kValue, k, O);
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}

// Array.prototype.some - MDN polyfill
if (!Array.prototype.some) {
    Array.prototype.some = function (fun, thisArg) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }
        return false;
    };
}

// Array.prototype.forEach - MDN polyfill  
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

// Array.prototype.map - Full MDN polyfill
if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A;
    };
}

// Array.prototype.filter - MDN polyfill
if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun, thisArg) {
        'use strict';
        if (this === void 0 || this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}

// Array.prototype.reduce - MDN polyfill
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function (callback, initialValue) {
        if (this === null) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if (typeof callback !== 'function') {
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

// Array.prototype.reduceRight - MDN polyfill
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function (callback, initialValue) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.reduceRight called on null or undefined');
        }
        if (typeof callback !== 'function') {
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
// OBJECT METHODS
// =============================================================================

// Object.keys - MDN polyfill
if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
        var dontEnums = [
            'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
            'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ];
        var dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }
            var result = [], prop, i;
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

// Function.prototype.bind - MDN polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1);
        var fToBind = this;
        var fNOP = function () { };
        var fBound = function () {
            return fToBind.apply(this instanceof fNOP ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        if (this.prototype) {
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();
        return fBound;
    };
}

// =============================================================================
// DATE METHODS
// =============================================================================

// Date.now - es5-shim
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// =============================================================================
// JSON METHODS
// =============================================================================

// Basic JSON support for ExtendScript
if (typeof JSON === 'undefined') {
    window.JSON = {
        parse: function (sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: function (vContent) {
            if (vContent instanceof Object) {
                var sOutput = '';
                if (vContent.constructor === Array) {
                    for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ',', nId++);
                    return '[' + sOutput.substr(0, sOutput.length - 1) + ']';
                }
                if (vContent.toString !== Object.prototype.toString) {
                    return '"' + vContent.toString().replace(/"/g, '\\$&') + '"';
                }
                for (var sProp in vContent) {
                    sOutput += '"' + sProp.replace(/"/g, '\\$&') + '":' + this.stringify(vContent[sProp]) + ',';
                }
                return '{' + sOutput.substr(0, sOutput.length - 1) + '}';
            }
            return typeof vContent === 'string' ? '"' + vContent.replace(/"/g, '\\$&') + '"' : String(vContent);
        }
    };
}

// =============================================================================
// CONSOLE POLYFILL for ExtendScript
// =============================================================================

if (typeof console === 'undefined') {
    window.console = {
        log: function () {
            var message = '';
            for (var i = 0; i < arguments.length; i++) {
                message += (i > 0 ? ' ' : '') + String(arguments[i]);
            }
            $.writeln(message);
        },
        warn: function () { this.log.apply(this, arguments); },
        error: function () { this.log.apply(this, arguments); },
        info: function () { this.log.apply(this, arguments); }
    };
}