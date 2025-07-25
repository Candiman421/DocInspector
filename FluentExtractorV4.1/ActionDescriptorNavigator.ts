/**
 * ActionDescriptorNavigator Framework V4.1 - Complete Implementation with Query Builder
 * LINQ-style navigation for Adobe Photoshop ActionDescriptor with ES3 compatibility
 * 
 * Features:
 * - Fluent LINQ-style chaining (where, select, first, etc.)
 * - Semantic object access (no indices in user code)
 * - Advanced query builder with auto-detection
 * - Comprehensive sentinel pattern (no null/undefined errors)
 * - Debug chaining support (.debug() anywhere in chain)
 * - Memory-safe ES3 ExtendScript compatibility
 * - Type-safe value extraction with logging
 */

import { 
    executeActionGet, 
    stringIDToTypeID, 
    charIDToTypeID, 
    typeIDToStringID 
} from "../ps";

// =============================================================================
// EXTENDSCRIPT GLOBAL DECLARATIONS
// =============================================================================

/**
 * ExtendScript global object declarations for TypeScript compatibility
 * @description Declares the $ global object available in Adobe ExtendScript environment
 */
declare global {
    /**
     * ExtendScript global utility object
     */
    var $: {
        /**
         * Write line to ExtendScript console
         * @param message - Message to write to console
         */
        writeln(message: string): void;
    };
}

// =============================================================================
// SENTINEL VALUES
// =============================================================================

/**
 * Sentinel values for type-safe error handling without exceptions
 * @description These values are returned when data extraction fails or properties don't exist
 * @constant
 */
export var SENTINELS = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Attempts to extract a value using multiple getter methods in order of priority
 * @description Internal helper function for the extract() method
 * @param {ActionDescriptorNavigator} obj - Navigator instance to extract from
 * @param {string} key - Property key to extract
 * @returns {any} First successfully extracted value or null if all fail
 * @private
 */
function getValueByType(obj, key) {
    var stringVal = obj.getString(key);
    if (stringVal !== SENTINELS.string) return stringVal;

    var doubleVal = obj.getDouble(key);
    if (doubleVal !== SENTINELS.double) return doubleVal;

    var intVal = obj.getInteger(key);
    if (intVal !== SENTINELS.integer) return intVal;

    var boolVal = obj.getBoolean(key);
    if (boolVal !== SENTINELS.boolean) return boolVal;

    var enumVal = obj.getEnumerated(key);
    if (enumVal !== SENTINELS.enumerated) return enumVal;

    return null;
}

/**
 * Compares two values with case-insensitive string matching
 * @description Used internally for filtering operations
 * @param {any} actual - The actual value from ActionDescriptor
 * @param {any} expected - The expected value to match against
 * @returns {boolean} True if values match, false otherwise
 * @private
 */
