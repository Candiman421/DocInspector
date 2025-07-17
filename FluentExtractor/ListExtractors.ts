/**
 * Simple list extraction utilities for test assessment
 * Provides basic list processing for ActionManager patterns
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

interface ValueTransformer {
  (value: any): any;
}

/**
 * Simple list value extractor for test assessment needs
 * Focuses on core operations: get all, get at index, find first
 */
class ListValueExtractor {
  private basePath: any;
  private subPath: string;
  private valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  private _disposed: boolean = false;

  /**
   * Create a simple list value extractor
   * @param basePath ActionDescriptorPath pointing to the list
   * @param subPath Property path within each list item (e.g., "brightness" or "textStyle.fontName")
   * @param valueType Expected type of values to extract
   */
  constructor(
    basePath: any,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'
  ) {
    this.basePath = basePath;
    this.subPath = subPath;
    this.valueType = valueType;
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
   * Extract all values from the list
   * @param rootDesc Root ActionDescriptor containing the list
   * @returns Array of extracted values
   */
  extractAll<T = any>(rootDesc: ActionDescriptor): T[] {
    this.checkDisposed();
    var results: T[] = [];

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return results;
      }

      for (var i = 0; i < list.count; i++) {
        try {
          var itemDesc = list.getObjectValue(i);
          var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);
          results.push(value as T);
        } catch (error) {
          // For test assessment, skip errors and continue
          results.push(this.getSentinelValue<T>(this.valueType));
        }
      }

      return results;
    } catch (error) {
      return results;
    }
  }

  /**
   * Extract value at specific index
   * @param rootDesc Root ActionDescriptor containing the list
   * @param index Zero-based index
   * @returns Value at index or null if out of bounds
   */
  extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T | null {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      if (!list || typeof list.count !== 'number' || index < 0 || index >= list.count) {
        return null;
      }

      var itemDesc = list.getObjectValue(index);
      var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);
      return value as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find first value that matches condition
   * @param rootDesc Root ActionDescriptor containing the list
   * @param predicate Function to test each value
   * @returns First matching value or null
   */
  findFirst<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): T | null {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return null;
      }

      for (var i = 0; i < list.count; i++) {
        try {
          var itemDesc = list.getObjectValue(i);
          var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType) as T;
          if (predicate(value, i)) {
            return value;
          }
        } catch (error) {
          // Continue searching on errors
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   * Useful for test assessment when you expect specific counts
   * @param rootDesc Root ActionDescriptor containing the list
   * @param count Exact number of values to return
   * @returns Array of exactly 'count' values
   */
  extractExactly<T = any>(rootDesc: ActionDescriptor, count: number): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var sentinelValue = this.getSentinelValue<T>(this.valueType);

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      for (var i = 0; i < count; i++) {
        if (list && i < list.count) {
          try {
            var itemDesc = list.getObjectValue(i);
            var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);
            results.push(value as T);
          } catch (error) {
            results.push(sentinelValue);
          }
        } else {
          results.push(sentinelValue);
        }
      }

      return results;
    } catch (error) {
      // Fill with sentinel values on error
      for (var i = 0; i < count; i++) {
        results.push(sentinelValue);
      }
      return results;
    }
  }

  /**
   * Apply transformation to extracted values
   * @param transformer Function to transform each value
   * @returns New extractor with transformation applied
   */
  transform(transformer: ValueTransformer): ListValueExtractor {
    this.checkDisposed();
    
    // Create a new extractor that applies transformation
    var newExtractor = new ListValueExtractor(this.basePath, this.subPath, this.valueType);
    newExtractor._transformer = transformer;
    return newExtractor;
  }

  // Private transformer storage
  private _transformer?: ValueTransformer;

  /**
   * Round numeric values to specified decimal places
   * @param decimals Number of decimal places (default: 0)
   * @returns New extractor with rounding applied
   */
  round(decimals: number = 0): ListValueExtractor {
    var factor = Math.pow(10, decimals);
    return this.transform(function(value: any) {
      return typeof value === 'number' ? Math.round(value * factor) / factor : value;
    });
  }

  /**
   * Extract value from ActionDescriptor using sub-path
   * Handles nested properties like "textStyle.fontName"
   */
  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      // Navigate through nested objects
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
          // Final value extraction
          if (!current.hasKey(typeID)) {
            return this.getSentinelValue(valueType);
          }

          // Apply transformation if present
          var value = this.extractFinalValue(current, typeID, valueType);
          if (this._transformer) {
            try {
              value = this._transformer(value);
            } catch (transformError) {
              // Return original value if transformation fails
            }
          }
          return value;
        } else {
          // Navigate deeper into nested object
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

  /**
   * Extract final value using proper ActionManager methods
   */
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

  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ListValueExtractor has been disposed");
    }
  }

  dispose(): void {
    this._disposed = true;
  }
}