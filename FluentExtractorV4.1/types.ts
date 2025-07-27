declare global {
    var $: {
        writeln(message: string): void;
    };

    class ActionReference {
        constructor();
        putEnumerated(classID: number, typeID: number, enumID: number): void;
        putIndex(classID: number, index: number): void;
        putProperty(classID: number, propertyID: number): void;
        putName(classID: number, name: string): void;
        putIdentifier(classID: number, identifier: number): void;
        putOffset(classID: number, offset: number): void;
    }

    class ActionDescriptor {
        constructor();
        count: number;
        hasKey(key: number): boolean;
        getObjectValue(key: number): ActionDescriptor;
        getList(key: number): ActionList;
        getString(key: number): string;
        getDouble(key: number): number;
        getInteger(key: number): number;
        getBoolean(key: number): boolean;
        getEnumerationValue(key: number): number;
        getEnumerationType(key: number): number;
        getReference(key: number): ActionReference;
        getClass(key: number): number;
        getPath(key: number): File;
        getData(key: number): string;
        getType(key: number): number;
        getUnitDoubleType(key: number): number;
        getUnitDoubleValue(key: number): number;
        getLargeInteger(key: number): number;
        getObjectType(key: number): number;
    }

    class ActionList {
        constructor();
        count: number;
        getObjectValue(index: number): ActionDescriptor;
        getString(index: number): string;
        getDouble(index: number): number;
        getInteger(index: number): number;
        getBoolean(index: number): boolean;
        getEnumerationValue(index: number): number;
        getReference(index: number): ActionReference;
        getClass(index: number): number;
        getList(index: number): ActionList;
        getType(index: number): number;
        getData(index: number): string;
        getPath(index: number): File;
        getUnitDoubleType(index: number): number;
        getUnitDoubleValue(index: number): number;
        getLargeInteger(index: number): number;
        getObjectType(index: number): number;
        getEnumerationType(index: number): number;
    }

    function executeActionGet(reference: ActionReference): ActionDescriptor;
    function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogOptions?: number): ActionDescriptor;
    function stringIDToTypeID(stringID: string): number;
    function typeIDToStringID(typeID: number): string;
    function charIDToTypeID(charID: string): number;
    function typeIDToCharID(typeID: number): string;
    function localize(text: string, ...args: any[]): string;
}

export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

export interface SentinelValueMap {
    readonly "string": "";
    readonly "enumerated": "";
    readonly "integer": -1;
    readonly "double": -1;
    readonly "boolean": false;
}

export const SENTINELS: SentinelValueMap = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
} as const;

export type PredicateFunction = (item: any) => boolean;
export type SelectorFunction<T> = (item: any) => T;

export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

export function hasValidBounds(bounds: BoundsObject): boolean {
    return bounds.left !== -1 && bounds.top !== -1 &&
           bounds.width > 0 && bounds.height > 0;
}

export interface IActionDescriptorNavigator {
    readonly isSentinel: boolean;
    
    getObject(key: string): IActionDescriptorNavigator;
    getList(key: string): IActionListNavigator;
    
    getString(key: string): string;
    getDouble(key: string): number;
    getUnitDouble(key: string): number;
    getInteger(key: string): number;
    getBoolean(key: string): boolean;
    getEnumerationString(key: string): string;
    getEnumerationId(key: string): number;
    
    getData(key: string): string;
    getClass(key: string): number;
    getLargeInteger(key: string): number;
    getObjectType(key: string): number;
    getPath(key: string): File | null;
    getReference(key: string): ActionReference | null;
    getUnitDoubleType(key: string): number;
    getUnitDoubleValue(key: string): number;
    getEnumerationType(key: string): number;
    getType(key: string): number;
    
    hasKey(key: string): boolean;
    getBounds(): BoundsObject;
    select<T>(selector: SelectorFunction<T>): T | null;
    debug(label: string): IActionDescriptorNavigator;
}

export interface IActionListNavigator {
    readonly isSentinel: boolean;
    
    getCount(): number;
    getObject(index: number): IActionDescriptorNavigator;
    
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    
    whereMatches(predicate: PredicateFunction): IEnumerable;
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;
    
    asEnumerable(): IEnumerable;
    debug(label: string): IActionListNavigator;
}

export interface IEnumerable {
    whereMatches(predicate: PredicateFunction): IEnumerable;
    
    getFirst(): IActionDescriptorNavigator;
    hasAnyMatches(): boolean;
    getCount(): number;
    toResultArray(): IActionDescriptorNavigator[];
    
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;
    
    debug(label: string): IEnumerable;
}

export interface IEnumerableArray {
    readonly array: any[];
    
    whereMatches(predicate: (item: any) => boolean): IEnumerableArray;
    
    getFirst(): any;
    getCount(): number;
    hasAnyMatches(): boolean;
    toResultArray(): any[];
    
    select<T>(transformer: (item: any) => T): IEnumerableArray;
    
    debug(label: string): IEnumerableArray;
}

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

export interface ColorProperties {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}

export interface WarpProperties {
    readonly warpStyle: string;
    readonly warpValue: number;
    readonly warpPerspective: number;
    readonly warpRotate: string;
}

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

export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
           ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

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

export function isActionDescriptorNavigator(obj: any): obj is IActionDescriptorNavigator {
    return obj && typeof obj.getObject === 'function' && typeof obj.getString === 'function';
}

export function isActionListNavigator(obj: any): obj is IActionListNavigator {
    return obj && typeof obj.getCount === 'function' && typeof obj.asEnumerable === 'function';
}