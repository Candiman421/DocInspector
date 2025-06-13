# Enhanced InDesign Document Analyzer v2.1

A comprehensive ExtendScript solution for analyzing InDesign documents and tracking changes between document versions with bulletproof error handling, complete text capture, auto-discovery, and professional-grade reporting.

## 🎯 What It Does (Enhanced)

- **📊 Comprehensive Analysis**: Analyzes every aspect of your InDesign document including images, graphics, text frames, styles, colors, fonts, preferences, and more
- **📝 Complete Text Capture**: Captures and analyzes all text content with character/word counts, overflow detection, and style tracking
- **🔍 Auto-Discovery Engine**: Automatically discovers collections and properties, adapting to different InDesign versions and document types
- **🛡️ Bulletproof Error Handling**: Advanced error detection, categorization, and recovery prevents script crashes on any document
- **🔄 Enhanced Change Tracking**: Compare document states with detailed analysis of what changed, where, and how to access it
- **🛠️ Object Model Guidance**: Get exact JavaScript paths and safety guidance for accessing any changed properties
- **⚡ Performance Optimized**: Timeout protection, sampling, and memory management for documents of any complexity
- **📋 Professional Reporting**: Multiple report formats from human-readable summaries to detailed technical analysis

## 🚀 Quick Start

### Enhanced Installation

1. **Download the enhanced scripts:**
   - `InDesignDocumentAnalyzer.jsx`
   - `InDesignComparisonUtility.jsx`

2. **Install in InDesign:**
  - Copy both files from the scripts/ folder to your InDesign Scripts folder:
     - **Windows**: `C:\Users\[username]\AppData\Roaming\Adobe\InDesign\[version]\Scripts\Scripts Panel`
     - **Mac**: `~/Library/Preferences/Adobe InDesign/[version]/Scripts/Scripts Panel`

3. **Access in InDesign:**
   - Go to `Window > Utilities > Scripts`
   - You'll see both enhanced scripts listed

### Enhanced Usage

1. **Open your InDesign document and save it**
2. **Run the main analyzer** (`InDesignDocumentAnalyzer.jsx`)
   - Loads comprehensive analysis functions
   - Shows success message with all v2.1 features
3. **Run the comparison utility** (`InDesignComparisonUtility.jsx`)
   - Shows enhanced main menu with status information
4. **Choose "🔍 Quick Compare (Recommended)"** for streamlined workflow

#### First Time Setup (Enhanced)
- Creates comprehensive baseline snapshot with text capture and auto-discovery
- Shows detailed statistics: collections discovered, text items processed, properties checked
- Make your changes to the document
- Run "🔍 Quick Compare" again to see detailed change analysis

## 📊 What Gets Analyzed (Comprehensive)

### Document Structure & Content
- **Pages, spreads, master spreads** with complete geometry and settings
- **Layers and their properties** including visibility, lock status, and color
- **Document preferences** including margins, bleeds, measurement units
- **Page items** with type detection, bounds, and hierarchy analysis

### Enhanced Text Analysis
- **Complete text capture** from all text frames and stories
- **Character, word, and paragraph counts** for every text element
- **Text overflow detection** and threading chain analysis
- **Applied styles tracking** (paragraph, character, object styles)
- **Text statistics** including average words per paragraph, character analysis
- **Text change detection** with before/after comparisons and character-level differences

### Images & Graphics (Multi-Method Detection)
- **Images**: Multiple detection methods find all images regardless of embedding method
- **Graphics**: Nested graphics analysis with complete property extraction
- **Linked files** with status tracking, resolution analysis, and path information
- **Embedded content** detection and categorization

### Styles & Assets (Complete Coverage)
- **All style types**: Paragraph, character, object, cell, and table styles
- **Style relationships**: Based-on hierarchies and applied-to tracking
- **Colors, swatches, gradients** with complete color model information
- **Fonts and usage** including PostScript names, status, and applied instances
- **Asset linking** and dependency analysis

### Advanced Discovery Features
- **Auto-discovery engine** finds collections and properties dynamically
- **Version adaptation** discovers features available in your InDesign version
- **Collection reliability** scoring for script development guidance
- **Property accessibility** testing with alternative access methods
- **Performance metrics** and optimization recommendations

## 📋 Enhanced Output Files

The enhanced analyzer creates a comprehensive report suite in your document's folder:

### Core Analysis Files
- **`[DocumentName]_baseline.json`** - Complete initial document state with enhanced data
- **`[DocumentName]_current.json`** - Current document state with full analysis
- **`[DocumentName]_comparison.json`** - Detailed technical comparison with access paths

### Human-Readable Reports
- **`[DocumentName]_summary.txt`** - Executive overview with categorized changes
- **`[DocumentName]_text_analysis.txt`** - Comprehensive text content analysis
- **`[DocumentName]_discovery_report.txt`** - Auto-discovery findings and recommendations
- **`[DocumentName]_access_paths_guide.txt`** - Safe object model access patterns
- **`[DocumentName]_technical_report.txt`** - Performance metrics and technical analysis

