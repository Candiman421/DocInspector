/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Provides imperative-style navigation and tuple extraction capabilities
 * Optimized with consistent error handling and ES3 transpilation compatibility
 */

import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID } from "./ps";
import { ValueType, SentinelValue, SentinelValueMap, ValueTransformer, ComparisonOptions } from "./types";

/**
 * Core navigation class for ActionDescriptor structures
 * Fixed: ExtendScript compatibility, memory management, sentinel handling, ES3 transpilation compatibility
 * 
 * @example
 * ```typescript
 * // Create navigator for current layer
 * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
 * const layerName = layerNav.getValue('name', 'string'); // Returns "" if missing
 * const opacity = layerNav.getValue('opacity', 'double'); // Returns -1 if missing
 * ```
 */
class ActionDescriptorNavigator {
    private readonly desc: ActionDescriptor | null;
    private readonly isSentinel: boolean;

    // Static sentinel constants for performance
    private static readonly SENTINELS: SentinelValueMap = {
        string: "",
        enumerated: "",
        integer: -1,
        double: -1,
        boolean: false
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
     * const name = layerNav.getValue('name', 'string');
     * const visible = layerNav.getValue('visible', 'boolean');
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
            // ActionReference cleanup - important for memory management
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
     * const width = docNav.getValue('width', 'double');
     * const height = docNav.getValue('height', 'double');
     * const colorMode = docNav.getValue('mode', 'enumerated');
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
            // ActionReference cleanup - important for memory management
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
     * const layerName = thirdLayer.getValue('name', 'string');
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
            // ActionReference cleanup - important for memory management
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
     * // Find layer with exact name match
     * const targetLayer = ActionDescriptorNavigator.forLayerByName("TargetTest");
     * const name = targetLayer.getValue('name', 'string');
     * 
     * // Case-insensitive matching
     * const headerLayer = ActionDescriptorNavigator.forLayerByName("HEADER"); // Finds "header"
     * const bgLayer = ActionDescriptorNavigator.forLayerByName("background"); // Finds "Background"
     * 
     * // Leading/trailing spaces ignored
     * const trimLayer = ActionDescriptorNavigator.forLayerByName("  MyLayer  "); // Finds "MyLayer"
     * 
     * // Internal spaces must match exactly
     * const spaceLayer = ActionDescriptorNavigator.forLayerByName("My Layer"); // Only finds "My Layer", not "MyLayer"
     * 
     * // Exact match required - no partial matching
     * const exactOnly = ActionDescriptorNavigator.forLayerByName("Target"); // Will NOT find "TargetTest"
     * 
     * // Safe - returns sentinel if layer not found
     * const missingLayer = ActionDescriptorNavigator.forLayerByName("NonExistent");
     * const safeName = missingLayer.getValue('name', 'string'); // Returns ""
     * 
     * // Use in scoring scripts
     * const textLayer = ActionDescriptorNavigator.forLayerByName("MyTextLayer");
     * const textNav = textLayer.object('textKey');
     * const styleList = textNav.list('textStyleRange');
     * const arialIndex = styleList.findIndex('fontName', 'Arial');
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

                // Exact match after (case + trim)
                if (currentName === searchName) {
                    return ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
                }
            }

