/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Trimmed version focused on direct navigation and essential value extraction
 * Optimized for scoring scripts with clear, debuggable patterns
 */
import "./extendscript-polyfills.js";
import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID, typeIDToStringID } from "./ps";
import { ValueType, SentinelValue, SentinelValueMap, ValueTransformer, ComparisonOptions } from "./types";

/**
 * Core navigation class for ActionDescriptor structures
 * Provides direct, debuggable navigation with consistent error handling
 * 
 * @example
 * ```typescript
 * // Find a specific layer and extract properties
 * const targetLayer = ActionDescriptorNavigator.forLayerByName("TargetTest");
 * const layerName = targetLayer.getStringValue('name');
 * const opacity = targetLayer.getDoubleValue('opacity');
 * 
 * // Navigate to text properties
 * const textObj = targetLayer.object('textKey');
 * const warpObj = textObj.object('warp');
 * const warpStyle = warpObj.getEnumeratedString('warpStyle');
 * ```
 */
class ActionDescriptorNavigator {
    private readonly desc: ActionDescriptor | null;
    private readonly isSentinel: boolean;

    // Static sentinel constants for performance
    private static readonly SENTINELS: SentinelValueMap = {
        "string": "",
        "enumerated": "",
        "integer": -1,
        "double": -1,
        "boolean": false
    } as const;

    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    /**
     * Create navigator from ActionReference
     * 
     * @param ref - ActionReference to navigate from
     * @returns Navigator instance or sentinel if reference is invalid
     * 
     * @example
     * ```typescript
     * const ref = new ActionReference();
     * ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
     * const nav = ActionDescriptorNavigator.from(ref);
     * const name = nav.getStringValue('name');
     * ```
     */
    static from(ref: ActionReference): ActionDescriptorNavigator {
        try {
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create navigator for current layer
     * 
     * @returns Navigator for the currently active layer
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * const name = layerNav.getStringValue('name');
     * const visible = layerNav.getBooleanValue('visible');
     * const opacity = layerNav.getDoubleValue('opacity');
     * ```
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            ref = null;
        }
    }

    /**
     * Create navigator for current document
     * 
     * @returns Navigator for the currently active document
     * 
     * @example
     * ```typescript
     * const docNav = ActionDescriptorNavigator.forCurrentDocument();
     * const width = docNav.getDoubleValue('width');
     * const height = docNav.getDoubleValue('height');
     * const colorMode = docNav.getEnumeratedString('mode');
     * ```
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            ref = null;
        }
    }

    /**
     * Create navigator for layer by index (1-based)
     * 
     * @param index - Layer index (1-based, where 1 is the bottom layer)
     * @returns Navigator for the specified layer or sentinel if invalid
     * 
     * @example
     * ```typescript
     * const thirdLayer = ActionDescriptorNavigator.forLayerByIndex(3);
     * const layerName = thirdLayer.getStringValue('name');
     * const bounds = thirdLayer.getBounds();
     * ```
     */
    static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            ref = null;
        }
    }

    /**
     * Create navigator for layer by exact name (case-insensitive, leading/trailing spaces ignored)
     * 
     * @param layerName - Layer name to find (exact match after case/trim normalization)
     * @returns Navigator for the matching layer or sentinel if not found
     * 
     * @example
     * ```typescript
     * // Find layer by name for scoring
     * const targetLayer = ActionDescriptorNavigator.forLayerByName("TargetTest");
     * const textNav = targetLayer.object('textKey');
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Case-insensitive matching
     * const headerLayer = ActionDescriptorNavigator.forLayerByName("HEADER");
     * 
     * // Safe - returns sentinel if layer not found
     * const missingLayer = ActionDescriptorNavigator.forLayerByName("NonExistent");
     * const safeName = missingLayer.getStringValue('name'); // Returns ""
     * ```
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.trim().length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
            const searchName = layerName.toLowerCase().trim();

            for (let i = 0; i < layerNames.length; i++) {
                const currentName = layerNames[i].toLowerCase().trim();
                if (currentName === searchName) {
                    return ActionDescriptorNavigator.forLayerByIndex(i + 1);
                }
            }

            return ActionDescriptorNavigator.createSentinel();
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create sentinel navigator that always returns sentinel values
     * 
     * @returns Sentinel navigator instance
     * 
     * @example
     * ```typescript
     * const sentinel = ActionDescriptorNavigator.createSentinel();
     * const value = sentinel.getStringValue('anyKey'); // Always returns ""
     * ```
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Get sentinel value based on type
     * 
     * @param type - Value type to get sentinel for
     * @returns Appropriate sentinel value for the type
     * 
     * @example
     * ```typescript
     * const stringSentinel = ActionDescriptorNavigator.getSentinelValue('string'); // ""
     * const numberSentinel = ActionDescriptorNavigator.getSentinelValue('double'); // -1
     * const boolSentinel = ActionDescriptorNavigator.getSentinelValue('boolean'); // false
     * ```
     */
    static getSentinelValue<T extends ValueType>(type: T): SentinelValue<T> {
        switch (type) {
            case 'string':
            case 'enumerated':
                return "" as SentinelValue<T>;
            case 'integer':
            case 'double':
                return -1 as SentinelValue<T>;
            case 'boolean':
                return false as SentinelValue<T>;
            default:
                const _exhaustive: never = type;
                throw new Error(`Invalid value type: ${type}`);
        }
    }

    /**
     * Get layer count in document
     * 
     * @returns Number of layers in the document or -1 if error
     * 
     * @example
     * ```typescript
     * const layerCount = ActionDescriptorNavigator.getLayerCount();
     * if (layerCount > 0) {
     *   console.log(`Document has ${layerCount} layers`);
     * }
     * ```
     */
    static getLayerCount(): number {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch {
            return -1;
        } finally {
            ref = null;
        }
    }

    /**
     * Extract all layer names in document
     * 
     * @returns Array of all layer names in the document
     * 
     * @example
     * ```typescript
     * const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
     * console.log('All layers:', layerNames);
     * 
     * // Find specific layers
     * const hasBackground = layerNames.some(name => 
     *   name.toLowerCase().includes('background')
     * );
     * ```
     */
    static extractAllLayerNames(): readonly string[] {
        try {
            const layerCount = ActionDescriptorNavigator.getLayerCount();
            if (layerCount <= 0) return [];

            const results: string[] = [];
            for (let i = 1; i <= layerCount; i++) {
                try {
                    const layerNav = ActionDescriptorNavigator.forLayerByIndex(i);
                    const name = layerNav.getStringValue('name');
                    results.push(name);
                } catch {
                    results.push("");
                }
            }
            return results;
        } catch {
            return [];
        }
    }

    /**
     * Navigate to nested object property
     * 
     * @param key - Property key to navigate to
     * @returns New navigator for the nested object or sentinel
     * 
     * @example
     * ```typescript
     * const textNav = layerNav.object('textKey');
     * const warpNav = textNav.object('warp');
     * const boundsNav = layerNav.object('bounds');
     * const colorNav = textStyle.object('color');
     * ```
     */
    object(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to list property
     * 
     * @param key - List property key to navigate to
     * @returns ActionListNavigator for the list or sentinel
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * const firstStyle = styleList.getObject(0);
     * 
     * // Search for specific text style
     * const arialStyle = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial');
     * ```
     */
    list(key: string): ActionListNavigator {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionListNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch {
            return ActionListNavigator.createSentinel();
        }
    }

    /**
     * Get value with optional transformation
     * 
     * @param key - Property key to extract
     * @param type - Expected value type
     * @param options - Optional transformation and default value options
     * @returns Extracted value or sentinel/default
     * 
     * @example
     * ```typescript
     * const name = layerNav.getValue('name', 'string');
     * const opacity = layerNav.getValue('opacity', 'double');
     * 
     * // With transformation
     * const roundedOpacity = layerNav.getValue('opacity', 'double', {
     *   transformer: val => Math.round(val)
     * });
     * ```
     */
    getValue<T = any>(
        key: string,
        type: ValueType,
        options?: ComparisonOptions
    ): T {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }

        try {
            const value = this.extractByType(typeID, type);

            if (options?.transformer) {
                try {
                    return options.transformer(value) as T;
                } catch {
                    return (options.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
                }
            }

            return value as T;
        } catch {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }
    }

    /**
     * Get string value
     * 
     * @param key - Property key to extract
     * @returns String value or empty string if missing/error
     * 
     * @example
     * ```typescript
     * const layerName = layerNav.getStringValue('name');
     * const fontName = textStyle.getStringValue('fontName');
     * const textContent = textNav.getStringValue('text');
     * ```
     */
    getStringValue(key: string): string {
        return this.getValue(key, 'string');
    }

    /**
     * Get numeric double value
     * 
     * @param key - Property key to extract
     * @returns Double value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const opacity = layerNav.getDoubleValue('opacity');
     * const tracking = textStyle.getDoubleValue('tracking');
     * const horizontalScale = textStyle.getDoubleValue('horizontalScale');
     * const redValue = colorObj.getDoubleValue('red');
     * ```
     */
    getDoubleValue(key: string): number {
        return this.getValue(key, 'double');
    }

    /**
     * Get integer value
     * 
     * @param key - Property key to extract
     * @returns Integer value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const layerID = layerNav.getIntegerValue('layerID');
     * const itemIndex = layerNav.getIntegerValue('itemIndex');
     * const layerCount = docNav.getIntegerValue('numberOfLayers');
     * ```
     */
    getIntegerValue(key: string): number {
        return this.getValue(key, 'integer');
    }

    /**
     * Get boolean value
     * 
     * @param key - Property key to extract
     * @returns Boolean value or false if missing/error
     * 
     * @example
     * ```typescript
     * const isVisible = layerNav.getBooleanValue('visible');
     * const isLocked = layerNav.getBooleanValue('preserveTransparency');
     * const isBold = textStyle.getBooleanValue('syntheticBold');
     * const hasEffects = layerNav.getBooleanValue('layerFXVisible');
     * ```
     */
    getBooleanValue(key: string): boolean {
        return this.getValue(key, 'boolean');
    }

    /**
     * Get unit double value (for sizes, distances, measurements)
     * 
     * @param key - Property key to extract
     * @returns Unit double value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const fontSize = textStyle.getUnitDoubleValue('sizeKey');
     * const impliedSize = textStyle.getUnitDoubleValue('impliedFontSize');
     * const docWidth = docNav.getUnitDoubleValue('width');
     * const leftBound = bounds.getUnitDoubleValue('left');
     * ```
     */
    getUnitDoubleValue(key: string): number {
        return this.getValue(key, 'double');
    }

    /**
     * Get enumerated value as human-readable string
     * 
     * @param key - Property key to extract enumerated value from
     * @returns Human-readable enumerated string or "" if not found
     * 
     * @example
     * ```typescript
     * const warpStyle = warpObj.getEnumeratedString('warpStyle');
     * const autoKern = textStyle.getEnumeratedString('autoKern');
     * const fontCaps = textStyle.getEnumeratedString('fontCaps');
     * const blendMode = layerNav.getEnumeratedString('mode');
     * ```
     */
    getEnumeratedString(key: string): string {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }

        try {
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || ActionDescriptorNavigator.getSentinelValue('enumerated');
        } catch {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }
    }

    /**
     * Extract value by type using direct ActionDescriptor methods
     * 
     * @param typeID - Photoshop type ID for the property
     * @param type - Expected value type
     * @returns Extracted value or sentinel value for failed extractions
     */
    extractByType(typeID: number, type: ValueType): any {
        if (this.isSentinel || !this.desc || !this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.getSentinelValue(type);
        }

        try {
            switch (type) {
                case 'string':
                    return this.desc.getString(typeID);
                case 'integer':
                    return this.desc.getInteger(typeID);
                case 'double':
                    return this.desc.getDouble(typeID);
                case 'boolean':
                    return this.desc.getBoolean(typeID);
                case 'enumerated':
                    try {
                        return this.desc.getString(typeID);
                    } catch {
                        return "";
                    }
                default:
                    const _exhaustive: never = type;
                    throw new Error(`Unsupported type: ${type}`);
            }
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(type);
        }
    }

    /**
     * Check if key exists
     * 
     * @param key - Property key to check
     * @returns True if key exists, false otherwise
     * 
     * @example
     * ```typescript
     * if (layerNav.hasKey('textKey')) {
     *   const textNav = layerNav.object('textKey');
     *   // Process text layer
     * }
     * 
     * if (textStyle.hasKey('fontName')) {
     *   const font = textStyle.getStringValue('fontName');
     * }
     * ```
     */
    hasKey(key: string): boolean {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return false;
        }
        try {
            return this.desc.hasKey(stringIDToTypeID(key));
        } catch {
            return false;
        }
    }

