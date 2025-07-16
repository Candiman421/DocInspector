/**
 * FIXED List extraction utilities for getting values from ActionList objects
 * Returns arrays of actual values for assignment to answer objects
 * CORRECTIONS: Standardized sentinel values, improved error handling, consistent patterns
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

// Import required types (will be available when files are used together)
declare class ActionDescriptorPath {
  extract(desc: ActionDescriptor): any;
}

declare class ActionDescriptorNavigator {
  static getSentinelValue<T>(type: string): T;
}

interface ListExtractionOptions extends ComparisonOptions {
  skipErrors?: boolean;
  includeIndices?: boolean;
}

interface IndexedValue<T = any> {
  index: number;
  value: T;
}

interface ValueTransformer {
  (value: any): any;
}

interface ComparisonOptions {
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

class ListValueExtractor {
  private basePath: ActionDescriptorPath;
  private subPath: string;
  private valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  private options: ListExtractionOptions;

  constructor(
    basePath: ActionDescriptorPath,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options: ListExtractionOptions = {}
  ) {
    this.basePath = basePath;
    this.subPath = subPath;
    this.valueType = valueType;
    this.options = options || {};
  }

  /**
   * FIXED: Get sentinel value based on type for testing scenarios
   */
  private getSentinelValue<T>(type: string): T {
    return ActionDescriptorNavigator.getSentinelValue<T>(type);
  }

  /**
   * Extract all values from the list - returns array of actual values
   * FIXED: Consistent sentinel value usage
   */
  extractAll<T = any>(rootDesc: ActionDescriptor): T[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: T[] = [];
    var sentinelValue = this.options.defaultValue !== undefined ? 
      this.options.defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    for (var i = 0; i < list.count; i++) {
      try {
        var value = this.extractSingleValue(list, i);
        results.push(value);
      } catch (error) {
        if (this.options.skipErrors) {
          results.push(sentinelValue);
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results;
  }

  /**
   * FIXED: Extract fixed number of values as tuple with consistent sentinel values
   */
  extractAsTuple<T = any>(
    rootDesc: ActionDescriptor,
    count: number,
    fillValue?: T
  ): T[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: T[] = [];
    var sentinelValue = fillValue !== undefined ? 
      fillValue : 
      (this.options.defaultValue !== undefined ? 
        this.options.defaultValue : 
        this.getSentinelValue<T>(this.valueType));

    for (var i = 0; i < count; i++) {
      try {
        if (i < list.count) {
          var value = this.extractSingleValue(list, i);
          results.push(value);
        } else {
          results.push(sentinelValue);
        }
      } catch (error) {
        if (this.options.skipErrors || fillValue !== undefined) {
          results.push(sentinelValue);
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results;
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   * FIXED: Consistent sentinel value usage
   */
  extractExactly<T = any>(rootDesc: ActionDescriptor, count: number, defaultValue?: T): T[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: T[] = [];
    var sentinelValue = defaultValue !== undefined ? 
      defaultValue : 
      (this.options.defaultValue !== undefined ? 
        this.options.defaultValue : 
        this.getSentinelValue<T>(this.valueType));

    for (var i = 0; i < count; i++) {
      try {
        if (i < list.count) {
          var value = this.extractSingleValue(list, i);
          results.push(value);
        } else {
          results.push(sentinelValue);
        }
      } catch (error) {
        if (this.options.skipErrors) {
          results.push(sentinelValue);
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results;
  }

  /**
   * Extract values with their indices
   * FIXED: Consistent error handling
   */
  extractAllWithIndices<T = any>(rootDesc: ActionDescriptor): IndexedValue<T>[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: IndexedValue<T>[] = [];
    var sentinelValue = this.options.defaultValue !== undefined ? 
      this.options.defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    for (var i = 0; i < list.count; i++) {
      try {
        var value = this.extractSingleValue(list, i);
        results.push({ index: i, value: value });
      } catch (error) {
        if (this.options.skipErrors) {
          results.push({ index: i, value: sentinelValue });
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results;
  }

  /**
   * Extract values that match a condition
   */
  extractWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): T[] {
    var allValues = this.extractAllWithIndices<T>(rootDesc);
    var results: T[] = [];
    for (var i = 0; i < allValues.length; i++) {
      var item = allValues[i];
      if (predicate(item.value, item.index)) {
        results.push(item.value);
      }
    }
    return results;
  }

  /**
   * Extract first value that matches condition
   * FIXED: Better error handling with sentinel values
   */
  extractFirst<T = any>(
    rootDesc: ActionDescriptor,
    predicate?: (value: T, index: number) => boolean
  ): T | null {
    var list = this.basePath.extract(rootDesc) as ActionList;

    for (var i = 0; i < list.count; i++) {
      try {
        var value = this.extractSingleValue(list, i);
        if (!predicate || predicate(value, i)) {
          return value;
        }
      } catch (error) {
        if (!this.options.skipErrors) {
          throw error;
        }
      }
    }

    return null;
  }

  /**
   * Extract value at specific index
   * FIXED: Better bounds checking and error handling
   */
  extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    var list = this.basePath.extract(rootDesc) as ActionList;

    if (index >= list.count || index < 0) {
      if (this.options.defaultValue !== undefined) {
        return this.options.defaultValue;
      }
      return this.getSentinelValue<T>(this.valueType);
    }

    try {
      return this.extractSingleValue(list, index);
    } catch (error) {
      if (this.options.defaultValue !== undefined) {
        return this.options.defaultValue;
      }
      return this.getSentinelValue<T>(this.valueType);
    }
  }

  /**
   * Extract last value
   * FIXED: Better error handling
   */
  extractLast<T = any>(rootDesc: ActionDescriptor): T | null {
    var list = this.basePath.extract(rootDesc) as ActionList;

    if (list.count === 0) {
      return null;
    }

    try {
      return this.extractSingleValue(list, list.count - 1);
    } catch (error) {
      return null;
    }
  }

  /**
   * Count items that match condition
   */
  countWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): number {
    var allValues = this.extractAllWithIndices<T>(rootDesc);
    var count = 0;
    for (var i = 0; i < allValues.length; i++) {
      var item = allValues[i];
      if (predicate(item.value, item.index)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Extract all items as object with numbered keys for destructuring
   */
  extractAllAsObject<T = any>(rootDesc: ActionDescriptor, keyPrefix: string = 'item'): Record<string, T> {
    var allValues = this.extractAll<T>(rootDesc);
    var result: Record<string, T> = {};

    for (var i = 0; i < allValues.length; i++) {
      result[keyPrefix + (i + 1)] = allValues[i];
    }

    return result;
  }

  /**
   * Extract all items ensuring minimum count, pad if needed
   * FIXED: Consistent sentinel value usage
   */
  extractAllWithMinimum<T = any>(rootDesc: ActionDescriptor, minCount: number, defaultValue?: T): T[] {
    var allValues = this.extractAll<T>(rootDesc);
    var sentinelValue = defaultValue !== undefined ? 
      defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    if (allValues.length < minCount) {
      while (allValues.length < minCount) {
        allValues.push(sentinelValue);
      }
    }

    return allValues;
  }

  /**
   * Extract all items up to maximum count
   */
  extractAllUpTo<T = any>(rootDesc: ActionDescriptor, maxCount: number): T[] {
    var allValues = this.extractAll<T>(rootDesc);
    return allValues.slice(0, maxCount);
  }

  /**
   * FIXED: Extract all items as dynamic tuple with consistent sentinel values
   */
  extractAllAsDynamicTuple<T = any>(rootDesc: ActionDescriptor, maxCount: number = 10, defaultValue?: T): T[] {
    var allValues = this.extractAll<T>(rootDesc);

    if (allValues.length === 0) {
      var sentinelValue = defaultValue !== undefined ? 
        defaultValue : 
        this.getSentinelValue<T>(this.valueType);
      return [sentinelValue]; // Return array with one sentinel value instead of throwing
    }

    // Return actual values found, up to maxCount
    var result = allValues.slice(0, maxCount);

    // If requested, pad to maxCount
    if (defaultValue !== undefined) {
      while (result.length < maxCount) {
        result.push(defaultValue);
      }
    }

    return result;
  }

  /**
   * Extract all items with metadata - FIXED: Consistent typing and error handling
   */
  extractAllWithMetadata<T = any>(rootDesc: ActionDescriptor): {
    values: T[];
    count: number;
    indices: number[];
    isEmpty: boolean;
    hasMinimum: (min: number) => boolean;
  } {
    var values = this.extractAll<T>(rootDesc);
    var indices: number[] = [];
    for (var i = 0; i < values.length; i++) {
      indices.push(i);
    }

    return {
      values: values,
      count: values.length,
      indices: indices,
      isEmpty: values.length === 0,
      hasMinimum: function (min: number) { return values.length >= min; }
    };
  }

  /**
   * Extract all items and return as object with dynamic properties
   */
  extractAllAsNamedObject<T = any>(rootDesc: ActionDescriptor, namePattern: string = 'item{n}'): Record<string, T> {
    var allValues = this.extractAll<T>(rootDesc);
    var result: Record<string, T> = {};

    for (var i = 0; i < allValues.length; i++) {
      var key = namePattern.replace('{n}', (i + 1).toString());
      result[key] = allValues[i];
    }

    return result;
  }

  // === TRANSFORMATION METHODS ===

  /**
   * Apply transformation to extracted values
   */
  transform(transformer: ValueTransformer): ListValueExtractor {
    var newOptions: ListExtractionOptions = {
      skipErrors: this.options.skipErrors,
      includeIndices: this.options.includeIndices,
      tolerance: this.options.tolerance,
      defaultValue: this.options.defaultValue
    };

    if (this.options.transformer) {
      var existingTransformer = this.options.transformer;
      newOptions.transformer = function (value: any) { return transformer(existingTransformer(value)); };
    } else {
      newOptions.transformer = transformer;
    }

    return new ListValueExtractor(this.basePath, this.subPath, this.valueType, newOptions);
  }

  /**
   * Floor numeric values
   */
  floor(): ListValueExtractor {
    return this.transform(Math.floor);
  }

  /**
   * Round numeric values - FIXED: Proper type handling
   */
  round(decimals: number = 0): ListValueExtractor {
    var factor = Math.pow(10, decimals);
    return this.transform(function (val: any) { 
      return Math.round((val as number) * factor) / factor; 
    });
  }

  /**
   * Convert to percentage
   */
  toPercentage(): ListValueExtractor {
    return this.transform(function (val) { return val * 100; });
  }

  /**
   * Skip errors and continue processing
   * FIXED: Consistent sentinel value usage
   */
  skipErrors(defaultValue?: any): ListValueExtractor {
    var sentinelValue = defaultValue !== undefined ? 
      defaultValue : 
      this.getSentinelValue(this.valueType);

    var newOptions: ListExtractionOptions = {
      skipErrors: true,
      includeIndices: this.options.includeIndices,
      tolerance: this.options.tolerance,
      transformer: this.options.transformer,
      defaultValue: sentinelValue
    };

    return new ListValueExtractor(this.basePath, this.subPath, this.valueType, newOptions);
  }

  // === SEARCH METHODS FOR SAFER ACCESS ===

  /**
   * NEW: Find items by property value instead of using indices
   */
  findWhere<T = any>(
    rootDesc: ActionDescriptor,
    searchProperty: string,
    searchValueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    searchValue: any
  ): T[] {
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      var results: T[] = [];
      
      for (var i = 0; i < list.count; i++) {
        try {
          if (list.getType(i) === DescValueType.OBJECTTYPE) {
            var itemDesc = list.getObjectValue(i);
            var propValue = this.extractValueFromDescriptor(itemDesc, searchProperty, searchValueType);
            
            if (propValue === searchValue) {
              var targetValue = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);
              results.push(targetValue);
            }
          }
        } catch (error) {
          // Continue searching
        }
      }
      
      return results;
    } catch (error) {
      return [];
    }
  }

  /**
   * NEW: Safe access by validating list structure first
   */
  safeExtractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      // Validate list structure
      if (index < 0 || index >= list.count) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      if (list.getType(index) !== DescValueType.OBJECTTYPE) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      return this.extractSingleValue(list, index);
    } catch (error) {
      return this.getSentinelValue<T>(this.valueType);
    }
  }

  // === PRIVATE METHODS ===

  private extractSingleValue(list: ActionList, index: number): any {
    if (list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    var itemDesc = list.getObjectValue(index);
    var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);

    if (this.options.transformer) {
      value = this.options.transformer(value);
    }

    return value;
  }

  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    // Navigate through sub-path if specified
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        if (!current.hasKey(typeID)) {
          return this.getSentinelValue(valueType);
        }

        // Check if this is the last part
        if (part === pathParts[pathParts.length - 1]) {
          // Extract the final value
          switch (valueType) {
            case 'string': return current.getString(typeID);
            case 'integer': return current.getInteger(typeID);
            case 'double': return current.getDouble(typeID);
            case 'boolean': return current.getBoolean(typeID);
            case 'enumerated': return current.getEnumerationValue(typeID);
            default: return this.getSentinelValue(valueType);
          }
        } else {
          // Navigate to nested object
          current = current.getObjectValue(typeID);
        }
      }

      return this.getSentinelValue(valueType);
    } catch (error) {
      return this.getSentinelValue(valueType);
    }
  }
}