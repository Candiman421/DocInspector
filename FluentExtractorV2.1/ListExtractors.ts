/**
 * Simple list extraction utilities for test assessment
 * Provides basic list processing for ActionManager patterns
 * Optimized for scoring with consistent error handling and performance
 */

import { stringIDToTypeID } from "./ps";
import { ValueType, ValueTransformer } from "./types";
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

/**
 * Interface for objects that can extract ActionLists from ActionDescriptors
 * Defined here to avoid circular dependencies in types.ts
 */
export interface ListExtractor {
    extract(rootDesc: ActionDescriptor): ActionList | null;
}

/**
 * Simple list value extractor for test assessment needs
 * Fixed: Constructor consistency, path traversal, transformer handling
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