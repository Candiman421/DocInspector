# InDesign DOM Discovery Builder v2.0

## 🎯 Overview

The **InDesign DOM Discovery Builder** is a safety-first ExtendScript tool that discovers and maps the complete DOM structure of InDesign documents without crashing. Instead of guessing what properties exist, it dynamically discovers what's actually available in your specific document and displays it in a user-friendly interface.

### 🚀 Key Features

- **Discovery-First Approach**: Maps document structure before attempting property access
- **Safety-First Design**: Never crashes InDesign, even with problematic documents  
- **Progressive Safety Levels**: Properties classified as Safe, Moderate, Risky, or Dangerous
- **Visual DOM Tree**: Interactive interface showing complete document structure
- **Property Access Guide**: Generated code examples for safe property access
- **Multiple Export Formats**: Text, JSON, and CSV export options
- **ES3 Compatible**: Works across different InDesign versions

---

## 📁 File Structure

```
ProjectRoot/
├── DocDom/                           # Main module directory
│   ├── 1.0_safe-foundation.jsx      # Ultra-safe property access functions
│   ├── 2.0_dom-enumerator.jsx       # Core DOM structure discovery
│   ├── 3.0_dom-visualizer.jsx       # DOM visualization interface  
│   ├── 4.0_property-sampler.jsx     # Optional: Sample property values
│   └── 5.0_dom-exporter.jsx         # Export DOM structure to files
├── 0_MAIN_DOM_Explorer.jsx          # Main loader and entry point
├── 9_DEMO_Test_DOM_Discovery.jsx    # Demo and testing script
└── README_DOM_Discovery_Builder.md  # This file
```

---

## 🚀 Quick Start

### 1. **Load the System**
```javascript
// In ExtendScript or Adobe ExtendScript Toolkit (ESTK):
// #include "0_MAIN_DOM_Explorer.jsx" - I renamed this to below:
#include "doc-dom-loader.jsx"
// This automatically loads all modules and shows the interface
```

### 2. **Open DOM Explorer Interface**
```javascript
showDOMVisualizer();
// Opens the DOM Discovery interface
```

### 3. **Discover Document Structure**
1. Open an InDesign document
2. Click **"Enumerate DOM"** in the interface
3. View the complete DOM structure tree
4. Export results for development use

### 4. **Run Demonstrations**
```javascript
#include "9_DEMO_Test_DOM_Discovery.jsx"
runDOMDiscoveryDemo();
// Tests all functionality and shows examples
```

---

## 🧩 Module Descriptions

### **1.0 Safe Foundation** (Required)
- Ultra-safe property checking without value access
- Reserved word detection and dangerous property identification
- Timeout protection and memory management
- Environment validation for InDesign documents

### **2.0 DOM Enumerator** (Required)
- Core DOM structure discovery engine
- Property classification by safety level
- Circular reference detection
- Configurable depth and timeout controls

### **3.0 DOM Visualizer** (Required)
- User interface for DOM exploration
- Interactive tree display of document structure
- Real-time enumeration with progress tracking
- Integration with sampling and export modules

### **4.0 Property Sampler** (Optional)
- Sample actual property values for safe properties
- Configurable safety filters and timeouts
- Value formatting and truncation for large data
- Enhanced DOM structure with sample values

### **5.0 DOM Exporter** (Optional)
- Export DOM structure to multiple formats
- Generated property access guides with code examples
- Text, JSON, and CSV export options
- Automatic file naming and safe file operations

---

## 🎮 Usage Examples

### **Basic DOM Discovery**
```javascript
// Load system
#include "0_MAIN_DOM_Explorer.jsx"

// Quick analysis
var domStructure = quickDOMAnalysis();

// View statistics
var stats = getDOMStatistics(domStructure);
$.writeln("Properties found: " + stats.totalProperties);
```

### **Manual Enumeration**
```javascript
// Validate environment
var envResult = validateInDesignEnvironment();
if (envResult.valid) {
    var doc = envResult.document;
    
    // Configure enumeration
    var config = {
        maxDepth: 2,
        timeoutMs: 5000,
        skipDangerous: true,
        maxProperties: 1000
    };
    
    // Enumerate DOM
    var domStructure = enumerateDocumentDOM(doc, config);
    
    // Show results
    showDOMVisualizer();
}
```

### **Property Value Sampling**
```javascript
// After enumeration, sample safe property values
var samplingConfig = {
    safetyFilter: 'safe',        // Only sample safe properties
    maxSamples: 10,              // Limit collection sampling
    timeoutMs: 1000,             // Timeout per property
    includeCollectionSamples: false
};

var sampledDOM = sampleDOMValues(domStructure, samplingConfig);
```

### **Export Results**
```javascript
// Export to different formats
var textExport = exportDOMStructure(domStructure, 'text');
var jsonExport = exportDOMStructure(domStructure, 'json');
var csvExport = exportDOMStructure(domStructure, 'csv');

if (textExport.success) {
    $.writeln("Export saved to: " + textExport.filePath);
}
```

---

## ⚙️ Configuration Options

### **Enumeration Configuration**
```javascript
var config = {
    maxDepth: 2,           // Maximum object nesting depth (1-4)
    timeoutMs: 5000,       // Total enumeration timeout in milliseconds
    skipDangerous: true,   // Skip properties known to cause crashes
    maxProperties: 1000    // Maximum properties to enumerate
};
```

### **Safety Levels**
- **Safe** ✅: Basic value types (string, number, boolean) - recommended for direct access
- **Moderate** ⚠️: Object properties that aren't collections - use with caution
- **Risky** ⚡: Collections and complex objects - require error handling
- **Dangerous** ❌: Functions and known crash-prone properties - avoid

