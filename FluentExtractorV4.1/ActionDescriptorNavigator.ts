/**
 * Adobe ExtendScript ActionManager Navigator - Simplified Implementation
 * 
 * Clean, composable API for navigating Photoshop's ActionManager with sentinel-based error handling.
 * No complex caching - users cache naturally with const variables.
 * Never crashes - always returns safe sentinel values on errors.
 * 
 * @fileoverview Simple, chainable ActionManager navigation without complex caching
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Natural caching with const variables (user's preferred pattern)
 * ```typescript
 * // 1. Travel down XML hierarchy to focus scope
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const textObj = layer.getObject('textKey');
 * 
 * // 2. Chain to get ranges  
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // 3. Store navigators in const variables (natural caching!)
 * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
 * const textStyle = firstRange.getObject('textStyle');
 * const color = textStyle.getObject('color');
 * 
 * // 4. Process quickly from cached variables (no repeated API calls)
 * const red = color.getDouble('red');      // Fast access
 * const green = color.getDouble('green');  // Using cached navigator
 * const blue = color.getDouble('blue');    // No if checks needed
 * const fontSize = textStyle.getUnitDouble('sizeKey');
 * const fontName = textStyle.getString('fontPostScriptName');
 * 
 * // Never crashes - always safe values (sentinels on error)
 * ```
 * 
 * @example Good - Composable chaining for analysis
 * ```typescript
 * // Get ALL bold ranges for analysis
 * const allBoldRanges = styleRanges.getAllWhere(range => 
 *   range.getObject('textStyle').getBoolean('syntheticBold')
 * );
 * 
 * // Extract raw data for algorithms
 * const fontData = allBoldRanges.map(range => {
 *   const style = range.getObject('textStyle');
 *   return {
 *     fontSize: style.getUnitDouble('sizeKey'),    // Raw values for tolerance
 *     fontName: style.getString('fontPostScriptName')
 *   };
 * });
 * ```
 * 
 * @example Incorrect - Don't do complex manual error checking
 * ```typescript
 * // BAD - Never needed with sentinel design
 * if (layer && !layer.isSentinel && layer.hasKey('textKey')) {
 *   const textObj = layer.getObject('textKey');
 *   if (textObj && !textObj.isSentinel) {
 *     // This complexity is unnecessary
 *   }
 * }
 * 
 * // GOOD - Just chain, sentinels propagate safely
 * const fontSize = layer.getObject('textKey')
 *   .getList('textStyleRange')
 *   .getFirstWhere(range => range.getInteger('from') === 0)
 *   .getObject('textStyle')
 *   .getUnitDouble('sizeKey');  // Safe even if any step fails
 * ```
 */

import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from "../ps";

import {
    SENTINELS,
    PredicateFunction,
    SelectorFunction,
    BoundsObject,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray
} from "./types";

/**
 * Simple enumerable for filtering without complex lazy evaluation.
 * Keeps only essential functionality for whereMatches chaining.
 */
class SimpleEnumerable implements IEnumerable {
    private items: IActionDescriptorNavigator[];

    constructor(items: IActionDescriptorNavigator[]) {
        this.items = items;
    }

