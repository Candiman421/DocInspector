# Fluent Photoshop Scoring System - Architecture Overview

## 📁 File Structure and Purpose

This system consists of **6 core files** that work together to provide a comprehensive TypeScript-based Photoshop document analysis and scoring system:

### **Core Library Files (Import These)**

| Artifact ID        | File Name                        | Purpose                                  | Import Priority |
| ------------------ | -------------------------------- | ---------------------------------------- | --------------- |
| `action_navigator` | **ActionDescriptorNavigator.ts** | Core navigation engine                   | **Required**    |
| `path_accessor`    | **PathAccessor.ts**              | Fluent path-based API (your favorite)    | **Required**    |
| `list_extractors`  | **ListExtractors.ts**            | List/array extraction with tuple support | **Required**    |

### **Documentation and Examples**

| Artifact ID             | File Name                  | Purpose                              | Status    |
| ----------------------- | -------------------------- | ------------------------------------ | --------- |
| `usage_examples`        | **UsageExamples.ts**       | Complete usage patterns and examples | Reference |
| `sample_scoring_script` | **SampleScoringScript.ts** | Full scoring system implementation   | Template  |
| `documentation`         | **README.md**              | Complete API documentation           | Reference |

### **Status: All Active, None Deprecated**

✅ **All artifacts are current and actively maintained**  
❌ **No deprecated files** - the system evolved cohesively

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Scoring Script                      │
├─────────────────────────────────────────────────────────────┤
│  Import: ActionDescriptorPath, P, ListValueExtractor        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   PathAccessor.ts                           │
│  • Fluent path-based API (your preferred method)            │
│  • ActionDescriptorPath.create().object().list().value()    │
│  • Transformations: .floor(), .round(), .toPixels()         │
│  • Extraction: .extract(), .tryExtract(), .extractOr()      │
└─────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────────┐
│     ActionDescriptorNavigator.ts   │ │        ListExtractors.ts            │
│  • Core navigation engine          │ │  • List/array extraction            │
│  • .object(), .list(), .getValue() │ │  • Tuple destructuring              │
│  • Tuple/object value extraction   │ │  • Dynamic quantity handling        │
│  • Type-safe operations            │ │  • .extractAsTuple(), .extractAll() │
└────────────────────────────────────┘ └─────────────────────────────────────┘
                    │                           │
                    └───────────┬───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                ExtendScript ActionManager                   │
│           executeActionGet(), stringIDToTypeID()            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Detailed File Breakdown

### **1. ActionDescriptorNavigator.ts** - Core Navigation Engine

**Purpose**: Provides the foundational navigation methods for traversing ActionDescriptor structures.

**Key Features**:

- Basic navigation: `.object()`, `.list()`, `.getValue()`
- Tuple extraction: `.getValues()`, `.getValuesAsObject()`
- Type-safe value retrieval with transformations
- Error handling and fallback mechanisms

**When to Use**:

- When you need imperative-style navigation
- When extracting multiple values as tuples/objects
- When building complex custom extraction logic

**Example**:

```typescript
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

const [brightness, contrast] = ActionDescriptorNavigator.from(r)
  .object("smartObjectMore")
  .list("filterFXList")
  .getObject(0)
  .getValues([
    { key: "brightness", type: "integer" },
    { key: "contrast", type: "integer" },
  ]);
```

### **2. PathAccessor.ts** - Fluent Path-Based API ⭐

**Purpose**: Your preferred declarative, fluent API for path-based value extraction.

**Key Features**:

- Fluent chaining: `.create().object().list().at().value()`
- Built-in transformations: `.floor()`, `.round()`, `.toPixels()`, `.toPercentage()`
- Multiple extraction methods: `.extract()`, `.tryExtract()`, `.extractOr()`
- Factory functions: `P.bounds()`, `P.textStyle()`, `P.filter()`

**When to Use**:

- **Primary choice for most extractions**
- When you want readable, declarative code
- When you need value transformations
- When building test specifications

**Example**:

```typescript
import { ActionDescriptorPath, P } from "./PathAccessor";

// Your favorite syntax
const brightness = ActionDescriptorPath.create()
  .object("smartObjectMore")
  .list("filterFXList")
  .at(0)
  .value("brightness", "integer")
  .extract<number>(d);

// Or with factory functions
const fontSize = P.textStyle("sizeKey", "double", 0)
  .round(1)
  .extract<number>(d);
```

### **3. ListExtractors.ts** - List/Array Extraction Specialist

**Purpose**: Handles complex list extractions including fixed/dynamic quantities and tuple destructuring.

**Key Features**:

- Fixed-size tuple extraction: `.extractAsTuple()`
- Dynamic quantity handling: `.extractAllAsObject()`, `.extractAllWithMinimum()`
- Conditional extraction: `.extractWhere()`, `.extractFirst()`
- Metadata extraction: `.extractAllWithMetadata()`

**When to Use**:

- When dealing with lists of unknown size
- When you need tuple destructuring for individual items
- When you want "at least N items" or "up to N items" behavior
- When processing paragraph styles, layers, filters, etc.

