# Fluent Photoshop Document Scoring API

A TypeScript library for extracting and evaluating values from Photoshop documents using ExtendScript's ActionManager. Designed for creating precise test scoring systems with a clean, self-contained architecture.

## Overview

This library provides a fluent, declarative API for extracting actual values from Photoshop documents, not just validation results. Perfect for scoring candidate performance in Photoshop skills assessments.

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

// ❌ Not this - Returns boolean validation
const isValid = path.validate(d).passed; // Returns: true/false
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
    "target": "es3",
    "module": "none",
    "outFile": "./scoring.jsx",
    "lib": ["es5"]
  }
}
```

## Quick Start

### Basic Value Extraction

```typescript
// Create layer reference using correct pattern
const r = new ActionReference();
r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
const d = executeActionGet(r);

// Extract single values - Primary recommended approach
const answers = {
  brightness: ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .at(0)
    .value("brightness", "integer")
    .extract<number>(d),

  fontSize: ActionDescriptorPath.create()
    .object("textKey")
    .list("textStyleRange")
    .at(0)
    .object("textStyle")
    .value("sizeKey", "double")
    .round(1)
    .extract<number>(d),

  layerWidth: ActionDescriptorPath.create()
    .object("bounds")
    .value("width", "double")
    .toPixels("pt")
    .floor()
    .extract<number>(d),
};
```

### Using Convenient Factory Functions

```typescript
// Shorter syntax for common operations
const answers = {
  leftBound: P.bounds("left").extract<number>(d),
  fontName: P.textStyle("fontName", "string", 0).extract<string>(d),
  filterBrightness: P.filter("brightness", "integer", 0).extract<number>(d),
};
```

## API Reference

### ActionDescriptorPath (Primary Interface)

The main fluent interface for navigating ActionDescriptor structures. **This should be your primary choice for most extractions.**

#### Navigation Methods

```typescript
.object(key: string)          // Navigate to nested object
.list(key: string)            // Navigate to ActionList
.at(index: number)            // Access specific list index
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
// All layer names
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();

// Specific count with defaults
const [layer1, layer2, layer3] = ActionDescriptorPath.create().extractLayerTuple(3, "Missing");

// Layer count
const layerCount = ActionDescriptorPath.create().getLayerCount();
```

#### Specialized Text Methods

```typescript
// Text style values from current layer
const textStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
  "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
const [bullet1, bullet2, bullet3, bullet4] = textStyles;

// Standard list extraction with error handling
const values = ActionDescriptorPath.create().extractAllFromList<string>(
  "name", "string", true, "Default"
);
```

## Layer and Text Extraction

### Layer Operations

```typescript
// Extract all layer names
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
// Result: ["Background", "Text Layer", "Effects", "Adjustment Layer"]

// Extract specific number of layer names as tuple
const layerTuple = ActionDescriptorPath.create().extractLayerTuple(4, "Missing Layer");
const [layer1, layer2, layer3, layer4] = layerTuple;

// Get total layer count
const layerCount = ActionDescriptorPath.create().getLayerCount();

// Destructure with defaults
const [
  backgroundLayer = "Missing",
  textLayer = "Missing", 
  effectsLayer = "Missing",
  adjustmentLayer = "Missing",
  ...extraLayers
] = layerNames;
```

### Text Style Extraction

```typescript
// Extract bullet point styles from current text layer
const bulletResults = ActionDescriptorPath.create().extractTextStyleValues<string>(
  "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
const [bullet1, bullet2, bullet3, bullet4] = bulletResults;

// Now assign to specific answer properties
answers.firstBulletStyle = bullet1;   // Did they make item 1 a bullet?
answers.secondBulletStyle = bullet2;  // Did they make item 2 a bullet?
answers.thirdBulletStyle = bullet3;   // Did they make item 3 numbered?
answers.fourthBulletStyle = bullet4;  // Did they make item 4 numbered?

// Extract font information from multiple layers
const fontInfo = [];
for (let i = 1; i <= Math.min(3, layerCount); i++) {
  try {
    const lRef = new ActionReference();
    lRef.putIndex(charIDToTypeID("Lyr "), i);
    const lDesc = executeActionGet(lRef);
    const fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
    const fontSize = P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(lDesc);
    fontInfo.push({ name: fontName, size: fontSize });
  } catch (error) {
    fontInfo.push({ name: "Unknown", size: 12 });
  }
}
const [font1, font2, font3] = fontInfo;
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
const bounds = ActionDescriptorNavigator.from(r)
  .object("bounds")
  .getValuesAsObject({
    left: { key: "left", type: "double" },
    top: { key: "top", type: "double" },
    width: { key: "width", type: "double" },
    height: { key: "height", type: "double" }
  });

// Specialized utility methods
const textProps = ActionDescriptorNavigator.forCurrentLayer().getTextProperties();
const boundsInfo = ActionDescriptorNavigator.forCurrentLayer().getBounds();
const bulletStyles = ActionDescriptorNavigator.forCurrentLayer().extractBulletStyles(4, "plain");
```

## Factory Functions (Convenience API)

```typescript
// Quick path creation for common patterns
var P = {
  // Bounds extraction (converts points to pixels, floors result)
  bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
    return ActionDescriptorPath.create()
      .object('bounds')
      .value(property, 'double')
      .toPixels('pt')
      .floor();
  },

  // Text style extraction (uses correct textKey navigation)
  textStyle: function (property: string, type: string, textIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('textKey')
      .list('textStyleRange')
      .at(textIndex)
      .object('textStyle')
      .value(property, type);
  },

  // Filter effect extraction
  filter: function (property: string, type: string, filterIndex: number = 0) {
    return ActionDescriptorPath.create()
      .object('smartObjectMore')
      .list('filterFXList')
      .at(filterIndex)
      .object('filter')
      .value(property, type);
  }
};

