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

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

/**
 * Core navigation class for ActionDescriptor structures
 */
class ActionDescriptorNavigator {
  private desc: ActionDescriptor;
  private _disposed: boolean;

  constructor(desc: ActionDescriptor) {
    this.desc = desc;
    this._disposed = false;
  }

  /**
   * Create navigator from ActionReference
   */
  static from(ref: ActionReference): ActionDescriptorNavigator {
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for current layer
   */
  static forCurrentLayer(): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for current document
   */
  static forCurrentDocument(): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Create navigator for layer by index (1-based)
   */
  static forLayerByIndex(index: number): ActionDescriptorNavigator {
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), index);
    var desc = executeActionGet(ref);
    return new ActionDescriptorNavigator(desc);
  }

  /**
   * Navigate to nested object property
   */
  object(key: string): ActionDescriptorNavigator | null {
    this.checkDisposed();
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      return null;
    }
    
    try {
      var nestedDesc = this.desc.getObjectValue(typeID);
      return new ActionDescriptorNavigator(nestedDesc);
    } catch (error) {
      return null;
    }
  }

  /**
   * Navigate to list property
   */
  list(key: string): ActionListNavigator | null {
    this.checkDisposed();
    var typeID = stringIDToTypeID(key);
    
    if (!this.desc.hasKey(typeID)) {
      return null;
    }
    
    try {
      var list = this.desc.getList(typeID);
      return new ActionListNavigator(list);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get sentinel value based on type
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
   * Get value with optional transformation
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
   * Check if key exists
   */
  hasKey(key: string): boolean {
    this.checkDisposed();
    return this.desc.hasKey(stringIDToTypeID(key));
  }

  /**
   * Get multiple values as tuple
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
   * Get multiple values as object
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
   * Get bounds object
   */
  getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } | null {
    this.checkDisposed();

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
      return null;
    }
  }

  /**
   * Get text properties
   */
  getTextProperties(): { content: string; fontName: string; fontSize: number } | null {
    this.checkDisposed();

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
      
      return { content: textContent || "", fontName: "", fontSize: -1 };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get layer count
   */
  static getLayerCount(): number {
    try {
      var ref = new ActionReference();
      ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
      ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
    } catch (error) {
      return -1;
    }
  }

  /**
   * Extract all layer names
   */
  static extractAllLayerNames(): string[] {
    var results: string[] = [];
    
    try {
      var layerCount = ActionDescriptorNavigator.getLayerCount();
      if (layerCount <= 0) return results;
      
      for (var i = 1; i <= layerCount; i++) {
        try {
          var layerRef = new ActionReference();
          layerRef.putIndex(charIDToTypeID("Lyr "), i);
          var layerDesc = executeActionGet(layerRef);
          
          var name = layerDesc.getString(stringIDToTypeID("name"));
          results.push(name || "");
        } catch (error) {
          results.push("");
        }
      }
    } catch (error) {
      return [];
    }
    
    return results;
  }

  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionDescriptorNavigator has been disposed");
    }
  }

  dispose(): void {
    this._disposed = true;
  }
}

/**
 * Navigator for ActionList objects
 */
class ActionListNavigator {
  private list: ActionList;
  private _disposed: boolean;

  constructor(list: ActionList) {
    this.list = list;
    this._disposed = false;
  }

  get count(): number {
    this.checkDisposed();
    return this.list.count;
  }

  /**
   * Get object at specific index
   */
  getObject(index: number): ActionDescriptorNavigator | null {
    this.checkDisposed();
    
    if (index >= this.list.count || index < 0) {
      return null;
    }

    try {
      var obj = this.list.getObjectValue(index);
      return new ActionDescriptorNavigator(obj);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all values from list - FIXED: Proper resource management
   */
  getAllValues<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ComparisonOptions
  ): T[] {
    this.checkDisposed();
    var results: T[] = [];

    for (var i = 0; i < this.list.count; i++) {
      var obj: ActionDescriptorNavigator | null = null;
      try {
        obj = this.getObject(i);
        if (obj) {
          var value = obj.getValue<T>(key, type, options);
          results.push(value);
        } else {
          if (options && options.defaultValue !== undefined) {
            results.push(options.defaultValue);
          } else {
            results.push(ActionDescriptorNavigator.getSentinelValue<T>(type));
          }
        }
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

    return results;
  }

  /**
   * Find first matching value - FIXED: Proper resource management
   */
  findValue<T = any>(
    key: string,
    type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T) => boolean,
    options?: ComparisonOptions
  ): T | null {
    this.checkDisposed();

    for (var i = 0; i < this.list.count; i++) {
      var obj: ActionDescriptorNavigator | null = null;
      try {
        obj = this.getObject(i);
        if (obj) {
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

  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionListNavigator has been disposed");
    }
  }

  dispose(): void {
    this._disposed = true;
  }
}