### Error & Debug Files
- **`[DocumentName]_error.txt`** - Detailed error information if issues occur
- **`[DocumentName]_baseline_backup.json`** - Backup when resetting baseline

## 🔍 Enhanced Example Output

### Executive Summary Report
```
⚠ CHANGES DETECTED
Changed sections: 6

📊 COMPREHENSIVE DISCOVERY SUMMARY
Collections discovered: 12
Text items processed: 45
Properties now accessible: 156
Properties with issues: 3

📝 TEXT CONTENT ANALYSIS (ENHANCED)
• Modified 3 text element(s)
  - Text modified (length +127 chars)
  - Word count: 89 → 112 (+23)
  - Character count: 450 → 577 (+127)

🔍 AUTO-DISCOVERED COLLECTIONS
• Found 2 new collection(s)
  - New: autoDiscoveredCollections.customStyles (Access: doc.customStyles[index])

📃 PAGES
• Modified 1 page(s)
  - marginPreferences.top: 72pt → 36pt (Access: doc.pages[0].marginPreferences.top)

🖼️ IMAGES (COMPREHENSIVE)
• Modified 1 image(s)
  - Image resolution changed: 300ppi → 150ppi
```

### Enhanced Object Model Access
Each change includes comprehensive access guidance:
```javascript
// Enhanced text content access
try {
    var textElement = doc.textFrames[0];
    if (textElement && textElement.contents !== undefined) {
        var textContent = textElement.contents;
        if (typeof textContent === 'string') {
            // Process text content safely
            var preview = textContent.length > 500 ? 
                         textContent.substring(0, 500) + '...' : textContent;
            alert('Text preview: ' + preview);
        }
    }
} catch (e) {
    alert('Error accessing text: ' + e.message);
}
```

### Auto-Discovery Pattern Example
```javascript
// Safely discover and access collections
function discoverCollectionsSafely(obj) {
    var collections = [];
    try {
        for (var prop in obj) {
            try {
                var value = obj[prop];
                if (value && typeof value.length !== 'undefined' && value.length > 0) {
                    collections.push({
                        name: prop,
                        length: value.length,
                        accessible: true
                    });
                }
            } catch (e) {
                collections.push({
                    name: prop,
                    accessible: false,
                    error: e.message
                });
            }
        }
    } catch (e) {
        // Discovery failed completely
    }
    return collections;
}
```

## 🛡️ Enhanced Safety Features

### Bulletproof Error Handling
- **Comprehensive try-catch blocks** prevent script failures on any document
- **Error categorization** (timeout, access denied, property not supported, etc.)
- **Automatic retry logic** with extended timeouts for complex operations
- **Graceful degradation** continues analysis even if individual items fail
- **Detailed error logging** with context and recovery suggestions

### Performance Protection
- **Timeout protection** prevents infinite loops on complex documents (default: 30 seconds)
- **Collection sampling** handles documents with thousands of objects safely
- **Memory management** with automatic cleanup and size limits
- **Progress tracking** with user feedback for long operations
- **Safe property access** with validation and fallback patterns

### Multi-Method Detection Systems
- **Text content**: Multiple access methods ensure complete text capture
- **Image detection**: Direct, nested, and embedded image discovery
- **Collection iteration**: Safe patterns with bounds checking and error recovery
- **Property access**: Primary and alternative methods with safety scoring

### Advanced Configuration Options
```javascript
// Enhanced configuration with full control
var ANALYSIS_CONFIG = {
    // Core analysis features
    enableTextCapture: true,           // Comprehensive text analysis
    enableAutoDiscovery: true,         // Collection and property discovery
    enablePropertyTracking: true,     // Broken property detection
    
    // Performance and safety
    timeoutThreshold: 30000,           // 30 second timeout protection
    maxCollectionSample: 50,           // Items per collection sample
    safeMode: true,                    // Enhanced error handling
    
    // Text analysis settings
    maxTextPreviewLength: 500,         // Text preview size
    textAnalysisSettings: {
        enableFullTextCapture: true,   // Complete text content
        enableTextStatistics: true,   // Word/character analysis
        enableStyleTracking: true,    // Applied style tracking
        enableOverflowDetection: true // Text overflow detection
    },
    
    // Discovery engine settings
    discoverySettings: {
        maxDiscoveryTime: 5000,        // Discovery timeout
        enableTypeDetection: true,     // Object type analysis
        trackAccessibility: true,     // Property access monitoring
        enableReliabilityScoring: true // Property reliability scoring
    }
};
```

## 💻 Enhanced Technical Details

### System Requirements
- **Adobe InDesign**: CS6 or later (Enhanced features require CC 2018+)
- **ExtendScript support**: Built into InDesign
- **File system access**: Required for report generation
- **Memory**: 512MB+ recommended for large documents