**Example**:

```typescript
import { ActionDescriptorPath } from "./PathAccessor";

// Fixed tuple destructuring
const [bullet1, bullet2, bullet3, bullet4] = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAsTuple("paragraphStyle.listStyleType", "enumerated", 4, "plain")
  .extractAll<[string, string, string, string]>(d);

// Dynamic quantity with minimum guarantee
const layerNames = ActionDescriptorPath.create()
  .list("layers")
  .extractAllWithMinimum("name", "string", 3, "Missing Layer")
  .extractAll<string>(d);
```

### **4. UsageExamples.ts** - Complete Reference Guide

**Purpose**: Comprehensive examples showing every usage pattern and scenario.

**Contents**:

- Basic value extraction patterns
- Tuple and object destructuring examples
- Dynamic list extraction scenarios
- Error handling patterns
- Real-world scoring examples

**When to Use**:

- Learning the API
- Finding patterns for specific scenarios
- Copy-paste starting points
- Understanding best practices

**Not for Import**: This is a reference file, not a library file.

### **5. SampleScoringScript.ts** - Complete Implementation Template

**Purpose**: Full working example of a Photoshop test scoring system.

**Contents**:

- Complete test specification interface
- Candidate answer extraction
- Scoring and evaluation logic
- Detailed feedback generation
- Error handling and reporting

**When to Use**:

- As a template for your own scoring systems
- Understanding how all pieces fit together
- Learning comprehensive implementation patterns
- Quick-start for new projects

**How to Use**: Copy and modify for your specific test requirements.

### **6. README.md** - Complete Documentation

**Purpose**: Comprehensive API documentation and usage guide.

**Contents**:

- Complete API reference
- Usage patterns and examples
- Best practices and recommendations
- TypeScript configuration guidance
- Troubleshooting and common issues

**When to Use**:

- Understanding the complete API
- Learning advanced features
- Finding specific method signatures
- Setting up TypeScript configuration

---

## 🚀 How to Use This System

### **Step 1: Set Up Your Project**

```bash
# Copy the core files to your project
cp ActionDescriptorNavigator.ts ./src/
cp PathAccessor.ts ./src/
cp ListExtractors.ts ./src/
```

### **Step 2: Import What You Need**

```typescript
// Most common imports (covers 90% of use cases)
import { ActionDescriptorPath, P } from "./PathAccessor";

// For complex tuple extractions
import { ActionDescriptorNavigator } from "./ActionDescriptorNavigator";

// For advanced list operations
import { ListValueExtractor } from "./ListExtractors";
```

### **Step 3: Start Building**

```typescript
// Use your favorite path-based syntax
const answers = {
  brightness: ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .at(0)
    .value("brightness", "integer")
    .extract<number>(d),

  fontSize: P.textStyle("sizeKey", "double", 0).round(1).extract<number>(d),

  layerWidth: P.bounds("width").extract<number>(d),
};
```

### **Step 4: Handle Complex Scenarios**

```typescript
// Tuple destructuring for individual items
const [bullet1, bullet2, bullet3, bullet4] = ActionDescriptorPath.create()
  .object("text")
  .list("paragraphStyleRange")
  .extractAsTuple("paragraphStyle.listStyleType", "enumerated", 4, "plain")
  .extractAll<[string, string, string, string]>(d);

// Dynamic quantities
const allLayerNames = ActionDescriptorPath.create()
  .list("layers")
  .extractAllWithMinimum("name", "string", 3, "Missing Layer")
  .extractAll<string>(d);
```

---

## 🎯 Design Philosophy

### **Layered Architecture**

- **PathAccessor** = High-level, declarative API (your preferred interface)
- **ActionDescriptorNavigator** = Mid-level, imperative navigation
- **ListExtractors** = Specialized list handling
- **ExtendScript** = Low-level ActionManager operations

### **Progressive Enhancement**

- Start with `ActionDescriptorPath.create()` for 90% of use cases
- Add `ListExtractors` for complex list scenarios
- Use `ActionDescriptorNavigator` for advanced custom logic

### **Value-Centric Design**

- All methods return **actual values** for assignment
- No boolean validation results - you get the data you need
- Direct assignment to answer objects: `answers.prop = path.extract(d)`

### **TypeScript-First**

- Full type safety with generics
- Transpiles to ES3 for ExtendScript compatibility
- IntelliSense support for all APIs

---

## 🔧 Integration Patterns

### **Simple Extraction**

```typescript
import { P } from "./PathAccessor";
const brightness = P.filter("brightness", "integer", 0).extract<number>(d);
```

### **Complex Scoring System**

```typescript
import { ActionDescriptorPath } from "./PathAccessor";
// Use SampleScoringScript.ts as template
```

### **Dynamic List Processing**

```typescript
import { ActionDescriptorPath } from "./PathAccessor";
// Use patterns from UsageExamples.ts
```

This system provides everything you need for comprehensive Photoshop document analysis and scoring, with a clean, maintainable architecture that scales from simple value extraction to complex testing scenarios.
