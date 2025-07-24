# ActionDescriptorNavigator V4.1

A powerful, type-safe LINQ-style framework for navigating Adobe Photoshop ActionDescriptor objects in ExtendScript. Designed specifically for automated design assessment and scoring systems.

## Table of Contents

- [Why This Framework?](#why-this-framework)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [LINQ-Style Operations](#linq-style-operations)
- [Common Scoring Patterns](#common-scoring-patterns)
- [Smart Context Detection](#smart-context-detection)
- [Debugging Fluent Chains](#debugging-fluent-chains)
- [Migration from Raw ActionDescriptor](#migration-from-raw-actiondescriptor)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Performance Guidelines](#performance-guidelines)
- [Troubleshooting](#troubleshooting)

## Why This Framework?

### The Problem with Raw ActionDescriptor

```javascript
// ❌ Raw ActionDescriptor - Complex, error-prone, hard to debug
var ref = new ActionReference();
ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
var desc = executeActionGet(ref);
var textKey = desc.getObjectValue(stringIDToTypeID('textKey'));
var textStyleRange = textKey.getList(stringIDToTypeID('textStyleRange'));
var firstRange = textStyleRange.getObjectValue(0);
var textStyle = firstRange.getObjectValue(stringIDToTypeID('textStyle'));
var fontName = textStyle.getString(stringIDToTypeID('fontName'));
ref = null; // Memory management
```

### The Solution with ActionDescriptorNavigator

```typescript
// ✅ Clean, safe, debuggable, fluent
const fontName = ActionDescriptorNavigator
    .forLayerByName("Header")
    .getObject('textKey')
    .getList('textStyleRange')
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .first()
    .getObject('textStyle')
    .getString('fontName');
```

### Key Benefits

- **🛡️ Crash-Proof**: Never throws null/undefined errors - uses sentinel pattern
- **🔗 Fluent**: LINQ-style chaining for readable, maintainable code
- **🎯 Smart**: Auto-detects nested structures (textStyleRange → textStyle)
- **🐛 Debuggable**: Add `.debug()` anywhere in chains to pinpoint issues
- **⚡ Performance**: Early termination, optimized for ExtendScript
- **📝 Type-Safe**: Full TypeScript support with intelligent code completion

## Quick Start

### 30-Second Example

```typescript
// Extract font information from a layer
const analysis = ActionDescriptorNavigator
    .forLayerByName("Header")
    .getObject('textKey')
    .getList('textStyleRange')
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            font: style.getString('fontName'),
            size: style.getDouble('fontSize'),
            bold: style.getBoolean('syntheticBold')
        };
    })
    .toArray();

console.log('Found fonts:', analysis);
```

### Compare with Your Current Approach

```typescript
// Your existing imperative style still works:
const layer = ActionDescriptorNavigator.forLayerByName("Header");
const textObj = layer.getObject('textKey');
const styleList = textObj.getList('textStyleRange');
const fontName = styleList.getObject(0).getObject('textStyle').getString('fontName');

// New fluent style for complex operations:
const fontName = layer.getObject('textKey').getList('textStyleRange')
    .asEnumerable().where({ fontName: 'Arial' }).first()
    .getObject('textStyle').getString('fontName');
```

## Installation

### 1. Add to Your Framework

```typescript
// In your ps-main.ts, after polyfills and ps.ts imports:
/// <reference path="ActionManager/ActionDescriptorNavigator.ts" />
/// <reference path="ActionManager/types.ts" />
```

### 2. File Structure

```
your-project/
├── ps-main.ts
├── ps.ts                           ← Your existing ActionManager functions
├── es5-polyfills.js               ← Your existing polyfills
└── ActionManager/
    ├── ActionDescriptorNavigator.ts ← Core framework
    └── types.ts                    ← TypeScript definitions
```

### 3. Dependencies

**Required (from your existing ps.ts):**
- `executeActionGet()`
- `stringIDToTypeID()` 
- `charIDToTypeID()`
- `typeIDToStringID()`

**Required (from your existing es5-polyfills.js):**
- `Object.keys()`
- `console` methods

## Basic Usage

### Navigation Fundamentals

```typescript
// Start with a layer
const layer = ActionDescriptorNavigator.forLayerByName("Header");
const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
const document = ActionDescriptorNavigator.forCurrentDocument();

// Navigate to nested objects
const textObj = layer.getObject('textKey');
const boundsObj = layer.getObject('bounds');
const colorObj = textStyle.getObject('color');

// Navigate to lists
const styleList = textObj.getList('textStyleRange');
const layersList = document.getList('layers');

// Extract values with type safety
const fontName = textStyle.getString('fontName');     // string
const fontSize = textStyle.getDouble('fontSize');     // number
const isBold = textStyle.getBoolean('syntheticBold'); // boolean
const fontCaps = textStyle.getEnumerated('fontCaps'); // string
```

### The Sentinel Pattern

**Never check for null/undefined - check sentinel values instead:**

```typescript
// ✅ Safe - check final result
const fontName = layer.getObject('textKey').getList('textStyleRange')
    .getObject(0).getObject('textStyle').getString('fontName');

if (fontName !== '') {  // Empty string = sentinel value
    $.writeln('Font found: ' + fontName);
} else {
    $.writeln('No font data available');
}

// ❌ Don't do this - sentinels prevent null errors
if (layer !== null && textObj !== null) {
    // Not needed - framework handles missing data gracefully
}
```

### Batch Property Extraction

```typescript
// Extract multiple properties at once
const layerInfo = layer.extract({
    name: 'getString',
    opacity: 'getDouble',
    visible: 'getBoolean',
    mode: 'getEnumerated'
});

const colorData = colorObj.extract({
    red: 'getDouble',
    green: 'getDouble',
    blue: 'getDouble'
});
```

## LINQ-Style Operations

### Converting to LINQ

```typescript
// Convert any list to LINQ-capable enumerable
const enumerable = styleList.asEnumerable();

// Chain operations fluently
const fonts = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .toArray();
```

### Filtering with where()

```typescript
// Object criteria - automatically searches nested textStyle objects
const arialStyles = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .toArray();

// Multiple criteria
const specificStyles = styleList
    .asEnumerable()
    .where({ 
        fontName: 'Arial', 
        fontSize: 24,
        syntheticBold: false 
    })
    .toArray();

// Function predicates for complex logic
const largeStyles = styleList
    .asEnumerable()
    .where(obj => {
        const style = obj.getObject('textStyle');
        return style.getDouble('fontSize') > 20;
    })
    .toArray();

// Exclusion with ! prefix
const nonArialStyles = styleList
    .asEnumerable()
    .where({ '!fontName': 'Arial' })
    .toArray();

// Wildcard patterns
const systemFonts = styleList
    .asEnumerable()
    .where({ fontName: '*System*' })  // Contains "System"
    .toArray();
```

### Projection with select()

```typescript
// Extract single properties
const fontNames = styleList
    .asEnumerable()
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .toArray();

// Create custom objects with your preferred value extraction methods
const fontData = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            name: style.getString('fontName'),      // ← Your preferred API
            size: style.getDouble('fontSize'),      // ← Type-safe extraction
            bold: style.getBoolean('syntheticBold') // ← Sentinel-safe
        };
    })
    .toArray();

// Complex transformations with calculations
const analysis = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        const size = style.getDouble('fontSize');
        return {
            font: style.getString('fontName'),
            sizeCategory: size > 24 ? 'large' : size > 16 ? 'medium' : 'small',
            weight: style.getBoolean('syntheticBold') ? 'bold' : 'normal'
        };
    })
    .toArray();
```

### Terminal Operations

```typescript
// Get first match (early termination for performance)
const firstArial = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .first();

// Check existence (early termination)
const hasArialFont = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .any();

// Count matches
const arialCount = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .count();

// Get all results
const allArialStyles = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .toArray();
```

## Common Scoring Patterns

### Font Compliance Checking

```typescript
// Check if layer uses required font
function checkFontCompliance(layerName, requiredFont) {
    const hasRequiredFont = ActionDescriptorNavigator
        .forLayerByName(layerName)
        .getObject('textKey')
        .getList('textStyleRange')
        .asEnumerable()
        .where({ fontName: requiredFont })
        .any();
        
    return {
        score: hasRequiredFont ? 1 : 0,
        feedback: hasRequiredFont ? 'Correct font used' : `Expected ${requiredFont}`
    };
}
```

### Size and Typography Analysis

```typescript
// Comprehensive text analysis for scoring
function analyzeTypography(layerName) {
    const typography = ActionDescriptorNavigator
        .forLayerByName(layerName)
        .getObject('textKey')
        .getList('textStyleRange')
        .asEnumerable()
        .select(obj => {
            const style = obj.getObject('textStyle');
            return {
                font: style.getString('fontName'),
                size: style.getDouble('fontSize'),
                bold: style.getBoolean('syntheticBold'),
                italic: style.getBoolean('syntheticItalic'),
                caps: style.getEnumerated('fontCaps'),
                range: {
                    from: obj.getInteger('from'),
                    to: obj.getInteger('to')
                }
            };
        })
        .toArray();
        
    return {
        styleCount: typography.length,
        fonts: typography.map(t => t.font),
        sizes: typography.map(t => t.size),
        hasConsistentSize: new Set(typography.map(t => t.size)).size === 1
    };
}
```

### Color Validation

```typescript
// Check color requirements
function validateColors(layerName, expectedRGB) {
    const colors = ActionDescriptorNavigator
        .forLayerByName(layerName)
        .getObject('textKey')
        .getList('textStyleRange')
        .asEnumerable()
        .select(obj => {
            const color = obj.getObject('textStyle').getObject('color');
            return {
                red: color.getDouble('red'),
                green: color.getDouble('green'),
                blue: color.getDouble('blue')
            };
        })
        .toArray();
        
    const hasCorrectColor = colors.some(color => 
        color.red === expectedRGB.red &&
        color.green === expectedRGB.green &&
        color.blue === expectedRGB.blue
    );
    
    return {
        score: hasCorrectColor ? 1 : 0,
        actualColors: colors,
        expectedColor: expectedRGB
    };
}
```

### Layout and Positioning

```typescript
// Validate layer positioning
function checkLayerPosition(layerName, expectedBounds) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const bounds = layer.getBounds();
    
    if (bounds.width === -1) {
        return { score: 0, feedback: 'Layer not found or has no bounds' };
    }
    
    const tolerance = 10; // pixels
    const isCorrectPosition = 
        Math.abs(bounds.left - expectedBounds.left) <= tolerance &&
        Math.abs(bounds.top - expectedBounds.top) <= tolerance;
        
    return {
        score: isCorrectPosition ? 1 : 0,
        actualBounds: bounds,
        expectedBounds: expectedBounds,
        feedback: isCorrectPosition ? 'Correct positioning' : 'Position adjustment needed'
    };
}
```

## Smart Context Detection

The framework automatically detects when you're working with textStyleRange lists and enables smart nested searching:

```typescript
// ✅ Smart - automatically searches textStyle.fontName
const arialStyles = textStyleRangeList
    .asEnumerable()
    .where({ fontName: 'Arial' })  // ← Looks inside nested textStyle objects
    .toArray();

// Compare with manual approach:
const arialStyles = textStyleRangeList
    .asEnumerable()
    .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial')
    .toArray();
```

### Supported Smart Contexts

- **textStyleRange**: Automatically searches nested `textStyle` objects
- **paragraphStyleRange**: Searches nested `paragraphStyle` objects
- **Generic lists**: Direct property search

## Debugging Fluent Chains

Add `.debug()` anywhere in your chains to see what's happening:

```typescript
const result = ActionDescriptorNavigator
    .forLayerByName("Header")
    .debug('found layer')          // ← "found layer: OK"
    .getObject('textKey')
    .debug('got text object')      // ← "got text object: OK"
    .getList('textStyleRange')
    .debug('got style list')       // ← "got style list: OK (3 items)"
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .debug('filtered styles')      // ← "filtered styles: Found 2 matches"
    .first()
    .debug('got first match');     // ← "got first match: OK"
```

**Debug Output Examples:**
- `"layer: OK"` - Object found successfully
- `"layer: SENTINEL (failed)"` - Object not found or error
- `"style list: OK (3 items)"` - List found with 3 items
- `"filtered styles: Found 2 matches"` - 2 items passed filter
- `"filtered styles: No matches"` - No items passed filter

*Output appears in ExtendScript Toolkit console*

## Migration from Raw ActionDescriptor

### Before (Raw ActionDescriptor)

```javascript
var ref = new ActionReference();
ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
var layerDesc = executeActionGet(ref);
var textKey = layerDesc.getObjectValue(stringIDToTypeID('textKey'));
var textStyleRange = textKey.getList(stringIDToTypeID('textStyleRange'));

var fonts = [];
for (var i = 0; i < textStyleRange.count; i++) {
    var range = textStyleRange.getObjectValue(i);
    var textStyle = range.getObjectValue(stringIDToTypeID('textStyle'));
    var fontName = textStyle.getString(stringIDToTypeID('fontName'));
    if (fontName === 'Arial') {
        fonts.push(fontName);
    }
}
ref = null;
```

### After (ActionDescriptorNavigator)

```typescript
const fonts = ActionDescriptorNavigator
    .forCurrentLayer()
    .getObject('textKey')
    .getList('textStyleRange')
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .toArray();
```

### Migration Strategy

1. **Start with factory methods**: Replace `executeActionGet()` calls with `forLayerByName()`, `forCurrentLayer()`
2. **Replace object navigation**: Use `getObject()` and `getList()` instead of manual type ID conversion
3. **Add LINQ gradually**: Start with `.asEnumerable().toArray()`, then add `where()` and `select()`
4. **Remove manual memory management**: Framework handles ActionReference cleanup

## Architecture Overview

### Core Classes

```
ActionDescriptorNavigator          (Root navigation)
├── getObject() → ActionDescriptorNavigator
├── getList() → ActionListNavigator
└── getString(), getDouble(), etc.

ActionListNavigator               (Collection navigation)  
├── asEnumerable() → Enumerable
├── getObject(index)
└── getCount()

Enumerable                        (LINQ operations)
├── where() → Enumerable
├── select() → EnumerableArray
├── first(), any(), count()
└── toArray()

EnumerableArray                   (Projected results)
├── where() → EnumerableArray
├── select() → EnumerableArray  
└── toArray()
```

### Memory Management

- **Automatic cleanup**: ActionReference objects properly disposed
- **Sentinel pattern**: No memory leaks from null reference errors
- **ES3 compatible**: Works in ExtendScript's limited environment

### Context Detection

The framework automatically detects list types:
- `textStyleRange` → Enables nested `textStyle` searching
- `paragraphStyleRange` → Enables nested `paragraphStyle` searching  
- Other lists → Direct property searching

## API Reference

### Static Factory Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `forCurrentLayer()` | Get currently selected layer | `ActionDescriptorNavigator` |
| `forCurrentDocument()` | Get active document | `ActionDescriptorNavigator` |
| `forLayerByName(name)` | Find layer by name | `ActionDescriptorNavigator` |

### Navigation Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `getObject(key)` | Navigate to nested object | `ActionDescriptorNavigator` |
| `getList(key)` | Navigate to list | `ActionListNavigator` |

### Value Extraction

| Method | Returns | Sentinel Value |
|--------|---------|----------------|
| `getString(key)` | `string` | `""` |
| `getDouble(key)` | `number` | `-1` |
| `getUnitDouble(key)` | `number` | `-1` |
| `getInteger(key)` | `number` | `-1` |
| `getBoolean(key)` | `boolean` | `false` |
| `getEnumerated(key)` | `string` | `""` |

### LINQ Operations

| Method | Purpose | Performance |
|--------|---------|-------------|
| `where(criteria)` | Filter items | O(n) |
| `select(selector)` | Project/transform | O(n) |
| `first()` | Get first match | O(1) to O(n), early termination |
| `any()` | Check existence | O(1) to O(n), early termination |
| `count()` | Count matches | O(n) |
| `toArray()` | Get all results | O(n) |

### Utility Methods

| Method | Purpose | Use Case |
|--------|---------|----------|
| `hasKey(key)` | Check property existence | Conditional logic |
| `getBounds()` | Get layer bounds | Layout analysis |
| `extract(map)` | Batch property extraction | Multiple values |
| `debug(label)` | Add debug output | Troubleshooting |

## Performance Guidelines

### Early Termination

Use these methods when you only need to check existence or get the first result:

```typescript
// ✅ Fast - stops at first match
const hasArial = styleList.asEnumerable().where({ fontName: 'Arial' }).any();
const firstArial = styleList.asEnumerable().where({ fontName: 'Arial' }).first();

// ❌ Slow - processes all items
const hasArial = styleList.asEnumerable().where({ fontName: 'Arial' }).toArray().length > 0;
```

### Minimize ActionDescriptor Calls

```typescript
// ✅ Good - extract once, transform in memory
const fontData = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            name: style.getString('fontName'),
            size: style.getDouble('fontSize'),
            bold: style.getBoolean('syntheticBold')
        };
    })
    .toArray();

// ❌ Slow - multiple ActionDescriptor calls
const fontNames = styleList.asEnumerable().select(obj => obj.getObject('textStyle').getString('fontName')).toArray();
const fontSizes = styleList.asEnumerable().select(obj => obj.getObject('textStyle').getDouble('fontSize')).toArray();
```

### Batch Operations

```typescript
// ✅ Good - batch extraction
const layerData = layer.extract({
    name: 'getString',
    opacity: 'getDouble',
    visible: 'getBoolean'
});

// ❌ Inefficient - individual calls
const name = layer.getString('name');
const opacity = layer.getDouble('opacity');
const visible = layer.getBoolean('visible');
```

## Troubleshooting

### Common Issues

**Q: Getting empty results when I expect data**
```typescript
// Check if you're looking in the right place
const result = layer
    .debug('layer loaded')
    .getObject('textKey')
    .debug('text object')
    .getList('textStyleRange')
    .debug('style list')
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .debug('after filter')
    .toArray();
```

**Q: Where() not finding textStyle properties**
```typescript
// ✅ Correct - smart context detection
const arialStyles = textStyleRangeList
    .asEnumerable()
    .where({ fontName: 'Arial' })  // Automatically searches textStyle

// ❌ Wrong - searching wrong level
const arialStyles = textStyleRangeList
    .asEnumerable()
    .where(obj => obj.getString('fontName') === 'Arial')  // fontName not in textStyleRange
```

**Q: Getting -1 or empty string results**
```typescript
// These are sentinel values indicating missing/failed data
const fontSize = textStyle.getDouble('fontSize');
if (fontSize === -1) {
    $.writeln('Font size not available');
}

const fontName = textStyle.getString('fontName');
if (fontName === '') {
    $.writeln('Font name not available');
}
```

**Q: Layer not found**
```typescript
const layer = ActionDescriptorNavigator.forLayerByName("Header");
if (layer.isSentinel) {
    $.writeln('Layer "Header" not found');
    // Check layer name spelling, case sensitivity
}
```

### Debug Patterns

**Add debug to every step:**
```typescript
const result = ActionDescriptorNavigator
    .forLayerByName("Header")
    .debug('1. layer')
    .getObject('textKey')
    .debug('2. textKey')
    .getList('textStyleRange')
    .debug('3. styleRange')
    .asEnumerable()
    .debug('4. enumerable')
    .where({ fontName: 'Arial' })
    .debug('5. filtered')
    .first()
    .debug('6. first result');
```

**Check intermediate results:**
```typescript
const layer = ActionDescriptorNavigator.forLayerByName("Header");
$.writeln('Layer found: ' + !layer.isSentinel);

const textObj = layer.getObject('textKey');
$.writeln('Text object found: ' + !textObj.isSentinel);

const styleList = textObj.getList('textStyleRange');
$.writeln('Style list count: ' + styleList.getCount());
```

### Type Definitions

For full TypeScript support, ensure your `types.ts` file is properly referenced:

```typescript
/// <reference path="ActionManager/types.ts" />

// You'll get full intellisense for:
const analysis: FontDataProjection[] = styleList
    .asEnumerable()
    .select(obj => ({
        name: obj.getObject('textStyle').getString('fontName'),
        size: obj.getObject('textStyle').getDouble('fontSize'),
        bold: obj.getObject('textStyle').getBoolean('syntheticBold')
    }))
    .toArray();
```

---

**Ready to transform your Photoshop scoring scripts?** Start with the basic navigation patterns and gradually add LINQ operations as you become comfortable with the fluent syntax. The framework is designed to work alongside your existing code, so you can migrate incrementally.

For detailed function reference, see the [Technical Reference Documentation](./TECHNICAL_REFERENCE.md).