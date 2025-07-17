/**
 * Shared type definitions for ActionDescriptor navigation system
 * Centralizes all common types to eliminate duplication
 */

// ActionManager functions - REMOVE when migrating to framework
declare function stringIDToTypeID(stringID: string): number;
declare function charIDToTypeID(charID: string): number;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;
declare function executeAction(eventID: number, desc?: ActionDescriptor, mode?: any): ActionDescriptor;

// Global interfaces - REMOVE when migrating to framework
declare global {
    interface ActionDescriptor {
        hasKey(typeID: number): boolean;
        getString(typeID: number): string;
        getInteger(typeID: number): number;
        getDouble(typeID: number): number;
        getBoolean(typeID: number): boolean;
        getEnumerationValue(typeID: number): number;
        getObjectValue(typeID: number): ActionDescriptor;
        getList(typeID: number): ActionList;
    }

    interface ActionList {
        count: number;
        getObjectValue(index: number): ActionDescriptor;
    }

    // Fixed: Declare as constructable class, not interface
    var ActionReference: {
        new(): ActionReference;
        prototype: ActionReference;
    };

    interface ActionReference {
        putEnumerated(classID: number, typeID: number, enumValue: number): void;
        putIndex(classID: number, index: number): void;
        putProperty(classID: number, propertyID: number): void;
    }
}

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
    readonly double: -1;
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

/**
 * Interface for objects that can extract ActionLists from ActionDescriptors
 */
export interface ListExtractor {
    extract(rootDesc: ActionDescriptor): ActionList;
}

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