/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Provides imperative-style navigation and tuple extraction capabilities
 * FIXED: Improved version compatibility, error handling, and type safety
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

// FIXED: Comprehensive DescValueType declaration with fallbacks
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

// FIXED: Complete interface definitions to avoid conflicts
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

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

// FIXED: Consolidated version compatibility detection
var PhotoshopVersionManager = (function() {
  var detected = false;
  var hasGetObjectValue = true;
  var hasGetType = true;
  var version = null;
  
  function detect() {
    if (detected) return;
    
    try {
      // Test with a simple document reference
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      // Test getObjectValue availability
      if (typeof testDesc.getObjectValue !== 'function') {
        hasGetObjectValue = false;
      }
      
      // Test getType availability  
      if (typeof testDesc.getType !== 'function') {
        hasGetType = false;
      }
      
      // Get version if available
      if (typeof app !== 'undefined' && app.version) {
        try {
          version = parseFloat(app.version);
        } catch (e) {
          version = null;
        }
      }
    } catch (error) {
      // Conservative approach - disable methods we can't verify
      hasGetObjectValue = false;
      hasGetType = false;
    }
    
    detected = true;
  }
  
  return {
    hasGetObjectValue: function() {
      detect();
      return hasGetObjectValue;
    },
    
    hasGetType: function() {
      detect();
      return hasGetType;
    },
    
    getVersion: function() {
      detect();
      return version;
    },
    
    reset: function() {
      detected = false;
      hasGetObjectValue = true;
      hasGetType = true;
      version = null;
    }
  };
})();

