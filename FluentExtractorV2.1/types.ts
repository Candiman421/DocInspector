/**
 * Shared type definitions for ActionDescriptor navigation system
 * Centralizes all common types - framework integration ready
 */

// Core types - KEEP when migrating to framework

/**
 * Supported value types in ActionDescriptor system
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Type-safe sentinel values for missing data
 */
export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

/**
 * Sentinel value map for runtime lookup
 */
export type SentinelValueMap = {
    readonly string: "";
    readonly enumerated: "";
    readonly integer: -1;
    readonly "double": -1;
    readonly boolean: false;
};

/**
 * Function type for transforming extracted values
 */
export interface ValueTransformer {
    (value: any): any;
}

/**
 * Options for value extraction with fallbacks and transformations
 */
export interface ComparisonOptions {
    readonly tolerance?: number;
    readonly transformer?: ValueTransformer;
    readonly defaultValue?: any;
}

// Removed ListExtractor interface - moved to ListExtractors.ts to avoid circular dependencies

/**
 * Bounds property identifiers
 */
export type BoundsProperty = 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height';

/**
 * Path segment types for navigation
 */
export interface PathSegment {
    readonly key: string;
    readonly type: 'object' | 'list' | 'value';
    readonly valueType?: ValueType;
    readonly index?: number;
}