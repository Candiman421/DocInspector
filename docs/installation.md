# Installation Guide v2.1

## 📥 Download the Scripts

### Option 1: Download from GitHub Releases
1. Go to the [Releases page](https://github.com/CandiMan421/DocInspector/releases)
2. Download the latest release ZIP file for v2.1
3. Extract the ZIP file to get the `.jsx` files

### Option 2: Clone the Repository
```bash
git clone https://github.com/CandiMan421/DocInspector.git
cd DocInspector
git checkout indesign
```

## 📂 Find Your InDesign Scripts Folder

### Windows
1. Open File Explorer
2. Navigate to: `C:\Users\[YourUsername]\AppData\Roaming\Adobe\InDesign\[Version]\Scripts\Scripts Panel`
3. If you can't see the `AppData` folder, enable "Show hidden files" in File Explorer

**Common paths by InDesign version:**
- InDesign 2025: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 20.0\Scripts\Scripts Panel`
- InDesign 2025 (localized): `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 20.0\en_US\Scripts\Scripts Panel`
- InDesign 2024: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 19.0\Scripts\Scripts Panel`
- InDesign 2024 (localized): `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 19.0\en_US\Scripts\Scripts Panel`
- InDesign 2023: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 18.0\Scripts\Scripts Panel`
- InDesign 2023 (localized): `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 18.0\en_US\Scripts\Scripts Panel`

**Note:** Some installations include a language folder (like `en_US`, `fr_FR`, `de_DE`, etc.) in the path. Use whichever path actually exists on your system.

### macOS
1. Open Finder
2. Press `Cmd + Shift + G` (Go to Folder)
3. Type: `~/Library/Preferences/Adobe InDesign/[Version]/Scripts/Scripts Panel`

**Common paths by InDesign version:**
- InDesign 2025: `~/Library/Preferences/Adobe InDesign/Version 20.0/Scripts/Scripts Panel`
- InDesign 2025 (localized): `~/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel`
- InDesign 2024: `~/Library/Preferences/Adobe InDesign/Version 19.0/Scripts/Scripts Panel`
- InDesign 2024 (localized): `~/Library/Preferences/Adobe InDesign/Version 19.0/en_US/Scripts/Scripts Panel`
- InDesign 2023: `~/Library/Preferences/Adobe InDesign/Version 18.0/Scripts/Scripts Panel`
- InDesign 2023 (localized): `~/Library/Preferences/Adobe InDesign/Version 18.0/en_US/Scripts/Scripts Panel`

**Note:** Like Windows, macOS installations may include language folders. Use the path that actually exists on your system.

### Can't Find the Scripts Folder?

#### Alternative Method - Let InDesign Show You:
1. Open InDesign
2. Go to `Window > Utilities > Scripts`
3. Right-click in the Scripts panel
4. Choose "Reveal in Explorer" (Windows) or "Reveal in Finder" (macOS)
5. This will show you the correct Scripts folder location

#### File Location Verification
After copying files, verify they're in the correct location:

**Your files should be:**
- `[Scripts Panel Folder]/InDesignDocumentInspector.jsx`
- `[Scripts Panel Folder]/InDesignComparisonUtility.jsx`

**NOT in a subfolder like:**
- `[Scripts Panel Folder]/scripts/InDesignDocumentInspector.jsx` ❌

## 📋 Install the Enhanced Scripts

1. **Copy both files** to your Scripts Panel folder:
   - `InDesignDocumentInspector.jsx`
   - `InDesignComparisonUtility.jsx`

2. **Restart InDesign** (recommended but not always required)

3. **Verify installation:**
   - Open InDesign
   - Go to `Window > Utilities > Scripts`
   - You should see both scripts listed in the Scripts panel

## ✅ First Test Run

### Step 1: Load the Core Functions
1. Open any InDesign document (or create a new one)
2. **Save the document first** (scripts need a file path)
3. In the Scripts panel, **double-click `InDesignDocumentInspector.jsx`**
4. You should see: "InDesign Document Inspector v2.1 loaded successfully!"
5. The message will detail all new features:
   - ✓ Comprehensive text content capture and analysis
   - ✓ Auto-discovery of collections and properties
   - ✓ Enhanced broken property detection and tracking
   - ✓ Comprehensive error handling and recovery
   - ✓ Advanced access path generation with safety guidance
   - ✓ Performance optimizations and timeout protection

### Step 2: Run the User Interface
1. **Double-click `InDesignComparisonUtility.jsx`**
2. You should see the main menu dialog appear
3. The status panel will show:
   - ✓ Main inspector loaded and ready
   - ✓ Version 2.1 - fully compatible
   - Document status and baseline information

### Step 3: Create Your Baseline
1. Choose "🔍 Quick Compare (Recommended)"
2. The script will perform comprehensive analysis with progress dialogs:
   - Loading inspector...
   - Validating document structure...
   - Processing collections...
   - Capturing text content...
   - Analyzing properties...
   - Generating reports...
   - Finalizing analysis...
3. Creates a baseline file: `[DocumentName]_baseline.json`
4. You'll see statistics:
   - Collections discovered
   - Text items processed
   - Properties checked
   - Errors handled gracefully
   - Processing time

### Step 4: Test Change Detection
1. Make any change to your document (move an object, change text, etc.)
2. Run `InDesignComparisonUtility.jsx` again
3. Choose "🔍 Quick Compare"
4. You should see comprehensive comparison results with:
   - Tabbed interface (Summary, Text Analysis, Auto-Discovery, Technical Details, Access Paths)
   - Detailed change analysis with access path guidance
   - Multiple report formats automatically generated

## 🚨 Troubleshooting

### "Scripts won't show up in Scripts panel"
- **Check file names**: Must be exactly `InDesignDocumentInspector.jsx` and `InDesignComparisonUtility.jsx`
- **Check file extension**: Must be `.jsx` (not `.js` or `.txt`)
- **Check folder location**: Must be in "Scripts Panel" subfolder, not a sub-subfolder
- **Check language folder**: Use the Scripts folder that actually exists (may include language code like `en_US`)
- **Restart InDesign**: Sometimes required for scripts to appear
- **Check permissions**: Make sure you can write to the Scripts folder

### "Inspector functions not found"
- **Run order matters**: Always run `InDesignDocumentInspector.jsx` first
- **Both scripts needed**: The utility depends on the main inspector
- **Version compatibility**: Ensure both scripts are v2.1
- **Restart and retry**: If there are issues, restart InDesign and try again

### "Version mismatch warning"
- **Script versions**: Ensure both scripts are exactly v2.1
- **Download fresh**: Re-download both scripts if versions don't match
- **Check timestamps**: Both scripts should have similar creation dates

### "Please open a document first"
- **Open a document**: The script needs an active InDesign document
- **Save the document**: Unsaved documents don't have file paths for reports
- **Check document type**: Must be a regular InDesign document, not a book file

### "Enhanced analysis failed" or script crashes
- **Complex documents**: v2.1 includes timeout protection for very complex documents
- **Memory issues**: Close other applications if you have limited RAM
- **Error logging**: Check the `*_error.txt` file for detailed error information
- **Try simpler document**: Test with a basic document first
- **Enable safe mode**: Scripts have comprehensive safe mode options

### "No changes detected" when you made changes
- **Baseline missing**: Make sure you created an enhanced baseline first
- **File permissions**: Check that the script can write to the document folder
- **Substantial changes**: Very minor changes might not be detected
- **Text capture**: v2.1 captures much more detailed text changes

### "Report files are very large"
- **Comprehensive data**: v2.1 captures comprehensive information, creating larger files
- **File size warnings**: Scripts will warn if files exceed 10MB
- **Reduce sample sizes**: Adjust `maxCollectionSample` in configuration if needed
- **Text preview limits**: Adjust `maxTextPreviewLength` for smaller files

### "Enhanced features disabled"
- **Configuration**: Check that text capture and auto-discovery are enabled
- **Enable features**: The utility will offer to enable features automatically
- **Memory concerns**: Some features may be disabled on older systems

## 🔧 Advanced Installation

### Install for All Users (Windows)
Copy scripts to the system-wide location:
`C:\Program Files\Adobe\Adobe InDesign [Version]\Scripts\Scripts Panel`

### Install for All Users (macOS)
Copy scripts to:
`/Applications/Adobe InDesign [Version]/Scripts/Scripts Panel`

### Network Installation for Teams
For multiple computers with enhanced features:
1. Set up a shared network folder with the v2.1 scripts
2. Each user copies them to their local Scripts folder
3. Or use InDesign's script menu: `File > Scripts > Other Script...` to run from network location
4. Ensure all team members use the same version (v2.1) for compatibility

### Configuration Management
v2.1 includes comprehensive configuration options:
```javascript
// Example configuration adjustments
ANALYSIS_CONFIG.enableTextCapture = true;        // Full text analysis
ANALYSIS_CONFIG.enableAutoDiscovery = true;      // Collection discovery
ANALYSIS_CONFIG.enablePropertyTracking = true;   // Broken property detection
ANALYSIS_CONFIG.maxTextPreviewLength = 500;      // Text preview size
ANALYSIS_CONFIG.maxCollectionSample = 50;        // Collection sample size
ANALYSIS_CONFIG.safeMode = true;                 // Error handling
```

## 📱 Compatibility

These scripts work with:
- ✅ InDesign Desktop (Windows/Mac) - CS6 and later
- ✅ Full features require CC 2018+ for full functionality
- ✅ Some features work with CC 2015+ with reduced capability
- ❌ InDesign on iPad (no ExtendScript support)
- ❌ InDesign web version (no ExtendScript support)

### Version-Specific Feature Availability:
- **CC 2025**: All features fully supported
- **CC 2023-2024**: Full support for all v2.1 features
- **CC 2020-2022**: Most features supported, some limitations
- **CC 2018-2019**: Core features supported, reduced auto-discovery
- **CC 2015-2017**: Basic functionality, limited enhanced features
- **CS6-CC 2014**: Core analysis only, no enhanced features

## 🔄 Updates

### Manual Update Process
1. Download new version from GitHub
2. Backup your current scripts (recommended)
3. Replace old `.jsx` files with new enhanced versions
4. Restart InDesign
5. Verify version compatibility in the utility status panel

### Automatic Version Checking
v2.1 includes:
- Version compatibility verification
- Automatic feature detection
- Configuration migration assistance
- Update recommendations

### Update Notifications
- Watch the GitHub repository for v2.1+ releases
- Subscribe to release notifications on GitHub
- Check utility status panel for version information
- Scripts will warn about version mismatches

## 🎯 Post-Installation Verification

### Complete System Check
1. **Open InDesign** and create/open a test document
2. **Save the document** in a test location
3. **Run `InDesignDocumentInspector.jsx`** - should show v2.1 success message
4. **Run `InDesignComparisonUtility.jsx`** - should show enhanced main menu
5. **Check status panel** - should show all green checkmarks
6. **Create baseline** - should show enhanced statistics
7. **Make a small change** and compare - should show detailed analysis
8. **Check generated files** - should include multiple report formats:
   - `*_baseline.json` (comprehensive baseline)
   - `*_current.json` (current analysis)
   - `*_comparison.json` (technical comparison)
   - `*_summary.txt` (human-readable summary)
   - `*_text_analysis.txt` (detailed text changes)
   - `*_discovery_report.txt` (collection discoveries)
   - `*_access_paths_guide.txt` (safe access patterns)
   - `*_technical_report.txt` (technical analysis)

### Feature Validation Checklist
- [ ] Text content capture working
- [ ] Auto-discovery finding collections
- [ ] Broken property detection active
- [ ] Access path generation functioning
- [ ] Multiple report formats created
- [ ] Progress dialogs showing
- [ ] Error handling working (test with complex document)
- [ ] Timeout protection active
- [ ] Version compatibility verified
- [ ] Configuration options accessible

### Script Load Order Verification
**ALWAYS run scripts in this order:**
1. **First**: Run `InDesignDocumentInspector.jsx` (loads core functions)
2. **Second**: Run `InDesignComparisonUtility.jsx` (provides interface)

**If you see version/compatibility errors:**
- Close InDesign completely
- Restart InDesign  
- Run main inspector first, then utility

---

**Next Step**: Read the [Usage Guide v2.1](usage-guide.md) to learn how to use all the comprehensive features effectively!