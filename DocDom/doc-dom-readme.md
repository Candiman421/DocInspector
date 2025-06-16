# InDesign DOM Discovery Builder v2.1

## 🎯 Overview

The **InDesign DOM Discovery Builder** is a comprehensive ExtendScript toolkit for safely discovering, analyzing, and comparing DOM structures in Adobe InDesign documents. It uses a **discovery-first architecture** with advanced analysis capabilities including before/after document comparison, deep object mapping, and comprehensive reporting.

### 🚀 Key Features

- **Discovery-First Architecture**: Maps document structure → Samples collection contents → Generates access patterns
- **Deep DOM Mapping**: Exhaustive traversal up to 8 levels with object deduplication and reference tracking
- **Before/After Comparison**: Load and compare JSON exports to detect document changes
- **Advanced JSON Analysis**: Post-process exported data to create visual hierarchies and developer guides
- **Collection Content Sampling**: Safely drills into discovered collections to map their contents and common properties
- **Safety-First Design**: Never crashes InDesign, even with problematic documents  
- **Progressive Safety Levels**: Properties classified as Safe, Moderate, Risky, or Dangerous
- **Object Reference Tracking**: Detects when same object is accessible via multiple paths
- **Circular Reference Detection**: Maps and handles circular object relationships
- **Multiple UI Interfaces**: Basic discovery interface and advanced analysis interface
- **Comprehensive Export Formats**: Enhanced text, JSON, CSV, and HTML export with detailed analysis
- **Performance Monitoring**: Memory usage tracking and optimization recommendations
- **ES3 Compatible**: Works across different InDesign versions

---

## 📁 File Structure & Assembly

```
ProjectRoot/
├── DocDom/                           # Sequential module directory
│   ├── 1.0_safe-foundation.jsx      # Enhanced ultra-safe property access with reference tracking
│   ├── 2.0_dom-enumerator.jsx       # Enhanced DOM structure discovery (deeper traversal)
│   ├── 3.0_dom-visualizer.jsx       # Basic DOM visualization interface (fixed dependencies)
│   ├── 4.0_property-sampler.jsx     # Enhanced property value sampling with reference tracking
│   ├── 5.0_dom-exporter.jsx         # Enhanced export with reference IDs and access paths
│   ├── 6.0_collection-sampler.jsx   # Enhanced collection content sampling (discovery-first)
│   ├── 7.0_json-analyzer.jsx        # JSON post-processing and visual hierarchy generation
│   ├── 8.0_dom-comparator.jsx       # Before/after document comparison analysis
│   ├── 9.1_deep-mapper-core.jsx     # Deep DOM mapping core engine with object atlas
│   ├── 9.2_deep-mapper-analysis.jsx # Deep mapping analysis, reporting, and developer guides
│   └── 10.0_advanced-ui.jsx         # Advanced UI with JSON analysis and comparison features
├── doc-dom-loader.jsx               # Sequential assembly loader
└── doc-dom-readme.md               # This file
```

### 🔧 Sequential Assembly Process
The system uses **decimal-numbered modules** (1.0, 2.0, 3.0, etc.) that are loaded sequentially. This allows:
- **Insertion capability**: Can add 2.1, 2.2 between existing modules without renumbering
- **Dependency management**: Module N can only depend on modules < N  
- **Build chunk assembly**: All modules combined into single executable script
- **Modular development**: Individual modules can be updated independently

**CRITICAL**: Dependencies must follow sequential order. Module 3.0 can only depend on 1.0 and 2.0, not higher-numbered modules like 7.0 or 8.0.

## 🏛️ Key Architectural Decisions

### **Two-Tier UI Strategy**
- **3.0 Basic Interface**: Hard dependencies 1.0, 2.0; optional enhancement 6.0 for collection sampling
- **10.0 Advanced Interface**: Can depend on all modules (7.0, 8.0) for analysis and comparison features
- **Rationale**: Maintains sequential dependency model while providing advanced capabilities

### **Deep Mapper Split (9.1 + 9.2)**
- **9.1 Core Engine**: Exhaustive DOM traversal and object atlas creation
- **9.2 Analysis**: Post-processing, reporting, and developer guide generation  
- **Rationale**: Each module stays under 1000 lines for maintainability and generation efficiency

