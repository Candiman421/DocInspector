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
export type SelectManyFunction = (item: IActionDescriptorNavigator) => IActionDescriptorNavigator | IActionDescriptorNavigator[] | IEnumerableArray;
export type QueryBuilderFunction = (q: IStyleRangeQuery) => IStyleRangeQuery;

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

export interface PropertyExtractionMap {
    [propertyName: string]: 'getString' | 'getDouble' | 'getUnitDouble' | 'getInteger' | 'getBoolean' | 'getEnumerationString' | 
                           'getEnumerationId' | 'getData' | 'getClass' | 'getLargeInteger' | 'getObjectType' | 'getPath' | 'getReference' | 
                           'getUnitDoubleType' | 'getUnitDoubleValue' | 'getEnumerationType' | 'getType';
}

export interface QueryCriterion {
    path: string;
    operator: string;
    value: any;
}

export interface PropertySelection {
    name: string;
    path: string;
    method: string;
}

export interface CriteriaObject {
    [key: string]: any;
    [excludeKey: `!${string}`]: any;
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
    extract(propertyMap: PropertyExtractionMap): Record<string, any>;
    debug(label: string): IActionDescriptorNavigator;
}

export interface IActionListNavigator {
    readonly isSentinel: boolean;
    
    getCount(): number;
    getObject(index: number): any;
    getFirstObject(): any;
    getSingleObject(): any;
    
    firstWhere(predicate: PredicateFunction): any;
    singleWhere(predicate: PredicateFunction): any;
    query(builder: QueryBuilderFunction): any;
    queryAll(builder: QueryBuilderFunction): any[];
    
    asEnumerable(): any;
    debug(label: string): any;
}

export interface IStyleRangeQuery {
    where(path: string, operatorOrValue: any, value?: any): IStyleRangeQuery;
    select(properties: PropertySelection[]): IStyleRangeQuery;
    execute(list: any): any;
    executeAll(list: any): any[];
}

export interface IEnumerable {
    where(predicate: PredicateFunction): IEnumerable;
    
    first(): any;
    any(): boolean;
    count(): number;
    toArray(): any[];
    
    select<T>(selector: SelectorFunction<T>): IEnumerableArray;
    
    debug(label: string): IEnumerable;
}

export interface IEnumerableArray {
    readonly array: any[];
    
    where(predicate: (item: any) => boolean): IEnumerableArray;
    
    first(): any;
    toArray(): any[];
    
    select<T>(selector: (item: any) => T): IEnumerableArray;
    
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

export const COMMON_EXTRACTIONS = {
    FONT_BASIC: {
        fontName: 'getString',
        fontSize: 'getDouble',
        syntheticBold: 'getBoolean',
        syntheticItalic: 'getBoolean'
    } as PropertyExtractionMap,
    
    FONT_COMPLETE: {
        fontName: 'getString',
        fontPostScriptName: 'getString',
        fontStyleName: 'getString',
        fontSize: 'getDouble',
        horizontalScale: 'getDouble',
        verticalScale: 'getDouble',
        tracking: 'getDouble',
        leading: 'getDouble',
        syntheticBold: 'getBoolean',
        syntheticItalic: 'getBoolean',
        fontCaps: 'getEnumerationString',
        baseline: 'getEnumerationString',
        autoLeading: 'getBoolean'
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
        mode: 'getEnumerationString'
    } as PropertyExtractionMap,

    LAYER_COMPLETE: {
        name: 'getString',
        opacity: 'getDouble',
        visible: 'getBoolean',
        mode: 'getEnumerationString',
        layerID: 'getInteger',
        itemIndex: 'getInteger',
        isBackground: 'getBoolean'
    } as PropertyExtractionMap,

    WARP_BASIC: {
        warpStyle: 'getEnumerationString',
        warpValue: 'getDouble',
        warpPerspective: 'getDouble',
        warpRotate: 'getEnumerationString'
    } as PropertyExtractionMap,

    TEXT_RANGE: {
        from: 'getInteger',
        to: 'getInteger'
    } as PropertyExtractionMap
} as const;

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

export function isValidPropertyExtractionMap(obj: any): obj is PropertyExtractionMap {
    if (!obj || typeof obj !== 'object') return false;
    const validMethods = [
        'getString', 'getDouble', 'getUnitDouble', 'getInteger', 'getBoolean', 'getEnumerationString',
        'getEnumerationId', 'getData', 'getClass', 'getLargeInteger', 'getObjectType', 'getPath', 'getReference',
        'getUnitDoubleType', 'getUnitDoubleValue', 'getEnumerationType', 'getType'
    ];
    return Object.values(obj).every(method => validMethods.includes(method as string));
}