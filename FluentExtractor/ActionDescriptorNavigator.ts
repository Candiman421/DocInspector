/**
 * FIXED ActionDescriptor navigation utilities for Photoshop document analysis
 * CORRECTIONS: Removed duplicate interfaces, standardized sentinel values, improved error handling
 * FINAL VERSION: All patterns consistent with proper sentinel values for testing
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;
declare function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogMode?: number): ActionDescriptor;

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

class ActionDescriptorNavigator {
  constructor(private desc: ActionDescriptor) { }

  /**
   * Create navigator from ActionReference using proper patterns
   */
  static from(ref: ActionReference): ActionDescriptorNavigator {
    return new ActionDescriptorNavigator(executeActionGet(ref));
  }

  /**
   * Create navigator for layer properties
   */
  static forCurrentLayer(): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return new ActionDescriptorNavigator(executeActionGet(ref));
  }

  /**
   * Create navigator for document properties
   */
  static forCurrentDocument(): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return new ActionDescriptorNavigator(executeActionGet(ref));
  }

  /**
   * Create navigator for specific layer by index
   */
  static forLayerByIndex(index: number): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index); // 1-based indexing
    return new ActionDescriptorNavigator(executeActionGet(ref));
  }

  /**
   * Navigate to nested object property
   */
  object(key: string): ActionDescriptorNavigator {
    if (this.desc.hasKey(stringIDToTypeID(key))) {
      return new ActionDescriptorNavigator(
        this.desc.getObjectValue(stringIDToTypeID(key))
      );
    }
    throw new Error("Object key '" + key + "' not found");
  }

  /**
   * Navigate to list property
   */
  list(key: string): ActionListNavigator {
    if (this.desc.hasKey(stringIDToTypeID(key))) {
      return new ActionListNavigator(
        this.desc.getList(stringIDToTypeID(key))
      );
    }
    throw new Error("List key '" + key + "' not found");
  }

  /**
   * FIXED: Get sentinel value based on type for testing scenarios - made static for broader access
   */
  static getSentinelValue<T>(type: string): T {
    switch (type) {
      case 'string':
      case 'enumerated':
        return "" as T;        // Empty string = missing/invalid
      case 'integer':
      case 'double':
        return -1 as T;        // -1 = invalid (no negative pixels/sizes/percentages in PS)
      case 'boolean':
        return false as T;     // false = not found/not enabled
      default:
        return null as T;
    }
  }

  /**
   * Get value with optional transformation - returns actual value for assignment
   * FIXED: Uses sentinel values by default
   */
  getValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T {
    var typeID = stringIDToTypeID(key);

    if (!this.desc.hasKey(typeID)) {
      if (options && options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return ActionDescriptorNavigator.getSentinelValue<T>(type);
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

      // Apply transformation if specified
      if (options && options.transformer) {
        value = options.transformer(value);
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
   * Check if key exists
   */
  hasKey(key: string): boolean {
    return this.desc.hasKey(stringIDToTypeID(key));
  }

  /**
   * Get multiple values as tuple - FIXED: Better error handling with sentinel values
   */
  getValues(specs: { key: string, type: string, options?: ComparisonOptions }[]): any[] {
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
   * Get multiple values as object - FIXED: Better error handling
   */
  getValuesAsObject<T extends Record<string, any>>(
    specs: { [K in keyof T]: { key: string, type: string, options?: ComparisonOptions } }
  ): T {
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
   * Get bounds object for layer (layer property only)
   * FIXED: Returns sentinel values for missing bounds
   */
  getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
    if (!this.desc.hasKey(stringIDToTypeID('bounds'))) {
      return {
        left: -1,
        top: -1,
        right: -1,
        bottom: -1,
        width: -1,
        height: -1
      };
    }

    try {
      var boundsDesc = this.desc.getObjectValue(stringIDToTypeID('bounds'));
      return {
        left: boundsDesc.getDouble(stringIDToTypeID('left')),
        top: boundsDesc.getDouble(stringIDToTypeID('top')),
        right: boundsDesc.getDouble(stringIDToTypeID('right')),
        bottom: boundsDesc.getDouble(stringIDToTypeID('bottom')),
        width: boundsDesc.getDouble(stringIDToTypeID('width')),
        height: boundsDesc.getDouble(stringIDToTypeID('height'))
      };
    } catch (error) {
      return {
        left: -1,
        top: -1,
        right: -1,
        bottom: -1,
        width: -1,
        height: -1
      };
    }
  }

  /**
   * Get text properties from textKey (layer property only)
   * FIXED: Returns sentinel values for missing text
   */
  getTextProperties(): { content: string; fontName: string; fontSize: number } | null {
    if (!this.desc.hasKey(stringIDToTypeID('textKey'))) {
      return {
        content: "",
        fontName: "",
        fontSize: -1
      };
    }

    try {
      var textKey = this.desc.getObjectValue(stringIDToTypeID('textKey'));
      var textContent = textKey.getString(stringIDToTypeID('textKey'));
      
      var textStyleRanges = textKey.getList(stringIDToTypeID('textStyleRange'));
      if (textStyleRanges.count > 0) {
        var firstRange = textStyleRanges.getObjectValue(0);
        var textStyle = firstRange.getObjectValue(stringIDToTypeID('textStyle'));
        
        return {
          content: textContent || "",
          fontName: textStyle.getString(stringIDToTypeID('fontName')) || "",
          fontSize: textStyle.getDouble(stringIDToTypeID('size')) || -1
        };
      }
      
      return {
        content: textContent || "",
        fontName: "",
        fontSize: -1
      };
    } catch (error) {
      return {
        content: "",
        fontName: "",
        fontSize: -1
      };
    }
  }

  /**
   * FIXED: Get layer count using proper document reference pattern with error handling
   */
  getLayerCount(): number {
    try {
      var ref = new ActionReference();
      ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
      ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
    } catch (error) {
      return -1; // Sentinel value for failed layer count
    }
  }

  /**
   * FIXED: Extract all layer names using correct iteration pattern with error handling
   */
  extractAllLayerNames(): string[] {
    var results: string[] = [];
    
    try {
      var layerCount = this.getLayerCount();
      if (layerCount === -1) {
        return []; // Empty array for failed layer count
      }
      
      for (var i = 1; i <= layerCount; i++) {
        try {
          var layerRef = new ActionReference();
          layerRef.putIndex(charIDToTypeID("Lyr "), i);
          var layerDesc = executeActionGet(layerRef);
          var name = layerDesc.getString(stringIDToTypeID("name"));
          results.push(name || ""); // Empty string for missing name
        } catch (error) {
          results.push(""); // Empty string sentinel
        }
      }
    } catch (error) {
      // Return empty array if completely failed
      return [];
    }
    
    return results;
  }

  /**
   * FIXED: Extract bullet styles using corrected textKey navigation with sentinel values
   */
  extractBulletStyles(count: number = 4): string[] {
    try {
      var textKey = this.desc.getObjectValue(stringIDToTypeID("textKey"));
      var paragraphStyleRanges = textKey.getList(stringIDToTypeID("paragraphStyleRange"));
      var results: string[] = [];
      
      for (var i = 0; i < count; i++) {
        if (i < paragraphStyleRanges.count) {
          try {
            var range = paragraphStyleRanges.getObjectValue(i);
            var paragraphStyle = range.getObjectValue(stringIDToTypeID("paragraphStyle"));
            var listStyleType = paragraphStyle.getEnumerationValue(stringIDToTypeID("listStyleType"));
            results.push(typeIDToStringID(listStyleType) || "");
          } catch (error) {
            results.push(""); // Empty string sentinel
          }
        } else {
          results.push(""); // Empty string sentinel
        }
      }
      
      return results;
    } catch (error) {
      var fallbackResults: string[] = [];
      for (var i = 0; i < count; i++) {
        fallbackResults.push(""); // Empty string sentinels
      }
      return fallbackResults;
    }
  }
}

class ActionListNavigator {
  constructor(private list: ActionList) { }

  get count(): number {
    return this.list.count;
  }

  /**
   * Get object at specific index
   */
  getObject(index: number): ActionDescriptorNavigator {
    if (index >= this.list.count) {
      throw new Error("Index " + index + " out of bounds (count: " + this.list.count + ")");
    }

    if (this.list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    return new ActionDescriptorNavigator(this.list.getObjectValue(index));
  }

  /**
   * Get value from all objects in list - returns array of values
   * FIXED: Better sentinel value handling
   */
  getAllValues<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T[] {
    var results: T[] = [];

    for (var i = 0; i < this.list.count; i++) {
      if (this.list.getType(i) === DescValueType.OBJECTTYPE) {
        try {
          var obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          results.push(value);
        } catch (error) {
          if (options && options.defaultValue !== undefined) {
            results.push(options.defaultValue);
          } else {
            results.push(ActionDescriptorNavigator.getSentinelValue<T>(type));
          }
        }
      }
    }

    return results;
  }

  /**
   * Get first matching value that meets condition
   * FIXED: Better error handling
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    for (var i = 0; i < this.list.count; i++) {
      if (this.list.getType(i) === DescValueType.OBJECTTYPE) {
        try {
          var obj = this.getObject(i);
          var value = obj.getValue<T>(key, type, options);
          if (predicate(value)) {
            return value;
          }
        } catch (error) {
          // Continue to next item
        }
      }
    }

    return null;
  }

  /**
   * Map over all objects and extract values
   */
  mapValues<T = any>(
    extractor: (nav: ActionDescriptorNavigator, index: number) => T
  ): T[] {
    var results: T[] = [];

    for (var i = 0; i < this.list.count; i++) {
      if (this.list.getType(i) === DescValueType.OBJECTTYPE) {
        var obj = this.getObject(i);
        results.push(extractor(obj, i));
      }
    }

    return results;
  }
}