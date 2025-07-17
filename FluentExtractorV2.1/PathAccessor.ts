/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Primary fluent API for 95% of extraction tasks with search-based patterns
 * Optimized for scoring with consistent error handling and performance
 */

import { ValueType, ValueTransformer, ComparisonOptions, BoundsProperty, PathSegment } from "./types";
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

/**
 * Primary fluent interface for navigating ActionDescriptor structures
 * Fixed: Constructor accessibility, immutability, type safety, performance
 */
class ActionDescriptorPath {
    // Fixed: Protected constructor for extensibility
    protected constructor(
        private readonly segments: readonly PathSegment[],
        private readonly transformations: readonly ValueTransformer[],
        private readonly defaultReturnValue?: any
    ) {
        // Immutable constructor pattern
    }

    /**
     * Create new path instance
     */
    static create(): ActionDescriptorPath {
        return new ActionDescriptorPath([], [], undefined);
    }

    /**
     * Navigate to object property
     */
    object(key: string): ActionDescriptorPath {
        if (!this.validateKey(key)) {
            return this.createSentinelPath();
        }

        return new ActionDescriptorPath(
            [...this.segments, { key, type: 'object' }],
            this.transformations,
            this.defaultReturnValue
        );
    }

    /**
     * Navigate to list property
     */
    list(key: string): ActionDescriptorPath {
        if (!this.validateKey(key)) {
            return this.createSentinelPath();
        }

        return new ActionDescriptorPath(
            [...this.segments, { key, type: 'list' }],
            this.transformations,
            this.defaultReturnValue
        );
    }

    /**
     * Access specific index in list with bounds validation
     */
    at(index: number): ActionDescriptorPath {
        const lastSegment = this.getLastSegment();

        if (!lastSegment || lastSegment.type !== 'list' || index < 0) {
            return this.createSentinelPath();
        }

        const updatedSegments = [...this.segments];
        updatedSegments[updatedSegments.length - 1] = { ...lastSegment, index };

        return new ActionDescriptorPath(
            updatedSegments,
            this.transformations,
            this.defaultReturnValue
        );
    }

    /**
     * Extract final value
     */
    value(key: string, valueType: ValueType): ActionDescriptorPath {
        if (!this.validateKey(key) || !valueType) {
            return this.createSentinelPath();
        }

        return new ActionDescriptorPath(
            [...this.segments, { key, type: 'value', valueType }],
            this.transformations,
            this.defaultReturnValue
        );
    }

    /**
     * Add custom transformation
     */
    transform(transformer: ValueTransformer): ActionDescriptorPath {
        if (!transformer || typeof transformer !== 'function') {
            return this;
        }

        return new ActionDescriptorPath(
            this.segments,
            [...this.transformations, transformer],
            this.defaultReturnValue
        );
    }

    /**
     * Floor the numeric value
     */
    floor(): ActionDescriptorPath {
        return this.transform(val => typeof val === 'number' ? Math.floor(val) : val);
    }

    /**
     * Round to specified decimal places
     */
    round(decimals = 0): ActionDescriptorPath {
        const factor = Math.pow(10, Math.max(0, decimals));
        return this.transform(val =>
            typeof val === 'number' ? Math.round(val * factor) / factor : val
        );
    }

    /**
     * Convert points to pixels
     */
    toPixels(fromUnit = 'pt', dpi = 72): ActionDescriptorPath {
        return this.transform(val =>
            typeof val === 'number' ? this.convertToPixels(val, fromUnit, dpi) : val
        );
    }

    /**
     * Convert to percentage
     */
    toPercentage(): ActionDescriptorPath {
        return this.transform(val => typeof val === 'number' ? val * 100 : val);
    }

    /**
     * Set default value if extraction fails
     */
    defaultTo<T>(value: T): ActionDescriptorPath {
        return new ActionDescriptorPath(
            this.segments,
            this.transformations,
            value
        );
    }

    /**
     * Extract the value from the ActionDescriptor
     * Consistent error handling for scoring context
     */
    extract<T = any>(rootDesc: ActionDescriptor): T {
        if (!rootDesc) {
            return this.getFallbackValue() as T;
        }

        try {
            const rawValue = this.resolvePath(rootDesc);
            return this.applyTransformations(rawValue) as T;
        } catch {
            return this.getFallbackValue() as T;
        }
    }

    /**
     * Try to extract value, return sentinel if fails
     */
    tryExtract<T = any>(rootDesc: ActionDescriptor): T {
        try {
            return this.extract<T>(rootDesc);
        } catch {
            return this.getFallbackValue() as T;
        }
    }

