/**
 * Simple list extraction utilities for test assessment
 * Provides basic list processing for ActionManager patterns
 * Optimized for scoring with consistent error handling, performance, and ES3 transpilation compatibility
 */

import { stringIDToTypeID } from "./ps";
import { ValueType, ValueTransformer } from "./types";
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

/**
 * Interface for objects that can extract ActionLists from ActionDescriptors
 * Defined here to avoid circular dependencies in types.ts
 * 
 * @example
 * ```typescript
 * const textStyleExtractor: ListExtractor = {
 *   extract: function(rootDesc: ActionDescriptor): ActionList | null {
 *     try {
 *       const textKey = rootDesc.getObjectValue(stringIDToTypeID('textKey'));
 *       return textKey.getList(stringIDToTypeID('textStyleRange'));
 *     } catch {
 *       return null;
 *     }
 *   }
 * };
 * ```
 */
export interface ListExtractor {
    extract(rootDesc: ActionDescriptor): ActionList | null;
}

/**
 * Simple list value extractor for test assessment needs
 * Fixed: Constructor consistency, path traversal, transformer handling
 * 
 * @example
 * ```typescript
 * // Create extractor for text style font sizes
 * const fontSizeExtractor = new ListValueExtractor(
 *   textStyleExtractor,
 *   'textStyle.size',
 *   'double'
 * );
 * 
 * // Extract all font sizes
 * const sizes = fontSizeExtractor.extractAll(layerDesc);
 * console.log('Font sizes:', sizes); // [12, 14, 16] or []
 * 
 * // Extract with rounding
 * const roundedExtractor = fontSizeExtractor.round(1);
 * const roundedSizes = roundedExtractor.extractAll(layerDesc);
 * ```
 */
class ListValueExtractor {
    private readonly basePath: ListExtractor;
    private readonly subPath: string;
    private readonly valueType: ValueType;
    private readonly transformer?: ValueTransformer;
    private readonly cachedPath: readonly string[];

    /**
     * Create a simple list value extractor
     * Fixed: Single transformer pattern for consistency
     * 
     * @param basePath - ListExtractor that provides the ActionList
     * @param subPath - Dot-separated path to the value within each list item
     * @param valueType - Type of value to extract
     * @param transformer - Optional transformation function
     * 
     * @example
     * ```typescript
     * // Basic extractor
     * const sizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'size',
     *   'double'
     * );
     * 
     * // Extractor with nested path
     * const fontExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.fontName',
     *   'string'
     * );
     * 
     * // Extractor with transformation
     * const roundedExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'size',
     *   'double',
     *   size => Math.round(size)
     * );
     * ```
     */
    constructor(
        basePath: ListExtractor,
        subPath: string,
        valueType: ValueType,
        transformer?: ValueTransformer
    ) {
        this.basePath = basePath;
        this.subPath = subPath;
        this.valueType = valueType;
        this.transformer = transformer;
        this.cachedPath = this.validateAndParsePath(subPath);
    }

    /**
     * Extract all values from the list
     * Optimized for scoring with consistent error handling
     * 
     * @param rootDesc - Root ActionDescriptor to extract from
     * @returns Array of extracted values or empty array
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * const allSizes = fontSizeExtractor.extractAll(layerDesc);
     * console.log('All font sizes:', allSizes); // [12, 14, 16] or []
     * 
     * // Process results
     * const averageSize = allSizes.length > 0 
     *   ? allSizes.reduce((sum, size) => sum + size, 0) / allSizes.length
     *   : 0;
     * ```
     */
    extractAll<T = any>(rootDesc: ActionDescriptor): readonly T[] {
        if (!rootDesc) {
            return [];
        }

        try {
            const list = this.basePath.extract(rootDesc);
            if (!list || typeof list.count !== 'number' || list.count <= 0) {
                return [];
            }

            const results: T[] = [];
            for (let i = 0; i < list.count; i++) {
                try {
                    const itemDesc = list.getObjectValue(i);
                    const value = this.extractValueFromDescriptor(itemDesc);
                    results.push(value as T);
                } catch {
                    results.push(ActionDescriptorNavigator.getSentinelValue(this.valueType) as T);
                }
            }
            return results;
        } catch {
            return [];
        }
    }

