# InDesign Document Analyzer

A comprehensive ExtendScript solution for analyzing InDesign documents and tracking changes between document versions with bulletproof error handling.

## 🎯 What It Does

- **Comprehensive Analysis**: Analyzes every aspect of your InDesign document including images, graphics, text frames, styles, colors, fonts, and more
- **Multi-Method Image Detection**: Finds images using multiple detection methods since they can be embedded in various ways
- **Change Tracking**: Compare document states and see exactly what changed
- **Object Model Paths**: Get exact JavaScript paths to access any changed properties
- **Crash-Safe**: Bulletproof error handling prevents script crashes on complex documents
- **User-Friendly Reports**: Both human-readable summaries and detailed JSON reports

## 🚀 Quick Start

### Installation

1. **Download the scripts:**
   - `InDesignDocumentAnalyzer.jsx` (main analyzer)
   - `InDesignComparisonUtility.jsx` (user interface)

2. **Install in InDesign:**
   - Copy both files to your InDesign Scripts folder:
     - **Windows**: `C:\Users\[username]\AppData\Roaming\Adobe\InDesign\[version]\Scripts\Scripts Panel`
     - **Mac**: `~/Library/Preferences/Adobe InDesign/[version]/Scripts/Scripts Panel`

3. **Access in InDesign:**
   - Go to `Window > Utilities > Scripts`
   - You'll see both scripts listed

### Usage

1. **Open your InDesign document**
2. **Run `InDesignDocumentAnalyzer.jsx`** first (loads core functions)
3. **Run `InDesignComparisonUtility.jsx`** (shows the interface)
4. **Choose "Quick Compare"** for first-time setup

#### First Time Setup
- Creates a baseline snapshot of your document
- Make your changes to the document
- Run "Quick Compare" again to see what changed

## 📊 What Gets Analyzed

### Document Structure
- Pages, spreads, master spreads
- Layers and their properties
- Document preferences and settings
- Margins, bleeds, and layout settings

### Content Analysis
- **Images**: Multiple detection methods find all images regardless of how they're embedded
- **Graphics**: Nested graphics and their properties
- **Text**: Stories, text frames, character/word counts, overflow status
- **Page Items**: All objects on pages with detailed properties

### Styles & Assets
- Paragraph, character, object, cell, and table styles
- Colors, swatches, gradients
- Fonts and their usage
- Linked files and their status

### Advanced Features
- Object hierarchy and nesting analysis
- Safe property access guidance
- Alternative access methods for each property
- Error recovery and graceful degradation

## 📋 Output Files

The script creates several files in your document's folder:

- `[DocumentName]_baseline.json` - Initial document state
- `[DocumentName]_current.json` - Current document state  
- `[DocumentName]_comparison.json` - Detailed technical comparison
- `[DocumentName]_summary.txt` - Human-readable change summary

## 🔍 Example Output

### Summary Report
```
⚠ CHANGES DETECTED
Changed sections: 4

📃 PAGES
• Modified 2 page(s)
  - marginPreferences.top: 72pt → 36pt (Access: doc.pages[0].marginPreferences.top)

📝 TEXT STORIES  
• Modified 1 story(ies)
  - Text length changed: 450 → 523 characters
    Access: doc.stories[1].length

🖼️ IMAGES (COMPREHENSIVE)
• Added 2 image(s)
• Modified 1 image(s)
  - Image resolution changed
```

### Object Model Access
Each change includes exact JavaScript paths:
```javascript
// Safe access pattern
try {
    var pageMargin = doc.pages[0].marginPreferences.top;
    if (pageMargin !== undefined && pageMargin !== null) {
        alert("Top margin: " + pageMargin);
    }
} catch (e) {
    alert("Error accessing margin: " + e.message);
}
```

## 🛡️ Safety Features

- **Crash Prevention**: Extensive error handling prevents script failures
- **Timeout Protection**: Prevents infinite loops on complex documents
- **Safe Property Access**: Built-in checks for undefined/null properties
- **Collection Safety**: Validates array lengths before access
- **Graceful Degradation**: Continues analysis even if individual items fail

## 🔧 Enhanced Features

### Bulletproof Error Handling
- Safe property access throughout
- Comprehensive try-catch blocks
- Error logging and recovery
- Timeout protection for complex documents

### Multi-Method Image Detection
- Direct document.images collection
- Images within graphics objects
- Nested images in page items
- Deep scanning by layers and spreads

### Smart Access Path Generation
- Primary access methods
- Alternative access patterns
- Safety level indicators
- Context-specific guidance

## 💻 Technical Details

### System Requirements
- Adobe InDesign CS6 or later
- ExtendScript support (built into InDesign)

### File Types
- `.jsx` files are ExtendScript files (JavaScript for Adobe applications)
- Can be run directly from InDesign's Scripts panel

### Performance
- Analysis typically completes in 5-30 seconds depending on document complexity
- Handles documents with thousands of objects safely
- Timeout protection prevents hanging on problematic documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with various InDesign documents
5. Submit a pull request

## 📝 License

MIT License - feel free to use and modify for your projects.

## 🐛 Troubleshooting

### Script Won't Load
- Make sure both `.jsx` files are in the correct Scripts folder
- Check that the files have `.jsx` extension (not `.txt`)
- Restart InDesign after adding scripts

### Analysis Fails
- Check that a document is open in InDesign
- Make sure the document is saved (script needs file path)
- Run the main analyzer before the utility

### Script Crashes or Hangs
- The enhanced version includes comprehensive error handling
- Check error logs in the analysis results
- Try with a simpler document first
- Adjust timeout settings if needed

### No Changes Detected
- Make sure you ran "Quick Compare" to create baseline first
- Verify you made actual changes to the document
- Check that both baseline and current files were created

### Property Access Issues
- Use the provided access paths and safety notes
- Always wrap property access in try-catch blocks
- Check collection lengths before array access
- Verify object existence before accessing properties

## 📧 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Include your InDesign version and error messages
- Attach sample documents if possible (remove sensitive content)

## 🔄 Updates

### Latest Enhancements
- **v2.0**: Bulletproof error handling and comprehensive safety features
- **v2.0**: Multi-method image detection for complete coverage
- **v2.0**: Object model access paths with safety guidance
- **v2.0**: Enhanced user interface with detailed change analysis

---

**Made for InDesign users who need to track document changes with precision and safety.**