    /**
     * Get bounds object with calculated dimensions
     * 
     * @returns Bounds object with left, top, right, bottom, width, height
     * 
     * @example
     * ```typescript
     * const bounds = layerNav.getBounds();
     * console.log(`Layer size: ${bounds.width}x${bounds.height}`);
     * console.log(`Position: ${bounds.left},${bounds.top}`);
     * 
     * // Check if bounds are valid
     * if (bounds.left !== -1 && bounds.width > 0) {
     *   // Process valid bounds
     * }
     * ```
     */
    getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
        if (this.isSentinel || !this.desc) {
            return { left: -1, top: -1, right: -1, bottom: -1, width: -1, height: -1 };
        }

        try {
            const boundsDesc = this.desc.getObjectValue(stringIDToTypeID('bounds'));
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
        } catch {
            return { left: -1, top: -1, right: -1, bottom: -1, width: -1, height: -1 };
        }
    }

    /**
     * Extract value from descriptor using dot-separated path
     * 
     * @param subPath - Dot-separated path to the value
     * @param valueType - Type of value to extract
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * const fontSize = layerNav.extractValueFromDescriptor('textStyle.sizeKey', 'double');
     * const fontName = layerNav.extractValueFromDescriptor('textStyle.fontName', 'string');
     * ```
     */
    extractValueFromDescriptor(subPath: string, valueType: ValueType): any {
        if (this.isSentinel || !this.desc || !this.validatePath(subPath)) {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }

        const pathParts = subPath.split('.').filter(Boolean);

        if (pathParts.length === 1) {
            const typeID = stringIDToTypeID(pathParts[0]);
            return this.extractByType(typeID, valueType);
        }

        try {
            const finalDesc = pathParts.slice(0, -1).reduce((current, part) => {
                const typeID = stringIDToTypeID(part);
                if (!current.hasKey(typeID)) {
                    throw new Error(`Property '${part}' not found`);
                }
                return current.getObjectValue(typeID);
            }, this.desc);

            const finalPart = pathParts[pathParts.length - 1];
            const typeID = stringIDToTypeID(finalPart);

            if (!finalDesc.hasKey(typeID)) {
                return ActionDescriptorNavigator.getSentinelValue(valueType);
            }

            const navigator = new ActionDescriptorNavigator(finalDesc);
            return navigator.extractByType(typeID, valueType);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }
    }

    /**
     * Validate key input
     */
    private validateKey(key: string): boolean {
        return key !== null && key !== undefined && key.trim().length > 0;
    }

    /**
     * Validate path input
     */
    private validatePath(path: string): boolean {
        return path !== null && path !== undefined && path.trim().length > 0;
    }
}