// Usage examples
const leftBound = P.bounds('left').extract<number>(d);
const fontName = P.textStyle('fontName', 'string', 0).extract<string>(d);
const brightness = P.filter('brightness', 'integer', 0).extract<number>(d);
```

## Real-World Examples

### Comprehensive Test Scoring

```typescript
interface TestAnswers {
  // Document properties
  documentWidth: number;
  documentHeight: number;
  
  // Text properties
  textContent: string;
  fontFamily: string;
  fontSize: number;
  
  // Filter properties
  brightnessValue: number;
  contrastValue: number;
  
  // Layer properties
  allLayerNames: string[];
  layerCount: number;
  
  // Individual bullet styles
  firstBulletStyle: string;
  secondBulletStyle: string;
  thirdBulletStyle: string;
  fourthBulletStyle: string;
  
  // Calculated properties
  averageOpacity: number;
  hasArialFont: boolean;
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

  // Extract bullet styles
  const bulletStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
    "paragraphStyle.listStyleType", "enumerated", 4, "plain"
  );

  return {
    // Document dimensions
    documentWidth: ActionDescriptorPath.create()
      .value('width', 'integer')
      .extract<number>(docDesc),
    documentHeight: ActionDescriptorPath.create()
      .value('height', 'integer')
      .extract<number>(docDesc),

    // Text properties using factory functions
    textContent: ActionDescriptorPath.create()
      .object("textKey")
      .value("textKey", "string")
      .defaultTo("")
      .extract<string>(layerDesc),
    fontFamily: P.textStyle("fontName", "string", 0)
      .defaultTo("Unknown")
      .extract<string>(layerDesc),
    fontSize: P.textStyle("sizeKey", "double", 0)
      .round(1)
      .defaultTo(12)
      .extract<number>(layerDesc),

    // Filter properties
    brightnessValue: P.filter("brightness", "integer", 0)
      .defaultTo(0)
      .extract<number>(layerDesc),
    contrastValue: P.filter("contrast", "integer", 0)
      .defaultTo(0)
      .extract<number>(layerDesc),

    // Layer information
    allLayerNames: ActionDescriptorPath.create().extractAllLayerNames(),
    layerCount: ActionDescriptorPath.create().getLayerCount(),

    // Individual bullet styles
    firstBulletStyle: bulletStyles[0],
    secondBulletStyle: bulletStyles[1],
    thirdBulletStyle: bulletStyles[2],
    fourthBulletStyle: bulletStyles[3],

    // Calculated properties
    averageOpacity: (() => {
      const opacities: number[] = [];
      const layerCount = ActionDescriptorPath.create().getLayerCount();
      
      for (let i = 1; i <= layerCount; i++) {
        try {
          const lRef = new ActionReference();
          lRef.putIndex(charIDToTypeID("Lyr "), i);
          const lDesc = executeActionGet(lRef);
          const opacity = ActionDescriptorPath.create()
            .value("opacity", "double")
            .toPercentage()
            .defaultTo(100)
            .extract<number>(lDesc);
          opacities.push(opacity);
        } catch (error) {
          opacities.push(100);
        }
      }
      
      return opacities.length > 0 
        ? Math.round(opacities.reduce((sum, op) => sum + op, 0) / opacities.length)
        : 100;
    })(),

    hasArialFont: (() => {
      const layerCount = ActionDescriptorPath.create().getLayerCount();
      
      for (let i = 1; i <= layerCount; i++) {
        try {
          const lRef = new ActionReference();
          lRef.putIndex(charIDToTypeID("Lyr "), i);
          const lDesc = executeActionGet(lRef);
          const fontName = P.textStyle('fontName', 'string', 0)
            .defaultTo("Unknown")
            .extract<string>(lDesc);
          if (fontName === "Arial") {
            return true;
          }
        } catch (error) {
          // Continue checking
        }
      }
      return false;
    })(),
  };
}
```

### Safe Extraction Patterns

```typescript
// Pattern 1: Try with null coalescing
const brightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("brightness", "integer")
  .tryExtract<number>(d) ?? 0;

