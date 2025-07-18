# ActionDescriptor Navigation Framework

A robust, scoring-optimized framework for navigating Adobe Photoshop's ActionDescriptor structures in ExtendScript. Designed for automated assessment and grading workflows with consistent error handling and predictable return values.

## Features

- **Search-First Navigation**: Robust pattern matching instead of brittle index-based access
- **Scoring Optimized**: Consistent sentinel values (-1, "", false) for reliable answer assignment
- **ExtendScript Compatible**: No modern JavaScript features, proper memory management
- **Fluent API**: Chainable methods for readable code
- **Type Safe**: Full TypeScript support with exhaustive error checking
- **Memory Safe**: Proper ActionReference cleanup, no shared mutable state

## Core Components

### ActionDescriptorNavigator
Core navigation engine for ActionDescriptor objects with proper memory management.

```typescript
// Factory methods (handle ActionReference cleanup automatically)
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const docNav = ActionDescriptorNavigator.forCurrentDocument();
const specificLayer = ActionDescriptorNavigator.forLayerByIndex(3);

// Safe navigation (returns new sentinel instances, never null)
const textNav = layerNav.object('textKey');                    // New navigator or sentinel
const styleList = textNav.list('textStyleRange');             // New list navigator or sentinel

// Value extraction with guaranteed types
const layerName = layerNav.getValue('name', 'string');         // "" if missing
const opacity = layerNav.getValue('opacity', 'double');        // -1 if missing
const visible = layerNav.getValue('visible', 'boolean');       // false if missing
```

### PathAccessor (P Factory)
Fluent interface for complex navigation patterns with search-first methods.

```typescript
import { P } from './PathAccessor';

// Basic property access
const layerName = P.val('name', 'string').extract(layerDesc);
const layerOpacity = P.val('opacity', 'double').extract(layerDesc);

// Search-based access (recommended - robust against document variations)
const arialSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
const blurRadius = P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);
const headerLayer = P.findLayerByName('header').extract(docDesc);

// Bounds with automatic width/height calculation and unit conversion
const widthPixels = P.bounds('width').extract(layerDesc);      // Calculated: right - left
const heightPixels = P.bounds('height').extract(layerDesc);    // Calculated: bottom - top
const leftPosition = P.bounds('left').extract(layerDesc);
```

### ListExtractors
For processing ActionList objects with single transformer pattern.

```typescript
import { ListValueExtractor } from './ListExtractors';

// Create extractor with optional transformer
const sizeExtractor = new ListValueExtractor(pathToList, 'textStyle.size', 'double');
const roundedExtractor = sizeExtractor.round(1); // Chain transformations

// Extract operations (all return arrays or sentinel values)
const allSizes = sizeExtractor.extractAll(layerDesc);           // [12, 14, 16] or []
const firstSize = sizeExtractor.extractAt(layerDesc, 0);        // 12 or -1
const largeSize = sizeExtractor.findFirst(layerDesc, function(size) { 
    return size > 20; 
});                                                             // 24 or -1
```

## API Reference

### Search-First Methods (Recommended)

All search methods are static methods on `ActionDescriptorPath` and return appropriate sentinel values when not found:

#### Text Style Search
```typescript
// Search by font name (case-sensitive, exact match)
P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);           // Font size or -1
P.textStyleByFont('Arial-BoldMT', 'tracking', 'double').extract(layerDesc); // Tracking or -1
P.textStyleByFont('Helvetica', 'color', 'string').extract(layerDesc);      // Color or ""

// Search by font size
P.textStyleBySize(24, 'fontName', 'string').extract(layerDesc);            // Font name or ""
P.textStyleBySize(12, 'tracking', 'double').extract(layerDesc);            // Tracking or -1
```

#### Filter Search
```typescript
// Search by exact filter name
P.filterByName('Gaussian Blur', 'radius', 'double').extract(layerDesc);    // Blur radius or -1
P.filterByName('Drop Shadow', 'distance', 'double').extract(layerDesc);    // Shadow distance or -1
P.filterByName('Outer Glow', 'blur', 'double').extract(layerDesc);         // Glow size or -1
```

