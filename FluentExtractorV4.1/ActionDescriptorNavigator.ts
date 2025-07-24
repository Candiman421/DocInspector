/**
 * ActionDescriptorNavigator Framework V4.1 - Complete Implementation
 * LINQ-style navigation for Adobe Photoshop ActionDescriptor with ES3 compatibility
 * 
 * Features:
 * - Fluent LINQ-style chaining (where, select, selectMany, first, etc.)
 * - Smart nested object search (auto-detects textStyleRange → textStyle patterns)
 * - Comprehensive sentinel pattern (no null/undefined errors)
 * - Debug chaining support (.debug() anywhere in chain)
 * - Memory-safe ES3 ExtendScript compatibility
 * - Type-safe value extraction (getString, getDouble, etc.)
 */

import { 
    executeAction, 
    executeActionGet, 
    stringIDToTypeID, 
    charIDToTypeID, 
    typeIDToStringID 
} from "../ps";

// =============================================================================
// SENTINEL VALUES - Single source of truth
// =============================================================================
const SENTINELS = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
} as const;

// =============================================================================
// SHARED HELPER FUNCTIONS
// =============================================================================
function getValueByType(obj: ActionDescriptorNavigator, key: string): any {
    const stringVal = obj.getString(key);
    if (stringVal !== SENTINELS.string) return stringVal;

    const doubleVal = obj.getDouble(key);
    if (doubleVal !== SENTINELS.double) return doubleVal;

    const intVal = obj.getInteger(key);
    if (intVal !== SENTINELS.integer) return intVal;

    const boolVal = obj.getBoolean(key);
    if (boolVal !== SENTINELS.boolean) return boolVal;

    const enumVal = obj.getEnumerated(key);
    if (enumVal !== SENTINELS.enumerated) return enumVal;

    return null;
}

function valuesMatch(actual: any, expected: any): boolean {
    if (typeof expected === 'string' && typeof actual === 'string') {
        if (expected.indexOf('*') >= 0 || expected.indexOf('_') >= 0) {
            return matchesPattern(actual, expected);
        }
        return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
}

function matchesPattern(actual: string, pattern: string): boolean {
    const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/_/g, '.');
    try {
        const regex = new RegExp('^' + regexPattern + '$', 'i');
        return regex.test(actual);
    } catch (e) {
        return false;
    }
}

function matchesCriteria(obj: ActionDescriptorNavigator, criteria: CriteriaObject | PredicateFunction): boolean {
    if (typeof criteria === 'function') {
        try {
            return criteria(obj);
        } catch (e) {
            return false;
        }
    }

    if (typeof criteria === 'object' && criteria !== null) {
        const keys = Object.keys(criteria);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = criteria[key];
            const isExclusion = key.charAt(0) === '!';
            const propertyKey = isExclusion ? key.substring(1) : key;

            const actualValue = getValueByType(obj, propertyKey);

            if (isExclusion) {
                if (valuesMatch(actualValue, value)) {
                    return false;
                }
            } else {
                if (!valuesMatch(actualValue, value)) {
                    return false;
                }
            }
        }
        return true;
    }
    return true;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
export type CriteriaObject = { [key: string]: any };
export type PredicateFunction = (item: ActionDescriptorNavigator) => boolean;
export type SelectorFunction<T> = (item: ActionDescriptorNavigator) => T;
export type SelectManyFunction = (item: ActionDescriptorNavigator) => ActionDescriptorNavigator | ActionDescriptorNavigator[] | EnumerableArray;

export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

export interface PropertyExtractionMap {
    [propertyName: string]: 'getString' | 'getDouble' | 'getUnitDouble' | 'getInteger' | 'getBoolean' | 'getEnumerated';
}

// =============================================================================
// ActionDescriptorNavigator - Core navigation class
// =============================================================================
export class ActionDescriptorNavigator {
    public readonly isSentinel: boolean;
    private desc: ActionDescriptor | null;

