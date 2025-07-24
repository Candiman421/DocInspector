/**
 * Core Type System for ActionDescriptor Navigation Framework V4.1
 * TypeScript definitions for LINQ-style navigation and scoring operations
 * 
 * Usage: Reference this file in your TypeScript project for intellisense
 * Note: This is for type definitions only - the actual implementation is in ActionDescriptorNavigator.js
 */

// =============================================================================
// CORE VALUE TYPES
// =============================================================================

/**
 * Supported value types mapping to ActionDescriptor getter methods
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Type-safe sentinel values for missing/failed data extraction
 */
export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

/**
 * Sentinel value lookup map for runtime access
 */
export interface SentinelValueMap {
    readonly "string": "";
    readonly "enumerated": "";
    readonly "integer": -1;
    readonly "double": -1;
    readonly "boolean": false;
}

// =============================================================================
// NAVIGATION INTERFACES
// =============================================================================

/**
 * Core ActionDescriptor navigator interface
 */
export interface IActionDescriptorNavigator {
    readonly isSentinel: boolean;
    
    // Navigation methods (standardized with get* prefix)
    getObject(key: string): IActionDescriptorNavigator;
    getList(key: string): IActionListNavigator;
    
    // Value extraction methods (your preferred style)
    getString(key: string): string;
    getDouble(key: string): number;
    getUnitDouble(key: string): number;
    getInteger(key: string): number;
    getBoolean(key: string): boolean;
    getEnumerated(key: string): string;
    
    // Utility methods
    hasKey(key: string): boolean;
    getBounds(): BoundsObject;
    select<T>(selector: SelectorFunction<T>): T | null;
    extract(propertyMap: PropertyExtractionMap): Record<string, any>;
    debug(label: string): IActionDescriptorNavigator;
}

/**
 * ActionList navigator interface for collection operations
 */
export interface IActionListNavigator {
    readonly isSentinel: boolean;
    
    // Basic operations
    getCount(): number;
    getObject(index: number): IActionDescriptorNavigator;
    
    // LINQ-style operations
    asEnumerable(): IEnumerable;
    debug(label: string): IActionListNavigator;
}

/**
 * LINQ-style enumerable interface for filtering/querying
 */
export interface IEnumerable {
    // Filtering
    where(criteria: CriteriaObject | PredicateFunction): IEnumerable;
    
    // Terminal operations
    first(): IActionDescriptorNavigator;
    firstOrDefault(): IActionDescriptorNavigator;
    toArray(): IActionDescriptorNavigator[];
    any(): boolean;
    count(): number;
    
    // Projection (key for scoring scripts)
    select<T>(selector: SelectorFunction<T>): IEnumerableArray;
    selectMany(selector: SelectManyFunction): IEnumerableArray;
    
    // Debugging
    debug(label: string): IEnumerable;
}

/**
 * Collection of projected results from LINQ operations
 */
export interface IEnumerableArray {
    readonly array: any[];
    
    // Filtering (simplified for projected data)
    where(predicate: (item: any) => boolean): IEnumerableArray;
    
    // Terminal operations
    first(): any;
    toArray(): any[];
    
    // Projection
    select<T>(selector: (item: any) => T): IEnumerableArray;
    
    // Debugging
    debug(label: string): IEnumerableArray;
}

// =============================================================================
// LINQ OPERATION TYPES
// =============================================================================

/**
 * Criteria object for filtering operations
 * Supports both inclusion and exclusion (with ! prefix)
 */
export interface CriteriaObject {
    [key: string]: any;
    [excludeKey: `!${string}`]: any;
}

/**
 * Property extraction mapping for extract() method
 */
export interface PropertyExtractionMap {
    [propertyName: string]: 'getString' | 'getDouble' | 'getUnitDouble' | 'getInteger' | 'getBoolean' | 'getEnumerated';
}

/**
 * Function types for LINQ operations
 */
export type PredicateFunction = (item: IActionDescriptorNavigator) => boolean;
export type SelectorFunction<T> = (item: IActionDescriptorNavigator) => T;
export type SelectManyFunction = (item: IActionDescriptorNavigator) => IActionDescriptorNavigator | IActionDescriptorNavigator[] | IEnumerableArray;

