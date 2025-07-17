/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Primary fluent API for 95% of extraction tasks with search-based patterns
 */

// ExtendScript global function declarations
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

// FIXED: Add DescValueType declaration to avoid runtime errors
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

// FIXED: Forward declare ActionDescriptorNavigator to resolve cross-file dependency
declare class ActionDescriptorNavigator {
  constructor(desc: ActionDescriptor);
  static forLayerByIndex(index: number): ActionDescriptorNavigator;
  static forCurrentLayer(): ActionDescriptorNavigator;
  static forCurrentDocument(): ActionDescriptorNavigator;
  static from(ref: ActionReference): ActionDescriptorNavigator;
  object(key: string): ActionDescriptorNavigator;
  list(key: string): any;
  getValue<T>(key: string, type: string, options?: any): T;
  dispose(): void;
}

// Enhanced ActionDescriptor interface
interface ActionDescriptor {
  hasKey(key: number): boolean;
  getString(key: number): string;
  getInteger(key: number): number;
  getDouble(key: number): number;
  getBoolean(key: number): boolean;
  getEnumerationValue(key: number): number;
  getObjectValue(key: number): ActionDescriptor;
  getList(key: number): ActionList;
  getType?(key: number): number; // FIXED: Made optional for version compatibility
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
  getType?(index: number): number; // FIXED: Made optional for version compatibility
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

/**
 * FIXED: Version compatibility detection
 */
var PathAccessorVersion = {
  _detected: false,
  _hasGetType: true,
  
  detect: function() {
    if (this._detected) return;
    
    try {
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      if (typeof testDesc.getType !== 'function') {
        this._hasGetType = false;
      }
    } catch (error) {
      this._hasGetType = false;
    }
    
    this._detected = true;
  },
  
  hasGetType: function() {
    this.detect();
    return this._hasGetType;
  }
};

/**
 * Global cache for expensive operations with automatic timeout
 */
var PathAccessorCache = {
  layerNames: null as { names: string[]; timestamp: number } | null,
  layerCount: null as { count: number; timestamp: number } | null,
  cacheTimeout: 1000,
  
  getLayerNames: function(): string[] {
    var now = Date.now ? Date.now() : new Date().getTime();
    if (this.layerNames && (now - this.layerNames.timestamp) < this.cacheTimeout) {
      return this.layerNames.names.slice();
    }
    
    var names = this._extractLayerNames();
    this.layerNames = { names: names.slice(), timestamp: now };
    return names;
  },
  
  getLayerCount: function(): number {
    var now = Date.now ? Date.now() : new Date().getTime();
    if (this.layerCount && (now - this.layerCount.timestamp) < this.cacheTimeout) {
      return this.layerCount.count;
    }
    
    var count = this._extractLayerCount();
    this.layerCount = { count: count, timestamp: now };
    return count;
  },
  
  _extractLayerNames: function(): string[] {
    var results: string[] = [];
    
    try {
      if (typeof app === 'undefined' || !app.activeDocument) {
        return [];
      }

      var layerCount = this.getLayerCount();
      if (layerCount === -1) {
        return [];
      }
      
      for (var i = 1; i <= layerCount; i++) {
        try {
          var layerRef = new ActionReference();
          layerRef.putIndex(charIDToTypeID("Lyr "), i);
          var layerDesc = executeActionGet(layerRef);
          
          var nameID = stringIDToTypeID("name");
          if (layerDesc.hasKey(nameID)) {
            // FIXED: Add version compatibility check
            var hasGetType = PathAccessorVersion.hasGetType();
            if (!hasGetType || !layerDesc.getType || layerDesc.getType(nameID) === DescValueType.STRINGTYPE) {
              var name = layerDesc.getString(nameID);
              results.push(name || "");
            } else {
              results.push("");
            }
          } else {
            results.push("");
          }
        } catch (error) {
          results.push("");
        }
      }
    } catch (error) {
      return [];
    }
    
    return results;
  },
  
  _extractLayerCount: function(): number {
    try {
      if (typeof app === 'undefined' || !app.activeDocument) {
        return -1;
      }

      var ref = new ActionReference();
      ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
      ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
    } catch (error) {
      return -1;
    }
  },
  
  clear: function() {
    this.layerNames = null;
    this.layerCount = null;
  }
};

/**
 * Primary fluent interface for navigating ActionDescriptor structures
 * Provides direct value returns with built-in transformations and error handling
 */
class ActionDescriptorPath {
  private segments: PathSegment[] = [];
  private transformations: ValueTransformer[] = [];
  private toleranceValue?: number;
  private defaultReturnValue?: any;
  private _disposed: boolean = false;