// Pattern 2: Extract with fallback
const fontSize = ActionDescriptorPath.create()
  .object("textKey")
  .list("textStyleRange")
  .at(0)
  .object("textStyle")
  .value("sizeKey", "double")
  .extractOr(d, 12.0);

// Pattern 3: Default in path
const contrast = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("contrast", "integer")
  .defaultTo(0)
  .extract<number>(d);

// Pattern 4: Safe layer extraction
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
// Always returns array, handles errors internally

// Pattern 5: Safe text extraction with error handling
const textStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
  "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
// Always returns array of specified length, fills with defaults if needed
```

## Advanced List Operations (Optional)

For complex list processing scenarios, use the standalone ListExtractors utility:

```typescript
import { ListValueExtractor } from "./ListExtractors";

// Advanced filtering and metadata
const extractor = new ListValueExtractor(path, "name", "string", {});
const metadata = extractor.extractAllWithMetadata(desc);
// Result: { values: [...], count: number, indices: [...], isEmpty: boolean }

const filtered = extractor.extractWhere(desc, (value, index) => value.includes("Layer"));
const withTransform = extractor.transform(val => val.toUpperCase()).extractAll(desc);
```

## Error Handling

The library provides several error handling strategies:

1. **Throw on Error** (default): `.extract()` throws if path fails
2. **Return Null**: `.tryExtract()` returns null on failure
3. **Fallback Value**: `.extractOr(fallback)` returns fallback on failure
4. **Default Value**: `.defaultTo(value)` sets default before extraction
5. **Built-in Safety**: Specialized methods like `.extractLayerTuple()` handle errors internally

## Unit Conversion

Built-in support for Photoshop's unit system:

```typescript
// Convert points to pixels
const widthInPixels = ActionDescriptorPath.create()
  .object("bounds")
  .value("width", "double")
  .toPixels("pt")
  .extract<number>(d);

// Convert to percentage
const opacityPercent = ActionDescriptorPath.create()
  .value("opacity", "double")
  .toPercentage()
  .extract<number>(d);

// Chain conversions
const roundedPixelWidth = P.bounds('width')
  .toPixels('pt')
  .floor()
  .extract<number>(d);
```

## Best Practices

1. **Use ActionDescriptorPath as Primary Interface** - It covers 95% of use cases
2. **Use Correct References** for different property types:
   - Document properties: `charIDToTypeID('Dcmn')`
   - Layer properties: `charIDToTypeID("Lyr ")`
3. **Use Factory Functions** for common patterns (`P.bounds()`, `P.textStyle()`, `P.filter()`)
4. **Use Specialized Methods** for layers and text:
   - `.extractAllLayerNames()` for all layer names
   - `.extractLayerTuple()` for specific count
   - `.extractTextStyleValues()` for text properties
5. **Handle Errors Gracefully** with appropriate fallback strategies
6. **Chain Transformations** for complex value processing
7. **Use TypeScript Generics** for type safety: `.extract<number>(d)`

## Architecture Benefits

### **Clean, Self-Contained Design**
- **No circular dependencies** - Each file is independent
- **Direct value returns** - No intermediate objects requiring further chaining
- **Self-contained** - All ExtendScript globals declared in each file

### **Progressive Enhancement**
- Start with `ActionDescriptorPath.create()` for most extractions
- Add `ActionDescriptorNavigator` for complex tuple operations
- Use `ListExtractors` only for advanced scenarios

### **TypeScript-First with ExtendScript Compatibility**
- Full type safety with generics
- Compiles to ES3 for ExtendScript compatibility
- All files include necessary ExtendScript global declarations
- No external dependencies or complex build requirements

## Common Use Cases

### **Test Scoring**
Extract exact values for comparison against expected results with tolerance support.

### **Document Analysis**
Analyze document structure, layers, and properties for automated quality checks.

### **Batch Processing**
Extract metadata and properties from multiple documents for reporting.

### **Skills Assessment**
Evaluate candidate work against specific requirements with detailed feedback.

---

## Quick Reference

### **Most Common Operations**
```typescript
// Import
import { ActionDescriptorPath, P } from "./PathAccessor";

// Basic extraction
const value = ActionDescriptorPath.create().object("key").value("prop", "type").extract<T>(d);

// Factory functions
const bounds = P.bounds("width").extract<number>(d);
const font = P.textStyle("fontName", "string", 0).extract<string>(d);
const filter = P.filter("brightness", "integer", 0).extract<number>(d);

// Layer operations
const layers = ActionDescriptorPath.create().extractAllLayerNames();
const [l1, l2, l3] = ActionDescriptorPath.create().extractLayerTuple(3, "Missing");

// Text operations  
const styles = ActionDescriptorPath.create().extractTextStyleValues<string>("path", "type", 4, "default");
```

This API is designed specifically for precise, value-extraction scenarios like testing, where exact values matter more than fuzzy validation. The clean architecture ensures maintainable, reliable code for production scoring systems.