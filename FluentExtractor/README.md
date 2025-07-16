# Fluent Photoshop Document Scoring API

A production-ready TypeScript library for extracting and evaluating values from Photoshop documents using ExtendScript's ActionManager. Designed for creating precise test scoring systems with emphasis on robust, search-based extraction patterns.

## Overview

This library provides a fluent, declarative API for extracting actual values from Photoshop documents, emphasizing **search-based patterns over brittle indexing**. Perfect for scoring candidate performance in Photoshop skills assessments with reliable, error-tolerant extraction.

## Core Philosophy

**Returns Values, Not Validation Results**

```typescript
// ✅ Good - Returns actual values for assignment
const brightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("brightness", "integer")
  .extract<number>(d); // Returns: 75

answers.brightnessValue = brightness;

// ✅ Better - Search-based approach (recommended)
const activeBrightness = P.findFilter("brightness", "integer", (value) => value > 0)
  .extract<number>(d); // Finds first active brightness filter

answers.activeBrightnessValue = activeBrightness;
```

**Safer Patterns Over Brittle Indexing**

```typescript
// ❌ Brittle - Assumes layer structure
const layer1Name = layerTuple[0];
const layer2Name = layerTuple[1];

// ✅ Robust - Search-based extraction
const backgroundLayer = P.findLayer(/background/i).extract();
const textLayer = P.findLayer("text").extract();
```

## Installation & Setup

```typescript
// Primary imports (covers 95% of use cases)
import { ActionDescriptorPath, P } from "./PathAccessor";

// For complex tuple extractions
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

// For advanced list operations (optional)
import { ListValueExtractor } from "./ListExtractors";
```

### TypeScript Configuration

Ensure your `tsconfig.json` targets ES3 for ExtendScript compatibility:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "none",
    "outFile": "./scoring.jsx",
    "lib": ["es5"]
  }
}
```

## Quick Start

### Basic Value Extraction (Recommended Patterns)

```typescript
// Create layer reference using correct pattern
const r = new ActionReference();
r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
const d = executeActionGet(r);

// RECOMMENDED: Primary fluent pattern
const answers = {
  // Direct extraction with transformations
  fontSize: P.textStyle("sizeKey", "double", 0)
    .round(1)
    .extract<number>(d),

  // Bounds with unit conversion
  layerWidth: P.bounds("width").extract<number>(d),

  // Safe filter extraction with fallback
  brightness: P.filter("brightness", "integer", 0)
    .defaultTo(0)
    .extract<number>(d)
};
```

### Search-Based Extraction (Strongly Recommended)

```typescript
// SAFER: Search for layers by pattern instead of index
const backgroundLayer = P.findLayer(/background/i).extract();
const textLayer = P.findLayer("text").extract();

// SAFER: Search for active filters instead of assuming index 0
const activeBrightness = P.findFilter("brightness", "integer", (value) => value > 0)
  .extract<number>(d);

// ROBUST: Extract all layer names without assumptions
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
const layerAnalysis = {
  total: layerNames.length,
  hasBackground: layerNames.some(name => /background/i.test(name)),
  textLayers: layerNames.filter(name => /text/i.test(name))
};
```

## API Reference

### ActionDescriptorPath (Primary Interface)

The main fluent interface for navigating ActionDescriptor structures. **Use this for 95% of extraction tasks.**

#### Navigation Methods

```typescript
.object(key: string)          // Navigate to nested object
.list(key: string)            // Navigate to ActionList
.at(index: number)            // Access specific list index (use sparingly)
.value(key: string, type)     // Extract final value
```

#### Transformation Methods

```typescript
.transform(fn)                // Custom transformation
.floor()                      // Math.floor()
.round(decimals?)             // Round to decimal places
.toPixels(fromUnit?, dpi?)    // Convert to pixels
.toPoints(fromUnit?, dpi?)    // Convert to points
.toPercentage()               // 0.75 → 75
.fromPercentage()             // 75 → 0.75
.defaultTo(value)             // Set default value
```

#### Extraction Methods

```typescript
.extract<T>(desc)             // Extract value (throws on error)
.tryExtract<T>(desc)          // Extract value (returns null on error)
.extractOr<T>(desc, fallback) // Extract value with fallback
```

#### Specialized Layer Methods

```typescript
// All layer names (safe, always works)
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();

// Specific count with defaults (less preferred)
const [layer1, layer2, layer3] = ActionDescriptorPath.create().extractLayerTuple(3, "Missing");

// Layer count
const layerCount = ActionDescriptorPath.create().getLayerCount();
```

#### Text Extraction Methods

```typescript
// UPDATED: Static method for text style extraction
const bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
  layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
