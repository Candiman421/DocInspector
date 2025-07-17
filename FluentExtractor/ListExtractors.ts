/**
 * Advanced list extraction utilities for ActionList objects
 * Provides sophisticated list processing with error tolerance and transformations
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

// ExtendScript globals
declare var app: {
  activeDocument?: any;
  version?: string;
};

// DescValueType is declared in ExtendScript.d.ts

// Enhanced ActionDescriptor interface
interface ActionDescriptor {
  hasKey(key: number): boolean;
  getString(key: number): string;
  getInteger(key: number): number;
  getDouble(key: number): number;
  getBoolean(key: number): boolean;
  getEnumerationValue(key: number): number;
  getObjectValue(key: number): ActionDescriptor;
  getList(key: number): ActionList;
  getType(key: number): number; // FIXED: Made non-optional with version detection
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
  getType(index: number): number; // FIXED: Made non-optional with version detection
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

interface ListExtractionOptions {
  skipErrors?: boolean;
  includeIndices?: boolean;
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

interface IndexedValue<T = any> {
  index: number;
  value: T;
}

interface ValueTransformer {
  (value: any): any;
}

interface ExtractionMetadata<T = any> {
  values: T[];
  count: number;
  indices: number[];
  isEmpty: boolean;
  hasMinimum: (min: number) => boolean;
}

/**
 * FIXED: Singleton transformer instances for memory efficiency
 */
var TransformerSingletons = {
  floor: {
    transform: function(value: any): any {
      return Math.floor(value);
    }
  },
  
  round: function(decimals: number) {
    var factor = Math.pow(10, decimals || 0);
    return {
      transform: function(value: any): any {
        return Math.round(value * factor) / factor;
      }
    };
  },
  
  percentage: {
    transform: function(value: any): any {
      return value * 100;
    }
  }
};

/**
 * FIXED: Version compatibility detection
 */
var ListExtractorVersion = {
  _detected: false,
  _hasGetType: true,
  
  detect: function() {
    if (this._detected) return;
    
    try {
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      if (typeof testDesc.getType !== 'function') {
        this._hasGetType = false;
      }
    } catch (error) {
      this._hasGetType = false;
    }
    
    this._detected = true;
  },
  
  hasGetType: function() {
    this.detect();
    return this._hasGetType;
  }
};

/**
 * Advanced list value extractor with sophisticated processing capabilities
 * Provides error-tolerant extraction, transformations, and search functionality
 */
class ListValueExtractor {
  private basePath: any;
  private subPath: string;
  private valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  private options: ListExtractionOptions;
  private _disposed: boolean = false;

  /**
   * Create a new list value extractor
   * @param basePath Path accessor to the list
   * @param subPath Property path within each list item
   * @param valueType Expected type of values to extract
   * @param options Configuration options for extraction behavior
   */
  constructor(
    basePath: any,
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
   * Extract all values from the list with race condition protection
   * @param rootDesc Root ActionDescriptor containing the list
   * @returns Array of extracted values
   */
  extractAll<T = any>(rootDesc: ActionDescriptor): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var sentinelValue = this.options.defaultValue !== undefined ? 
      this.options.defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return [];
      }

      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          if (i >= list.count) {
            break;
          }
          
