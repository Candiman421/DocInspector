/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Primary fluent API for 95% of extraction tasks with search-based patterns
 * FIXED: Resolved circular dependencies, improved declarations, better error handling
 */

// === EXTENDSCRIPT GLOBAL DECLARATIONS ===
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;
declare function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogMode?: number): ActionDescriptor;

// ExtendScript globals
declare var app: {
  activeDocument?: any;
  version?: string;
};

// FIXED: Comprehensive DescValueType declaration with fallbacks for all versions
declare const DescValueType: {
  readonly OBJECTTYPE: 1;
  readonly LISTTYPE: 2;
  readonly REFERENCETYPE: 3;
  readonly CLASSTYPE: 4;
  readonly ENUMTYPE: 5;
  readonly STRINGTYPE: 6;
  readonly INTEGERTYPE: 7;
  readonly DOUBLETYPE: 8;
  readonly ALIASTYPE: 9;
  readonly BOOLEANTYPE: 10;
  readonly RAWTYPE: 11;
};

// FIXED: Complete interface definitions (consistent with ActionDescriptorNavigator)
interface ActionDescriptor {
  hasKey(key: number): boolean;
  getString(key: number): string;
  getInteger(key: number): number;
  getDouble(key: number): number;
  getBoolean(key: number): boolean;
  getEnumerationValue(key: number): number;
  getObjectValue(key: number): ActionDescriptor;
  getList(key: number): ActionList;
  getType?(key: number): number; // Optional for version compatibility
  putString(key: number, value: string): void;
  putInteger(key: number, value: number): void;
  putDouble(key: number, value: number): void;
  putBoolean(key: number, value: boolean): void;
  putEnumerated(key: number, enumType: number, value: number): void;
  putObject(key: number, classID: number, descriptor: ActionDescriptor): void;
  putList(key: number, list: ActionList): void;
}

interface ActionList {
  count: number;
  getType?(index: number): number; // Optional for version compatibility
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

interface ActionReference {
  putEnumerated(desiredClass: number, enumType: number, value: number): void;
  putIndex(desiredClass: number, value: number): void;
  putName(desiredClass: number, value: string): void;
  putProperty(desiredClass: number, property: number): void;
}

interface PathSegment {
  key: string;
  type: 'object' | 'list' | 'value';
  valueType?: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  index?: number;
  isSafeAccess?: boolean;
}

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

// FIXED: Consolidated version compatibility detection (shared with other modules)
var PathAccessorVersionManager = (function() {
  var detected = false;
  var hasGetType = true;
  
  function detect() {
    if (detected) return;
    
    try {
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      if (typeof testDesc.getType !== 'function') {
        hasGetType = false;
      }
    } catch (error) {
      hasGetType = false;
    }
    
    detected = true;
  }
  
  return {
    hasGetType: function() {
      detect();
      return hasGetType;
    },
    
    reset: function() {
      detected = false;
      hasGetType = true;
    }
  };
})();

// FIXED: Improved global cache with better error handling and thread safety
var PathAccessorCacheManager = (function() {
  var layerNamesCache = null;
  var layerCountCache = null;
  var cacheTimeout = 1000;
  
  function getCurrentTime() {
    return Date.now ? Date.now() : new Date().getTime();
  }
  
  function isValidCache(cache) {
    if (!cache) return false;
    var now = getCurrentTime();
    return (now - cache.timestamp) < cacheTimeout;
  }
  
  function extractLayerCount() {
    try {
      if (typeof app === 'undefined' || !app.activeDocument) {
        return -1;
      }

      var ref = new ActionReference();
      ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
      ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var desc = executeActionGet(ref);
      var count = desc.getInteger(stringIDToTypeID("numberOfLayers"));
      return typeof count === 'number' ? count : -1;
    } catch (error) {
      return -1;
    }
  }
  
  function extractLayerNames() {
    var results = [];
    
    try {
      if (typeof app === 'undefined' || !app.activeDocument) {
        return results;
      }

      var layerCount = getLayerCount();
      if (layerCount <= 0) {
        return results;
      }
      
      for (var i = 1; i <= layerCount; i++) {
        try {
          var layerRef = new ActionReference();
          layerRef.putIndex(charIDToTypeID("Lyr "), i);
          var layerDesc = executeActionGet(layerRef);
          
          var nameID = stringIDToTypeID("name");
          if (layerDesc.hasKey(nameID)) {
            var hasGetType = PathAccessorVersionManager.hasGetType();
            if (!hasGetType || !layerDesc.getType || layerDesc.getType(nameID) === DescValueType.STRINGTYPE) {
              var name = layerDesc.getString(nameID);
              results.push(name || "");
            } else {
              results.push("");
            }
          } else {
            results.push("");
          }
        } catch (layerError) {
          results.push("");
        }
      }
    } catch (error) {
      return [];
    }
    
    return results;
  }
  
  function getLayerNames() {
    if (isValidCache(layerNamesCache)) {
      return layerNamesCache.names.slice();
    }
    
    var names = extractLayerNames();
    layerNamesCache = { 
      names: names.slice(), 
      timestamp: getCurrentTime() 
    };
    return names;
  }
  
  function getLayerCount() {
    if (isValidCache(layerCountCache)) {
      return layerCountCache.count;
    }
    
    var count = extractLayerCount();
    layerCountCache = { 
      count: count, 
      timestamp: getCurrentTime() 
    };
    return count;
  }
  
  function clearCache() {
    layerNamesCache = null;
    layerCountCache = null;
  }
  
  return {
    getLayerNames: getLayerNames,
    getLayerCount: getLayerCount,
    clear: clearCache
  };
})();

/**
 * Primary fluent interface for navigating ActionDescriptor structures
 * FIXED: Improved error handling, memory management, and type safety
 */
class ActionDescriptorPath {
  private segments: PathSegment[] = [];
  private transformations: ValueTransformer[] = [];
  private toleranceValue?: number;
  private defaultReturnValue?: any;
  private _disposed: boolean = false;

