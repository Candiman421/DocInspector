# ActionDescriptorNavigator V4.1 - Complete Technical Reference

## Table of Contents

1. [Framework Architecture](#framework-architecture)
2. [Core Classes](#core-classes)
3. [Static Factory Methods](#static-factory-methods)
4. [Navigation Methods](#navigation-methods)
5. [Value Extraction Methods](#value-extraction-methods)
6. [LINQ Operations](#linq-operations)
7. [Utility Methods](#utility-methods)
8. [Helper Functions](#helper-functions)
9. [Performance Considerations](#performance-considerations)
10. [Error Handling Patterns](#error-handling-patterns)

## Framework Architecture

### Dependencies

**Required Global Functions (from ps.js):**
- `executeActionGet(reference: ActionReference): ActionDescriptor`
- `stringIDToTypeID(stringID: string): number`
- `charIDToTypeID(charID: string): number` 
- `typeIDToStringID(typeID: number): string`

**Required Polyfills (from es5-polyfills.js):**
- `Object.keys()` - Used in criteria matching
- `Array.prototype.slice()` - Used in array operations
- `console` methods - Used in debug operations

### Core Classes Hierarchy

```
ActionDescriptorNavigator (root navigation)
├── ActionListNavigator (collection navigation)
    ├── Enumerable (LINQ filtering/querying)
    └── EnumerableArray (projected results)
```

---

## Core Classes

### ActionDescriptorNavigator

**Purpose:** Primary interface for navigating ActionDescriptor objects with type-safe value extraction.

**Constructor:**
```typescript
constructor(desc: ActionDescriptor | null)
```

**Dependencies:** None
**Memory Management:** Stores reference to ActionDescriptor, nulled when sentinel

---

### ActionListNavigator

**Purpose:** Navigation and enumeration for ActionList objects with LINQ-style operations.

**Constructor:**
```typescript
constructor(list: ActionList | null, contextKey: string = '')
```

**Dependencies:** ActionDescriptorNavigator for item access
**Context Detection:** Uses contextKey to enable smart nested searching

---

### Enumerable

**Purpose:** LINQ-style filtering and querying operations with lazy evaluation.

**Constructor:**
```typescript
constructor(source: ActionListNavigator, context: string = 'GENERIC')
```

**Dependencies:** ActionListNavigator, ActionDescriptorNavigator
**Context Awareness:** Handles TEXT_STYLE_RANGES, PARAGRAPH_STYLE_RANGES, GENERIC

---

### EnumerableArray

**Purpose:** Collection of projected results with chainable operations.

**Constructor:**
```typescript
constructor(array: any[])
```

**Dependencies:** None (operates on plain arrays)
**Use Case:** Results from select() operations, chainable filtering

---

## Static Factory Methods

### ActionDescriptorNavigator.forCurrentLayer()

**Signature:** `static forCurrentLayer(): ActionDescriptorNavigator`

**Dependencies:**
- `charIDToTypeID()` - Type ID conversion
- `executeActionGet()` - Action execution
- `ActionReference` - Reference creation

**Purpose:** Creates navigator for currently selected layer

**Examples:**

```typescript
// ✅ GOOD - Basic usage
const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
const layerName = currentLayer.getString('name');

// ✅ BETTER - With error checking via sentinel
const currentLayer = ActionDescriptorNavigator.forCurrentLayer();
if (!currentLayer.isSentinel) {
    const layerName = currentLayer.getString('name');
    $.writeln('Current layer: ' + layerName);
}

// ✅ BEST - Fluent chaining with debug
const opacity = ActionDescriptorNavigator
    .forCurrentLayer()
    .debug('current layer')
    .getDouble('opacity');

// ❌ BAD - No error handling
const layerName = ActionDescriptorNavigator.forCurrentLayer().getString('name');
if (layerName === '') {
    // This means either no layer selected or property missing
    // Better to check isSentinel first
}
```

**Memory Management:** Proper ActionReference cleanup in finally block

---

### ActionDescriptorNavigator.forCurrentDocument()

**Signature:** `static forCurrentDocument(): ActionDescriptorNavigator`

**Dependencies:**
- `charIDToTypeID()` - Type ID conversion
- `executeActionGet()` - Action execution

**Purpose:** Creates navigator for currently active document

**Examples:**

```typescript
// ✅ GOOD - Document properties
const doc = ActionDescriptorNavigator.forCurrentDocument();
const width = doc.getDouble('width');
const height = doc.getDouble('height');

// ✅ BETTER - Batch extraction
const doc = ActionDescriptorNavigator.forCurrentDocument();
const docInfo = doc.extract({
    width: 'getDouble',
    height: 'getDouble',
    resolution: 'getDouble',
    mode: 'getEnumerated'
});

// ✅ BEST - Document analysis with debug
const docProperties = ActionDescriptorNavigator
    .forCurrentDocument()
    .debug('document')
    .select(doc => ({
        dimensions: { 
            width: doc.getDouble('width'), 
            height: doc.getDouble('height') 
        },
        settings: {
            resolution: doc.getDouble('resolution'),
            colorMode: doc.getEnumerated('mode')
        }
    }));

// ❌ BAD - Assuming document exists
const width = ActionDescriptorNavigator.forCurrentDocument().getDouble('width');
// Should check isSentinel first
```

---

### ActionDescriptorNavigator.forLayerByName()

**Signature:** `static forLayerByName(layerName: string): ActionDescriptorNavigator`

**Dependencies:**
- `getLayerCount()` - Internal layer enumeration
- `forLayerByIndex()` - Internal layer access
- `getString()` - Name comparison

**Purpose:** Locates layer by name with case-insensitive matching

**Algorithm:** Linear search through all layers with early termination

**Examples:**

```typescript
// ✅ GOOD - Basic layer access
const headerLayer = ActionDescriptorNavigator.forLayerByName("Header");
const isVisible = headerLayer.getBoolean('visible');

// ✅ BETTER - Case-insensitive with whitespace handling
const titleLayer = ActionDescriptorNavigator.forLayerByName("  TITLE LAYER  ");
// Automatically normalizes to "title layer" for comparison

// ✅ BEST - Fluent text analysis
const fontInfo = ActionDescriptorNavigator
    .forLayerByName("Header")
    .debug('header layer')
    .getObject('textKey')
    .debug('text object')
    .getList('textStyleRange')
    .debug('style ranges')
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .debug('arial styles')
    .select(obj => ({
        fontSize: obj.getObject('textStyle').getDouble('fontSize'),
        isBold: obj.getObject('textStyle').getBoolean('syntheticBold')
    }))
    .toArray();

// ❌ BAD - Case-sensitive assumption
const layer = ActionDescriptorNavigator.forLayerByName("header");
// Won't find "Header" - should use exact case or rely on normalization

// ❌ BAD - No existence check
const textObj = ActionDescriptorNavigator.forLayerByName("Missing").getObject('textKey');
// Creates sentinel chain but should validate layer exists first for clarity
```

**Performance:** O(n) where n = layer count, early termination on match

---

## Navigation Methods

### getObject()

**Signature:** `getObject(key: string): ActionDescriptorNavigator`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion
- `ActionDescriptor.hasKey()` - Key validation
- `ActionDescriptor.getObjectValue()` - Value extraction

**Purpose:** Navigate to nested ActionDescriptor object

**Examples:**

```typescript
// ✅ GOOD - Basic object navigation
const textObj = layer.getObject('textKey');
const boundsObj = layer.getObject('bounds');

// ✅ BETTER - Chained navigation
const colorObj = layer
    .getObject('textKey')
    .getList('textStyleRange')
    .getObject(0)
    .getObject('textStyle')
    .getObject('color');

// ✅ BEST - With debug and validation
const warpSettings = layer
    .getObject('textKey')
    .debug('textKey accessed')
    .getObject('warp')
    .debug('warp object')
    .select(warp => ({
        style: warp.getEnumerated('warpStyle'),
        value: warp.getDouble('warpValue'),
        perspective: warp.getDouble('warpPerspective')
    }));

// ❌ BAD - Assuming nested structure
const fontSize = layer.getObject('textKey').getObject('textStyle').getDouble('fontSize');
// textStyle is in textStyleRange list, not direct child of textKey

// ❌ BAD - No validation
const color = layer.getObject('textKey').getObject('color').getDouble('red');
// Color is nested deeper, this will return sentinel
```

**Sentinel Behavior:** Returns sentinel navigator if key missing or not object type

---

### getList()

**Signature:** `getList(key: string): ActionListNavigator`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion  
- `ActionDescriptor.getList()` - List extraction
- `ActionListNavigator` constructor

**Purpose:** Navigate to ActionList for enumeration and LINQ operations

**Context Detection:** Automatically detects textStyleRange and other known patterns

**Examples:**

```typescript
// ✅ GOOD - Basic list access
const styleList = textObj.getList('textStyleRange');
const count = styleList.getCount();

// ✅ BETTER - List enumeration
const styleList = textObj.getList('textStyleRange');
for (let i = 0; i < styleList.getCount(); i++) {
    const styleRange = styleList.getObject(i);
    const textStyle = styleRange.getObject('textStyle');
    console.log('Font:', textStyle.getString('fontName'));
}

// ✅ BEST - LINQ operations with smart context
const allFonts = textObj
    .getList('textStyleRange')
    .debug('style range list')
    .asEnumerable()
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .debug('extracted fonts')
    .toArray();

// Smart context example - automatically searches nested textStyle
const arialRanges = textObj
    .getList('textStyleRange')
    .asEnumerable()
    .where({ fontName: 'Arial' })  // ← Automatically searches textStyle.fontName
    .toArray();

// ❌ BAD - Manual iteration without bounds checking
const styleList = textObj.getList('textStyleRange');
for (let i = 0; i <= styleList.getCount(); i++) {  // ← Off-by-one error
    const style = styleList.getObject(i);
}

// ❌ BAD - Not using LINQ for filtering
const styleList = textObj.getList('textStyleRange');
const arialStyles = [];
for (let i = 0; i < styleList.getCount(); i++) {
    const range = styleList.getObject(i);
    const textStyle = range.getObject('textStyle');
    if (textStyle.getString('fontName') === 'Arial') {
        arialStyles.push(range);
    }
}
// Use LINQ where() instead
```

**Context Awareness:** Detects textStyleRange context for smart nested searching

---

## Value Extraction Methods

### getString()

**Signature:** `getString(key: string): string`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion
- `ActionDescriptor.getString()` - String extraction
- `SENTINELS.string` - Error value

**Purpose:** Extract string values with automatic sentinel handling

**Examples:**

```typescript
// ✅ GOOD - Basic string extraction
const layerName = layer.getString('name');
const fontName = textStyle.getString('fontName');

// ✅ BETTER - Validation with sentinel check
const layerName = layer.getString('name');
if (layerName !== '') {
    console.log('Layer name:', layerName);
}

// ✅ BEST - Used in projections
const fontData = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            name: style.getString('fontName'),           // ← Preferred style
            postscript: style.getString('fontPostScriptName'),
            family: style.getString('fontStyleName')
        };
    })
    .toArray();

// ❌ BAD - Null checking (not needed with sentinels)
const name = layer.getString('name');
if (name !== null && name !== undefined) {  // ← Unnecessary
    console.log(name);
}

// ❌ BAD - Exception handling (sentinels prevent exceptions)
try {
    const name = layer.getString('name');
} catch (e) {  // ← Never throws with sentinel pattern
    console.log('Error getting name');
}
```

**Sentinel Value:** Returns `""` (empty string) when key missing or wrong type

---

### getDouble()

**Signature:** `getDouble(key: string): number`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion
- `ActionDescriptor.getDouble()` - Numeric extraction
- `SENTINELS.double` - Error value

**Purpose:** Extract numeric values (pixels, percentages, angles, etc.)

**Examples:**

```typescript
// ✅ GOOD - Basic numeric extraction
const opacity = layer.getDouble('opacity');
const fontSize = textStyle.getDouble('fontSize');

// ✅ BETTER - Calculations with sentinel awareness
const opacity = layer.getDouble('opacity');
const opacityPercent = opacity !== -1 ? (opacity / 255) * 100 : 0;

// ✅ BEST - Batch numeric extraction
const dimensions = layer.select(layer => {
    const bounds = layer.getBounds();
    return {
        width: bounds.width,
        height: bounds.height,
        area: bounds.width * bounds.height,
        aspectRatio: bounds.height !== 0 ? bounds.width / bounds.height : 0
    };
});

// Projection with calculations
const fontSizes = styleList
    .asEnumerable()
    .select(obj => obj.getObject('textStyle').getDouble('fontSize'))
    .where(size => size > 0)  // Filter out sentinels
    .select(size => Math.round(size))  // Round to integers
    .toArray();

// ❌ BAD - Type coercion assumptions
const opacity = parseFloat(layer.getDouble('opacity'));  // ← Already a number

// ❌ BAD - Division by zero without checking sentinel
const aspectRatio = bounds.width / bounds.height;  // ← Should check for -1 sentinels
```

**Sentinel Value:** Returns `-1` when key missing, wrong type, or calculation error

---

### getUnitDouble()

**Signature:** `getUnitDouble(key: string): number`

**Purpose:** Alias for getDouble() - kept for XML element name consistency

**Usage:** Identical to getDouble(), use when XML shows UnitDouble elements

**Examples:**

```typescript
// ✅ GOOD - When XML shows UnitDouble elements
const fontSize = textStyle.getUnitDouble('sizeKey');  // XML shows UnitDouble
const tracking = textStyle.getDouble('tracking');     // XML shows Double

// ✅ BETTER - Consistent with XML structure
const bounds = boundsObj.extract({
    left: 'getUnitDouble',    // XML: <UnitDouble symname="Left"...>
    top: 'getUnitDouble',     // XML: <UnitDouble symname="Top"...>
    right: 'getUnitDouble',   // XML: <UnitDouble symname="Right"...>
    bottom: 'getUnitDouble'   // XML: <UnitDouble symname="Bottom"...>
});
```

---

### getInteger()

**Signature:** `getInteger(key: string): number`

**Purpose:** Extract integer values (layer IDs, counts, indices)

**Examples:**

```typescript
// ✅ GOOD - Integer-specific properties
const layerID = layer.getInteger('layerID');
const itemIndex = layer.getInteger('itemIndex');
const rangeFrom = styleRange.getInteger('from');
const rangeTo = styleRange.getInteger('to');

// ✅ BETTER - Range analysis
const textRanges = styleList
    .asEnumerable()
    .select(obj => ({
        from: obj.getInteger('from'),
        to: obj.getInteger('to'),
        length: obj.getInteger('to') - obj.getInteger('from')
    }))
    .toArray();

// ❌ BAD - Using for floating point values
const fontSize = textStyle.getInteger('fontSize');  // ← Should use getDouble()
```

**Sentinel Value:** Returns `-1` when key missing or wrong type

---

### getBoolean()

**Signature:** `getBoolean(key: string): boolean`

**Purpose:** Extract boolean flags (visibility, synthetic styles, etc.)

**Examples:**

```typescript
// ✅ GOOD - Boolean properties
const isVisible = layer.getBoolean('visible');
const isBold = textStyle.getBoolean('syntheticBold');
const isItalic = textStyle.getBoolean('syntheticItalic');

// ✅ BETTER - Style analysis
const styleFeatures = textStyle.select(style => ({
    hasSyntheticBold: style.getBoolean('syntheticBold'),
    hasSyntheticItalic: style.getBoolean('syntheticItalic'),
    hasAutoLeading: style.getBoolean('autoLeading'),
    hasLigatures: style.getBoolean('ligature')
}));

// ✅ BEST - Filtering with boolean conditions
const boldStyles = styleList
    .asEnumerable()
    .where(obj => obj.getObject('textStyle').getBoolean('syntheticBold'))
    .toArray();

// ❌ BAD - String comparison for boolean
const isVisible = layer.getString('visible') === 'true';  // ← Use getBoolean()
```

**Sentinel Value:** Returns `false` when key missing or wrong type

---

### getEnumerated()

**Signature:** `getEnumerated(key: string): string`

**Purpose:** Extract enumerated values as human-readable strings

**Examples:**

```typescript
// ✅ GOOD - Enumerated properties
const blendMode = layer.getEnumerated('mode');        // "normal", "multiply", etc.
const fontCaps = textStyle.getEnumerated('fontCaps'); // "normal", "smallCaps", etc.
const alignment = paragraphStyle.getEnumerated('alignment'); // "left", "center", "right"

// ✅ BETTER - Enumerated filtering
const smallCapsStyles = styleList
    .asEnumerable()
    .where({ fontCaps: 'smallCaps' })
    .toArray();

// ✅ BEST - Complex enumerated analysis
const styleVariations = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            caps: style.getEnumerated('fontCaps'),
            baseline: style.getEnumerated('baseline'),
            underline: style.getEnumerated('underline'),
            strikethrough: style.getEnumerated('strikethrough')
        };
    })
    .where(data => data.caps !== '' || data.underline !== 'underlineOff')
    .toArray();

// ❌ BAD - Case-sensitive comparison
const isSmallCaps = textStyle.getEnumerated('fontCaps') === 'SmallCaps';  // ← Wrong case

// ❌ BAD - Numeric comparison for enumerated
const blendMode = layer.getInteger('mode');  // ← Should use getEnumerated()
```

**Sentinel Value:** Returns `""` (empty string) when key missing or wrong type

---

## LINQ Operations

### asEnumerable()

**Signature:** `asEnumerable(): Enumerable`

**Dependencies:**
- `Enumerable` constructor
- Context detection logic

**Purpose:** Convert ActionListNavigator to LINQ-capable Enumerable

**Context Detection:** Automatically detects textStyleRange, paragraphStyleRange patterns

**Examples:**

```typescript
// ✅ GOOD - Basic LINQ conversion
const enumerable = styleList.asEnumerable();

// ✅ BETTER - Immediate chaining
const fonts = styleList
    .asEnumerable()
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .toArray();

// ✅ BEST - Complex LINQ pipeline
const analysis = textObj
    .getList('textStyleRange')
    .debug('initial list')
    .asEnumerable()
    .debug('enumerable created')
    .where({ fontName: 'Arial' })  // ← Smart nested search
    .debug('after Arial filter')
    .select(obj => ({
        range: { 
            from: obj.getInteger('from'), 
            to: obj.getInteger('to') 
        },
        style: {
            size: obj.getObject('textStyle').getDouble('fontSize'),
            bold: obj.getObject('textStyle').getBoolean('syntheticBold')
        }
    }))
    .debug('after projection')
    .toArray();

// ❌ BAD - Redundant conversion
const enumerable = styleList.asEnumerable().asEnumerable();  // ← Already enumerable
```

**Smart Context:** Automatically enables nested textStyle searching for textStyleRange lists

---

### where()

**Signature:** `where(criteria: CriteriaObject | PredicateFunction): Enumerable`

**Dependencies:**
- `matchesCriteriaWithContext()` - Context-aware matching
- `matchesCriteria()` - Standard criteria matching

**Purpose:** Filter items based on criteria with smart nested object search

**Context Awareness:** 
- TEXT_STYLE_RANGES: Searches inside textStyle objects automatically
- GENERIC: Searches direct properties

**Examples:**

```typescript
// ✅ GOOD - Object criteria (auto-nested search for textStyleRange)
const arialStyles = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })  // ← Automatically searches textStyle.fontName
    .toArray();

// ✅ BETTER - Multiple criteria
const specificStyles = styleList
    .asEnumerable()
    .where({ 
        fontName: 'Arial', 
        fontSize: 24,
        syntheticBold: false 
    })
    .toArray();

// ✅ BEST - Function predicates for complex logic
const largeArialStyles = styleList
    .asEnumerable()
    .where(obj => {
        const style = obj.getObject('textStyle');
        const font = style.getString('fontName');
        const size = style.getDouble('fontSize');
        return font === 'Arial' && size > 20;
    })
    .toArray();

// ✅ EXCLUSION - Using ! prefix
const nonArialStyles = styleList
    .asEnumerable()
    .where({ '!fontName': 'Arial' })  // ← Exclude Arial fonts
    .toArray();

// ✅ WILDCARD PATTERNS
const systemFonts = styleList
    .asEnumerable()
    .where({ fontName: '*System*' })  // ← Contains "System"
    .toArray();

// ❌ BAD - Wrong context assumption
const arialStyles = paragraphList
    .asEnumerable()
    .where({ fontName: 'Arial' });  // ← fontName not in paragraphStyle

// ❌ BAD - Redundant nested navigation
const arialStyles = styleList
    .asEnumerable()
    .where(obj => obj.getObject('textStyle').getString('fontName') === 'Arial');
// Use { fontName: 'Arial' } instead
```

**Pattern Matching:**
- `*` = any amount of characters
- `_` = exactly one character
- Case-insensitive string matching

---

### select()

**Signature:** `select<T>(selector: SelectorFunction<T>): EnumerableArray`

**Dependencies:**
- `EnumerableArray` constructor
- Error handling for failed projections

**Purpose:** Project/transform items into new forms using your preferred value extraction methods

**Examples:**

```typescript
// ✅ GOOD - Simple property extraction
const fontNames = styleList
    .asEnumerable()
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .toArray();

// ✅ BETTER - Multiple properties
const fontData = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return {
            name: style.getString('fontName'),      // ← Your preferred style
            size: style.getDouble('fontSize'),      // ← Your preferred style
            bold: style.getBoolean('syntheticBold') // ← Your preferred style
        };
    })
    .toArray();

// ✅ BEST - Complex transformations with calculations
const styleAnalysis = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        const color = style.getObject('color');
        const bounds = obj.getObject('bounds');
        
        return {
            typography: {
                font: style.getString('fontName'),
                size: Math.round(style.getDouble('fontSize')),
                weight: style.getBoolean('syntheticBold') ? 'bold' : 'normal',
                style: style.getBoolean('syntheticItalic') ? 'italic' : 'normal'
            },
            color: {
                rgb: `rgb(${color.getDouble('red')}, ${color.getDouble('green')}, ${color.getDouble('blue')})`,
                brightness: (color.getDouble('red') + color.getDouble('green') + color.getDouble('blue')) / 3
            },
            range: {
                from: obj.getInteger('from'),
                to: obj.getInteger('to'),
                length: obj.getInteger('to') - obj.getInteger('from')
            }
        };
    })
    .toArray();

// ❌ BAD - Redundant data extraction
const data = styleList
    .asEnumerable()
    .select(obj => obj)  // ← No transformation
    .toArray();

// ❌ BAD - Error-prone complex logic without null checking
const data = styleList
    .asEnumerable()
    .select(obj => {
        const style = obj.getObject('textStyle');
        return style.getDouble('fontSize') / style.getDouble('tracking');  // ← Division by zero risk
    })
    .toArray();
```

**Error Handling:** Gracefully skips failed projections, continues with remaining items

---

### selectMany()

**Signature:** `selectMany(selector: SelectManyFunction): EnumerableArray`

**Dependencies:**
- `EnumerableArray` constructor
- Type detection for returned collections

**Purpose:** Flatten nested collections into single array

**Examples:**

```typescript
// ✅ GOOD - Flatten nested objects
const allCharacters = textObj
    .getList('textStyleRange')
    .asEnumerable()
    .selectMany(range => {
        const characters = [];
        const from = range.getInteger('from');
        const to = range.getInteger('to');
        for (let i = from; i < to; i++) {
            characters.push({ 
                index: i, 
                style: range.getObject('textStyle') 
            });
        }
        return characters;
    })
    .toArray();

// ✅ BETTER - Multiple list flattening
const allEffects = documentLayers
    .asEnumerable()
    .selectMany(layer => layer.getList('layerEffects').asEnumerable())
    .toArray();

// ✅ BEST - Complex nested data extraction
const textAnalysis = documentObj
    .getList('layers')
    .asEnumerable()
    .where(layer => layer.hasKey('textKey'))
    .selectMany(layer => 
        layer.getObject('textKey')
             .getList('textStyleRange')
             .asEnumerable()
             .select(range => ({
                 layerName: layer.getString('name'),
                 fontName: range.getObject('textStyle').getString('fontName'),
                 fontSize: range.getObject('textStyle').getDouble('fontSize')
             }))
    )
    .toArray();

// ❌ BAD - Not actually flattening
const styles = styleList
    .asEnumerable()
    .selectMany(obj => [obj.getObject('textStyle')])  // ← Just wrapping in array

// ❌ BAD - Return type mismatch
const invalid = styleList
    .asEnumerable()
    .selectMany(obj => obj.getString('fontName'))  // ← Should return collection
    .toArray();
```

**Return Types:** Handles ActionDescriptorNavigator, arrays, EnumerableArray collections

---

### first()

**Signature:** `first(): ActionDescriptorNavigator`

**Dependencies:**
- Early termination logic
- `ActionDescriptorNavigator.createSentinel()`

**Purpose:** Get first matching item with early termination for performance

**Examples:**

```typescript
// ✅ GOOD - Get first item
const firstStyle = styleList.asEnumerable().first();

// ✅ BETTER - First with criteria
const firstArial = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .first();

// ✅ BEST - First with validation
const primaryFont = styleList
    .asEnumerable()
    .where({ fontName: 'Arial', fontSize: 24 })
    .first();
    
if (!primaryFont.isSentinel) {
    const fontData = primaryFont.getObject('textStyle').extract({
        name: 'getString',
        size: 'getDouble',
        bold: 'getBoolean'
    });
}

// ❌ BAD - No sentinel checking
const font = styleList.asEnumerable().where({ fontName: 'Missing' }).first();
const name = font.getObject('textStyle').getString('fontName');  // ← Could be sentinel

// ❌ BAD - Using when you want all items
const firstFont = styleList.asEnumerable().first().getObject('textStyle').getString('fontName');
// Use select() if you want all font names
```

**Performance:** O(1) to O(n), stops at first match

---

### toArray()

**Signature:** `toArray(): ActionDescriptorNavigator[]`

**Dependencies:** Array collection and iteration

**Purpose:** Execute LINQ query and return all matching results

**Examples:**

```typescript
// ✅ GOOD - Collect all results
const allStyles = styleList.asEnumerable().toArray();

// ✅ BETTER - Filtered collection
const arialStyles = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .toArray();

// ✅ BEST - Complex pipeline to array
const fontAnalysis = styleList
    .asEnumerable()
    .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 16)
    .select(obj => ({
        font: obj.getObject('textStyle').getString('fontName'),
        size: obj.getObject('textStyle').getDouble('fontSize'),
        range: `${obj.getInteger('from')}-${obj.getInteger('to')}`
    }))
    .toArray();

// ❌ BAD - Unnecessary conversion when you need count
const count = styleList.asEnumerable().toArray().length;  // ← Use count() instead

// ❌ BAD - Converting just to get first
const first = styleList.asEnumerable().toArray()[0];  // ← Use first() instead
```

**Performance:** O(n), processes all items in collection

---

### any()

**Signature:** `any(): boolean`

**Dependencies:** Early termination logic

**Purpose:** Check existence with early termination for performance

**Examples:**

```typescript
// ✅ GOOD - Existence check
const hasArialFonts = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .any();

// ✅ BETTER - Complex condition checking
const hasLargeText = styleList
    .asEnumerable()
    .where(obj => obj.getObject('textStyle').getDouble('fontSize') > 24)
    .any();

// ✅ BEST - Validation logic
const validation = {
    hasRequiredFont: styleList.asEnumerable().where({ fontName: 'Arial' }).any(),
    hasProperSize: styleList.asEnumerable().where(obj => {
        const size = obj.getObject('textStyle').getDouble('fontSize');
        return size >= 16 && size <= 72;
    }).any(),
    hasValidColors: colorList.asEnumerable().where(obj => {
        const color = obj.getObject('color');
        return color.getDouble('red') >= 0 && color.getDouble('green') >= 0;
    }).any()
};

// ❌ BAD - Inefficient existence check
const hasArial = styleList.asEnumerable().toArray().length > 0;  // ← Use any() instead

// ❌ BAD - Converting to array for boolean check
const exists = styleList.asEnumerable().where({ fontName: 'Arial' }).toArray().length > 0;
// Use any() instead
```

**Performance:** O(1) to O(n), stops at first match

---

### count()

**Signature:** `count(): number`

**Dependencies:** Collection enumeration

**Purpose:** Count matching items

**Examples:**

```typescript
// ✅ GOOD - Count all items
const totalStyles = styleList.asEnumerable().count();

// ✅ BETTER - Count with criteria
const arialCount = styleList
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .count();

// ✅ BEST - Statistical analysis
const fontStats = {
    total: styleList.asEnumerable().count(),
    arial: styleList.asEnumerable().where({ fontName: 'Arial' }).count(),
    large: styleList.asEnumerable().where(obj => 
        obj.getObject('textStyle').getDouble('fontSize') > 20
    ).count(),
    bold: styleList.asEnumerable().where({ syntheticBold: true }).count()
};

// ❌ BAD - Inefficient counting
const count = styleList.asEnumerable().toArray().length;  // ← Use count() directly
```

**Performance:** O(n), must process all items to count

---

## Utility Methods

### debug()

**Signature:** `debug(label: string): this`

**Dependencies:** Console availability check

**Purpose:** Add debug output anywhere in fluent chains without breaking flow

**Examples:**

```typescript
// ✅ GOOD - Simple debug
const result = layer.debug('layer loaded').getObject('textKey');

// ✅ BETTER - Pipeline debugging
const fonts = layer
    .debug('starting with layer')
    .getObject('textKey')
    .debug('got text object')
    .getList('textStyleRange')
    .debug('got style list')
    .asEnumerable()
    .debug('created enumerable')
    .where({ fontName: 'Arial' })
    .debug('filtered for Arial')
    .select(obj => obj.getObject('textStyle').getString('fontName'))
    .debug('projected font names')
    .toArray();

// ✅ BEST - Conditional debugging with descriptive labels
const analysis = ActionDescriptorNavigator
    .forLayerByName("Header")
    .debug('found header layer')
    .getObject('textKey')
    .debug('extracted text data')
    .getList('textStyleRange')
    .debug(`found ${textObj.getList('textStyleRange').getCount()} style ranges`)
    .asEnumerable()
    .where({ fontName: 'Arial' })
    .debug('filtered for target font')
    .first();

// ❌ BAD - Redundant debugging
const result = layer
    .debug('step1')
    .debug('step1 again')  // ← Redundant
    .getObject('textKey');

// ❌ BAD - Non-descriptive labels
const result = layer
    .debug('a')
    .getObject('textKey')
    .debug('b')  // ← Not helpful
    .getList('textStyleRange');
```

**Output Format:** `"label: STATUS (additional info)"`

---

### hasKey()

**Signature:** `hasKey(key: string): boolean`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion
- `ActionDescriptor.hasKey()` - Key checking

**Purpose:** Check property existence for conditional logic

**Examples:**

```typescript
// ✅ GOOD - Conditional navigation
if (layer.hasKey('textKey')) {
    const textAnalysis = layer.getObject('textKey').getList('textStyleRange');
}

// ✅ BETTER - Type identification
const layerType = {
    isText: layer.hasKey('textKey'),
    hasEffects: layer.hasKey('layerEffects'),
    hasVector: layer.hasKey('vectorMask'),
    isAdjustment: layer.hasKey('adjustment')
};

// ✅ BEST - Complex conditional logic
const textLayers = documentObj
    .getList('layers')
    .asEnumerable()
    .where(layer => layer.hasKey('textKey'))
    .select(layer => ({
        name: layer.getString('name'),
        hasWarp: layer.getObject('textKey').hasKey('warp'),
        styleCount: layer.getObject('textKey').getList('textStyleRange').getCount()
    }))
    .toArray();

// ❌ BAD - Using for null checking (not needed with sentinels)
if (layer.hasKey('name')) {
    const name = layer.getString('name');  // ← getString() already handles missing keys
}

// ❌ BAD - Exception prevention (sentinels prevent exceptions)
if (layer.hasKey('textKey')) {
    try {
        const textObj = layer.getObject('textKey');
    } catch (e) {  // ← Never needed with sentinel pattern
        // ...
    }
}
```

**Use Cases:** Type identification, conditional logic, feature detection

---

### getBounds()

**Signature:** `getBounds(): BoundsObject`

**Dependencies:**
- `stringIDToTypeID()` - Key conversion
- Bounds calculation logic

**Purpose:** Extract and calculate layer bounds with computed dimensions

**Examples:**

```typescript
// ✅ GOOD - Basic bounds
const bounds = layer.getBounds();
console.log(`Size: ${bounds.width} x ${bounds.height}`);

// ✅ BETTER - Bounds analysis
const bounds = layer.getBounds();
if (bounds.width !== -1) {  // Valid bounds check
    const analysis = {
        dimensions: `${bounds.width}x${bounds.height}`,
        position: `(${bounds.left}, ${bounds.top})`,
        area: bounds.width * bounds.height,
        aspectRatio: bounds.height !== 0 ? bounds.width / bounds.height : 0
    };
}

// ✅ BEST - Multi-layer bounds analysis
const layerBounds = documentObj
    .getList('layers')
    .asEnumerable()
    .select(layer => {
        const bounds = layer.getBounds();
        return {
            name: layer.getString('name'),
            bounds: bounds,
            isValid: bounds.width > 0 && bounds.height > 0,
            center: {
                x: bounds.left + (bounds.width / 2),
                y: bounds.top + (bounds.height / 2)
            }
        };
    })
    .where(data => data.isValid)
    .toArray();

// ❌ BAD - Manual bounds calculation
const left = layer.getObject('bounds').getDouble('left');
const top = layer.getObject('bounds').getDouble('top');
const right = layer.getObject('bounds').getDouble('right');
const bottom = layer.getObject('bounds').getDouble('bottom');
const width = right - left;  // ← Use getBounds() instead

// ❌ BAD - Not checking for valid bounds
const bounds = layer.getBounds();
const area = bounds.width * bounds.height;  // ← Could be -1 * -1 = 1 (wrong)
```

**Return Values:**
- Valid bounds: Actual measurements
- Invalid/missing: All values = -1

---

### extract()

**Signature:** `extract(propertyMap: PropertyExtractionMap): Record<string, any>`

**Dependencies:**
- `PropertyExtractionMap` type
- Dynamic method invocation

**Purpose:** Batch extract multiple properties using method name mapping

**Examples:**

```typescript
// ✅ GOOD - Basic extraction
const layerData = layer.extract({
    name: 'getString',
    opacity: 'getDouble',
    visible: 'getBoolean',
    mode: 'getEnumerated'
});

// ✅ BETTER - Consistent style property extraction
const fontData = textStyle.extract({
    fontName: 'getString',
    fontSize: 'getDouble',
    syntheticBold: 'getBoolean',
    syntheticItalic: 'getBoolean',
    fontCaps: 'getEnumerated',
    tracking: 'getDouble'
});

// ✅ BEST - Color extraction with known structure
const colorData = colorObj.extract({
    red: 'getDouble',
    green: 'getDouble',
    blue: 'getDouble'
});

// Transform extracted data
const rgbString = `rgb(${colorData.red}, ${colorData.green}, ${colorData.blue})`;

// ❌ BAD - Mixed property types without structure
const mixed = layer.extract({
    bounds: 'getBounds',  // ← Returns object, not primitive
    name: 'getString'     // ← Returns string
});

// ❌ BAD - Wrong method for property type
const wrong = textStyle.extract({
    fontSize: 'getString',  // ← Should be 'getDouble'
    fontName: 'getDouble'   // ← Should be 'getString'
});
```

**Method Names:** 'getString', 'getDouble', 'getUnitDouble', 'getInteger', 'getBoolean', 'getEnumerated'

---

## Helper Functions

### getValueByType()

**Purpose:** Internal helper for dynamic value extraction by property type

**Usage:** Used internally by matching algorithms and extract methods

### valuesMatch()

**Purpose:** Value comparison with pattern matching support

**Pattern Support:**
- `*` = any characters
- `_` = single character
- Case-insensitive strings

### matchesPattern()

**Purpose:** RegExp-based pattern matching for wildcard searches

### matchesCriteria()

**Purpose:** Object criteria matching with inclusion/exclusion support

**Exclusion Syntax:** Properties prefixed with `!` are exclusion criteria

---

## Performance Considerations

### Early Termination Operations

**Operations that stop at first match:**
- `first()` - O(1) to O(n)
- `any()` - O(1) to O(n)
- `where().first()` - O(1) to O(n)

### Full Collection Operations

**Operations that process all items:**
- `toArray()` - O(n)
- `count()` - O(n)
- `select()` - O(n)

### Memory Management

**ActionReference Cleanup:**
```typescript
// ✅ GOOD - Proper cleanup pattern
let ref: ActionReference | null = null;
try {
    ref = new ActionReference();
    // ... use reference
    return result;
} catch (e) {
    return sentinel;
} finally {
    if (ref) ref = null;  // ← Critical for ExtendScript
}
```

### Context Detection Performance

**Smart context detection adds minimal overhead:**
- One-time detection per list
- Cached context for repeated operations
- Falls back to generic matching if detection fails

---

## Error Handling Patterns

### Sentinel Pattern Philosophy

**Never throws exceptions - always returns meaningful values:**
- Strings: `""` (empty string)
- Numbers: `-1`
- Booleans: `false`
- Objects: Sentinel navigator with `isSentinel = true`

### Graceful Degradation

**Each method handles its own errors:**
```typescript
// All these return sentinels on error, never throw
const layer = ActionDescriptorNavigator.forLayerByName("Missing");     // Sentinel
const textObj = layer.getObject('textKey');                            // Sentinel
const fontName = textObj.getList('textStyleRange').asEnumerable()      // Empty
    .first().getObject('textStyle').getString('fontName');             // ""
```

### Error Recovery Strategies

**Check sentinels only when needed:**
```typescript
// ✅ GOOD - Check final result
const fontName = layer.getObject('textKey').getList('textStyleRange')
    .asEnumerable().first().getObject('textStyle').getString('fontName');
    
if (fontName !== '') {
    console.log('Found font:', fontName);
} else {
    console.log('No font data found');
}

// ❌ BAD - Check every step
if (!layer.isSentinel) {
    const textObj = layer.getObject('textKey');
    if (!textObj.isSentinel) {
        // ... too much checking
    }
}
```

This technical reference provides comprehensive coverage of all functions with practical examples showing proper usage patterns, common mistakes to avoid, and performance considerations specific to ExtendScript environments.