          // FIXED: Use getType with version compatibility
          var hasGetType = ListExtractorVersion.hasGetType();
          if (hasGetType && list.getType && list.getType(i) !== DescValueType.OBJECTTYPE) {
            if (this.options.skipErrors) {
              results.push(sentinelValue);
              continue;
            } else {
              throw new Error("Item at index " + i + " is not an object");
            }
          }

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
    } catch (error) {
      if (this.options.skipErrors) {
        return [];
      }
      var err = error as Error;
      throw new Error("List extraction failed: " + err.message);
    }
  }

  /**
   * Extract fixed number of values as tuple with bounds protection
   * @param rootDesc Root ActionDescriptor containing the list
   * @param count Number of values to extract
   * @param fillValue Value to use for missing items
   * @returns Array of exactly 'count' values
   */
  extractAsTuple<T = any>(
    rootDesc: ActionDescriptor,
    count: number,
    fillValue?: T
  ): T[] {
    this.checkDisposed();
    var results: T[] = [];
    var sentinelValue = fillValue !== undefined ? 
      fillValue : 
      (this.options.defaultValue !== undefined ? 
        this.options.defaultValue : 
        this.getSentinelValue<T>(this.valueType));

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        for (var i = 0; i < count; i++) {
          results.push(sentinelValue);
        }
        return results;
      }

      var currentCount = list.count;

      for (var i = 0; i < count; i++) {
        try {
          if (i < currentCount && i < list.count) {
            // FIXED: Add version compatibility check
            var hasGetType = ListExtractorVersion.hasGetType();
            if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
              var value = this.extractSingleValue(list, i);
              results.push(value);
            } else {
              results.push(sentinelValue);
            }
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
    } catch (error) {
      for (var i = 0; i < count; i++) {
        results.push(sentinelValue);
      }
      return results;
    }
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   * @param rootDesc Root ActionDescriptor containing the list
   * @param count Exact number of values to return
   * @param defaultValue Default value for padding
   * @returns Array of exactly 'count' values
   */
  extractExactly<T = any>(rootDesc: ActionDescriptor, count: number, defaultValue?: T): T[] {
    this.checkDisposed();
    return this.extractAsTuple<T>(rootDesc, count, defaultValue);
  }

  /**
   * Extract values with their indices and metadata
   * @param rootDesc Root ActionDescriptor containing the list
   * @returns Array of values with their original indices
   */
  extractAllWithIndices<T = any>(rootDesc: ActionDescriptor): IndexedValue<T>[] {
    this.checkDisposed();
    var results: IndexedValue<T>[] = [];
    var sentinelValue = this.options.defaultValue !== undefined ? 
      this.options.defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return [];
      }

      var currentCount = list.count;

      for (var i = 0; i < currentCount; i++) {
        try {
          if (i >= list.count) break;
          
          // FIXED: Add version compatibility check
          var hasGetType = ListExtractorVersion.hasGetType();
          if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
            var value = this.extractSingleValue(list, i);
            results.push({ index: i, value: value });
          } else {
            if (this.options.skipErrors) {
              results.push({ index: i, value: sentinelValue });
            }
          }
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
    } catch (error) {
      if (this.options.skipErrors) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Extract values that match a condition with proper error handling
   * @param rootDesc Root ActionDescriptor containing the list
   * @param predicate Function to test each value
   * @returns Array of values that match the predicate
   */
  extractWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): T[] {
    this.checkDisposed();
    var allValues = this.extractAllWithIndices<T>(rootDesc);
    var results: T[] = [];
    
    for (var i = 0; i < allValues.length; i++) {
      var item = allValues[i];
      try {
        if (predicate(item.value, item.index)) {
          results.push(item.value);
        }
      } catch (error) {
        if (!this.options.skipErrors) {
          throw error;
        }
      }
    }
    
    return results;
  }

  /**
   * Extract first value that matches condition with proper cleanup
   * @param rootDesc Root ActionDescriptor containing the list
   * @param predicate Optional function to test values (returns first if not provided)
   * @returns First matching value or null
   */
  extractFirst<T = any>(
    rootDesc: ActionDescriptor,
    predicate?: (value: T, index: number) => boolean
  ): T | null {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return null;
      }

      var currentCount = list.count;

      for (var i = 0; i < currentCount; i++) {
        try {
          if (i >= list.count) break;
          
          // FIXED: Add version compatibility check
          var hasGetType = ListExtractorVersion.hasGetType();
          if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
            var value = this.extractSingleValue(list, i);
            if (!predicate || predicate(value, i)) {
              return value;
            }
          }
        } catch (error) {
          if (!this.options.skipErrors) {
            throw error;
          }
        }
      }

      return null;
    } catch (error) {
      if (this.options.skipErrors) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Extract value at specific index with bounds checking
   * @param rootDesc Root ActionDescriptor containing the list
   * @param index Zero-based index
   * @returns Value at the specified index
   */
  extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      if (!list || typeof list.count !== 'number' || index >= list.count || index < 0) {
        if (this.options.defaultValue !== undefined) {
          return this.options.defaultValue;
        }
        return this.getSentinelValue<T>(this.valueType);
      }

      // FIXED: Add version compatibility check
      var hasGetType = ListExtractorVersion.hasGetType();
      if (hasGetType && list.getType && list.getType(index) !== DescValueType.OBJECTTYPE) {
        if (this.options.defaultValue !== undefined) {
          return this.options.defaultValue;
        }
        return this.getSentinelValue<T>(this.valueType);
      }

      return this.extractSingleValue(list, index);
    } catch (error) {
      if (this.options.defaultValue !== undefined) {
        return this.options.defaultValue;
      }
      return this.getSentinelValue<T>(this.valueType);
    }
  }

  /**
   * Extract last value with proper bounds checking
   * @param rootDesc Root ActionDescriptor containing the list
   * @returns Last value in the list or null
   */
  extractLast<T = any>(rootDesc: ActionDescriptor): T | null {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;

      if (!list || typeof list.count !== 'number' || list.count === 0) {
        return null;
      }

      var lastIndex = list.count - 1;
      
      // FIXED: Add version compatibility check
      var hasGetType = ListExtractorVersion.hasGetType();
      if (!hasGetType || !list.getType || list.getType(lastIndex) === DescValueType.OBJECTTYPE) {
        return this.extractSingleValue(list, lastIndex);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Count items that match condition with error tolerance
   * @param rootDesc Root ActionDescriptor containing the list
   * @param predicate Function to test each value
   * @returns Number of matching items
   */
  countWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): number {
    this.checkDisposed();
    var allValues = this.extractAllWithIndices<T>(rootDesc);
    var count = 0;
    
    for (var i = 0; i < allValues.length; i++) {
      var item = allValues[i];
      try {
        if (predicate(item.value, item.index)) {
          count++;
        }
      } catch (error) {
        if (!this.options.skipErrors) {
          throw error;
        }
      }
    }
    
    return count;
  }

  /**
   * Extract all items as object with numbered keys
   * @param rootDesc Root ActionDescriptor containing the list
   * @param keyPrefix Prefix for generated keys
   * @returns Object with numbered properties
   */
  extractAllAsObject<T = any>(rootDesc: ActionDescriptor, keyPrefix: string = 'item'): Record<string, T> {
    this.checkDisposed();
    var allValues = this.extractAll<T>(rootDesc);
    var result: Record<string, T> = {};

    for (var i = 0; i < allValues.length; i++) {
      result[keyPrefix + (i + 1)] = allValues[i];
    }

    return result;
  }

  /**
   * Extract all items ensuring minimum count, pad if needed
   * @param rootDesc Root ActionDescriptor containing the list
   * @param minCount Minimum number of items to return
   * @param defaultValue Default value for padding
   * @returns Array with at least minCount items
   */
  extractAllWithMinimum<T = any>(rootDesc: ActionDescriptor, minCount: number, defaultValue?: T): T[] {
    this.checkDisposed();
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
   * @param rootDesc Root ActionDescriptor containing the list
   * @param maxCount Maximum number of items to return
   * @returns Array with at most maxCount items
   */
  extractAllUpTo<T = any>(rootDesc: ActionDescriptor, maxCount: number): T[] {
    this.checkDisposed();
    var allValues = this.extractAll<T>(rootDesc);
    return allValues.slice(0, maxCount);
  }

  /**
   * Extract all items as dynamic tuple with padding
   * @param rootDesc Root ActionDescriptor containing the list
   * @param maxCount Maximum number of items
   * @param defaultValue Default value for padding
   * @returns Array with consistent length
   */
  extractAllAsDynamicTuple<T = any>(rootDesc: ActionDescriptor, maxCount: number = 10, defaultValue?: T): T[] {
    this.checkDisposed();
    var allValues = this.extractAll<T>(rootDesc);

    if (allValues.length === 0) {
      var sentinelValue = defaultValue !== undefined ? 
        defaultValue : 
        this.getSentinelValue<T>(this.valueType);
      return [sentinelValue];
    }

    var result = allValues.slice(0, maxCount);

    if (defaultValue !== undefined) {
      while (result.length < maxCount) {
        result.push(defaultValue);
      }
    }

    return result;
  }

  /**
   * Extract all items with metadata
   * @param rootDesc Root ActionDescriptor containing the list
   * @returns Extraction results with metadata
   */
  extractAllWithMetadata<T = any>(rootDesc: ActionDescriptor): ExtractionMetadata<T> {
    this.checkDisposed();
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
   * @param rootDesc Root ActionDescriptor containing the list
   * @param namePattern Pattern for property names (use {n} for index)
   * @returns Object with dynamically named properties
   */
  extractAllAsNamedObject<T = any>(rootDesc: ActionDescriptor, namePattern: string = 'item{n}'): Record<string, T> {
    this.checkDisposed();
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
   * Apply transformation to extracted values using singleton pattern
   * @param transformer Function to transform each value
   * @returns New extractor with transformation applied
   */
  transform(transformer: ValueTransformer): ListValueExtractor {
    this.checkDisposed();
    var newOptions: ListExtractionOptions = {
      skipErrors: this.options.skipErrors,
      includeIndices: this.options.includeIndices,
      tolerance: this.options.tolerance,
      defaultValue: this.options.defaultValue
    };

    if (this.options.transformer) {
      var existingTransformer = this.options.transformer;
      newOptions.transformer = this.createChainedTransformer(existingTransformer, transformer);
    } else {
      newOptions.transformer = transformer;
    }

    return new ListValueExtractor(this.basePath, this.subPath, this.valueType, newOptions);
  }

  /**
   * Helper to create chained transformer without memory leaks
   */
  private createChainedTransformer(first: ValueTransformer, second: ValueTransformer): ValueTransformer {
    return function(value: any) {
      try {
        var intermediate = first(value);
        return second(intermediate);
      } catch (error) {
        var err = error as Error;
        throw new Error("Chained transformation failed: " + err.message);
      }
    };
  }

  /**
   * FIXED: Floor numeric values using singleton transformer
   * @returns New extractor with floor transformation
   */
  floor(): ListValueExtractor {
    return this.transform(TransformerSingletons.floor.transform);
  }

  /**
   * FIXED: Round numeric values using singleton transformer
   * @param decimals Number of decimal places
   * @returns New extractor with round transformation
   */
  round(decimals: number = 0): ListValueExtractor {
    var transformer = TransformerSingletons.round(decimals);
    return this.transform(transformer.transform);
  }

  /**
   * FIXED: Convert to percentage using singleton transformer
   * @returns New extractor with percentage transformation
   */
  toPercentage(): ListValueExtractor {
    return this.transform(TransformerSingletons.percentage.transform);
  }

  /**
   * Skip errors and continue processing
   * @param defaultValue Default value for failed extractions
   * @returns New extractor with error skipping enabled
   */
  skipErrors(defaultValue?: any): ListValueExtractor {
    this.checkDisposed();
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

  // === SEARCH METHODS ===

  /**
   * Find items by property value with type validation
   * @param rootDesc Root ActionDescriptor containing the list
   * @param searchProperty Property to search within
   * @param searchValueType Type of the search property
   * @param searchValue Value to search for
   * @returns Array of matching values
   */
  findWhere<T = any>(
    rootDesc: ActionDescriptor,
    searchProperty: string,
    searchValueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    searchValue: any
  ): T[] {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return [];
      }
      
      var results: T[] = [];
      var currentCount = list.count;
      
      for (var i = 0; i < currentCount; i++) {
        try {
          if (i >= list.count) break;
          
          // FIXED: Add version compatibility check
          var hasGetType = ListExtractorVersion.hasGetType();
          if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
            var itemDesc = list.getObjectValue(i);
            var propValue = this.extractValueFromDescriptor(itemDesc, searchProperty, searchValueType);
            
            if (propValue === searchValue) {
              var targetValue = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);
              results.push(targetValue);
            }
          }
        } catch (error) {
          if (!this.options.skipErrors) {
            throw error;
          }
        }
      }
      
      return results;
    } catch (error) {
      if (this.options.skipErrors) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Safe access by validating list structure first
   * @param rootDesc Root ActionDescriptor containing the list
   * @param index Zero-based index
   * @returns Value at index or sentinel value
   */
  safeExtractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    this.checkDisposed();
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      if (!list || typeof list.count !== 'number' || 
          index < 0 || index >= list.count) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      // FIXED: Add version compatibility check
      var hasGetType = ListExtractorVersion.hasGetType();
      if (hasGetType && list.getType && list.getType(index) !== DescValueType.OBJECTTYPE) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      return this.extractSingleValue(list, index);
    } catch (error) {
      return this.getSentinelValue<T>(this.valueType);
    }
  }

  // === PRIVATE METHODS ===

  private extractSingleValue(list: ActionList, index: number): any {
    // FIXED: Add version compatibility check
    var hasGetType = ListExtractorVersion.hasGetType();
    if (hasGetType && list.getType && list.getType(index) !== DescValueType.OBJECTTYPE) {
      throw new Error("Item at index " + index + " is not an object");
    }

    var itemDesc = list.getObjectValue(index);
    var value = this.extractValueFromDescriptor(itemDesc, this.subPath, this.valueType);

    if (this.options.transformer) {
      try {
        value = this.options.transformer(value);
      } catch (transformError) {
        if (this.options.defaultValue !== undefined) {
          return this.options.defaultValue;
        }
        var err = transformError as Error;
        throw new Error("Transformation failed: " + err.message);
      }
    }

    return value;
  }

  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
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

        if (part === pathParts[pathParts.length - 1]) {
          // FIXED: Add version compatibility check for getType
          var hasGetType = ListExtractorVersion.hasGetType();
          if (hasGetType && current.getType) {
            var actualType = current.getType(typeID);
            var expectedType = this.getExpectedDescValueType(valueType);
            
            if (actualType !== expectedType) {
              return this.getSentinelValue(valueType);
            }
          }

          switch (valueType) {
            case 'string': return current.getString(typeID);
            case 'integer': return current.getInteger(typeID);
            case 'double': return current.getDouble(typeID);
            case 'boolean': return current.getBoolean(typeID);
            case 'enumerated': return current.getEnumerationValue(typeID);
            default: return this.getSentinelValue(valueType);
          }
        } else {
          // FIXED: Add version compatibility check for getType
          var hasGetType = ListExtractorVersion.hasGetType();
          if (hasGetType && current.getType && current.getType(typeID) !== DescValueType.OBJECTTYPE) {
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
   * Check if this extractor has been disposed
   */
  private checkDisposed(): void {
    if (this._disposed) {
      throw new Error("ListValueExtractor has been disposed");
    }
  }

  /**
   * Dispose of this extractor to prevent memory leaks
   */
  dispose(): void {
    this._disposed = true;
  }
}