  /**
   * Create new path instance
   */
  static create(): ActionDescriptorPath {
    return new ActionDescriptorPath();
  }

  constructor() {
    // Private constructor - use static create() method
  }

  /**
   * Verify the class is properly instantiated
   */
  static verify(): boolean {
    try {
      var instance = ActionDescriptorPath.create();
      return instance instanceof ActionDescriptorPath;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get sentinel value based on type for missing/invalid data
   */
  private getSentinelValue<T>(type: string): T {
    switch (type) {
      case 'string':
      case 'enumerated':
        return "" as T;
      case 'integer':
      case 'double':
        return -1 as T;
      case 'boolean':
        return false as T;
      default:
        return null as T;
    }
  }

  /**
   * Get sentinel value - static version for utility methods
   */
  private static getSentinelValue<T>(type: string): T {
    switch (type) {
      case 'string':
      case 'enumerated':
        return "" as T;
      case 'integer':
      case 'double':
        return -1 as T;
      case 'boolean':
        return false as T;
      default:
        return null as T;
    }
  }

  /**
   * Navigate to object property
   */
  object(key: string): ActionDescriptorPath {
    this.checkDisposed();
    if (!key || typeof key !== 'string') {
      throw new Error("Object key must be a non-empty string");
    }
    this.segments.push({ key: key, type: 'object' });
    return this;
  }

  /**
   * Navigate to list property
   */
  list(key: string): ActionDescriptorPath {
    this.checkDisposed();
    if (!key || typeof key !== 'string') {
      throw new Error("List key must be a non-empty string");
    }
    this.segments.push({ key: key, type: 'list' });
    return this;
  }

  /**
   * Access specific index in list
   */
  at(index: number): ActionDescriptorPath {
    this.checkDisposed();
    if (typeof index !== 'number' || index < 0) {
      throw new Error("Index must be a non-negative number");
    }
    
    var lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment && lastSegment.type === 'list') {
      lastSegment.index = index;
    } else {
      throw new Error('at() can only be used after list()');
    }
    return this;
  }

  /**
   * Extract final value - returns actual value for assignment
   */
  value<T = any>(
    key: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'
  ): ActionDescriptorPath {
    this.checkDisposed();
    if (!key || typeof key !== 'string') {
      throw new Error("Value key must be a non-empty string");
    }
    this.segments.push({ key: key, type: 'value', valueType: valueType });
    return this;
  }

  // === TRANSFORMATION METHODS ===

  /**
   * Add custom transformation with error handling
   */
  transform(transformer: ValueTransformer): ActionDescriptorPath {
    this.checkDisposed();
    if (!transformer || typeof transformer !== 'function') {
      throw new Error("Transformer must be a function");
    }
    this.transformations.push(transformer);
    return this;
  }

  /**
   * Floor the numeric value
   */
  floor(): ActionDescriptorPath {
    return this.transform(function(val) {
      return typeof val === 'number' ? Math.floor(val) : val;
    });
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number = 0): ActionDescriptorPath {
    if (typeof decimals !== 'number' || decimals < 0) {
      decimals = 0;
    }
    var factor = Math.pow(10, decimals);
    return this.transform(function (val) { 
      return typeof val === 'number' ? Math.round(val * factor) / factor : val;
    });
  }

  /**
   * Convert points to pixels
   */
  toPixels(fromUnit: string = 'pt', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { 
      return typeof val === 'number' ? self.convertToPixels(val, fromUnit, dpi) : val;
    });
  }