    /**
     * Creates a new ActionDescriptorNavigator instance
     * @description Internal constructor - use static factory methods instead
     * @param {ActionDescriptor | null} desc - The ActionDescriptor to wrap, or null for sentinel
     * @see ActionDescriptorNavigator.forLayerByName
     * @see ActionDescriptorNavigator.forCurrentLayer
     * @see ActionDescriptorNavigator.forCurrentDocument
     */
    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    /**
     * Creates navigator for currently selected layer
     * @description Gets the active/selected layer in Photoshop. Commonly used as starting point for layer analysis.
     * @returns {ActionDescriptorNavigator} Navigator for current layer, or sentinel if no layer selected
     * @example
     * // ✅ GOOD - Basic usage
     * const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
     * const layerName = currentLayer.getString('name');
     * 
     * @example
     * // ✅ BETTER - With sentinel checking
     * const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
     * if (!currentLayer.isSentinel) {
     *     const opacity = currentLayer.getDouble('opacity');
     *     $.writeln('Layer opacity: ' + opacity);
     * }
     * 
     * @example
     * // ✅ BEST - Fluent chaining
     * const fontName = ActionDescriptorNavigator
     *     .forCurrentLayer()
     *     .debug('current layer')
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .asEnumerable()
     *     .first()
     *     .getObject('textStyle')
     *     .getString('fontName');
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Creates navigator for currently active document
     * @description Gets the active document in Photoshop. Useful for document-level analysis like resolution, color mode, layer count.
     * @returns {ActionDescriptorNavigator} Navigator for current document, or sentinel if no document open
     * @example
     * // ✅ GOOD - Document properties
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * const width = doc.getDouble('width');
     * const height = doc.getDouble('height');
     * 
     * @example
     * // ✅ BETTER - Batch document info extraction
     * const docInfo = ActionDescriptorNavigator
     *     .forCurrentDocument()
     *     .extract({
     *         width: 'getDouble',
     *         height: 'getDouble',
     *         resolution: 'getDouble',
     *         mode: 'getEnumerated'
     *     });
     * 
     * @example
     * // ❌ BAD - Not checking for document existence
     * const width = ActionDescriptorNavigator.forCurrentDocument().getDouble('width');
     * // Should check isSentinel first if no document might be open
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Finds layer by name with case-insensitive matching
     * @description Searches through all layers to find one with matching name. Essential for test scoring when targeting specific layers.
     * @param {string} layerName - Name of layer to find (case-insensitive, whitespace trimmed)
     * @returns {ActionDescriptorNavigator} Navigator for found layer, or sentinel if not found
     * @example
     * // ✅ GOOD - Basic layer finding
     * const headerLayer = ActionDescriptorNavigator.forLayerByName("Header");
     * const isVisible = headerLayer.getBoolean('visible');
     * 
     * @example
     * // ✅ BETTER - Case insensitive with whitespace
     * const titleLayer = ActionDescriptorNavigator.forLayerByName("  TITLE LAYER  ");
     * // Automatically normalizes to find "title layer"
     * 
     * @example
     * // ✅ BEST - Complete text analysis workflow
     * const fontAnalysis = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .debug('found header layer')
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .asEnumerable()
     *     .select(obj => ({
     *         font: obj.getObject('textStyle').getString('fontName'),
     *         size: obj.getObject('textStyle').getDouble('fontSize')
     *     }))
     *     .toArray();
     * 
     * @example
     * // ❌ BAD - Assuming layer exists without checking
     * const fontName = ActionDescriptorNavigator
     *     .forLayerByName("NonExistentLayer")
     *     .getObject('textKey')  // Will create sentinel chain
     *     .getString('something');
     * // Better to check isSentinel or let sentinel chain handle gracefully
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const searchName = layerName.toLowerCase().replace(/^\s+|\s+$/g, '');
        const layerCount = ActionDescriptorNavigator.getLayerCount();

        if (layerCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 1; i <= layerCount; i++) {
            const layer = ActionDescriptorNavigator.forLayerByIndex(i);
            const currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().replace(/^\s+|\s+$/g, '') === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Internal method to get layer by index
     * @description Used internally by forLayerByName. Not recommended for direct use due to volatile indices.
     * @private
     * @param {number} index - 1-based layer index
     * @returns {ActionDescriptorNavigator} Navigator for layer at index, or sentinel if invalid
     */
    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Creates a sentinel navigator representing failed/missing data
     * @description Internal factory for creating sentinel instances. Sentinels prevent null errors and enable graceful error handling.
     * @returns {ActionDescriptorNavigator} Sentinel navigator with isSentinel = true
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Internal method to get total layer count in document
     * @description Used internally by forLayerByName for iteration bounds
     * @private
     * @returns {number} Number of layers, or -1 if unavailable
     */
    private static getLayerCount(): number {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e) {
            return -1;
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Navigate to nested ActionDescriptor object
     * @description Core navigation method for accessing nested objects like textKey, bounds, color, etc. Forms the backbone of fluent navigation.
     * @param {string} key - Property name to navigate to (e.g., 'textKey', 'bounds', 'color')
     * @returns {ActionDescriptorNavigator} Navigator for nested object, or sentinel if key missing/wrong type
     * @example
     * // ✅ GOOD - Basic object navigation
     * const textObj = layer.getObject('textKey');
     * const boundsObj = layer.getObject('bounds');
     * const colorObj = textStyle.getObject('color');
     * 
     * @example
     * // ✅ BETTER - Chained navigation
     * const colorObj = layer
     *     .getObject('textKey')
     *     .getList('textStyleRange')
     *     .getObject(0)
     *     .getObject('textStyle')
     *     .getObject('color');
     * 
     * @example
     * // ✅ BEST - With debug for troubleshooting
     * const warpSettings = layer
     *     .getObject('textKey')
     *     .debug('got textKey object')
     *     .getObject('warp')
     *     .debug('got warp object')
     *     .select(warp => ({
     *         style: warp.getEnumerated('warpStyle'),
     *         value: warp.getDouble('warpValue')
     *     }));
     * 
     * @example
     * // ❌ BAD - Wrong navigation path
     * const fontSize = layer.getObject('textKey').getObject('textStyle').getDouble('fontSize');
     * // textStyle is inside textStyleRange list, not direct child of textKey
     */
    getObject(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to ActionList for enumeration and LINQ operations
     * @description Accesses list properties like textStyleRange, paragraphStyleRange, etc. Returns ActionListNavigator with LINQ capabilities.
     * @param {string} key - List property name (e.g., 'textStyleRange', 'paragraphStyleRange')
     * @returns {ActionListNavigator} Navigator for list with enumeration and LINQ capabilities
     * @example
     * // ✅ GOOD - Basic list access
     * const styleList = textObj.getList('textStyleRange');
     * const count = styleList.getCount();
     * 
     * @example
     * // ✅ BETTER - LINQ operations on lists
     * const allFonts = textObj
     *     .getList('textStyleRange')
     *     .asEnumerable()
     *     .select(obj => obj.getObject('textStyle').getString('fontName'))
     *     .toArray();
     * 
     * @example
     * // ✅ BEST - Smart context filtering (auto-searches nested textStyle)
     * const arialStyles = textObj
     *     .getList('textStyleRange')
     *     .debug('got style range list')
     *     .asEnumerable()
     *     .where({ fontName: 'Arial' })  // Automatically searches textStyle.fontName
     *     .debug('filtered for Arial')
     *     .toArray();
     * 
     * @example
     * // ❌ BAD - Manual iteration without bounds checking
     * const styleList = textObj.getList('textStyleRange');
     * for (let i = 0; i <= styleList.getCount(); i++) {  // Off-by-one error
     *     const style = styleList.getObject(i);
     * }
     */
    getList(key: string): ActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list, key);
        } catch (e) {
            return ActionListNavigator.createSentinel();
        }
    }

    /**
     * Extract string values with automatic sentinel handling
     * @description Primary method for extracting text properties like layer names, font names, enumerated string values. Never throws - returns empty string on error.
     * @param {string} key - Property name to extract (e.g., 'name', 'fontName', 'fontPostScriptName')
     * @returns {string} String value, or empty string ("") if key missing/wrong type
     * @example
     * // ✅ GOOD - Basic string extraction
     * const layerName = layer.getString('name');
     * const fontName = textStyle.getString('fontName');
     * const postScriptName = textStyle.getString('fontPostScriptName');
     * 
     * @example
     * // ✅ BETTER - Used in projections (preferred style)
     * const fontData = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         return {
     *             name: style.getString('fontName'),           // Your preferred API
     *             postScript: style.getString('fontPostScriptName'),
     *             family: style.getString('fontStyleName')
     *         };
     *     })
     *     .toArray();
     * 
     * @example
     * // ✅ BEST - Validation with sentinel checking
     * const layerName = layer.getString('name');
     * if (layerName !== '') {  // Check against sentinel value
     *     $.writeln('Layer name: ' + layerName);
     * } else {
     *     $.writeln('Layer name not available');
     * }
     * 
     * @example
     * // ❌ BAD - Unnecessary null checking (sentinels prevent null)
     * const name = layer.getString('name');
     * if (name !== null && name !== undefined) {  // Not needed with sentinels
     *     $.writeln(name);
     * }
     */
    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.string;
        }

        try {
            return this.desc.getString(typeID);
        } catch (e) {
            return SENTINELS.string;
        }
    }

    /**
     * Extract numeric values (pixels, percentages, angles, etc.)
     * @description Primary method for extracting numeric properties like font sizes, opacity, dimensions. Never throws - returns -1 on error.
     * @param {string} key - Property name to extract (e.g., 'fontSize', 'opacity', 'tracking')
     * @returns {number} Numeric value, or -1 if key missing/wrong type
     * @example
     * // ✅ GOOD - Basic numeric extraction
     * const opacity = layer.getDouble('opacity');
     * const fontSize = textStyle.getDouble('fontSize');
     * const tracking = textStyle.getDouble('tracking');
     * 
     * @example
     * // ✅ BETTER - Calculations with sentinel awareness
     * const opacity = layer.getDouble('opacity');
     * const opacityPercent = opacity !== -1 ? (opacity / 255) * 100 : 0;
     * 
     * @example
     * // ✅ BEST - Used in complex projections
     * const analysis = styleList
     *     .asEnumerable()
     *     .select(obj => {
     *         const style = obj.getObject('textStyle');
     *         const size = style.getDouble('fontSize');
     *         return {
     *             fontSize: Math.round(size),
     *             sizeCategory: size > 24 ? 'large' : size > 16 ? 'medium' : 'small',
     *             tracking: style.getDouble('tracking')
     *         };
     *     })
     *     .where(data => data.fontSize > 0)  // Filter out sentinels
     *     .toArray();
     * 
     * @example
     * // ❌ BAD - Division without checking sentinels
     * const aspectRatio = bounds.width / bounds.height;  // Could be -1 / -1 = 1 (wrong)
     * // Better: Check bounds.width !== -1 && bounds.height !== -1 first
     */
    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e) {
            return SENTINELS.double;
        }
    }

    /**
     * Extract unit double values (alias for getDouble for XML consistency)
     * @description Identical to getDouble() but kept for XML element name consistency. Use when XML shows UnitDouble elements.
     * @param {string} key - Property name to extract (e.g., 'sizeKey', 'left', 'top')
     * @returns {number} Numeric value, or -1 if key missing/wrong type
     * @example
     * // ✅ GOOD - When XML shows UnitDouble elements
     * const fontSize = textStyle.getUnitDouble('sizeKey');  // XML shows <UnitDouble symname="SizeKey"...>
     * const leftPos = boundsObj.getUnitDouble('left');      // XML shows <UnitDouble symname="Left"...>
     * 
     * @example
     * // ✅ BETTER - Consistent with XML structure in batch extraction
     * const bounds = boundsObj.extract({
     *     left: 'getUnitDouble',    // XML: <UnitDouble symname="Left"...>
     *     top: 'getUnitDouble',     // XML: <UnitDouble symname="Top"...>
     *     right: 'getUnitDouble',   // XML: <UnitDouble symname="Right"...>
     *     bottom: 'getUnitDouble'   // XML: <UnitDouble symname="Bottom"...>
     * });
     */
    getUnitDouble(key: string): number {
        return this.getDouble(key);
    }

    /**
     * Extract integer values (layer IDs, counts, indices)
     * @description Method for extracting whole number properties like layer IDs, item indices, character ranges. Never throws - returns -1 on error.
     * @param {string} key - Property name to extract (e.g., 'layerID', 'itemIndex', 'from', 'to')
     * @returns {number} Integer value, or -1 if key missing/wrong type
     * @example
     * // ✅ GOOD - Integer-specific properties
     * const layerID = layer.getInteger('layerID');
     * const itemIndex = layer.getInteger('itemIndex');
     * const rangeFrom = styleRange.getInteger('from');
     * const rangeTo = styleRange.getInteger('to');
     * 
     * @example
     * // ✅ BETTER - Text range analysis
     * const textRanges = styleList
     *     .asEnumerable()
     *     .select(obj => ({
     *         from: obj.getInteger('from'),
     *         to: obj.getInteger('to'),
     *         length: obj.getInteger('to') - obj.getInteger('from'),
     *         font: obj.getObject('textStyle').getString('fontName')
     *     }))
     *     .toArray();
     * 
     * @example
     * // ❌ BAD - Using for floating point values
     * const fontSize = textStyle.getInteger('fontSize');  // Should use getDouble()
     * // fontSize could be 24.5, but getInteger() might truncate to 24
     */
    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getInteger(typeID);
        } catch (e) {
            return SENTINELS.integer;
        }
    }

    /**
     * Extract boolean flags (visibility, synthetic styles, etc.)
     * @description Method for extracting true/false properties like layer visibility, text styles, feature flags. Never throws - returns false on error.
     * @param {string} key - Property name to extract (e.g., 'visible', 'syntheticBold', 'syntheticItalic')
     * @returns {boolean} Boolean value, or false if key missing/wrong type
     * @example
     * // ✅ GOOD - Boolean properties
     * const isVisible = layer.getBoolean('visible');
     * const isBold = textStyle.getBoolean('syntheticBold');
     * const isItalic = textStyle.getBoolean('syntheticItalic');
     * const hasAutoLeading = textStyle.getBoolean('autoLeading');
     * 
     * @example
     * // ✅ BETTER - Style feature analysis
     * const styleFeatures = textStyle.select(style => ({
     *     hasSyntheticBold: style.getBoolean('syntheticBold'),
     *     hasSyntheticItalic: style.getBoolean('syntheticItalic'),
     *     hasAutoLeading: style.getBoolean('autoLeading'),
     *     hasLigatures: style.getBoolean('ligature'),
     *     isVisible: style.getBoolean('visible')
     * }));
     * 
     * @example
     * // ✅ BEST - Filtering with boolean conditions
     * const boldStyles = styleList
     *     .asEnumerable()
     *     .where(obj => obj.getObject('textStyle').getBoolean('syntheticBold'))
     *     .toArray();
     * 
     * @example
     * // ❌ BAD - String comparison for boolean
     * const isVisible = layer.getString('visible') === 'true';  // Use getBoolean()
     */
    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.boolean;
        }

        try {
            return this.desc.getBoolean(typeID);
        } catch (e) {
            return SENTINELS.boolean;
        }
    }

    /**
     * Extract enumerated values as human-readable strings
     * @description Method for extracting enumerated properties like blend modes, font caps, alignments. Returns string representation of enum values.
     * @param {string} key - Property name to extract (e.g., 'mode', 'fontCaps', 'alignment')
     * @returns {string} Enumerated string value, or empty string ("") if key missing/wrong type
     * @example
     * // ✅ GOOD - Enumerated properties
     * const blendMode = layer.getEnumerated('mode');        // "normal", "multiply", etc.
     * const fontCaps = textStyle.getEnumerated('fontCaps'); // "normal", "smallCaps", etc.
     * const alignment = paragraphStyle.getEnumerated('alignment'); // "left", "center", "right"
     * 
     * @example
     * // ✅ BETTER - Enumerated filtering with smart context
     * const smallCapsStyles = styleList
     *     .asEnumerable()
     *     .where({ fontCaps: 'smallCaps' })  // Smart nested search in textStyle
     *     .toArray();
     * 
     * @example
     * // ✅ BEST - Complex enumerated analysis
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
     * // ❌ BAD - Case-sensitive comparison
     * const isSmallCaps = textStyle.getEnumerated('fontCaps') === 'SmallCaps';  // Wrong case
     * // Correct: === 'smallCaps' (lowercase)
     */
    getEnumerated(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.enumerated;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.enumerated;
        }

        try {
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.enumerated;
        } catch (e) {
            return SENTINELS.enumerated;
        }
    }

    /**
     * Check if property exists for conditional logic
     * @description Utility method for checking property existence before navigation. Useful for type identification and conditional logic.
     * @param {string} key - Property name to check (e.g., 'textKey', 'layerEffects')
     * @returns {boolean} True if property exists, false otherwise
     * @example
     * // ✅ GOOD - Conditional navigation
     * if (layer.hasKey('textKey')) {
     *     const textAnalysis = layer.getObject('textKey').getList('textStyleRange');
     * }
     * 
     * @example
     * // ✅ BETTER - Layer type identification
     * const layerType = {
     *     isText: layer.hasKey('textKey'),
     *     hasEffects: layer.hasKey('layerEffects'),
     *     hasVector: layer.hasKey('vectorMask'),
     *     isAdjustment: layer.hasKey('adjustment')
     * };
     * 
     * @example
     * // ✅ BEST - Complex conditional analysis in LINQ
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
     * // ❌ BAD - Using for null checking (not needed with sentinels)
     * if (layer.hasKey('name')) {
     *     const name = layer.getString('name');  // getString() already handles missing keys safely
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
     * @description Extracts layer bounds object and calculates width/height. Essential for layout analysis and positioning validation in scoring scripts.
     * @returns {BoundsObject} Object with left, top, right, bottom, width, height properties, or all -1 if bounds unavailable
     * @example
     * // ✅ GOOD - Basic bounds usage
     * const bounds = layer.getBounds();
     * $.writeln('Size: ' + bounds.width + ' x ' + bounds.height);
     * 
     * @example
     * // ✅ BETTER - Bounds analysis with validation
     * const bounds = layer.getBounds();
     * if (bounds.width !== -1) {  // Valid bounds check
     *     const analysis = {
     *         dimensions: bounds.width + 'x' + bounds.height,
     *         position: '(' + bounds.left + ', ' + bounds.top + ')',
     *         area: bounds.width * bounds.height,
     *         aspectRatio: bounds.height !== 0 ? bounds.width / bounds.height : 0
     *     };
     * }
     * 
     * @example
     * // ✅ BEST - Multi-layer bounds analysis for scoring
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
     * // ❌ BAD - Manual bounds calculation
     * const left = layer.getObject('bounds').getDouble('left');
     * const right = layer.getObject('bounds').getDouble('right');
     * const width = right - left;  // Use getBounds() instead for calculated dimensions
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
            const boundsTypeID = stringIDToTypeID('bounds');
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

            const boundsDesc = this.desc.getObjectValue(boundsTypeID);
            const left = boundsDesc.getDouble(stringIDToTypeID('left'));
            const top = boundsDesc.getDouble(stringIDToTypeID('top'));
            const right = boundsDesc.getDouble(stringIDToTypeID('right'));
            const bottom = boundsDesc.getDouble(stringIDToTypeID('bottom'));

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
     * @description Convenience method for extracting multiple properties at once using a mapping object. Cleaner than individual getter calls.
     * @param {PropertyExtractionMap} propertyMap - Object mapping property names to getter method names
     * @returns {Record<string, any>} Object with extracted properties, empty object if sentinel
     * @example
     * // ✅ GOOD - Basic batch extraction
     * const layerData = layer.extract({
     *     name: 'getString',
     *     opacity: 'getDouble',
     *     visible: 'getBoolean',
     *     mode: 'getEnumerated'
     * });
     * 
     * @example
     * // ✅ BETTER - Font style extraction
     * const fontData = textStyle.extract({
     *     fontName: 'getString',
     *     fontSize: 'getDouble',
     *     syntheticBold: 'getBoolean',
     *     syntheticItalic: 'getBoolean',
     *     fontCaps: 'getEnumerated',
     *     tracking: 'getDouble'
     * });
     * 
     * @example
     * // ✅ BEST - Color extraction with known RGB structure
     * const colorData = colorObj.extract({
     *     red: 'getDouble',
     *     green: 'getDouble',
     *     blue: 'getDouble'
     * });
     * const rgbString = 'rgb(' + colorData.red + ', ' + colorData.green + ', ' + colorData.blue + ')';
     * 
     * @example
     * // ❌ BAD - Wrong method for property type
     * const wrong = textStyle.extract({
     *     fontSize: 'getString',  // Should be 'getDouble'
     *     fontName: 'getDouble'   // Should be 'getString'
     * });
     */
    extract(propertyMap: PropertyExtractionMap): Record<string, any> {
        if (this.isSentinel) {
            return {};
        }

        const result: Record<string, any> = {};
        const keys = Object.keys(propertyMap);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const methodName = propertyMap[key];

            try {
                if (typeof (this as any)[methodName] === 'function') {
                    result[key] = (this as any)[methodName](key);
                } else {
                    result[key] = null;
                }
            } catch (e) {
                result[key] = null;
            }
        }

        return result;
    }

    /**
     * Single object transformation for projections
     * @description Transform this navigator using a selector function. Useful for single-object projections in complex data extraction.
     * @param {SelectorFunction<T>} selector - Function to transform this navigator
     * @returns {T | null} Transformed result, or null if navigator is sentinel
     * @example
     * // ✅ GOOD - Single object transformation
     * const colorData = colorObj.select(color => ({
     *     red: color.getDouble('red'),
     *     green: color.getDouble('green'),
     *     blue: color.getDouble('blue')
     * }));
     * 
     * @example
     * // ✅ BETTER - Complex object analysis
     * const layerAnalysis = layer.select(layer => {
     *     const bounds = layer.getBounds();
     *     return {
     *         name: layer.getString('name'),
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
     * // ❌ BAD - Not handling sentinel case
     * const data = layer.select(layer => {
     *     return layer.getString('name').toUpperCase();  // Could fail if sentinel
     * });
     * // Better to check for sentinel values in selector function
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
     * @description Essential debugging method that can be inserted anywhere in fluent chains. Outputs to ExtendScript console via $.writeln().
     * @param {string} label - Descriptive label for debug output
     * @returns {ActionDescriptorNavigator} This navigator (for chaining)
     * @example
     * // ✅ GOOD - Simple debug
     * const result = layer.debug('layer loaded').getObject('textKey');
     * 
     * @example
     * // ✅ BETTER - Pipeline debugging
     * const fonts = layer
     *     .debug('starting with layer')
     *     .getObject('textKey')
     *     .debug('got text object')
     *     .getList('textStyleRange')
     *     .debug('got style list')
     *     .asEnumerable()
     *     .where({ fontName: 'Arial' })
     *     .debug('filtered for Arial')
     *     .toArray();
     * 
     * @example
     * // ✅ BEST - Strategic debugging at key points
     * const analysis = ActionDescriptorNavigator
     *     .forLayerByName("Header")
     *     .debug('found header layer')
     *     .getObject('textKey')
     *     .debug('extracted text data')
     *     .getList('textStyleRange')
     *     .debug('got style ranges')
     *     .asEnumerable()
     *     .where({ fontName: 'Arial' })
     *     .debug('filtered for target font')
     *     .first();
     * 
     * @example
     * // ❌ BAD - Non-descriptive labels
     * const result = layer
     *     .debug('a')
     *     .getObject('textKey')
     *     .debug('b');  // Labels should be descriptive
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
// ActionListNavigator - List navigation and enumeration
// =============================================================================
export class ActionListNavigator {
    public readonly isSentinel: boolean;
    private list: ActionList | null;
    private contextKey: string;

    constructor(list: ActionList | null, contextKey: string = '') {
        this.list = list;
        this.contextKey = contextKey;
        this.isSentinel = list === null || list === undefined;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

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

    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    // LINQ-style enumeration with smart context detection
    asEnumerable(): Enumerable {
        return new Enumerable(this, this.detectNavigationContext());
    }

    private detectNavigationContext(): string {
        // Smart context detection based on list content and context key
        if (this.contextKey === 'textStyleRange' || this.contextKey === 'TextStyleRange') {
            return 'TEXT_STYLE_RANGES';
        }
        if (this.contextKey === 'paragraphStyleRange') {
            return 'PARAGRAPH_STYLE_RANGES';
        }
        
        // Analyze first item structure
        if (this.getCount() > 0) {
            const firstItem = this.getObject(0);
            if (firstItem.hasKey('textStyle') && firstItem.hasKey('from') && firstItem.hasKey('to')) {
                return 'TEXT_STYLE_RANGES';
            }
        }
        
        return 'GENERIC';
    }

    // Debug method for fluent chaining
    debug(label: string): ActionListNavigator {
        try {
            const count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL (failed)' : 'OK (' + count + ' items)'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// Enumerable - LINQ-style operations for ActionList
// =============================================================================
export class Enumerable {
    private source: ActionListNavigator;
    private filters: (CriteriaObject | PredicateFunction)[];
    private context: string;

    constructor(source: ActionListNavigator, context: string = 'GENERIC') {
        this.source = source;
        this.context = context;
        this.filters = [];
    }

    where(criteria: CriteriaObject | PredicateFunction): Enumerable {
        const newEnum = new Enumerable(this.source, this.context);
        newEnum.filters = this.filters.slice();
        newEnum.filters.push(criteria);
        return newEnum;
    }

    first(): ActionDescriptorNavigator {
        if (this.source.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const count = this.source.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (this.matchesAllFilters(item)) {
                return item;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    firstOrDefault(): ActionDescriptorNavigator {
        const result = this.first();
        return result.isSentinel ? ActionDescriptorNavigator.createSentinel() : result;
    }

    toArray(): ActionDescriptorNavigator[] {
        if (this.source.isSentinel) {
            return [];
        }

        const results: ActionDescriptorNavigator[] = [];
        const count = this.source.getCount();

        if (count <= 0) {
            return [];
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (this.matchesAllFilters(item)) {
                results.push(item);
            }
        }

        return results;
    }

    any(): boolean {
        if (this.source.isSentinel) {
            return false;
        }

        const count = this.source.getCount();
        if (count <= 0) {
            return false;
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (this.matchesAllFilters(item)) {
                return true;
            }
        }

        return false;
    }

    count(): number {
        return this.toArray().length;
    }

    // Projection method - key for scoring scripts
    select<T>(selector: SelectorFunction<T>): EnumerableArray {
        const items = this.toArray();
        const results: T[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                results.push(selector(items[i]));
            } catch (e) {
                // Graceful failure - continue with next item
            }
        }

        return new EnumerableArray(results);
    }

    selectMany(selector: SelectManyFunction): EnumerableArray {
        const items = this.toArray();
        const results: ActionDescriptorNavigator[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const nestedItems = selector(items[i]);

                if (!nestedItems) {
                    continue;
                }

                // Handle EnumerableArray
                if (nestedItems && typeof (nestedItems as any).toArray === 'function') {
                    const nestedArray = (nestedItems as EnumerableArray).toArray();
                    for (let j = 0; j < nestedArray.length; j++) {
                        if (nestedArray[j] && !(nestedArray[j] as ActionDescriptorNavigator).isSentinel) {
                            results.push(nestedArray[j]);
                        }
                    }
                }
                // Handle single ActionDescriptorNavigator
                else if ((nestedItems as ActionDescriptorNavigator).isSentinel !== undefined) {
                    if (!(nestedItems as ActionDescriptorNavigator).isSentinel) {
                        results.push(nestedItems as ActionDescriptorNavigator);
                    }
                }
                // Handle array of ActionDescriptorNavigators
                else if (Array.isArray(nestedItems)) {
                    for (let k = 0; k < nestedItems.length; k++) {
                        if (nestedItems[k] && !nestedItems[k].isSentinel) {
                            results.push(nestedItems[k]);
                        }
                    }
                }
            } catch (e) {
                // Skip failed selections gracefully
            }
        }

        return new EnumerableArray(results);
    }

    // Internal filter matching with smart context awareness
    private matchesAllFilters(item: ActionDescriptorNavigator): boolean {
        for (let i = 0; i < this.filters.length; i++) {
            if (!this.matchesCriteriaWithContext(item, this.filters[i])) {
                return false;
            }
        }
        return true;
    }

    private matchesCriteriaWithContext(item: ActionDescriptorNavigator, criteria: CriteriaObject | PredicateFunction): boolean {
        // Smart context-aware matching
        if (this.context === 'TEXT_STYLE_RANGES' && typeof criteria === 'object') {
            // For textStyleRange, check criteria against nested textStyle object
            const textStyleObj = item.getObject('textStyle');
            if (!textStyleObj.isSentinel) {
                return matchesCriteria(textStyleObj, criteria);
            }
        }

        // Standard matching for other contexts
        return matchesCriteria(item, criteria);
    }

    // Debug method for fluent chaining
    debug(label: string): Enumerable {
        try {
            const count = this.count();
            $.writeln(label + ': ' + (count === 0 ? 'No matches' : 'Found ' + count + ' matches'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// EnumerableArray - For working with projected results
// =============================================================================
export class EnumerableArray {
    public readonly array: any[];

    constructor(array: any[]) {
        this.array = array || [];
    }

    where(predicate: (item: any) => boolean): EnumerableArray {
        const filtered: any[] = [];
        for (let i = 0; i < this.array.length; i++) {
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

    first(): any {
        return this.array.length > 0 ? this.array[0] : null;
    }

    toArray(): any[] {
        return this.array.slice();
    }

    select<T>(selector: (item: any) => T): EnumerableArray {
        const results: T[] = [];
        for (let i = 0; i < this.array.length; i++) {
            try {
                results.push(selector(this.array[i]));
            } catch (e) {
                // Skip failed selections
            }
        }
        return new EnumerableArray(results);
    }

    debug(label: string): EnumerableArray {
        try {
            $.writeln(label + ': ' + (this.array.length === 0 ? 'No items' : 'Found ' + this.array.length + ' items'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example 1: Imperative style (existing scoring scripts)
const titleLayer = ActionDescriptorNavigator.forLayerByName("Header");
const textObj = titleLayer.getObject('textKey');
const styleList = textObj.getList('textStyleRange');
const fontName = styleList.getObject(0).getObject('textStyle').getString('fontName');

// Example 2: Fluent LINQ style with your preferred getString() methods
const fontName = ActionDescriptorNavigator
    .forLayerByName("Header")
    .debug('layer')
    .getObject('textKey')
    .debug('textKey')
    .getList('textStyleRange')
    .debug('styleList')
    .asEnumerable()
    .where({ fontName: 'Arial' })  // Smart nested search in textStyle
    .debug('filtered')
    .first()
    .getObject('textStyle')
    .getString('fontName');

// Example 3: Projection with your preferred type methods
const allFontData = textStyleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            name: style.getString('fontName'),
            size: style.getDouble('fontSize'),
            bold: style.getBoolean('syntheticBold'),
            caps: style.getEnumerated('fontCaps')
        };
    })
    .toArray();

// Example 4: Extract specific values efficiently
const arialSizes = textStyleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .select(obj => obj.getObject('textStyle').getDouble('fontSize'))
    .toArray(); // [24, 18]

// Example 5: Complex filtering and projection
const largeArialStyles = textStyleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .select(obj => obj.getObject('textStyle').getDouble('fontSize'))
    .where(size => size > 20)
    .toArray();

// Debug output will appear in ExtendScript Toolkit console:
// "layer: OK"
// "textKey: OK" 
// "styleList: OK (3 items)"
// "filtered: Found 2 matches"
*/