#### Layer Search
```typescript
// Search by name pattern (returns layer name, not navigator)
P.findLayerByName('header').extract(docDesc);                              // "header" or ""
P.findLayerByName(/background/i).extract(docDesc);                         // "Background" or ""
```

### Specialized Extraction Methods

#### Bounds with Calculated Dimensions
```typescript
const bounds = layerNav.getBounds();
// Returns: { left: 100, top: 50, right: 300, bottom: 200, width: 200, height: 150 }
// Width/height calculated from right-left, bottom-top
// Returns all -1 values if no bounds available
```

#### Text Properties (Corrected Property Access)
```typescript
const textProps = layerNav.getTextProperties();
// Returns: { content: "Hello World", fontName: "Arial", fontSize: 12 }
// Uses correct 'text' property for content (not 'textKey')
// Returns sentinel values ("", "", -1) if no text available
```

#### Batch Value Extraction
```typescript
const properties = layerNav.getValuesAsObject({
    name: { key: 'name', type: 'string' },
    opacity: { key: 'opacity', type: 'double' },
    visible: { key: 'visible', type: 'boolean' }
});
// Guaranteed to return object with all properties set to values or sentinels
```

### Transformations
```typescript
// Numeric transformations
P.val('size', 'double').round(1).extract(layerDesc);                       // Round to 1 decimal
P.val('opacity', 'double').floor().extract(layerDesc);                     // Floor value
P.bounds('width').toPixels('pt', 72).extract(layerDesc);                   // Convert points to pixels
P.val('ratio', 'double').toPercentage().extract(layerDesc);                // Multiply by 100

// Chained transformations
P.val('size', 'double').toPixels('pt', 72).round(2).extract(layerDesc);
```

### Legacy Index-Based Access
```typescript
// Still available but brittle - prefer search methods above
P.textStyle('size', 'double', 0).extract(layerDesc);                       // First text style
P.filter('radius', 'double', 1).extract(layerDesc);                        // Second filter
```

## Sentinel Value System

The framework returns predictable values for missing or invalid data:

| Type | Sentinel Value | Usage |
|------|----------------|-------|
| `string` | `""` | Layer names, font names, text content |
| `enumerated` | `""` | Blend modes, color modes |
| `integer` | `-1` | Layer IDs, counts, indices |
| `double` | `-1` | Sizes, positions, opacity values |
| `boolean` | `false` | Visibility, effect enabled states |
| Objects | Sentinel objects | Bounds, text properties with all sentinel fields |
| Arrays | `[]` | List extractions, layer names |

## Error Handling Philosophy

**No exceptions are thrown** during navigation or extraction. All methods gracefully degrade:

```typescript
// These patterns never crash, always return predictable values for scoring
const fontSize = P.val('missingProperty', 'double').extract(layerDesc);    // -1
const badFilter = P.filterByName('NonExistent', 'radius', 'double').extract(layerDesc); // -1
const deepMissing = P.obj('missing').obj('deep').val('prop', 'string').extract(layerDesc); // ""
const outOfBounds = P.list('items').at(999).val('prop', 'string').extract(layerDesc); // ""
```

## Memory Management

### ActionReference Cleanup
All factory methods handle ActionReference cleanup automatically using try/finally patterns:

```typescript
// Automatically cleaned up
const nav = ActionDescriptorNavigator.forCurrentLayer();        // ✅ Safe
const doc = ActionDescriptorNavigator.forCurrentDocument();     // ✅ Safe
const layer = ActionDescriptorNavigator.forLayerByIndex(3);     // ✅ Safe

// Manual ActionReference usage pattern (if needed):
let ref: ActionReference | null = null;
try {
    ref = new ActionReference();
    // ... use ref
} finally {
    ref = null; // Important for ExtendScript memory management
}
```

### No Shared Mutable State
```typescript
// Each call returns new instances - no shared state issues
const sentinel1 = ActionDescriptorNavigator.createSentinel();
const sentinel2 = ActionDescriptorNavigator.createSentinel();
// sentinel1 and sentinel2 are separate objects
```

