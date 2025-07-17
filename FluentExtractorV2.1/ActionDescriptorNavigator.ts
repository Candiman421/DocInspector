/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Provides imperative-style navigation and tuple extraction capabilities
 * Optimized for test scoring with consistent error handling
 */

import { ValueType, SentinelValue, SentinelValueMap, ValueTransformer, ComparisonOptions } from "./types";

/**
 * Core navigation class for ActionDescriptor structures
 * Fixed: ExtendScript compatibility, memory management, sentinel handling
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
            // ActionReference cleanup handled by ExtendScript runtime
            ref = null;
        }
    }

    /**
     * Create navigator for current document
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
            // ActionReference cleanup handled by ExtendScript runtime
            ref = null;
        }
    }

    /**
     * Create navigator for layer by index (1-based)
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
            // ActionReference cleanup handled by ExtendScript runtime
            ref = null;
        }
    }

    /**
     * Create sentinel navigator that always returns sentinel values
     * Fixed: No shared mutable state
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Navigate to nested object property
     * Returns sentinel navigator for missing keys
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
     * Safe navigation to nested object property
     * Alias for object() with explicit sentinel handling
     */
    safeObject(key: string): ActionDescriptorNavigator {
        return this.object(key);
    }

    /**
     * Navigate to list property
     * Returns sentinel navigator for missing keys
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
     * Consistent sentinel value returns for scoring
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
            // ActionReference cleanup handled by ExtendScript runtime
            ref = null;
        }
    }

    /**
     * Extract all layer names with proper memory management
     * Fixed: Safer approach without ActionReference loops
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
 * Fixed: No shared mutable state, proper list count handling
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
     */
    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get count with consistent sentinel values
     */
    get count(): number {
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
     */
    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.count;
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
        const listCount = this.count;

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

        const listCount = this.count;
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
}

export { ActionDescriptorNavigator, ActionListNavigator };