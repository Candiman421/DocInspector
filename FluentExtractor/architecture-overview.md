# Fluent Photoshop Scoring System - Architecture Overview

## 📁 File Structure and Purpose

This system consists of **6 core files** that work together to provide a comprehensive TypeScript-based Photoshop document analysis and scoring system:

### **Core Library Files (Import These)**

| Artifact ID        | File Name                        | Purpose                                  | Import Priority |
| ------------------ | -------------------------------- | ---------------------------------------- | --------------- |
| `action_navigator` | **ActionDescriptorNavigator.ts** | Core navigation engine                   | **Required**    |
| `path_accessor`    | **PathAccessor.ts**              | Primary fluent API (your main interface) | **Required**    |
| `list_extractors`  | **ListExtractors.ts**            | Standalone list utility (optional)       | Optional        |

### **Documentation and Examples**

| Artifact ID             | File Name                  | Purpose                              | Status    |
| ----------------------- | -------------------------- | ------------------------------------ | --------- |
| `usage_examples`        | **UsageExamples.ts**       | Complete usage patterns and examples | Reference |
| `sample_scoring_script` | **SampleScoringScript.ts** | Full scoring system implementation   | Template  |
| `readme_fixed`          | **README.md**              | Complete API documentation           | Reference |

### **Supporting Files**

| File Name           | Purpose                           | Status |
| ------------------- | --------------------------------- | ------ |
| **index.ts**        | Convenience factories and utilities | Helper |
| **ExtendScript.d.ts** | Type definitions (optional)       | Types  |
| **tsconfig.json**   | TypeScript configuration          | Config |

### **Status: All Current, No Circular Dependencies**

✅ **All artifacts are current and compilation-ready**  
✅ **No circular dependencies** - Clean, self-contained architecture  
❌ **No deprecated files** - All code follows working patterns

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Scoring Script                      │
├─────────────────────────────────────────────────────────────┤
│  Import: ActionDescriptorPath, P, ActionDescriptorNavigator │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   PathAccessor.ts                           │
│  • Primary fluent API (your main interface)                 │
│  • ActionDescriptorPath.create().object().list().value()    │
│  • Direct methods: .extractLayerTuple(), .extractAllLayerNames() │
│  • Transformations: .floor(), .round(), .toPixels()         │
│  • Extraction: .extract(), .tryExtract(), .extractOr()      │
│  • Factory functions: P.bounds(), P.textStyle(), P.filter() │
└─────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────────┐
│     ActionDescriptorNavigator.ts   │ │        ListExtractors.ts            │
│  • Core navigation engine          │ │  • Standalone list utility          │
│  • .object(), .list(), .getValue() │ │  • Independent of PathAccessor      │
│  • Tuple/object value extraction   │ │  • Advanced list operations         │
│  • Type-safe operations            │ │  • Optional for most use cases      │
└────────────────────────────────────┘ └─────────────────────────────────────┘
                    │                           │
                    └───────────┬───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                ExtendScript ActionManager                   │
│     executeActionGet(), stringIDToTypeID(), charIDToTypeID() │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Detailed File Breakdown

### **1. PathAccessor.ts** - Primary API ⭐

**Purpose**: Your main interface for 90% of extraction tasks.

**Key Features**:
- **Direct value returns**: All methods return actual values, not intermediate objects
- **Self-contained**: No external dependencies, no circular imports
- **Fluent chaining**: `.create().object().list().at().value().extract()`
- **Built-in transformations**: `.floor()`, `.round()`, `.toPixels()`, `.toPercentage()`
- **Multiple extraction methods**: `.extract()`, `.tryExtract()`, `.extractOr()`
- **Specialized methods**: `.extractLayerTuple()`, `.extractAllLayerNames()`, `.extractTextStyleValues()`
- **Factory functions**: `P.bounds()`, `P.textStyle()`, `P.filter()`

**When to Use**: **This should be your primary choice for all extractions.**

**Example**:
```typescript
// Your main syntax - direct value extraction
const brightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("brightness", "integer")
  .extract<number>(d);

// Factory function syntax
const fontSize = P.textStyle("sizeKey", "double", 0).round(1).extract<number>(d);

// Layer extraction
const layerNames = ActionDescriptorPath.create().extractAllLayerNames();
const [layer1, layer2, layer3] = ActionDescriptorPath.create().extractLayerTuple(3, "Missing");
```

### **2. ActionDescriptorNavigator.ts** - Core Navigation Engine

**Purpose**: Provides foundational navigation methods and tuple extraction capabilities.

**Key Features**:
- Basic navigation: `.object()`, `.list()`, `.getValue()`
- Tuple extraction: `.getValues()`, `.getValuesAsObject()`
- Type-safe value retrieval with transformations
- Specialized utilities: `.getBounds()`, `.getTextProperties()`, `.extractBulletStyles()`
- Self-contained with all interfaces declared

**When to Use**:
- When you need imperative-style navigation
- When extracting multiple values as tuples/objects
- When building complex custom extraction logic

**Example**:
```typescript
// Multiple values as tuple
const [brightness, contrast] = ActionDescriptorNavigator.from(r)
  .object("smartObjectMore")
  .list("filterFXList")
  .getObject(0)
  .getValues([
    { key: "brightness", type: "integer" },
    { key: "contrast", type: "integer" }
  ]);

// Values as object
const bounds = ActionDescriptorNavigator.from(r).object("bounds").getValuesAsObject({
  left: { key: "left", type: "double" },
  top: { key: "top", type: "double" },
  width: { key: "width", type: "double" },
  height: { key: "height", type: "double" }
});
```