/**
 * Navigator for ActionList objects with search and iteration capabilities
 * 
 * @example
 * ```typescript
 * const styleList = textNav.list('textStyleRange');
 * const count = styleList.getCount();
 * 
 * // Find specific text style by font
 * const arialStyle = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial');
 * const fontSize = arialStyle.object('textStyle').getUnitDoubleValue('sizeKey');
 * 
 * // Iterate through all styles
 * for (let i = 0; i < count; i++) {
 *   const style = styleList.getObject(i);
 *   const font = style.object('textStyle').getStringValue('fontName');
 * }
 * ```
 */
class ActionListNavigator {
    private readonly list: ActionList | null;
    private readonly isSentinel: boolean;

    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    /**
     * Create sentinel list navigator
     * 
     * @returns Sentinel list navigator instance
     */
    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get count of items in the list
     * 
     * @returns Number of items in the list or -1 if sentinel/error
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * 
     * if (count > 0) {
     *   for (let i = 0; i < count; i++) {
     *     const item = styleList.getObject(i);
     *   }
     * }
     * ```
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch {
            return -1;
        }
    }

    /**
     * Get object at specific index
     * 
     * @param index - Zero-based index of the item to retrieve
     * @returns Navigator for the list item or sentinel if out of bounds
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const firstStyle = styleList.getObject(0);
     * const secondStyle = styleList.getObject(1);
     * 
     * // Extract properties from style
     * const textStyle = firstStyle.object('textStyle');
     * const fontSize = textStyle.getUnitDoubleValue('sizeKey');
     * const fontName = textStyle.getStringValue('fontName');
     * ```
     */
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
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get all values from list items
     * 
     * @param key - Property key to extract from each list item
     * @param type - Value type to extract
     * @param options - Optional transformation and default value options
     * @returns Array of extracted values
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Get all font sizes from text styles
     * const fontSizes = styleList.getAllValues('sizeKey', 'double');
     * console.log('Font sizes:', fontSizes);
     * 
     * // Get all font names
     * const fontNames = styleList.getAllValues('fontName', 'string');
     * console.log('Font names:', fontNames);
     * ```
     */
    getAllValues<T = any>(
        key: string,
        type: ValueType,
        options?: ComparisonOptions
    ): readonly T[] {
        if (this.isSentinel || !this.list) {
            return [];
        }

        const results: T[] = [];
        const listCount = this.getCount();

        if (listCount <= 0) {
            return [];
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const value = obj.getValue<T>(key, type, options);
                results.push(value);
            } catch {
                const fallback = (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
                results.push(fallback);
            }
        }
        return results;
    }

    /**
     * Find first value that matches condition
     * 
     * @param key - Property key to extract from each list item
     * @param type - Value type to extract
     * @param predicate - Function to test each value
     * @param options - Optional transformation and default value options
     * @returns First matching value or sentinel
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find first font size larger than 20
     * const largeFontSize = styleList.findValue('sizeKey', 'double', size => size > 20);
     * 
     * // Find Arial font
     * const arialFont = styleList.findValue('fontName', 'string', name => 
     *   name.includes('Arial')
     * );
     * ```
     */
    findValue<T = any>(
        key: string,
        type: ValueType,
        predicate: (value: T) => boolean,
        options?: ComparisonOptions
    ): T {
        if (this.isSentinel || !this.list || !predicate) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const value = obj.getValue<T>(key, type, options);
                if (predicate(value)) {
                    return value;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return ActionDescriptorNavigator.getSentinelValue(type) as T;
    }

    /**
     * Find index of first item where property matches value
     * 
     * @param key - Property key to search in each list item
     * @param value - Value to find (supports partial string matching)
     * @returns Zero-based index of matching item or -1 if not found
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find Arial font index
     * const arialIndex = styleList.findIndex('fontName', 'Arial');
     * 
     * // Find by numeric value
     * const size24Index = styleList.findIndex('sizeKey', 24);
     * ```
     */
    findIndex(key: string, value: any): number {
        if (this.isSentinel || !this.list || !key) {
            return -1;
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return -1;
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const itemValue = obj.getValue(key, typeof value === 'string' ? 'string' : 'double');

                if (typeof value === 'string' && typeof itemValue === 'string') {
                    if (itemValue.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        return i;
                    }
                } else if (itemValue === value) {
                    return i;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return -1;
    }

    /**
     * Find object navigator for first item where property matches value
     * 
     * @param key - Property key to search in each list item
     * @param value - Value to find (supports partial string matching)
     * @returns Navigator for matching object or sentinel navigator
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find text style range by font name
     * const arialStyleRange = styleList.findObjectBy('fontName', 'Arial');
     * const textStyle = arialStyleRange.object('textStyle');
     * const fontSize = textStyle.getUnitDoubleValue('sizeKey');
     * ```
     */
    findObjectBy(key: string, value: any): ActionDescriptorNavigator {
        const index = this.findIndex(key, value);
        if (index >= 0) {
            return this.getObject(index);
        }
        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Get value at specific index without navigating to object first
     * 
     * @param index - Zero-based index in the list
     * @param key - Property key to extract from the object at index
     * @param type - Value type to extract
     * @returns Extracted value or sentinel value if index/key invalid
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Get font name at specific index
     * const firstFont = styleList.getValueAt(0, 'fontName', 'string');
     * const secondFont = styleList.getValueAt(1, 'fontName', 'string');
     * 
     * // Safe - returns sentinel if index out of bounds
     * const safeFont = styleList.getValueAt(999, 'fontName', 'string'); // Returns ""
     * ```
     */
    getValueAt<T = any>(index: number, key: string, type: ValueType): T {
        if (this.isSentinel || !this.list || index < 0 || !key) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        try {
            const obj = this.getObject(index);
            return obj.getValue<T>(key, type);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }
    }

    /**
     * Find list object where a nested property matches a value
     * Essential for finding text styles by font properties
     * 
     * @param nestedObjectKey - Key to navigate to nested object within each list item
     * @param propertyKey - Property key to check within the nested object
     * @param searchValue - Value to search for (case-insensitive, partial match)
     * @returns Navigator for matching list item or sentinel if not found
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find TextStyleRange where textStyle.fontName contains 'Arial'
     * const arialStyleRange = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial');
     * const arialTextStyle = arialStyleRange.object('textStyle');
     * const fontSize = arialTextStyle.getUnitDoubleValue('sizeKey');
     * 
     * // Find by font size
     * const largeStyleRange = styleList.findObjectWhereNested('textStyle', 'sizeKey', 24);
     * ```
     */
    findObjectWhereNested(nestedObjectKey: string, propertyKey: string, searchValue: any): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || !nestedObjectKey || !propertyKey) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const listItem = this.getObject(i);
                const nestedObject = listItem.object(nestedObjectKey);

                if (!listItem.hasKey(nestedObjectKey)) {
                    continue;
                }

                const propertyValue = nestedObject.getValue(propertyKey, typeof searchValue === 'string' ? 'string' : 'double');

                if (typeof searchValue === 'string' && typeof propertyValue === 'string') {
                    if (propertyValue.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0) {
                        return listItem;
                    }
                } else if (propertyValue === searchValue) {
                    return listItem;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }
}

export { ActionDescriptorNavigator, ActionListNavigator };