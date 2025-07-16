/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Returns actual values for assignment, with fluent transformation methods
 * FIXED: Correct ActionManager patterns and removed circular dependencies
 */

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
   */
  defaultTo<T>(value: T): ActionDescriptorPath {
    this.defaultReturnValue = value;
    return this;
  }

  // === VALUE EXTRACTION METHODS ===

  /**
   * Extract the value from the ActionDescriptor - returns actual value for assignment
   */
  extract<T = any>(rootDesc: ActionDescriptor): T {
    try {
      var rawValue = this.resolvePath(rootDesc);
      return this.applyTransformations(rawValue) as T;
    } catch (error) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      var err = error as Error;
      throw new Error("Path extraction failed: " + err.message + " (path: " + this.getPathString() + ")");
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
   * FIXED: Get count for document layers (special case)
   */
  getLayerCount(): number {
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
  }

  /**
   * Get count of items in list (if path points to a list)
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
      throw new Error('Path does not resolve to a list');
    } catch (error) {
      var err = error as Error;
      throw new Error("Failed to get count: " + err.message + " (path: " + this.getPathString() + ")");
    }
  }

  // === FIXED LIST EXTRACTION METHODS ===

  /**
   * FIXED: Extract all layer names using correct ActionManager pattern
   */
  extractAllLayerNames(): string[] {
    var results: string[] = [];
    var layerCount = this.getLayerCount();
    
    for (var i = 1; i <= layerCount; i++) {
      try {
        var layerRef = new ActionReference();
        layerRef.putIndex(charIDToTypeID("Lyr "), i);
        var layerDesc = executeActionGet(layerRef);
        var name = layerDesc.getString(stringIDToTypeID("name"));
        results.push(name);
      } catch (error) {
        results.push("Layer " + i);
      }
    }
    return results;
  }

  /**
   * FIXED: Extract fixed number of layer names as tuple
   */
  extractLayerTuple(count: number, defaultValue?: string): string[] {
    var allNames = this.extractAllLayerNames();
    var results: string[] = [];
    
    for (var i = 0; i < count; i++) {
      if (i < allNames.length) {
        results.push(allNames[i]);
      } else {
        results.push(defaultValue || "Missing Layer");
      }
    }
    return results;
  }

  /**
   * FIXED: Extract values from textStyleRange using correct patterns
   */
  extractTextStyleValues<T>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    defaultValue?: T
  ): T[] {
    var results: T[] = [];
    
    try {
      // Navigate to textKey first
      var current = this.resolvePath({ hasKey: function() { return true; }, getObjectValue: function() { return arguments[0]; } } as any);
      var textKey = current.getObjectValue(stringIDToTypeID("textKey"));
      var textStyleRanges = textKey.getList(stringIDToTypeID("textStyleRange"));
      
      for (var i = 0; i < count; i++) {
        if (i < textStyleRanges.count) {
          try {
            var range = textStyleRanges.getObjectValue(i);
            var value = this.extractValueFromDescriptor(range, subPath, valueType);
            results.push(value);
          } catch (error) {
            results.push(defaultValue || null);
          }
        } else {
          results.push(defaultValue || null);
        }
      }
    } catch (error) {
      for (var i = 0; i < count; i++) {
        results.push(defaultValue || null);
      }
    }
    
    return results;
  }

  /**
   * FIXED: Extract all values from standard list with proper error handling
   */
  extractAllFromList<T>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    skipErrors?: boolean,
    defaultValue?: T
  ): T[] {
    var results: T[] = [];

    try {
      var list = this.resolvePath({} as ActionDescriptor) as ActionList;
      
      for (var i = 0; i < list.count; i++) {
        try {
          if (list.getType(i) !== DescValueType.OBJECTTYPE) {
            throw new Error("Item at index " + i + " is not an object");
          }

          var itemDesc = list.getObjectValue(i);
          var value = this.extractValueFromDescriptor(itemDesc, subPath, valueType);

          results.push(value);
        } catch (error) {
          if (skipErrors) {
            if (defaultValue !== undefined) {
              results.push(defaultValue);
            }
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
    switch (valueType) {
      case 'string': return desc.getString(typeID);
      case 'integer': return desc.getInteger(typeID);
      case 'double': return desc.getDouble(typeID);
      case 'boolean': return desc.getBoolean(typeID);
      case 'enumerated': return desc.getEnumerationValue(typeID);
      default: throw new Error("Unsupported value type: " + valueType);
    }
  }

  /**
   * FIXED: Extract value from sub-path within a descriptor
   */
  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    var pathParts = subPath.split('.');
    var current = desc;

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
    var parts = [];
    for (var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      parts.push(s.index !== undefined ? s.key + "[" + s.index + "]" : s.key);
    }
    return parts.join('.');
  }
}

// === FIXED CONVENIENCE FACTORY FUNCTIONS ===

/**
 * Quick path creation for common patterns - FIXED with correct ActionManager patterns
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
  val: function <T = any>(key: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
    return ActionDescriptorPath.create().value(key, type);
  },

  /**
   * FIXED: Create bounds value extractor (bounds is layer property)
   */
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor();
  },

  /**
   * FIXED: Create text style extractor using correct textKey navigation
   */
  textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('textKey')  // FIXED: Use 'textKey' not 'text'
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type);
  },

  /**
   * FIXED: Create filter effect extractor using proper filter navigation
   */
  filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .object('filter')
      .value(property, type);
  }
};