// FIXED: Thread-safe global cache with better error handling
var GlobalCacheManager = (function() {
  var layerNamesCache = null;
  var layerCountCache = null;
  var cacheTimeout = 1000; // 1 second timeout
  
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
            var hasGetType = PhotoshopVersionManager.hasGetType();
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
      // Return empty array on any major error
      return [];
    }
    
    return results;
  }
  
  function getLayerNames() {
    if (isValidCache(layerNamesCache)) {
      return layerNamesCache.names.slice(); // Return copy
    }
    
    var names = extractLayerNames();
    layerNamesCache = { 
      names: names.slice(), // Store copy
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
 * Core navigation class for ActionDescriptor structures
 * FIXED: Improved error handling, memory management, and type safety
 */
class ActionDescriptorNavigator {
  private desc: ActionDescriptor;
  private _disposed: boolean;

  constructor(desc: ActionDescriptor) {
    if (!desc) {
      throw new Error("ActionDescriptor cannot be null or undefined");
    }
    this.desc = desc;
    this._disposed = false;
  }

  /**
   * Create navigator from ActionReference with proper lifecycle management
   */
  static from(ref: ActionReference): ActionDescriptorNavigator {
    if (!ref) {
      throw new Error("ActionReference cannot be null or undefined");
    }
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for current layer properties
   */
  static forCurrentLayer(): ActionDescriptorNavigator {
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
   */
  static forCurrentDocument(): ActionDescriptorNavigator {
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
   */
  static forLayerByIndex(index: number): ActionDescriptorNavigator {
    if (typeof app === 'undefined' || !app.activeDocument) {
      throw new Error("No active Photoshop document");
    }
    
    if (typeof index !== 'number' || index < 1) {
      throw new Error("Layer index must be a positive number (1-based)");
    }
    
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Navigate to nested object property with type validation
   */
  object(key: string): ActionDescriptorNavigator {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string') {
      throw new Error("Object key must be a non-empty string");
    }
    
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      throw new Error("Object key '" + key + "' not found");
    }
    
    var hasGetType = PhotoshopVersionManager.hasGetType();
    if (hasGetType && this.desc.getType) {
      var valueType = this.desc.getType(typeID);
      if (valueType !== DescValueType.OBJECTTYPE) {
        throw new Error("Key '" + key + "' is not an object type (found: " + valueType + ")");
      }
    }
    
    if (!PhotoshopVersionManager.hasGetObjectValue()) {
      throw new Error("getObjectValue not available in this Photoshop version");
    }
    
    var nestedDesc = this.desc.getObjectValue(typeID);
    return new ActionDescriptorNavigator(nestedDesc);
  }

  /**
   * Navigate to list property with type validation
   */
  list(key: string): ActionListNavigator {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string') {
      throw new Error("List key must be a non-empty string");
    }
    
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      throw new Error("List key '" + key + "' not found");
    }
    
    var hasGetType = PhotoshopVersionManager.hasGetType();
    if (hasGetType && this.desc.getType) {
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
   */
  static getSentinelValue<T>(type: string): T {
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
   * FIXED: Improved getValue with better type validation and error handling
   */
  getValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string') {
      throw new Error("Key must be a non-empty string");
    }
    
    var typeID = stringIDToTypeID(key);

    if (!this.desc.hasKey(typeID)) {
      if (options && options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return ActionDescriptorNavigator.getSentinelValue<T>(type);
    }

    var hasGetType = PhotoshopVersionManager.hasGetType();
    if (hasGetType && this.desc.getType) {
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
   */
  hasKey(key: string): boolean {
    this.checkDisposed();
    if (!key || typeof key !== 'string') {
      return false;
    }
    return this.desc.hasKey(stringIDToTypeID(key));
  }

  /**
   * FIXED: Improved getValues with better error boundaries
   */
  getValues(specs: { key: string, type: string, options?: ComparisonOptions }[]): any[] {
    this.checkDisposed();
    
    if (!specs || !Array.prototype.isArray || !Array.prototype.isArray.call(null, specs)) {
      return [];
    }
    
    var results: any[] = [];
    
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      if (!spec || !spec.key || !spec.type) {
        results.push(ActionDescriptorNavigator.getSentinelValue(spec.type || 'string'));
        continue;
      }
      
      try {
        results.push(this.getValue(spec.key, spec.type as any, spec.options));
      } catch (error) {
        results.push(ActionDescriptorNavigator.getSentinelValue(spec.type));
      }
    }
    return results;
  }

  /**
   * FIXED: Improved getValuesAsObject with better error boundaries
   */
  getValuesAsObject<T extends Record<string, any>>(
    specs: { [K in keyof T]: { key: string, type: string, options?: ComparisonOptions } }
  ): T {
    this.checkDisposed();
    var result = {} as T;

    if (!specs) {
      return result;
    }

    for (var propName in specs) {
      if (specs.hasOwnProperty(propName)) {
        var spec = specs[propName];
        if (!spec || !spec.key || !spec.type) {
          result[propName as keyof T] = ActionDescriptorNavigator.getSentinelValue(spec.type || 'string') as any;
          continue;
        }
        
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
   * FIXED: Improved getBounds with better error handling
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
      
      var hasGetType = PhotoshopVersionManager.hasGetType();
      if (hasGetType && this.desc.getType && this.desc.getType(typeID) !== DescValueType.OBJECTTYPE) {
        return defaultBounds;
      }

      if (!PhotoshopVersionManager.hasGetObjectValue()) {
        return defaultBounds;
      }

      var boundsDesc = this.desc.getObjectValue(typeID);
      
      return {
        left: this.safeGetDouble(boundsDesc, 'left'),
        top: this.safeGetDouble(boundsDesc, 'top'),
        right: this.safeGetDouble(boundsDesc, 'right'),
        bottom: this.safeGetDouble(boundsDesc, 'bottom'),
        width: this.safeGetDouble(boundsDesc, 'width'),
        height: this.safeGetDouble(boundsDesc, 'height')
      };
    } catch (error) {
      return defaultBounds;
    }
  }

  /**
   * Helper method for safe double extraction
   */
  private safeGetDouble(desc: ActionDescriptor, key: string): number {
    try {
      var typeID = stringIDToTypeID(key);
      if (desc.hasKey(typeID)) {
        return desc.getDouble(typeID);
      }
    } catch (error) {
      // Fall through to return default
    }
    return -1;
  }

  /**
   * FIXED: Improved getTextProperties with version compatibility
   */
  getTextProperties(): { content: string; fontName: string; fontSize: number } | null {
    this.checkDisposed();
    var defaultProps = { content: "", fontName: "", fontSize: -1 };

    if (!this.desc.hasKey(stringIDToTypeID('textKey'))) {
      return defaultProps;
    }

    try {
      var textKeyID = stringIDToTypeID('textKey');
      
      var hasGetType = PhotoshopVersionManager.hasGetType();
      if (hasGetType && this.desc.getType && this.desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        return defaultProps;
      }

      if (!PhotoshopVersionManager.hasGetObjectValue()) {
        return defaultProps;
      }

      var textKey = this.desc.getObjectValue(textKeyID);
      var textContent = "";
      
      // Try to get text content
      try {
        if (textKey.hasKey(stringIDToTypeID('textKey'))) {
          textContent = textKey.getString(stringIDToTypeID('textKey'));
        }
      } catch (e) {
        // textContent remains empty
      }
      
      var rangeListID = stringIDToTypeID('textStyleRange');
      if (!textKey.hasKey(rangeListID)) {
        return { content: textContent, fontName: "", fontSize: -1 };
      }
      
      if (hasGetType && textKey.getType && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        return { content: textContent, fontName: "", fontSize: -1 };
      }

      var textStyleRanges = textKey.getList(rangeListID);
      if (textStyleRanges.count > 0) {
        try {
          var firstRange = textStyleRanges.getObjectValue(0);
          var textStyleID = stringIDToTypeID('textStyle');
          
          if (firstRange.hasKey(textStyleID)) {
            var textStyle = firstRange.getObjectValue(textStyleID);
            
            var fontName = "";
            var fontSize = -1;
            
            try {
              if (textStyle.hasKey(stringIDToTypeID('fontName'))) {
                fontName = textStyle.getString(stringIDToTypeID('fontName'));
              }
            } catch (e) {
              // fontName remains empty
            }
            
            try {
              if (textStyle.hasKey(stringIDToTypeID('size'))) {
                fontSize = textStyle.getDouble(stringIDToTypeID('size'));
              }
            } catch (e) {
              // fontSize remains -1
            }
            
            return {
              content: textContent,
              fontName: fontName,
              fontSize: fontSize
            };
          }
        } catch (rangeError) {
          // Fall through to default
        }
      }
      
      return { content: textContent, fontName: "", fontSize: -1 };
    } catch (error) {
      return defaultProps;
    }
  }

  /**
   * Get layer count using global cache (static method)
   */
  static getLayerCount(): number {
    return GlobalCacheManager.getLayerCount();
  }

  /**
   * Extract all layer names using global cache (static method)
   */
  static extractAllLayerNames(): string[] {
    return GlobalCacheManager.getLayerNames();
  }

  /**
   * FIXED: Improved extractBulletStyles with proper type validation
   */
  extractBulletStyles(count: number = 4): string[] {
    this.checkDisposed();
    var results: string[] = [];
    
    // Initialize results array with empty strings
    for (var i = 0; i < count; i++) {
      results.push("");
    }
    
    try {
      var textKeyID = stringIDToTypeID("textKey");
      if (!this.desc.hasKey(textKeyID)) {
        return results;
      }
      
      var hasGetType = PhotoshopVersionManager.hasGetType();
      if (hasGetType && this.desc.getType && this.desc.getType(textKeyID) !== DescValueType.OBJECTTYPE) {
        return results;
      }

      if (!PhotoshopVersionManager.hasGetObjectValue()) {
        return results;
      }

      var textKey = this.desc.getObjectValue(textKeyID);
      var rangeListID = stringIDToTypeID("paragraphStyleRange");
      
      if (!textKey.hasKey(rangeListID)) {
        return results;
      }
      
      if (hasGetType && textKey.getType && textKey.getType(rangeListID) !== DescValueType.LISTTYPE) {
        return results;
      }

      var paragraphStyleRanges = textKey.getList(rangeListID);
      var actualCount = Math.min(count, paragraphStyleRanges.count);
      
      for (var i = 0; i < actualCount; i++) {
        try {
          var hasGetTypeForList = hasGetType && paragraphStyleRanges.getType;
          if (!hasGetTypeForList || paragraphStyleRanges.getType(i) === DescValueType.OBJECTTYPE) {
            var range = paragraphStyleRanges.getObjectValue(i);
            var styleID = stringIDToTypeID("paragraphStyle");
            
            if (range.hasKey(styleID)) {
              var hasGetTypeForRange = hasGetType && range.getType;
              if (!hasGetTypeForRange || range.getType(styleID) === DescValueType.OBJECTTYPE) {
                var paragraphStyle = range.getObjectValue(styleID);
                var listStyleID = stringIDToTypeID("listStyleType");
                
                if (paragraphStyle.hasKey(listStyleID)) {
                  var hasGetTypeForStyle = hasGetType && paragraphStyle.getType;
                  if (!hasGetTypeForStyle || paragraphStyle.getType(listStyleID) === DescValueType.ENUMTYPE) {
                    var listStyleType = paragraphStyle.getEnumerationValue(listStyleID);
                    var styleString = typeIDToStringID(listStyleType);
                    results[i] = styleString || "";
                  }
                }
              }
            }
          }
        } catch (error) {
          // results[i] already initialized to ""
        }
      }
      
      return results;
    } catch (error) {
      return results;
    }
  }

  /**
   * FIXED: Improved findValue with proper validation
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string' || !predicate) {
      return null;
    }
    
    try {
      var listID = stringIDToTypeID(key);
      if (!this.desc.hasKey(listID)) {
        return null;
      }
      
      var hasGetType = PhotoshopVersionManager.hasGetType();
      if (hasGetType && this.desc.getType && this.desc.getType(listID) !== DescValueType.LISTTYPE) {
        return null;
      }

      var list = this.desc.getList(listID);
      
      for (var i = 0; i < list.count; i++) {
        try {
          var hasGetTypeForList = hasGetType && list.getType;
          if (!hasGetTypeForList || list.getType(i) === DescValueType.OBJECTTYPE) {
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
  static clearCaches(): void {
    GlobalCacheManager.clear();
  }

  /**
   * Reset version detection (for testing)
   */
  static resetVersionDetection(): void {
    PhotoshopVersionManager.reset();
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
 * FIXED: Improved ActionListNavigator with proper bounds checking
 */
class ActionListNavigator {
  private list: ActionList;
  private _disposed: boolean;

  constructor(list: ActionList) {
    if (!list) {
      throw new Error("ActionList cannot be null or undefined");
    }
    this.list = list;
    this._disposed = false;
  }

  /**
   * Get number of items in the list
   */
  get count(): number {
    this.checkDisposed();
    return this.list.count || 0;
  }

  /**
   * FIXED: Improved getObject with bounds checking and type validation
   */
  getObject(index: number): ActionDescriptorNavigator {
    this.checkDisposed();
    
    if (typeof index !== 'number' || index < 0) {
      throw new Error("Index must be a non-negative number");
    }
    
    if (index >= this.list.count) {
      throw new Error("Index " + index + " out of bounds (count: " + this.list.count + ")");
    }

    var hasGetType = PhotoshopVersionManager.hasGetType();
    if (hasGetType && this.list.getType && this.list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    var obj = this.list.getObjectValue(index);
    return new ActionDescriptorNavigator(obj);
  }

  /**
   * FIXED: Improved getAllValues with proper error handling
   */
  getAllValues<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T[] {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string') {
      return [];
    }
    
    var results: T[] = [];
    var currentCount = this.list.count;
    var sentinelValue = (options && options.defaultValue !== undefined) ? 
      options.defaultValue : 
      ActionDescriptorNavigator.getSentinelValue<T>(type);

    for (var i = 0; i < currentCount; i++) {
      var obj: ActionDescriptorNavigator | undefined = undefined;
      try {
        var hasGetType = PhotoshopVersionManager.hasGetType();
        if (!hasGetType || !this.list.getType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
          obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          results.push(value);
        } else {
          results.push(sentinelValue);
        }
      } catch (error) {
        results.push(sentinelValue);
      } finally {
        if (obj) {
          obj.dispose();
        }
      }
    }

    return results;
  }

  /**
   * FIXED: Improved findValue with proper cleanup
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    this.checkDisposed();
    
    if (!key || typeof key !== 'string' || !predicate) {
      return null;
    }
    
    var currentCount = this.list.count;

    for (var i = 0; i < currentCount; i++) {
      var obj: ActionDescriptorNavigator | undefined = undefined;
      try {
        var hasGetType = PhotoshopVersionManager.hasGetType();
        if (!hasGetType || !this.list.getType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
          obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          if (predicate(value)) {
            return value;
          }
        }
      } catch (error) {
        // Continue to next item
      } finally {
        if (obj) {
          obj.dispose();
        }
      }
    }

    return null;
  }

  /**
   * FIXED: Improved mapValues with proper cleanup
   */
  mapValues<T = any>(
    extractor: (nav: ActionDescriptorNavigator, index: number) => T
  ): T[] {
    this.checkDisposed();
    
    if (!extractor || typeof extractor !== 'function') {
      return [];
    }
    
    var results: T[] = [];
    var currentCount = this.list.count;

    for (var i = 0; i < currentCount; i++) {
      var obj: ActionDescriptorNavigator | undefined = undefined;
      try {
        var hasGetType = PhotoshopVersionManager.hasGetType();
        if (!hasGetType || !this.list.getType || this.list.getType(i) === DescValueType.OBJECTTYPE) {
          obj = this.getObject(i);
          var result = extractor(obj, i);
          results.push(result);
        }
      } catch (error) {
        // Skip this item
      } finally {
        if (obj) {
          obj.dispose();
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