import { 
    executeActionGet, 
    stringIDToTypeID, 
    charIDToTypeID, 
    typeIDToStringID 
} from "../ps";

// =============================================================================
// SENTINEL VALUES
// =============================================================================
export var SENTINELS = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function getValueByType(obj, key) {
    var stringVal = obj.getString(key);
    if (stringVal !== SENTINELS.string) return stringVal;

    var doubleVal = obj.getDouble(key);
    if (doubleVal !== SENTINELS.double) return doubleVal;

    var intVal = obj.getInteger(key);
    if (intVal !== SENTINELS.integer) return intVal;

    var boolVal = obj.getBoolean(key);
    if (boolVal !== SENTINELS.boolean) return boolVal;

    var enumVal = obj.getEnumerated(key);
    if (enumVal !== SENTINELS.enumerated) return enumVal;

    return null;
}

function valuesMatch(actual, expected) {
    if (typeof expected === 'string' && typeof actual === 'string') {
        return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
export type PredicateFunction = (item: ActionDescriptorNavigator) => boolean;
export type SelectorFunction<T> = (item: ActionDescriptorNavigator) => T;

export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

export interface PropertyExtractionMap {
    [propertyName: string]: 'getString' | 'getDouble' | 'getUnitDouble' | 'getInteger' | 'getBoolean' | 'getEnumerated';
}

// =============================================================================
// ActionDescriptorNavigator
// =============================================================================
export class ActionDescriptorNavigator {
    public readonly isSentinel: boolean;
    private desc: ActionDescriptor | null;

    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    static forCurrentLayer(): ActionDescriptorNavigator {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static forCurrentDocument(): ActionDescriptorNavigator {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var searchName = layerName.toLowerCase().replace(/^\s+|\s+$/g, '');
        var layerCount = ActionDescriptorNavigator.getLayerCount();

        if (layerCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (var i = 1; i <= layerCount; i++) {
            var layer = ActionDescriptorNavigator.forLayerByIndex(i);
            var currentName = layer.getString('name');

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

        var ref = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            var desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            if (ref) ref = null;
        }
    }

    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    private static getLayerCount(): number {
        var ref = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e) {
            return -1;
        } finally {
            if (ref) ref = null;
        }
    }

    getObject(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            var nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    getList(key: string): ActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            var list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e) {
            return ActionListNavigator.createSentinel();
        }
    }

    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.string;
        }

        try {
            return this.desc.getString(typeID);
        } catch (e) {
            $.writeln('ERROR: getString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.string;
        }
    }

    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e) {
            $.writeln('ERROR: getDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    getUnitDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.double;
        }

        try {
            return this.desc.getDouble(typeID);
        } catch (e) {
            $.writeln('ERROR: getUnitDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.double;
        }
    }

    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.integer;
        }

        try {
            return this.desc.getInteger(typeID);
        } catch (e) {
            $.writeln('ERROR: getInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.integer;
        }
    }

    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.boolean;
        }

        try {
            return this.desc.getBoolean(typeID);
        } catch (e) {
            $.writeln('ERROR: getBoolean("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.boolean;
        }
    }

    getEnumerated(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.enumerated;
        }

        var typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return SENTINELS.enumerated;
        }

        try {
            var enumValue = this.desc.getEnumerationValue(typeID);
            var enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.enumerated;
        } catch (e) {
            $.writeln('ERROR: getEnumerated("' + key + '") failed - wrong type or invalid key: ' + e.message);
            return SENTINELS.enumerated;
        }
    }

    hasKey(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return false;
        }

        try {
            return this.desc.hasKey(stringIDToTypeID(key));
        } catch (e) {
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
            var boundsTypeID = stringIDToTypeID('bounds');
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

            var boundsDesc = this.desc.getObjectValue(boundsTypeID);
            var left = boundsDesc.getDouble(stringIDToTypeID('left'));
            var top = boundsDesc.getDouble(stringIDToTypeID('top'));
            var right = boundsDesc.getDouble(stringIDToTypeID('right'));
            var bottom = boundsDesc.getDouble(stringIDToTypeID('bottom'));

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };
        } catch (e) {
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

        var result = {};
        var keys = Object.keys(propertyMap);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var methodName = propertyMap[key];

            try {
                switch (methodName) {
                    case 'getString':
                        result[key] = this.getString(key);
                        break;
                    case 'getDouble':
                        result[key] = this.getDouble(key);
                        break;
                    case 'getUnitDouble':
                        result[key] = this.getUnitDouble(key);
                        break;
                    case 'getInteger':
                        result[key] = this.getInteger(key);
                        break;
                    case 'getBoolean':
                        result[key] = this.getBoolean(key);
                        break;
                    case 'getEnumerated':
                        result[key] = this.getEnumerated(key);
                        break;
                    default:
                        result[key] = null;
                        break;
                }
            } catch (e) {
                result[key] = null;
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
        } catch (e) {
            return null;
        }
    }

    debug(label: string): ActionDescriptorNavigator {
        try {
            $.writeln(label + ': ' + (this.isSentinel ? 'SENTINEL (failed)' : 'OK'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// ActionListNavigator
// =============================================================================
export class ActionListNavigator {
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
        } catch (e) {
            return -1;
        }
    }

    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            var obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch (e) {
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
        
        var count = this.getCount();
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
        var matches = this.asEnumerable().where(predicate).toArray();
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

    asEnumerable(): Enumerable {
        return new Enumerable(this);
    }

    debug(label: string): ActionListNavigator {
        try {
            var count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL (failed)' : 'OK (' + count + ' items)'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// Enumerable
// =============================================================================
export class Enumerable {
    private source: ActionListNavigator;
    private filters: PredicateFunction[];

    constructor(source: ActionListNavigator) {
        this.source = source;
        this.filters = [];
    }

    where(predicate: PredicateFunction): Enumerable {
        var newEnum = new Enumerable(this.source);
        newEnum.filters = this.filters.slice();
        newEnum.filters.push(predicate);
        return newEnum;
    }

    first(): ActionDescriptorNavigator {
        if (this.source.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        var count = this.source.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
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

        var count = this.source.getCount();
        if (count <= 0) {
            return false;
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
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

        var results = [];
        var count = this.source.getCount();

        if (count <= 0) {
            return [];
        }

        for (var i = 0; i < count; i++) {
            var item = this.source.getObject(i);
            if (item.isSentinel) continue;
            
            var matches = true;
            for (var f = 0; f < this.filters.length; f++) {
                try {
                    if (!this.filters[f](item)) {
                        matches = false;
                        break;
                    }
                } catch (e) {
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
        var items = this.toArray();
        var results = [];

        for (var i = 0; i < items.length; i++) {
            try {
                results.push(selector(items[i]));
            } catch (e) {
                // Graceful failure - continue with next item
            }
        }

        return new EnumerableArray(results);
    }

    debug(label: string): Enumerable {
        try {
            var count = this.count();
            $.writeln(label + ': ' + (count === 0 ? 'No matches' : 'Found ' + count + ' matches'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}

// =============================================================================
// EnumerableArray
// =============================================================================
export class EnumerableArray {
    public readonly array: any[];

    constructor(array: any[]) {
        this.array = array || [];
    }

    where(predicate: (item: any) => boolean): EnumerableArray {
        var filtered = [];
        for (var i = 0; i < this.array.length; i++) {
            try {
                if (predicate(this.array[i])) {
                    filtered.push(this.array[i]);
                }
            } catch (e) {
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
        var results = [];
        for (var i = 0; i < this.array.length; i++) {
            try {
                results.push(selector(this.array[i]));
            } catch (e) {
                // Skip failed selections
            }
        }
        return new EnumerableArray(results);
    }

    debug(label: string): EnumerableArray {
        try {
            $.writeln(label + ': ' + (this.array.length === 0 ? 'No items' : 'Found ' + this.array.length + ' items'));
        } catch (e) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}