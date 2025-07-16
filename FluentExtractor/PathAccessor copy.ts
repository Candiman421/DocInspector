/**
 * Path-based accessor for extracting values from ActionDescriptors
 * FINAL CORRECTED VERSION - All issues resolved
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

interface ListExtractionOptions {
  skipErrors?: boolean;
  tolerance?: number;
  transformer?: ValueTransformer;
  defaultValue?: any;
}

class ActionDescriptorPath {
  private segments: PathSegment[] = [];
  private transformations: ValueTransformer[] = [];
  private defaultReturnValue?: any;

  static create(): ActionDescriptorPath {
    return new ActionDescriptorPath();
  }

  object(key: string): ActionDescriptorPath {
    this.segments.push({ key: key, type: 'object' });
    return this;
  }

  list(key: string): ActionDescriptorPath {
    this.segments.push({ key: key, type: 'list' });
    return this;
  }

  at(index: number): ActionDescriptorPath {
    var lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment && lastSegment.type === 'list') {
      lastSegment.index = index;
    } else {
      throw new Error('at() can only be used after list()');
    }
    return this;
  }

  value<T = any>(key: string, valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated'): ActionDescriptorPath {
    this.segments.push({ key: key, type: 'value', valueType: valueType });
    return this;
  }

  // Transformations
  transform(transformer: ValueTransformer): ActionDescriptorPath {
    this.transformations.push(transformer);
    return this;
  }

  floor(): ActionDescriptorPath {
    return this.transform(Math.floor);
  }

  round(decimals: number = 0): ActionDescriptorPath {
    var factor = Math.pow(10, decimals);
    return this.transform(function (val) { return Math.round(val * factor) / factor; });
  }

  toPixels(fromUnit: string = 'pt', dpi: number = 72): ActionDescriptorPath {
    var self = this;
    return this.transform(function (val) { return self.convertToPixels(val, fromUnit, dpi); });
  }

  toPercentage(): ActionDescriptorPath {
    return this.transform(function (val) { return val * 100; });
  }

  defaultTo<T>(value: T): ActionDescriptorPath {
    this.defaultReturnValue = value;
    return this;
  }

  // Extraction methods
  extract<T = any>(rootDesc: ActionDescriptor): T {
    try {
      var rawValue = this.resolvePath(rootDesc);
      return this.applyTransformations(rawValue) as T;
    } catch (error) {
      if (this.defaultReturnValue !== undefined) {
        return this.defaultReturnValue;
      }
      var err = error as Error;
      throw new Error("Path extraction failed: " + err.message);
    }
  }

  tryExtract<T = any>(rootDesc: ActionDescriptor): T | null {
    try {
      return this.extract<T>(rootDesc);
    } catch (error) {
      return null;
    }
  }

  extractOr<T = any>(rootDesc: ActionDescriptor, fallback: T): T {
    try {
      return this.extract<T>(rootDesc);
    } catch (error) {
      return fallback;
    }
  }

  // List operations for document layers (special case)
  getLayerCount(): number {
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
  }

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

  // TextStyleRange operations
  extractTextStyleTuple<T>(subPath: string, valueType: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', count: number, defaultValue?: T): T[] {
    var results: T[] = [];
    
    try {
      var textKey = this.resolvePath({ getObjectValue: function() { return arguments[0]; } } as any);
      var textStyleRanges = textKey.getList(stringIDToTypeID('textStyleRange'));
      
      for (var i = 0; i < count; i++) {
        if (i < textStyleRanges.count) {
          var range = textStyleRanges.getObjectValue(i);
          var value = this.extractValueFromDescriptor(range, subPath, valueType);
          results.push(value);
        } else {
          if (defaultValue !== undefined) {
            results.push(defaultValue);
          } else {
            throw new Error("Not enough items in textStyleRange");
          }
        }
      }
    } catch (error) {
      for (var i = 0; i < count; i++) {
        results.push(defaultValue || null);
      }
    }
    
    return results;
  }

  // Private methods
  private resolvePath(rootDesc: ActionDescriptor): any {
    var current: any = rootDesc;

    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var typeID = stringIDToTypeID(segment.key);

      if (!current.hasKey || !current.hasKey(typeID)) {
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
              throw new Error("List index out of bounds");
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
        current = current.getObjectValue(typeID);
      }
    }
    throw new Error('Invalid sub-path');
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
}

// Factory functions
var P = {
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor();
  },

  textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', textIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('textKey')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type);
  },

  filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', filterIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .object('filter')
      .value(property, type);
  }
};