            // Layer not found
            return ActionDescriptorNavigator.createSentinel();
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create sentinel navigator that always returns sentinel values
     * Fixed: No shared mutable state
     * 
     * @returns Sentinel navigator instance
     * 
     * @example
     * ```typescript
     * const sentinel = ActionDescriptorNavigator.createSentinel();
     * const value = sentinel.getValue('anyKey', 'string'); // Always returns ""
     * ```
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Navigate to nested object property
     * Returns sentinel navigator for missing keys
     * 
     * @param key - Property key to navigate to
     * @returns New navigator for the nested object or sentinel
     * 
     * @example
     * ```typescript
     * const textNav = layerNav.object('textKey');
     * const boundsNav = layerNav.object('bounds');
     * const safeNav = layerNav.object('missingKey'); // Returns sentinel
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
     * Returns sentinel navigator for missing keys
     * 
     * @param key - List property key to navigate to
     * @returns ActionListNavigator for the list or sentinel
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * const firstStyle = styleList.getObject(0);
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
     * Get sentinel value based on type with exhaustive checking
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
     * Get value with optional transformation
     * Consistent sentinel value returns
     * 
     * @param key - Property key to extract
     * @param type - Expected value type
     * @param options - Optional transformation and default value options
     * @returns Extracted value or sentinel/default
     * 
     * @example
     * ```typescript
     * const name = layerNav.getValue('name', 'string'); // "" if missing
     * const opacity = layerNav.getValue('opacity', 'double'); // -1 if missing
     * const visible = layerNav.getValue('visible', 'boolean'); // false if missing
     * 
     * // With transformation
     * const roundedOpacity = layerNav.getValue('opacity', 'double', {
     *   transformer: val => Math.round(val)
     * });
     * 
     * // With custom default
     * const nameOrDefault = layerNav.getValue('name', 'string', {
     *   defaultValue: 'Unnamed Layer'
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
     * Extract value by type using direct switch with exhaustive checking
     * 
     * @param typeID - Photoshop type ID for the property
     * @param type - Expected value type
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * const nameTypeID = stringIDToTypeID('name');
     * const name = nav.extractByType(nameTypeID, 'string');
     * ```
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
                    return this.desc.getEnumerationValue(typeID);
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
     * Get multiple values as tuple
     * Functional approach with proper error handling
     * 
     * @param specs - Array of extraction specifications
     * @returns Array of extracted values in the same order
     * 
     * @example
     * ```typescript
     * const specs = [
     *   { key: 'name', type: 'string' as ValueType },
     *   { key: 'opacity', type: 'double' as ValueType },
     *   { key: 'visible', type: 'boolean' as ValueType }
     * ];
     * const [name, opacity, visible] = layerNav.getValues(specs);
     * ```
     */
    getValues(specs: readonly { key: string; type: ValueType; options?: ComparisonOptions }[]): readonly any[] {
        if (!specs || specs.length === 0) {
            return [];
        }

        return specs.map(spec => {
            if (!spec || !spec.key || !spec.type) {
                return ActionDescriptorNavigator.getSentinelValue(spec?.type || 'string');
            }

            try {
                return this.getValue(spec.key, spec.type, spec.options);
            } catch {
                return ActionDescriptorNavigator.getSentinelValue(spec.type);
            }
        });
    }

    /**
     * Get multiple values as object with proper bounds checking
     * 
     * @param specs - Object mapping property names to extraction specifications
     * @returns Object with extracted values mapped to property names
     * 
     * @example
     * ```typescript
     * const properties = layerNav.getValuesAsObject({
     *   name: { key: 'name', type: 'string' },
     *   opacity: { key: 'opacity', type: 'double' },
     *   visible: { key: 'visible', type: 'boolean' },
     *   layerID: { key: 'layerID', type: 'integer' }
     * });
     * 
     * console.log(properties.name, properties.opacity, properties.visible);
     * ```
     */
    getValuesAsObject<T extends Record<string, any>>(
        specs: { readonly [K in keyof T]: { key: string; type: ValueType; options?: ComparisonOptions } }
    ): T {
        const result = {} as T;

        for (const propName in specs) {
            if (specs.hasOwnProperty(propName)) {
                const spec = specs[propName];
                try {
                    result[propName] = this.getValue(spec.key, spec.type, spec.options);
                } catch {
                    result[propName] = ActionDescriptorNavigator.getSentinelValue(spec.type) as any;
                }
            }
        }

        return result;
    }

    /**
     * Get bounds object - returns sentinel bounds instead of null
     * Fixed: Calculate width/height from left/top/right/bottom
     * 
     * @returns Bounds object with calculated width and height
     * 
     * @example
     * ```typescript
     * const bounds = layerNav.getBounds();
     * console.log(`Size: ${bounds.width}x${bounds.height}`);
     * console.log(`Position: ${bounds.left},${bounds.top}`);
     * 
     * // Check if bounds are valid
     * if (bounds.left !== -1) {
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
     * Get text properties - returns sentinel properties instead of null
     * Fixed: Use correct property name for text content
     * 
     * @returns Text properties including content, font name, and size
     * 
     * @example
     * ```typescript
     * const textProps = layerNav.getTextProperties();
     * if (textProps.content !== "") {
     *   console.log(`Text: "${textProps.content}"`);
     *   console.log(`Font: ${textProps.fontName} ${textProps.fontSize}pt`);
     * }
     * ```
     */
    getTextProperties(): { content: string; fontName: string; fontSize: number } {
        if (this.isSentinel || !this.desc) {
            return { content: "", fontName: "", fontSize: -1 };
        }

        try {
            const textKey = this.desc.getObjectValue(stringIDToTypeID('textKey'));
            const textContent = textKey.getString(stringIDToTypeID('text')) || "";
            const textStyleRanges = textKey.getList(stringIDToTypeID('textStyleRange'));

            if (textStyleRanges.count > 0) {
                const firstRange = textStyleRanges.getObjectValue(0);
                const textStyle = firstRange.getObjectValue(stringIDToTypeID('textStyle'));

                return {
                    content: textContent,
                    fontName: textStyle.getString(stringIDToTypeID('fontName')) || "",
                    fontSize: textStyle.getDouble(stringIDToTypeID('size')) || -1
                };
            }

            return {
                content: textContent,
                fontName: "",
                fontSize: -1
            };
        } catch {
            return { content: "", fontName: "", fontSize: -1 };
        }
    }

    /**
     * Get layer count with proper ActionReference cleanup
     * 
     * @returns Number of layers in the document or -1 if error
     * 
     * @example
     * ```typescript
     * const layerCount = ActionDescriptorNavigator.getLayerCount();
     * console.log(`Document has ${layerCount} layers`);
     * 
     * if (layerCount > 0) {
     *   // Process layers
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
            // ActionReference cleanup - important for memory management
            ref = null;
        }
    }

    /**
     * Extract all layer names with proper memory management
     * Fixed: Safer approach without ActionReference loops
     * 
     * @returns Array of all layer names in the document
     * 
     * @example
     * ```typescript
     * const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
     * console.log('Layers:', layerNames);
     * 
     * // Find specific layers
     * const backgroundExists = layerNames.some(name => 
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
                    const name = layerNav.getValue('name', 'string');
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
     * Extract value from descriptor using sub-path
     * Centralized implementation for reuse
     * 
     * @param subPath - Dot-separated path to the value
     * @param valueType - Type of value to extract
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * const fontSize = layerNav.extractValueFromDescriptor('textStyle.size', 'double');
     * const fontName = layerNav.extractValueFromDescriptor('textStyle.fontName', 'string');
     * ```
     */
    extractValueFromDescriptor(subPath: string, valueType: ValueType): any {
        if (this.isSentinel || !this.desc || !this.validatePath(subPath)) {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }

        const pathParts = subPath.split('.').filter(Boolean);

        if (pathParts.length === 1) {
            // Single property access
            const typeID = stringIDToTypeID(pathParts[0]);
            return this.extractByType(typeID, valueType);
        }

        // Multi-level property access
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
 * Navigator for ActionList objects with consistent error handling
 * Fixed: No shared mutable state, proper list count handling, ES3 transpilation compatibility
 * 
 * @example
 * ```typescript
 * const styleList = textNav.list('textStyleRange');
 * const count = styleList.getCount();
 * 
 * for (let i = 0; i < count; i++) {
 *   const style = styleList.getObject(i);
 *   const fontSize = style.getValue('size', 'double');
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
     * Create sentinel list navigator without shared state
     * 
     * @returns Sentinel list navigator instance
     * 
     * @example
     * ```typescript
     * const sentinel = ActionListNavigator.createSentinel();
     * const count = sentinel.getCount(); // Always returns -1
     * ```
     */
    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get count with consistent sentinel values
     * Fixed: ES3 transpilation compatibility - changed from getter to method
     * 
     * @returns Number of items in the list or -1 if sentinel/error
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * 
     * if (count > 0) {
     *   // Process list items
     *   for (let i = 0; i < count; i++) {
     *     const item = styleList.getObject(i);
     *   }
     * }
     * ```
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1; // Consistent with other numeric failures
        }

        try {
            return this.list.count;
        } catch {
            return -1; // Consistent with other numeric failures
        }
    }

    /**
     * Get object at specific index with bounds checking
     * 
     * @param index - Zero-based index of the item to retrieve
     * @returns Navigator for the list item or sentinel if out of bounds
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const firstStyle = styleList.getObject(0);
     * const secondStyle = styleList.getObject(1);
     * const invalidStyle = styleList.getObject(999); // Returns sentinel
     * 
     * // Extract properties from style
     * const fontSize = firstStyle.getValue('size', 'double');
     * const fontName = firstStyle.getValue('fontName', 'string');
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
     * Get all values from list
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
     * // Get all font sizes
     * const fontSizes = styleList.getAllValues('size', 'double');
     * console.log('Font sizes:', fontSizes); // [12, 14, 16] or []
     * 
     * // Get all font names
     * const fontNames = styleList.getAllValues('fontName', 'string');
     * console.log('Font names:', fontNames); // ["Arial", "Helvetica"] or []
     * 
     * // With transformation
     * const roundedSizes = styleList.getAllValues('size', 'double', {
     *   transformer: size => Math.round(size)
     * });
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
     * Find first matching value
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
     * const largeFontSize = styleList.findValue('size', 'double', size => size > 20);
     * console.log('Large font found:', largeFontSize); // 24 or -1
     * 
     * // Find Arial font
     * const arialSize = styleList.findValue('fontName', 'string', name => 
     *   name.includes('Arial')
     * );
     * 
     * // Find font with specific tracking
     * const trackedFont = styleList.findValue('tracking', 'double', 
     *   tracking => Math.abs(tracking - 100) < 10
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
         * ES3 transpilation compatible with case-insensitive string matching
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
         * console.log('Arial at index:', arialIndex); // 0 or -1
         * 
         * // Find by exact match
         * const boldIndex = styleList.findIndex('fontName', 'Arial-BoldMT');
         * 
         * // Find by partial match (case-insensitive)
         * const anyArialIndex = styleList.findIndex('fontName', 'arial'); // Finds "Arial", "ArialMT", etc.
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

                // Handle string matching (case-insensitive, partial match)
                if (typeof value === 'string' && typeof itemValue === 'string') {
                    if (itemValue.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        return i;
                    }
                } else if (itemValue === value) {
                    // Exact match for numbers, booleans, etc.
                    return i;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return -1; // Not found
    }

    /**
     * Find object navigator for first item where property matches value
     * Returns sentinel navigator if not found - no null checks needed
     * 
     * @param key - Property key to search in each list item
     * @param value - Value to find (supports partial string matching)
     * @returns Navigator for matching object or sentinel navigator
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find Arial text style object
     * const arialStyleRange = styleList.findObjectBy('fontName', 'Arial');
     * const textStyle = arialStyleRange.object('textStyle');
     * const fontSize = textStyle.getValue('sizeKey', 'double');
     * 
     * // Chain directly for cleaner syntax
     * const boldFont = styleList.findObjectBy('fontName', 'Bold')
     *                           .object('textStyle')
     *                           .getValue('fontName', 'string');
     * 
     * // Safe - returns sentinel if not found
     * const missingStyle = styleList.findObjectBy('fontName', 'NonExistent');
     * const safeName = missingStyle.getValue('fontName', 'string'); // Returns ""
     * 
     * // Find by numeric property
     * const largeTextStyle = styleList.findObjectBy('sizeKey', 24);
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
     * Combines getObject(index) + getValue() in one call
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
     * // Combine with findIndex for peer values
     * const arialIndex = styleList.findIndex('fontName', 'Arial');
     * const arialSize = styleList.getValueAt(arialIndex, 'sizeKey', 'double');
     * const arialColor = styleList.getValueAt(arialIndex, 'color.red', 'double');
     * 
     * // Safe - returns sentinel if index out of bounds
     * const safeFont = styleList.getValueAt(999, 'fontName', 'string'); // Returns ""
     * const safeSize = styleList.getValueAt(-1, 'sizeKey', 'double');    // Returns -1
     * 
     * // Extract multiple peer values efficiently
     * const targetIndex = styleList.findIndex('fontName', 'Arial');
     * const font = styleList.getValueAt(targetIndex, 'fontName', 'string');
     * const size = styleList.getValueAt(targetIndex, 'sizeKey', 'double');
     * const scale = styleList.getValueAt(targetIndex, 'horizontalScale', 'double');
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
}

export { ActionDescriptorNavigator, ActionListNavigator };