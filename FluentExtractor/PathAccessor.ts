/**
 * Path-based accessor for extracting values from ActionDescriptors
 * Returns actual values for assignment, with fluent transformation methods
 */

interface PathSegment {
  key: string;
  type: 'object' | 'list' | 'value';
  valueType?: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  index?: number;
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
   * Get count of items in list (if path points to a list)
   */
  getCount(rootDesc: ActionDescriptor): number {
    try {
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

  // === LIST EXTRACTION METHODS ===

  /**
   * Extract all values from list items
   */
  extractAll<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options?: ListExtractionOptions
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, options || {});
  }

  /**
   * Extract fixed number of values as tuple for destructuring
   */
  extractAsTuple<T extends readonly any[]>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    fillValue?: any
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, {});
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   */
  extractExactly<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    count: number,
    defaultValue?: T
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, { defaultValue: defaultValue });
  }

  /**
   * Extract all items as object with numbered keys
   */
  extractAllAsObject<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    keyPrefix?: string
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, {});
  }

  /**
   * Extract all items ensuring minimum count, pad if needed
   */
  extractAllWithMinimum<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    minCount: number,
    defaultValue?: T
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, { defaultValue: defaultValue });
  }

  /**
   * Extract all items up to maximum count
   */
  extractAllUpTo<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    maxCount: number
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, {});
  }

  /**
   * Extract all items as dynamic tuple (up to specified max)
   */
  extractAllAsDynamicTuple<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    maxCount?: number,
    defaultValue?: T
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, { defaultValue: defaultValue });
  }

  /**
   * Extract all items with metadata (count, indices)
   */
  extractAllWithMetadata<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, {});
  }

  /**
   * Extract value at specific index
   */
  extractAt<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    index: number
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, {});
  }

  /**
   * Extract values matching condition
   */
  extractWhere<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate: (value: T, index: number) => boolean,
    options?: ListExtractionOptions
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, options || {});
  }

  /**
   * Extract first matching value
   */
  extractFirst<T = any>(
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    predicate?: (value: T, index: number) => boolean,
    options?: ListExtractionOptions
  ): ListValueExtractor {
    return new ListValueExtractor(this, subPath, valueType, options || {});
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

// === CONVENIENCE FACTORY FUNCTIONS ===

/**
 * Quick path creation for common patterns
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
   * Create bounds value extractor
   */
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor();
  },

  /**
   * Create text style extractor
   */
  textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('text')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type);
  },

  /**
   * Create filter effect extractor
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