  /**
   * Convert pixels to points
   */
  toPoints(fromUnit: string = 'px', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { 
      return typeof val === 'number' ? self.convertToPoints(val, fromUnit, dpi) : val;
    });
  }

  /**
   * Convert percentage (0.75 → 75)
   */
  toPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { 
      return typeof val === 'number' ? val * 100 : val;
    });
  }

  /**
   * Convert from percentage (75 → 0.75)
   */
  fromPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { 
      return typeof val === 'number' ? val / 100 : val;
    });
  }

  /**
   * Set tolerance for numeric comparisons
   */
  withTolerance(tolerance: number): ActionDescriptorPath {
    this.checkDisposed();
    if (typeof tolerance === 'number' && tolerance >= 0) {
      this.toleranceValue = tolerance;
    }
    return this;
  }

  /**
   * Set default value if path resolution fails
   */
  defaultTo<T>(value: T): ActionDescriptorPath {
    this.checkDisposed();
    this.defaultReturnValue = value;
    return this;
  }

  // === VALUE EXTRACTION METHODS ===

  /**
   * FIXED: Improved extract with proper error boundaries
   */
  extract<T = any>(rootDesc: ActionDescriptor): T {
    this.checkDisposed();
    
    if (!rootDesc) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      return this.getFallbackValue<T>();
    }
    
    try {
      var rawValue = this.resolvePath(rootDesc);
      return this.applyTransformations(rawValue) as T;
    } catch (error) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      return this.getFallbackValue<T>();
    }
  }

  /**
   * Try to extract value, return null if fails
   */
  tryExtract<T = any>(rootDesc: ActionDescriptor): T | null {
    this.checkDisposed();
    
    try {
      return this.extract<T>(rootDesc);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract value with fallback
   */
  extractOr<T = any>(rootDesc: ActionDescriptor, fallback: T): T {
    this.checkDisposed();
    
    try {
      var result = this.extract<T>(rootDesc);
      return result !== null && result !== undefined ? result : fallback;
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Get count for document layers using cache
   */
  getLayerCount(): number {
    this.checkDisposed();
    return PathAccessorCacheManager.getLayerCount();
  }

  /**
   * Get count of items in list (if path points to a list)
   */
  getCount(rootDesc: ActionDescriptor): number {
    this.checkDisposed();
    
    if (!rootDesc) {
      return -1;
    }
    
    try {
      if (this.segments.length === 1 && this.segments[0].key === 'layers') {
        return this.getLayerCount();
      }
      
      var resolved = this.resolvePath(rootDesc);
      if (resolved && typeof resolved.count === 'number') {
        return resolved.count;
      }
      return -1;
    } catch (error) {
      return -1;
    }
  }

  // === LIST EXTRACTION METHODS ===

  /**
   * Extract all layer names using cached approach
   */
  extractAllLayerNames(): string[] {
    this.checkDisposed();
    return PathAccessorCacheManager.getLayerNames();
  }

  /**
   * Extract fixed number of layer names as tuple
   */
  extractLayerTuple(count: number, defaultValue?: string): string[] {
    this.checkDisposed();
    
    if (typeof count !== 'number' || count < 0) {
      return [];
    }
    
    var allNames = this.extractAllLayerNames();
    var results: string[] = [];
    var sentinel = defaultValue !== undefined ? defaultValue : "";
    
    for (var i = 0; i < count; i++) {
      if (i < allNames.length && allNames[i] !== "") {
        results.push(allNames[i]);
      } else {
        results.push(sentinel);
      }
    }
    return results;
  }

  /**
   * FIXED: Improved extractTextStyleValues with better error handling
   */
  static extractTextStyleValues<T = any>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    defaultValue?: T
  ): T[] {
    if (!desc || !subPath || typeof count !== 'number' || count < 0) {
      return [];
    }
    
    var results: T[] = [];
    var sentinelValue = defaultValue !== undefined ? defaultValue : ActionDescriptorPath.getSentinelValue<T>(valueType);
    
    // Initialize results array
    for (var i = 0; i < count; i++) {
      results.push(sentinelValue);
    }
    
    try {
      var textKeyID = stringIDToTypeID("textKey");
      if (!desc.hasKey(textKeyID)) {
        return results;
      }
      
      var hasGetType = PathAccessorVersionManager.hasGetType();
      if (hasGetType && desc.getType && desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        return results;
      }

      var textKey = desc.getObjectValue(textKeyID);
      var rangeListID = stringIDToTypeID("textStyleRange");
      
      if (!textKey.hasKey(rangeListID)) {
        return results;
      }
      
      if (hasGetType && textKey.getType && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        return results;
      }

      var textStyleRanges = textKey.getList(rangeListID);
      var actualCount = Math.min(count, textStyleRanges.count);
      
      for (var i = 0; i < actualCount; i++) {
        try {
          var hasGetTypeForList = hasGetType && textStyleRanges.getType;
          if (!hasGetTypeForList || textStyleRanges.getType(i) === DescValueType.OBJECTTYPE) {
            var range = textStyleRanges.getObjectValue(i);
            var value = ActionDescriptorPath.extractValueFromDescriptor(range, subPath, valueType);
            if (value !== null && value !== undefined) {
              results[i] = value as T;
            }
          }
        } catch (error) {
          // results[i] already initialized to sentinelValue
        }
      }
    } catch (error) {
      // Return initialized results array
    }
    
    return results;
  }

  /**
   * FIXED: Improved extractAllFromList with proper error handling
   */
  extractAllFromList<T>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    skipErrors?: boolean,
    defaultValue?: T
  ): T[] {
    this.checkDisposed();
    
    if (!desc || !subPath) {
      return [];
    }
    
    var results: T[] = [];
    var sentinelValue = defaultValue !== undefined ? defaultValue : this.getSentinelValue<T>(valueType);

    try {
      var list = this.resolvePath(desc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return results;
      }
      
      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && list.getType && list.getType(i) !== DescValueType.OBJECTTYPE) {
            if (skipErrors) {
              results.push(sentinelValue);
              continue;
            } else {
              throw new Error("Item at index " + i + " is not an object");
            }
          }

          var itemDesc = list.getObjectValue(i);
          var value = this.extractValueFromDescriptor(itemDesc, subPath, valueType);
          results.push(value as T);
        } catch (error) {
          if (skipErrors) {
            results.push(sentinelValue);
          } else {
            throw error;
          }
        }
      }

      return results;
    } catch (error) {
      if (skipErrors) {
        return [];
      }
      var err = error as Error;
      throw new Error("List extraction failed: " + err.message);
    }
  }

  // === SEARCH METHODS ===

  /**
   * FIXED: Improved findInList with proper type validation
   */
  findInList<T>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T, index: number) => boolean
  ): T | null {
    this.checkDisposed();
    
    if (!desc || !subPath || !predicate) {
      return null;
    }
    
    try {
      var list = this.resolvePath(desc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return null;
      }
      
      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
            var itemDesc = list.getObjectValue(i);
            var value = this.extractValueFromDescriptor(itemDesc, subPath, valueType) as T;
            if (predicate(value, i)) {
              return value;
            }
          }
        } catch (error) {
          // Continue searching
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Safe index access with runtime validation
   */
  safeAt(index: number): ActionDescriptorPath {
    this.checkDisposed();
    if (typeof index !== 'number' || index < 0) {
      throw new Error("Index must be a non-negative number");
    }
    
    var lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment && lastSegment.type === 'list') {
      lastSegment.index = index;
      lastSegment.isSafeAccess = true;
    } else {
      throw new Error('safeAt() can only be used after list()');
    }
    return this;
  }

  // === UTILITY METHODS ===

  /**
   * FIXED: Improved resolvePath with better error handling
   */
  private resolvePath(rootDesc: ActionDescriptor): any {
    var current: any = rootDesc;

    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      
      if (!segment.key) {
        throw new Error("Invalid segment at position " + i);
      }
      
      var typeID = stringIDToTypeID(segment.key);

      if (!current.hasKey || !current.hasKey(typeID)) {
        throw new Error("Key '" + segment.key + "' not found at path segment " + i);
      }

      switch (segment.type) {
        case 'object':
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.OBJECTTYPE) {
            throw new Error("Key '" + segment.key + "' is not an object type");
          }
          current = current.getObjectValue(typeID);
          break;

        case 'list':
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.LISTTYPE) {
            throw new Error("Key '" + segment.key + "' is not a list type");
          }
          
          var list = current.getList(typeID);
          if (segment.index !== undefined) {
            if (segment.isSafeAccess) {
              if (segment.index >= list.count) {
                throw new Error("Safe access failed: List index " + segment.index + " out of bounds (count: " + list.count + ")");
              }
              var hasGetTypeForList = hasGetType && list.getType;
              if (hasGetTypeForList && list.getType(segment.index) !== DescValueType.OBJECTTYPE) {
                throw new Error("Safe access failed: List item at index " + segment.index + " is not an object");
              }
            } else {
              if (segment.index >= list.count) {
                throw new Error("List index " + segment.index + " out of bounds (count: " + list.count + ")");
              }
              var hasGetTypeForList = hasGetType && list.getType;
              if (hasGetTypeForList && list.getType(segment.index) !== DescValueType.OBJECTTYPE) {
                throw new Error("List item at index " + segment.index + " is not an object");
              }
            }
            current = list.getObjectValue(segment.index);
          } else {
            current = list;
          }
          break;

        case 'value':
          return this.extractFinalValue(current, typeID, segment.valueType!);
      }
    }

    return current;
  }

  /**
   * FIXED: Improved extractFinalValue with better error handling
   */
  private extractFinalValue(desc: ActionDescriptor, typeID: number, valueType: string): any {
    try {
      var hasGetType = PathAccessorVersionManager.hasGetType();
      if (hasGetType && desc.getType) {
        var actualType = desc.getType(typeID);
        var expectedType = this.getExpectedDescValueType(valueType);
        
        if (actualType !== expectedType) {
          return this.getSentinelValue(valueType);
        }
      }

      switch (valueType) {
        case 'string': 
          return desc.getString(typeID);
        case 'integer': 
          return desc.getInteger(typeID);
        case 'double': 
          return desc.getDouble(typeID);
        case 'boolean': 
          return desc.getBoolean(typeID);
        case 'enumerated': 
          return desc.getEnumerationValue(typeID);
        default: 
          return this.getSentinelValue(valueType);
      }
    } catch (error) {
      return this.getSentinelValue(valueType);
    }
  }

  /**
   * Helper to map type strings to DescValueType constants
   */
  private getExpectedDescValueType(type: string): number {
    switch (type) {
      case 'string': return DescValueType.STRINGTYPE;
      case 'integer': return DescValueType.INTEGERTYPE;
      case 'double': return DescValueType.DOUBLETYPE;
      case 'boolean': return DescValueType.BOOLEANTYPE;
      case 'enumerated': return DescValueType.ENUMTYPE;
      default: return -1;
    }
  }

  /**
   * FIXED: Improved extractValueFromDescriptor
   */
  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    if (!desc || !subPath) {
      return this.getSentinelValue(valueType);
    }
    
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
          return this.extractFinalValue(current, typeID, valueType);
        } else {
          if (!current.hasKey(typeID)) {
            throw new Error("Property '" + part + "' not found in sub-path");
          }
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.OBJECTTYPE) {
            throw new Error("Property '" + part + "' is not an object in sub-path");
          }
          current = current.getObjectValue(typeID);
        }
      }
      throw new Error('Invalid sub-path: ' + subPath);
    } catch (error) {
      return this.getSentinelValue(valueType);
    }
  }

  /**
   * FIXED: Improved static helper for extracting values from nested paths
   */
  private static extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    if (!desc || !subPath) {
      return ActionDescriptorPath.getSentinelValue(valueType);
    }
    
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && current.getType) {
            var actualType = current.getType(typeID);
            var expectedType: number;
            
            switch (valueType) {
              case 'string': expectedType = DescValueType.STRINGTYPE; break;
              case 'integer': expectedType = DescValueType.INTEGERTYPE; break;
              case 'double': expectedType = DescValueType.DOUBLETYPE; break;
              case 'boolean': expectedType = DescValueType.BOOLEANTYPE; break;
              case 'enumerated': expectedType = DescValueType.ENUMTYPE; break;
              default: return ActionDescriptorPath.getSentinelValue(valueType);
            }
            
            if (actualType !== expectedType) {
              return ActionDescriptorPath.getSentinelValue(valueType);
            }
          }

          switch (valueType) {
            case 'string': return current.getString(typeID);
            case 'integer': return current.getInteger(typeID);
            case 'double': return current.getDouble(typeID);
            case 'boolean': return current.getBoolean(typeID);
            case 'enumerated': return current.getEnumerationValue(typeID);
            default: return ActionDescriptorPath.getSentinelValue(valueType);
          }
        } else {
          if (!current.hasKey(typeID)) {
            throw new Error("Property '" + part + "' not found in sub-path");
          }
          var hasGetType = PathAccessorVersionManager.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.OBJECTTYPE) {
            throw new Error("Property '" + part + "' is not an object in sub-path");
          }
          current = current.getObjectValue(typeID);
        }
      }
      throw new Error('Invalid sub-path: ' + subPath);
    } catch (error) {
      return ActionDescriptorPath.getSentinelValue(valueType);
    }
  }

  /**
   * FIXED: Improved applyTransformations with better error handling
   */
  private applyTransformations(value: any): any {
    var result = value;
    for (var i = 0; i < this.transformations.length; i++) {
      try {
        result = this.transformations[i](result);
      } catch (transformError) {
        if (this.defaultReturnValue !== undefined) {
          return this.defaultReturnValue;
        }
        var err = transformError as Error;
        throw new Error("Transformation failed at step " + i + ": " + err.message);
      }
    }
    return result;
  }

  /**
   * Unit conversion helpers
   */
  private convertToPixels(value: number, fromUnit: string, dpi: number): number {
    if (typeof value !== 'number' || typeof dpi !== 'number') {
      return value;
    }
    
    switch (fromUnit.toLowerCase()) {
      case 'pt': case 'points': return value * (dpi / 72);
      case 'in': case 'inches': return value * dpi;
      case 'mm': return value * (dpi / 25.4);
      case 'cm': return value * (dpi / 2.54);
      case 'px': case 'pixels': return value;
      default: return value;
    }
  }

  private convertToPoints(value: number, fromUnit: string, dpi: number): number {
    if (typeof value !== 'number' || typeof dpi !== 'number') {
      return value;
    }
    
    var pixels = this.convertToPixels(value, fromUnit, dpi);
    return pixels * (72 / dpi);
  }

  /**
   * Get fallback value based on path context
   */
  private getFallbackValue<T>(): T {
    var lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment && lastSegment.type === 'value' && lastSegment.valueType) {
      return this.getSentinelValue<T>(lastSegment.valueType);
    }
    return null as T;
  }

  /**
   * Check if this path has been disposed
   */
  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionDescriptorPath has been disposed");
    }
  }

  /**
   * Dispose of this path to prevent memory leaks
   */
  dispose(): void {
    this._disposed = true;
    this.segments = [];
    this.transformations = [];
  }
}