const [bullet1, bullet2, bullet3, bullet4] = bulletStyles;
```

## Search-Based Patterns (Recommended)

### Layer Operations

```typescript
// RECOMMENDED: Search by pattern instead of index
const backgroundLayer = P.findLayer(/background/i).extract();
const textLayer = P.findLayer(/text.*layer/i).extract();

// ROBUST: Analyze all layers
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
const analysis = {
  total: layerNames.length,
  backgroundExists: layerNames.some(name => /background/i.test(name)),
  textLayerCount: layerNames.filter(name => /text/i.test(name)).length,
  followsNaming: layerNames.every(name => name.trim().length > 0 && name !== "Layer 1")
};
```

### Filter Operations

```typescript
// RECOMMENDED: Search for active filters
const activeBrightness = P.findFilter("brightness", "integer", (value) => value > 0)
  .extract<number>(d);

// ADVANCED: Use ListExtractor for complex analysis
const filterExtractor = new ListValueExtractor(
  ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
  "brightness",
  "integer",
  { skipErrors: true }
);

const allBrightness = filterExtractor.extractWhere(d, (value, index) => value > 25);
```

### Text Style Operations

```typescript
// RECOMMENDED: Search for specific fonts
const arialFont = P.findTextStyle("fontName", "string", (font) => font === "Arial")
  .extract<string>(d);

// ROBUST: Analyze across all layers
function analyzeFontsAcrossLayers() {
  const fonts = [];
  const layerCount = ActionDescriptorPath.create().getLayerCount();
  
  for (let i = 1; i <= layerCount; i++) {
    try {
      const lRef = new ActionReference();
      lRef.putIndex(charIDToTypeID("Lyr "), i);
      const lDesc = executeActionGet(lRef);
      
      const fontName = P.textStyle('fontName', 'string', 0).tryExtract<string>(lDesc);
      if (fontName) fonts.push(fontName);
    } catch (error) {
      // Continue processing
    }
  }
  
  return {
    fonts: fonts,
    hasArial: fonts.includes('Arial'),
    uniqueFonts: [...new Set(fonts)]
  };
}
```

## ActionDescriptorNavigator (Advanced Operations)

For complex tuple extractions and imperative-style navigation:

```typescript
// Extract multiple values as tuple
const [brightness, contrast] = ActionDescriptorNavigator.from(r)
  .object("smartObjectMore")
  .list("filterFXList")
  .getObject(0)
  .getValues([
    { key: "brightness", type: "integer" },
    { key: "contrast", type: "integer" }
  ]);

// Extract values as object
const bounds = ActionDescriptorNavigator.from(r).getValuesAsObject({
  left: { key: "bounds.left", type: "double" },
  top: { key: "bounds.top", type: "double" },
  width: { key: "bounds.width", type: "double" },
  height: { key: "bounds.height", type: "double" }
});
```

## ListValueExtractor (Advanced List Processing)

For complex list operations when basic patterns aren't sufficient:

```typescript
// Advanced filtering with metadata
const extractor = new ListValueExtractor(
  ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
  "brightness",
  "integer",
  { skipErrors: true, defaultValue: 0 }
);

// Extract with conditions
const brightFilters = extractor.extractWhere(desc, (value, index) => value > 50);

// Extract with metadata
const metadata = extractor.extractAllWithMetadata(desc);
// Result: { values: [...], count: number, indices: [...], isEmpty: boolean }
```

## Factory Functions (Convenience API)

```typescript
var P = {
  // Bounds extraction (converts points to pixels, floors result)
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor()
      .defaultTo(-1);
  },

  // Text style extraction
  textStyle: function (property: string, type: string, textIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('textKey')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type)
      .defaultTo(type === 'string' ? "" : type === 'boolean' ? false : -1);
  },

  // Filter effect extraction
  filter: function (property: string, type: string, filterIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .value(property, type)
      .defaultTo(type === 'string' ? "" : type === 'boolean' ? false : -1);
  },

  // SEARCH-BASED: Find layer by pattern (recommended)
  findLayer: function (namePattern: string | RegExp) {
    // Returns search utility that finds layer by pattern
  },

  // SEARCH-BASED: Find filter by property (recommended)
  findFilter: function (property: string, type: string, predicate?: (value: any) => boolean) {
    // Returns search utility that finds filter matching criteria
  }
};
```

## Real-World Examples

### Comprehensive Test Scoring (Current Best Practices)

```typescript
interface TestAnswers {
  // Document properties
  documentWidth: number;
  documentHeight: number;
  
  // Search-based layer analysis
  backgroundLayerExists: boolean;
  textLayerCount: number;
  layerNamingConvention: boolean;
  
  // Font analysis across all layers
  hasArialFont: boolean;
  fontConsistency: boolean;
  averageFontSize: number;
  
  // Filter analysis (search-based)
  activeBrightnessFilters: number;
  hasContrastFilter: boolean;
  
