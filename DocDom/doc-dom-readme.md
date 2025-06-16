# InDesign DOM Discovery Builder v2.0

## 🎯 Overview

The **InDesign DOM Discovery Builder** is a safety-first ExtendScript tool that discovers and maps the complete DOM structure of InDesign documents without crashing. It uses a **discovery-first approach** that proves what exists before attempting access, then safely samples collection contents to generate actionable property access patterns.

### 🚀 Key Features

- **Discovery-First Architecture**: Maps document structure → Samples collection contents → Generates access patterns
- **Collection Content Sampling**: Safely drills into discovered collections to map their contents and common properties
- **Safety-First Design**: Never crashes InDesign, even with problematic documents  
- **Progressive Safety Levels**: Properties classified as Safe, Moderate, Risky, or Dangerous
- **Visual DOM Tree with Collection Data**: Shows collection lengths and common item properties
- **Actionable Access Patterns**: Generated code examples for safe property access including collections
- **Multiple Export Formats**: Enhanced text, JSON, and CSV export with collection sampling data
- **ES3 Compatible**: Works across different InDesign versions

---

## 📁 File Structure & Assembly

```
ProjectRoot/
├── DocDom/                           # Sequential module directory
│   ├── 1.0_safe-foundation.jsx      # Ultra-safe property access functions
│   ├── 2.0_dom-enumerator.jsx       # Core DOM structure discovery
│   ├── 3.0_dom-visualizer.jsx       # DOM visualization interface (ENHANCED v2.0)
│   ├── 4.0_property-sampler.jsx     # Property value sampling
│   ├── 5.0_dom-exporter.jsx         # Export DOM structure to files (ENHANCED v2.0)
│   └── 6.0_collection-sampler.jsx   # Collection content sampling (NEW v2.0)
├── doc-dom-loader.jsx               # Sequential assembly loader
└── doc-dom-readme.md               # This file
```

### 🔧 Sequential Assembly Process
The system uses **decimal-numbered modules** (1.0, 2.0, 3.0, etc.) that are loaded sequentially. This allows:
- **Insertion capability**: Can add 2.1, 2.2 between existing modules without renumbering
- **Dependency management**: Module N can only depend on modules < N  
- **Build chunk assembly**: All modules combined into single executable script
- **Modular development**: Individual modules can be updated independently

---

## 🎯 Current Development State

### ✅ **Completed (v2.0)**
- **Discovery-First DOM Enumeration**: Safely maps document structure without value access
- **Collection Content Sampling**: Discovers what's inside collections (stories, pages, layers, etc.)
- **Enhanced UI Integration**: "Sample Collections" button and enhanced tree display
- **Fixed Safety Filter Logic**: Collections discovered during enumeration are sampled with appropriate safety measures
- **Actionable Export**: Generated access patterns with collection-specific code examples
- **Enhanced Export Formats**: Text, JSON, CSV with collection sampling data

### 🔄 **Current Status**
- **Safety architecture validated**: Discovery-first approach prevents crashes while enabling deep exploration
- **Collection sampling operational**: Successfully samples collection contents and generates access patterns
- **Export system enhanced**: Comprehensive output with actionable property access guides
- **All core modules updated**: Latest versions include collection sampling integration

---

## 🚀 Quick Start Workflow

### 1. **Assembly & Loading**
```javascript
// Load via sequential assembly loader:
#include "doc-dom-loader.jsx"
// This loads all DocDom/ modules in sequence and starts the interface
```

### 2. **Standard Workflow: Discover → Sample → Export**
1. **Open InDesign document** (any document)
2. **Click "Enumerate DOM"** - Discovers document structure safely
3. **Click "Sample Collections"** - Maps collection contents and generates access patterns  
4. **Click "Export DOM"** - Saves complete analysis with actionable code examples

### 3. **Results You Get**
```
Before Sampling:
├── stories (object) [risky] [COLLECTION]

After Sampling:  
├── stories [risky] [COLLECTION, length: 3, 8 common props]
    ├── [item].contents (string) [safe]
    ├── [item].textFrames (object) [moderate]
    └── [item].parentStory (object) [moderate]

Generated Access Patterns:
var storyCount = document.stories.length;  // 3
var content = document.stories[0].contents;  // string [safe]
```