### Version Compatibility Matrix
- **CC 2025**: ✅ All enhanced features fully supported
- **CC 2023-2024**: ✅ Complete v2.1 feature set
- **CC 2020-2022**: ✅ Most features, some discovery limitations
- **CC 2018-2019**: ⚠️ Core features, reduced auto-discovery
- **CC 2015-2017**: ⚠️ Basic functionality, limited enhanced features
- **CS6-CC 2014**: ⚠️ Core analysis only

### Performance Characteristics
- **Small documents** (1-10 pages): 5-15 seconds analysis time
- **Medium documents** (10-50 pages): 15-45 seconds analysis time
- **Large documents** (50+ pages): 45+ seconds with timeout protection
- **Complex documents**: Automatic sampling and progress tracking
- **Memory usage**: Optimized with automatic cleanup

### File Types Supported
- **`.jsx` files**: ExtendScript files for Adobe applications
- **Direct execution**: Run from InDesign's Scripts panel
- **Network deployment**: Can be run from shared network locations
- **JSON output**: Standard format for data exchange
- **Text reports**: Human-readable summaries and guides

## 🤝 Contributing to Enhanced Development

### Development Environment Setup
1. **Fork the repository** and create a feature branch
2. **Test with various document types**: Simple, complex, text-heavy, image-heavy
3. **Validate enhanced features**: Text capture, auto-discovery, error handling
4. **Performance testing**: Large documents, timeout scenarios, memory usage
5. **Submit comprehensive pull request** with testing documentation

### Code Standards for Enhanced Features
- **Comprehensive error handling**: All functions must have try-catch blocks
- **Safe property access**: Use `safeGetProperty()` and validation
- **Performance consideration**: Implement timeout protection for loops
- **Discovery integration**: New features should support auto-discovery
- **Documentation**: Include access path examples and safety notes

### Testing Checklist
- [ ] Basic functionality with simple documents
- [ ] Enhanced text capture with complex text layouts
- [ ] Auto-discovery with various document types
- [ ] Error handling with problematic documents
- [ ] Performance with large/complex documents
- [ ] Memory management during extended operations
- [ ] Cross-version compatibility testing
- [ ] Report generation and file system access

## 📝 Enhanced License

MIT License - Enhanced version maintains open source licensing for community development and professional use.

## 🐛 Enhanced Troubleshooting

### Installation Issues
- **Scripts not appearing**: Check file extensions (.jsx), restart InDesign
- **Permission errors**: Verify write access to Scripts folder
- **Version conflicts**: Ensure both scripts are exactly v2.1

### Analysis Issues
- **Timeout errors**: Increase `timeoutThreshold` or reduce `maxCollectionSample`
- **Memory problems**: Close other applications, enable safe mode
- **Text capture incomplete**: Adjust `maxTextLength` and preview settings
- **Discovery not working**: Check InDesign version compatibility

### Performance Issues
- **Slow analysis**: Enable progress tracking, adjust timeout thresholds
- **Large report files**: Reduce text preview length and collection sampling
- **Memory usage**: Use safe mode and enable automatic cleanup

### Advanced Debugging
1. **Check error logs**: Review `*_error.txt` files for detailed information
2. **Use technical reports**: Reference performance metrics and recommendations
3. **Enable debug mode**: Set verbose logging for detailed operation tracking
4. **Test incrementally**: Start with simple documents and increase complexity

## 📧 Enhanced Support

### Community Support
- **GitHub Issues**: Open detailed issues with document types and error messages
- **Discussions**: Share usage patterns and optimization strategies
- **Wiki**: Contribute to enhanced documentation and examples

### Professional Support
- **Consultation**: Available for enterprise deployments and customization
- **Training**: InDesign scripting and object model guidance
- **Custom development**: Extended features for specific workflows

### Documentation Resources
- **Enhanced Installation Guide**: Complete setup instructions
- **Enhanced Usage Guide**: Comprehensive feature documentation
- **Maintenance Guide**: Development and extension documentation
- **API Reference**: Object model access patterns and safety guidance

## 🔄 Enhanced Version History

### v2.1 - Enhanced Professional Edition
- **🛡️ Bulletproof error handling** with comprehensive recovery
- **📝 Complete text capture** with detailed analysis and statistics
- **🔍 Auto-discovery engine** for collections and properties
- **🛠️ Enhanced access path generation** with safety guidance
- **📊 Professional reporting** with multiple output formats
- **⚡ Performance optimizations** with timeout protection
- **🔧 Advanced configuration** with granular control options

### v2.0 - Foundation Features
- **Multi-method image detection** for complete coverage
- **Object model access paths** with safety guidance
- **Enhanced user interface** with detailed change analysis
- **Comprehensive safety features** and error prevention

### v1.x - Original Version
- **Basic document analysis** and change detection
- **Simple comparison** functionality
- **Core safety** features

---

**The Enhanced InDesign Document Analyzer v2.1 represents the most comprehensive, reliable, and professional-grade document analysis solution available for InDesign. Whether you're tracking design changes, developing scripts, managing templates, or conducting quality assurance, the enhanced analyzer provides unmatched insight and reliability for any InDesign workflow.**

**Made for professionals who demand precision, safety, and comprehensive analysis in their InDesign document workflows.**