  /**
   * Create new path instance
   * @returns New ActionDescriptorPath for fluent chaining
   */
  static create(): ActionDescriptorPath {
    return new ActionDescriptorPath();
  }

  constructor() {
    // Use static create() method for instantiation
  }

  /**
   * Verify the class is properly instantiated
   * @returns True if class instantiation works correctly
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
   * @param key Property key to navigate to
   * @returns This instance for fluent chaining
   */
  object(key: string): ActionDescriptorPath {
    this.checkDisposed();
    this.segments.push({ key: key, type: 'object' });
    return this;
  }

  /**
   * Navigate to list property
   * @param key List property key
   * @returns This instance for fluent chaining
   */
  list(key: string): ActionDescriptorPath {
    this.checkDisposed();
    this.segments.push({ key: key, type: 'list' });
    return this;
  }

  /**
   * Access specific index in list
   * @param index Zero-based index
   * @returns This instance for fluent chaining
   * @throws Error if not called after list()
   */
  at(index: number): ActionDescriptorPath {
    this.checkDisposed();
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
   * @param key Property key for the final value
   * @param valueType Expected type of the value
   * @returns This instance for fluent chaining
   */
  value<T = any>(
    key: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'
  ): ActionDescriptorPath {
    this.checkDisposed();
    this.segments.push({ key: key, type: 'value', valueType: valueType });
    return this;
  }

  // === TRANSFORMATION METHODS ===

  /**
   * Add custom transformation with error handling
   * @param transformer Function to transform the extracted value
   * @returns This instance for fluent chaining
   */
  transform(transformer: ValueTransformer): ActionDescriptorPath {
    this.checkDisposed();
    this.transformations.push(transformer);
    return this;
  }

  /**
   * Floor the numeric value
   * @returns This instance for fluent chaining
   */
  floor(): ActionDescriptorPath {
    return this.transform(Math.floor);
  }

  /**
   * Round to specified decimal places
   * @param decimals Number of decimal places (default: 0)
   * @returns This instance for fluent chaining
   */
  round(decimals: number = 0): ActionDescriptorPath {
    var factor = Math.pow(10, decimals);
    return this.transform(function (val) { return Math.round(val * factor) / factor; });
  }

  /**
   * Convert points to pixels
   * @param fromUnit Source unit (default: 'pt')
   * @param dpi DPI for conversion (default: 72)
   * @returns This instance for fluent chaining
   */
  toPixels(fromUnit: string = 'pt', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { return self.convertToPixels(val, fromUnit, dpi); });
  }

  /**
   * Convert pixels to points
   * @param fromUnit Source unit (default: 'px')
   * @param dpi DPI for conversion (default: 72)
   * @returns This instance for fluent chaining
   */
  toPoints(fromUnit: string = 'px', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { return self.convertToPoints(val, fromUnit, dpi); });
  }

