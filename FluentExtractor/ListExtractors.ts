/**
 * List extraction utilities for getting values from ActionList objects
 * Returns arrays of actual values for assignment to answer objects
 */

interface ListExtractionOptions extends ComparisonOptions {
  skipErrors?: boolean;
  includeIndices?: boolean;
}

interface IndexedValue<T = any> {
  index: number;
  value: T;
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
   * Extract all values from the list - returns array of actual values
   */
  extractAll<T = any>(rootDesc: ActionDescriptor): T[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: T[] = [];

    for (var i = 0; i < list.count; i++) {
      try {
        var value = this.extractSingleValue(list, i);
        results.push(value);
      } catch (error) {
        if (this.options.skipErrors) {
          if (this.options.defaultValue !== undefined) {
            results.push(this.options.defaultValue);
          }
          // Skip this item if skipErrors is true and no default
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results;
  }

  /**
   * Extract fixed number of values as tuple for destructuring
   */
  extractAsTuple<T extends readonly any[]>(
    rootDesc: ActionDescriptor,
    count: number,
    fillValue?: any
  ): T {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: any[] = [];

    for (var i = 0; i < count; i++) {
      try {
        if (i < list.count) {
          var value = this.extractSingleValue(list, i);
          results.push(value);
        } else {
          // List is shorter than expected count
          if (fillValue !== undefined) {
            results.push(fillValue);
          } else if (this.options.defaultValue !== undefined) {
            results.push(this.options.defaultValue);
          } else {
            throw new Error("List only has " + list.count + " items, but " + count + " were requested");
          }
        }
      } catch (error) {
        if (this.options.skipErrors || fillValue !== undefined) {
          results.push(fillValue !== undefined ? fillValue : (this.options.defaultValue !== undefined ? this.options.defaultValue : null));
        } else {
          var err = error as Error;
          throw new Error("Failed to extract value at index " + i + ": " + err.message);
        }
      }
    }

    return results as unknown as T;
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   */
  extractExactly<T = any>(rootDesc: ActionDescriptor, count: number, defaultValue?: T): T[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: T[] = [];

    for (var i = 0; i < count; i++) {
      try {
        if (i < list.count) {
          var value = this.extractSingleValue(list, i);
          results.push(value);
        } else {
          // Pad with default
          if (defaultValue !== undefined) {
            results.push(defaultValue);
          } else if (this.options.defaultValue !== undefined) {
            results.push(this.options.defaultValue);
          } else {
            throw new Error("List only has " + list.count + " items, but " + count + " were requested");
          }
        }
      } catch (error) {
        if (this.options.skipErrors) {
          var fallback = defaultValue !== undefined ? defaultValue : (this.options.defaultValue !== undefined ? this.options.defaultValue : null);
          results.push(fallback);
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
   */
  extractAllWithIndices<T = any>(rootDesc: ActionDescriptor): IndexedValue<T>[] {
    var list = this.basePath.extract(rootDesc) as ActionList;
    var results: IndexedValue<T>[] = [];

    for (var i = 0; i < list.count; i++) {
      try {
        var value = this.extractSingleValue(list, i);
        results.push({ index: i, value: value });
      } catch (error) {
        if (this.options.skipErrors) {
          if (this.options.defaultValue !== undefined) {
            results.push({ index: i, value: this.options.defaultValue });
          }
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
   */
  extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    var list = this.basePath.extract(rootDesc) as ActionList;

    if (index >= list.count) {
      throw new Error("Index " + index + " out of bounds (count: " + list.count + ")");
    }

    return this.extractSingleValue(list, index);
  }

  /**
   * Extract last value
   */
  extractLast<T = any>(rootDesc: ActionDescriptor): T | null {
    var list = this.basePath.extract(rootDesc) as ActionList;

    if (list.count === 0) {
      return null;
    }

    return this.extractSingleValue(list, list.count - 1);
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
   */
  extractAllWithMinimum<T = any>(rootDesc: ActionDescriptor, minCount: number, defaultValue?: T): T[] {
    var allValues = this.extractAll<T>(rootDesc);

    if (allValues.length < minCount) {
      if (defaultValue === undefined && !this.options.defaultValue) {
        throw new Error("Found " + allValues.length + " items, but minimum " + minCount + " required");
      }

      var fillValue = defaultValue !== undefined ? defaultValue : this.options.defaultValue;
      while (allValues.length < minCount) {
        allValues.push(fillValue);
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
   * Extract all items as dynamic tuple (up to specified max)
   */
  extractAllAsDynamicTuple<T = any>(rootDesc: ActionDescriptor, maxCount: number = 10, defaultValue?: T): T[] {
    var allValues = this.extractAll<T>(rootDesc);

    if (allValues.length === 0) {
      throw new Error('No items found in list');
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
   * Extract all items with metadata (count, indices)
   */
  extractAllWithMetadata<T = any>(rootDesc: ActionDescriptor): {
    values: T[];
    count: number;
    indices: number[];
    isEmpty: boolean;
    hasMinimum: (min: number) => boolean;
  } {
    var values = this.extractAll<T>(rootDesc);
    var indices = [];
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
   * Round numeric values
   */
  round(decimals: number = 0): ListValueExtractor {
    var factor = Math.pow(10, decimals);
    return this.transform(function (val) { return Math.round(val * factor) / factor; });
  }

  /**
   * Convert to percentage
   */
  toPercentage(): ListValueExtractor {
    return this.transform(function (val) { return val * 100; });
  }

  /**
   * Skip errors and continue processing
   */
  skipErrors(defaultValue?: any): ListValueExtractor {
    var newOptions: ListExtractionOptions = {
      skipErrors: true,
      includeIndices: this.options.includeIndices,
      tolerance: this.options.tolerance,
      transformer: this.options.transformer,
      defaultValue: defaultValue
    };

    return new ListValueExtractor(this.basePath, this.subPath, this.valueType, newOptions);
  }

  // === PRIVATE METHODS ===

  private extractSingleValue(list: ActionList, index: number): any {
    if (list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    var itemDesc = list.getObjectValue(index);
    var value = this.extractValueFromDescriptor(itemDesc);

    if (this.options.transformer) {
      value = this.options.transformer(value);
    }

    return value;
  }

  private extractValueFromDescriptor(desc: ActionDescriptor): any {
    // Navigate through sub-path if specified
    var pathParts = this.subPath.split('.');
    var current = desc;

    for (var i = 0; i < pathParts.length; i++) {
      var part = pathParts[i];
      if (!part) continue;

      var typeID = stringIDToTypeID(part);
      if (!current.hasKey(typeID)) {
        throw new Error("Property '" + part + "' not found");
      }

      // Check if this is the last part
      if (part === pathParts[pathParts.length - 1]) {
        // Extract the final value
        switch (this.valueType) {
          case 'string': return current.getString(typeID);
          case 'integer': return current.getInteger(typeID);
          case 'double': return current.getDouble(typeID);
          case 'boolean': return current.getBoolean(typeID);
          case 'enumerated': return current.getEnumerationValue(typeID);
          default: throw new Error("Unsupported value type: " + this.valueType);
        }
      } else {
        // Navigate to nested object
        current = current.getObjectValue(typeID);
      }
    }

    throw new Error('Invalid sub-path');
  }
}