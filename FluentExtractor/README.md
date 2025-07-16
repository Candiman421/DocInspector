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
// Get document reference
const r = new ActionReference();
r.putEnumerated(
  stringIDToTypeID("layer"),
  stringIDToTypeID("ordinal"),
  stringIDToTypeID("targetEnum")
);
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
    .object("text")
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
// Extract exactly 4 bullet point styles as individual variables
const [bullet1, bullet2, bullet3, bullet4] = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAsTuple("paragraphStyle.listStyleType", "enumerated", 4, "plain")
  .extractAll<[string, string, string, string]>(d);

// Now you can assign each to specific answer properties
answers.firstBulletStyle = bullet1; // Did they make item 1 a bullet?
answers.secondBulletStyle = bullet2; // Did they make item 2 a bullet?
answers.thirdBulletStyle = bullet3; // Did they make item 3 numbered?
answers.fourthBulletStyle = bullet4; // Did they make item 4 numbered?

// Extract 3 layer names as tuple
const [layer1, layer2, layer3] = ActionDescriptorPath.create()
  .list("layers")
  .extractAsTuple("name", "string", 3, "Unnamed")
  .extractAll<[string, string, string]>(d);

// Extract font sizes with transformation
const [fontSize1, fontSize2, fontSize3] = ActionDescriptorPath.create()
  .list("layers")
  .extractAsTuple("text.textStyleRange.0.textStyle.sizeKey", "double", 3, 12.0)
  .round(1)
  .extractAll<[number, number, number]>(d);
```

### List Extraction Methods

```typescript
// Extract fixed number as tuple
.extractAsTuple<T>(subPath, valueType, count, fillValue?)

// Extract exactly N items with padding
.extractExactly<T>(subPath, valueType, count, defaultValue?)

// Extract all items (variable length)
.extractAll<T>(subPath, valueType, options?)

// Extract items matching condition
.extractWhere<T>(subPath, valueType, predicate, options?)

// Extract first matching item
.extractFirst<T>(subPath, valueType, predicate?, options?)
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

### Extract All as Object (Dynamic Destructuring)

```typescript
// Extract all bullet points (unknown quantity) as object
const bulletStyles = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAllAsObject("paragraphStyle.listStyleType", "enumerated", "bullet")
  .extractAll<Record<string, string>>(d);

// Result: { bullet1: "bullet", bullet2: "numbered", bullet3: "bullet" }
// Destructure with defaults:
const {
  bullet1 = "none",
  bullet2 = "none",
  bullet3 = "none",
  bullet4 = "none",
} = bulletStyles;

// Or spread into answer object:
const answers = {
  ...bulletStyles, // Adds bullet1, bullet2, bullet3, etc.
  bulletCount: Object.keys(bulletStyles).length,
};
```

### Extract All with Minimum Guarantee

```typescript
// Extract all layer names, ensure at least 3 exist
const layerNames = ActionDescriptorPath.create()
  .list("layers")
  .extractAllWithMinimum("name", "string", 3, "Missing Layer")
  .extractAll<string>(d);

// If document has 2 layers: ["Layer 1", "Layer 2", "Missing Layer"]
// If document has 5 layers: ["Layer 1", "Layer 2", "Layer 3", "Layer 4", "Layer 5"]

// Destructure with confidence:
const [backgroundLayer, textLayer, effectsLayer, ...extraLayers] = layerNames;
```

### Extract All Up To Maximum

```typescript
// Extract font names, but limit to first 6 layers
const fontNames = ActionDescriptorPath.create()
  .list("layers")
  .extractAllUpTo("text.textStyleRange.0.textStyle.fontName", "string", 6)
  .extractAll<string>(d);

// Result: ["Arial", "Helvetica", "Times", "Courier", "Georgia", "Verdana"] (max 6)
```

### Extract All as Dynamic Tuple

```typescript
// Extract all filter brightness values as tuple (up to 8, pad with 0)
const allBrightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .extractAllAsDynamicTuple("filter.brightness", "integer", 8, 0)
  .extractAll<number>(d);

// Can destructure unknown quantity (padded to 8):
const [bright1, bright2, bright3, bright4, bright5, bright6, bright7, bright8] =
  allBrightness;

// Or extract first few and rest:
const [primaryBright, secondaryBright, ...otherBrightness] = allBrightness;
```

### Extract with Metadata

```typescript
// Extract all layer names with metadata
const layerMetadata = ActionDescriptorPath.create()
  .list("layers")
  .extractAll("name", "string")
  .extractAllWithMetadata<string>(d);

// Result: {
//   values: ["Background", "Text", "Effects"],
//   count: 3,
//   indices: [0, 1, 2],
//   isEmpty: false,
//   hasMinimum: (min) => count >= min
// }

const hasEnoughLayers = layerMetadata.hasMinimum(3);
const [firstLayer, secondLayer, thirdLayer] = layerMetadata.values;
```

## Mixed Known/Unknown Extraction

Handle scenarios with both fixed requirements and variable elements:

```typescript
// Test requires exactly 3 main layers + any number of additional layers

// Extract first 3 layers (known requirement)
const [mainLayer1, mainLayer2, mainLayer3] = ActionDescriptorPath.create()
  .list("layers")
  .extractAsTuple("name", "string", 3, "Missing Layer")
  .extractAll<[string, string, string]>(d);

// Extract all additional layers (unknown quantity)
const additionalLayers = ActionDescriptorPath.create()
  .list("layers")
  .extractAll("name", "string")
  .extractAll<string>(d)
  .slice(3); // Skip first 3

// Extract all bullet points (unknown quantity) but ensure at least 2
const allBulletPoints = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAllWithMinimum(
    "paragraphStyle.listStyleType",
    "enumerated",
    2,
    "plain"
  )
  .extractAll<string>(d);

// Take first 2 as required, rest as bonus
const [requiredBullet1, requiredBullet2, ...bonusBullets] = allBulletPoints;

// Answer assignment
const answers = {
  // Fixed requirements
  mainLayer1Name: mainLayer1,
  mainLayer2Name: mainLayer2,
  mainLayer3Name: mainLayer3,

  // Variable elements
  additionalLayerNames: additionalLayers,
  additionalLayerCount: additionalLayers.length,

  // Required + bonus
  firstBulletPoint: requiredBullet1,
  secondBulletPoint: requiredBullet2,
  bonusBulletPoints: bonusBullets,
  totalBulletPoints: allBulletPoints.length,
};
```

