import { 
    executeActionGet, 
    stringIDToTypeID, 
    charIDToTypeID, 
    typeIDToStringID 
} from "../ps";

import {
    SENTINELS,
    PredicateFunction,
    SelectorFunction,
    BoundsObject,
    PropertyExtractionMap,
    QueryCriterion,
    PropertySelection,
    QueryBuilderFunction,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IStyleRangeQuery,
    IEnumerable,
    IEnumerableArray
} from "./types";

function getValueByType(obj: any, key: any) {
    const stringVal = obj.getString(key);
    if (stringVal !== SENTINELS.string) return stringVal;

    const doubleVal = obj.getDouble(key);
    if (doubleVal !== SENTINELS.double) return doubleVal;

    const intVal = obj.getInteger(key);
    if (intVal !== SENTINELS.integer) return intVal;

    const boolVal = obj.getBoolean(key);
    if (boolVal !== SENTINELS.boolean) return boolVal;

    const enumVal = obj.getEnumerationString(key);
    if (enumVal !== SENTINELS.enumerated) return enumVal;

    return null;
}

function valuesMatch(actual: any, expected: any) {
    if (typeof expected === 'string' && typeof actual === 'string') {
        return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
}

export class StyleRangeQuery implements IStyleRangeQuery {
    private criteria: QueryCriterion[];
    private selectedProps: PropertySelection[];

    constructor() {
        this.criteria = [];
        this.selectedProps = [];
    }

    where(path: string, operatorOrValue: any, value?: any): StyleRangeQuery {
        if (value === undefined) {
            this.criteria.push({path: path, operator: '===', value: operatorOrValue});
        } else {
            this.criteria.push({path: path, operator: operatorOrValue, value: value});
        }
        return this;
    }

    select(properties: PropertySelection[]): StyleRangeQuery {
        this.selectedProps = properties.slice();
        return this;
    }

    execute(list: any): any {
        const found = list.firstWhere(this.createPredicateFunction());
        
        if (found.isSentinel) {
            return null;
        }
        
        return this.extractProperties(found);
    }

    executeAll(list: any): any[] {
        const matches = list.asEnumerable().where(this.createPredicateFunction()).toArray();
        const results: any[] = [];
        
        for (let i = 0; i < matches.length; i++) {
            results.push(this.extractProperties(matches[i]));
        }
        
        return results;
    }

    private createPredicateFunction(): PredicateFunction {
        const criteria = this.criteria;
        const self = this;
        
        return function(obj: any): boolean {
            for (let i = 0; i < criteria.length; i++) {
                const criterion = criteria[i];
                const actualValue = self.extractValueAtPath(obj, criterion.path);
                
                if (!self.compareValues(actualValue, criterion.operator, criterion.value)) {
                    return false;
                }
            }
            return true;
        };
    }

    private extractProperties(obj: any): any {
        const result: any = {};
        
        for (let i = 0; i < this.selectedProps.length; i++) {
            const prop = this.selectedProps[i];
            result[prop.name] = this.extractValueAtPath(obj, prop.path, prop.method);
        }
        
        return result;
    }

    private extractValueAtPath(obj: any, path: string, method?: string): any {
        const navigator = this.navigateToPath(obj, path);
        const leafProperty = this.getLeafProperty(path);
        const getterMethod = method || 'getString';
        
        switch (getterMethod) {
            case 'getString':
                return navigator.getString(leafProperty);
            case 'getDouble':
                return navigator.getDouble(leafProperty);
            case 'getUnitDouble':
                return navigator.getUnitDouble(leafProperty);
            case 'getInteger':
                return navigator.getInteger(leafProperty);
            case 'getBoolean':
                return navigator.getBoolean(leafProperty);
            case 'getEnumerationString':
                return navigator.getEnumerationString(leafProperty);
            case 'getEnumerationId':
                return navigator.getEnumerationId(leafProperty);
            default:
                return null;
        }
    }

    private navigateToPath(obj: any, path: string): any {
        const parts = path.split('.');
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part.indexOf('[') !== -1 && part.indexOf(']') !== -1) {
                const listName = part.substring(0, part.indexOf('['));
                const indexStr = part.substring(part.indexOf('[') + 1, part.indexOf(']'));
                const index = parseInt(indexStr);
                current = current.getList(listName).getObject(index);
            } else {
                current = current.getObject(part);
            }
            if (current.isSentinel) {
                return current;
            }
        }
        
        return current;
    }

    private getLeafProperty(path: string): string {
        const parts = path.split('.');
        const lastPart = parts[parts.length - 1];
        if (lastPart.indexOf('[') !== -1) {
            return lastPart.substring(0, lastPart.indexOf('['));
        }
        return lastPart;
    }

    private compareValues(actual: any, operator: string, expected: any): boolean {
        switch (operator) {
            case '===':
            case '==':
                return valuesMatch(actual, expected);
            case '!==':
            case '!=':
                return !valuesMatch(actual, expected);
            case '>':
                return actual > expected;
            case '>=':
                return actual >= expected;
            case '<':
                return actual < expected;
            case '<=':
                return actual <= expected;
            case 'contains':
                return typeof actual === 'string' && typeof expected === 'string' &&
                       actual.toLowerCase().indexOf(expected.toLowerCase()) >= 0;
            case 'between':
                return Array.isArray(expected) && expected.length === 2 &&
                       actual >= expected[0] && actual <= expected[1];
            default:
                return valuesMatch(actual, expected);
        }
    }
}