  /**
   * Convert percentage (0.75 → 75)
   * @returns This instance for fluent chaining
   */
  toPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { return val * 100; });
  }

  /**
   * Convert from percentage (75 → 0.75)
   * @returns This instance for fluent chaining
   */
  fromPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { return val / 100; });
  }

  /**
   * Set tolerance for numeric comparisons
   * @param tolerance Tolerance value
   * @returns This instance for fluent chaining
   */
  withTolerance(tolerance: number): ActionDescriptorPath {
    this.checkDisposed();
    this.toleranceValue = tolerance;
    return this;
  }

  /**
   * Set default value if path resolution fails
   * @param value Default value to return on failure
   * @returns This instance for fluent chaining
   */
  defaultTo<T>(value: T): ActionDescriptorPath {
    this.checkDisposed();
    this.defaultReturnValue = value;
    return this;
  }

  // === VALUE EXTRACTION METHODS ===

  /**
   * Extract the value from the ActionDescriptor with proper error boundaries
   * @param rootDesc ActionDescriptor to extract from
   * @returns Extracted and transformed value
   */
  extract<T = any>(rootDesc: ActionDescriptor): T {
    this.checkDisposed();
    
    try {
      var rawValue = this.resolvePath(rootDesc);
      return this.applyTransformations(rawValue) as T;
    } catch (error) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      
      var lastSegment = this.segments[this.segments.length - 1];
      if (lastSegment && lastSegment.type === 'value' && lastSegment.valueType) {
        return this.getSentinelValue<T>(lastSegment.valueType);
      }
      
      return null as T;
    }
  }

  /**
   * Try to extract value, return null if fails
   * @param rootDesc ActionDescriptor to extract from
   * @returns Extracted value or null
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
   * @param rootDesc ActionDescriptor to extract from
   * @param fallback Fallback value if extraction fails
   * @returns Extracted value or fallback
   */
  extractOr<T = any>(rootDesc: ActionDescriptor, fallback: T): T {
    this.checkDisposed();
    
    try {
      return this.extract<T>(rootDesc);
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Get count for document layers using cache
   * @returns Number of layers in document
   */
  getLayerCount(): number {
    this.checkDisposed();
    return PathAccessorCache.getLayerCount();
  }

  /**
   * Get count of items in list (if path points to a list)
   * @param rootDesc ActionDescriptor containing the list
   * @returns Number of items in list or -1 if unavailable
   */
  getCount(rootDesc: ActionDescriptor): number {
    this.checkDisposed();
    
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
   * @returns Array of all layer names in the document
   */
  extractAllLayerNames(): string[] {
    this.checkDisposed();
    return PathAccessorCache.getLayerNames();
  }

  /**
   * Extract fixed number of layer names as tuple
   * @param count Number of layer names to extract
   * @param defaultValue Default value for missing layers
   * @returns Array of exactly 'count' layer names
   */
  extractLayerTuple(count: number, defaultValue?: string): string[] {
    this.checkDisposed();
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
   * Extract text style values from text layer descriptor
   * Static utility for specialized text style extraction
   * @param desc ActionDescriptor containing text information
   * @param subPath Property path within text styles
   * @param valueType Expected type of values
   * @param count Number of values to extract
   * @param defaultValue Default value for missing items
   * @returns Array of extracted text style values
   */
  static extractTextStyleValues<T = any>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    defaultValue?: T
  ): T[] {
    var results: T[] = [];
    var sentinelValue = defaultValue !== undefined ? defaultValue : ActionDescriptorPath.getSentinelValue<T>(valueType);
    
    try {
      var textKeyID = stringIDToTypeID("textKey");
      if (!desc.hasKey(textKeyID)) {
        for (var i = 0; i < count; i++) {
          results.push(sentinelValue);
        }
        return results;
      }
      
      // FIXED: Add version compatibility check
      var hasGetType = PathAccessorVersion.hasGetType();
      if (hasGetType && desc.getType && desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        for (var i = 0; i < count; i++) {
          results.push(sentinelValue);
        }
        return results;
      }

      var textKey = desc.getObjectValue(textKeyID);
      var rangeListID = stringIDToTypeID("textStyleRange");
      
      if (!textKey.hasKey(rangeListID)) {
        for (var i = 0; i < count; i++) {
          results.push(sentinelValue);
        }
        return results;
      }
      
      // FIXED: Add version compatibility check
      if (hasGetType && textKey.getType && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        for (var i = 0; i < count; i++) {
          results.push(sentinelValue);
        }
        return results;
      }

      var textStyleRanges = textKey.getList(rangeListID);
      
      for (var i = 0; i < count; i++) {
        if (i < textStyleRanges.count) {
          try {
            // FIXED: Add version compatibility check
            if (!hasGetType || !textStyleRanges.getType || textStyleRanges.getType(i) === DescValueType.OBJECTTYPE) {
              var range = textStyleRanges.getObjectValue(i);
              var value = ActionDescriptorPath.extractValueFromDescriptor(range, subPath, valueType);
              results.push(value as T);
            } else {
              results.push(sentinelValue);
            }
          } catch (error) {
            results.push(sentinelValue);
          }
        } else {
          results.push(sentinelValue);
        }
      }
    } catch (error) {
      for (var i = 0; i < count; i++) {
        results.push(sentinelValue);
      }
    }
    
    return results;
  }

  /**
   * Extract all values from standard list with proper error handling
   * @param desc ActionDescriptor containing the list
   * @param subPath Property path within each list item
   * @param valueType Expected type of values
   * @param skipErrors Whether to skip errors and continue
   * @param defaultValue Default value for failed extractions
   * @returns Array of extracted values
   */
  extractAllFromList<T>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    skipErrors?: boolean,
    defaultValue?: T
  ): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var sentinelValue = defaultValue !== undefined ? defaultValue : this.getSentinelValue<T>(valueType);

    try {
      var list = this.resolvePath(desc) as ActionList;
      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
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
          results.push(value);
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
   * Find value in list by predicate with proper type validation
   * @param desc ActionDescriptor containing the list
   * @param subPath Property path within each list item
   * @param valueType Expected type of values
   * @param predicate Function to test each value
   * @returns First matching value or null
   */
  findInList<T>(
    desc: ActionDescriptor,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T, index: number) => boolean
  ): T | null {
    this.checkDisposed();
    
    try {
      var list = this.resolvePath(desc) as ActionList;
      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
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
   * @param index Zero-based index
   * @returns This instance for fluent chaining
   * @throws Error if not called after list()
   */
  safeAt(index: number): ActionDescriptorPath {
    this.checkDisposed();
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

  private resolvePath(rootDesc: ActionDescriptor): any {
    var current: any = rootDesc;

    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var typeID = stringIDToTypeID(segment.key);

      if (!current.hasKey || !current.hasKey(typeID)) {
        throw new Error("Key '" + segment.key + "' not found at path segment");
      }

      switch (segment.type) {
        case 'object':
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.OBJECTTYPE) {
            throw new Error("Key '" + segment.key + "' is not an object type");
          }
          current = current.getObjectValue(typeID);
          break;

        case 'list':
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.LISTTYPE) {
            throw new Error("Key '" + segment.key + "' is not a list type");
          }
          
          var list = current.getList(typeID);
          if (segment.index !== undefined) {
            if (segment.isSafeAccess) {
              if (segment.index >= list.count) {
                throw new Error("Safe access failed: List index " + segment.index + " out of bounds (count: " + list.count + ")");
              }
              // FIXED: Add version compatibility check
              var hasGetType = PathAccessorVersion.hasGetType();
              if (hasGetType && list.getType && list.getType(segment.index) !== DescValueType.OBJECTTYPE) {
                throw new Error("Safe access failed: List item at index " + segment.index + " is not an object");
              }
            } else {
              if (segment.index >= list.count) {
                throw new Error("List index " + segment.index + " out of bounds (count: " + list.count + ")");
              }
              // FIXED: Add version compatibility check
              var hasGetType = PathAccessorVersion.hasGetType();
              if (hasGetType && list.getType && list.getType(segment.index) !== DescValueType.OBJECTTYPE) {
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

  private extractFinalValue(desc: ActionDescriptor, typeID: number, valueType: string): any {
    try {
      // FIXED: Add version compatibility check
      var hasGetType = PathAccessorVersion.hasGetType();
      if (hasGetType && desc.getType) {
        var actualType = desc.getType(typeID);
        var expectedType = this.getExpectedDescValueType(valueType);
        
        if (actualType !== expectedType) {
          return this.getSentinelValue(valueType);
        }
      }

      switch (valueType) {
        case 'string': return desc.getString(typeID);
        case 'integer': return desc.getInteger(typeID);
        case 'double': return desc.getDouble(typeID);
        case 'boolean': return desc.getBoolean(typeID);
        case 'enumerated': return desc.getEnumerationValue(typeID);
        default: return this.getSentinelValue(valueType);
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
   * Extract value from sub-path within a descriptor
   */
  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
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
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
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
   * Static helper for extracting values from nested paths
   */
  private static extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
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
          // FIXED: Add version compatibility check
          var hasGetType = PathAccessorVersion.hasGetType();
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

  private convertToPixels(value: number, fromUnit: string, dpi: number): number {
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
    var pixels = this.convertToPixels(value, fromUnit, dpi);
    return pixels * (72 / dpi);
  }

  private getPathString(): string {
    var parts: string[] = [];
    for (var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      parts.push(s.index !== undefined ? s.key + "[" + s.index + "]" : s.key);
    }
    return parts.join('.');
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
 * FIXED: Memory-efficient factory class with all methods in prototype
 */
function PathFactory() {
  // Empty constructor
}

/**
 * Create object navigation path
 * @param key Object property key
 * @returns New path for object navigation
 */
PathFactory.prototype.obj = function (key: string) { 
  return ActionDescriptorPath.create().object(key); 
};

/**
 * Create list navigation path
 * @param key List property key
 * @returns New path for list navigation
 */
PathFactory.prototype.list = function (key: string) { 
  return ActionDescriptorPath.create().list(key); 
};

/**
 * Create value extraction path
 * @param key Value property key
 * @param type Expected value type
 * @returns New path for value extraction
 */
PathFactory.prototype.val = function (key: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
  return ActionDescriptorPath.create().value(key, type);
};

/**
 * Extract bounds with unit conversion and default values
 * @param property Bounds property to extract
 * @returns Path configured for bounds extraction
 */
PathFactory.prototype.bounds = function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
  return ActionDescriptorPath.create()
    .object('bounds')
    .value(property, 'double')
    .toPixels('pt')
    .floor()
    .defaultTo(-1);
};

/**
 * Extract text style properties with safe defaults
 * @param property Text style property to extract
 * @param type Expected value type
 * @param textIndex Index of text style range
 * @returns Path configured for text style extraction
 */
PathFactory.prototype.textStyle = function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number) {
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
 * @param property Filter property to extract
 * @param type Expected value type
 * @param filterIndex Index of filter in list
 * @returns Path configured for filter extraction
 */
PathFactory.prototype.filter = function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex: number) {
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
 * FIXED: Find layer by name pattern (search-based approach)
 * @param namePattern String or RegExp to match layer names
 * @returns Search utility object
 */
PathFactory.prototype.findLayer = function(namePattern: string | RegExp) {
  return {
    extract: function(desc?: ActionDescriptor): ActionDescriptorNavigator | null {
      var layerNames = PathAccessorCache.getLayerNames();
      
      for (var i = 0; i < layerNames.length; i++) {
        var layerName = layerNames[i];
        var matches = false;
        
        if (typeof namePattern === 'string') {
          matches = layerName.toLowerCase().indexOf(namePattern.toLowerCase()) !== -1;
        } else if (namePattern instanceof RegExp) {
          matches = namePattern.test(layerName);
        }
        
        if (matches) {
          return ActionDescriptorNavigator.forLayerByIndex(i + 1);
        }
      }
      
      return null;
    }
  };
};

/**
 * FIXED: Find filter by property and predicate (search-based approach)
 * @param property Filter property to search
 * @param type Expected value type
 * @param predicate Optional function to test values
 * @returns Search utility object
 */
PathFactory.prototype.findFilter = function(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
  return {
    extract: function<T>(desc: ActionDescriptor): T | null {
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
 * FIXED: Find text style by property and predicate (search-based approach)
 * @param property Text style property to search
 * @param type Expected value type
 * @param predicate Optional function to test values
 * @returns Search utility object
 */
PathFactory.prototype.findTextStyle = function(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
  return {
    extract: function<T>(desc: ActionDescriptor): T | null {
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
  PathAccessorCache.clear();
};

// FIXED: Move P declaration after PathFactory definition to resolve declaration order
/**
 * Primary factory instance for common operations
 * Provides factory functions and search capabilities
 */
var P = new PathFactory();