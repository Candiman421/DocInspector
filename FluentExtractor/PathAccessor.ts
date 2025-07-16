/**
 * FIXED Path-based accessor for extracting values from ActionDescriptors
 * Returns actual values for assignment, with fluent transformation methods
 * CORRECTIONS: Fixed extractTextStyleValues, standardized sentinel values, improved error handling
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;
declare function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogMode?: number): ActionDescriptor;

interface PathSegment {
  key: string;
  type: 'object' | 'list' | 'value';
  valueType?: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  index?: number;
}

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

class ActionDescriptorPath {
  private segments: PathSegment[] = [];
  private transformations: ValueTransformer[] = [];
  private toleranceValue?: number;
  private defaultReturnValue?: any;

  static create(): ActionDescriptorPath {
    return new ActionDescriptorPath();
  }

  /**
   * FIXED: Get sentinel value based on type for testing scenarios
   */
  private getSentinelValue<T>(type: string): T {
    return ActionDescriptorNavigator.getSentinelValue<T>(type);
  }

  /**
   * Navigate to object property
   */
  object(key: string): ActionDescriptorPath {
    this.segments.push({ key: key, type: 'object' });
    return this;
  }

  /**
   * Navigate to list property
   */
  list(key: string): ActionDescriptorPath {
    this.segments.push({ key: key, type: 'list' });
    return this;
  }

  /**
   * Access specific index in list
   */
  at(index: number): ActionDescriptorPath {
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
    this.segments.push({ key: key, type: 'value', valueType: valueType });
    return this;
  }

  // === TRANSFORMATION METHODS ===

  /**
   * Add custom transformation
   */
  transform(transformer: ValueTransformer): ActionDescriptorPath {
    this.transformations.push(transformer);
    return this;
  }

  /**
   * Floor the numeric value
   */
  floor(): ActionDescriptorPath {
    return this.transform(Math.floor);
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number = 0): ActionDescriptorPath {
    var factor = Math.pow(10, decimals);
    return this.transform(function (val) { return Math.round(val * factor) / factor; });
  }

  /**
   * Convert points to pixels
   */
  toPixels(fromUnit: string = 'pt', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { return self.convertToPixels(val, fromUnit, dpi); });
  }

  /**
   * Convert pixels to points
   */
  toPoints(fromUnit: string = 'px', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { return self.convertToPoints(val, fromUnit, dpi); });
  }

  /**
   * Convert percentage (0.75 -> 75)
   */
  toPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { return val * 100; });
  }

  /**
   * Convert from percentage (75 -> 0.75)
   */
  fromPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { return val / 100; });
  }

  /**
   * Set tolerance for numeric comparisons (used in validation contexts)
   */
  withTolerance(tolerance: number): ActionDescriptorPath {
    this.toleranceValue = tolerance;
    return this;
  }

  /**
   * Set default value if path resolution fails
   * FIXED: Sentinel values used if no explicit default provided
   */
  defaultTo<T>(value: T): ActionDescriptorPath {
    this.defaultReturnValue = value;
    return this;
  }

  // === VALUE EXTRACTION METHODS ===

  /**
   * Extract the value from the ActionDescriptor - returns actual value for assignment
   * FIXED: Better error handling and sentinel values
   */
  extract<T = any>(rootDesc: ActionDescriptor): T {
    try {
      var rawValue = this.resolvePath(rootDesc);
      return this.applyTransformations(rawValue) as T;
    } catch (error) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      
      // Determine appropriate sentinel based on the last segment type
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
      return this.extract<T>(rootDesc);
    } catch (error) {
      return fallback;
    }
  }

  /**
   * FIXED: Get count for document layers with proper error handling
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
   * Get count of items in list (if path points to a list)
   * FIXED: Better error handling
   */
  getCount(rootDesc: ActionDescriptor): number {
    try {
      // Special case for document layers
      if (this.segments.length === 1 && this.segments[0].key === 'layers') {
        return this.getLayerCount();
      }
      
      var resolved = this.resolvePath(rootDesc);
      if (resolved && typeof resolved.count === 'number') {
        return resolved.count;
      }
      return -1; // Sentinel for invalid count
    } catch (error) {
      return -1; // Sentinel for failed count
    }
  }

  // === FIXED LIST EXTRACTION METHODS ===

  /**
   * FIXED: Extract all layer names using correct ActionManager pattern with error handling
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
      return []; // Empty array for complete failure
    }
    
    return results;
  }

  /**
   * FIXED: Extract fixed number of layer names as tuple with proper error handling
   */
  extractLayerTuple(count: number, defaultValue?: string): string[] {
    var allNames = this.extractAllLayerNames();
    var results: string[] = [];
    var sentinel = defaultValue !== undefined ? defaultValue : ""; // Empty string default
    
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
   * COMPLETELY FIXED: Extract text style values from current layer with proper error handling
   */
  extractTextStyleValues<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    defaultValue?: T
  ): { extract: (desc: ActionDescriptor) => T[] } {
    var self = this;
    var sentinelValue = defaultValue !== undefined ? defaultValue : this.getSentinelValue<T>(valueType);
    
    return {
      extract: function(desc: ActionDescriptor): T[] {
        var results: T[] = [];
        
        try {
          var textKey = desc.getObjectValue(stringIDToTypeID("textKey"));
          var textStyleRanges = textKey.getList(stringIDToTypeID("textStyleRange"));
          
          for (var i = 0; i < count; i++) {
            if (i < textStyleRanges.count) {
              try {
                var range = textStyleRanges.getObjectValue(i);
                var value = self.extractValueFromDescriptor(range, subPath, valueType);
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
    };
  }

  /**
   * FIXED: Extract all values from standard list with proper error handling
   */
  extractAllFromList<T>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    skipErrors?: boolean,
    defaultValue?: T
  ): { extract: (desc: ActionDescriptor) => T[] } {
    var self = this;
    var sentinelValue = defaultValue !== undefined ? defaultValue : this.getSentinelValue<T>(valueType);

    return {
      extract: function(desc: ActionDescriptor): T[] {
        var results: T[] = [];

        try {
          var list = self.resolvePath(desc) as ActionList;
          
          for (var i = 0; i < list.count; i++) {
            try {
              if (list.getType(i) !== DescValueType.OBJECTTYPE) {
                if (skipErrors) {
                  results.push(sentinelValue);
                  continue;
                } else {
                  throw new Error("Item at index " + i + " is not an object");
                }
              }

              var itemDesc = list.getObjectValue(i);
              var value = self.extractValueFromDescriptor(itemDesc, subPath, valueType);
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
    };
  }

  // === SEARCH METHODS FOR SAFER ACCESS ===

  /**
   * NEW: Find value in list by predicate instead of using hard-coded indices
   */
  findInList<T>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T, index: number) => boolean
  ): { extract: (desc: ActionDescriptor) => T | null } {
    var self = this;
    
    return {
      extract: function(desc: ActionDescriptor): T | null {
        try {
          var list = self.resolvePath(desc) as ActionList;
          
          for (var i = 0; i < list.count; i++) {
            try {
              if (list.getType(i) === DescValueType.OBJECTTYPE) {
                var itemDesc = list.getObjectValue(i);
                var value = self.extractValueFromDescriptor(itemDesc, subPath, valueType) as T;
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
    };
  }

  /**
   * NEW: Safe index access with validation
   */
  safeAt(index: number): { validateWith: (desc: ActionDescriptor) => ActionDescriptorPath } {
    var self = this;
    
    return {
      validateWith: function(desc: ActionDescriptor): ActionDescriptorPath {
        try {
          var list = self.resolvePath(desc) as ActionList;
          if (index >= 0 && index < list.count && list.getType(index) === DescValueType.OBJECTTYPE) {
            return self.at(index);
          } else {
            throw new Error("Safe index validation failed");
          }
        } catch (error) {
          throw new Error("Cannot safely access index " + index);
        }
      }
    };
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
          current = current.getObjectValue(typeID);
          break;

        case 'list':
          var list = current.getList(typeID);
          if (segment.index !== undefined) {
            if (segment.index >= list.count) {
              throw new Error("List index " + segment.index + " out of bounds (count: " + list.count + ")");
            }
            if (list.getType(segment.index) !== DescValueType.OBJECTTYPE) {
              throw new Error("List item at index " + segment.index + " is not an object");
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
   * FIXED: Extract value from sub-path within a descriptor with better error handling
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
          current = current.getObjectValue(typeID);
        }
      }
      throw new Error('Invalid sub-path: ' + subPath);
    } catch (error) {
      return this.getSentinelValue(valueType);
    }
  }

  private applyTransformations(value: any): any {
    var result = value;
    for (var i = 0; i < this.transformations.length; i++) {
      result = this.transformations[i](result);
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
}

// === FIXED CONVENIENCE FACTORY FUNCTIONS ===

/**
 * Quick path creation for common patterns - FIXED with proper sentinel values
 */
var P = {
  /**
   * Create object path
   */
  obj: function (key: string) { return ActionDescriptorPath.create().object(key); },

  /**
   * Create list path
   */
  list: function (key: string) { return ActionDescriptorPath.create().list(key); },

  /**
   * Create value path
   */
  val: function (key: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
    return ActionDescriptorPath.create().value(key, type);
  },

  /**
   * FIXED: Create bounds value extractor with proper sentinel values
   */
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor()
      .defaultTo(-1); // -1 signals missing/invalid bounds
  },

  /**
   * FIXED: Create text style extractor with proper sentinel values
   */
  textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number = 0) {
    var path = ActionDescriptorPath.create()
      .object('textKey')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type);
    
    // Set appropriate sentinel default based on type
    switch (type) {
      case 'string':
      case 'enumerated':
        return path.defaultTo("");  // Empty string for missing text properties
      case 'integer':
      case 'double':
        return path.defaultTo(-1);  // -1 for missing numeric properties
      case 'boolean':
        return path.defaultTo(false); // false for missing boolean properties
      default:
        return path;
    }
  },

  /**
   * FIXED: Create filter effect extractor with proper sentinel values
   */
  filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex: number = 0) {
    var path = ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .object('filter')
      .value(property, type);
    
    // Set appropriate sentinel default based on type
    switch (type) {
      case 'string':
      case 'enumerated':
        return path.defaultTo("");  // Empty string for missing filter properties
      case 'integer':
      case 'double':
        return path.defaultTo(-1);  // -1 for missing numeric properties
      case 'boolean':
        return path.defaultTo(false); // false for missing boolean properties
      default:
        return path;
    }
  },

  /**
   * NEW: Safe filter access by searching instead of using hard-coded index
   */
  findFilter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', predicate?: (value: any) => boolean) {
    return {
      extract: function<T>(desc: ActionDescriptor): T {
        var path = ActionDescriptorPath.create()
          .object('smartObjectMore')
          .list('filterFXList');
        
        if (predicate) {
          return path.findInList<T>(desc, property, type, predicate) as T;
        } else {
          // Find first non-sentinel value
          return path.findInList<T>(desc, property, type, function(value) {
            return value !== -1 && value !== "" && value !== false;
          }) as T;
        }
      }
    };
  }
};