    /**
     * Extract value at specific index with bounds checking
     * 
     * @param rootDesc - Root ActionDescriptor to extract from
     * @param index - Zero-based index of the item to extract
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * const firstSize = fontSizeExtractor.extractAt(layerDesc, 0);  // 12 or -1
     * const secondSize = fontSizeExtractor.extractAt(layerDesc, 1); // 14 or -1
     * const invalidSize = fontSizeExtractor.extractAt(layerDesc, 99); // -1
     * 
     * // Check if extraction was successful
     * if (firstSize !== -1) {
     *   console.log('First font size:', firstSize);
     * }
     * ```
     */
    extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
        if (!rootDesc || index < 0) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
        }

        try {
            const list = this.basePath.extract(rootDesc);

            if (!list || typeof list.count !== 'number' || list.count <= 0 || index >= list.count) {
                return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
            }

            const itemDesc = list.getObjectValue(index);
            return this.extractValueFromDescriptor(itemDesc) as T;
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
        }
    }

    /**
     * Find first value that matches condition
     * 
     * @param rootDesc - Root ActionDescriptor to extract from
     * @param predicate - Function to test each value and its index
     * @returns First matching value or sentinel
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * // Find first large font
     * const largeFont = fontSizeExtractor.findFirst(layerDesc, 
     *   (size, index) => size > 20
     * );
     * console.log('Large font size:', largeFont); // 24 or -1
     * 
     * // Find first font at specific position
     * const thirdFont = fontSizeExtractor.findFirst(layerDesc,
     *   (size, index) => index === 2
     * );
     * 
     * // Find font within range
     * const mediumFont = fontSizeExtractor.findFirst(layerDesc,
     *   size => size >= 14 && size <= 18
     * );
     * ```
     */
    findFirst<T = any>(
        rootDesc: ActionDescriptor,
        predicate: (value: T, index: number) => boolean
    ): T {
        if (!rootDesc || !predicate) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
        }

        try {
            const list = this.basePath.extract(rootDesc);
            if (!list || typeof list.count !== 'number' || list.count <= 0) {
                return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
            }

            for (let i = 0; i < list.count; i++) {
                try {
                    const itemDesc = list.getObjectValue(i);
                    const value = this.extractValueFromDescriptor(itemDesc) as T;
                    if (predicate(value, i)) {
                        return value;
                    }
                } catch {
                    // Continue searching on errors
                }
            }

            return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;
        }
    }

    /**
     * Extract exactly N values, padding with sentinel values if needed
     * 
     * @param rootDesc - Root ActionDescriptor to extract from
     * @param count - Exact number of values to return
     * @returns Array with exactly N values, padded with sentinels if needed
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * // Always get exactly 3 values
     * const threeSizes = fontSizeExtractor.extractExactly(layerDesc, 3);
     * console.log('Three sizes:', threeSizes); // [12, 14, -1] if only 2 exist
     * 
     * // Useful for fixed-size scoring arrays
     * const [size1, size2, size3] = fontSizeExtractor.extractExactly(layerDesc, 3);
     * 
     * // Check which values are valid
     * const validSizes = threeSizes.filter(size => size !== -1);
     * console.log('Valid sizes:', validSizes);
     * ```
     */
    extractExactly<T = any>(rootDesc: ActionDescriptor, count: number): readonly T[] {
        if (!rootDesc || count <= 0) {
            return [];
        }

        const sentinelValue = ActionDescriptorNavigator.getSentinelValue(this.valueType) as T;

        try {
            const list = this.basePath.extract(rootDesc);
            const results: T[] = [];

            for (let i = 0; i < count; i++) {
                if (list && list.count > 0 && i < list.count) {
                    try {
                        const itemDesc = list.getObjectValue(i);
                        const value = this.extractValueFromDescriptor(itemDesc);
                        results.push(value as T);
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
     * Apply transformation to extracted values
     * 
     * @param transformer - Function to transform extracted values
     * @returns New extractor with the transformation applied
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * // Convert points to pixels (72 DPI)
     * const pixelExtractor = fontSizeExtractor.transform(
     *   points => points * (96 / 72)
     * );
     * 
     * // Round to nearest integer
     * const roundedExtractor = fontSizeExtractor.transform(
     *   size => Math.round(size)
     * );
     * 
     * // Chain transformations
     * const roundedPixelExtractor = fontSizeExtractor
     *   .transform(points => points * (96 / 72))
     *   .transform(pixels => Math.round(pixels));
     * ```
     */
    transform(transformer: ValueTransformer): ListValueExtractor {
        if (!transformer || typeof transformer !== 'function') {
            return this;
        }

        return new ListValueExtractor(
            this.basePath,
            this.subPath,
            this.valueType,
            transformer
        );
    }

    /**
     * Round numeric values to specified decimal places
     * 
     * @param decimals - Number of decimal places (default: 0)
     * @returns New extractor with rounding applied
     * 
     * @example
     * ```typescript
     * const fontSizeExtractor = new ListValueExtractor(
     *   textStyleExtractor,
     *   'textStyle.size',
     *   'double'
     * );
     * 
     * // Round to integers
     * const integerExtractor = fontSizeExtractor.round();
     * const sizes = integerExtractor.extractAll(layerDesc); // [12, 14, 16]
     * 
     * // Round to 1 decimal place
     * const preciseExtractor = fontSizeExtractor.round(1);
     * const preciseSizes = preciseExtractor.extractAll(layerDesc); // [12.5, 14.2, 16.0]
     * 
     * // Round to 2 decimal places
     * const veryPreciseExtractor = fontSizeExtractor.round(2);
     * ```
     */
    round(decimals = 0): ListValueExtractor {
        const factor = Math.pow(10, decimals);
        return this.transform(value =>
            typeof value === 'number' ? Math.round(value * factor) / factor : value
        );
    }

    /**
     * Extract value from ActionDescriptor using sub-path
     * Fixed: Proper handling of cached paths and transformer
     */
    private extractValueFromDescriptor(desc: ActionDescriptor): any {
        if (!desc) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }

        let result: any;

        if (this.cachedPath.length === 0) {
            // Empty path - return sentinel
            result = ActionDescriptorNavigator.getSentinelValue(this.valueType);
        } else if (this.cachedPath.length === 1) {
            // Handle single-element path directly
            result = this.extractSingleValue(desc, this.cachedPath[0]);
        } else {
            // Handle multi-element path
            result = this.extractNestedValue(desc);
        }

        // Apply transformer if present
        if (this.transformer) {
            try {
                return this.transformer(result);
            } catch {
                return result; // Continue with original value on transform error
            }
        }

        return result;
    }

    /**
     * Extract single property value
     */
    private extractSingleValue(desc: ActionDescriptor, propertyName: string): any {
        if (!propertyName || propertyName.trim().length === 0) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }

        const typeID = stringIDToTypeID(propertyName);

        if (!desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }

        try {
            const navigator = new ActionDescriptorNavigator(desc);
            return navigator.extractByType(typeID, this.valueType);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }
    }

    /**
     * Extract nested property value
     * Fixed: Proper reduce logic and error handling
     */
    private extractNestedValue(desc: ActionDescriptor): any {
        if (this.cachedPath.length < 2) {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }

        try {
            // Navigate to the parent of the final property
            const finalDesc = this.cachedPath.slice(0, -1).reduce((current, part) => {
                const typeID = stringIDToTypeID(part);
                if (!current.hasKey(typeID)) {
                    throw new Error(`Property '${part}' not found`);
                }
                return current.getObjectValue(typeID);
            }, desc);

            // Extract final value
            const finalPart = this.cachedPath[this.cachedPath.length - 1];
            return this.extractSingleValue(finalDesc, finalPart);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(this.valueType);
        }
    }

    /**
     * Validate and parse path with proper error handling
     */
    private validateAndParsePath(subPath: string): readonly string[] {
        if (!subPath || subPath.trim().length === 0) {
            return [];
        }

        const parts = subPath.split('.').filter(function(part) { 
            return part && part.trim().length > 0; 
        });
        return parts;
    }
}

export { ListValueExtractor };