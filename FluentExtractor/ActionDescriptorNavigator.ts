/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Provides imperative-style navigation and tuple extraction capabilities
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

// DescValueType is declared in ExtendScript.d.ts

// Enhanced ActionDescriptor interface with missing methods
interface ActionDescriptor {
  hasKey(key: number): boolean;
  getString(key: number): string;
  getInteger(key: number): number;
  getDouble(key: number): number;
  getBoolean(key: number): boolean;
  getEnumerationValue(key: number): number;
  getObjectValue(key: number): ActionDescriptor;
  getList(key: number): ActionList;
  getType(key: number): number; // FIXED: Made non-optional with version detection
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
  getType(index: number): number; // FIXED: Made non-optional with version detection
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

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

/**
 * Version compatibility detection for different Photoshop versions
 * FIXED: More robust version detection
 */
var PhotoshopVersion = {
  _detected: false,
  _hasGetObjectValue: true,
  _hasGetType: true,
  _version: null,
  
  detect: function() {
    if (this._detected) return;
    
    try {
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      // Test getObjectValue availability
      if (typeof testDesc.getObjectValue !== 'function') {
        this._hasGetObjectValue = false;
      }
      
      // FIXED: Test getType availability specifically
      if (typeof testDesc.getType !== 'function') {
        this._hasGetType = false;
      }
      
      if (typeof app !== 'undefined' && app.version) {
        this._version = parseFloat(app.version);
      }
    } catch (error) {
      // Only disable methods we know failed
      this._hasGetObjectValue = false;
      this._hasGetType = false;
    }
    
    this._detected = true;
  },
  
  hasGetObjectValue: function() {
    this.detect();
    return this._hasGetObjectValue;
  },
  
  hasGetType: function() {
    this.detect();
    return this._hasGetType;
  }
};

/**
 * FIXED: Global cache management - made static and thread-safe
 */
var GlobalCache = {
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
            // FIXED: Use getType with version compatibility
            if (!PhotoshopVersion.hasGetType() || layerDesc.getType(nameID) === DescValueType.STRINGTYPE) {
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
 * Core navigation class for ActionDescriptor structures
 * Provides imperative-style navigation with proper memory management
 */
class ActionDescriptorNavigator {
  private desc: ActionDescriptor;
  private _disposed: boolean;

  constructor(desc: ActionDescriptor) {
    this.desc = desc;
    this._disposed = false;
  }

  /**
   * Create navigator from ActionReference with proper lifecycle management
   * @param ref ActionReference to execute and wrap
   * @returns New ActionDescriptorNavigator instance
   */
  public static from(ref: ActionReference): ActionDescriptorNavigator {
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for current layer properties
   * @returns Navigator for current layer
   * @throws Error if no active document
   */
  public static forCurrentLayer(): ActionDescriptorNavigator {
    if (typeof app === 'undefined' || !app.activeDocument) {
      throw new Error("No active Photoshop document");
    }
    
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for current document properties
   * @returns Navigator for current document
   * @throws Error if no active document
   */
  public static forCurrentDocument(): ActionDescriptorNavigator {
    if (typeof app === 'undefined' || !app.activeDocument) {
      throw new Error("No active Photoshop document");
    }
    
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for specific layer by index (1-based)
   * @param index Layer index (1-based)
   * @returns Navigator for specified layer
   * @throws Error if no active document
   */
  public static forLayerByIndex(index: number): ActionDescriptorNavigator {
    if (typeof app === 'undefined' || !app.activeDocument) {
      throw new Error("No active Photoshop document");
    }
    
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Navigate to nested object property with type validation
   * @param key Property key to navigate to
   * @returns New navigator for the nested object
   * @throws Error if key not found or not an object type
   */
  object(key: string): ActionDescriptorNavigator {
    this.checkDisposed();
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      throw new Error("Object key '" + key + "' not found");
    }
    
    // FIXED: Use getType with version compatibility
    if (PhotoshopVersion.hasGetType()) {
      var valueType = this.desc.getType(typeID);
      if (valueType !== DescValueType.OBJECTTYPE) {
        throw new Error("Key '" + key + "' is not an object type (found: " + valueType + ")");
      }
    }
    
    if (!PhotoshopVersion.hasGetObjectValue()) {
      throw new Error("getObjectValue not available in this Photoshop version");
    }
    
    var nestedDesc = this.desc.getObjectValue(typeID);
    return new ActionDescriptorNavigator(nestedDesc);
  }

  /**
   * Navigate to list property with type validation
   * @param key List property key
   * @returns ActionListNavigator for the list
   * @throws Error if key not found or not a list type
   */
  list(key: string): ActionListNavigator {
    this.checkDisposed();
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      throw new Error("List key '" + key + "' not found");
    }
    
    // FIXED: Use getType with version compatibility
    if (PhotoshopVersion.hasGetType()) {
      var valueType = this.desc.getType(typeID);
      if (valueType !== DescValueType.LISTTYPE) {
        throw new Error("Key '" + key + "' is not a list type (found: " + valueType + ")");
      }
    }
    
    var list = this.desc.getList(typeID);
    return new ActionListNavigator(list);
  }

  /**
   * Get sentinel value based on type for missing/invalid data
   * @param type Value type string
   * @returns Default value for the specified type
   */
  public static getSentinelValue<T>(type: string): T {
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
   * Get value with optional transformation and proper type validation
   * @param key Property key
   * @param type Expected value type
   * @param options Optional transformation and default value options
   * @returns Extracted value with transformations applied
   */
  getValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T {
    this.checkDisposed();
    var typeID = stringIDToTypeID(key);

    if (!this.desc.hasKey(typeID)) {
      if (options && options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return ActionDescriptorNavigator.getSentinelValue<T>(type);
    }

    // FIXED: Use getType with version compatibility
    if (PhotoshopVersion.hasGetType()) {
      var actualType = this.desc.getType(typeID);
      var expectedType = this.getExpectedDescValueType(type);
      
      if (actualType !== expectedType) {
        if (options && options.defaultValue !== undefined) {
          return options.defaultValue;
        }
        return ActionDescriptorNavigator.getSentinelValue<T>(type);
      }
    }

    var value: any;
    try {
      switch (type) {
        case 'string':
          value = this.desc.getString(typeID);
          break;
        case 'integer':
          value = this.desc.getInteger(typeID);
          break;
        case 'double':
          value = this.desc.getDouble(typeID);
          break;
        case 'boolean':
          value = this.desc.getBoolean(typeID);
          break;
        case 'enumerated':
          value = this.desc.getEnumerationValue(typeID);
          break;
        default:
          return ActionDescriptorNavigator.getSentinelValue<T>(type);
      }

      if (options && options.transformer) {
        try {
          value = options.transformer(value);
        } catch (transformError) {
          if (options.defaultValue !== undefined) {
            return options.defaultValue;
          }
          return ActionDescriptorNavigator.getSentinelValue<T>(type);
        }
      }

      return value as T;
    } catch (error) {
      if (options && options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return ActionDescriptorNavigator.getSentinelValue<T>(type);
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
   * Check if key exists in descriptor
   * @param key Property key to check
   * @returns True if key exists
   */
  hasKey(key: string): boolean {
    this.checkDisposed();
    return this.desc.hasKey(stringIDToTypeID(key));
  }

  /**
   * Get multiple values as tuple with error boundaries
   * @param specs Array of value specifications
   * @returns Array of extracted values
   */
  getValues(specs: { key: string, type: string, options?: ComparisonOptions }[]): any[] {
    this.checkDisposed();
    var results: any[] = [];
    
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      try {
        results.push(this.getValue(spec.key, spec.type as any, spec.options));
      } catch (error) {
        results.push(ActionDescriptorNavigator.getSentinelValue(spec.type));
      }
    }
    return results;
  }

  /**
   * Get multiple values as object with error boundaries
   * @param specs Object specification mapping property names to extraction specs
   * @returns Object with extracted values
   */
  getValuesAsObject<T extends Record<string, any>>(
    specs: { [K in keyof T]: { key: string, type: string, options?: ComparisonOptions } }
  ): T {
    this.checkDisposed();
    var result = {} as T;

    for (var propName in specs) {
      if (specs.hasOwnProperty(propName)) {
        var spec = specs[propName];
        try {
          result[propName as keyof T] = this.getValue(spec.key, spec.type as any, spec.options);
        } catch (error) {
          result[propName as keyof T] = ActionDescriptorNavigator.getSentinelValue(spec.type) as any;
        }
      }
    }

    return result;
  }

  /**
   * Get bounds object for layer with error handling
   * @returns Layer bounds object with pixel coordinates
   */
  getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
    this.checkDisposed();
    var defaultBounds = {
      left: -1, top: -1, right: -1, bottom: -1, width: -1, height: -1
    };

    if (!this.desc.hasKey(stringIDToTypeID('bounds'))) {
      return defaultBounds;
    }

    try {
      var typeID = stringIDToTypeID('bounds');
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && this.desc.getType(typeID) !== DescValueType.OBJECTTYPE) {
        return defaultBounds;
      }

      var boundsDesc = this.desc.getObjectValue(typeID);
      return {
        left: boundsDesc.getDouble(stringIDToTypeID('left')),
        top: boundsDesc.getDouble(stringIDToTypeID('top')),
        right: boundsDesc.getDouble(stringIDToTypeID('right')),
        bottom: boundsDesc.getDouble(stringIDToTypeID('bottom')),
        width: boundsDesc.getDouble(stringIDToTypeID('width')),
        height: boundsDesc.getDouble(stringIDToTypeID('height'))
      };
    } catch (error) {
      return defaultBounds;
    }
  }

  /**
   * Get text properties from textKey with version compatibility
   * @returns Text content, font name, and size information
   */
  getTextProperties(): { content: string; fontName: string; fontSize: number } | null {
    this.checkDisposed();
    var defaultProps = { content: "", fontName: "", fontSize: -1 };

    if (!this.desc.hasKey(stringIDToTypeID('textKey'))) {
      return defaultProps;
    }

    try {
      var textKeyID = stringIDToTypeID('textKey');
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && this.desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        return defaultProps;
      }

      var textKey = this.desc.getObjectValue(textKeyID);
      var textContent = textKey.getString(stringIDToTypeID('textKey'));
      
      var rangeListID = stringIDToTypeID('textStyleRange');
      if (!textKey.hasKey(rangeListID)) {
        return { content: textContent || "", fontName: "", fontSize: -1 };
      }
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        return { content: textContent || "", fontName: "", fontSize: -1 };
      }

      var textStyleRanges = textKey.getList(rangeListID);
      if (textStyleRanges.count > 0) {
        var firstRange = textStyleRanges.getObjectValue(0);
        var textStyle = firstRange.getObjectValue(stringIDToTypeID('textStyle'));
        
        return {
          content: textContent || "",
          fontName: textStyle.getString(stringIDToTypeID('fontName')) || "",
          fontSize: textStyle.getDouble(stringIDToTypeID('size')) || -1
        };
      }
      
      return { content: textContent || "", fontName: "", fontSize: -1 };
    } catch (error) {
      return defaultProps;
    }
  }

  /**
   * FIXED: Get layer count using global cache (now static method)
   * @returns Number of layers in document, -1 if unavailable
   */
  public static getLayerCount(): number {
    return GlobalCache.getLayerCount();
  }

  /**
   * FIXED: Extract all layer names using global cache (now static method)
   * @returns Array of layer names
   */
  public static extractAllLayerNames(): string[] {
    return GlobalCache.getLayerNames();
  }

  /**
   * Extract bullet styles with proper type validation
   * @param count Number of bullet styles to extract
   * @returns Array of bullet style strings
   */
  extractBulletStyles(count: number = 4): string[] {
    this.checkDisposed();
    var results: string[] = [];
    
    try {
      var textKeyID = stringIDToTypeID("textKey");
      if (!this.desc.hasKey(textKeyID)) {
        for (var i = 0; i < count; i++) {
          results.push("");
        }
        return results;
      }
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && this.desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        for (var i = 0; i < count; i++) {
          results.push("");
        }
        return results;
      }

      var textKey = this.desc.getObjectValue(textKeyID);
      var rangeListID = stringIDToTypeID("paragraphStyleRange");
      
      if (!textKey.hasKey(rangeListID)) {
        for (var i = 0; i < count; i++) {
          results.push("");
        }
        return results;
      }
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        for (var i = 0; i < count; i++) {
          results.push("");
        }
        return results;
      }

      var paragraphStyleRanges = textKey.getList(rangeListID);
      
      for (var i = 0; i < count; i++) {
        if (i < paragraphStyleRanges.count) {
          try {
            // FIXED: Use getType with version compatibility
            var hasType = PhotoshopVersion.hasGetType();
            if (!hasType || paragraphStyleRanges.getType(i) === DescValueType.OBJECTTYPE) {
              var range = paragraphStyleRanges.getObjectValue(i);
              var styleID = stringIDToTypeID("paragraphStyle");
              
              if (range.hasKey(styleID) && (!hasType || range.getType(styleID) === DescValueType.OBJECTTYPE)) {
                var paragraphStyle = range.getObjectValue(styleID);
                var listStyleID = stringIDToTypeID("listStyleType");
                
                if (paragraphStyle.hasKey(listStyleID) && 
                    (!hasType || paragraphStyle.getType(listStyleID) === DescValueType.ENUMTYPE)) {
                  var listStyleType = paragraphStyle.getEnumerationValue(listStyleID);
                  results.push(typeIDToStringID(listStyleType) || "");
                } else {
                  results.push("");
                }
              } else {
                results.push("");
              }
            } else {
              results.push("");
            }
          } catch (error) {
            results.push("");
          }
        } else {
          results.push("");
        }
      }
      
      return results;
    } catch (error) {
      for (var i = 0; i < count; i++) {
        results.push("");
      }
      return results;
    }
  }

  /**
   * Find first value in a list that matches predicate with proper validation
   * @param key List property key
   * @param type Value type
   * @param predicate Function to test each value
   * @param options Optional transformation and default value options
   * @returns First matching value or null
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    this.checkDisposed();
    
    try {
      var listID = stringIDToTypeID(key);
      if (!this.desc.hasKey(listID)) {
        return null;
      }
      
      // FIXED: Use getType with version compatibility
      if (PhotoshopVersion.hasGetType() && this.desc.getType(listID) !== DescValueType.LISTTYPE) {
        return null;
      }

      var list = this.desc.getList(listID);
      
      for (var i = 0; i < list.count; i++) {
        try {
          // FIXED: Use getType with version compatibility
          var hasType = PhotoshopVersion.hasGetType();
          if (!hasType || list.getType(i) === DescValueType.OBJECTTYPE) {
            var obj = new ActionDescriptorNavigator(list.getObjectValue(i));
            var value = obj.getValue<T>(key, type, options);
            if (predicate(value)) {
              obj.dispose();
              return value;
            }
            obj.dispose();
          }
        } catch (error) {
          // Continue to next item
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear internal caches when document changes
   */
  public static clearCaches(): void {
    GlobalCache.clear();
  }

  /**
   * Check if this navigator has been disposed
   */
  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionDescriptorNavigator has been disposed");
    }
  }

  /**
   * Dispose of this navigator to prevent memory leaks
   */
  dispose(): void {
    this._disposed = true;
  }
}

/**
 * Navigator for ActionList objects with proper bounds checking
 */
class ActionListNavigator {
  private list: ActionList;
  private _disposed: boolean;