### **Discovery-First Philosophy**
- **Never access property values during initial discovery** - only check existence and type
- **Sample safely after discovery** using proven-safe paths with appropriate safety measures
- **Generate actionable patterns** based on verified object structures
- **Rationale**: Prevents ExtendScript crashes while enabling comprehensive analysis

## 🔧 Technical Constraints & Design Principles

### **ES3 Compatibility Requirements**
- **No modern JavaScript features** - compatible with ExtendScript engines across InDesign versions
- **No emoticons or Unicode** in any code files (ExtendScript limitation)
- **Traditional for-in loops** and function declarations only
- **Safe property access patterns** using typeof and 'in' operator

### **ExtendScript Safety Patterns**
- **Timeout protection** on all operations to prevent infinite hangs
- **Memory management** with explicit cleanup and garbage collection hints
- **Error isolation** so individual property failures don't crash entire enumeration
- **Circular reference detection** to prevent infinite loops during traversal

### **Module Independence Requirements**
- **Sequential dependencies only** - Module N can only use functions from modules < N
- **Shared global scope** via #include - all functions available globally after loading
- **Consistent safety utilities** - all modules use foundation functions for reliability
- **Modular enhancement** - new features added as new modules rather than modifying existing ones

---

## 🎯 Current Development State

### ✅ **Completed (v2.1)**
- **Enhanced Discovery-First DOM Enumeration**: Safely maps document structure with deeper traversal (up to 6 levels)
- **Deep DOM Mapping**: Exhaustive object mapping with reference tracking and circular reference detection
- **Advanced Collection Content Sampling**: Enhanced discovery and sampling of collection contents
- **Before/After Document Comparison**: Load JSON exports and compare document changes
- **JSON Analysis and Visualization**: Post-process exports to create developer-friendly hierarchies
- **Advanced UI Integration**: Dual interfaces for basic discovery and advanced analysis
- **Object Reference Tracking**: Comprehensive tracking of object instances and access paths
- **Performance Monitoring**: Memory usage tracking and optimization recommendations
- **Enhanced Export Formats**: Text, JSON, CSV, HTML with reference tracking and analysis data
- **Developer Guide Generation**: Automated creation of property access guides with code examples

### 🔄 **Current Status**
- **Complete toolkit operational**: All 11 modules working together for comprehensive DOM analysis
- **Architecture validated**: Sequential dependency model maintained throughout
- **Safety principles enforced**: Discovery-first approach prevents crashes while enabling deep exploration
- **Before/after workflow established**: Full document comparison and change detection capability
- **Performance optimized**: Memory management and timeout protection for large documents

### 🏗️ **Development Evolution**
This system evolved from v2.0 (6 modules) to v2.1 (11 modules) through iterative enhancement:
- **Core requirement**: "Before and after snapshots" of document analysis for change detection
- **Architecture expansion**: Added 5 new modules while maintaining sequential dependency model
- **Critical fix**: Resolved illegal dependency violations (3.0 depending on 7.0/8.0) by creating 10.0
- **Module splitting**: Split deep mapper into 9.1/9.2 to maintain sub-1000 line guideline
- **Safety-first approach**: All enhancements maintain ES3 compatibility and crash prevention principles

---

## 🚀 Workflow Options

### **Standard Workflow: Discover → Sample → Export**
1. **Open InDesign document** (any document)
2. **Click "Enumerate DOM"** - Discovers document structure safely (up to 4 levels by default)
3. **Click "Sample Collections"** - Maps collection contents and generates access patterns  
4. **Click "Export DOM"** - Saves complete analysis with actionable code examples

### **Advanced Workflow: Export → Analyze → Compare → Report**
1. **Export DOM to JSON** using standard workflow
2. **Make changes to document** (modify content, add/remove elements)
3. **Export DOM again** to create second snapshot
4. **Open Advanced UI** - Use `showAdvancedDOMAnalysis()`
5. **Load both JSON exports** for comparison
6. **Run analysis and comparison** to see what changed
7. **Generate comprehensive reports** with developer recommendations

### **Deep Analysis Workflow: Map → Analyze → Report**
1. **Run deep DOM mapping** - `performDeepDOMMapping(doc, config)` for exhaustive analysis
2. **Analyze mapping results** - `analyzeDeepMappingSession(session, config)` for comprehensive insights
3. **Generate developer guides** with object access recommendations and performance tips

### 3. **Results You Get**

