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
 * Primary fluent interface for navigating ActionDescriptor structures
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
    // Use static create() method
  }

  /**
   * Get sentinel value based on type
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
   * Get sentinel value - static version
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
    this.segments.push({ key: key, type: 'object' });
    return this;
  }

  /**
   * Navigate to list property
   */
  list(key: string): ActionDescriptorPath {
    this.checkDisposed();
    this.segments.push({ key: key, type: 'list' });
    return this;
  }

  /**
   * Access specific index in list
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
   * Extract final value
   */
  value<T = any>(
    key: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'
  ): ActionDescriptorPath {
    this.checkDisposed();
    this.segments.push({ key: key, type: 'value', valueType: valueType });
    return this;
  }

  /**
   * Add custom transformation
   */
  transform(transformer: ValueTransformer): ActionDescriptorPath {
    this.checkDisposed();
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
   * Convert to percentage
   */
  toPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { 
      return typeof val === 'number' ? val * 100 : val;
    });
  }

  /**
   * Set default value if extraction fails
   */
  defaultTo<T>(value: T): ActionDescriptorPath {
    this.checkDisposed();
    this.defaultReturnValue = value;
    return this;
  }

  /**
   * Extract the value from the ActionDescriptor
   * UPDATED: Consistent error handling - returns sentinel values for primitive types, null for complex types
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
   */
  tryExtract<T = any>(rootDesc: ActionDescriptor): T | null {
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
    try {
      var result = this.extract<T>(rootDesc);
      // Check for sentinel values and treat them as missing
      if (result === null || result === undefined || result === -1 || result === "" || result === false) {
        return fallback;
      }
      return result;
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Extract all layer names
   */
  extractAllLayerNames(): string[] {
    this.checkDisposed();
    return ActionDescriptorNavigator.extractAllLayerNames();
  }

  /**
   * Extract text style values from text layer
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
      var textKey = desc.getObjectValue(stringIDToTypeID("textKey"));
      var textStyleRanges = textKey.getList(stringIDToTypeID("textStyleRange"));
      
      for (var i = 0; i < count; i++) {
        if (i < textStyleRanges.count) {
          try {
            var range = textStyleRanges.getObjectValue(i);
            var value = ActionDescriptorPath.extractValueFromDescriptor(range, subPath, valueType);
            results.push(value as T);
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
   * Find value in list by predicate
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
      
      for (var i = 0; i < list.count; i++) {
        try {
          var itemDesc = list.getObjectValue(i);
          var value = this.extractValueFromDescriptor(itemDesc, subPath, valueType) as T;
          if (predicate(value, i)) {
            return value;
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

  private resolvePath(rootDesc: ActionDescriptor): any {
    var current: any = rootDesc;

    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var typeID = stringIDToTypeID(segment.key);

      if (!current.hasKey(typeID)) {
        throw new Error("Key '" + segment.key + "' not found");
      }

      switch (segment.type) {
        case 'object':
          current = current.getObjectValue(typeID);
          break;

        case 'list':
          var list = current.getList(typeID);
          if (segment.index !== undefined) {
            if (segment.index >= list.count) {
              throw new Error("List index " + segment.index + " out of bounds");
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
            return this.getSentinelValue(valueType);
          }
          current = current.getObjectValue(typeID);
        }
      }
      return this.getSentinelValue(valueType);
    } catch (error) {
      return this.getSentinelValue(valueType);
    }
  }

  private static extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
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
            return ActionDescriptorPath.getSentinelValue(valueType);
          }
          current = current.getObjectValue(typeID);
        }
      }
      return ActionDescriptorPath.getSentinelValue(valueType);
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
        throw transformError;
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

  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ActionDescriptorPath has been disposed");
    }
  }

  dispose(): void {
    this._disposed = true;
    this.segments = [];
    this.transformations = [];
  }
}

/**
 * Factory class for common operations
 * UPDATED: Consistent default value handling across all factory methods
 */
class PathFactory {
  /**
   * Create object navigation path
   */
  obj(key: string): ActionDescriptorPath { 
    return ActionDescriptorPath.create().object(key); 
  }

  /**
   * Create list navigation path
   */
  list(key: string): ActionDescriptorPath { 
    return ActionDescriptorPath.create().list(key); 
  }

  /**
   * Create value extraction path
   */
  val(key: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'): ActionDescriptorPath {
    return ActionDescriptorPath.create().value(key, type).defaultTo(this.getDefaultForType(type));
  }

  /**
   * Extract bounds with unit conversion
   */
  bounds(property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'): ActionDescriptorPath {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor()
      .defaultTo(-1);
  }

  /**
   * Extract text style properties
   */
  textStyle(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex?: number): ActionDescriptorPath {
    if (textIndex === undefined) textIndex = 0;
    
    return ActionDescriptorPath.create()
      .object('textKey')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type)
      .defaultTo(this.getDefaultForType(type));
  }

  /**
   * Extract filter properties
   */
  filter(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex?: number): ActionDescriptorPath {
    if (filterIndex === undefined) filterIndex = 0;
    
    return ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .value(property, type)
      .defaultTo(this.getDefaultForType(type));
  }

  /**
   * Find layer by name pattern
   */
  findLayer(namePattern: string | RegExp) {
    return {
      extract: function(): string | null {
        var layerNames = ActionDescriptorNavigator.extractAllLayerNames();
        
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
  }

  /**
   * Find filter by property and predicate
   */
  findFilter(property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
    var self = this;
    return {
      extract: function<T>(desc: ActionDescriptor): T | null {
        var basePath = ActionDescriptorPath.create()
          .object('smartObjectMore')
          .list('filterFXList');
        
        if (predicate) {
          return basePath.findInList<T>(desc, property, type, predicate);
        } else {
          return basePath.findInList<T>(desc, property, type, function(value) {
            var defaultVal = self.getDefaultForType(type);
            return value !== defaultVal && value !== null && value !== undefined;
          });
        }
      }
    };
  }

  /**
   * Get consistent default value for type
   * ADDED: Centralized default value logic for consistency
   */
  private getDefaultForType(type: string): any {
    switch (type) {
      case 'string':
      case 'enumerated':
        return "";
      case 'integer':
      case 'double':
        return -1;
      case 'boolean':
        return false;
      default:
        return null;
    }
  }
}

/**
 * FIXED: Namespaced factory instance instead of global variable
 */
namespace PathFactories {
  export var P = new PathFactory();
}

// For backward compatibility, expose P globally if needed
var P = PathFactories.P;