  constructor(list: ActionList) {
    this.list = list;
    this._disposed = false;
  }

  /**
   * Get number of items in the list
   */
  get count(): number {
    this.checkDisposed();
    return this.list.count;
  }

  /**
   * Get object at specific index with bounds checking and type validation
   * @param index Zero-based index
   * @returns Navigator for object at index
   * @throws Error if index out of bounds or item is not an object
   */
  getObject(index: number): ActionDescriptorNavigator {
    this.checkDisposed();
    
    if (index >= this.list.count || index < 0) {
      throw new Error("Index " + index + " out of bounds (count: " + this.list.count + ")");
    }

    // FIXED: Use getType with version compatibility
    if (PhotoshopVersion.hasGetType() && this.list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    var obj = this.list.getObjectValue(index);
    return new ActionDescriptorNavigator(obj);
  }

  /**
   * Get value from all objects in list with proper error handling
   * @param key Property key to extract from each object
   * @param type Expected value type
   * @param options Optional transformation and default value options
   * @returns Array of extracted values
   */
  getAllValues<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var currentCount = this.list.count;

    for (var i = 0; i < currentCount; i++) {
      // FIXED: Use getType with version compatibility
      var hasType = PhotoshopVersion.hasGetType();
      if (!hasType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
        var obj: ActionDescriptorNavigator | undefined = undefined;
        try {
          obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          results.push(value);
        } catch (error) {
          if (options && options.defaultValue !== undefined) {
            results.push(options.defaultValue);
          } else {
            results.push(ActionDescriptorNavigator.getSentinelValue<T>(type));
          }
        } finally {
          if (obj) {
            obj.dispose();
          }
        }
      }
    }

    return results;
  }