**Basic Discovery:**
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

**Advanced Analysis:**
```
Deep Mapping Results:
├── Total objects discovered: 1,247
├── Unique objects: 892
├── Duplicate references: 355
├── Circular references: 12
├── Access patterns: 234
└── Performance: 156 objects/second

Before/After Comparison:
├── Changes detected: 23
├── Properties added: 8
├── Properties removed: 3
├── Properties modified: 12
└── Collections changed: 2
```

---

## 🧩 Module Descriptions

### **Core Foundation Modules**

#### **1.0 Safe Foundation (Enhanced)**
- Enhanced ultra-safe property checking with object reference tracking
- Path utilities for dot notation manipulation
- Enhanced memory management and monitoring
- Object reference ID generation and deduplication support
- Environment validation for InDesign documents

#### **2.0 DOM Enumerator (Enhanced)**
- Enhanced discovery-first DOM structure enumeration with deeper traversal (up to 6 levels)
- Enhanced property classification by safety level with path analysis
- Improved circular reference detection and mapping
- Enhanced timeout protection and memory management
- Configurable depth and property limits

### **Core Feature Modules**

#### **3.0 DOM Visualizer (Fixed Dependencies)**
- Basic DOM structure visualization interface
- Collection sampling integration with "Sample Collections" button (if 6.0 available)
- Enhanced tree display with collection lengths and properties
- Real-time enumeration with progress tracking
- **FIXED**: Hard dependencies limited to 1.0, 2.0 only (sequential rule compliance)

#### **4.0 Property Sampler (Enhanced)**
- Enhanced property value sampling with reference tracking integration
- Value metadata generation and comparison fingerprints
- Deep value analysis with object type detection
- Enhanced sample value formatting and display
- Optional integration with DOM discovery workflow

#### **5.0 DOM Exporter (Enhanced)**
- Enhanced export with object reference IDs and access path arrays
- Comprehensive metadata for post-processing tools
- Enhanced text, JSON, and CSV formats with reference tracking
- Larger content limits for full DOM captures
- Collection sampling data integration in all export formats

#### **6.0 Collection Sampler (Enhanced)**
- Enhanced discovery-driven collection content sampling
- Adaptive safety: Safety level affects HOW to sample, not WHETHER to sample
- Enhanced pattern analysis with deeper property discovery
- Access pattern generation with ready-to-use code examples
- Integration with object reference tracking

### **Advanced Analysis Modules**

#### **7.0 JSON Analyzer**
- Post-process exported JSON to create visual DOM hierarchies
- Extract object type/name information in developer-friendly format
- Create pragmatic views focused on developer needs
- Handle large JSON files efficiently with memory management
- Generate simplified textual representations from complex JSON data

#### **8.0 DOM Comparator**
- Before/after snapshot comparison with detailed change detection
- Load two JSON exports and identify differences
- Generate diff reports showing added/removed/changed properties
- Track property value changes and new object appearances
- Executive summary generation for change impact analysis

#### **9.1 Deep Mapper Core**
- Exhaustive DOM traversal with configurable depth limits (up to 8 levels)
- Comprehensive object atlas with reference tracking and deduplication
- Advanced circular reference mapping and analysis
- Performance monitoring with memory usage tracking
- Object access pattern generation for multiple paths to same object

#### **9.2 Deep Mapper Analysis**
- Post-process deep mapping results with comprehensive analysis
- Object usability evaluation and developer recommendations
- Access pattern analysis with complexity scoring
- Performance analysis with optimization recommendations
- Automated developer guide generation with code examples

### **Advanced Interface Module**

#### **10.0 Advanced UI**
- Advanced interface with JSON analysis and before/after comparison
- Load and analyze JSON exports from basic workflow
- Compare document snapshots with detailed diff visualization
- Export comprehensive analysis reports in multiple formats
- Integration with all analysis modules for complete workflow

---

## ⚙️ Configuration Options

### **Discovery Configuration**
```javascript
var config = {
    maxDepth: 4,           // Maximum object nesting depth (1-8, enhanced from 1-4)  
    timeoutMs: 10000,      // Total enumeration timeout (increased from 8000ms)
    skipDangerous: true,   // Skip properties known to cause crashes
    maxProperties: 3000    // Maximum properties to enumerate (increased from 2000)
};
```