// =============================================================================
// BOUNDS AND LAYOUT TYPES
// =============================================================================

/**
 * Layer bounds with calculated dimensions
 */
export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Type guard for valid bounds (non-sentinel)
 */
export function hasValidBounds(bounds: BoundsObject): boolean {
    return bounds.left !== -1 && bounds.top !== -1 &&
           bounds.width > 0 && bounds.height > 0;
}

// =============================================================================
// COMMON PROPERTY EXTRACTION TYPES (for scoring scripts)
// =============================================================================

/**
 * Font style properties for typography analysis
 */
export interface FontStyleProperties {
    readonly fontName: string;
    readonly fontPostScriptName: string;
    readonly fontSize: number;
    readonly horizontalScale: number;
    readonly verticalScale: number;
    readonly tracking: number;
    readonly autoKern: string;
    readonly fontCaps: string;
    readonly syntheticBold: boolean;
    readonly syntheticItalic: boolean;
    readonly autoLeading: boolean;
}

/**
 * RGB color properties
 */
export interface ColorProperties {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}

/**
 * Text warp effect properties
 */
export interface WarpProperties {
    readonly warpStyle: string;
    readonly warpValue: number;
    readonly warpPerspective: number;
    readonly warpRotate: string;
}

/**
 * Layer properties for analysis
 */
export interface LayerProperties {
    readonly name: string;
    readonly opacity: number;
    readonly visible: boolean;
    readonly mode: string;
    readonly layerID: number;
    readonly itemIndex: number;
    readonly bounds: BoundsObject;
    readonly hasTextKey: boolean;
    readonly isBackground: boolean;
    readonly isLocked: boolean;
}

// =============================================================================
// SCORING SCRIPT CONVENIENCE TYPES
// =============================================================================

/**
 * Common projection patterns for scoring scripts
 */
export type FontDataProjection = {
    name: string;
    size: number;
    bold: boolean;
    caps: string;
};

export type ColorDataProjection = {
    red: number;
    green: number;
    blue: number;
};

export type TextStyleProjection = {
    fontName: string;
    fontSize: number;
    fontCaps: string;
    syntheticBold: boolean;
    color: ColorDataProjection;
};

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Standard sentinel values as typed constants
 */
export const SENTINELS: SentinelValueMap = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
} as const;

/**
 * Common property extraction maps for convenience
 */
export const COMMON_EXTRACTIONS = {
    FONT_BASIC: {
        fontName: 'getString',
        fontSize: 'getDouble',
        syntheticBold: 'getBoolean',
        syntheticItalic: 'getBoolean'
    } as PropertyExtractionMap,
    
    COLOR_RGB: {
        red: 'getDouble',
        green: 'getDouble',
        blue: 'getDouble'
    } as PropertyExtractionMap,
    
    LAYER_BASIC: {
        name: 'getString',
        opacity: 'getDouble',
        visible: 'getBoolean',
        mode: 'getEnumerated'
    } as PropertyExtractionMap,

    WARP_BASIC: {
        warpStyle: 'getEnumerated',
        warpValue: 'getDouble',
        warpPerspective: 'getDouble',
        warpRotate: 'getEnumerated'
    } as PropertyExtractionMap
} as const;

// =============================================================================
// TYPE GUARDS AND VALIDATION
// =============================================================================

/**
 * Type guard for checking if value is valid ValueType
 */
export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
           ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

/**
 * Type guard for checking if value is sentinel
 */
export function isSentinelValue(value: any, type: ValueType): boolean {
    switch (type) {
        case 'string':
        case 'enumerated':
            return value === '';
        case 'integer':
        case 'double':
            return value === -1;
        case 'boolean':
            return value === false;
        default:
            return false;
    }
}

/**
 * Type guard for ActionDescriptorNavigator
 */
export function isActionDescriptorNavigator(obj: any): obj is IActionDescriptorNavigator {
    return obj && typeof obj.getObject === 'function' && typeof obj.getString === 'function';
}

/**
 * Type guard for ActionListNavigator
 */
export function isActionListNavigator(obj: any): obj is IActionListNavigator {
    return obj && typeof obj.getCount === 'function' && typeof obj.asEnumerable === 'function';
}