  // Text formatting analysis
  bulletPointsUsed: boolean;
  numberedListsUsed: boolean;
  mixedFormatting: boolean;
}

function scoreCandidate(): TestAnswers {
  // Document properties
  const docRef = new ActionReference();
  docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  const docDesc = executeActionGet(docRef);

  // Layer properties
  const layerRef = new ActionReference();
  layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  const layerDesc = executeActionGet(layerRef);

  // SEARCH-BASED layer analysis
  const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
  const layerAnalysis = {
    backgroundExists: layerNames.some(name => /background/i.test(name)),
    textLayerCount: layerNames.filter(name => /text/i.test(name)).length,
    followsConvention: layerNames.every(name => name.trim().length > 0 && name !== "Layer 1")
  };

  // ADVANCED font analysis across all layers
  const fontAnalysis = analyzeFontsAcrossLayers();

  // SEARCH-BASED filter analysis
  const filterAnalysis = analyzeFiltersAcrossLayers();

  // UPDATED: Text formatting using static method
  const bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
    layerDesc, "paragraphStyle.listStyleType", "enumerated", 10, "plain"
  );
  
  const formatAnalysis = {
    hasBullets: bulletStyles.includes("bullet"),
    hasNumbered: bulletStyles.includes("numbered"),
    mixed: bulletStyles.includes("bullet") && bulletStyles.includes("numbered")
  };

  return {
    // Document dimensions
    documentWidth: P.bounds('width').extractOr(docDesc, 0),
    documentHeight: P.bounds('height').extractOr(docDesc, 0),

    // Layer analysis (search-based)
    backgroundLayerExists: layerAnalysis.backgroundExists,
    textLayerCount: layerAnalysis.textLayerCount,
    layerNamingConvention: layerAnalysis.followsConvention,

    // Font analysis (robust)
    hasArialFont: fontAnalysis.hasArial,
    fontConsistency: fontAnalysis.consistent,
    averageFontSize: fontAnalysis.averageSize,

    // Filter analysis (search-based)
    activeBrightnessFilters: filterAnalysis.activeBrightness,
    hasContrastFilter: filterAnalysis.hasContrast,

    // Text formatting
    bulletPointsUsed: formatAnalysis.hasBullets,
    numberedListsUsed: formatAnalysis.hasNumbered,
    mixedFormatting: formatAnalysis.mixed
  };
}

// Helper functions emphasizing robust patterns
function analyzeFontsAcrossLayers() {
  const fonts = [];
  const sizes = [];
  const layerCount = ActionDescriptorPath.create().getLayerCount();
  
  for (let i = 1; i <= layerCount; i++) {
    try {
      const lRef = new ActionReference();
      lRef.putIndex(charIDToTypeID("Lyr "), i);
      const lDesc = executeActionGet(lRef);
      
      const fontName = P.textStyle('fontName', 'string', 0).tryExtract<string>(lDesc);
      const fontSize = P.textStyle('sizeKey', 'double', 0).tryExtract<number>(lDesc);
      
      if (fontName) fonts.push(fontName);
      if (fontSize && fontSize > 0) sizes.push(fontSize);
    } catch (error) {
      // Continue processing other layers
    }
  }
  
  return {
    hasArial: fonts.includes('Arial'),
    consistent: new Set(fonts).size <= 2,
    averageSize: sizes.length > 0 ? Math.round(sizes.reduce((sum, s) => sum + s, 0) / sizes.length) : 12
  };
}

function analyzeFiltersAcrossLayers() {
  let activeBrightness = 0;
  let hasContrast = false;
  const layerCount = ActionDescriptorPath.create().getLayerCount();
  
  for (let i = 1; i <= layerCount; i++) {
    try {
      const lRef = new ActionReference();
      lRef.putIndex(charIDToTypeID("Lyr "), i);
      const lDesc = executeActionGet(lRef);
      
      // Use ListExtractor for robust filter analysis
      const filterExtractor = new ListValueExtractor(
        ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
        "brightness",
        "integer",
        { skipErrors: true, defaultValue: 0 }
      );
      
      const brightnessValues = filterExtractor.extractAll<number>(lDesc);
      activeBrightness += brightnessValues.filter(v => v > 0).length;
      
      // Check for contrast
      const contrastFilter = P.findFilter("contrast", "integer").tryExtract<number>(lDesc);
      if (contrastFilter && contrastFilter !== 0) {
        hasContrast = true;
      }
    } catch (error) {
      // Continue processing
    }
  }
  
  return { activeBrightness, hasContrast };
}
```

### Safe Extraction Patterns

```typescript
// Pattern 1: tryExtract with null coalescing
const brightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("brightness", "integer")
  .tryExtract<number>(d) ?? 0;