### **Collection Sampling Configuration**
```javascript
var samplingConfig = {
    maxSamplesPerCollection: 3,     // Sample first N items from each collection
    timeoutPerCollection: 3000,     // 3 seconds max per collection
    timeoutPerItem: 1000,          // 1 second max per collection item  
    maxCollectionSize: 1000,       // Skip collections larger than 1000 items
    enableProgressLogging: true    // Log sampling progress
    // Note: safetyFilter removed - uses discovery-first approach
};
```

### **Deep Mapping Configuration**
```javascript
var deepConfig = {
    maxDepth: 6,                    // Deep traversal depth (up to 8 supported)
    timeoutMs: 30000,               // 30 second timeout for complete mapping
    maxTotalObjects: 10000,         // Limit total objects for memory management
    trackAllPaths: true,            // Track every path to each object
    enableObjectAtlas: true,        // Build comprehensive object reference atlas
    deduplicateReferences: true,    // Detect and mark duplicate object references
    includeSystemObjects: false     // Whether to include system/built-in objects
};
```

### **Analysis Configuration**
```javascript
var analysisConfig = {
    generateObjectReport: true,     // Generate comprehensive object report
    generateAccessReport: true,     // Generate access pattern analysis
    generateCircularReport: true,   // Analyze circular references
    analyzePerformance: true,       // Performance analysis
    includeDeveloperGuide: true,    // Generate developer access guide
    includeCodeExamples: true       // Include ready-to-use code examples
};
```

### **Comparison Configuration**
```javascript
var comparisonConfig = {
    includePropertyValues: true,    // Compare actual property values
    detectMoved: true,              // Detect moved/reorganized objects
    includeCollectionChanges: true, // Track collection content changes
    showUnchanged: false           // Hide unchanged properties in diff
};
```

---

## 🛡️ Safety Architecture

### **Discovery-First Principles**
1. **Prove Existence**: Use `typeof` checks and `in` operator - never access values during discovery
2. **Classify Safety**: Determine safety level based on property type and name patterns
3. **Sample Safely**: Use discovered paths with appropriate safety measures for each classification
4. **Track References**: Maintain object reference maps to detect duplicates and circular references
5. **Generate Patterns**: Create actionable access code based on proven-safe discovery results

### **Enhanced Crash Prevention**
- **Timeout Protection**: All operations have maximum execution time limits with enhanced monitoring
- **Circular Reference Detection**: Advanced mapping and handling of circular object relationships
- **Memory Management**: Comprehensive cleanup, garbage collection hints, and usage monitoring
- **Error Isolation**: Individual property failures don't stop overall enumeration
- **Graceful Degradation**: Partial success better than total failure
- **Path Safety Analysis**: Enhanced dangerous path detection for deep traversal

### **Object Reference Safety**
- **Reference Tracking**: Comprehensive tracking of object instances across multiple access paths
- **Deduplication**: Intelligent detection of same objects accessed via different routes
- **Atlas Management**: Centralized object registry with metadata and access pattern tracking
- **Memory Optimization**: Efficient reference management to prevent memory leaks

---

## 📚 API Reference

### **Core Workflow Functions**

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateInDesignEnvironment()` | Check InDesign and document status | `{valid: boolean, error: string, document: object, warnings: array}` |
| `enumerateDocumentDOM(doc, config)` | Discover complete DOM structure | `Enhanced DOMStructure object` |
| `sampleCollectionContents(domStructure, doc, config)` | Sample collection contents safely | `Enhanced DOMStructure with sampling data` |
| `showDOMVisualizer()` | Open basic DOM exploration interface | `Window dialog` |
| `exportDOMStructure(domStructure, format, customPath)` | Export to file with access patterns | `{success: boolean, filePath: string, error: string}` |

### **Advanced Analysis Functions**

| Function | Purpose |
|----------|---------|
| `performDeepDOMMapping(doc, config)` | Exhaustive DOM mapping with object atlas |
| `analyzeDeepMappingSession(session, config)` | Comprehensive analysis of deep mapping results |
| `analyzeJSONStructure(domStructure, config)` | Post-process JSON exports for visualization |
| `compareDOMStructures(before, after, config)` | Compare two DOM structures for changes |
| `showAdvancedDOMAnalysis()` | Open advanced analysis interface |

### **Utility Functions**

| Function | Purpose |
|----------|---------|
| `getDOMStatistics(domStructure)` | Get enumeration statistics |
| `getCollectionSamplingStatistics(domStructure)` | Get collection sampling statistics |
| `getDeepMappingStatistics(session)` | Get comprehensive deep mapping statistics |
| `findAllCollections(domStructure)` | Find all discovered collections |
| `quickDeepMap(doc)` | Quick deep mapping with default settings |
| `conservativeDeepMap(doc)` | Conservative mapping for large documents |
| `aggressiveDeepMap(doc)` | Comprehensive mapping with maximum depth |

---

## 🎯 Use Cases & Examples

### **Basic Document Discovery**
```javascript
// 1. Discover document structure
var domStructure = enumerateDocumentDOM(doc, config);

