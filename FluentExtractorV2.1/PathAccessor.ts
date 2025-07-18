/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Primary fluent API for 95% of extraction tasks with search-based patterns
 * Optimized with consistent error handling, performance, and ES3 transpilation compatibility
 */

import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID } from "./ps";
import { ValueType, ValueTransformer, ComparisonOptions, BoundsProperty, PathSegment } from "./types";
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

/**
 * Primary fluent interface for navigating ActionDescriptor structures
 * Fixed: Constructor accessibility, immutability, type safety, performance
 * 
 * @example
 * ```typescript
 * // Basic property extraction
 * const name = ActionDescriptorPath.create()
 *   .value('name', 'string')
 *   .extract(layerDesc);
 * 
 * // Complex navigation with transformations
 * const roundedOpacity = ActionDescriptorPath.create()
 *   .value('opacity', 'double')
 *   .round(1)
 *   .extract(layerDesc);
 * 
 * // Search-based approach (recommended)
 * const arialSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
 * ```
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
     * 
     * @returns New ActionDescriptorPath instance
     * 
     * @example
     * ```typescript
     * const path = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(0)
     *   .value('size', 'double');
     * 
     * const fontSize = path.extract(layerDesc);
     * ```
     */
    static create(): ActionDescriptorPath {
        return new ActionDescriptorPath([], [], undefined);
    }

    /**
     * Navigate to object property
     * 
     * @param key - Property key to navigate to
     * @returns New path with object navigation added
     * 
     * @example
     * ```typescript
     * // Navigate to text properties
     * const textPath = ActionDescriptorPath.create()
     *   .object('textKey');
     * 
     * // Navigate to bounds
     * const boundsPath = ActionDescriptorPath.create()
     *   .object('bounds');
     * 
     * // Chain object navigation
     * const deepPath = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .object('textStyleRange');
     * ```
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
     * 
     * @param key - List property key to navigate to
     * @returns New path with list navigation added
     * 
     * @example
     * ```typescript
     * // Navigate to text style ranges
     * const styleListPath = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange');
     * 
     * // Navigate to layer effects
     * const effectsPath = ActionDescriptorPath.create()
     *   .object('layerEffects')
     *   .list('dropShadow');
     * ```
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
     * 
     * @param index - Zero-based index to access
     * @returns New path with index access added
     * 
     * @example
     * ```typescript
     * // Get first text style
     * const firstStylePath = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(0)
     *   .value('size', 'double');
     * 
     * // Get second style
     * const secondStylePath = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(1)
     *   .value('fontName', 'string');
     * ```
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
     * 
     * @param key - Property key to extract
     * @param valueType - Type of value to extract
     * @returns New path with value extraction added
     * 
     * @example
     * ```typescript
     * // Extract layer name
     * const namePath = ActionDescriptorPath.create()
     *   .value('name', 'string');
     * 
     * // Extract opacity
     * const opacityPath = ActionDescriptorPath.create()
     *   .value('opacity', 'double');
     * 
     * // Extract visibility
     * const visiblePath = ActionDescriptorPath.create()
     *   .value('visible', 'boolean');
     * ```
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
     * 
     * @param transformer - Function to transform the extracted value
     * @returns New path with transformation added
     * 
     * @example
     * ```typescript
     * // Convert points to pixels
     * const pixelPath = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .transform(points => points * (96 / 72));
     * 
     * // Convert to uppercase
     * const upperPath = ActionDescriptorPath.create()
     *   .value('name', 'string')
     *   .transform(name => name.toUpperCase());
     * 
     * // Custom calculation
     * const scaledPath = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .transform(opacity => opacity * 0.8);
     * ```
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
     * 
     * @returns New path with floor transformation added
     * 
     * @example
     * ```typescript
     * const flooredOpacity = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .floor()
     *   .extract(layerDesc); // 75.8 becomes 75
     * 
     * const flooredSize = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(0)
     *   .value('size', 'double')
     *   .floor(); // 12.7pt becomes 12pt
     * ```
     */
    floor(): ActionDescriptorPath {
        return this.transform(val => typeof val === 'number' ? Math.floor(val) : val);
    }

    /**
     * Round to specified decimal places
     * 
     * @param decimals - Number of decimal places (default: 0)
     * @returns New path with rounding transformation added
     * 
     * @example
     * ```typescript
     * // Round to integer
     * const roundedOpacity = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .round()
     *   .extract(layerDesc); // 75.8 becomes 76
     * 
     * // Round to 1 decimal place
     * const preciseSize = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .round(1)
     *   .extract(layerDesc); // 12.74 becomes 12.7
     * 
     * // Round to 2 decimal places
     * const veryPrecise = ActionDescriptorPath.create()
     *   .value('tracking', 'double')
     *   .round(2); // 150.567 becomes 150.57
     * ```
     */
    round(decimals = 0): ActionDescriptorPath {
        const factor = Math.pow(10, Math.max(0, decimals));
        return this.transform(val =>
            typeof val === 'number' ? Math.round(val * factor) / factor : val
        );
    }

    /**
     * Convert points to pixels
     * 
     * @param fromUnit - Source unit (default: 'pt')
     * @param dpi - DPI for conversion (default: 72)
     * @returns New path with unit conversion added
     * 
     * @example
     * ```typescript
     * // Convert font size from points to pixels at 72 DPI
     * const pixelSize = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .toPixels()
     *   .extract(layerDesc); // 12pt becomes 12px at 72 DPI
     * 
     * // Convert at 96 DPI
     * const highDpiSize = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .toPixels('pt', 96)
     *   .extract(layerDesc); // 12pt becomes 16px at 96 DPI
     * 
     * // Convert from inches
     * const fromInches = ActionDescriptorPath.create()
     *   .value('width', 'double')
     *   .toPixels('in', 300); // 1 inch becomes 300px at 300 DPI
     * ```
     */
    toPixels(fromUnit = 'pt', dpi = 72): ActionDescriptorPath {
        return this.transform(val =>
            typeof val === 'number' ? this.convertToPixels(val, fromUnit, dpi) : val
        );
    }

    /**
     * Convert to percentage
     * 
     * @returns New path with percentage conversion added
     * 
     * @example
     * ```typescript
     * // Convert opacity to percentage
     * const opacityPercent = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .toPercentage()
     *   .extract(layerDesc); // 0.75 becomes 75
     * 
     * // Convert ratio to percentage
     * const ratioPercent = ActionDescriptorPath.create()
     *   .value('fillOpacity', 'double')
     *   .toPercentage()
     *   .round(1); // 0.856 becomes 85.6%
     * ```
     */
    toPercentage(): ActionDescriptorPath {
        return this.transform(val => typeof val === 'number' ? val * 100 : val);
    }

    /**
     * Set default value if extraction fails
     * 
     * @param value - Default value to use
     * @returns New path with default value set
     * 
     * @example
     * ```typescript
     * // Provide default layer name
     * const nameWithDefault = ActionDescriptorPath.create()
     *   .value('name', 'string')
     *   .defaultTo('Unnamed Layer')
     *   .extract(layerDesc);
     * 
     * // Provide default opacity
     * const opacityWithDefault = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .defaultTo(100)
     *   .extract(layerDesc);
     * 
     * // Chain with transformations
     * const processedDefault = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .round(1)
     *   .defaultTo(12.0);
     * ```
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
     * Consistent error handling 
     * 
     * @param rootDesc - ActionDescriptor to extract from
     * @returns Extracted and transformed value
     * 
     * @example
     * ```typescript
     * // Extract layer properties
     * const name = ActionDescriptorPath.create()
     *   .value('name', 'string')
     *   .extract(layerDesc);
     * 
     * const opacity = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .round(1)
     *   .extract(layerDesc);
     * 
     * // Extract nested properties
     * const fontSize = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(0)
     *   .value('size', 'double')
     *   .extract(layerDesc);
     * ```
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
     * 
     * @param rootDesc - ActionDescriptor to extract from
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * // Safe extraction that never throws
     * const name = ActionDescriptorPath.create()
     *   .value('name', 'string')
     *   .tryExtract(layerDesc); // "" if missing
     * 
     * const fontSize = ActionDescriptorPath.create()
     *   .object('textKey')
     *   .list('textStyleRange')
     *   .at(0)
     *   .value('size', 'double')
     *   .tryExtract(layerDesc); // -1 if missing or error
     * ```
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
     * 
     * @param rootDesc - ActionDescriptor to extract from
     * @param fallback - Fallback value if extraction fails or returns sentinel
     * @returns Extracted value or fallback
     * 
     * @example
     * ```typescript
     * // Get name with fallback
     * const name = ActionDescriptorPath.create()
     *   .value('name', 'string')
     *   .extractOr(layerDesc, 'Default Name');
     * 
     * // Get opacity with fallback
     * const opacity = ActionDescriptorPath.create()
     *   .value('opacity', 'double')
     *   .extractOr(layerDesc, 100);
     * 
     * // Check against sentinel values
     * const fontSize = ActionDescriptorPath.create()
     *   .value('size', 'double')
     *   .extractOr(layerDesc, 12); // Use 12 if missing or -1
     * ```
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
     * 
     * @returns Array of all layer names in the document
     * 
     * @example
     * ```typescript
     * const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
     * console.log('All layers:', layerNames);
     * 
     * // Find specific layers
     * const hasBackground = layerNames.some(name => 
     *   name.toLowerCase().includes('background')
     * );
     * 
     * const textLayers = layerNames.filter(name =>
     *   name.toLowerCase().includes('text')
     * );
     * ```
     */
    extractAllLayerNames(): readonly string[] {
        return ActionDescriptorNavigator.extractAllLayerNames();
    }

    /**
     * Extract text style values from text layer
     * 
     * @param desc - ActionDescriptor to extract from
     * @param subPath - Path to the property within each text style
     * @param valueType - Type of value to extract
     * @param count - Number of styles to extract
     * @param defaultValue - Default value for missing styles
     * @returns Array of extracted values
     * 
     * @example
     * ```typescript
     * // Extract font sizes from first 3 text styles
     * const fontSizes = ActionDescriptorPath.extractTextStyleValues(
     *   layerDesc,
     *   'textStyle.size',
     *   'double',
     *   3
     * );
     * console.log('Font sizes:', fontSizes); // [12, 14, 16] or [-1, -1, -1]
     * 
     * // Extract font names
     * const fontNames = ActionDescriptorPath.extractTextStyleValues(
     *   layerDesc,
     *   'textStyle.fontName',
     *   'string',
     *   2,
     *   'Arial'
     * );
     * ```
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
     * 
     * @param desc - ActionDescriptor to search in
     * @param subPath - Path to the property within each list item
     * @param valueType - Type of value to extract
     * @param predicate - Function to test each value
     * @returns First matching value or sentinel
     * 
     * @example
     * ```typescript
     * // Find large font size
     * const largeFont = ActionDescriptorPath.create().findInList(
     *   layerDesc,
     *   'textStyle.size',
     *   'double',
     *   (size, index) => size > 20
     * );
     * 
     * // Find Arial font
     * const arialFont = ActionDescriptorPath.create().findInList(
     *   layerDesc,
     *   'textStyle.fontName',
     *   'string',
     *   (name, index) => name.includes('Arial')
     * );
     * ```
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
     * 
     * @param desc - ActionDescriptor to search in
     * @param searchProperty - Property to search by
     * @param searchValue - Value to search for
     * @param extractProperty - Property to extract from matching style
     * @param extractType - Type of property to extract
     * @returns Extracted property value or sentinel
     * 
     * @example
     * ```typescript
     * // Find Arial font size
     * const arialSize = ActionDescriptorPath.findTextStyleByProperty(
     *   layerDesc,
     *   'fontName',
     *   'Arial',
     *   'size',
     *   'double'
     * );
     * 
     * // Find 24pt font name
     * const largeFontName = ActionDescriptorPath.findTextStyleByProperty(
     *   layerDesc,
     *   'size',
     *   24,
     *   'fontName',
     *   'string'
     * );
     * 
     * // Find bold font tracking
     * const boldTracking = ActionDescriptorPath.findTextStyleByProperty(
     *   layerDesc,
     *   'fontName',
     *   'Arial-BoldMT',
     *   'tracking',
     *   'double'
     * );
     * ```
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
     * 
     * @param desc - ActionDescriptor to search in
     * @param filterName - Name of the filter to find
     * @param property - Property to extract from the filter
     * @param valueType - Type of property to extract
     * @returns Extracted property value or sentinel
     * 
     * @example
     * ```typescript
     * // Find Gaussian Blur radius
     * const blurRadius = ActionDescriptorPath.findFilterByName(
     *   layerDesc,
     *   'Gaussian Blur',
     *   'radius',
     *   'double'
     * );
     * 
     * // Find Drop Shadow distance
     * const shadowDistance = ActionDescriptorPath.findFilterByName(
     *   layerDesc,
     *   'Drop Shadow',
     *   'distance',
     *   'double'
     * );
     * 
     * // Find Outer Glow size
     * const glowSize = ActionDescriptorPath.findFilterByName(
     *   layerDesc,
     *   'Outer Glow',
     *   'blur',
     *   'double'
     * );
     * ```
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
 * 
 * @example
 * ```typescript
 * // Import the factory
 * import { P } from './PathAccessor';
 * 
 * // Basic usage
 * const name = P.val('name', 'string').extract(layerDesc);
 * const opacity = P.val('opacity', 'double').extract(layerDesc);
 * 
 * // Search-based usage (recommended)
 * const arialSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
 * const blurRadius = P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);
 * ```
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
     * 
     * @param key - Object property key
     * @returns Path for navigating to object property
     * 
     * @example
     * ```typescript
     * const textPath = P.obj('textKey');
     * const boundsPath = P.obj('bounds');
     * const effectsPath = P.obj('layerEffects');
     * ```
     */
    obj(key: string): ActionDescriptorPath {
        if (!key) {
            return ActionDescriptorPath.create().defaultTo("");
        }
        return ActionDescriptorPath.create().object(key);
    }

    /**
     * Create list navigation path
     * 
     * @param key - List property key
     * @returns Path for navigating to list property
     * 
     * @example
     * ```typescript
     * const styleListPath = P.list('textStyleRange');
     * const filterListPath = P.list('filterFXList');
     * const layerListPath = P.list('layerList');
     * ```
     */
    list(key: string): ActionDescriptorPath {
        if (!key) {
            return ActionDescriptorPath.create().defaultTo("");
        }
        return ActionDescriptorPath.create().list(key);
    }

    /**
     * Create value extraction path
     * 
     * @param key - Property key to extract
     * @param type - Value type to extract
     * @returns Path for extracting typed value
     * 
     * @example
     * ```typescript
     * const name = P.val('name', 'string').extract(layerDesc);
     * const opacity = P.val('opacity', 'double').extract(layerDesc);
     * const visible = P.val('visible', 'boolean').extract(layerDesc);
     * const layerID = P.val('layerID', 'integer').extract(layerDesc);
     * const blendMode = P.val('mode', 'enumerated').extract(layerDesc);
     * ```
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
     * 
     * @param property - Bounds property to extract
     * @returns Path for extracting bounds property with pixel conversion
     * 
     * @example
     * ```typescript
     * const left = P.bounds('left').extract(layerDesc);     // Left edge in pixels
     * const top = P.bounds('top').extract(layerDesc);       // Top edge in pixels
     * const width = P.bounds('width').extract(layerDesc);   // Width in pixels
     * const height = P.bounds('height').extract(layerDesc); // Height in pixels
     * 
     * // Check if bounds are valid
     * if (width > 0 && height > 0) {
     *   console.log(`Layer size: ${width}x${height}`);
     * }
     * ```
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
     * 
     * @param fontName - Font name to search for
     * @param property - Property to extract from matching style
     * @param type - Type of property to extract
     * @returns Path for search-based text style extraction
     * 
     * @example
     * ```typescript
     * // Find Arial font size
     * const arialSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
     * 
     * // Find Helvetica tracking
     * const helveticaTracking = P.textStyleByFont('Helvetica', 'tracking', 'double').extract(layerDesc);
     * 
     * // Find bold font leading
     * const boldLeading = P.textStyleByFont('Arial-BoldMT', 'leading', 'double').extract(layerDesc);
     * 
     * // Find any font's color
     * const fontColor = P.textStyleByFont('Arial', 'color', 'string').extract(layerDesc);
     * ```
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
     * 
     * @param fontSize - Font size to search for
     * @param property - Property to extract from matching style
     * @param type - Type of property to extract
     * @returns Path for size-based text style extraction
     * 
     * @example
     * ```typescript
     * // Find 24pt font name
     * const largeFontName = P.textStyleBySize(24, 'fontName', 'string').extract(layerDesc);
     * 
     * // Find 12pt font tracking
     * const smallFontTracking = P.textStyleBySize(12, 'tracking', 'double').extract(layerDesc);
     * 
     * // Find 18pt font color
     * const mediumFontColor = P.textStyleBySize(18, 'color', 'string').extract(layerDesc);
     * ```
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
     * 
     * @param filterName - Filter name to search for
     * @param property - Property to extract from the filter
     * @param type - Type of property to extract
     * @returns Path for name-based filter extraction
     * 
     * @example
     * ```typescript
     * // Find Gaussian Blur radius
     * const blurRadius = P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);
     * 
     * // Find Drop Shadow distance
     * const shadowDistance = P.filterByName('Drop Shadow', 'distance', 'double').extract(layerDesc);
     * 
     * // Find Outer Glow size
     * const glowSize = P.filterByName('Outer Glow', 'blur', 'double').extract(layerDesc);
     * 
     * // Find Color Overlay opacity
     * const overlayOpacity = P.filterByName('Color Overlay', 'opacity', 'double').extract(layerDesc);
     * ```
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
     * 
     * @param namePattern - String or RegExp to match layer names
     * @returns Path for layer name searching
     * 
     * @example
     * ```typescript
     * // Find layer containing "header"
     * const headerLayer = P.findLayerByName('header').extract(docDesc);
     * 
     * // Find layer containing "background" (case insensitive)
     * const backgroundLayer = P.findLayerByName(/background/i).extract(docDesc);
     * 
     * // Find layer with exact name
     * const titleLayer = P.findLayerByName('Title').extract(docDesc);
     * 
     * // Check if layer exists
     * if (headerLayer !== "") {
     *   console.log('Found header layer:', headerLayer);
     * }
     * ```
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
     * 
     * @param property - Property to extract from text style
     * @param type - Type of property to extract
     * @param textIndex - Zero-based index of text style (default: 0)
     * @returns Path for index-based text style extraction
     * 
     * @example
     * ```typescript
     * // Get first text style size (legacy approach)
     * const firstSize = P.textStyle('size', 'double', 0).extract(layerDesc);
     * 
     * // Get second text style font (legacy approach)
     * const secondFont = P.textStyle('fontName', 'string', 1).extract(layerDesc);
     * 
     * // Prefer search-based methods:
     * // const arialSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
     * ```
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
     * 
     * @param property - Property to extract from filter
     * @param type - Type of property to extract
     * @param filterIndex - Zero-based index of filter (default: 0)
     * @returns Path for index-based filter extraction
     * 
     * @example
     * ```typescript
     * // Get first filter radius (legacy approach)
     * const firstRadius = P.filter('radius', 'double', 0).extract(layerDesc);
     * 
     * // Get second filter distance (legacy approach)
     * const secondDistance = P.filter('distance', 'double', 1).extract(layerDesc);
     * 
     * // Prefer search-based methods:
     * // const blurRadius = P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);
     * ```
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
 * Primary factory instance operations
 * 
 * @example
 * ```typescript
 * import { P } from './PathAccessor';
 * 
 * // Use P for all path operations
 * const name = P.val('name', 'string').extract(layerDesc);
 * const fontSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
 * const blurRadius = P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);
 * ```
 */
const P = new PathFactory();

export { ActionDescriptorPath, PathFactory, P };