### **Sampling Configuration**
```javascript
var samplingConfig = {
    safetyFilter: 'safe',           // 'safe' | 'safe_and_moderate' | 'all'
    maxSamples: 10,                 // Max items to sample from collections
    timeoutMs: 1000,                // Timeout per property access
    includeCollectionSamples: false, // Whether to sample collection items
    maxStringLength: 500,           // Truncate long strings
    maxObjectDepth: 1               // Depth limit for object display
};
```

---

## 🛡️ Safety Features

### **Crash Prevention**
- Never accesses property values during discovery phase
- Comprehensive timeout protection on all operations
- Circular reference detection prevents infinite loops
- Memory management with explicit cleanup
- Graceful error handling with detailed logging

### **Document Compatibility** 
- Works with locked, unsaved, or problematic documents
- Adapts to different InDesign versions automatically
- Handles documents with complex graphics and layouts
- Safe operation even with corrupted or unusual content

### **Error Recovery**
- Individual property failures don't stop overall enumeration
- Detailed error reporting with recovery suggestions
- Fallback mechanisms for critical operations
- Comprehensive logging for troubleshooting

---

## 🔧 Troubleshooting

### **Common Issues**

**"Module directory not found"**
- Ensure all `.jsx` files are in the `DocDom` folder
- Run `0_MAIN_DOM_Explorer.jsx` from the parent directory of `DocDom`

**"No document is currently open"**
- Open an InDesign document before running enumeration
- Check that the document is accessible (not locked)

**"DOM enumeration failed"**
- Try with a simpler document first
- Reduce `maxDepth` and `maxProperties` in configuration
- Enable `skipDangerous` option
- Check ExtendScript console for detailed error messages

**"Export failed"**
- Check file write permissions in target directory
- Try different export formats (text is most reliable)
- Ensure sufficient disk space available

### **Performance Optimization**

For large or complex documents:
- Set `maxDepth: 1` for initial testing
- Use `maxProperties: 500` to limit scope
- Enable `skipDangerous: true` 
- Reduce `timeoutMs` for faster completion
- Run enumeration on saved documents when possible

### **Debug Mode**
```javascript
// Enable verbose logging
MAIN_LOADER_CONFIG.verboseLoading = true;

// Check system status
var validation = validateDOMDiscoverySystem();
$.writeln("System valid: " + validation.valid);
```

---

## 📚 API Reference

### **Core Functions**

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateInDesignEnvironment()` | Check InDesign and document status | `{valid: boolean, error: string, document: object}` |
| `enumerateDocumentDOM(doc, config)` | Discover complete DOM structure | `DOMStructure object` |
| `showDOMVisualizer()` | Open DOM exploration interface | `Window dialog` |
| `getDOMStatistics(domStructure)` | Get enumeration statistics | `Statistics object` |
| `sampleDOMValues(domStructure, config)` | Sample property values safely | `Enhanced DOMStructure` |
| `exportDOMStructure(domStructure, format)` | Export to file | `{success: boolean, filePath: string}` |

### **Utility Functions**

| Function | Purpose |
|----------|---------|
| `safeTypeCheck(obj, propName)` | Get property type without accessing value |
| `safeHasProperty(obj, propName)` | Check property existence safely |
| `isReservedWord(propName)` | Detect ES3 reserved words |
| `isDangerousProperty(propName)` | Identify crash-prone properties |
| `createTimeoutChecker(maxMs)` | Create timeout protection |
| `createStringBuilder()` | Memory-efficient string building |

---

## 🎯 Use Cases

### **ExtendScript Development**
- Discover available properties for script development
- Generate safe property access patterns
- Understand document structure variations
- Create adaptive scripts that work across document types

### **InDesign Automation**
- Map document structures for automated processing
- Identify safe properties for batch operations
- Generate property inventories for complex documents
- Create document analysis and reporting tools

### **Quality Assurance**
- Validate document structures meet requirements
- Identify problematic or unusual document patterns
- Test script compatibility across document types
- Generate compliance reports for document standards

### **Learning and Research**
- Explore InDesign's object model interactively
- Understand property relationships and hierarchies
- Generate documentation for InDesign APIs
- Create reference materials for development teams

---

## 🔄 Version History

### **v2.0.0** - Current Release
- Complete rewrite with discovery-first architecture
- Sequential module loading system
- Enhanced safety with timeout protection
- Comprehensive DOM visualization interface
- Property value sampling with safety filters
- Multiple export formats with access guides
- ES3 compatibility across InDesign versions

### **Previous Versions**
- v1.x: Original analysis-first approach (deprecated)
- Multiple failed attempts with "chunks" and "modules" architectures

---

## 📝 License & Support

This is a research and development tool for InDesign ExtendScript development. 

**Support:**
- Check ExtendScript console for detailed error messages
- Run `9_DEMO_Test_DOM_Discovery.jsx` to validate system functionality
- Use `validateDOMDiscoverySystem()` to check module loading
- Review this README for configuration and troubleshooting guidance

**Contributing:**
- Test with different document types and InDesign versions
- Report compatibility issues and edge cases
- Suggest improvements to safety and performance
- Share use cases and applications

---

## 🏁 Getting Started Checklist

- [ ] Place all `.jsx` files in correct directory structure
- [ ] Open InDesign with a test document
- [ ] Run `0_MAIN_DOM_Explorer.jsx` to load system
- [ ] Verify system loads without errors
- [ ] Click "Enumerate DOM" in the interface
- [ ] Review discovered DOM structure
- [ ] Export results to examine property access guide
- [ ] Run `9_DEMO_Test_DOM_Discovery.jsx` to validate functionality

**Ready to discover your InDesign document's DOM structure safely and comprehensively!** 🚀