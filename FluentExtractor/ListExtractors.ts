/**
 * Advanced list extraction utilities for ActionList objects
 * Provides sophisticated list processing with error tolerance and transformations
 * FIXED: Improved consistency, better error handling, unified version management
 */

// === EXTENDSCRIPT GLOBAL DECLARATIONS ===
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

// ExtendScript globals
declare var app: {
  activeDocument?: any;
  version?: string;
};

// FIXED: Comprehensive DescValueType declaration consistent with other files
declare const DescValueType: {
  readonly OBJECTTYPE: 1;
  readonly LISTTYPE: 2;
  readonly REFERENCETYPE: 3;
  readonly CLASSTYPE: 4;
  readonly ENUMTYPE: 5;
  readonly STRINGTYPE: 6;
  readonly INTEGERTYPE: 7;
  readonly DOUBLETYPE: 8;
  readonly ALIASTYPE: 9;
  readonly BOOLEANTYPE: 10;
  readonly RAWTYPE: 11;
};

// FIXED: Consistent interface definitions (no duplicates)
interface ActionDescriptor {
  hasKey(key: number): boolean;
  getString(key: number): string;
  getInteger(key: number): number;
  getDouble(key: number): number;
  getBoolean(key: number): boolean;
  getEnumerationValue(key: number): number;
  getObjectValue(key: number): ActionDescriptor;
  getList(key: number): ActionList;
  getType?(key: number): number; // Optional for version compatibility
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
  getType?(index: number): number; // Optional for version compatibility
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

// ListExtractors-specific interfaces
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

// FIXED: Consolidated transformer instances for memory efficiency and consistency
var ListExtractorTransformers = (function() {
  var floorTransformer = {
    transform: function(value: any): any {
      return typeof value === 'number' ? Math.floor(value) : value;
    }
  };
  
  var percentageTransformer = {
    transform: function(value: any): any {
      return typeof value === 'number' ? value * 100 : value;
    }
  };
  
  function createRoundTransformer(decimals: number) {
    var factor = Math.pow(10, decimals || 0);
    return {
      transform: function(value: any): any {
        return typeof value === 'number' ? Math.round(value * factor) / factor : value;
      }
    };
  }
  
  return {
    floor: floorTransformer,
    percentage: percentageTransformer,
    round: createRoundTransformer
  };
})();

// FIXED: Unified version compatibility detection (consistent with other files)
var ListExtractorVersionManager = (function() {
  var detected = false;
  var hasGetType = true;
  
  function detect() {
    if (detected) return;
    
    try {
      var testRef = new ActionReference();
      testRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      var testDesc = executeActionGet(testRef);
      
      if (typeof testDesc.getType !== 'function') {
        hasGetType = false;
      }
    } catch (error) {
      hasGetType = false;
    }
    
    detected = true;
  }
  
  return {
    hasGetType: function() {
      detect();
      return hasGetType;
    },
    
    reset: function() {
      detected = false;
      hasGetType = true;
    }
  };
})();

/**
 * Advanced list value extractor with sophisticated processing capabilities
 * FIXED: Improved error tolerance, better memory management, unified patterns
 */
class ListValueExtractor {
  private basePath: any;
  private subPath: string;
  private valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';
  private options: ListExtractionOptions;
  private _disposed: boolean = false;

  /**
   * Create a new list value extractor
   */
  constructor(
    basePath: any,
    subPath: string,
    valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    options: ListExtractionOptions = {}
  ) {
    if (!basePath) {
      throw new Error("Base path cannot be null or undefined");
    }
    if (!subPath || typeof subPath !== 'string') {
      throw new Error("Sub path must be a non-empty string");
    }
    if (!valueType) {
      throw new Error("Value type must be specified");
    }
    
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
   * FIXED: Improved extractAll with race condition protection and better error handling
   */
  extractAll<T = any>(rootDesc: ActionDescriptor): T[] {
    this.checkDisposed();
    
    if (!rootDesc) {
      return [];
    }
    
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
          // Double-check count hasn't changed during iteration
          if (i >= list.count) {
            break;
          }
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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
   * FIXED: Improved extractAsTuple with better bounds protection
   */
  extractAsTuple<T = any>(
    rootDesc: ActionDescriptor,
    count: number,
    fillValue?: T
  ): T[] {
    this.checkDisposed();
    
    if (!rootDesc || typeof count !== 'number' || count < 0) {
      return [];
    }
    
    var results: T[] = [];
    var sentinelValue = fillValue !== undefined ? 
      fillValue : 
      (this.options.defaultValue !== undefined ? 
        this.options.defaultValue : 
        this.getSentinelValue<T>(this.valueType));

    // Initialize results array
    for (var i = 0; i < count; i++) {
      results.push(sentinelValue);
    }

    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return results;
      }

      var currentCount = list.count;
      var actualCount = Math.min(count, currentCount);

      for (var i = 0; i < actualCount; i++) {
        try {
          // Double-check bounds
          if (i < list.count) {
            var hasGetType = ListExtractorVersionManager.hasGetType();
            if (!hasGetType || !list.getType || list.getType(i) === DescValueType.OBJECTTYPE) {
              var value = this.extractSingleValue(list, i);
              results[i] = value;
            }
            // else: results[i] already initialized to sentinelValue
          }
        } catch (error) {
          if (!this.options.skipErrors && fillValue === undefined) {
            var err = error as Error;
            throw new Error("Failed to extract value at index " + i + ": " + err.message);
          }
          // else: results[i] already initialized to sentinelValue
        }
      }

      return results;
    } catch (error) {
      if (this.options.skipErrors || fillValue !== undefined) {
        return results;
      }
      throw error;
    }
  }