// === FACTORY FUNCTIONS ===

/**
 * FIXED: Proper factory class definition with all methods in prototype
 */
function PathFactory() {
  // Empty constructor for proper prototype inheritance
}

/**
 * Create object navigation path
 */
PathFactory.prototype.obj = function (key: string): ActionDescriptorPath { 
  return ActionDescriptorPath.create().object(key); 
};

/**
 * Create list navigation path
 */
PathFactory.prototype.list = function (key: string): ActionDescriptorPath { 
  return ActionDescriptorPath.create().list(key); 
};

/**
 * Create value extraction path
 */
PathFactory.prototype.val = function (key: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'): ActionDescriptorPath {
  return ActionDescriptorPath.create().value(key, type);
};

/**
 * Extract bounds with unit conversion and default values
 */
PathFactory.prototype.bounds = function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'): ActionDescriptorPath {
  return ActionDescriptorPath.create()
    .object('bounds')
    .value(property, 'double')
    .toPixels('pt')
    .floor()
    .defaultTo(-1);
};

/**
 * Extract text style properties with safe defaults
 */
PathFactory.prototype.textStyle = function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number): ActionDescriptorPath {
  if (textIndex === undefined) textIndex = 0;
  
  var path = ActionDescriptorPath.create()
    .object('textKey')
    .list('textStyleRange')
    .at(textIndex)
    .object('textStyle')
    .value(property, type);
  
  switch (type) {
    case 'string':
    case 'enumerated':
      return path.defaultTo("");
    case 'integer':
    case 'double':
      return path.defaultTo(-1);
    case 'boolean':
      return path.defaultTo(false);
    default:
      return path;
  }
};

