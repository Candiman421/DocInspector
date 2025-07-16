/**
 * ExtendScript type definitions for Photoshop ActionManager
 * Add this file to your project and reference it in tsconfig.json
 */

// Core ExtendScript types for Photoshop
declare class ActionDescriptor {
    hasKey(key: number): boolean;
    getString(key: number): string;
    getInteger(key: number): number;
    getDouble(key: number): number;
    getBoolean(key: number): boolean;
    getEnumerationValue(key: number): number;
    getObjectValue(key: number): ActionDescriptor;
    getList(key: number): ActionList;
    putString(key: number, value: string): void;
    putInteger(key: number, value: number): void;
    putDouble(key: number, value: number): void;
    putBoolean(key: number, value: boolean): void;
    putEnumerated(key: number, enumType: number, value: number): void;
    putObject(key: number, classID: number, descriptor: ActionDescriptor): void;
    putList(key: number, list: ActionList): void;
}

declare class ActionList {
    count: number;
    getType(index: number): number;
    getString(index: number): string;
    getInteger(index: number): number;
    getDouble(index: number): number;
    getBoolean(index: number): boolean;
    getEnumerationValue(index: number): number;
    getObjectValue(index: number): ActionDescriptor;
    getList(index: number): ActionList;
    putString(value: string): void;
    putInteger(value: number): void;
    putDouble(value: number): void;
    putBoolean(value: boolean): void;
    putEnumerated(enumType: number, value: number): void;
    putObject(classID: number, descriptor: ActionDescriptor): void;
    putList(list: ActionList): void;
}

declare class ActionReference {
    putEnumerated(desiredClass: number, enumType: number, value: number): void;
    putIndex(desiredClass: number, value: number): void;
    putName(desiredClass: number, value: string): void;
    putProperty(desiredClass: number, property: number): void;
}

declare enum DescValueType {
    OBJECTTYPE = 1,
    LISTTYPE = 2,
    REFERENCETYPE = 3,
    CLASSTYPE = 4,
    ENUMTYPE = 5,
    STRINGTYPE = 6,
    INTEGERTYPE = 7,
    DOUBLETYPE = 8,
    ALIASTYPE = 9,
    BOOLEANTYPE = 10,
    RAWTYPE = 11
}

// Global functions
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;
declare function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogMode?: number): ActionDescriptor;

// Console for ExtendScript environment
declare var console: {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
};