    /**
     * Filter items by criteria and return new enumerable for continued chaining
     * 
     * @param predicate - Function to test each item
     * @returns New enumerable with filtered items
     * 
     * @example Best - Multi-stage filtering
     * ```typescript
     * const filtered = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 12)
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'));
     * ```
     */
    whereMatches(predicate: PredicateFunction): IEnumerable {
        const filtered = this.items.filter(item => {
            if (item.isSentinel) return false;
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerable(filtered);
    }

    /**
     * Get first item from filtered results
     * 
     * @returns First item or sentinel if none found
     * 
     * @example Good - Get first match after filtering
     * ```typescript
     * const firstBold = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .getFirst();  // Safe - returns sentinel if none found
     * ```
     */
    getFirst(): IActionDescriptorNavigator {
        return this.items.length > 0 ? this.items[0] : ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Check if any items exist after filtering
     * 
     * @returns true if any items exist, false otherwise
     * 
     * @example Straightforward - Existence check
     * ```typescript
     * const hasBoldText = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .hasAnyMatches();
     * ```
     */
    hasAnyMatches(): boolean {
        return this.items.length > 0;
    }

    /**
     * Count items after filtering
     * 
     * @returns Number of items
     * 
     * @example Good - Count filtered results
     * ```typescript
     * const boldCount = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .getCount();
     * ```
     */
    getCount(): number {
        return this.items.length;
    }

    /**
     * Transform items and return enumerable array for continued processing
     * 
     * @param transformer - Function to transform each item
     * @returns Enumerable array for continued chaining
     * 
     * @example Best - Select and continue filtering
     * ```typescript
     * const fontNames = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const transformed = this.items.map(item => {
            if (item.isSentinel) return null;
            try {
                return transformer(item);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
    }

    /**
     * Get all filtered items as array (terminal operation)
     * 
     * @returns Array of all filtered items
     * 
     * @example Good - Final result collection
     * ```typescript
     * const allBoldRanges = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .toResultArray();
     * ```
     */
    toResultArray(): IActionDescriptorNavigator[] {
        return this.items.slice(); // Return copy
    }

    /**
     * Add debug information without breaking the chain
     * 
     * @param label - Debug label
     * @returns Same enumerable for continued chaining
     */
    debug(label: string): IEnumerable {
        try {
            $.writeln(label + ': ' + this.items.length + ' items');
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

/**
 * Simple enumerable array for transformed items.
 * Supports continued filtering and transformation.
 */
class SimpleEnumerableArray implements IEnumerableArray {
    public readonly array: any[];

    constructor(items: any[]) {
        this.array = items;
    }

    /**
     * Continue filtering after transformation
     * 
     * @param predicate - Function to test each transformed item
     * @returns New enumerable array with filtered items
     * 
     * @example Best - Filter after transform
     * ```typescript
     * const validFontNames = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string && name.length > 0)
     *   .toResultArray();
     * ```
     */
    whereMatches(predicate: (item: any) => boolean): IEnumerableArray {
        const filtered = this.array.filter(item => {
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerableArray(filtered);
    }

    /**
     * Get first transformed item
     * 
     * @returns First item or null if none found
     */
    getFirst(): any {
        return this.array.length > 0 ? this.array[0] : null;
    }

    /**
     * Count transformed items
     * 
     * @returns Number of items
     */
    getCount(): number {
        return this.array.length;
    }

    /**
     * Check if any transformed items exist
     * 
     * @returns true if items exist, false otherwise
     */
    hasAnyMatches(): boolean {
        return this.array.length > 0;
    }

    /**
     * Continue transforming items
     * 
     * @param transformer - Function to transform each item
     * @returns New enumerable array with transformed items
     * 
     * @example Good - Chain transformations
     * ```typescript
     * const processedData = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .select(name => name.split('-')[0])  // Extract font family
     *   .select(family => family.toLowerCase())  // Normalize case
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: (item: any) => T): IEnumerableArray {
        const transformed = this.array.map(item => {
            try {
                return transformer(item);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
    }

    /**
     * Get all transformed items as plain array (terminal operation)
     * 
     * @returns Plain JavaScript array with all items
     * 
     * @example Best - Final data collection
     * ```typescript
     * const fontSizes = styleRanges
     *   .select(range => range.getObject('textStyle').getUnitDouble('sizeKey'))
     *   .whereMatches(size => size > 0)  // Filter valid sizes
     *   .toResultArray();
     * 
     * // Now process as regular JavaScript array
     * const avgSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
     * ```
     */
    toResultArray(): any[] {
        return this.array.slice(); // Return copy
    }

    /**
     * Add debug information without breaking the chain
     * 
     * @param label - Debug label
     * @returns Same enumerable array for continued chaining
     */
    debug(label: string): IEnumerableArray {
        try {
            $.writeln(label + ': ' + this.array.length + ' items');
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

/**
 * Primary navigator for ActionDescriptor objects.
 * Simple, chainable API with sentinel-based error handling.
 * No complex caching - users cache naturally with const variables.
 * 
 * @example Best - Complete workflow with natural caching
 * ```typescript
 * // Travel down hierarchy and cache key navigators in const variables
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const textObj = layer.getObject('textKey');
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // Get specific ranges and cache them
 * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
 * const textStyle = firstRange.getObject('textStyle');
 * const color = textStyle.getObject('color');
 * 
 * // Fast access from cached navigators
 * const analysis = {
 *   fontName: textStyle.getString('fontPostScriptName'),
 *   fontSize: textStyle.getUnitDouble('sizeKey'),
 *   bold: textStyle.getBoolean('syntheticBold'),
 *   color: {
 *     red: color.getDouble('red'),
 *     green: color.getDouble('green'), 
 *     blue: color.getDouble('blue')
 *   }
 * };
 * ```
 */
export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    public readonly isSentinel: boolean;
    private desc: ActionDescriptor | null;

    /**
     * Create ActionDescriptor navigator
     * 
     * @param desc - ActionDescriptor to navigate (null creates sentinel)
     */
    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    /**
     * Get navigator for the currently selected layer
     * 
     * @returns ActionDescriptorNavigator for current layer (never null)
     * 
     * @example Best - Current layer analysis
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Safe to chain immediately - never crashes
     * const layerInfo = {
     *   name: layer.getString('name'),
     *   opacity: layer.getInteger('opacity'),
     *   visible: layer.getBoolean('visible'),
     *   hasText: layer.hasKey('textKey')
     * };
     * ```
     * 
     * @example Good - Text layer detection
     * ```typescript
     * const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // No if checks needed - just chain and check results
     * const textContent = currentLayer.getObject('textKey').getString('textKey');
     * if (textContent !== SENTINELS.string) {
     *   console.log('Text content:', textContent);
     * }
     * ```
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Get navigator for the current document
     * 
     * @returns ActionDescriptorNavigator for current document (never null)
     * 
     * @example Best - Document analysis
     * ```typescript
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * 
     * const docInfo = {
     *   title: doc.getString('title'),
     *   width: doc.getUnitDouble('width'),
     *   height: doc.getUnitDouble('height'),
     *   colorMode: doc.getEnumerationString('mode'),
     *   layerCount: doc.getInteger('numberOfLayers')
     * };
     * ```
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Get navigator for a layer by name (case-insensitive)
     * 
     * @param layerName - Name of the layer to find
     * @returns ActionDescriptorNavigator for the named layer (sentinel if not found)
     * 
     * @example Best - Target specific layers
     * ```typescript
     * const titleLayer = ActionDescriptorNavigator.forLayerByName('Title');
     * const headerLayer = ActionDescriptorNavigator.forLayerByName('Header');
     * 
     * // Safe to chain immediately - sentinels propagate safely
     * const titleText = titleLayer.getObject('textKey').getString('textKey');
     * const headerFont = headerLayer.getObject('textKey')
     *   .getList('textStyleRange')
     *   .getFirstWhere(range => range.getInteger('from') === 0)
     *   .getObject('textStyle')
     *   .getString('fontPostScriptName');
     * 
     * // Check results without complex error handling
     * if (titleText !== SENTINELS.string) {
     *   console.log('Title:', titleText);
     * }
     * ```
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
     * Get navigator for a layer by index (1-based)
     * 
     * @param index - Layer index (1-based)
     * @returns ActionDescriptorNavigator for the indexed layer
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
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Create a sentinel navigator (represents failed operation)
     * 
     * @returns Sentinel navigator that safely returns sentinel values
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Get total number of layers in the current document
     * 
     * @returns Number of layers or -1 if failed
     */
    private static getLayerCount(): number {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e: any) {
            return -1;
        } finally {
            if (ref) ref = null;
        }
    }

    /**
     * Navigate to a child object within this descriptor
     * 
     * @param key - Property name using camelCase (e.g., 'textKey', 'textStyle')
     * @returns Navigator for the child object (sentinel if not found, never null)
     * 
     * @example Best - Deep navigation with caching
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Cache key navigators in const variables
     * const textObj = layer.getObject('textKey');
     * const warp = textObj.getObject('warp');
     * const transform = textObj.getObject('transform');
     * const bounds = textObj.getObject('bounds');
     * 
     * // Fast access from cached navigators
     * const warpStyle = warp.getEnumerationString('warpStyle');
     * const warpValue = warp.getDouble('warpValue');
     * const scaleX = transform.getDouble('xx');
     * const width = bounds.getUnitDouble('width');
     * ```
     * 
     * @example Good - Chaining without caching (slower but safe)
     * ```typescript
     * // Safe to chain deeply - never crashes
     * const fontName = layer.getObject('textKey')
     *   .getList('textStyleRange')
     *   .getFirstWhere(range => range.getInteger('from') === 0)
     *   .getObject('textStyle')
     *   .getString('fontPostScriptName');
     * ```
     * 
     * @example Incorrect - Wrong property names
     * ```typescript
     * // DON'T use XML display names
     * layer.getObject('Text')      // WRONG - should be 'textKey'
     * layer.getObject('TextStyle') // WRONG - should be 'textStyle'
     * layer.getObject('Color')     // WRONG - should be 'color'
     * ```
     */
    getObject(key: string): IActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionDescriptorNavigator.createSentinel();
            }
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to a list collection within this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns Navigator for the list (sentinel if not found, never null)
     * 
     * @example Best - List processing with caching
     * ```typescript
     * const textObj = layer.getObject('textKey');
     * 
     * // Cache list navigators
     * const styleRanges = textObj.getList('textStyleRange');
     * const paraRanges = textObj.getList('paragraphStyleRange');
     * 
     * // Process from cached lists
     * const allBoldRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * );
     * 
     * const alignments = paraRanges
     *   .select(para => para.getObject('paragraphStyle').getEnumerationString('alignment'))
     *   .toResultArray();
     * ```
     * 
     * @example Good - Direct chaining
     * ```typescript
     * // Safe to chain directly
     * const fontNames = layer.getObject('textKey')
     *   .getList('textStyleRange')
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .toResultArray();
     * ```
     */
    getList(key: string): IActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionListNavigator.createSentinel();
            }
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e: any) {
            return ActionListNavigator.createSentinel();
        }
    }

    /**
     * Extract string value from this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns String value or empty string ("") if failed (never null)
     * 
     * @example Best - String extraction with caching
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * const textStyle = layer.getObject('textKey')
     *   .getList('textStyleRange')
     *   .getFirstWhere(range => range.getInteger('from') === 0)
     *   .getObject('textStyle');
     * 
     * // Fast access from cached textStyle navigator
     * const fontName = textStyle.getString('fontPostScriptName');   // "ArialMT"
     * const familyName = textStyle.getString('fontName');           // "Arial"
     * const styleName = textStyle.getString('fontStyleName');       // "Bold"
     * 
     * // Safe to use without null checks
     * if (fontName !== SENTINELS.string) {
     *   console.log('Font:', fontName);
     * }
     * ```
     * 
     * @example Good - In chains
     * ```typescript
     * const layerName = layer.getString('name');
     * const blendMode = layer.getEnumerationString('mode');
     * ```
     * 
     * @example Straightforward - By itself
     * ```typescript
     * const docTitle = ActionDescriptorNavigator.forCurrentDocument().getString('title');
     * ```
     */
    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.string;
            }
            return this.desc.getString(typeID);
        } catch (e: any) {
            return SENTINELS.string;
        }
    }

    /**
     * Extract double/number value from this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value or -1 if failed (never null/NaN)
     * 
     * @example Best - Color extraction with caching
     * ```typescript
     * const color = textStyle.getObject('color');
     * 
     * // Fast access from cached color navigator
     * const red = color.getDouble('red');     // 255.0
     * const green = color.getDouble('green'); // 128.5
     * const blue = color.getDouble('blue');   // 0.0
     * 
     * // Safe to use in calculations (never NaN)
     * const brightness = (red + green + blue) / 3;
     * const hexColor = `#${Math.round(red).toString(16).padStart(2, '0')}${Math.round(green).toString(16).padStart(2, '0')}${Math.round(blue).toString(16).padStart(2, '0')}`;
     * ```
     * 
     * @example Good - Layer properties
     * ```typescript
     * const opacity = layer.getDouble('opacity');           // 255.0 = 100%
     * const hScale = textStyle.getDouble('horizontalScale'); // 150.0 = 150%
     * const warpValue = warp.getDouble('warpValue');         // 20.0
     * ```
     * 
     * @example Straightforward - In chains
     * ```typescript
     * const scaleX = layer.getObject('textKey').getObject('transform').getDouble('xx');
     * ```
     */
    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getDouble(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    /**
     * Extract unit double value (measurements with units)
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value in document units or -1 if failed
     * 
     * @example Best - Font size analysis with caching
     * ```typescript
     * const styleRanges = textObj.getList('textStyleRange');
     * 
     * // Extract all font sizes for analysis
     * const fontSizes = styleRanges
     *   .select(range => range.getObject('textStyle').getUnitDouble('sizeKey'))
     *   .whereMatches(size => size > 0)  // Filter valid sizes
     *   .toResultArray();
     * 
     * // Process raw values with your tolerance algorithms
     * const avgSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
     * ```
     * 
     * @example Good - Document dimensions
     * ```typescript
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * const width = doc.getUnitDouble('width');      // 1920.0
     * const height = doc.getUnitDouble('height');    // 1080.0
     * const resolution = doc.getUnitDouble('resolution'); // 72.0
     * ```
     * 
     * @example Straightforward - Single measurement
     * ```typescript
     * const fontSize = textStyle.getUnitDouble('sizeKey');
     * ```
     */
    getUnitDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getUnitDoubleValue(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    /**
     * Extract integer value from this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns Integer value or -1 if failed (never null)
     * 
     * @example Best - Range analysis with caching
     * ```typescript
     * const styleRanges = textObj.getList('textStyleRange');
     * 
     * // Get all character ranges for analysis
     * const rangeData = styleRanges
     *   .select(range => ({
     *     from: range.getInteger('from'),     // Character start
     *     to: range.getInteger('to'),         // Character end
     *     length: range.getInteger('to') - range.getInteger('from')
     *   }))
     *   .whereMatches(data => data.from >= 0 && data.to > data.from)
     *   .toResultArray();
     * ```
     * 
     * @example Good - Layer identification
     * ```typescript
     * const layerID = layer.getInteger('layerID');        // 142
     * const itemIndex = layer.getInteger('itemIndex');    // 33
     * const opacity = layer.getInteger('opacity');        // 255 = 100%
     * ```
     * 
     * @example Straightforward - Single value
     * ```typescript
     * const tracking = textStyle.getInteger('tracking');
     * ```
     */
    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getInteger(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    /**
     * Extract boolean value from this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns Boolean value or false if failed (never null)
     * 
     * @example Best - Style analysis with caching
     * ```typescript
     * const styleRanges = textObj.getList('textStyleRange');
     * 
     * // Analyze text formatting
     * const styleAnalysis = styleRanges
     *   .select(range => {
     *     const style = range.getObject('textStyle');
     *     return {
     *       bold: style.getBoolean('syntheticBold'),
     *       italic: style.getBoolean('syntheticItalic'),
     *       autoLeading: style.getBoolean('autoLeading'),
     *       ligatures: style.getBoolean('ligature')
     *     };
     *   })
     *   .toResultArray();
     * 
     * const hasBoldText = styleAnalysis.some(style => style.bold);
     * ```
     * 
     * @example Good - Layer state
     * ```typescript
     * const isVisible = layer.getBoolean('visible');
     * const isLocked = layer.getBoolean('protectAll');
     * const hasText = layer.hasKey('textKey');  // Use hasKey for existence
     * ```
     * 
     * @example Straightforward - Single check
     * ```typescript
     * const isBold = textStyle.getBoolean('syntheticBold');
     * ```
     */
    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.boolean;
            }
            return this.desc.getBoolean(typeID);
        } catch (e: any) {
            return SENTINELS.boolean;
        }
    }

    /**
     * Extract enumeration value as string from this descriptor
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration string or empty string ("") if failed
     * 
     * @example Best - Multi-property analysis with caching
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * 
     * const analysis = {
     *   // Layer enumerations
     *   blendMode: layer.getEnumerationString('mode'),           // "normal", "multiply"
     *   sectionType: layer.getEnumerationString('layerSection'), // "layerSectionContent"
     *   
     *   // Document enumerations
     *   colorMode: doc.getEnumerationString('mode'),             // "RGBColor", "CMYKColor"
     *   
     *   // Text enumerations
     *   warpStyle: layer.getObject('textKey').getObject('warp').getEnumerationString('warpStyle'),
     *   antiAlias: layer.getObject('textKey').getEnumerationString('antiAlias')
     * };
     * ```
     * 
     * @example Good - Text formatting
     * ```typescript
     * const fontCaps = textStyle.getEnumerationString('fontCaps');     // "normal", "smallCaps"
     * const autoKern = textStyle.getEnumerationString('autoKern');     // "metricsKern"
     * const alignment = paragraphStyle.getEnumerationString('alignment'); // "left", "center"
     * ```
     * 
     * @example Straightforward - Single enumeration
     * ```typescript
     * const blendMode = layer.getEnumerationString('mode');
     * ```
     */
    getEnumerationString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.enumerated;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.enumerated;
            }
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.enumerated;
        } catch (e: any) {
            return SENTINELS.enumerated;
        }
    }

    /**
     * Extract enumeration value as numeric ID
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration ID or -1 if failed
     */
    getEnumerationId(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getEnumerationValue(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    /**
     * Check if this descriptor contains the specified property
     * 
     * @param key - Property name to check
     * @returns true if property exists, false otherwise (never throws)
     * 
     * @example Best - Feature detection
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Detect layer capabilities without crashes
     * const capabilities = {
     *   hasText: layer.hasKey('textKey'),
     *   hasEffects: layer.hasKey('layerEffects'),
     *   hasAdjustment: layer.hasKey('adjustment'),
     *   hasMask: layer.hasKey('userMask')
     * };
     * 
     * if (capabilities.hasText) {
     *   // Safe to proceed with text operations
     *   const textContent = layer.getObject('textKey').getString('textKey');
     * }
     * ```
     * 
     * @example Good - Conditional processing
     * ```typescript
     * // Check before accessing optional properties
     * if (textStyle.hasKey('strokeColor')) {
     *   const strokeColor = textStyle.getObject('strokeColor');
     *   // Process stroke color
     * }
     * ```
     * 
     * @example Straightforward - Single check
     * ```typescript
     * const hasWarp = textObj.hasKey('warp');
     * ```
     */
    hasKey(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return false;
        }

        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID);
        } catch (e: any) {
            return false;
        }
    }

    /**
     * Extract bounds/rectangle information from this descriptor
     * 
     * @returns Bounds object with calculated width/height (sentinel values if failed)
     * 
     * @example Best - Layer size analysis
     * ```typescript
     * const layer = ActionDescriptorNavigator.forCurrentLayer();
     * const bounds = layer.getBounds();
     * 
     * // Safe to use without null checks (sentinels on failure)
     * if (bounds.width > 0 && bounds.height > 0) {
     *   const analysis = {
     *     position: { x: bounds.left, y: bounds.top },
     *     size: { width: bounds.width, height: bounds.height },
     *     center: { 
     *       x: bounds.left + bounds.width / 2, 
     *       y: bounds.top + bounds.height / 2 
     *     },
     *     area: bounds.width * bounds.height,
     *     aspectRatio: bounds.width / bounds.height,
     *     isLandscape: bounds.width > bounds.height,
     *     isSquare: Math.abs(bounds.width - bounds.height) < 1
     *   };
     * }
     * ```
     * 
     * @example Good - Multiple bounds comparison
     * ```typescript
     * const layerBounds = layer.getBounds();
     * const docBounds = ActionDescriptorNavigator.forCurrentDocument().getBounds();
     * 
     * if (layerBounds.width > 0 && docBounds.width > 0) {
     *   const isOffCanvas = layerBounds.right < 0 || layerBounds.left > docBounds.width;
     *   const fillsWidth = layerBounds.width >= docBounds.width * 0.9;
     * }
     * ```
     * 
     * @example Straightforward - Quick size check
     * ```typescript
     * const bounds = layer.getBounds();
     * const isLarge = bounds.width > 500 || bounds.height > 500;
     * ```
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
            const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID('left'));
            const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID('top'));
            const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID('right'));
            const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID('bottom'));

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };
        } catch (e: any) {
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
     * Transform this descriptor using a custom selector function
     * 
     * @param selector - Function to transform the descriptor
     * @returns Transformed result or null if failed
     * 
     * @example Good - Custom data extraction
     * ```typescript
     * const customData = layer.select(layer => {
     *   if (!layer.hasKey('textKey')) return null;
     *   
     *   const textObj = layer.getObject('textKey');
     *   const styleRanges = textObj.getList('textStyleRange');
     *   
     *   return {
     *     hasText: true,
     *     rangeCount: styleRanges.getCount(),
     *     firstFont: styleRanges.getFirstWhere(range => range.getInteger('from') === 0)
     *       .getObject('textStyle')
     *       .getString('fontPostScriptName')
     *   };
     * });
     * ```
     */
    select<T>(selector: SelectorFunction<T>): T | null {
        if (this.isSentinel) {
            return null;
        }

        try {
            return selector(this);
        } catch (e: any) {
            return null;
        }
    }

    /**
     * Add debug information without breaking the chain
     * 
     * @param label - Debug label
     * @returns Same navigator for continued chaining
     * 
     * @example Good - Debug complex chains
     * ```typescript
     * const result = layer
     *   .debug('Starting with layer')
     *   .getObject('textKey')
     *   .debug('Got text object')
     *   .getList('textStyleRange')
     *   .debug('Got style ranges')
     *   .getAllWhere(range => range.getInteger('from') === 0)
     *   .debug('Filtered to first ranges');
     * ```
     */
    debug(label: string): IActionDescriptorNavigator {
        try {
            $.writeln(label + ': ' + (this.isSentinel ? 'SENTINEL' : 'OK'));
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }

    // Additional methods for completeness (less commonly used)
    getData(key: string): string { return this.getStringValue(key, 'getData'); }
    getClass(key: string): number { return this.getIntegerValue(key, 'getClass'); }
    getLargeInteger(key: string): number { return this.getIntegerValue(key, 'getLargeInteger'); }
    getObjectType(key: string): number { return this.getIntegerValue(key, 'getObjectType'); }
    getUnitDoubleType(key: string): number { return this.getIntegerValue(key, 'getUnitDoubleType'); }
    getUnitDoubleValue(key: string): number { return this.getDoubleValue(key, 'getUnitDoubleValue'); }
    getEnumerationType(key: string): number { return this.getIntegerValue(key, 'getEnumerationType'); }
    getType(key: string): number { return this.getIntegerValue(key, 'getType'); }

    getPath(key: string): File | null {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return null;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? this.desc.getPath(typeID) : null;
        } catch (e: any) { return null; }
    }

    getReference(key: string): ActionReference | null {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return null;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? this.desc.getReference(typeID) : null;
        } catch (e: any) { return null; }
    }

    // Helper methods to reduce duplication
    private getStringValue(key: string, methodName: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.string;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.string;
        } catch (e: any) { return SENTINELS.string; }
    }

    private getIntegerValue(key: string, methodName: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.integer;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.integer;
        } catch (e: any) { return SENTINELS.integer; }
    }

    private getDoubleValue(key: string, methodName: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.double;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.double;
        } catch (e: any) { return SENTINELS.double; }
    }
}