---

## 🧩 Module Descriptions

### **1.0 Safe Foundation** (Core)
- Ultra-safe property checking without value access during discovery
- Reserved word detection and dangerous property identification  
- Timeout protection and memory management
- Environment validation for InDesign documents

### **2.0 DOM Enumerator** (Core)
- Discovery-first DOM structure enumeration
- Property classification by safety level (safe/moderate/risky/dangerous)
- Circular reference detection and depth limiting
- Configurable timeouts and property limits

### **3.0 DOM Visualizer** (Enhanced v2.0)
- **NEW**: Collection sampling integration with "Sample Collections" button
- **Enhanced**: Tree display shows collection lengths and common item properties  
- **Enhanced**: Generated access patterns include collection-specific examples
- Real-time enumeration with progress tracking

### **4.0 Property Sampler** (Optional)
- Sample actual property values for safe properties only
- Configurable safety filters and timeouts
- Value formatting and truncation for display
- Enhanced DOM structure with sample values

### **5.0 DOM Exporter** (Enhanced v2.0)
- **Enhanced**: Export includes collection sampling data and access patterns
- **Fixed**: Robust CSV generation and improved JSON output
- **Enhanced**: Property access guides with collection iteration examples
- Text, JSON, and CSV export options with enhanced content

### **6.0 Collection Sampler** (NEW v2.0)
- **Discovery-driven**: Only samples collections found during enumeration
- **Adaptive safety**: Safety level affects HOW to sample, not WHETHER to sample
- **Pattern analysis**: Identifies common properties across collection items
- **Access pattern generation**: Creates ready-to-use property access code

---

## ⚙️ Configuration Options

### **Discovery Configuration**
```javascript
var config = {
    maxDepth: 2,           // Maximum object nesting depth (1-4)  
    timeoutMs: 8000,       // Total enumeration timeout in milliseconds
    skipDangerous: true,   // Skip properties known to cause crashes
    maxProperties: 2000    // Maximum properties to enumerate
};
```

### **Collection Sampling Configuration**
```javascript
var samplingConfig = {
    maxSamplesPerCollection: 3,     // Sample first N items from each collection
    timeoutPerCollection: 3000,     // 3 seconds max per collection
    timeoutPerItem: 500,           // 500ms max per collection item  
    maxCollectionSize: 1000,       // Skip collections larger than 1000 items
    safetyFilter: 'moderate',      // 'safe'|'moderate'|'risky'|'all'
    enableProgressLogging: true    // Log sampling progress
};
```

### **Safety Level Effects on Sampling**
- **Safe Collections**: Sample more items (up to 5), longer timeouts
- **Moderate Collections**: Standard sampling (3 items), normal timeouts  
- **Risky Collections**: Reduced sampling (1-2 items), shorter timeouts
- **Dangerous Collections**: Skipped entirely (functions, dangerous property names)

---

## 🛡️ Safety Architecture

### **Discovery-First Principles**
1. **Prove Existence**: Use `typeof` checks and `in` operator - never access values during discovery
2. **Classify Safety**: Determine safety level based on property type and name patterns
3. **Sample Safely**: Use discovered paths with appropriate safety measures for each classification
4. **Generate Patterns**: Create actionable access code based on proven-safe discovery results

### **Crash Prevention**
- **Timeout Protection**: All operations have maximum execution time limits
- **Circular Reference Detection**: Prevents infinite loops in object traversal
- **Memory Management**: Explicit cleanup and garbage collection hints
- **Error Isolation**: Individual property failures don't stop overall enumeration
- **Graceful Degradation**: Partial success better than total failure

### **Collection Sampling Safety**
- **Path Validation**: Only access collections discovered during enumeration
- **Adaptive Timeouts**: Safety level determines timeout duration and sample size
- **Item-Level Protection**: Each collection item access wrapped in try-catch with timeouts
- **Memory Limits**: Configurable limits on collection size and sampling depth

---

## 📚 API Reference

