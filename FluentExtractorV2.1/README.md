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

// Basic property access (requires ActionDescriptor from navigator)
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
// Note: For P.extract(), you need the actual ActionDescriptor, but navigator.desc is private
// Most P methods work best with specific layer descriptors

// Search-based access (some methods work independently)
const layerName = P.findLayerByName('TargetTest').extract(null as any); // Works independently
const headerLayer = P.findLayerByName(/header/i).extract(null as any);  // Uses internal layer search

// Bounds with automatic width/height calculation and unit conversion
// (Requires actual ActionDescriptor from layer)
const bounds = layerNav.getBounds(); // Use navigator method directly
// Width/height calculated: right - left, bottom - top
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

## Targeting Layers by Name

### Method 1: Direct Layer Search (Recommended)
```typescript
// Search for layer by exact name
function getLayerByName(targetName: string): ActionDescriptorNavigator {
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    for (let i = 0; i < layerNames.length; i++) {
        if (layerNames[i] === targetName) {
            return ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        }
    }
    
    return ActionDescriptorNavigator.createSentinel(); // Returns sentinel if not found
}

// Usage:
const targetLayer = getLayerByName("TargetTest");
const layerExists = targetLayer.getValue('name', 'string') !== ""; // Check if found
const opacity = targetLayer.getValue('opacity', 'double'); // -1 if not found
```

### Method 2: Pattern Matching
```typescript
// Find layer by partial name match (case-insensitive)
function findLayerByPattern(namePattern: string): ActionDescriptorNavigator {
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    for (let i = 0; i < layerNames.length; i++) {
        const layerName = layerNames[i].toLowerCase();
        if (layerName.indexOf(namePattern.toLowerCase()) >= 0) {
            return ActionDescriptorNavigator.forLayerByIndex(i + 1);
        }
    }
    
    return ActionDescriptorNavigator.createSentinel();
}

// Usage:
const headerLayer = findLayerByPattern("header");    // Finds "Header", "header_bg", etc.
const targetLayer = findLayerByPattern("target");    // Finds "TargetTest", "Target Layer", etc.
```

### Method 3: Using Built-in Search
```typescript
// The P.findLayerByName() method works independently of descriptors
const layerName = P.findLayerByName("TargetTest").extract(null as any); // "TargetTest" or ""
const headerLayerName = P.findLayerByName(/header/i).extract(null as any); // First match or ""

// Note: This only returns the layer name, not a navigator to the layer
```

## API Reference

### Search-First Methods (Recommended)

All search methods are static methods on `ActionDescriptorPath` and return appropriate sentinel values when not found:

#### Text Style Search
```typescript
// Requires actual ActionDescriptor from layer
const layerNav = ActionDescriptorNavigator.forLayerByIndex(1);
// For these methods, you'd need access to the layer's ActionDescriptor
// Currently the navigator's desc property is private

// Alternative: Use navigator methods directly
const textNav = layerNav.object('textKey');
const styleList = textNav.list('textStyleRange');
const firstStyle = styleList.getObject(0).object('textStyle');
const fontName = firstStyle.getValue('fontName', 'string');     // Font name or ""
const fontSize = firstStyle.getValue('size', 'double');         // Font size or -1
```

#### Filter Search
```typescript
// Search for effects in layer (requires proper effect navigation)
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
// Effects searching requires navigating to layer effects structures
// Implementation depends on specific layer effect organization
```

### Specialized Extraction Methods

#### Bounds with Calculated Dimensions
```typescript
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const bounds = layerNav.getBounds();
// Returns: { left: 100, top: 50, right: 300, bottom: 200, width: 200, height: 150 }
// Width/height calculated from right-left, bottom-top
// Returns all -1 values if no bounds available
```

#### Text Properties (Corrected Property Access)
```typescript
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const textProps = layerNav.getTextProperties();
// Returns: { content: "Hello World", fontName: "Arial", fontSize: 12 }
// Uses correct 'text' property for content (not 'textKey')
// Returns sentinel values ("", "", -1) if no text available
```

#### Batch Value Extraction
```typescript
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const properties = layerNav.getValuesAsObject({
    name: { key: 'name', type: 'string' },
    opacity: { key: 'opacity', type: 'double' },
    visible: { key: 'visible', type: 'boolean' }
});
// Guaranteed to return object with all properties set to values or sentinels
```

### Transformations
```typescript
// Note: Transformations work with P factory methods when you have ActionDescriptor access
// For most scoring scenarios, use navigator methods directly:

const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const opacity = layerNav.getValue('opacity', 'double');
const opacityPercent = opacity >= 0 ? opacity : -1; // Manual percentage conversion

// For unit conversions, use the navigator's specialized methods:
const bounds = layerNav.getBounds(); // Already calculated in pixels
```