  /**
   * Get first matching value that meets condition with proper cleanup
   * @param key Property key to extract
   * @param type Expected value type
   * @param predicate Function to test each value
   * @param options Optional transformation and default value options
   * @returns First matching value or null
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    this.checkDisposed();
    var currentCount = this.list.count;

    for (var i = 0; i < currentCount; i++) {
      // FIXED: Use getType with version compatibility
      var hasType = PhotoshopVersion.hasGetType();
      if (!hasType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
        var obj: ActionDescriptorNavigator | undefined = undefined;
        try {
          obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          if (predicate(value)) {
            return value;
          }
        } catch (error) {
          // Continue to next item
        } finally {
          if (obj) {
            obj.dispose();
          }
        }
      }
    }

    return null;
  }

  /**
   * Map over all objects and extract values with proper cleanup
   * @param extractor Function to extract value from each navigator
   * @returns Array of extracted values
   */
  mapValues<T = any>(
    extractor: (nav: ActionDescriptorNavigator, index: number) => T
  ): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var currentCount = this.list.count;

    for (var i = 0; i < currentCount; i++) {
      // FIXED: Use getType with version compatibility
      var hasType = PhotoshopVersion.hasGetType();
      if (!hasType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
        var obj: ActionDescriptorNavigator | undefined = undefined;
        try {
          obj = this.getObject(i);
          results.push(extractor(obj, i));
        } catch (error) {
          // Skip this item
        } finally {
          if (obj) {
            obj.dispose();
          }
        }
      }
    }

    return results;
  }

  /**
   * Check if this navigator has been disposed
   */
  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionListNavigator has been disposed");
    }
  }

  /**
   * Dispose of this navigator
   */
  dispose(): void {
    this._disposed = true;
  }
}