function valuesMatch(actual, expected) {
    if (typeof expected === 'string' && typeof actual === 'string') {
        return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Function type for filtering operations in LINQ-style queries
 * @typedef {Function} PredicateFunction
 * @param {ActionDescriptorNavigator} item - Navigator instance to test
 * @returns {boolean} True if item matches criteria, false otherwise
 */
export type PredicateFunction = (item: ActionDescriptorNavigator) => boolean;

/**
 * Function type for projection operations in LINQ-style queries
 * @typedef {Function} SelectorFunction
 * @template T
 * @param {ActionDescriptorNavigator} item - Navigator instance to transform
 * @returns {T} Transformed result
 */
export type SelectorFunction<T> = (item: ActionDescriptorNavigator) => T;

/**
 * Layer bounds object with calculated dimensions
 * @typedef {Object} BoundsObject
 * @property {number} left - Left edge position in pixels
 * @property {number} top - Top edge position in pixels  
 * @property {number} right - Right edge position in pixels
 * @property {number} bottom - Bottom edge position in pixels
 * @property {number} width - Calculated width (right - left)
 * @property {number} height - Calculated height (bottom - top)
 */
export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Mapping object for batch property extraction
 * @typedef {Object} PropertyExtractionMap
 * @description Maps property names to getter method names for batch extraction
 */
export interface PropertyExtractionMap {
    [propertyName: string]: 'getString' | 'getDouble' | 'getUnitDouble' | 'getInteger' | 'getBoolean' | 'getEnumerated';
}

/**
 * Query criterion for filtering operations
 * @typedef {Object} QueryCriterion
 * @property {string} path - Property path (e.g., 'textStyle.fontName')
 * @property {string} operator - Comparison operator ('===', '>', '>=', etc.)
 * @property {any} value - Expected value
 */
export interface QueryCriterion {
    path: string;
    operator: string;
    value: any;
}

/**
 * Property selection definition for query builder
 * @typedef {Object} PropertySelection
 * @property {string} name - Result property name
 * @property {string} path - Property path to extract from
 * @property {string} method - Getter method to use
 */
export interface PropertySelection {
    name: string;
    path: string;
    method: string;
}

/**
 * Query builder function type
 * @typedef {Function} QueryBuilderFunction
 * @param {StyleRangeQuery} q - Query builder instance
 * @returns {StyleRangeQuery} Configured query builder
 */
export type QueryBuilderFunction = (q: StyleRangeQuery) => StyleRangeQuery;

// =============================================================================
// StyleRangeQuery - Advanced Query Builder
// =============================================================================

/**
 * Advanced query builder for filtering and extracting data with auto-detection
 * @class
 * @description Provides SQL-like query capabilities with automatic getter method detection
 * and clean value extraction. Eliminates the need for manual navigation and getter calls.
 */
export class StyleRangeQuery {
    /**
     * Array of filter criteria
     * @type {QueryCriterion[]}
     * @private
     */
    private criteria: QueryCriterion[];
    
    /**
     * Array of properties to extract
     * @type {PropertySelection[]}
     * @private
     */
    private selectedProps: PropertySelection[];

    /**
     * Creates a new StyleRangeQuery instance
     * @description Internal constructor - use through ActionListNavigator.query() method
     */
    constructor() {
        this.criteria = [];
        this.selectedProps = [];
    }

    /**
     * Add filter criterion to query
     * @param {string} path - Property path (e.g., 'textStyle.fontName', 'textStyle.fontSize')
     * @param {string|any} operatorOrValue - Operator ('>', '>=', '===', 'contains') or direct value for equality
     * @param {any} [value] - Value to compare against (if operator specified)
     * @returns {StyleRangeQuery} This query builder (for chaining)
     * @description Adds filtering criteria to the query. Supports multiple operators and automatic equality detection.
     * @example
     * // ✅ GOOD: Simple equality check
     * query.where('textStyle.fontName', 'Arial')
     * 
     * @example
     * // ✅ BETTER: Comparison operators
     * query.where('textStyle.fontSize', '>', 20)
     *      .where('textStyle.fontSize', '<=', 72)
     *      .where('textStyle.tracking', '!==', 0)
     * 
     * @example
     * // ✅ BEST: String operations and complex conditions
     * query.where('textStyle.fontName', 'contains', 'Arial')
     *      .where('textStyle.fontSize', 'between', [16, 24])
     *      .where('textStyle.syntheticBold', false)
     * 
     * @example
     * // ❌ BAD: Using for complex logic that should be in predicate function
     * query.where('complexCalculation', '>', someComplexValue);
     * // Use firstWhere() with predicate function instead for complex logic
     */
    where(path: string, operatorOrValue: any, value?: any): StyleRangeQuery {
        if (value === undefined) {
            // where('fontName', 'Arial') - equality check
            this.criteria.push({path: path, operator: '===', value: operatorOrValue});
        } else {
            // where('fontSize', '>', 20) - explicit operator
            this.criteria.push({path: path, operator: operatorOrValue, value: value});
        }
        return this;
    }

    /**
     * Specify properties to extract with automatic getter method detection
     * @param {(string|PropertySelection)[]} properties - Array of property names or explicit property definitions
     * @returns {StyleRangeQuery} This query builder (for chaining)
     * @description Specifies which properties to extract from matching objects. Automatically detects
     * appropriate getter methods based on property names, or allows explicit specification.
     * @example
     * // ✅ GOOD: Auto-detection of getter methods
     * query.select(['fontName', 'fontSize', 'syntheticBold', 'fontCaps'])
     * //          ↑ getString ↑ getDouble ↑ getBoolean   ↑ getEnumerated
     * 
     * @example
     * // ✅ BETTER: Mixed auto-detection and explicit specification
     * query.select([
     *     'fontName',    // Auto-detect: getString
     *     'fontSize',    // Auto-detect: getDouble
     *     { name: 'customValue', path: 'customProperty.value', method: 'getInteger' }
     * ])
     * 
     * @example
     * // ✅ BEST: Complete extraction with all common properties
     * query.select([
     *     'fontName',           // textStyle.fontName -> getString
     *     'fontPostScriptName', // textStyle.fontPostScriptName -> getString
     *     'fontSize',           // textStyle.fontSize -> getDouble
     *     'tracking',           // textStyle.tracking -> getDouble
     *     'leading',            // textStyle.leading -> getDouble
     *     'syntheticBold',      // textStyle.syntheticBold -> getBoolean
     *     'syntheticItalic',    // textStyle.syntheticItalic -> getBoolean
     *     'fontCaps',           // textStyle.fontCaps -> getEnumerated
     *     'baseline'            // textStyle.baseline -> getEnumerated
     * ])
     * 
     * @example
     * // ❌ BAD: Selecting too many properties when you only need a few
     * query.select(['fontName', 'fontSize', 'tracking', 'leading', 'kerning', ...]) // 20+ properties
     * // Only select what you actually need for better performance
     */
    select(properties: (string | PropertySelection)[]): StyleRangeQuery {
        this.selectedProps = [];
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            if (typeof prop === 'string') {
                this.selectedProps.push({
                    name: prop,
                    path: this.getFullPath(prop),
                    method: this.inferGetterMethod(prop)
                });
            } else {
                this.selectedProps.push(prop);
            }
        }
        return this;
    }

    /**
     * Execute query and return first matching result with extracted properties
     * @param {ActionListNavigator} list - List to query
     * @returns {any|null} Object with extracted properties, or null if no match
     * @description Executes the query against the provided list, applies all filters,
     * and extracts selected properties using appropriate getter methods. Returns actual values.
     * @example
     * // Returns object like: { fontName: 'Arial', fontSize: 24, bold: false }
     * const result = query.execute(styleList);
     * if (result) {
     *     console.log(result.fontName);  // Direct value access
     *     const { fontName, fontSize } = result;  // Destructuring
     * }
     */
    execute(list: ActionListNavigator): any {
        var found = list.firstWhere(this.createPredicateFunction());
        
        if (found.isSentinel) {
            return null;
        }
        
        return this.extractProperties(found);
    }

    /**
     * Execute query and return all matching results with extracted properties
     * @param {ActionListNavigator} list - List to query
     * @returns {any[]} Array of objects with extracted properties
     * @description Executes the query against the provided list and returns all matching
     * results with extracted properties. Use when you need multiple matches.
     * @example
     * // Returns array like: [{ fontName: 'Arial', size: 24 }, { fontName: 'Arial', size: 18 }]
     * const allResults = query.executeAll(styleList);
     * allResults.forEach(result => {
     *     console.log(result.fontName, result.fontSize);
     * });
     */
    executeAll(list: ActionListNavigator): any[] {
        var matches = list.asEnumerable().where(this.createPredicateFunction()).toArray();
        var results = [];
        
        for (var i = 0; i < matches.length; i++) {
            results.push(this.extractProperties(matches[i]));
        }
        
        return results;
    }

    /**
     * Create predicate function from criteria
     * @returns {PredicateFunction} Function that tests objects against all criteria
     * @private
     */
    private createPredicateFunction(): PredicateFunction {
        var criteria = this.criteria;
        var self = this;
        
        return function(obj: ActionDescriptorNavigator): boolean {
            for (var i = 0; i < criteria.length; i++) {
                var criterion = criteria[i];
                var actualValue = self.extractValueAtPath(obj, criterion.path);
                
                if (!self.compareValues(actualValue, criterion.operator, criterion.value)) {
                    return false;
                }
            }
            return true;
        };
    }

    /**
     * Extract properties from object using configured selections
     * @param {ActionDescriptorNavigator} obj - Object to extract from
     * @returns {any} Object with extracted properties
     * @private
     */
    private extractProperties(obj: ActionDescriptorNavigator): any {
        var result = {};
        
        for (var i = 0; i < this.selectedProps.length; i++) {
            var prop = this.selectedProps[i];
            result[prop.name] = this.extractValueAtPath(obj, prop.path, prop.method);
        }
        
        return result;
    }

    /**
     * Extract value at specific path using specified or inferred method
     * @param {ActionDescriptorNavigator} obj - Object to extract from
     * @param {string} path - Property path
     * @param {string} [method] - Getter method to use (auto-detected if not specified)
     * @returns {any} Extracted value
     * @private
     */
    private extractValueAtPath(obj: ActionDescriptorNavigator, path: string, method?: string): any {
        var navigator = this.navigateToPath(obj, path);
        var leafProperty = this.getLeafProperty(path);
        var getterMethod = method || this.inferGetterMethod(leafProperty);
        
        switch (getterMethod) {
            case 'getString':
                return navigator.getString(leafProperty);
            case 'getDouble':
                return navigator.getDouble(leafProperty);
            case 'getUnitDouble':
                return navigator.getUnitDouble(leafProperty);
            case 'getInteger':
                return navigator.getInteger(leafProperty);
            case 'getBoolean':
                return navigator.getBoolean(leafProperty);
            case 'getEnumerated':
                return navigator.getEnumerated(leafProperty);
            default:
                return null;
        }
    }

    /**
     * Navigate to the parent object of a property path
     * @param {ActionDescriptorNavigator} obj - Starting object
     * @param {string} path - Property path (e.g., 'textStyle.fontName')
     * @returns {ActionDescriptorNavigator} Navigator for parent object
     * @private
     */
    private navigateToPath(obj: ActionDescriptorNavigator, path: string): ActionDescriptorNavigator {
        var parts = path.split('.');
        var current = obj;
        
        // Navigate to parent (all parts except last)
        for (var i = 0; i < parts.length - 1; i++) {
            current = current.getObject(parts[i]);
            if (current.isSentinel) {
                return current;
            }
        }
        
        return current;
    }

    /**
     * Get the final property name from a path
     * @param {string} path - Property path (e.g., 'textStyle.fontName')
     * @returns {string} Final property name (e.g., 'fontName')
     * @private
     */
    private getLeafProperty(path: string): string {
        var parts = path.split('.');
        return parts[parts.length - 1];
    }

    /**
     * Get full path for a property, assuming textStyle context for common properties
     * @param {string} property - Property name
     * @returns {string} Full path
     * @private
     */
    private getFullPath(property: string): string {
        // Common textStyle properties don't need full path specification
        var textStyleProperties = [
            'fontName', 'fontPostScriptName', 'fontStyleName', 'fontSize', 'horizontalScale', 
            'verticalScale', 'tracking', 'autoLeading', 'leading', 'syntheticBold', 
            'syntheticItalic', 'fontCaps', 'baseline', 'underline', 'strikethrough'
        ];
        
        if (textStyleProperties.indexOf(property) >= 0) {
            return 'textStyle.' + property;
        }
        
        return property; // Return as-is for custom paths
    }

    /**
     * Automatically infer getter method from property name patterns
     * @param {string} propertyName - Property name to analyze
     * @returns {string} Appropriate getter method name
     * @private
     */
    private inferGetterMethod(propertyName: string): string {
        var lowerName = propertyName.toLowerCase();
        
        // String patterns
        if (lowerName.indexOf('name') >= 0 || 
            lowerName.indexOf('string') >= 0 || 
            lowerName.indexOf('text') >= 0 ||
            lowerName.indexOf('font') >= 0 && lowerName.indexOf('size') === -1 ||
            lowerName.indexOf('style') >= 0) {
            return 'getString';
        }
        
        // Boolean patterns  
        if (lowerName.indexOf('synthetic') >= 0 ||
            lowerName.indexOf('auto') >= 0 ||
            lowerName.indexOf('visible') >= 0 ||
            lowerName.indexOf('enabled') >= 0 ||
            lowerName.indexOf('locked') >= 0) {
            return 'getBoolean';
        }
        
        // Enumerated patterns
        if (lowerName.indexOf('mode') >= 0 ||
            lowerName.indexOf('caps') >= 0 ||
            lowerName.indexOf('alignment') >= 0 ||
            lowerName.indexOf('baseline') >= 0 ||
            lowerName.indexOf('underline') >= 0 ||
            lowerName.indexOf('strikethrough') >= 0 ||
            lowerName.indexOf('direction') >= 0) {
            return 'getEnumerated';
        }
        
        // Integer patterns
        if (lowerName.indexOf('index') >= 0 ||
            lowerName.indexOf('count') >= 0 ||
            lowerName.indexOf('from') >= 0 ||
            lowerName.indexOf('to') >= 0 ||
            (lowerName.indexOf('id') >= 0 && lowerName.indexOf('id') === lowerName.length - 2)) {
            return 'getInteger';
        }
        
        // Double patterns (default for numeric-sounding properties)
        if (lowerName.indexOf('size') >= 0 ||
            lowerName.indexOf('width') >= 0 ||
            lowerName.indexOf('height') >= 0 ||
            lowerName.indexOf('opacity') >= 0 ||
            lowerName.indexOf('tracking') >= 0 ||
            lowerName.indexOf('leading') >= 0 ||
            lowerName.indexOf('value') >= 0 ||
            lowerName.indexOf('scale') >= 0 ||
            lowerName.indexOf('angle') >= 0) {
            return 'getDouble';
        }
        
        return 'getString'; // Default fallback
    }

    /**
     * Compare values using specified operator
     * @param {any} actual - Actual value from object
     * @param {string} operator - Comparison operator
     * @param {any} expected - Expected value
     * @returns {boolean} True if comparison passes
     * @private
     */
    private compareValues(actual: any, operator: string, expected: any): boolean {
        switch (operator) {
            case '===':
            case '==':
                return valuesMatch(actual, expected);
            case '!==':
            case '!=':
                return !valuesMatch(actual, expected);
            case '>':
                return actual > expected;
            case '>=':
                return actual >= expected;
            case '<':
                return actual < expected;
            case '<=':
                return actual <= expected;
            case 'contains':
                return typeof actual === 'string' && typeof expected === 'string' &&
                       actual.toLowerCase().indexOf(expected.toLowerCase()) >= 0;
            case 'between':
                return Array.isArray(expected) && expected.length === 2 &&
                       actual >= expected[0] && actual <= expected[1];
            default:
                return valuesMatch(actual, expected);
        }
    }
}

// =============================================================================
// ActionDescriptorNavigator - Core navigation class
// =============================================================================

/**
 * Primary navigation class for ActionDescriptor objects with type-safe value extraction
 * @class
 * @description Provides fluent interface for navigating Photoshop ActionDescriptor structures
 * with comprehensive error handling via sentinel pattern
 */
export class ActionDescriptorNavigator {
    /**
     * Indicates whether this navigator represents a failed operation or missing data
     * @type {boolean}
     * @readonly
     */
    public readonly isSentinel: boolean;
    
    /**
     * The wrapped ActionDescriptor object, null if sentinel
     * @type {ActionDescriptor|null}
     * @private
     */
    private desc: ActionDescriptor | null;

    /**
     * Creates a new ActionDescriptorNavigator instance
     * @param {ActionDescriptor|null} desc - The ActionDescriptor to wrap, or null for sentinel
     * @description Internal constructor - use static factory methods instead
     * @example
     * // ❌ DON'T: Direct constructor usage
     * const nav = new ActionDescriptorNavigator(someDescriptor);
     * 
     * // ✅ DO: Use factory methods
     * const nav = ActionDescriptorNavigator.forCurrentLayer();
     */
    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    /**
     * Creates navigator for currently selected layer in Photoshop
     * @static
     * @returns {ActionDescriptorNavigator} Navigator for current layer, or sentinel if no layer selected
     * @description Gets the active/selected layer. Most common starting point for layer analysis.
     * Automatically handles ActionReference cleanup for memory safety.
     * @example
     * // ✅ GOOD: Basic usage with error checking
     * const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
     * if (!currentLayer.isSentinel) {
     *     const layerName = currentLayer.getString('name');
     *     const opacity = currentLayer.getDouble('opacity');
     * }
     * 
     * @example
     * // ✅ BETTER: Fluent chaining
     * const fontName = ActionDescriptorNavigator
     *     .forCurrentLayer()
     *     .debug('current layer')
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .getFirstObject()
     *     .getObject('textStyle')
     *     .getString('fontName');
     * 
     * @example
     * // ❌ BAD: Assuming layer exists without checking
     * const layerName = ActionDescriptorNavigator.forCurrentLayer().getString('name');
     * // Should check isSentinel if no layer might be selected
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Creates navigator for currently active document in Photoshop
     * @static
     * @returns {ActionDescriptorNavigator} Navigator for current document, or sentinel if no document open
     * @description Gets the active document. Useful for document-level analysis like resolution, 
     * color mode, layer count. Automatically handles ActionReference cleanup.
     * @example
     * // ✅ GOOD: Document properties extraction
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * const docInfo = doc.extract({
     *     width: 'getDouble',
     *     height: 'getDouble',
     *     resolution: 'getDouble',
     *     mode: 'getEnumerated'
     * });
     * 
     * @example
     * // ✅ BETTER: Conditional document analysis
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * if (!doc.isSentinel) {
     *     const layers = doc.getList('layers');
     *     const layerCount = layers.getCount();
     *     $.writeln('Document has ' + layerCount + ' layers');
     * }
     * 
     * @example
     * // ❌ BAD: Not checking for document existence
     * const width = ActionDescriptorNavigator.forCurrentDocument().getDouble('width');
     * // Should check isSentinel first if no document might be open
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Finds layer by name with case-insensitive matching and whitespace normalization
     * @static
     * @param {string} layerName - Name of layer to find (case-insensitive, whitespace trimmed)
     * @returns {ActionDescriptorNavigator} Navigator for found layer, or sentinel if not found
     * @description Searches through all layers to find one with matching name. Essential for 
     * scoring scripts when targeting specific layers. Performance: O(n) where n = layer count.
     * @example
     * // ✅ GOOD: Basic layer finding with validation
     * const headerLayer = ActionDescriptorNavigator.forLayerByName("Header");
     * if (!headerLayer.isSentinel) {
     *     const isVisible = headerLayer.getBoolean('visible');
     *     const bounds = headerLayer.getBounds();
     * }
     * 
     * @example
     * // ✅ BETTER: Case insensitive with whitespace handling
     * const titleLayer = ActionDescriptorNavigator.forLayerByName("  TITLE LAYER  ");
     * // Automatically normalizes to find "title layer"
     * 
     * @example
     * // ✅ BEST: Complete text analysis workflow with query builder
     * const fontAnalysis = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .debug('found header layer')
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .select(['fontName', 'fontSize', 'syntheticBold'])
     *     );
     * 
     * @example
     * // ❌ BAD: Not handling case where layer doesn't exist
     * const fontName = ActionDescriptorNavigator
     *     .forLayerByName("NonExistentLayer")
     *     .getObject('textKey')  // Creates sentinel chain
     *     .getString('something'); // Returns "" (sentinel)
     * // Better to check isSentinel or let sentinel chain handle gracefully
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var searchName = layerName.toLowerCase().replace(/^\s+|\s+$/g, '');
        var layerCount = ActionDescriptorNavigator.getLayerCount();

        if (layerCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (var i = 1; i <= layerCount; i++) {
            var layer = ActionDescriptorNavigator.forLayerByIndex(i);
            var currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().replace(/^\s+|\s+$/g, '') === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Internal method to get layer by 1-based index
     * @static
     * @private
     * @param {number} index - 1-based layer index (Photoshop convention)
     * @returns {ActionDescriptorNavigator} Navigator for layer at index, or sentinel if invalid
     * @description Used internally by forLayerByName. Not recommended for direct use due to 
     * volatile indices that change when layers are added/removed/reordered.
     */
    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var ref = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Creates a sentinel navigator representing failed/missing data
     * @static
     * @returns {ActionDescriptorNavigator} Sentinel navigator with isSentinel = true
     * @description Internal factory for creating sentinel instances. Sentinels prevent 
     * null errors and enable graceful error handling throughout navigation chains.
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Internal method to get total layer count in current document
     * @static
     * @private
     * @returns {number} Number of layers, or -1 if unavailable
     * @description Used internally by forLayerByName for iteration bounds.
     * Handles ActionReference cleanup properly.
     */
    private static getLayerCount(): number {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e) {
            return -1;
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Navigate to nested ActionDescriptor object
     * @param {string} key - Property name to navigate to (e.g., 'textKey', 'bounds', 'color')
     * @returns {ActionDescriptorNavigator} Navigator for nested object, or sentinel if key missing/wrong type
     * @description Core navigation method for accessing nested objects. Forms the backbone of 
     * fluent navigation. Follows ActionDescriptor DOM structure exactly.
     * @example
     * // ✅ GOOD: Basic object navigation
     * const textObj = layer.getObject('textKey');
     * const boundsObj = layer.getObject('bounds');
     * const colorObj = textStyle.getObject('color');
     * 
     * @example
     * // ✅ BETTER: Chained navigation following DOM structure
     * const colorObj = layer
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .getFirstObject()
     *     .getObject('textStyle')
     *     .getObject('color');
     * 
     * @example
     * // ✅ BEST: With debug for troubleshooting navigation path
     * const warpSettings = layer
     *     .getObject('textKey')
     *     .debug('got textKey object')
     *     .getObject('warp')
     *     .debug('got warp object')
     *     .extract({
     *         style: 'getEnumerated',
     *         value: 'getDouble',
     *         perspective: 'getDouble'
     *     });
     * 
     * @example
     * // ❌ BAD: Wrong navigation path (doesn't follow DOM structure)
     * const fontSize = layer.getObject('textKey').getObject('textStyle').getDouble('fontSize');
     * // textStyle is inside textStyleRange list, not direct child of textKey
     * 
     * @example
     * // ❌ BAD: Assuming object exists without validation
     * const color = layer.getObject('textKey').getObject('color').getDouble('red');
     * // Color is nested deeper in textStyle objects, this returns sentinel
     */
    getObject(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            var nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to ActionList for enumeration and LINQ operations
     * @param {string} key - List property name (e.g., 'textStyleRange', 'paragraphStyleRange', 'layers')
     * @returns {ActionListNavigator} Navigator for list with enumeration and LINQ capabilities
     * @description Accesses list properties for iteration and LINQ-style operations. 
     * Returns ActionListNavigator with semantic object access methods.
     * @example
     * // ✅ GOOD: Basic list access with count checking
     * const styleList = textObj.getList('textStyleRange');
     * const count = styleList.getCount();
     * if (count > 0) {
     *     const firstStyle = styleList.getFirstObject();
     * }
     * 
     * @example
     * // ✅ BETTER: LINQ operations on lists
     * const allFonts = textObj
     *     .getList('textStyleRange')
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Query builder for clean value extraction
     * const styleData = textObj
     *     .getList('textStyleRange')
     *     .debug('got style range list')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .where('fontSize', '>', 16)
     *         .select(['fontName', 'fontSize', 'syntheticBold'])
     *     );
     * 
     * @example
     * // ❌ BAD: Manual iteration without bounds checking
     * const styleList = textObj.getList('textStyleRange');
     * for (var i = 0; i <= styleList.getCount(); i++) {  // Off-by-one error
     *     const style = styleList.getObject(i);
     * }
     * 
     * @example
     * // ❌ BAD: Using index when semantic methods available
     * const firstStyle = textObj.getList('textStyleRange').getObject(0);
     * // Use getFirstObject() instead for semantic clarity
     */
    getList(key: string): ActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            var list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e) {
            return ActionListNavigator.createSentinel();
        }
    }

    /**
     * Extract string values with automatic sentinel handling
     * @param {string} key - Property name to extract (e.g., 'name', 'fontName', 'fontPostScriptName')
     * @returns {string} String value, or empty string ("") if key missing/wrong type
     * @description Primary method for extracting text properties. Never throws exceptions.
     * Includes error logging via $.writeln() for debugging.
     * @example
     * // ✅ GOOD: Basic string extraction with validation
     * const layerName = layer.getString('name');
     * if (layerName !== '') {
     *     $.writeln('Layer name: ' + layerName);
     * }
     * 
     * @example
     * // ✅ BETTER: Used in projections (common pattern)
     * const fontData = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             name: style.getString('fontName'),
     *             postScript: style.getString('fontPostScriptName'),
     *             family: style.getString('fontStyleName')
     *         };
     *     })
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Query builder eliminates manual getString calls
     * const fonts = styleList
     *     .query(q => q
     *         .where('fontName', '!==', '')
     *         .select(['fontName', 'fontPostScriptName', 'fontStyleName'])
     *     );
     * // Returns: { fontName: 'Arial', fontPostScriptName: 'ArialMT', fontStyleName: 'Regular' }
     * 
     * @example
     * // ❌ BAD: Unnecessary null checking (sentinels prevent null)
     * const name = layer.getString('name');
     * if (name !== null && name !== undefined) {  // Not needed with sentinels
     *     $.writeln(name);
     * }
     * 
     * @example
     * // ❌ BAD: Exception handling (sentinels prevent exceptions)
     * try {
     *     const name = layer.getString('name');
     * } catch (e) {  // Never needed with sentinel pattern
     *     $.writeln('Error getting name');
     * }
     */
    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.string;
        }

        try {
            return this.desc.getString(typeID);
        } catch (e) {
            $.writeln('ERROR: getString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.string;
        }
    }

    /**
     * Extract numeric values (pixels, percentages, angles, etc.)
     * @param {string} key - Property name to extract (e.g., 'fontSize', 'opacity', 'tracking')
     * @returns {number} Numeric value, or -1 if key missing/wrong type
     * @description Primary method for extracting numeric properties. Never throws exceptions.
     * Handles both double and unit double types from ActionDescriptor.
     * @example
     * // ✅ GOOD: Basic numeric extraction with validation
     * const opacity = layer.getDouble('opacity');
     * if (opacity !== -1) {
     *     const opacityPercent = (opacity / 255) * 100;
     *     $.writeln('Opacity: ' + Math.round(opacityPercent) + '%');
     * }
     * 
     * @example
     * // ✅ BETTER: Calculations with sentinel awareness
     * const bounds = layer.getBounds();
     * if (bounds.width !== -1 && bounds.height !== -1) {
     *     const aspectRatio = bounds.width / bounds.height;
     *     const area = bounds.width * bounds.height;
     * }
     * 
     * @example
     * // ✅ BEST: Query builder for clean numeric extraction
     * const measurements = styleList
     *     .query(q => q
     *         .where('fontSize', '>', 0)
     *         .select(['fontSize', 'tracking', 'leading', 'horizontalScale'])
     *     );
     * // Returns: { fontSize: 24, tracking: 0, leading: 28.8, horizontalScale: 100 }
     * 
     * @example
     * // ❌ BAD: Type coercion assumptions
     * const opacity = parseFloat(layer.getDouble('opacity'));  // Already a number
     * 
     * @example
     * // ❌ BAD: Division without checking sentinels
     * const aspectRatio = bounds.width / bounds.height;  // Could be -1 / -1 = 1 (wrong)
     * // Should check bounds.width !== -1 && bounds.height !== -1 first
     */
    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e) {
            $.writeln('ERROR: getDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    /**
     * Extract unit double values (alias for getDouble for XML consistency)
     * @param {string} key - Property name to extract (e.g., 'sizeKey', 'left', 'top')
     * @returns {number} Numeric value, or -1 if key missing/wrong type
     * @description Identical to getDouble() but kept for XML element name consistency.
     * Use when ActionDescriptor XML dumps show UnitDouble elements.
     * @example
     * // ✅ GOOD: When XML shows UnitDouble elements
     * const fontSize = textStyle.getUnitDouble('sizeKey');  // XML shows <UnitDouble symname="SizeKey"...>
     * const leftPos = boundsObj.getUnitDouble('left');      // XML shows <UnitDouble symname="Left"...>
     * 
     * @example
     * // ✅ BETTER: Consistent with XML structure in batch extraction
     * const bounds = boundsObj.extract({
     *     left: 'getUnitDouble',    // XML: <UnitDouble symname="Left"...>
     *     top: 'getUnitDouble',     // XML: <UnitDouble symname="Top"...>
     *     right: 'getUnitDouble',   // XML: <UnitDouble symname="Right"...>
     *     bottom: 'getUnitDouble'   // XML: <UnitDouble symname="Bottom"...>
     * });
     * 
     * @example
     * // ❌ BAD: Using when XML shows Double elements
     * const tracking = textStyle.getUnitDouble('tracking');  // Should use getDouble()
     */
    getUnitDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e) {
            $.writeln('ERROR: getUnitDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    /**
     * Extract integer values (layer IDs, counts, indices, character ranges)
     * @param {string} key - Property name to extract (e.g., 'layerID', 'itemIndex', 'from', 'to')
     * @returns {number} Integer value, or -1 if key missing/wrong type
     * @description Method for extracting whole number properties like layer IDs, item indices, 
     * character ranges. Never throws exceptions.
     * @example
     * // ✅ GOOD: Integer-specific properties
     * const layerID = layer.getInteger('layerID');
     * const itemIndex = layer.getInteger('itemIndex');
     * const rangeFrom = styleRange.getInteger('from');
     * const rangeTo = styleRange.getInteger('to');
     * 
     * @example
     * // ✅ BETTER: Text range analysis with query builder
     * const ranges = styleList
     *     .query(q => q
     *         .where('from', '>=', 0)
     *         .where('to', '>', 0)
     *         .select(['from', 'to'])
     *     );
     * if (ranges) {
     *     const length = ranges.to - ranges.from;
     *     $.writeln('Text range length: ' + length);
     * }
     * 
     * @example
     * // ✅ BEST: Layer identification and sorting
     * const layerInfo = documentObj
     *     .getList('layers')
     *     .asEnumerable()
     *     .select(layer => ({
     *         id: layer.getInteger('layerID'),
     *         index: layer.getInteger('itemIndex'),
     *         name: layer.getString('name')
     *     }))
     *     .where(info => info.id !== -1)  // Filter out invalid layers
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Using for floating point values
     * const fontSize = textStyle.getInteger('fontSize');  // Should use getDouble()
     * // fontSize could be 24.5, but getInteger() might truncate to 24
     * 
     * @example
     * // ❌ BAD: Not validating range values
     * const length = styleRange.getInteger('to') - styleRange.getInteger('from');
     * // Should check that both values are not -1 before calculation
     */
    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getInteger(typeID);
        } catch (e) {
            $.writeln('ERROR: getInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    /**
     * Extract boolean flags (visibility, synthetic styles, feature flags)
     * @param {string} key - Property name to extract (e.g., 'visible', 'syntheticBold', 'syntheticItalic')
     * @returns {boolean} Boolean value, or false if key missing/wrong type
     * @description Method for extracting true/false properties like layer visibility, text styles, 
     * feature flags. Never throws exceptions. Note: false is both sentinel and valid value.
     * @example
     * // ✅ GOOD: Boolean properties with logical usage
     * const isVisible = layer.getBoolean('visible');
     * const isBold = textStyle.getBoolean('syntheticBold');
     * const isItalic = textStyle.getBoolean('syntheticItalic');
     * const hasAutoLeading = textStyle.getBoolean('autoLeading');
     * 
     * @example
     * // ✅ BETTER: Query builder for boolean filtering and extraction
     * const boldStyles = styleList
     *     .query(q => q
     *         .where('syntheticBold', true)
     *         .select(['fontName', 'fontSize', 'syntheticBold', 'syntheticItalic'])
     *     );
     * // Returns: { fontName: 'Arial', fontSize: 24, syntheticBold: true, syntheticItalic: false }
     * 
     * @example
     * // ✅ BEST: Style feature analysis with multiple boolean checks
     * const styleFeatures = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             hasSyntheticBold: style.getBoolean('syntheticBold'),
     *             hasSyntheticItalic: style.getBoolean('syntheticItalic'),
     *             hasAutoLeading: style.getBoolean('autoLeading'),
     *             hasLigatures: style.getBoolean('ligature')
     *         };
     *     })
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: String comparison for boolean
     * const isVisible = layer.getString('visible') === 'true';  // Use getBoolean()
     * 
     * @example
     * // ❌ BAD: Assuming false means sentinel (false is also a valid value)
     * const isBold = textStyle.getBoolean('syntheticBold');
     * if (isBold === false) {
     *     // This could mean "not bold" OR "property doesn't exist"
     *     // Use hasKey() first if you need to distinguish
     * }
     */
    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.boolean;
        }

        try {
            return this.desc.getBoolean(typeID);
        } catch (e) {
            $.writeln('ERROR: getBoolean("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.boolean;
        }
    }

    /**
     * Extract enumerated values as human-readable strings (improved design)
     * @param {string} key - Property name to extract (e.g., 'mode', 'fontCaps', 'alignment')
     * @returns {string} Enumerated string value, or empty string ("") if key missing/wrong type
     * @description Method for extracting enumerated properties like blend modes, font caps, 
     * alignments. Returns string representation of enum values, not numeric IDs. This is an 
     * improvement over the old getEnumerated() that returned numbers.
     * @example
     * // ✅ GOOD: Enumerated properties for analysis (returns human-readable strings)
     * const blendMode = layer.getEnumerated('mode');        // "normal", "multiply", etc.
     * const fontCaps = textStyle.getEnumerated('fontCaps'); // "normal", "smallCaps", etc.
     * const alignment = paragraphStyle.getEnumerated('alignment'); // "left", "center", "right"
     * 
     * @example
     * // ✅ BETTER: Query builder for enumerated filtering
     * const smallCapsStyles = styleList
     *     .query(q => q
     *         .where('fontCaps', 'smallCaps')
     *         .select(['fontName', 'fontSize', 'fontCaps'])
     *     );
     * // Returns: { fontName: 'Arial', fontSize: 12, fontCaps: 'smallCaps' }
     * 
     * @example
     * // ✅ BEST: Complex enumerated analysis with categorization
     * const styleVariations = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             caps: style.getEnumerated('fontCaps'),
     *             baseline: style.getEnumerated('baseline'),
     *             underline: style.getEnumerated('underline'),
     *             strikethrough: style.getEnumerated('strikethrough')
     *         };
     *     })
     *     .where(data => data.caps !== '' || data.underline !== 'underlineOff')
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Case-sensitive comparison (enumerated values are case-sensitive)
     * const isSmallCaps = textStyle.getEnumerated('fontCaps') === 'SmallCaps';  // Wrong case
     * // Correct: === 'smallCaps' (lowercase)
     * 
     * @example
     * // ❌ BAD: Expecting numeric values (old behavior)
     * const blendMode = layer.getInteger('mode');  // Should use getEnumerated()
     * // getEnumerated() returns human-readable string, not numeric ID
     */
    getEnumerated(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.enumerated;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.enumerated;
        }

        try {
            var enumValue = this.desc.getEnumerationValue(typeID);
            var enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.enumerated;
        } catch (e) {
            $.writeln('ERROR: getEnumerated("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.enumerated;
        }
    }

    /**
     * Check if property exists for conditional logic and type identification
     * @param {string} key - Property name to check (e.g., 'textKey', 'layerEffects')
     * @returns {boolean} True if property exists, false otherwise
     * @description Utility method for checking property existence before navigation. 
     * Useful for type identification and conditional logic. Does not indicate type or value.
     * @example
     * // ✅ GOOD: Conditional navigation based on layer type
     * if (layer.hasKey('textKey')) {
     *     const textAnalysis = layer.getObject('textKey').getList('textStyleRange');
     * }
     * if (layer.hasKey('layerEffects')) {
     *     const effects = layer.getList('layerEffects');
     * }
     * 
     * @example
     * // ✅ BETTER: Layer type identification
     * const layerType = {
     *     isText: layer.hasKey('textKey'),
     *     hasEffects: layer.hasKey('layerEffects'),
     *     hasVector: layer.hasKey('vectorMask'),
     *     isAdjustment: layer.hasKey('adjustment'),
     *     isBackground: layer.hasKey('background')
     * };
     * 
     * @example
     * // ✅ BEST: Complex conditional analysis in LINQ
     * const textLayers = documentObj
     *     .getList('layers')
     *     .asEnumerable()
     *     .where(layer => layer.hasKey('textKey'))
     *     .select(layer => ({
     *         name: layer.getString('name'),
     *         hasWarp: layer.getObject('textKey').hasKey('warp'),
     *         styleCount: layer.getObject('textKey').getList('textStyleRange').getCount()
     *     }))
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Using for null checking (not needed with sentinels)
     * if (layer.hasKey('name')) {
     *     const name = layer.getString('name');  // getString() already handles missing keys safely
     * }
     * 
     * @example
     * // ❌ BAD: Using to avoid exceptions (sentinels prevent exceptions)
     * if (layer.hasKey('textKey')) {
     *     try {
     *         const textObj = layer.getObject('textKey');
     *     } catch (e) {  // Never needed with sentinel pattern
     *         // ...
     *     }
     * }
     */
    hasKey(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return false;
        }

        try {
            return this.desc.hasKey(stringIDToTypeID(key));
        } catch (e) {
            return false;
        }
    }

    /**
     * Extract and calculate layer bounds with computed dimensions
     * @returns {BoundsObject} Object with left, top, right, bottom, width, height properties, or all -1 if bounds unavailable
     * @description Extracts layer bounds object and calculates width/height. Essential for layout 
     * analysis and positioning validation in scoring scripts. Handles coordinate calculations automatically.
     * @example
     * // ✅ GOOD: Basic bounds usage with validation
     * const bounds = layer.getBounds();
     * if (bounds.width !== -1) {
     *     $.writeln('Size: ' + bounds.width + ' x ' + bounds.height);
     *     $.writeln('Position: (' + bounds.left + ', ' + bounds.top + ')');
     * }
     * 
     * @example
     * // ✅ BETTER: Bounds analysis with calculations
     * const bounds = layer.getBounds();
     * if (bounds.width > 0 && bounds.height > 0) {
     *     const analysis = {
     *         dimensions: bounds.width + 'x' + bounds.height,
     *         area: bounds.width * bounds.height,
     *         aspectRatio: bounds.width / bounds.height,
     *         center: {
     *             x: bounds.left + (bounds.width / 2),
     *             y: bounds.top + (bounds.height / 2)
     *         }
     *     };
     * }
     * 
     * @example
     * // ✅ BEST: Multi-layer bounds analysis for scoring
     * const layerPositions = documentObj
     *     .getList('layers')
     *     .asEnumerable()
     *     .select(layer => {
     *         const bounds = layer.getBounds();
     *         return {
     *             name: layer.getString('name'),
     *             bounds: bounds,
     *             isValid: bounds.width > 0 && bounds.height > 0,
     *             center: {
     *                 x: bounds.left + (bounds.width / 2),
     *                 y: bounds.top + (bounds.height / 2)
     *             }
     *         };
     *     })
     *     .where(data => data.isValid)
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Manual bounds calculation
     * const left = layer.getObject('bounds').getDouble('left');
     * const right = layer.getObject('bounds').getDouble('right');
     * const width = right - left;  // Use getBounds() instead for calculated dimensions
     * 
     * @example
     * // ❌ BAD: Not checking for valid bounds before calculations
     * const bounds = layer.getBounds();
     * const area = bounds.width * bounds.height;  // Could be -1 * -1 = 1 (wrong)
     * // Should check bounds.width !== -1 && bounds.height !== -1 first
     */
    getBounds(): BoundsObject {
        if (this.isSentinel || !this.desc) {
            return {
                left: SENTINELS.double,
                top: SENTINELS.double,
                right: SENTINELS.double,
                bottom: SENTINELS.double,
                width: SENTINELS.double,
                height: SENTINELS.double
            };
        }

        try {
            var boundsTypeID = stringIDToTypeID('bounds');
            if (!this.desc.hasKey(boundsTypeID)) {
                return {
                    left: SENTINELS.double,
                    top: SENTINELS.double,
                    right: SENTINELS.double,
                    bottom: SENTINELS.double,
                    width: SENTINELS.double,
                    height: SENTINELS.double
                };
            }

            var boundsDesc = this.desc.getObjectValue(boundsTypeID);
            var left = boundsDesc.getDouble(stringIDToTypeID('left'));
            var top = boundsDesc.getDouble(stringIDToTypeID('top'));
            var right = boundsDesc.getDouble(stringIDToTypeID('right'));
            var bottom = boundsDesc.getDouble(stringIDToTypeID('bottom'));

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };
        } catch (e) {
            return {
                left: SENTINELS.double,
                top: SENTINELS.double,
                right: SENTINELS.double,
                bottom: SENTINELS.double,
                width: SENTINELS.double,
                height: SENTINELS.double
            };
        }
    }

    /**
     * Batch extract multiple properties using method name mapping
     * @param {PropertyExtractionMap} propertyMap - Object mapping property names to getter method names
     * @returns {Record<string, any>} Object with extracted properties, empty object if sentinel
     * @description Convenience method for extracting multiple properties at once using a mapping object. 
     * More efficient than individual getter calls when extracting many properties from same object.
     * Consider using query builder for more advanced extraction needs.
     * @example
     * // ✅ GOOD: Basic batch extraction for layer properties
     * const layerData = layer.extract({
     *     name: 'getString',
     *     opacity: 'getDouble',
     *     visible: 'getBoolean',
     *     mode: 'getEnumerated'
     * });
     * 
     * @example
     * // ✅ BETTER: Font style extraction with all properties
     * const fontData = textStyle.extract({
     *     fontName: 'getString',
     *     fontSize: 'getDouble',
     *     syntheticBold: 'getBoolean',
     *     syntheticItalic: 'getBoolean',
     *     fontCaps: 'getEnumerated',
     *     tracking: 'getDouble',
     *     leading: 'getDouble'
     * });
     * 
     * @example
     * // ✅ BEST: Color extraction with known RGB structure
     * const colorData = colorObj.extract({
     *     red: 'getDouble',
     *     green: 'getDouble',
     *     blue: 'getDouble'
     * });
     * const rgbString = 'rgb(' + colorData.red + ', ' + colorData.green + ', ' + colorData.blue + ')';
     * 
     * @example
     * // ❌ BAD: Wrong method for property type
     * const wrong = textStyle.extract({
     *     fontSize: 'getString',  // Should be 'getDouble'
     *     fontName: 'getDouble'   // Should be 'getString'
     * });
     * 
     * @example
     * // ❌ BAD: Using for single property (inefficient)
     * const name = layer.extract({ name: 'getString' }).name;
     * // Just use layer.getString('name') directly
     */
    extract(propertyMap: PropertyExtractionMap): Record<string, any> {
        if (this.isSentinel) {
            return {};
        }

        var result = {};
        var keys = Object.keys(propertyMap);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var methodName = propertyMap[key];

            try {
                switch (methodName) {
                    case 'getString':
                        result[key] = this.getString(key);
                        break;
                    case 'getDouble':
                        result[key] = this.getDouble(key);
                        break;
                    case 'getUnitDouble':
                        result[key] = this.getUnitDouble(key);
                        break;
                    case 'getInteger':
                        result[key] = this.getInteger(key);
                        break;
                    case 'getBoolean':
                        result[key] = this.getBoolean(key);
                        break;
                    case 'getEnumerated':
                        result[key] = this.getEnumerated(key);
                        break;
                    default:
                        result[key] = null;
                        break;
                }
            } catch (e) {
                result[key] = null;
            }
        }

        return result;
    }

    /**
     * Single object transformation for projections and data extraction
     * @template T
     * @param {SelectorFunction<T>} selector - Function to transform this navigator
     * @returns {T|null} Transformed result, or null if navigator is sentinel
     * @description Transform this navigator using a selector function. Useful for single-object 
     * projections in complex data extraction. Consider using query builder for list operations.
     * @example
     * // ✅ GOOD: Single object transformation
     * const colorData = colorObj.select(color => ({
     *     red: color.getDouble('red'),
     *     green: color.getDouble('green'),
     *     blue: color.getDouble('blue'),
     *     hex: '#' + Math.round(color.getDouble('red')).toString(16).padStart(2, '0') +
     *               Math.round(color.getDouble('green')).toString(16).padStart(2, '0') +
     *               Math.round(color.getDouble('blue')).toString(16).padStart(2, '0')
     * }));
     * 
     * @example
     * // ✅ BETTER: Complex object analysis with calculations
     * const layerAnalysis = layer.select(layer => {
     *     const bounds = layer.getBounds();
     *     const hasText = layer.hasKey('textKey');
     *     return {
     *         name: layer.getString('name'),
     *         type: hasText ? 'text' : 'other',
     *         dimensions: {
     *             width: bounds.width,
     *             height: bounds.height,
     *             area: bounds.width * bounds.height
     *         },
     *         properties: {
     *             opacity: layer.getDouble('opacity'),
     *             visible: layer.getBoolean('visible'),
     *             mode: layer.getEnumerated('mode')
     *         }
     *     };
     * });
     * 
     * @example
     * // ✅ BEST: Conditional data extraction based on layer type
     * const layerData = layer.select(layer => {
     *     const base = {
     *         name: layer.getString('name'),
     *         type: 'unknown'
     *     };
     *     
     *     if (layer.hasKey('textKey')) {
     *         base.type = 'text';
     *         base.textInfo = {
     *             styleCount: layer.getObject('textKey').getList('textStyleRange').getCount(),
     *             hasWarp: layer.getObject('textKey').hasKey('warp')
     *         };
     *     } else if (layer.hasKey('layerEffects')) {
     *         base.type = 'styled';
     *         base.effectCount = layer.getList('layerEffects').getCount();
     *     }
     *     
     *     return base;
     * });
     * 
     * @example
     * // ❌ BAD: Not handling sentinel case in selector
     * const data = layer.select(layer => {
     *     return layer.getString('name').toUpperCase();  // Could fail if getString returns ""
     * });
     * // Better to check for sentinel values in selector function
     * 
     * @example
     * // ❌ BAD: Using for simple property extraction (inefficient)
     * const name = layer.select(layer => layer.getString('name'));
     * // Just use layer.getString('name') directly
     */
    select<T>(selector: SelectorFunction<T>): T | null {
        if (this.isSentinel) {
            return null;
        }

        try {
            return selector(this);
        } catch (e) {
            return null;
        }
    }

    /**
     * Add debug output anywhere in fluent chains without breaking flow
     * @param {string} label - Descriptive label for debug output
     * @returns {ActionDescriptorNavigator} This navigator (for chaining)
     * @description Essential debugging method that can be inserted anywhere in fluent chains. 
     * Outputs to ExtendScript console via $.writeln(). Does not affect chain execution.
     * @example
     * // ✅ GOOD: Simple debug at key points
     * const result = layer
     *     .debug('layer loaded')
     *     .getObject('textKey')
     *     .debug('text object accessed')
     *     .getList('textStyleRange');
     * 
     * @example
     * // ✅ BETTER: Pipeline debugging for troubleshooting
     * const fonts = layer
     *     .debug('starting with layer')
     *     .getObject('textKey')
     *     .debug('got text object')
     *     .getList('textStyleRange')
     *     .debug('got style list')
     *     .asEnumerable()
     *     .debug('created enumerable')
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .debug('filtered for Arial')
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Strategic debugging at validation points
     * const analysis = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .debug('found header layer - ' + (!layer.isSentinel ? 'SUCCESS' : 'FAILED'))
     *     .getObject('textKey')
     *     .debug('extracted text data')
     *     .getList('textStyleRange')
     *     .debug('got style ranges')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .select(['fontName', 'fontSize'])
     *     );
     * 
     * @example
     * // ❌ BAD: Non-descriptive labels
     * const result = layer
     *     .debug('a')
     *     .getObject('textKey')
     *     .debug('b');  // Labels should be descriptive
     * 
     * @example
     * // ❌ BAD: Overuse in production code
     * const result = layer
     *     .debug('step1').getObject('textKey')
     *     .debug('step2').getList('textStyleRange')
     *     .debug('step3').getFirstObject()
     *     .debug('step4').getObject('textStyle');
     * // Remove debug calls in production, use only for development/troubleshooting
     */
    debug(label: string): ActionDescriptorNavigator {
        try {
            $.writeln(label + ': ' + (this.isSentinel ? 'SENTINEL (failed)' : 'OK'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// ActionListNavigator - List navigation with semantic object access and query builder
// =============================================================================

/**
 * Navigator class for ActionList objects with LINQ-style operations, semantic object access, and advanced query builder
 * @class
 * @description Provides enumeration, semantic object access, and advanced query capabilities for ActionList collections.
 * Eliminates need for manual index management in user code and provides SQL-like query functionality.
 */
export class ActionListNavigator {
    /**
     * Indicates whether this navigator represents a failed operation or missing list
     * @type {boolean}
     * @readonly
     */
    public readonly isSentinel: boolean;
    
    /**
     * The wrapped ActionList object, null if sentinel
     * @type {ActionList|null}
     * @private
     */
    private list: ActionList | null;

    /**
     * Creates a new ActionListNavigator instance
     * @param {ActionList|null} list - The ActionList to wrap, or null for sentinel
     * @description Internal constructor - use getList() method from ActionDescriptorNavigator
     */
    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    /**
     * Creates a sentinel navigator representing failed list access
     * @static
     * @returns {ActionListNavigator} Sentinel navigator with isSentinel = true
     * @description Internal factory for creating sentinel instances
     */
    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get the number of items in the list
     * @returns {number} Item count, or -1 if list unavailable
     * @description Returns count of objects in the ActionList. Essential for bounds checking
     * and iteration planning.
     * @example
     * // ✅ GOOD: Count checking before processing
     * const styleList = textObj.getList('textStyleRange');
     * const count = styleList.getCount();
     * if (count > 0) {
     *     $.writeln('Found ' + count + ' text style ranges');
     * }
     * 
     * @example
     * // ✅ BETTER: Using count for conditional logic
     * const styleList = textObj.getList('textStyleRange');
     * if (styleList.getCount() === 1) {
     *     const singleStyle = styleList.getSingleObject();
     * } else if (styleList.getCount() > 1) {
     *     const multipleStyles = styleList.asEnumerable().toArray();
     * }
     * 
     * @example
     * // ❌ BAD: Not checking count before access
     * const style = styleList.getObject(0);  // Could fail if list is empty
     * // Use getCount() > 0 check or semantic methods like getFirstObject()
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch (e) {
            return -1;
        }
    }

    /**
     * Get object at specific index (zero-based)
     * @param {number} index - Zero-based index of object to retrieve
     * @returns {ActionDescriptorNavigator} Navigator for object at index, or sentinel if invalid
     * @description Direct index access to list items. Consider using semantic methods 
     * (getFirstObject, getSingleObject) instead for better code clarity.
     * @example
     * // ✅ ACCEPTABLE: When index is calculated/dynamic
     * const middleIndex = Math.floor(styleList.getCount() / 2);
     * const middleStyle = styleList.getObject(middleIndex);
     * 
     * @example
     * // ✅ BETTER: Use semantic methods instead
     * const firstStyle = styleList.getFirstObject();  // Instead of getObject(0)
     * const singleStyle = styleList.getSingleObject(); // When expecting exactly one
     * 
     * @example
     * // ❌ BAD: Hard-coded indices
     * const firstStyle = styleList.getObject(0);   // Use getFirstObject()
     * const secondStyle = styleList.getObject(1);  // Use LINQ or semantic methods
     */
    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            var obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get the first object in the list semantically (no index needed)
     * @returns {ActionDescriptorNavigator} Navigator for first object, or sentinel if list empty
     * @description Semantic method to get first object without using index 0. 
     * Most common pattern for accessing list items when you want any/first item.
     * @example
     * // ✅ GOOD: Get first style range from text
     * const firstStyle = textObj
     *     .getList('textStyleRange')
     *     .getFirstObject()
     *     .getObject('textStyle');
     * 
     * @example
     * // ✅ BETTER: Combined with validation
     * const styleList = textObj.getList('textStyleRange');
     * if (styleList.getCount() > 0) {
     *     const firstStyle = styleList.getFirstObject();
     *     const fontName = firstStyle.getObject('textStyle').getString('fontName');
     * }
     * 
     * @example
     * // ✅ BEST: Fluent chaining pattern
     * const fontName = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .getFirstObject()
     *     .getObject('textStyle')
     *     .getString('fontName');
     * 
     * @example
     * // ❌ BAD: Using index instead of semantic method
     * const firstStyle = styleList.getObject(0);  // Use getFirstObject()
     */
    getFirstObject(): ActionDescriptorNavigator {
        if (this.isSentinel || this.getCount() <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }
        return this.getObject(0);
    }

    /**
     * Get single object with validation that exactly one exists
     * @returns {ActionDescriptorNavigator} Navigator for single object, or sentinel with warning if not exactly one
     * @description Semantic method that validates exactly one object exists. Logs warnings
     * if zero or multiple objects found. Use when business logic expects exactly one item.
     * @example
     * // ✅ GOOD: When expecting single style range (simple text)
     * const singleStyle = textObj
     *     .getList('textStyleRange')
     *     .getSingleObject()
     *     .getObject('textStyle');
     * 
     * @example
     * // ✅ BETTER: Business rule validation
     * const titleLayer = ActionDescriptorNavigator.forLayerByName("Title");
     * const styleList = titleLayer.getObject('textKey').getList('textStyleRange');
     * const singleStyle = styleList.getSingleObject();  // Warns if multiple styles found
     * if (!singleStyle.isSentinel) {
     *     const fontSize = singleStyle.getObject('textStyle').getDouble('fontSize');
     * }
     * 
     * @example
     * // ✅ BEST: Scoring script validation pattern
     * const requiredFontSize = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .getSingleObject()  // Validates single style requirement
     *     .getObject('textStyle')
     *     .getDouble('fontSize');
     * 
     * @example
     * // ❌ BAD: Using when multiple objects are expected/acceptable
     * const styles = mixedTextLayer.getObject('textKey').getList('textStyleRange');
     * const style = styles.getSingleObject();  // Will warn about multiple styles
     * // Use getFirstObject() or LINQ methods instead
     */
    getSingleObject(): ActionDescriptorNavigator {
        if (this.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }
        
        var count = this.getCount();
        if (count === 0) {
            $.writeln('WARNING: getSingleObject() - No objects found in list');
            return ActionDescriptorNavigator.createSentinel();
        }
        if (count > 1) {
            $.writeln('WARNING: getSingleObject() - Multiple objects found (' + count + '), expected exactly one');
            return ActionDescriptorNavigator.createSentinel();
        }
        return this.getObject(0);
    }

    /**
     * Get first object matching predicate function (supports multiple conditions)
     * @param {PredicateFunction} predicate - Function that tests each object
     * @returns {ActionDescriptorNavigator} Navigator for first matching object, or sentinel if none found
     * @description Finds first object matching complex criteria. Supports multiple conditions
     * in predicate function. Early termination for performance.
     * @example
     * // ✅ GOOD: Find specific font style
     * const arialStyle = textObj
     *     .getList('textStyleRange')
     *     .firstWhere(obj => {
     *         const style = obj.getObject('textStyle');
     *         return style.getString('fontName') === 'Arial';
     *     })
     *     .getObject('textStyle');
     * 
     * @example
     * // ✅ BETTER: Multiple conditions (expected primary use case)
     * const specificStyle = textObj
     *     .getList('textStyleRange')
     *     .firstWhere(obj => {
     *         const style = obj.getObject('textStyle');
     *         return style.getString('fontName') === 'Arial' && 
     *                style.getDouble('fontSize') > 20 &&
     *                style.getBoolean('syntheticBold') === false;
     *     });
     * 
     * @example
     * // ✅ BEST: Complex business logic with range validation
     * const validStyle = textObj
     *     .getList('textStyleRange')
     *     .firstWhere(obj => {
     *         const style = obj.getObject('textStyle');
     *         const from = obj.getInteger('from');
     *         const to = obj.getInteger('to');
     *         const length = to - from;
     *         
     *         return style.getString('fontName') === 'Arial' &&
     *                style.getDouble('fontSize') >= 16 &&
     *                style.getDouble('fontSize') <= 72 &&
     *                length > 0;  // Valid character range
     *     });
     * 
     * @example
     * // ❌ BAD: Simple condition that could use query builder
     * const arialStyle = styleList.firstWhere(obj => 
     *     obj.getObject('textStyle').getString('fontName') === 'Arial'
     * );
     * // Consider: styleList.query(q => q.where('fontName', 'Arial').select(['fontName']))
     */
    firstWhere(predicate: PredicateFunction): ActionDescriptorNavigator {
        return this.asEnumerable().where(predicate).first();
    }

    /**
     * Get single object matching predicate with validation that exactly one matches
     * @param {PredicateFunction} predicate - Function that tests each object
     * @returns {ActionDescriptorNavigator} Navigator for single matching object, or sentinel with warning
     * @description Finds objects matching criteria and validates exactly one match exists.
     * Logs warnings if zero or multiple matches found. Use for business rule validation.
     * @example
     * // ✅ GOOD: Validate exactly one Arial style exists
     * const arialStyle = textObj
     *     .getList('textStyleRange')
     *     .singleWhere(obj => {
     *         const style = obj.getObject('textStyle');
     *         return style.getString('fontName') === 'Arial';
     *     });
     * 
     * @example
     * // ✅ BETTER: Business rule enforcement with detailed criteria
     * const requiredStyle = textObj
     *     .getList('textStyleRange')
     *     .singleWhere(obj => {
     *         const style = obj.getObject('textStyle');
     *         return style.getString('fontName') === 'Arial' &&
     *                style.getDouble('fontSize') === 24 &&
     *                style.getEnumerated('fontCaps') === 'normal';
     *     });
     * 
     * @example
     * // ✅ BEST: Scoring script validation pattern
     * const scoringResult = {
     *     hasExactlyOneArialStyle: false,
     *     fontSize: -1
     * };
     * 
     * const arialStyle = textObj
     *     .getList('textStyleRange')
     *     .singleWhere(obj => obj.getObject('textStyle').getString('fontName') === 'Arial');
     * 
     * if (!arialStyle.isSentinel) {
     *     scoringResult.hasExactlyOneArialStyle = true;
     *     scoringResult.fontSize = arialStyle.getObject('textStyle').getDouble('fontSize');
     * }
     * 
     * @example
     * // ❌ BAD: Using when multiple matches are acceptable
     * const boldStyles = textObj.getList('textStyleRange')
     *     .singleWhere(obj => obj.getObject('textStyle').getBoolean('syntheticBold'));
     * // Will warn if multiple bold styles exist - use firstWhere() or query() instead
     */
    singleWhere(predicate: PredicateFunction): ActionDescriptorNavigator {
        var matches = this.asEnumerable().where(predicate).toArray();
        if (matches.length === 0) {
            $.writeln('WARNING: singleWhere() - No objects matched criteria');
            return ActionDescriptorNavigator.createSentinel();
        }
        if (matches.length > 1) {
            $.writeln('WARNING: singleWhere() - Multiple objects matched (' + matches.length + '), expected exactly one');
            return ActionDescriptorNavigator.createSentinel();
        }
        return matches[0];
    }

    /**
     * Execute advanced query with automatic value extraction (primary expected use case)
     * @param {QueryBuilderFunction} builder - Function that configures the query
     * @returns {any|null} Object with extracted properties as actual values, or null if no match
     * @description Advanced query builder that filters objects and extracts properties in one operation.
     * Returns actual JavaScript values (strings, numbers, booleans) instead of navigator objects.
     * Automatically detects appropriate getter methods for common properties.
     * @example
     * // ✅ GOOD: Multiple conditions with clean value extraction
     * const { fontName, fontSize, syntheticBold } = textObj
     *     .getList('textStyleRange')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .where('fontSize', '>', 20)
     *         .where('syntheticBold', false)
     *         .select(['fontName', 'fontSize', 'syntheticBold'])
     *     ) || {};
     * // Returns: { fontName: 'Arial', fontSize: 24, syntheticBold: false }
     * 
     * @example
     * // ✅ BETTER: Complex conditions with range validation
     * const styleData = textObj
     *     .getList('textStyleRange')
     *     .query(q => q
     *         .where('fontSize', 'between', [16, 72])
     *         .where('fontName', 'contains', 'Arial')
     *         .where('tracking', '!==', 0)
     *         .select(['fontName', 'fontSize', 'tracking', 'fontCaps'])
     *     );
     * 
     * @example
     * // ✅ BEST: Complete scoring workflow with direct value usage
     * const analysis = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .where('fontSize', '>=', 16)
     *         .select(['fontName', 'fontSize', 'syntheticBold', 'fontCaps'])
     *     );
     * 
     * if (analysis) {
     *     let score = 0;
     *     if (analysis.fontName === 'Arial') score += 10;        // Direct string comparison
     *     if (analysis.fontSize >= 16) score += 10;             // Direct number comparison
     *     if (!analysis.syntheticBold) score += 5;              // Direct boolean check
     *     if (analysis.fontCaps === 'normal') score += 5;       // Direct enum comparison
     * }
     * 
     * @example
     * // ❌ BAD: Using when you need all matching results
     * const firstMatch = styleList.query(q => q.where('fontName', 'Arial').select(['fontSize']));
     * // Use queryAll() if you need multiple results
     */
    query(builder: QueryBuilderFunction): any {
        var query = builder(new StyleRangeQuery());
        return query.execute(this);
    }

    /**
     * Execute advanced query and return all matching results with extracted properties
     * @param {QueryBuilderFunction} builder - Function that configures the query
     * @returns {any[]} Array of objects with extracted properties as actual values
     * @description Advanced query builder that returns all matching objects with extracted properties.
     * Each result contains actual JavaScript values, not navigator objects.
     * @example
     * // ✅ GOOD: Get all Arial styles with their properties
     * const allArialStyles = textObj
     *     .getList('textStyleRange')
     *     .queryAll(q => q
     *         .where('fontName', 'Arial')
     *         .select(['fontSize', 'syntheticBold', 'fontCaps'])
     *     );
     * // Returns: [{ fontSize: 24, syntheticBold: true, fontCaps: 'normal' }, ...]
     * 
     * @example
     * // ✅ BETTER: Statistical analysis of all font sizes
     * const allFontSizes = textObj
     *     .getList('textStyleRange')
     *     .queryAll(q => q
     *         .where('fontSize', '>', 0)
     *         .select(['fontSize', 'fontName'])
     *     );
     * 
     * const fontStats = {
     *     count: allFontSizes.length,
     *     averageSize: allFontSizes.reduce((sum, item) => sum + item.fontSize, 0) / allFontSizes.length,
     *     uniqueFonts: [...new Set(allFontSizes.map(item => item.fontName))]
     * };
     * 
     * @example
     * // ✅ BEST: Complete style variation analysis
     * const styleVariations = textObj
     *     .getList('textStyleRange')
     *     .queryAll(q => q
     *         .where('fontSize', 'between', [12, 72])
     *         .select(['fontName', 'fontSize', 'syntheticBold', 'syntheticItalic', 'fontCaps'])
     *     );
     * 
     * styleVariations.forEach(style => {
     *     console.log(`Font: ${style.fontName}, Size: ${style.fontSize}, Bold: ${style.syntheticBold}`);
     * });
     * 
     * @example
     * // ❌ BAD: Using when you only need first result
     * const firstFont = styleList.queryAll(q => q.where('fontName', 'Arial').select(['fontName']))[0];
     * // Use query() instead for single results
     */
    queryAll(builder: QueryBuilderFunction): any[] {
        var query = builder(new StyleRangeQuery());
        return query.executeAll(this);
    }

    /**
     * Convert to enumerable for LINQ-style operations
     * @returns {Enumerable} Enumerable wrapper with LINQ operations (where, select, etc.)
     * @description Converts ActionListNavigator to LINQ-capable Enumerable for filtering,
     * projection, and other functional operations. Use when you need more complex operations
     * than the query builder provides.
     * @example
     * // ✅ GOOD: Basic LINQ conversion for filtering
     * const arialStyles = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Complex LINQ pipeline
     * const fontAnalysis = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 16)
     *     .select(obj => ({
     *         font: obj.getObject('textStyle').getString('fontName'),
     *         size: obj.getObject('textStyle').getDouble('fontSize'),
     *         range: obj.getInteger('to') - obj.getInteger('from')
     *     }))
     *     .where(data => data.range > 0)
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Performance-optimized with early termination
     * const hasLargeText = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 24)
     *     .any();  // Stops at first match
     * 
     * @example
     * // ❌ BAD: Converting when query builder would be cleaner
     * const result = styleList.asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .first()
     *     .getObject('textStyle')
     *     .getString('fontName');
     * // Use query builder: styleList.query(q => q.where('fontName', 'Arial').select(['fontName']))
     */
    asEnumerable(): Enumerable {
        return new Enumerable(this);
    }

    /**
     * Add debug output for list navigation
     * @param {string} label - Descriptive label for debug output
     * @returns {ActionListNavigator} This navigator (for chaining)
     * @description Debug method for list operations. Shows count information and success/failure status.
     * @example
     * // ✅ GOOD: Debug list access in chains
     * const styles = textObj
     *     .getList('textStyleRange')
     *     .debug('style range list')
     *     .asEnumerable()
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Debug with descriptive labels
     * const result = layer
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .debug('found ' + styleList.getCount() + ' style ranges')
     *     .query(q => q
     *         .where('fontName', 'Arial')
     *         .select(['fontName', 'fontSize'])
     *     );
     */
    debug(label: string): ActionListNavigator {
        try {
            var count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL (failed)' : 'OK (' + count + ' items)'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// Enumerable - LINQ-style operations with explicit predicates
// =============================================================================

/**
 * LINQ-style enumerable wrapper for filtering and querying ActionList collections
 * @class
 * @description Provides functional programming operations on ActionList collections.
 * Supports chaining, early termination, and projection operations.
 */
export class Enumerable {
    /**
     * Source ActionListNavigator being enumerated
     * @type {ActionListNavigator}
     * @private
     */
    private source: ActionListNavigator;
    
    /**
     * Array of predicate functions for filtering
     * @type {PredicateFunction[]}
     * @private
     */
    private filters: PredicateFunction[];

    /**
     * Creates a new Enumerable wrapper
     * @param {ActionListNavigator} source - The source list to enumerate
     * @description Internal constructor - use asEnumerable() method from ActionListNavigator
     */
    constructor(source: ActionListNavigator) {
        this.source = source;
        this.filters = [];
    }

    /**
     * Filter items using predicate function (supports multiple conditions)
     * @param {PredicateFunction} predicate - Function that tests each item
     * @returns {Enumerable} New enumerable with additional filter applied
     * @description Adds filter to enumerable chain. Supports complex multi-condition predicates.
     * Filters are applied lazily during terminal operations for performance.
     * @example
     * // ✅ GOOD: Simple filtering by property
     * const arialStyles = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Multiple conditions in single predicate
     * const specificStyles = styleList
     *     .asEnumerable()
     *     .where(obj => {
     *         const style = obj.getObject('textStyle');
     *         return style.getString('fontName') === 'Arial' &&
     *                style.getDouble('fontSize') > 20 &&
     *                style.getBoolean('syntheticBold') === false;
     *     })
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Chained filtering with performance optimization
     * const results = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 16)  // Quick numeric filter first
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')  // String filter second
     *     .where(obj => {  // Complex validation last
     *         const from = obj.getInteger('from');
     *         const to = obj.getInteger('to');
     *         return (to - from) > 0;  // Valid character range
     *     })
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Overly complex single predicate
     * const results = styleList.asEnumerable().where(obj => {
     *     // 50 lines of complex logic...
     *     return complexResult;
     * });
     * // Break into multiple where() calls for better performance and readability
     */
    where(predicate: PredicateFunction): Enumerable {
        var newEnum = new Enumerable(this.source);
        newEnum.filters = this.filters.slice();
        newEnum.filters.push(predicate);
        return newEnum;
    }

    /**
     * Get first matching item with true early termination
     * @returns {ActionDescriptorNavigator} First matching navigator, or sentinel if none found
     * @description Terminal operation that returns first item matching all filters.
     * Implements true early termination - stops immediately at first match for performance.
     * @example
     * // ✅ GOOD: Get first matching style
     * const firstArial = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .first();
     * 
     * @example
     * // ✅ BETTER: Performance-optimized search with validation
     * const targetStyle = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 20)  // Quick filter
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .first();
     * 
     * if (!targetStyle.isSentinel) {
     *     const fontData = targetStyle.getObject('textStyle').extract({
     *         name: 'getString',
     *         size: 'getDouble',
     *         bold: 'getBoolean'
     *     });
     * }
     * 
     * @example
     * // ✅ BEST: Scoring pattern with early termination
     * const score = {
     *     hasRequiredFont: false,
     *     fontSize: -1
     * };
     * 
     * const requiredStyle = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .first();
     * 
     * if (!requiredStyle.isSentinel) {
     *     score.hasRequiredFont = true;
     *     score.fontSize = requiredStyle.getObject('textStyle').getDouble('fontSize');
     * }
     * 
     * @example
     * // ❌ BAD: Using when you need all matches
     * const firstFont = styleList.asEnumerable().first().getObject('textStyle').getString('fontName');
     * // Use select().toArray() if you want all font names
     */
    first(): ActionDescriptorNavigator {
        if (this.source.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var count = this.source.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return item;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Check if any items match all filters with true early termination
     * @returns {boolean} True if at least one item matches, false otherwise
     * @description Terminal operation that checks existence of matching items.
     * Implements true early termination - stops immediately at first match for performance.
     * @example
     * // ✅ GOOD: Existence check for validation
     * const hasArialFont = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .any();
     * 
     * @example
     * // ✅ BETTER: Complex condition existence check
     * const hasLargeText = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 24)
     *     .any();
     * 
     * @example
     * // ✅ BEST: Multiple validation checks for scoring
     * const validation = {
     *     hasRequiredFont: styleList.asEnumerable()
     *         .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *         .any(),
     *     hasProperSize: styleList.asEnumerable()
     *         .where(obj => {
     *             const size = obj.getObject('textStyle').getDouble('fontSize');
     *             return size >= 16 && size <= 72;
     *         })
     *         .any(),
     *     hasValidStyles: styleList.asEnumerable()
     *         .where(obj => {
     *             const style = obj.getObject('textStyle');
     *             return !style.getBoolean('syntheticBold') && 
     *                    !style.getBoolean('syntheticItalic');
     *         })
     *         .any()
     * };
     * 
     * @example
     * // ❌ BAD: Inefficient existence check
     * const hasArial = styleList.asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .toArray().length > 0;  // Use any() instead for early termination
     */
    any(): boolean {
        if (this.source.isSentinel) {
            return false;
        }

        var count = this.source.getCount();
        if (count <= 0) {
            return false;
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return true;
            }
        }

        return false;
    }

    /**
     * Count items matching all filters
     * @returns {number} Number of matching items
     * @description Terminal operation that counts all matching items. Must process entire
     * collection to get accurate count.
     * @example
     * // ✅ GOOD: Count for reporting
     * const arialCount = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .count();
     * 
     * @example
     * // ✅ BETTER: Statistical analysis
     * const fontStats = {
     *     total: styleList.asEnumerable().count(),
     *     arial: styleList.asEnumerable()
     *         .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *         .count(),
     *     large: styleList.asEnumerable()
     *         .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 20)
     *         .count(),
     *     bold: styleList.asEnumerable()
     *         .where(obj => obj.getObject('textStyle').getBoolean('syntheticBold'))
     *         .count()
     * };
     * 
     * @example
     * // ❌ BAD: Using when you only need existence check
     * const hasArial = styleList.asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .count() > 0;  // Use any() instead for better performance
     */
    count(): number {
        return this.toArray().length;
    }

    /**
     * Get all matching items as array
     * @returns {ActionDescriptorNavigator[]} Array of all matching navigators
     * @description Terminal operation that returns all items matching filters.
     * Must process entire collection.
     * @example
     * // ✅ GOOD: Get all matching items for processing
     * const allArialStyles = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Complex filtering before collection
     * const validStyles = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 16)
     *     .where(obj => {
     *         const from = obj.getInteger('from');
     *         const to = obj.getInteger('to');
     *         return (to - from) > 0;  // Valid character range
     *     })
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Collecting when you only need first
     * const firstArial = styleList.asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .toArray()[0];  // Use first() instead
     */
    toArray(): ActionDescriptorNavigator[] {
        if (this.source.isSentinel) {
            return [];
        }

        var results = [];
        var count = this.source.getCount();

        if (count <= 0) {
            return [];
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                results.push(item);
            }
        }

        return results;
    }

    /**
     * Transform/project items into new forms
     * @template T
     * @param {SelectorFunction<T>} selector - Function to transform each item
     * @returns {EnumerableArray} Array of transformed results
     * @description Projects each matching item through selector function.
     * Essential for data extraction and transformation patterns.
     * @example
     * // ✅ GOOD: Extract single property
     * const fontNames = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Extract multiple properties into objects
     * const fontData = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             name: style.getString('fontName'),
     *             size: style.getDouble('fontSize'),
     *             bold: style.getBoolean('syntheticBold'),
     *             italic: style.getBoolean('syntheticItalic')
     *         };
     *     })
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Complex transformation with calculations and validation
     * const analysis = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 0)  // Filter invalid first
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         const size = style.getDouble('fontSize');
     *         const from = obj.getInteger('from');
     *         const to = obj.getInteger('to');
     *         
     *         return {
     *             font: style.getString('fontName'),
     *             size: Math.round(size),
     *             sizeCategory: size > 24 ? 'large' : size > 16 ? 'medium' : 'small',
     *             characterCount: to - from,
     *             weight: style.getBoolean('syntheticBold') ? 'bold' : 'normal',
     *             style: style.getBoolean('syntheticItalic') ? 'italic' : 'normal'
     *         };
     *     })
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Redundant data extraction in multiple selects
     * const names = styleList.asEnumerable().select(obj => obj.getObject('textStyle').getString('fontName')).toArray();
     * const sizes = styleList.asEnumerable().select(obj => obj.getObject('textStyle').getDouble('fontSize')).toArray();
     * // Combine into single select for better performance
     */
    select<T>(selector: SelectorFunction<T>): EnumerableArray {
        var items = this.toArray();
        var results = [];

        for (var i = 0; i < items.length; i++) {
            try {
                results.push(selector(items[i]));
            } catch (e) {
                // Graceful failure - continue with next item
            }
        }

        return new EnumerableArray(results);
    }

    /**
     * Add debug output for enumerable operations
     * @param {string} label - Descriptive label for debug output
     * @returns {Enumerable} This enumerable (for chaining)
     * @description Debug method for LINQ operations. Shows match count and operation status.
     * @example
     * // ✅ GOOD: Debug filtering operations
     * const results = styleList
     *     .asEnumerable()
     *     .debug('initial enumerable')
     *     .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 16)
     *     .debug('after size filter')
     *     .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
     *     .debug('after font filter')
     *     .toArray();
     */
    debug(label: string): Enumerable {
        try {
            var count = this.count();
            $.writeln(label + ': ' + (count === 0 ? 'No matches' : 'Found ' + count + ' matches'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// EnumerableArray - Collection of projected results
// =============================================================================

/**
 * Collection wrapper for projected results with chainable operations
 * @class
 * @description Wrapper for arrays returned by select() operations. Provides additional
 * filtering and projection capabilities on transformed data.
 */
export class EnumerableArray {
    /**
     * The wrapped array of results
     * @type {any[]}
     * @readonly
     */
    public readonly array: any[];

    /**
     * Creates a new EnumerableArray wrapper
     * @param {any[]} array - Array of results to wrap
     * @description Internal constructor - typically created by select() operations
     */
    constructor(array: any[]) {
        this.array = array || [];
    }

    /**
     * Filter projected results using predicate function
     * @param {Function} predicate - Function that tests each item
     * @returns {EnumerableArray} New EnumerableArray with filtered results
     * @description Filters transformed data using predicate function. Useful for post-processing
     * projected results with additional criteria.
     * @example
     * // ✅ GOOD: Filter projected font data
     * const largeFonts = styleList
     *     .asEnumerable()
     *     .select(obj => ({
     *         name: obj.getObject('textStyle').getString('fontName'),
     *         size: obj.getObject('textStyle').getDouble('fontSize')
     *     }))
     *     .where(data => data.size > 20)
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Complex filtering on projected data
     * const validFontData = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             name: style.getString('fontName'),
     *             size: style.getDouble('fontSize'),
     *             bold: style.getBoolean('syntheticBold'),
     *             valid: style.getString('fontName') !== '' && style.getDouble('fontSize') > 0
     *         };
     *     })
     *     .where(data => data.valid && data.size >= 8 && data.size <= 144)
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Multi-stage filtering for scoring analysis
     * const scoreData = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         const size = style.getDouble('fontSize');
     *         return {
     *             font: style.getString('fontName'),
     *             size: size,
     *             sizePoints: size >= 16 && size <= 24 ? 10 : size > 24 ? 5 : 0,
     *             fontPoints: style.getString('fontName') === 'Arial' ? 10 : 0
     *         };
     *     })
     *     .where(data => data.sizePoints > 0 || data.fontPoints > 0)
     *     .where(data => data.font !== '')  // Valid font name
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Filtering that should have been done before projection
     * const results = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle'))  // Heavy object creation
     *     .where(style => style.getString('fontName') === 'Arial');  // Should filter first
     * // Better: .where().then().select()
     */
    where(predicate: (item: any) => boolean): EnumerableArray {
        var filtered = [];
        for (var i = 0; i < this.array.length; i++) {
            try {
                if (predicate(this.array[i])) {
                    filtered.push(this.array[i]);
                }
            } catch (e) {
                // Skip failed matches
            }
        }
        return new EnumerableArray(filtered);
    }

    /**
     * Get first item from projected results
     * @returns {any} First item, or null if array is empty
     * @description Returns first item from projected results array. No early termination
     * benefit since array is already materialized.
     * @example
     * // ✅ GOOD: Get first projected result
     * const firstFont = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .first();
     * 
     * @example
     * // ✅ BETTER: Get first valid result with filtering
     * const firstValidFont = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .where(name => name !== '')
     *     .first();
     * 
     * @example
     * // ❌ BAD: When you could use Enumerable.first() instead
     * const firstStyle = styleList
     *     .asEnumerable()
     *     .select(obj => obj)  // No transformation
     *     .first();
     * // Use styleList.asEnumerable().first() directly
     */
    first(): any {
        return this.array.length > 0 ? this.array[0] : null;
    }

    /**
     * Get all items as plain array
     * @returns {any[]} Copy of internal array
     * @description Returns copy of internal array. Use this to get final results
     * from EnumerableArray operations.
     * @example
     * // ✅ GOOD: Get final projected results
     * const fontSizes = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getDouble('fontSize'))
     *     .where(size => size > 0)
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Complete analysis pipeline
     * const analysis = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             font: style.getString('fontName'),
     *             size: style.getDouble('fontSize'),
     *             bold: style.getBoolean('syntheticBold')
     *         };
     *     })
     *     .where(data => data.size > 0 && data.font !== '')
     *     .toArray();
     * 
     * for (var i = 0; i < analysis.length; i++) {
     *     $.writeln('Font: ' + analysis[i].font + ', Size: ' + analysis[i].size);
     * }
     */
    toArray(): any[] {
        return this.array.slice();
    }

    /**
     * Transform projected results into new forms
     * @template T
     * @param {Function} selector - Function to transform each item
     * @returns {EnumerableArray} New EnumerableArray with transformed results
     * @description Second-level projection on already transformed data. Useful for
     * additional calculations or format transformations.
     * @example
     * // ✅ GOOD: Secondary transformation
     * const fontSummary = styleList
     *     .asEnumerable()
     *     .select(obj => ({
     *         name: obj.getObject('textStyle').getString('fontName'),
     *         size: obj.getObject('textStyle').getDouble('fontSize')
     *     }))
     *     .select(data => data.name + ' (' + Math.round(data.size) + 'pt)')
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Calculation on projected data
     * const sizeStats = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getDouble('fontSize'))
     *     .where(size => size > 0)
     *     .select(size => ({
     *         original: size,
     *         rounded: Math.round(size),
     *         category: size > 24 ? 'large' : size > 16 ? 'medium' : 'small'
     *     }))
     *     .toArray();
     * 
     * @example
     * // ✅ BEST: Scoring calculation pipeline
     * const scores = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             font: style.getString('fontName'),
     *             size: style.getDouble('fontSize'),
     *             bold: style.getBoolean('syntheticBold')
     *         };
     *     })
     *     .where(data => data.font !== '' && data.size > 0)
     *     .select(data => ({
     *         font: data.font,
     *         size: data.size,
     *         score: (data.font === 'Arial' ? 10 : 0) + 
     *                (data.size >= 16 && data.size <= 24 ? 10 : 0) +
     *                (data.bold ? 5 : 0)
     *     }))
     *     .where(result => result.score > 0)
     *     .toArray();
     * 
     * @example
     * // ❌ BAD: Overly complex transformation that should be simplified
     * const complex = styleList
     *     .asEnumerable()
     *     .select(obj => obj)
     *     .select(obj => obj.getObject('textStyle'))
     *     .select(style => style.getString('fontName'));
     * // Combine transformations into single select for better performance
     */
    select<T>(selector: (item: any) => T): EnumerableArray {
        var results = [];
        for (var i = 0; i < this.array.length; i++) {
            try {
                results.push(selector(this.array[i]));
            } catch (e) {
                // Skip failed selections
            }
        }
        return new EnumerableArray(results);
    }

    /**
     * Add debug output for EnumerableArray operations
     * @param {string} label - Descriptive label for debug output
     * @returns {EnumerableArray} This EnumerableArray (for chaining)
     * @description Debug method for projected result operations. Shows item count and status.
     * @example
     * // ✅ GOOD: Debug projection results
     * const results = styleList
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .debug('extracted font names')
     *     .where(name => name !== '')
     *     .debug('filtered valid names')
     *     .toArray();
     * 
     * @example
     * // ✅ BETTER: Debug complex transformation pipeline
     * const analysis = styleList
     *     .asEnumerable()
     *     .select(obj => ({
     *         name: obj.getObject('textStyle').getString('fontName'),
     *         size: obj.getObject('textStyle').getDouble('fontSize')
     *     }))
     *     .debug('projected to font data objects')
     *     .where(data => data.size > 0)
     *     .debug('filtered valid sizes')
     *     .select(data => data.name + ' (' + data.size + 'pt)')
     *     .debug('formatted as strings')
     *     .toArray();
     */
    debug(label: string): EnumerableArray {
        try {
            $.writeln(label + ': ' + (this.array.length === 0 ? 'No items' : 'Found ' + this.array.length + ' items'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}