    /**
     * Extract value with fallback, avoiding sentinel values
     */
    extractOr<T = any>(rootDesc: ActionDescriptor, fallback: T): T {
        try {
            const result = this.extract<T>(rootDesc);
            return ActionDescriptorPath.SENTINEL_SET.has(result as any) ? fallback : result;
        } catch {
            return fallback;
        }
    }

    // Static sentinel set for performance
    private static readonly SENTINEL_SET = new Set([null, undefined, -1, "", false]);

    /**
     * Extract all layer names (delegates to ActionDescriptorNavigator)
     */
    extractAllLayerNames(): readonly string[] {
        return ActionDescriptorNavigator.extractAllLayerNames();
    }

    /**
     * Extract text style values from text layer
     */
    static extractTextStyleValues<T = any>(
        desc: ActionDescriptor,
        subPath: string,
        valueType: ValueType,
        count: number,
        defaultValue?: T
    ): readonly T[] {
        const sentinelValue = defaultValue ?? ActionDescriptorNavigator.getSentinelValue(valueType) as T;

        if (!desc || count <= 0 || !subPath) {
            const results: T[] = [];
            for (let i = 0; i < Math.max(0, count); i++) {
                results.push(sentinelValue);
            }
            return results;
        }

        try {
            const textKey = desc.getObjectValue(stringIDToTypeID("textKey"));
            const textStyleRanges = textKey.getList(stringIDToTypeID("textStyleRange"));

            const results: T[] = [];
            for (let i = 0; i < count; i++) {
                if (i < textStyleRanges.count) {
                    try {
                        const range = textStyleRanges.getObjectValue(i);
                        const navigator = new ActionDescriptorNavigator(range);
                        const value = navigator.extractValueFromDescriptor(subPath, valueType) as T;
                        results.push(value);
                    } catch {
                        results.push(sentinelValue);
                    }
                } else {
                    results.push(sentinelValue);
                }
            }
            return results;
        } catch {
            const results: T[] = [];
            for (let i = 0; i < count; i++) {
                results.push(sentinelValue);
            }
            return results;
        }
    }

    /**
     * Find value in list by predicate
     */
    findInList<T>(
        desc: ActionDescriptor,
        subPath: string,
        valueType: ValueType,
        predicate: (value: T, index: number) => boolean
    ): T {
        if (!desc || !predicate || !subPath) {
            return ActionDescriptorNavigator.getSentinelValue(valueType) as T;
        }

        try {
            const list = this.resolvePath(desc) as ActionList;

            if (!list || list.count <= 0) {
                return ActionDescriptorNavigator.getSentinelValue(valueType) as T;
            }

            for (let i = 0; i < list.count; i++) {
                try {
                    const itemDesc = list.getObjectValue(i);
                    const navigator = new ActionDescriptorNavigator(itemDesc);
                    const value = navigator.extractValueFromDescriptor(subPath, valueType) as T;

                    if (predicate(value, i)) {
                        return value;
                    }
                } catch {
                    // Continue searching on errors
                }
            }

            return ActionDescriptorNavigator.getSentinelValue(valueType) as T;
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(valueType) as T;
        }
    }

    /**
     * Search-first text style by property
     */
    static findTextStyleByProperty(
        desc: ActionDescriptor,
        searchProperty: string,
        searchValue: any,
        extractProperty: string,
        extractType: ValueType
    ): any {
        if (!desc || !searchProperty || !extractProperty) {
            return ActionDescriptorNavigator.getSentinelValue(extractType);
        }

        try {
            const textKey = desc.getObjectValue(stringIDToTypeID("textKey"));
            const styleRanges = textKey.getList(stringIDToTypeID("textStyleRange"));

            if (styleRanges.count <= 0) {
                return ActionDescriptorNavigator.getSentinelValue(extractType);
            }

            for (let i = 0; i < styleRanges.count; i++) {
                try {
                    const range = styleRanges.getObjectValue(i);
                    const style = range.getObjectValue(stringIDToTypeID("textStyle"));

                    if (style.hasKey(stringIDToTypeID(searchProperty))) {
                        const nav = new ActionDescriptorNavigator(style);
                        const currentValue = nav.getValue(searchProperty, extractType);

                        if (currentValue === searchValue) {
                            return nav.getValue(extractProperty, extractType);
                        }
                    }
                } catch {
                    // Continue searching
                }
            }
            return ActionDescriptorNavigator.getSentinelValue(extractType);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(extractType);
        }
    }