## Dynamic List Methods

```typescript
// Extract all as object with numbered keys
.extractAllAsObject<T>(subPath, valueType, keyPrefix?, options?)

// Extract all with minimum count guarantee
.extractAllWithMinimum<T>(subPath, valueType, minCount, defaultValue?, options?)

// Extract all up to maximum count
.extractAllUpTo<T>(subPath, valueType, maxCount, options?)

// Extract all as dynamic tuple (padded to maxCount)
.extractAllAsDynamicTuple<T>(subPath, valueType, maxCount?, defaultValue?, options?)

// Extract with metadata (count, indices, validation methods)
.extractAllWithMetadata<T>(subPath, valueType, options?)
```

## Real-World Testing Scenarios

### Scenario 1: "At least 2 bullet points, don't care about total"

```typescript
const bulletStyles = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAllWithMinimum(
    "paragraphStyle.listStyleType",
    "enumerated",
    2,
    "plain"
  )
  .extractAll<string>(d);

const [bullet1, bullet2, ...extraBullets] = bulletStyles;

answers.firstBulletStyle = bullet1; // Required
answers.secondBulletStyle = bullet2; // Required
answers.extraBulletStyles = extraBullets; // Bonus points
answers.totalBulletCount = bulletStyles.length;
```

### Scenario 2: "Extract all layer names, assign to dynamic properties"

```typescript
const layerObject = ActionDescriptorPath.create()
  .list("layers")
  .extractAllAsObject("name", "string", "layer")
  .extractAll<Record<string, string>>(d);

// Spreads to: layer1, layer2, layer3, etc.
const answers = {
  ...layerObject,
  layerCount: Object.keys(layerObject).length,
  hasMinimumLayers: Object.keys(layerObject).length >= 3,
};
```

### Scenario 3: "Up to 5 font sizes, but could be less"

```typescript
const fontSizes = ActionDescriptorPath.create()
  .list("layers")
  .extractAllUpTo("text.textStyleRange.0.textStyle.sizeKey", "double", 5)
  .round(1)
  .extractAll<number>(d);

const answers = {
  primaryFontSize: fontSizes[0] || 12,
  secondaryFontSize: fontSizes[1] || 12,
  tertiaryFontSize: fontSizes[2] || 12,
  additionalFontSizes: fontSizes.slice(3),
  fontSizeCount: fontSizes.length,
  hasVariedSizes: fontSizes.length > 1,
};
```

This approach gives you maximum flexibility for handling unknown quantities while still being able to destructure and assign to specific answer properties!

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
  const r = new ActionReference();
  r.putEnumerated(
    stringIDToTypeID("document"),
    stringIDToTypeID("ordinal"),
    stringIDToTypeID("targetEnum")
  );
  const d = executeActionGet(r);

  return {
    // Document properties
    documentWidth: P.bounds("width").extract<number>(d),
    documentHeight: P.bounds("height").extract<number>(d),

    // Text properties
    textContent: P.textStyle("text", "string", 0)
      .defaultTo("")
      .extract<string>(d),
    fontFamily: P.textStyle("fontName", "string", 0)
      .defaultTo("Unknown")
      .extract<string>(d),
    fontSize: P.textStyle("sizeKey", "double", 0)
      .round(1)
      .defaultTo(12)
      .extract<number>(d),

    // Filter properties
    brightnessValue: P.filter("brightness", "integer", 0)
      .defaultTo(0)
      .extract<number>(d),
    contrastValue: P.filter("contrast", "integer", 0)
      .defaultTo(0)
      .extract<number>(d),

    // List properties
    allLayerNames: ActionDescriptorPath.create()
      .list("layers")
      .extractAll("name", "string")
      .skipErrors("Unnamed")
      .extractAll<string>(d),

    // Calculated properties
    averageOpacity: (() => {
      const opacities = ActionDescriptorPath.create()
        .list("layers")
        .extractAll("opacity", "double")
        .toPercentage()
        .skipErrors(100)
        .extractAll<number>(d);
      return opacities.reduce((sum, op) => sum + op, 0) / opacities.length;
    })(),

    hasArialFont:
      ActionDescriptorPath.create()
        .list("layers")
        .extractFirst("text.textStyleRange.0.textStyle.fontName", "string")
        .extractFirst<string>(d, (font) => font === "Arial") !== null,
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
  .object("text")
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
5. **Skip Errors**: `.skipErrors()` on lists continues processing

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
  .object("layerEffects")
  .value("opacity", "double")
  .toPercentage()
  .extract<number>(d);
```

## Best Practices

1. **Use Factory Functions** for common patterns (`P.bounds()`, `P.textStyle()`)
2. **Chain Transformations** for complex value processing
3. **Handle Errors Gracefully** with appropriate fallback strategies
4. **Extract Lists Safely** with `.skipErrors()` when needed
5. **Use TypeScript Generics** for type safety: `.extract<number>(d)`

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

This API is designed specifically for precise, all-or-nothing evaluation scenarios like testing, where exact values matter more than fuzzy validation.