export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    public readonly isSentinel: boolean;
    private desc: ActionDescriptor | null;

    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    static forCurrentLayer(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static forCurrentDocument(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const searchName = layerName.toLowerCase().replace(/^\s+|\s+$/g, '');
        const layerCount = ActionDescriptorNavigator.getLayerCount();

        if (layerCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 1; i <= layerCount; i++) {
            const layer = ActionDescriptorNavigator.forLayerByIndex(i);
            const currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().replace(/^\s+|\s+$/g, '') === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    private static getLayerCount(): number {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e: any) {
            return -1;
        } finally {
            if (ref) ref = null;
        }
    }

    getObject(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    getList(key: string): ActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e: any) {
            return ActionListNavigator.createSentinel();
        }
    }

    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.string;
        }

        try {
            return this.desc.getString(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.string;
        }
    }

    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    getUnitDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getUnitDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getInteger(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.boolean;
        }

        try {
            return this.desc.getBoolean(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getBoolean("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.boolean;
        }
    }

    getEnumerationString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.enumerated;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.enumerated;
        }

        try {
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.enumerated;
        } catch (e: any) {
            $.writeln('ERROR: getEnumerationString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.enumerated;
        }
    }

    getData(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.string;
        }

        try {
            return this.desc.getData(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getData("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.string;
        }
    }

    getClass(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getClass(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getClass("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getLargeInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getLargeInteger(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getLargeInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getObjectType(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getObjectType(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getObjectType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getPath(key: string): File | null {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return null;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return null;
        }

        try {
            return this.desc.getPath(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getPath("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return null;
        }
    }

    getReference(key: string): ActionReference | null {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return null;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return null;
        }

        try {
            return this.desc.getReference(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getReference("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return null;
        }
    }

    getUnitDoubleType(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getUnitDoubleType(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getUnitDoubleType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getUnitDoubleValue(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getUnitDoubleValue(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getUnitDoubleValue("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    getEnumerationType(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getEnumerationType(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getEnumerationType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getEnumerationId(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getEnumerationValue(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getEnumerationId("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getType(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getType(typeID);
        } catch (e: any) {
            $.writeln('ERROR: getType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    hasKey(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return false;
        }

        try {
            return this.desc.hasKey(stringIDToTypeID(key));
        } catch (e: any) {
            return false;
        }
    }

    getBounds(): BoundsObject {
        if (this.isSentinel || !this.desc) {
            return {
                left: SENTINELS.double,
                top: SENTINELS.double,
                right: SENTINELS.double,
                bottom: SENTINELS.double,
                width: SENTINELS.double,
                height: SENTINELS.double
            };
        }

        try {
            const boundsTypeID = stringIDToTypeID('bounds');
            if (!this.desc.hasKey(boundsTypeID)) {
                return {
                    left: SENTINELS.double,
                    top: SENTINELS.double,
                    right: SENTINELS.double,
                    bottom: SENTINELS.double,
                    width: SENTINELS.double,
                    height: SENTINELS.double
                };
            }

            const boundsDesc = this.desc.getObjectValue(boundsTypeID);
            const left = boundsDesc.getDouble(stringIDToTypeID('left'));
            const top = boundsDesc.getDouble(stringIDToTypeID('top'));
            const right = boundsDesc.getDouble(stringIDToTypeID('right'));
            const bottom = boundsDesc.getDouble(stringIDToTypeID('bottom'));

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };
        } catch (e: any) {
            return {
                left: SENTINELS.double,
                top: SENTINELS.double,
                right: SENTINELS.double,
                bottom: SENTINELS.double,
                width: SENTINELS.double,
                height: SENTINELS.double
            };
        }
    }

    extract(propertyMap: PropertyExtractionMap): Record<string, any> {
        if (this.isSentinel) {
            return {};
        }

        const result: any = {};
        const keys = Object.keys(propertyMap);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const methodName = propertyMap[key];

            try {
                switch (methodName) {
                    case 'getString':
                        (result as any)[key] = this.getString(key);
                        break;
                    case 'getDouble':
                        (result as any)[key] = this.getDouble(key);
                        break;
                    case 'getUnitDouble':
                        (result as any)[key] = this.getUnitDouble(key);
                        break;
                    case 'getInteger':
                        (result as any)[key] = this.getInteger(key);
                        break;
                    case 'getBoolean':
                        (result as any)[key] = this.getBoolean(key);
                        break;
                    case 'getEnumerationString':
                        (result as any)[key] = this.getEnumerationString(key);
                        break;
                    case 'getEnumerationId':
                        (result as any)[key] = this.getEnumerationId(key);
                        break;
                    default:
                        (result as any)[key] = null;
                        break;
                }
            } catch (e: any) {
                (result as any)[key] = null;
            }
        }

        return result;
    }

    select<T>(selector: SelectorFunction<T>): T | null {
        if (this.isSentinel) {
            return null;
        }

        try {
            return selector(this);
        } catch (e: any) {
            return null;
        }
    }

    debug(label: string): ActionDescriptorNavigator {
        try {
            $.writeln(label + ': ' + (this.isSentinel ? 'SENTINEL (failed)' : 'OK'));
        } catch (e: any) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

export class ActionListNavigator implements IActionListNavigator {
    public readonly isSentinel: boolean;
    private list: ActionList | null;

    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch (e: any) {
            return -1;
        }
    }

    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    getFirstObject(): ActionDescriptorNavigator {
        if (this.isSentinel || this.getCount() <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }
        return this.getObject(0);
    }

    getSingleObject(): ActionDescriptorNavigator {
        if (this.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }
        
        const count = this.getCount();
        if (count === 0) {
            $.writeln('WARNING: getSingleObject() - No objects found in list');
            return ActionDescriptorNavigator.createSentinel();
        }
        if (count > 1) {
            $.writeln('WARNING: getSingleObject() - Multiple objects found (' + count + '), expected exactly one');
            return ActionDescriptorNavigator.createSentinel();
        }
        return this.getObject(0);
    }

    firstWhere(predicate: PredicateFunction): ActionDescriptorNavigator {
        return this.asEnumerable().where(predicate).first();
    }

    singleWhere(predicate: PredicateFunction): ActionDescriptorNavigator {
        const matches = this.asEnumerable().where(predicate).toArray();
        if (matches.length === 0) {
            $.writeln('WARNING: singleWhere() - No objects matched criteria');
            return ActionDescriptorNavigator.createSentinel();
        }
        if (matches.length > 1) {
            $.writeln('WARNING: singleWhere() - Multiple objects matched (' + matches.length + '), expected exactly one');
            return ActionDescriptorNavigator.createSentinel();
        }
        return matches[0];
    }

    query(builder: QueryBuilderFunction): any {
        const query = builder(new StyleRangeQuery());
        return query.execute(this);
    }

    queryAll(builder: QueryBuilderFunction): any[] {
        const query = builder(new StyleRangeQuery());
        return query.executeAll(this);
    }

    asEnumerable(): Enumerable {
        return new Enumerable(this);
    }

    debug(label: string): ActionListNavigator {
        try {
            const count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL (failed)' : 'OK (' + count + ' items)'));
        } catch (e: any) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

export class Enumerable implements IEnumerable {
    private source: ActionListNavigator;
    private filters: PredicateFunction[];

    constructor(source: ActionListNavigator) {
        this.source = source;
        this.filters = [];
    }

    where(predicate: PredicateFunction): Enumerable {
        const newEnum = new Enumerable(this.source);
        newEnum.filters = this.filters.slice();
        newEnum.filters.push(predicate);
        return newEnum;
    }

    first(): ActionDescriptorNavigator {
        if (this.source.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const count = this.source.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            let matches = true;
            for (let f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e: any) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return item;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    any(): boolean {
        if (this.source.isSentinel) {
            return false;
        }

        const count = this.source.getCount();
        if (count <= 0) {
            return false;
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            let matches = true;
            for (let f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e: any) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return true;
            }
        }

        return false;
    }

    count(): number {
        return this.toArray().length;
    }

    toArray(): ActionDescriptorNavigator[] {
        if (this.source.isSentinel) {
            return [];
        }

        const results: ActionDescriptorNavigator[] = [];
        const count = this.source.getCount();

        if (count <= 0) {
            return [];
        }

        for (let i = 0; i < count; i++) {
            const item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            let matches = true;
            for (let f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e: any) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                results.push(item);
            }
        }

        return results;
    }

    select<T>(selector: SelectorFunction<T>): EnumerableArray {
        const items = this.toArray();
        const results: T[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                results.push(selector(items[i]));
            } catch (e: any) {
                // Graceful failure - continue with next item
            }
        }

        return new EnumerableArray(results);
    }

    debug(label: string): Enumerable {
        try {
            const count = this.count();
            $.writeln(label + ': ' + (count === 0 ? 'No matches' : 'Found ' + count + ' matches'));
        } catch (e: any) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

export class EnumerableArray implements IEnumerableArray {
    public readonly array: any[];

    constructor(array: any[]) {
        this.array = array || [];
    }

    where(predicate: (item: any) => boolean): EnumerableArray {
        const filtered: any[] = [];
        for (let i = 0; i < this.array.length; i++) {
            try {
                if (predicate(this.array[i])) {
                    filtered.push(this.array[i]);
                }
            } catch (e: any) {
                // Skip failed matches
            }
        }
        return new EnumerableArray(filtered);
    }

    first(): any {
        return this.array.length > 0 ? this.array[0] : null;
    }

    toArray(): any[] {
        return this.array.slice();
    }

    select<T>(selector: (item: any) => T): EnumerableArray {
        const results: T[] = [];
        for (let i = 0; i < this.array.length; i++) {
            try {
                results.push(selector(this.array[i]));
            } catch (e: any) {
                // Skip failed selections
            }
        }
        return new EnumerableArray(results);
    }

    debug(label: string): EnumerableArray {
        try {
            $.writeln(label + ': ' + (this.array.length === 0 ? 'No items' : 'Found ' + this.array.length + ' items'));
        } catch (e: any) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}