    /**
     * Search-first filter by name
     */
    static findFilterByName(
        desc: ActionDescriptor,
        filterName: string,
        property: string,
        valueType: ValueType
    ): any {
        if (!desc || !filterName || !property) {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }

        try {
            const smartObject = desc.getObjectValue(stringIDToTypeID('smartObjectMore'));
            const filters = smartObject.getList(stringIDToTypeID('filterFXList'));

            if (filters.count <= 0) {
                return ActionDescriptorNavigator.getSentinelValue(valueType);
            }

            for (let i = 0; i < filters.count; i++) {
                try {
                    const filter = filters.getObjectValue(i);
                    const nav = new ActionDescriptorNavigator(filter);

                    const name = nav.getValue('name', 'string');
                    if (name === filterName) {
                        return nav.getValue(property, valueType);
                    }
                } catch {
                    // Continue searching
                }
            }
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }
    }

    /**
     * Path resolution with clear error messages
     * Fixed: Safe type unwrapping
     */
    private resolvePath(rootDesc: ActionDescriptor): any {
        let current: any = rootDesc;

        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const typeID = stringIDToTypeID(segment.key);

            if (!current.hasKey(typeID)) {
                throw new Error(`Key '${segment.key}' not found at segment ${i}`);
            }

            switch (segment.type) {
                case 'object':
                    current = current.getObjectValue(typeID);
                    break;

                case 'list':
                    const list = current.getList(typeID);
                    if (segment.index !== undefined) {
                        if (list.count <= 0 || segment.index >= list.count) {
                            throw new Error(`List index ${segment.index} out of bounds (count: ${list.count})`);
                        }
                        current = list.getObjectValue(segment.index);
                    } else {
                        current = list;
                    }
                    break;

                case 'value':
                    // Fixed: Safe type unwrapping
                    const valueType = segment.valueType || 'string';
                    const navigator = new ActionDescriptorNavigator(current);
                    return navigator.extractByType(typeID, valueType);

                default:
                    const _exhaustive: never = segment.type;
                    throw new Error(`Unknown segment type: ${segment.type}`);
            }
        }

        return current;
    }

    /**
     * Apply transformation chain efficiently
     */
    private applyTransformations(value: any): any {
        if (this.transformations.length === 0) {
            return value;
        }

        if (this.transformations.length === 1) {
            try {
                return this.transformations[0](value);
            } catch {
                return this.defaultReturnValue ?? value;
            }
        }

        return this.transformations.reduce((result, transformer) => {
            try {
                return transformer(result);
            } catch {
                return this.defaultReturnValue ?? result;
            }
        }, value);
    }

    /**
     * Convert units to pixels with validation
     */
    private static readonly UNIT_CONVERTERS = {
        pt: (v: number, dpi: number) => v * (dpi / 72),
        points: (v: number, dpi: number) => v * (dpi / 72),
        in: (v: number, dpi: number) => v * dpi,
        inches: (v: number, dpi: number) => v * dpi,
        mm: (v: number, dpi: number) => v * (dpi / 25.4),
        cm: (v: number, dpi: number) => v * (dpi / 2.54),
        px: (v: number, _dpi: number) => v,
        pixels: (v: number, _dpi: number) => v
    } as const;

    private convertToPixels(value: number, fromUnit: string, dpi: number): number {
        if (!fromUnit || dpi <= 0) {
            return value;
        }

        const converter = ActionDescriptorPath.UNIT_CONVERTERS[fromUnit.toLowerCase() as keyof typeof ActionDescriptorPath.UNIT_CONVERTERS];
        return converter ? converter(value, dpi) : value;
    }

    /**
     * Get fallback value for failed extractions
     */
    private getFallbackValue(): any {
        if (this.defaultReturnValue !== undefined) {
            return this.defaultReturnValue;
        }

        const lastSegment = this.getLastSegment();
        if (lastSegment?.type === 'value' && lastSegment.valueType) {
            return ActionDescriptorNavigator.getSentinelValue(lastSegment.valueType);
        }

        return "";
    }

    /**
     * Create path that always returns sentinel values
     */
    private createSentinelPath(): ActionDescriptorPath {
        return ActionDescriptorPath.create().transform(() => "");
    }

    /**
     * Get last segment with bounds checking
     */
    private getLastSegment(): PathSegment | null {
        return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null;
    }

    /**
     * Validate key input
     */
    private validateKey(key: string): boolean {
        return key !== null && key !== undefined && key.trim().length > 0;
    }
}

/**
 * Factory class for common operations
 * Fixed: Search-first patterns, consistent API
 */
class PathFactory {
    // Static default values for consistency and performance
    private static readonly DEFAULT_VALUES = {
        string: "",
        enumerated: "",
        integer: -1,
        double: -1,
        boolean: false
    } as const;