// 2. Sample collection contents  
var enhanced = sampleCollectionContents(domStructure, doc, samplingConfig);

// 3. Export results
var result = exportDOMStructure(enhanced, 'json');
```

### **Before/After Document Comparison**
```javascript
// 1. Export initial state
var beforeStructure = enumerateDocumentDOM(doc, config);
exportDOMStructure(beforeStructure, 'json', 'before.json');

// 2. Make document changes...

// 3. Export changed state
var afterStructure = enumerateDocumentDOM(doc, config);
exportDOMStructure(afterStructure, 'json', 'after.json');

// 4. Use Advanced UI to load both files and compare
showAdvancedDOMAnalysis();
```

### **Deep DOM Analysis**
```javascript
// 1. Perform deep mapping
var session = performDeepDOMMapping(doc, deepConfig);

// 2. Analyze results
var analysis = analyzeDeepMappingSession(session, analysisConfig);

// 3. Get developer recommendations
var guide = analysis.developerGuide;
var recommendations = analysis.objectAnalysis.recommendedObjects;
```

### **Generated Access Pattern Example**
After discovery and sampling, you get actionable code:
```javascript
// Generated from actual document structure with reference tracking:
var storyCount = document.stories.length;  // 3
var firstStoryContent = document.stories[0].contents;  // string [safe]
var pageCount = document.pages.length;  // 5  
var firstPageBounds = document.pages[0].bounds;  // object [moderate]

// Enhanced: Object reference tracking shows multiple paths to same object
// Object ref_42 accessible via:
//   - document.stories[0].textFrames[0]
//   - document.pages[0].textFrames[0]