/**
 * Extract filter properties with safe defaults
 */
PathFactory.prototype.filter = function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex: number): ActionDescriptorPath {
  if (filterIndex === undefined) filterIndex = 0;
  
  var path = ActionDescriptorPath.create()
    .object('smartObjectMore')
    .list('filterFXList')
    .at(filterIndex)
    .value(property, type);
  
  switch (type) {
    case 'string':
    case 'enumerated':
      return path.defaultTo("");
    case 'integer':
    case 'double':
      return path.defaultTo(-1);
    case 'boolean':
      return path.defaultTo(false);
    default:
      return path;
  }
};

/**
 * FIXED: Search-based layer finding (does not require ActionDescriptorNavigator import)
 */
PathFactory.prototype.findLayer = function(namePattern: string | RegExp) {
  return {
    extract: function(desc?: ActionDescriptor): string | null {
      var layerNames = PathAccessorCacheManager.getLayerNames();
      
      for (var i = 0; i < layerNames.length; i++) {
        var layerName = layerNames[i];
        var matches = false;
        
        if (typeof namePattern === 'string') {
          matches = layerName.toLowerCase().indexOf(namePattern.toLowerCase()) !== -1;
        } else if (namePattern instanceof RegExp) {
          matches = namePattern.test(layerName);
        }
        
        if (matches) {
          return layerName;
        }
      }
      
      return null;
    }
  };
};