## ExtendScript Compatibility

### Type Declarations
The framework includes proper ExtendScript type declarations:

```typescript
// ActionReference declared as constructable class
var ActionReference: {
    new(): ActionReference;
    prototype: ActionReference;
};

// Global ActionManager functions available
stringIDToTypeID(stringID: string): number;
charIDToTypeID(charID: string): number;
executeActionGet(ref: ActionReference): ActionDescriptor;
```

### No Modern JavaScript
- No arrow functions (`function() {}` instead of `=>`)
- No `Array.from()` (manual array building)
- No `const`/`let` in loops that might cause issues
- Compatible with Photoshop CS6+ ActionManager

## Performance Optimizations

### Efficient Patterns
```typescript
// ✅ Good: Single extraction
const name = P.val('name', 'string').extract(layerDesc);

// ✅ Better: Batch extraction for multiple values
const props = nav.getValuesAsObject({
    name: { key: 'name', type: 'string' },
    opacity: { key: 'opacity', type: 'double' }
});

// ✅ Best: Search-first for unknown structures
const fontSize = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
```

### Input Validation
All methods validate inputs before processing:

```typescript
// These calls return sentinels immediately without processing
P.val('', 'string').extract(layerDesc);              // "" (empty key)
P.obj(null).val('prop', 'string').extract(layerDesc); // "" (null key)
P.textStyleByFont('', 'size', 'double').extract(layerDesc); // -1 (empty font name)
```

## Common Patterns

### Scoring Script Pattern
```typescript
// Reliable pattern for answer assignment - no null checks needed
answers.layerName = P.val('name', 'string').extract(layerDesc);
answers.fontSizePoints = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc);
answers.hasDropShadow = P.filterByName('Drop Shadow', 'enabled', 'boolean').extract(layerDesc);
answers.layerWidthPixels = P.bounds('width').extract(layerDesc);

// Boolean checks with sentinel awareness
answers.usedArial = P.textStyleByFont('Arial', 'size', 'double').extract(layerDesc) > 0;
answers.hasCorrectOpacity = P.val('opacity', 'double').extract(layerDesc) >= 50;
```

### Safe Deep Navigation
```typescript
// Chain safely without null checks
const textTracking = P.obj('textKey')
    .list('textStyleRange')
    .at(0)
    .obj('textStyle')
    .val('tracking', 'double')
    .defaultTo(0)
    .extract(layerDesc);
```

### Layer Iteration
```typescript
// Safe layer enumeration
const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
for (let i = 0; i < layerNames.length; i++) {
    const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
    const name = layerNav.getValue('name', 'string');
    const opacity = layerNav.getValue('opacity', 'double');
    console.log('Layer: ' + name + ', Opacity: ' + opacity);
}
```

## File Structure & Dependencies

```
├── types.ts                    # Type definitions and ExtendScript globals
├── ActionDescriptorNavigator.ts # Core navigation engine  
├── ListExtractors.ts           # List processing utilities
├── PathAccessor.ts             # Fluent API and search methods
├── UsageExamples.ts            # Comprehensive examples
└── SampleScoringScript.ts      # Complete scoring example
```

**No external dependencies** - framework uses only:
- ExtendScript's built-in ActionManager functions
- Global type declarations in `types.ts`
- Standard ExtendScript object model

## Migration Notes

When integrating into existing frameworks:

1. **Remove from `types.ts`**: ActionManager function declarations and global interfaces
2. **Keep from `types.ts`**: ValueType, interfaces, and core type definitions  
3. **Import mapping**: Framework should provide ActionManager functions globally
4. **Memory management**: ActionReference cleanup patterns are already optimized

## Version Compatibility

- **Photoshop**: CS6+ (ActionManager API)
- **ExtendScript**: All versions with ActionDescriptor support
- **Localization**: Compatible with non-English Photoshop versions
- **TypeScript**: 3.0+ for development (compiles to ES3-compatible ExtendScript)