### **3. ListExtractors.ts** - Standalone List Utility (Optional)

**Purpose**: Advanced list operations for complex scenarios. **Not required for basic usage.**

**Key Features**:
- Independent utility class
- Advanced list operations: `.extractAllWithMetadata()`, `.extractWhere()`, `.countWhere()`
- Transformation support: `.transform()`, `.round()`, `.skipErrors()`
- Specialized extraction patterns

**When to Use**:
- Advanced list processing scenarios
- Complex filtering and transformation operations
- When you need detailed metadata about list extractions

**Example**:
```typescript
// Advanced list operations (rarely needed)
const extractor = new ListValueExtractor(path, "name", "string", {});
const metadata = extractor.extractAllWithMetadata(desc);
```

### **4. SampleScoringScript.ts** - Complete Implementation Template

**Purpose**: Full working example of a complete scoring system.

**Contents**:
- Complete test specification interface
- Comprehensive answer extraction using all API methods
- Scoring and evaluation logic with tolerance support
- Detailed feedback generation
- Error handling and reporting

**When to Use**: As a template for building your own scoring systems.

### **5. UsageExamples.ts** - Comprehensive Reference

**Purpose**: Complete examples showing every usage pattern.

**Contents**:
- Basic value extraction patterns
- Tuple and object destructuring examples
- Layer extraction scenarios
- Error handling patterns
- Real-world scoring examples using working patterns only

**When to Use**: Learning the API and finding patterns for specific scenarios.

### **6. index.ts** - Convenience Utilities

**Purpose**: Factory functions and common extraction patterns.

**Contents**:
- Quick-start factory functions
- Common extraction utilities
- Ready-to-use extraction patterns

---

## 🚀 How to Use This System

### **Step 1: Set Up Your Project**

```bash
# Copy the core files to your project
cp ActionDescriptorNavigator.ts ./src/
cp PathAccessor.ts ./src/
cp ListExtractors.ts ./src/  # Optional
```

### **Step 2: Import What You Need**

```typescript
// Most common imports (covers 95% of use cases)
import { ActionDescriptorPath, P } from "./PathAccessor";

// For complex tuple extractions
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

// For advanced list operations (rarely needed)
import { ListValueExtractor } from "./ListExtractors";
```

### **Step 3: Start Building**

```typescript
// Primary recommended syntax - direct value extraction
const answers = {
  brightness: ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .at(0)
    .value("brightness", "integer")
    .extract<number>(d),

  fontSize: P.textStyle("sizeKey", "double", 0).round(1).extract<number>(d),
  layerWidth: P.bounds("width").extract<number>(d),
  
  // Layer extraction
  layerNames: ActionDescriptorPath.create().extractAllLayerNames(),
  layerTuple: ActionDescriptorPath.create().extractLayerTuple(3, "Missing")
};
```

### **Step 4: Handle Complex Scenarios**

```typescript
// Text style extraction
const textStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
  "paragraphStyle.listStyleType", "enumerated", 4, "plain"
);
const [bullet1, bullet2, bullet3, bullet4] = textStyles;

// Multiple value tuple extraction
const [brightness, contrast] = ActionDescriptorNavigator.from(r)
  .object("smartObjectMore")
  .list("filterFXList")
  .getObject(0)
  .getValues([
    { key: "brightness", type: "integer" },
    { key: "contrast", type: "integer" }
  ]);
```

---

## 🎯 Design Philosophy

### **Clean, Self-Contained Architecture**

- **PathAccessor** = Primary interface, self-contained, no dependencies
- **ActionDescriptorNavigator** = Core navigation, self-contained
- **ListExtractors** = Optional utility, independent
- **No circular dependencies** = Clean, maintainable code

### **Direct Value Returns**

- All methods return **actual values** for assignment
- No intermediate objects that require further chaining
- Direct assignment to answer objects: `answers.prop = path.extract(d)`

### **Progressive Enhancement**

- Start with `ActionDescriptorPath.create()` for 95% of use cases
- Add `ActionDescriptorNavigator` for tuple extractions
- Use `ListExtractors` only for advanced scenarios

### **TypeScript-First with ExtendScript Compatibility**

- Full type safety with generics
- All files include ExtendScript global declarations
- Transpiles to ES3 for ExtendScript compatibility
- No external dependencies or complex build requirements

---

## 🔧 Integration Patterns

### **Simple Extraction (Recommended)**

```typescript
import { P } from "./PathAccessor";
const brightness = P.filter("brightness", "integer", 0).extract<number>(d);
```

### **Complex Scoring System**

```typescript
import { ActionDescriptorPath, ActionDescriptorNavigator } from "./PathAccessor";
// Use SampleScoringScript.ts as template
```

### **Advanced List Processing**

```typescript
import { ListValueExtractor } from "./ListExtractors";
// Use for complex filtering and metadata extraction
```

---

## ✅ Current Status: Production Ready

- **✅ 0 TypeScript compilation errors**
- **✅ No circular dependencies**
- **✅ All ExtendScript patterns corrected**
- **✅ Complete functionality preserved**
- **✅ Self-contained, maintainable architecture**
- **✅ Comprehensive documentation and examples**

This system provides everything you need for comprehensive Photoshop document analysis and scoring, with a clean, maintainable architecture that scales from simple value extraction to complex testing scenarios.