/**
 * FIXED: Search-based filter finding
 */
PathFactory.prototype.findFilter = function(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
  return {
    extract: function<T>(desc: ActionDescriptor): T | null {
      if (!desc) return null;
      
      var basePath = ActionDescriptorPath.create()
        .object('smartObjectMore')
        .list('filterFXList');
      
      if (predicate) {
        return basePath.findInList<T>(desc, property, type, predicate);
      } else {
        return basePath.findInList<T>(desc, property, type, function(value) {
          return value !== -1 && value !== "" && value !== false;
        });
      }
    }
  };
};

/**
 * FIXED: Search-based text style finding
 */
PathFactory.prototype.findTextStyle = function(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
  return {
    extract: function<T>(desc: ActionDescriptor): T | null {
      if (!desc) return null;
      
      var basePath = ActionDescriptorPath.create()
        .object('textKey')
        .list('textStyleRange');
      
      if (predicate) {
        return basePath.findInList<T>(desc, 'textStyle.' + property, type, predicate);
      } else {
        return basePath.findInList<T>(desc, 'textStyle.' + property, type, function(value) {
          return value !== -1 && value !== "" && value !== false;
        });
      }
    }
  };
};

/**
 * Clear internal caches when document changes
 */
PathFactory.prototype.clearCaches = function() {
  PathAccessorCacheManager.clear();
};

// FIXED: Proper declaration order - P is declared after PathFactory is complete
/**
 * Primary factory instance for common operations
 */
var P = new PathFactory();