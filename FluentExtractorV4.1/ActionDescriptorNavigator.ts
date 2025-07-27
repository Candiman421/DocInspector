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
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray
} from "./types";

interface Operation {
    type: 'filter' | 'transform';
    predicate?: PredicateFunction;
    transformer?: SelectorFunction<any>;
}

class CachedActionDescriptor {
    private cache = new Map<string, any>();
    private descriptor: ActionDescriptor;

    constructor(descriptor: ActionDescriptor) {
        this.descriptor = descriptor;
    }

    getString(key: string): string {
        const cacheKey = `string:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.string);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getString(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.string);
            }
        }
        return this.cache.get(cacheKey);
    }

    getDouble(key: string): number {
        const cacheKey = `double:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.double);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getDouble(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.double);
            }
        }
        return this.cache.get(cacheKey);
    }

    getUnitDouble(key: string): number {
        const cacheKey = `unitDouble:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.double);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getUnitDoubleValue(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.double);
            }
        }
        return this.cache.get(cacheKey);
    }

    getInteger(key: string): number {
        const cacheKey = `integer:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.integer);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getInteger(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.integer);
            }
        }
        return this.cache.get(cacheKey);
    }

    getBoolean(key: string): boolean {
        const cacheKey = `boolean:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.boolean);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getBoolean(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.boolean);
            }
        }
        return this.cache.get(cacheKey);
    }

    getEnumerationString(key: string): string {
        const cacheKey = `enumeration:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, SENTINELS.enumerated);
                } else {
                    const enumValue = this.descriptor.getEnumerationValue(typeID);
                    const enumString = typeIDToStringID(enumValue);
                    this.cache.set(cacheKey, enumString || SENTINELS.enumerated);
                }
            } catch (e: any) {
                this.cache.set(cacheKey, SENTINELS.enumerated);
            }
        }
        return this.cache.get(cacheKey);
    }

    getObject(key: string): ActionDescriptor | null {
        const cacheKey = `object:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, null);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getObjectValue(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, null);
            }
        }
        return this.cache.get(cacheKey);
    }

    getList(key: string): ActionList | null {
        const cacheKey = `list:${key}`;
        if (!this.cache.has(cacheKey)) {
            try {
                const typeID = stringIDToTypeID(key);
                if (!this.descriptor.hasKey(typeID)) {
                    this.cache.set(cacheKey, null);
                } else {
                    this.cache.set(cacheKey, this.descriptor.getList(typeID));
                }
            } catch (e: any) {
                this.cache.set(cacheKey, null);
            }
        }
        return this.cache.get(cacheKey);
    }

    clearCache(): void {
        this.cache.clear();
    }
}

class LazyEnumerable implements IEnumerable {
    private operations: Operation[] = [];
    private source: ActionListNavigator;

    constructor(source: ActionListNavigator) {
        this.source = source;
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        const newEnum = new LazyEnumerable(this.source);
        newEnum.operations = [...this.operations, { type: 'filter', predicate }];
        return newEnum;
    }

    getFirst(): IActionDescriptorNavigator {
        const results = this.executeOperations(1);
        return results.length > 0 ? results[0] : ActionDescriptorNavigator.createSentinel();
    }

    hasAnyMatches(): boolean {
        const results = this.executeOperations(1);
        return results.length > 0;
    }

    getCount(): number {
        return this.executeOperations().length;
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const newArray = new LazyEnumerableArray(this.source);
        newArray.operations = [...this.operations, { type: 'transform', transformer }];
        return newArray;
    }

    toResultArray(): IActionDescriptorNavigator[] {
        return this.executeOperations();
    }

    private executeOperations(limit?: number): IActionDescriptorNavigator[] {
        if (this.source.isSentinel) {
            return [];
        }

        const results: IActionDescriptorNavigator[] = [];
        const count = this.source.getCount();

        for (let i = 0; i < count && (!limit || results.length < limit); i++) {
            const item = this.source.getObject(i);
            if (item.isSentinel) continue;

            let current: IActionDescriptorNavigator = item;
            let passesAllFilters = true;

            for (let j = 0; j < this.operations.length; j++) {
                const op = this.operations[j];
                
                if (op.type === 'filter' && op.predicate) {
                    try {
                        if (!op.predicate(current)) {
                            passesAllFilters = false;
                            break;
                        }
                    } catch (e: any) {
                        passesAllFilters = false;
                        break;
                    }
                }
                // Note: LazyEnumerable only handles filters, transforms go to LazyEnumerableArray
            }

            if (passesAllFilters) {
                results.push(current);
            }
        }

        return results;
    }

    debug(label: string): IEnumerable {
        try {
            $.writeln(label + ': Lazy enumerable with ' + this.operations.length + ' operations');
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

class LazyEnumerableArray implements IEnumerableArray {
    public operations: Operation[] = [];
    private source: ActionListNavigator;
    public readonly array: any[] = [];

    constructor(source: ActionListNavigator) {
        this.source = source;
    }

    whereMatches(predicate: (item: any) => boolean): IEnumerableArray {
        const newArray = new LazyEnumerableArray(this.source);
        newArray.operations = [...this.operations, { type: 'filter', predicate }];
        return newArray;
    }

    getFirst(): any {
        const results = this.executeOperations(1);
        return results.length > 0 ? results[0] : null;
    }

    getCount(): number {
        return this.executeOperations().length;
    }

    hasAnyMatches(): boolean {
        const results = this.executeOperations(1);
        return results.length > 0;
    }

    select<T>(transformer: (item: any) => T): IEnumerableArray {
        const newArray = new LazyEnumerableArray(this.source);
        newArray.operations = [...this.operations, { type: 'transform', transformer }];
        return newArray;
    }

    toResultArray(): any[] {
        return this.executeOperations();
    }

    private executeOperations(limit?: number): any[] {
        if (this.source.isSentinel) {
            return [];
        }

        const results: any[] = [];
        const count = this.source.getCount();

        for (let i = 0; i < count && (!limit || results.length < limit); i++) {
            const item = this.source.getObject(i);
            if (item.isSentinel) continue;

            let current: any = item;

            for (let j = 0; j < this.operations.length; j++) {
                const op = this.operations[j];
                
                if (op.type === 'filter' && op.predicate) {
                    try {
                        if (!op.predicate(current)) {
                            current = null;
                            break;
                        }
                    } catch (e: any) {
                        current = null;
                        break;
                    }
                } else if (op.type === 'transform' && op.transformer) {
                    try {
                        current = op.transformer(current);
                        if (current === null || current === undefined) {
                            current = null;
                            break;
                        }
                    } catch (e: any) {
                        current = null;
                        break;
                    }
                }
            }

            if (current !== null) {
                results.push(current);
            }
        }

        return results;
    }

    debug(label: string): IEnumerableArray {
        try {
            $.writeln(label + ': Lazy enumerable array with ' + this.operations.length + ' operations, source has ' + 
                     (this.source.isSentinel ? 'SENTINEL' : this.source.getCount()) + ' items');
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
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

    getObject(key: string): IActionDescriptorNavigator {
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

    getList(key: string): IActionListNavigator {
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
            try {
                $.writeln('ERROR: getString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getUnitDouble("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getBoolean("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getEnumerationString("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getData("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getClass("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getLargeInteger("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getObjectType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getPath("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getReference("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getUnitDoubleType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getUnitDoubleValue("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getEnumerationType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getEnumerationId("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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
            try {
                $.writeln('ERROR: getType("' + key + '") failed - wrong type or invalid key: ' + e.message);
            } catch (logError: any) {
                // Graceful fallback if $.writeln not available
            }
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

    debug(label: string): IActionDescriptorNavigator {
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

    getObject(index: number): IActionDescriptorNavigator {
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

    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        if (this.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const count = this.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;
            
            try {
                if (predicate(item)) {
                    return item;
                }
            } catch (e: any) {
                continue;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const matches = this.whereMatches(predicate).toResultArray();
        if (matches.length === 0) {
            try {
                $.writeln('WARNING: getSingleWhere() - No objects matched criteria');
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        if (matches.length > 1) {
            try {
                $.writeln('WARNING: getSingleWhere() - Multiple objects matched (' + matches.length + '), expected exactly one');
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        return matches[0];
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        return new LazyEnumerable(this).whereMatches(predicate);
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        return new LazyEnumerable(this).select(transformer);
    }

    asEnumerable(): IEnumerable {
        return new LazyEnumerable(this);
    }

    debug(label: string): IActionListNavigator {
        try {
            const count = this.getCount();
            $.writeln(label + ': ' + (count === -1 ? 'SENTINEL (failed)' : 'OK (' + count + ' items)'));
        } catch (e: any) {
            // Graceful fallback if $.writeln not available
        }
        return this;
    }
}