### Legacy Index-Based Access
```typescript
// Still available through navigator methods
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const textNav = layerNav.object('textKey');
const styleList = textNav.list('textStyleRange');
const firstStyle = styleList.getObject(0); // First text style (brittle)
const secondStyle = styleList.getObject(1); // Second text style (brittle)

// Prefer search methods when possible
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
const layerNav = getLayerByName("NonExistentLayer");
const name = layerNav.getValue('name', 'string');              // ""
const opacity = layerNav.getValue('opacity', 'double');        // -1
const deepMissing = layerNav.object('missing').object('deep').getValue('prop', 'string'); // ""
const outOfBounds = layerNav.object('textKey').list('textStyleRange').getObject(999).getValue('size', 'double'); // -1
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
const layerNav = ActionDescriptorNavigator.forCurrentLayer();
const name = layerNav.getValue('name', 'string');

// ✅ Better: Batch extraction for multiple values
const props = layerNav.getValuesAsObject({
    name: { key: 'name', type: 'string' },
    opacity: { key: 'opacity', type: 'double' }
});

// ✅ Best: Target specific layers efficiently
const targetLayer = getLayerByName("TargetTest");
const properties = targetLayer.getValuesAsObject({
    opacity: { key: 'opacity', type: 'double' },
    visible: { key: 'visible', type: 'boolean' }
});
```

### Input Validation
All methods validate inputs before processing:

```typescript
// These calls return sentinels immediately without processing
const badLayer = ActionDescriptorNavigator.forLayerByIndex(0);  // Invalid: returns sentinel
const emptyName = getLayerByName("");                           // Returns sentinel
const nullNav = layerNav.object("");                           // Returns sentinel
```

## Common Patterns

### Scoring Script Pattern
```typescript
// Reliable pattern for answer assignment - no null checks needed
function scoreLayer(layerName: string) {
    const layer = getLayerByName(layerName);
    
    // Always returns values - use sentinel checks for existence
    const layerExists = layer.getValue('name', 'string') !== "";
    
    if (layerExists) {
        answers.layerName = layer.getValue('name', 'string');
        answers.layerOpacity = layer.getValue('opacity', 'double');
        answers.layerVisible = layer.getValue('visible', 'boolean');
        answers.layerExists = true;
    } else {
        answers.layerName = "";
        answers.layerOpacity = -1;
        answers.layerVisible = false;
        answers.layerExists = false;
    }
}

// Boolean checks with sentinel awareness
const targetLayer = getLayerByName("TargetTest");
answers.hasTargetLayer = targetLayer.getValue('name', 'string') !== "";
answers.targetLayerVisible = targetLayer.getValue('visible', 'boolean');
answers.targetLayerOpacity = targetLayer.getValue('opacity', 'double');
```

### Safe Deep Navigation
```typescript
// Chain safely without null checks
const layerNav = getLayerByName("TextLayer");
const textNav = layerNav.object('textKey');
const styleList = textNav.list('textStyleRange');
const firstStyle = styleList.getObject(0);
const textStyle = firstStyle.object('textStyle');
const fontName = textStyle.getValue('fontName', 'string'); // "" if any step fails
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
    
    // Process specific layer types
    if (name.toLowerCase().indexOf('text') >= 0) {
        const textProps = layerNav.getTextProperties();
        console.log('  Text content: "' + textProps.content + '"');
        console.log('  Font: ' + textProps.fontName + ' ' + textProps.fontSize + 'pt');
    }
}
```

### Text Style Processing
```typescript
// Process all text styles in a layer
function analyzeTextLayer(layerName: string) {
    const layer = getLayerByName(layerName);
    
    if (layer.hasKey('textKey')) {
        const textNav = layer.object('textKey');
        const styleList = textNav.list('textStyleRange');
        
        console.log('Text styles found:', styleList.count);
        
        for (let i = 0; i < styleList.count; i++) {
            const style = styleList.getObject(i);
            const textStyle = style.object('textStyle');
            
            const fontName = textStyle.getValue('fontName', 'string');
            const fontSize = textStyle.getValue('size', 'double');
            const tracking = textStyle.getValue('tracking', 'double');
            
            console.log(`  Style ${i}: ${fontName} ${fontSize}pt, tracking: ${tracking}`);
        }
    }
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

## Quick Start Guide

```typescript
// Essential imports
import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';

// Basic usage
function analyzeCurrentLayer() {
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    const name = layerNav.getValue('name', 'string');
    const opacity = layerNav.getValue('opacity', 'double');
    const visible = layerNav.getValue('visible', 'boolean');
    
    console.log(`Layer: ${name}, Opacity: ${opacity}, Visible: ${visible}`);
}

// Target specific layer
function analyzeSpecificLayer() {
    const targetLayer = getLayerByName("TargetTest");
    const layerExists = targetLayer.getValue('name', 'string') !== "";
    
    if (layerExists) {
        const bounds = targetLayer.getBounds();
        console.log(`TargetTest found: ${bounds.width}x${bounds.height} at ${bounds.left},${bounds.top}`);
    } else {
        console.log("TargetTest layer not found");
    }
}

// Helper function for layer targeting
function getLayerByName(targetName: string): ActionDescriptorNavigator {
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    for (let i = 0; i < layerNames.length; i++) {
        if (layerNames[i] === targetName) {
            return ActionDescriptorNavigator.forLayerByIndex(i + 1);
        }
    }
    
    return ActionDescriptorNavigator.createSentinel();
}
```

## Version Compatibility

- **Photoshop**: CS6+ (ActionManager API)
- **ExtendScript**: All versions with ActionDescriptor support
- **Localization**: Compatible with non-English Photoshop versions
- **TypeScript**: 4.0+ for development (framework transpiles to ES3-compatible ExtendScript)