    /**
     * Create object navigation path
     */
    obj(key: string): ActionDescriptorPath {
        if (!key) {
            return ActionDescriptorPath.create().defaultTo("");
        }
        return ActionDescriptorPath.create().object(key);
    }

    /**
     * Create list navigation path
     */
    list(key: string): ActionDescriptorPath {
        if (!key) {
            return ActionDescriptorPath.create().defaultTo("");
        }
        return ActionDescriptorPath.create().list(key);
    }

    /**
     * Create value extraction path
     */
    val(key: string, type: ValueType): ActionDescriptorPath {
        if (!key || !type) {
            return ActionDescriptorPath.create().defaultTo("");
        }
        return ActionDescriptorPath.create()
            .value(key, type)
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }

    /**
     * Extract bounds with unit conversion
     */
    bounds(property: BoundsProperty): ActionDescriptorPath {
        return ActionDescriptorPath.create()
            .object('bounds')
            .value(property, 'double')
            .toPixels('pt')
            .floor()
            .defaultTo(-1);
    }

    /**
     * Extract text style by search instead of brittle index
     */
    textStyleByFont(fontName: string, property: string, type: ValueType): ActionDescriptorPath {
        if (!fontName || !property) {
            return ActionDescriptorPath.create().defaultTo(PathFactory.DEFAULT_VALUES[type]);
        }

        return ActionDescriptorPath.create()
            .transform((desc: ActionDescriptor) => {
                return ActionDescriptorPath.findTextStyleByProperty(
                    desc, 'fontName', fontName, property, type
                );
            })
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }

    /**
     * Extract text style by size instead of brittle index
     */
    textStyleBySize(fontSize: number, property: string, type: ValueType): ActionDescriptorPath {
        if (fontSize <= 0 || !property) {
            return ActionDescriptorPath.create().defaultTo(PathFactory.DEFAULT_VALUES[type]);
        }

        return ActionDescriptorPath.create()
            .transform((desc: ActionDescriptor) => {
                return ActionDescriptorPath.findTextStyleByProperty(
                    desc, 'size', fontSize, property, type
                );
            })
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }

    /**
     * Extract filter by name instead of brittle index
     */
    filterByName(filterName: string, property: string, type: ValueType): ActionDescriptorPath {
        if (!filterName || !property) {
            return ActionDescriptorPath.create().defaultTo(PathFactory.DEFAULT_VALUES[type]);
        }

        return ActionDescriptorPath.create()
            .transform((desc: ActionDescriptor) => {
                return ActionDescriptorPath.findFilterByName(desc, filterName, property, type);
            })
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }

    /**
     * Find layer by name pattern
     */
    findLayerByName(namePattern: string | RegExp): ActionDescriptorPath {
        if (!namePattern) {
            return ActionDescriptorPath.create().defaultTo("");
        }

        return ActionDescriptorPath.create()
            .transform(() => {
                const layerNames = ActionDescriptorNavigator.extractAllLayerNames();

                const foundLayer = layerNames.find(layerName => {
                    if (typeof namePattern === 'string') {
                        return layerName.toLowerCase().includes(namePattern.toLowerCase());
                    }
                    if (namePattern instanceof RegExp) {
                        return namePattern.test(layerName);
                    }
                    return false;
                });

                return foundLayer ?? "";
            });
    }

    /**
     * Legacy text style access - prefer search methods above
     */
    textStyle(property: string, type: ValueType, textIndex = 0): ActionDescriptorPath {
        if (!property || textIndex < 0) {
            return ActionDescriptorPath.create().defaultTo(PathFactory.DEFAULT_VALUES[type]);
        }

        return ActionDescriptorPath.create()
            .object('textKey')
            .list('textStyleRange')
            .at(textIndex)
            .object('textStyle')
            .value(property, type)
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }

    /**
     * Legacy filter access - prefer search methods above
     */
    filter(property: string, type: ValueType, filterIndex = 0): ActionDescriptorPath {
        if (!property || filterIndex < 0) {
            return ActionDescriptorPath.create().defaultTo(PathFactory.DEFAULT_VALUES[type]);
        }

        return ActionDescriptorPath.create()
            .object('smartObjectMore')
            .list('filterFXList')
            .at(filterIndex)
            .value(property, type)
            .defaultTo(PathFactory.DEFAULT_VALUES[type]);
    }
}

/**
 * Primary factory instance for scoring operations
 */
const P = new PathFactory();

export { ActionDescriptorPath, PathFactory, P };