// Pattern 2: extractOr with fallback
const fontSize = P.textStyle("sizeKey", "double", 0)
  .extractOr(d, 12.0);

// Pattern 3: defaultTo in path
const contrast = P.filter("contrast", "integer", 0)
  .defaultTo(0)
  .extract<number>(d);

// Pattern 4: Search-based (recommended)
const activeFilter = P.findFilter("brightness", "integer", (value) => value > 0)
  .extract<number>(d);

// Pattern 5: Robust layer analysis
const layerAnalysis = {
  names: ActionDescriptorPath.create().extractAllLayerNames(),
  backgroundExists: layerNames.some(name => /background/i.test(name)),
  textLayerCount: layerNames.filter(name => /text/i.test(name)).length
};
```

## Error Handling

The library provides multiple error handling strategies:

1. **Throw on Error** (default): `.extract()` throws if path fails
2. **Return Null**: `.tryExtract()` returns null on failure
3. **Fallback Value**: `.extractOr(fallback)` returns fallback on failure
4. **Default Value**: `.defaultTo(value)` sets default before extraction
5. **Built-in Safety**: Search methods handle errors internally
6. **Skip Errors**: ListExtractor `skipErrors` option for batch processing

## Best Practices

### 1. **Prefer Search Over Indexing**
```typescript
// ❌ Brittle - assumes structure
const layer1 = layerTuple[0];

// ✅ Robust - search-based
const backgroundLayer = P.findLayer(/background/i).extract();
```

### 2. **Use Correct References for Different Property Types**
```typescript
// Document properties
charIDToTypeID('Dcmn')

// Layer properties  
charIDToTypeID("Lyr ")
```

### 3. **Use Factory Functions for Common Patterns**
```typescript
const bounds = P.bounds('width').extract<number>(d);
const font = P.textStyle('fontName', 'string', 0).extract<string>(d);
```

### 4. **Handle Errors Gracefully**
```typescript
// Multiple strategies available
const value = path.tryExtract(d) ?? fallback;
const value2 = path.extractOr(d, fallback);
const value3 = path.defaultTo(fallback).extract(d);
```

### 5. **Use Search Methods for Layer/Filter Discovery**
```typescript
// Find layers by pattern
const textLayer = P.findLayer("text").extract();

// Find active filters
const activeFilter = P.findFilter("brightness", "integer", v => v > 0).extract(d);
```

### 6. **Leverage Advanced List Processing When Needed**
```typescript
const extractor = new ListValueExtractor(path, "property", "type", { skipErrors: true });
const filtered = extractor.extractWhere(desc, (value, index) => value > threshold);
```

## Architecture Benefits

### **Clean, Self-Contained Design**
- **No circular dependencies** - Each file is independent
- **Direct value returns** - No intermediate objects requiring further chaining
- **Self-contained** - All ExtendScript globals declared in each file

### **Progressive Enhancement**
- Start with `ActionDescriptorPath.create()` for most extractions
- Add `ActionDescriptorNavigator` for complex tuple operations
- Use `ListExtractors` only for advanced scenarios

### **Search-First Philosophy**
- **Pattern matching** over hard-coded indices
- **Predicate-based filtering** for complex criteria
- **Error-tolerant processing** across multiple layers

### **TypeScript-First with ExtendScript Compatibility**
- Full type safety with generics
- Compiles to ES3 for ExtendScript compatibility
- All files include necessary ExtendScript global declarations
- No external dependencies or complex build requirements

## Common Use Cases

### **Test Scoring**
Extract exact values with search-based discovery and tolerance support.

### **Document Analysis**
Analyze document structure using pattern matching instead of assumptions.

### **Batch Processing**
Process multiple layers/filters with error tolerance and fallback strategies.

### **Skills Assessment**
Evaluate candidate work using robust, search-based criteria.

---

## Quick Reference

### **Most Common Operations**
```typescript
// Import
import { ActionDescriptorPath, P } from "./PathAccessor";

// Search-based extraction (recommended)
const backgroundLayer = P.findLayer(/background/i).extract();
const activeFilter = P.findFilter("brightness", "integer", v => v > 0).extract(d);

// Factory functions
const bounds = P.bounds("width").extract<number>(d);
const font = P.textStyle("fontName", "string", 0).extract<string>(d);

// Layer operations (safe)
const layers = ActionDescriptorPath.create().extractAllLayerNames();
const analysis = {
  total: layers.length,
  hasBackground: layers.some(name => /background/i.test(name))
};

// Text operations (updated)
const styles = ActionDescriptorPath.extractTextStyleValues<string>(
  layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
```

This API is designed specifically for **robust, production-ready scoring systems** where **search-based patterns** and **error tolerance** matter more than assumptions about document structure. The emphasis on **pattern matching over indexing** ensures reliable extraction even when document structures vary.