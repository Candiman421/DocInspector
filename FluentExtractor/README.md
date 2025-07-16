# Fluent Photoshop Document Scoring API

A TypeScript library for extracting and evaluating values from Photoshop documents using ExtendScript's ActionManager. Designed for creating precise test scoring systems.

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
// Import the modules you need
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";
import { ActionDescriptorPath, P } from "./PathAccessor";
import { ListValueExtractor } from "./ListExtractors";
```

## Quick Start

### Basic Value Extraction

```typescript
// FIXED: Get layer reference using correct pattern
const r = new ActionReference();
r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
const d = executeActionGet(r);

// Extract single values
const answers = {
  brightness: ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .at(0)
    .value("brightness", "integer")
    .extract<number>(d),

  fontSize: ActionDescriptorPath.create()
    .object("textKey")  // FIXED: Use textKey not text
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

### ActionDescriptorPath

The main fluent interface for navigating ActionDescriptor structures.

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
```

#### Extraction Methods

```typescript
.extract<T>(desc)             // Extract value (throws on error)
.tryExtract<T>(desc)          // Extract value (returns null on error)
.extractOr<T>(desc, fallback) // Extract value with fallback
.defaultTo<T>(value)          // Set default before extraction
```

## Tuple Destructuring for Lists

Extract individual list items as tuples for precise testing:

```typescript
// FIXED: Extract exactly 4 bullet point styles as individual variables
const bulletResults = ActionDescriptorPath.create().extractTextStyleValues<string>(
  "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
const [bullet1, bullet2, bullet3, bullet4] = bulletResults;

// Now you can assign each to specific answer properties
answers.firstBulletStyle = bullet1; // Did they make item 1 a bullet?
answers.secondBulletStyle = bullet2; // Did they make item 2 a bullet?
answers.thirdBulletStyle = bullet3; // Did they make item 3 numbered?
answers.fourthBulletStyle = bullet4; // Did they make item 4 numbered?

// FIXED: Extract 3 layer names as tuple using corrected method
const layerNames = ActionDescriptorPath.create().extractLayerTuple(3, "Unnamed");
const [layer1, layer2, layer3] = layerNames;

// FIXED: Extract font sizes with transformation using corrected patterns
const fontSizes = [];
const layerCount = ActionDescriptorPath.create().getLayerCount();
for (let i = 1; i <= Math.min(3, layerCount); i++) {
  try {
    const lRef = new ActionReference();
    lRef.putIndex(charIDToTypeID("Lyr "), i);
    const lDesc = executeActionGet(lRef);
    const fontSize = P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(lDesc);
    fontSizes.push(fontSize);
  } catch (error) {
    fontSizes.push(12);
  }
}
const [fontSize1, fontSize2, fontSize3] = fontSizes;
```

### List Extraction Methods

```typescript
// FIXED: Use direct extraction methods that return values immediately
// Extract fixed number as tuple for layer names
const layerNames = ActionDescriptorPath.create().extractLayerTuple(count, defaultValue);

// Extract all layer names
const allLayerNames = ActionDescriptorPath.create().extractAllLayerNames();

// Extract text style values from current layer
const textValues = ActionDescriptorPath.create().extractTextStyleValues(subPath, valueType, count, defaultValue);

// Extract values from standard list with error handling
const listValues = ActionDescriptorPath.create().extractAllFromList(subPath, valueType, skipErrors, defaultValue);
```

### Tuple and Object Extraction

```typescript
// Extract multiple values as tuple
const [brightness, contrast] = ActionDescriptorNavigator.from(r)
  .object("smartObjectMore")
  .list("filterFXList")
  .getObject(0)
  .getValues([
    { key: "brightness", type: "integer" },
    { key: "contrast", type: "integer" },
  ]);

// Extract as object
const bounds = ActionDescriptorNavigator.from(r)
  .object("bounds")
  .getValuesAsObject({
    left: { key: "left", type: "double" },
    top: { key: "top", type: "double" },
    width: { key: "width", type: "double" },
    height: { key: "height", type: "double" },
  });
```

## Dynamic List Extraction (Unknown Quantities)

Perfect for scenarios where you don't know how many items exist but want to extract all of them:

### Extract All Layer Names

```typescript
// FIXED: Extract all layer names using corrected method
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();

// Result: ["Background", "Text Layer", "Effects", "Adjustment Layer"]
// Destructure with defaults:
const [
  backgroundLayer = "Missing",
  textLayer = "Missing", 
  effectsLayer = "Missing",
  adjustmentLayer = "Missing",
  ...extraLayers
] = layerNames;

// Or get exact count needed
const layerTuple = ActionDescriptorPath.create().extractLayerTuple(4, "Missing Layer");
const [layer1, layer2, layer3, layer4] = layerTuple;
```

### Extract All Bullet Styles

```typescript
// FIXED: Extract all bullet points using corrected textKey navigation
function extractAllBulletStyles(layerDesc: ActionDescriptor): Record<string, string> {
  const bulletStyles = {};
  try {
    const textKey = layerDesc.getObjectValue(stringIDToTypeID("textKey"));
    const paragraphStyleRanges = textKey.getList(stringIDToTypeID("paragraphStyleRange"));
    
    for (let i = 0; i < paragraphStyleRanges.count; i++) {
      try {
        const range = paragraphStyleRanges.getObjectValue(i);
        const paragraphStyle = range.getObjectValue(stringIDToTypeID("paragraphStyle"));
        const listStyleType = paragraphStyle.getEnumerationValue(stringIDToTypeID("listStyleType"));
        bulletStyles[`bullet${i + 1}`] = typeIDToStringID(listStyleType) || "plain";
      } catch (error) {
        bulletStyles[`bullet${i + 1}`] = "plain";
      }
    }
  } catch (error) {
    // No text content
  }
  return bulletStyles;
}

// Usage:
const bulletObject = extractAllBulletStyles(layerDesc);
// Result: { bullet1: "bullet", bullet2: "numbered", bullet3: "bullet" }

// Destructure with defaults:
const {
  bullet1 = "none",
  bullet2 = "none",
  bullet3 = "none",
  bullet4 = "none",
} = bulletObject;
```

### Extract Font Information from Multiple Layers

```typescript
// FIXED: Extract font information using corrected layer iteration
function extractFontInformation(maxLayers: number = 6): string[] {
  const fontNames = [];
  const layerCount = ActionDescriptorPath.create().getLayerCount();
  
  for (let i = 1; i <= Math.min(maxLayers, layerCount); i++) {
    try {
      const lRef = new ActionReference();
      lRef.putIndex(charIDToTypeID("Lyr "), i);
      const lDesc = executeActionGet(lRef);
      const fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
      fontNames.push(fontName);
    } catch (error) {
      fontNames.push("Unknown");
    }
  }
  
  return fontNames;
}

// Usage:
const fontNames = extractFontInformation(5);
// Result: ["Arial", "Helvetica", "Times", "Courier", "Georgia"]

// Destructure:
const [primaryFont, secondaryFont, tertiaryFont, ...otherFonts] = fontNames;
```

## Real-World Examples

### Comprehensive Test Scoring

```typescript
interface TestAnswers {
  documentWidth: number;
  documentHeight: number;
  textContent: string;
  fontFamily: string;
  fontSize: number;
  brightnessValue: number;
  contrastValue: number;
  allLayerNames: string[];
  averageOpacity: number;
  hasArialFont: boolean;
}

function scoreCandidate(): TestAnswers {
  // FIXED: Use correct references for different property types
  const docRef = new ActionReference();
  docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  const docDesc = executeActionGet(docRef);

  const layerRef = new ActionReference();
  layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  const layerDesc = executeActionGet(layerRef);

  return {
    // FIXED: Document properties from document descriptor
    documentWidth: ActionDescriptorPath.create()
      .value('width', 'integer')
      .extract<number>(docDesc),
    documentHeight: ActionDescriptorPath.create()
      .value('height', 'integer')
      .extract<number>(docDesc),

    // FIXED: Text properties using corrected textKey navigation
    textContent: ActionDescriptorPath.create()
      .object("textKey")  // FIXED: Use textKey
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

    // FIXED: List properties using corrected methods
    allLayerNames: ActionDescriptorPath.create().extractAllLayerNames(),

    // FIXED: Calculated properties using corrected layer iteration
    averageOpacity: (() => {
      const opacities = [];
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
          const fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
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
const brightness =
  ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .at(0)
    .value("brightness", "integer")
    .tryExtract<number>(d) ?? 0;

// Pattern 2: Extract with fallback
const fontSize = ActionDescriptorPath.create()
  .object("textKey")  // FIXED: Use textKey
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
```

## Error Handling

The library provides several error handling strategies:

1. **Throw on Error** (default): `.extract()` throws if path fails
2. **Return Null**: `.tryExtract()` returns null on failure
3. **Fallback Value**: `.extractOr(fallback)` returns fallback on failure
4. **Default Value**: `.defaultTo(value)` sets default before extraction
5. **Skip Errors**: Use try-catch blocks around extraction calls

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
```

## Best Practices

1. **Use Correct References** for different property types:
   - Document properties: `charIDToTypeID('Dcmn')`
   - Layer properties: `charIDToTypeID("Lyr ")`

2. **Use Factory Functions** for common patterns (`P.bounds()`, `P.textStyle()`)

3. **Use Correct Navigation Patterns**:
   - Text properties: `.object("textKey").list("textStyleRange")`
   - Layer extraction: Use `extractAllLayerNames()` and `extractLayerTuple()`

4. **Chain Transformations** for complex value processing

5. **Handle Errors Gracefully** with appropriate fallback strategies

6. **Use TypeScript Generics** for type safety: `.extract<number>(d)`

## TypeScript Configuration

Ensure your `tsconfig.json` targets ES3 for ExtendScript compatibility:

```json
{
  "compilerOptions": {
    "target": "es3",
    "module": "none",
    "outFile": "./scoring.jsx",
    "lib": ["es5"],
    "types": ["./photoshop.d.ts/dist/cc"]
  }
}
```

## Common Use Cases

### Test Scoring

Extract exact values for comparison against expected results with tolerance support.

### Document Analysis

Analyze document structure, layers, and properties for automated quality checks.

### Batch Processing

Extract metadata and properties from multiple documents for reporting.

### Skills Assessment

Evaluate candidate work against specific requirements with detailed feedback.

---

## Fixed Patterns Summary

### ✅ Correct ActionReference Patterns

```typescript
// For layer properties (bounds, textKey, filters, etc.)
const layerRef = new ActionReference();
layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
const layerDesc = executeActionGet(layerRef);

// For document properties (width, height, etc.)  
const docRef = new ActionReference();
docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
const docDesc = executeActionGet(docRef);

// For specific layer by index
const layerRef = new ActionReference();
layerRef.putIndex(charIDToTypeID("Lyr "), layerIndex);
const layerDesc = executeActionGet(layerRef);
```

### ✅ Correct Text Navigation

```typescript
// FIXED: Use textKey for text properties
P.textStyle('fontName', 'string', 0)  // Uses .object('textKey')

// FIXED: Direct textKey access
.object("textKey").list("textStyleRange").at(0).object("textStyle")
```

### ✅ Correct Layer Extraction

```typescript
// FIXED: Use specialized methods for layers
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
const layerTuple = ActionDescriptorPath.create().extractLayerTuple(3, "Missing");
const layerCount = ActionDescriptorPath.create().getLayerCount();
```

This API is designed specifically for precise, all-or-nothing evaluation scenarios like testing, where exact values matter more than fuzzy validation.