### **Core Workflow Functions**

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateInDesignEnvironment()` | Check InDesign and document status | `{valid: boolean, error: string, document: object}` |
| `enumerateDocumentDOM(doc, config)` | Discover complete DOM structure | `DOMStructure object` |
| `sampleCollectionContents(domStructure, doc, config)` | Sample collection contents safely | `Enhanced DOMStructure` |
| `showDOMVisualizer()` | Open DOM exploration interface | `Window dialog` |
| `exportDOMStructure(domStructure, format)` | Export to file with access patterns | `{success: boolean, filePath: string}` |

### **Analysis Functions**

| Function | Purpose |
|----------|---------|
| `getDOMStatistics(domStructure)` | Get enumeration statistics |
| `getCollectionSamplingStatistics(domStructure)` | Get collection sampling statistics |
| `findAllCollections(domStructure)` | Find all discovered collections |
| `countPropertiesBySafety(domNode)` | Count properties by safety level |

---

## 🎯 Use Cases & Examples

### **Discover Collections in Your Document**
```javascript
// 1. Discover what collections exist
var domStructure = enumerateDocumentDOM(doc, config);

// 2. Sample collection contents  
var enhanced = sampleCollectionContents(domStructure, doc, samplingConfig);

// 3. Use generated access patterns
var samplingStats = getCollectionSamplingStatistics(enhanced);
$.writeln("Collections sampled: " + samplingStats.collectionsSampled);
```

### **Generated Access Pattern Example**
After discovery and sampling, you get actionable code:
```javascript
// Generated from actual document structure:
var storyCount = document.stories.length;  // 3
var firstStoryContent = document.stories[0].contents;  // string [safe]
var pageCount = document.pages.length;  // 5  
var firstPageBounds = document.pages[0].bounds;  // object [moderate]

// Safe iteration patterns:
try {
    for (var i = 0; i < document.stories.length; i++) {
        var story = document.stories[i];
        var content = story.contents;  // Proven safe from sampling
    }
} catch (exc) { /* handle safely */ }
```

---

## 🔧 Troubleshooting

### **Common Issues**

**"Collections found but 0 sampled"**
- Previous issue: Safety filter was too restrictive, skipping discovered collections
- **Fixed in v2.0**: Discovery-first logic samples discovered collections with appropriate safety measures
- Safety level now affects HOW to sample, not WHETHER to sample

**"Export failed"**  
- **Fixed in v2.0**: Enhanced export functions with better error handling
- All export formats (text, JSON, CSV) now include collection sampling data

**Performance with Large Documents**
- Reduce `maxSamplesPerCollection` to 1 or 2
- Set `maxCollectionSize` to 100 for testing
- Use `timeoutPerCollection: 1000` for faster completion

---

## 🔄 Version History

### **v2.0.0** - Current Enhanced Release
- **NEW**: Collection content sampling with discovery-first approach
- **FIXED**: Safety filter logic - discovered collections are sampled with appropriate safety measures  
- **ENHANCED**: UI with "Sample Collections" button and enhanced tree display
- **ENHANCED**: Export formats include collection sampling data and actionable access patterns
- **ENHANCED**: Property access guides with collection-specific iteration examples
- Sequential module architecture with decimal versioning for insertion capability

### **v1.x** - Discovery Foundation
- Basic DOM structure enumeration
- Safety classification system
- Simple export functionality

---

## 🎯 Current Capabilities Summary

**What the system does now:**
1. **Discovers** your document's DOM structure safely without crashing
2. **Maps** collection contents (stories, pages, layers, etc.) to show what's inside
3. **Generates** actionable property access code you can copy-paste into your scripts
4. **Exports** comprehensive analysis with ready-to-use access patterns
5. **Adapts** to different document types and InDesign versions automatically

**Key insight**: The system transforms "I wonder what's available" into "Here's exactly how to access it safely" through discovery-first exploration of your specific document.

---

## 🏁 Getting Started Checklist

- [ ] Place all `.jsx` files in `DocDom/` directory  
- [ ] Open InDesign with a test document
- [ ] Run `doc-dom-loader.jsx` to load system sequentially
- [ ] Verify system loads without errors  
- [ ] Click "Enumerate DOM" to discover structure
- [ ] Click "Sample Collections" to map collection contents
- [ ] Click "Export DOM" to save actionable analysis
- [ ] Review generated access patterns in exported file

**Ready to safely discover and access your InDesign document's complete DOM structure!** 🚀