  /**
   * Extract exactly N values, padding with defaults if needed
   */
  extractExactly<T = any>(rootDesc: ActionDescriptor, count: number, defaultValue?: T): T[] {
    this.checkDisposed();
    return this.extractAsTuple<T>(rootDesc, count, defaultValue);
  }

  /**
   * FIXED: Improved extractAllWithIndices with better metadata handling
   */
  extractAllWithIndices<T = any>(rootDesc: ActionDescriptor): IndexedValue<T>[] {
    this.checkDisposed();
    
    if (!rootDesc) {
      return [];
    }
    
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
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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
   * FIXED: Improved extractWhere with better predicate handling
   */
  extractWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): T[] {
    this.checkDisposed();
    
    if (!rootDesc || !predicate || typeof predicate !== 'function') {
      return [];
    }
    
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
   * FIXED: Improved extractFirst with proper cleanup
   */
  extractFirst<T = any>(
    rootDesc: ActionDescriptor,
    predicate?: (value: T, index: number) => boolean
  ): T | null {
    this.checkDisposed();
    
    if (!rootDesc) {
      return null;
    }
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      if (!list || typeof list.count !== 'number') {
        return null;
      }

      var currentCount = list.count;

      for (var i = 0; i < currentCount; i++) {
        try {
          if (i >= list.count) break;
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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
   * FIXED: Improved extractAt with bounds checking
   */
  extractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    this.checkDisposed();
    
    if (!rootDesc || typeof index !== 'number' || index < 0) {
      return this.getSentinelValue<T>(this.valueType);
    }
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      if (!list || typeof list.count !== 'number' || index >= list.count) {
        if (this.options.defaultValue !== undefined) {
          return this.options.defaultValue;
        }
        return this.getSentinelValue<T>(this.valueType);
      }

      var hasGetType = ListExtractorVersionManager.hasGetType();
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
   * FIXED: Improved extractLast with proper bounds checking
   */
  extractLast<T = any>(rootDesc: ActionDescriptor): T | null {
    this.checkDisposed();
    
    if (!rootDesc) {
      return null;
    }
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;

      if (!list || typeof list.count !== 'number' || list.count === 0) {
        return null;
      }

      var lastIndex = list.count - 1;
      
      var hasGetType = ListExtractorVersionManager.hasGetType();
      if (!hasGetType || !list.getType || list.getType(lastIndex) === DescValueType.OBJECTTYPE) {
        return this.extractSingleValue(list, lastIndex);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * FIXED: Improved countWhere with error tolerance
   */
  countWhere<T = any>(
    rootDesc: ActionDescriptor,
    predicate: (value: T, index: number) => boolean
  ): number {
    this.checkDisposed();
    
    if (!rootDesc || !predicate || typeof predicate !== 'function') {
      return 0;
    }
    
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
   */
  extractAllAsObject<T = any>(rootDesc: ActionDescriptor, keyPrefix: string = 'item'): Record<string, T> {
    this.checkDisposed();
    
    if (!keyPrefix || typeof keyPrefix !== 'string') {
      keyPrefix = 'item';
    }
    
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
    this.checkDisposed();
    
    if (typeof minCount !== 'number' || minCount < 0) {
      return this.extractAll<T>(rootDesc);
    }
    
    var allValues = this.extractAll<T>(rootDesc);
    var sentinelValue = defaultValue !== undefined ? 
      defaultValue : 
      this.getSentinelValue<T>(this.valueType);

    while (allValues.length < minCount) {
      allValues.push(sentinelValue);
    }

    return allValues;
  }

  /**
   * Extract all items up to maximum count
   */
  extractAllUpTo<T = any>(rootDesc: ActionDescriptor, maxCount: number): T[] {
    this.checkDisposed();
    
    if (typeof maxCount !== 'number' || maxCount < 0) {
      return [];
    }
    
    var allValues = this.extractAll<T>(rootDesc);
    return allValues.slice(0, maxCount);
  }

  /**
   * FIXED: Improved extractAllAsDynamicTuple with better handling
   */
  extractAllAsDynamicTuple<T = any>(rootDesc: ActionDescriptor, maxCount: number = 10, defaultValue?: T): T[] {
    this.checkDisposed();
    
    if (typeof maxCount !== 'number' || maxCount < 1) {
      maxCount = 10;
    }
    
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
   * FIXED: Improved extractAllWithMetadata with comprehensive information
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
      hasMinimum: function (min: number) { 
        return typeof min === 'number' && values.length >= min; 
      }
    };
  }

  /**
   * Extract all items and return as object with dynamic properties
   */
  extractAllAsNamedObject<T = any>(rootDesc: ActionDescriptor, namePattern: string = 'item{n}'): Record<string, T> {
    this.checkDisposed();
    
    if (!namePattern || typeof namePattern !== 'string') {
      namePattern = 'item{n}';
    }
    
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
   * FIXED: Improved transform with memory-efficient transformer chaining
   */
  transform(transformer: ValueTransformer): ListValueExtractor {
    this.checkDisposed();
    
    if (!transformer || typeof transformer !== 'function') {
      throw new Error("Transformer must be a function");
    }
    
    var newOptions: ListExtractionOptions = {
      skipErrors: this.options.skipErrors,
      includeIndices: this.options.includeIndices,
      tolerance: this.options.tolerance,
      defaultValue: this.options.defaultValue
    };

    if (this.options.transformer) {
      newOptions.transformer = this.createChainedTransformer(this.options.transformer, transformer);
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
   */
  floor(): ListValueExtractor {
    return this.transform(ListExtractorTransformers.floor.transform);
  }

  /**
   * FIXED: Round numeric values using singleton transformer
   */
  round(decimals: number = 0): ListValueExtractor {
    if (typeof decimals !== 'number' || decimals < 0) {
      decimals = 0;
    }
    
    var transformer = ListExtractorTransformers.round(decimals);
    return this.transform(transformer.transform);
  }

  /**
   * FIXED: Convert to percentage using singleton transformer
   */
  toPercentage(): ListValueExtractor {
    return this.transform(ListExtractorTransformers.percentage.transform);
  }

  /**
   * Skip errors and continue processing
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
   * FIXED: Improved findWhere with type validation
   */
  findWhere<T = any>(
    rootDesc: ActionDescriptor,
    searchProperty: string,
    searchValueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated',
    searchValue: any
  ): T[] {
    this.checkDisposed();
    
    if (!rootDesc || !searchProperty || typeof searchProperty !== 'string') {
      return [];
    }
    
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
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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
   */
  safeExtractAt<T = any>(rootDesc: ActionDescriptor, index: number): T {
    this.checkDisposed();
    
    if (!rootDesc || typeof index !== 'number' || index < 0) {
      return this.getSentinelValue<T>(this.valueType);
    }
    
    try {
      var list = this.basePath.extract(rootDesc) as ActionList;
      
      if (!list || typeof list.count !== 'number' || index >= list.count) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      var hasGetType = ListExtractorVersionManager.hasGetType();
      if (hasGetType && list.getType && list.getType(index) !== DescValueType.OBJECTTYPE) {
        return this.getSentinelValue<T>(this.valueType);
      }
      
      return this.extractSingleValue(list, index);
    } catch (error) {
      return this.getSentinelValue<T>(this.valueType);
    }
  }

  // === PRIVATE METHODS ===

  /**
   * FIXED: Improved extractSingleValue with better error handling
   */
  private extractSingleValue(list: ActionList, index: number): any {
    if (!list || typeof index !== 'number' || index < 0 || index >= list.count) {
      throw new Error("Invalid list or index");
    }
    
    var hasGetType = ListExtractorVersionManager.hasGetType();
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

  /**
   * FIXED: Improved extractValueFromDescriptor with better path handling
   */
  private extractValueFromDescriptor(desc: ActionDescriptor, subPath: string, valueType: string): any {
    if (!desc || !subPath) {
      return this.getSentinelValue(valueType);
    }
    
    var pathParts = subPath.split('.');
    var current = desc;

    try {
      for (var i = 0; i < pathParts.length; i++) {
        var part = pathParts[i];
        if (!part) continue;

        var typeID = stringIDToTypeID(part);
        
        if (i === pathParts.length - 1) {
          // Final value extraction
          if (!current.hasKey(typeID)) {
            return this.getSentinelValue(valueType);
          }
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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
          // Navigate deeper
          if (!current.hasKey(typeID)) {
            return this.getSentinelValue(valueType);
          }
          
          var hasGetType = ListExtractorVersionManager.hasGetType();
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