// Safe iteration patterns with reference awareness:
try {
    var processedObjects = [];
    for (var i = 0; i < document.stories.length; i++) {
        var story = document.stories[i];
        var content = story.contents;  // Proven safe from sampling
        // Check if we've already processed this object via different path
        if (processedObjects.indexOf(story) === -1) {
            processedObjects.push(story);
            // Process story safely
        }
    }
} catch (exc) { /* handle safely */ }
```

---

## 🔧 Troubleshooting

### **Common Issues**

**"Collections found but 0 sampled"**
- **FIXED in v2.1**: Discovery-first logic samples all discovered collections with appropriate safety measures
- Safety level now affects HOW to sample, not WHETHER to sample

**"Export failed"**  
- **FIXED in v2.1**: Enhanced export functions with comprehensive error handling
- All export formats (text, JSON, CSV, HTML) now include complete analysis data

**"Advanced UI features not working"**
- Ensure all modules 1.0-10.0 are loaded in sequence
- Check that required analysis modules (7.0, 8.0) are available
- Verify JSON exports are valid DOM structure files

**"Deep mapping times out"**
- Reduce `maxDepth` from 6 to 3-4 for testing
- Set `maxTotalObjects` to 3000 for large documents
- Use `conservativeDeepMap(doc)` for initial analysis

**"Comparison shows no changes"**
- Ensure documents were actually modified between exports
- Check that both JSON files are from the same document
- Verify export timestamps in metadata

**"Performance issues with large documents"**
- Use conservative deep mapping configuration
- Enable progress reporting to monitor advancement
- Increase timeout values for complex documents
- Consider breaking analysis into focused sections

---

## 🔄 Version History

### **v2.1.0** - Current Enhanced Release
- **NEW**: Deep DOM mapping with object atlas and reference tracking (modules 9.1, 9.2)
- **NEW**: Before/after document comparison analysis (module 8.0)
- **NEW**: JSON post-processing and visualization (module 7.0)
- **NEW**: Advanced UI interface with comprehensive analysis features (module 10.0)
- **ENHANCED**: All core modules (1.0, 4.0, 5.0, 6.0) with reference tracking and deeper analysis
- **FIXED**: Module 3.0 dependency architecture - removed illegal dependencies on higher modules
- **ENHANCED**: Export formats with object reference IDs, access paths, and analysis metadata
- **ENHANCED**: Safety architecture with path analysis and enhanced circular reference handling
- **ENHANCED**: Memory management with monitoring and optimization recommendations
- Sequential module architecture with decimal versioning for insertion capability

### **v2.0.0** - Collection Sampling Release
- **NEW**: Collection content sampling with discovery-first approach
- **FIXED**: Safety filter logic - discovered collections sampled with appropriate safety measures  
- **ENHANCED**: UI with "Sample Collections" button and enhanced tree display
- **ENHANCED**: Export formats include collection sampling data and actionable access patterns
- **ENHANCED**: Property access guides with collection-specific iteration examples

### **v1.x** - Discovery Foundation
- Basic DOM structure enumeration
- Safety classification system
- Simple export functionality

---

## 🎯 Current Capabilities Summary

**What the system does now:**
1. **Discovers** your document's DOM structure safely with enhanced depth analysis (up to 8 levels)
2. **Maps** collection contents comprehensively to show what's inside with reference tracking
3. **Tracks** object references to identify multiple access paths to same objects
4. **Detects** circular references and provides safe handling patterns
5. **Compares** document snapshots to identify exactly what changed between versions
6. **Analyzes** JSON exports to create developer-friendly visual hierarchies
7. **Generates** comprehensive access guides with proven-safe code patterns
8. **Monitors** performance and provides optimization recommendations
9. **Exports** complete analysis with ready-to-use access patterns in multiple formats
10. **Provides** dual interfaces for basic discovery and advanced analysis workflows

**Key insight**: The system transforms exploratory questions like "I wonder what's available" into actionable answers like "Here's exactly how to access it safely and here's what changed since last time" through comprehensive discovery-first exploration and advanced analysis of your specific document.

---

## 🏁 Getting Started Checklist

### **Basic Setup**
- [ ] Place all `.jsx` files in `DocDom/` directory  
- [ ] Open InDesign with a test document
- [ ] Run `doc-dom-loader.jsx` to load system sequentially
- [ ] Verify system loads without errors (check console for "initialized successfully" messages)

### **Basic Discovery Workflow**
- [ ] Click "Enumerate DOM" to discover structure
- [ ] Click "Sample Collections" to map collection contents
- [ ] Click "Export DOM" to save actionable analysis
- [ ] Review generated access patterns in exported file

### **Advanced Analysis Workflow**
- [ ] Export initial document state to JSON
- [ ] Make changes to document (add/remove/modify content)
- [ ] Export changed document state to JSON
- [ ] Run `showAdvancedDOMAnalysis()` to open advanced interface
- [ ] Load both JSON files and run comparison analysis
- [ ] Export comprehensive analysis report

### **Deep Analysis Workflow**
- [ ] Run `performDeepDOMMapping(doc, config)` for exhaustive analysis
- [ ] Run `analyzeDeepMappingSession(session, config)` for insights
- [ ] Review object atlas and access patterns
- [ ] Generate developer guide with recommendations

### **System Validation**
- [ ] Verify all 11 modules load successfully (check console output)
- [ ] Test basic workflow: enumerate → sample → export  
- [ ] Validate JSON export contains expected structure and metadata
- [ ] Test advanced interface can load and analyze exported JSON
- [ ] Verify before/after comparison detects document changes
- [ ] Check deep mapping completes without timeouts on test document

**Ready to safely discover, analyze, and compare your InDesign document's complete DOM structure with comprehensive before/after analysis capabilities!** 🚀

---

## 📞 Support & Development

**Module Loading Order**: 1.0 → 2.0 → 3.0 → 4.0 → 5.0 → 6.0 → 7.0 → 8.0 → 9.1 → 9.2 → 10.0

**Required Dependencies**: Modules must only depend on lower-numbered modules to maintain architectural integrity.

**Memory Requirements**: Deep analysis may require significant memory for large documents. Use conservative configurations for initial testing.

**Performance Tuning**: Adjust timeout and depth settings based on document complexity and analysis requirements.