/**
 * Navigator for ActionList collections with simple, composable methods.
 * No complex lazy evaluation - just clean, chainable operations.
 * 
 * @example Best - Complete list processing workflow
 * ```typescript
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // Get ALL bold ranges for analysis (preferred for analysis)
 * const allBoldRanges = styleRanges.getAllWhere(range => 
 *   range.getObject('textStyle').getBoolean('syntheticBold')
 * );
 * 
 * // Extract raw data for tolerance algorithms
 * const rawData = allBoldRanges.map(range => {
 *   const style = range.getObject('textStyle');
 *   return {
 *     fontSize: style.getUnitDouble('sizeKey'),
 *     fontName: style.getString('fontPostScriptName')
 *   };
 * });
 * ```
 */
export class ActionListNavigator implements IActionListNavigator {
    public readonly isSentinel: boolean;
    private list: ActionList | null;

    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get the number of items in this list
     * 
     * @returns Item count or -1 if failed
     * 
     * @example Straightforward - Count validation
     * ```typescript
     * const styleRanges = textObj.getList('textStyleRange');
     * const count = styleRanges.getCount();
     * 
     * if (count > 0) {
     *   console.log(`Found ${count} text style ranges`);
     * }
     * ```
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch (e: any) {
            return -1;
        }
    }

    /**
     * Get item at specific index (use only when index is known to be valid)
     * 
     * @param index - Zero-based index
     * @returns Navigator for the item (sentinel if out of bounds)
     * 
     * @example Straightforward - When you know the index
     * ```typescript
     * const firstRange = styleRanges.getObject(0);
     * const lastRange = styleRanges.getObject(styleRanges.getCount() - 1);
     * ```
     * 
     * @example Better - Use criteria-based methods instead
     * ```typescript
     * // PREFER these over getObject(index):
     * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
     * const lastRange = styleRanges.getAllWhere(range => range.getInteger('from') >= 0).pop();
     * ```
     */
    getObject(index: number): IActionDescriptorNavigator {
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
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Find first item matching criteria (GOOD for single results)
     * 
     * @param predicate - Function to test each item
     * @returns First matching item (sentinel if none found)
     * 
     * @example Best - Find specific ranges
     * ```typescript
     * // Find first character range (typically from=0)
     * const firstRange = styleRanges.getFirstWhere(range => 
     *   range.getInteger('from') === 0
     * );
     * 
     * // Find first bold text range
     * const boldRange = styleRanges.getFirstWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * );
     * 
     * // Find first large font
     * const largeRange = styleRanges.getFirstWhere(range => 
     *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
     * );
     * 
     * // Safe to chain immediately
     * const fontName = boldRange.getObject('textStyle').getString('fontPostScriptName');
     * ```
     * 
     * @example Good - Layer finding
     * ```typescript
     * const visibleLayer = layers.getFirstWhere(layer => 
     *   layer.getBoolean('visible')
     * );
     * 
     * const textLayer = layers.getFirstWhere(layer => 
     *   layer.hasKey('textKey')
     * );
     * ```
     */
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        if (this.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const count = this.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                if (predicate(item)) {
                    return item;
                }
            } catch (e: any) {
                continue;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Find exactly one item matching criteria (errors if 0 or multiple found)
     * 
     * @param predicate - Function to test each item
     * @returns The single matching item (sentinel if 0 or multiple found)
     * 
     * @example Good - When expecting exactly one result
     * ```typescript
     * // Find the one range with specific font (expecting exactly one)
     * const titleRange = styleRanges.getSingleWhere(range => 
     *   range.getObject('textStyle').getString('fontPostScriptName') === 'Arial-BoldMT'
     * );
     * 
     * if (!titleRange.isSentinel) {
     *   console.log('Found unique title range');
     * } else {
     *   console.log('ERROR: Expected exactly one title range');
     * }
     * ```
     */
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const matches = this.getAllWhere(predicate);
        if (matches.length === 0) {
            try {
                $.writeln('WARNING: getSingleWhere() - No objects matched criteria');
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        if (matches.length > 1) {
            try {
                $.writeln('WARNING: getSingleWhere() - Multiple objects matched (' + matches.length + '), expected exactly one');
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        return matches[0];
    }

    /**
     * Find ALL items matching criteria (BEST for analysis) - returns array directly
     * 
     * @param predicate - Function to test each item
     * @returns Array of all matching items (empty array if none found)
     * 
     * @example Best - Complete analysis workflow
     * ```typescript
     * // Get ALL bold text ranges for comprehensive analysis
     * const allBoldRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * );
     * 
     * console.log(`Found ${allBoldRanges.length} bold ranges`);
     * 
     * // Extract raw target values for algorithmic processing
     * const boldRangeData = allBoldRanges.map(range => {
     *   const style = range.getObject('textStyle');
     *   const color = style.getObject('color');
     *   return {
     *     // Raw values for tolerance algorithms
     *     from: range.getInteger('from'),
     *     to: range.getInteger('to'),
     *     fontSize: style.getUnitDouble('sizeKey'),    // Exact size
     *     tracking: style.getInteger('tracking'),      // Raw tracking
     *     red: color.getDouble('red'),                 // Raw RGB
     *     green: color.getDouble('green'),
     *     blue: color.getDouble('blue'),
     *     fontName: style.getString('fontPostScriptName')
     *   };
     * });
     * 
     * // Apply your tolerance algorithms to raw boldRangeData
     * ```
     * 
     * @example Good - Multi-condition analysis
     * ```typescript
     * // Get ALL ranges with large fonts
     * const largeTextRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
     * );
     * 
     * // Get ALL Arial font ranges
     * const arialRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getString('fontPostScriptName').includes('Arial')
     * );
     * 
     * // Get ALL visible layers
     * const visibleLayers = layers.getAllWhere(layer => 
     *   layer.getBoolean('visible')
     * );
     * ```
     * 
     * @example Better - vs verbose chaining
     * ```typescript
     * // OLD verbose way:
     * const results1 = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .toResultArray();
     * 
     * // NEW direct way:
     * const results2 = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * );
     * ```
     */
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[] {
        if (this.isSentinel) {
            return [];
        }

        const results: IActionDescriptorNavigator[] = [];
        const count = this.getCount();

        if (count <= 0) {
            return results;
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                if (predicate(item)) {
                    results.push(item);
                }
            } catch (e: any) {
                // Skip items that cause predicate errors
                continue;
            }
        }

        return results;
    }

    /**
     * Filter items by criteria (returns chainable collection for complex pipelines)
     * 
     * @param predicate - Function to test each item
     * @returns Chainable enumerable for further filtering/transformation
     * 
     * @example Best - Complex multi-stage filtering (when you need multiple filters)
     * ```typescript
     * const complexResults = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .whereMatches(range => range.getInteger('to') > range.getInteger('from'))
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 12)
     *   .select(range => {
     *     const style = range.getObject('textStyle');
     *     return {
     *       from: range.getInteger('from'),
     *       to: range.getInteger('to'),
     *       fontName: style.getString('fontPostScriptName'),
     *       fontSize: style.getUnitDouble('sizeKey')
     *     };
     *   })
     *   .whereMatches(item => item.fontName !== SENTINELS.string)
     *   .toResultArray();
     * ```
     * 
     * @example Good - When to use vs getAllWhere
     * ```typescript
     * // Use whereMatches() for complex pipelines:
     * const processed = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)    // Filter step 1
     *   .whereMatches(range => someComplexCheck(range))          // Filter step 2  
     *   .select(range => transformData(range))                   // Transform step
     *   .whereMatches(item => item.isValid)                     // Filter transformed
     *   .toResultArray();                                        // Get final results
     * 
     * // Use getAllWhere() for simple "get all that match":
     * const simple = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * ); // Direct array result
     * ```
     */
    whereMatches(predicate: PredicateFunction): IEnumerable {
        const items = this.getAllWhere(predicate);
        return new SimpleEnumerable(items);
    }

    /**
     * Transform items using selector function (returns chainable array)
     * 
     * @param transformer - Function to transform each item
     * @returns Chainable enumerable array for further operations
     * 
     * @example Best - Data extraction and transformation
     * ```typescript
     * // Extract font data for analysis
     * const fontData = styleRanges.select(range => {
     *   const style = range.getObject('textStyle');
     *   const color = style.getObject('color');
     *   
     *   return {
     *     // Raw target values for algorithms
     *     fontName: style.getString('fontPostScriptName'),
     *     fontSize: style.getUnitDouble('sizeKey'),
     *     bold: style.getBoolean('syntheticBold'),
     *     red: color.getDouble('red'),
     *     green: color.getDouble('green'),
     *     blue: color.getDouble('blue')
     *   };
     * });
     * 
     * // Continue processing
     * const validFonts = fontData
     *   .whereMatches(font => font.fontName !== SENTINELS.string)
     *   .whereMatches(font => font.fontSize > 0)
     *   .toResultArray();
     * ```
     * 
     * @example Good - Simple property extraction
     * ```typescript
     * // Extract just font names
     * const fontNames = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .toResultArray();
     * 
     * // Extract layer names
     * const layerNames = layers
     *   .select(layer => layer.getString('name'))
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        if (this.isSentinel) {
            return new SimpleEnumerableArray([]);
        }

        const results: T[] = [];
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                const transformed = transformer(item);
                if (transformed !== null && transformed !== undefined) {
                    results.push(transformed);
                }
            } catch (e: any) {
                // Skip items that cause transformation errors
                continue;
            }
        }

        return new SimpleEnumerableArray(results);
    }

    /**
     * Convert to enumerable for complex operations (usually not needed)
     * 
     * @returns Enumerable wrapper for advanced operations
     */
    asEnumerable(): IEnumerable {
        const items = this.getAllWhere(() => true); // Get all items
        return new SimpleEnumerable(items);
    }

    /**
     * Add debug information without breaking the chain
     * 
     * @param label - Debug label
     * @returns Same navigator for continued chaining
     */
    debug(label: string): IActionListNavigator {
        try {
            const count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL' : count + ' items'));
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}