# Installation Guide

## 📥 Download the Scripts

### Option 1: Download from GitHub Releases
1. Go to the [Releases page](https://github.com/yourusername/indesign-document-analyzer/releases)
2. Download the latest release ZIP file
3. Extract the ZIP file to get the `.jsx` files

### Option 2: Clone the Repository
```bash
git clone https://github.com/CandiMan421/DocAnalyzer.git
cd DocAnalyzer
```

## 📂 Find Your InDesign Scripts Folder

### Windows
1. Open File Explorer
2. Navigate to: `C:\Users\[YourUsername]\AppData\Roaming\Adobe\InDesign\[Version]\Scripts\Scripts Panel`
3. If you can't see the `AppData` folder, enable "Show hidden files" in File Explorer

**Common paths by InDesign version:**
- InDesign 2025: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 20.0\Scripts\Scripts Panel`
- InDesign 2024: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 19.0\Scripts\Scripts Panel`
- InDesign 2023: `C:\Users\[Username]\AppData\Roaming\Adobe\InDesign\Version 18.0\Scripts\Scripts Panel`

### macOS
1. Open Finder
2. Press `Cmd + Shift + G` (Go to Folder)
3. Type: `~/Library/Preferences/Adobe InDesign/[Version]/Scripts/Scripts Panel`

**Common paths by InDesign version:**
- InDesign 2025: `~/Library/Preferences/Adobe InDesign/Version 20.0/Scripts/Scripts Panel`
- InDesign 2024: `~/Library/Preferences/Adobe InDesign/Version 19.0/Scripts/Scripts Panel`  
- InDesign 2023: `~/Library/Preferences/Adobe InDesign/Version 18.0/Scripts/Scripts Panel`

### Can't Find the Scripts Folder?

#### Alternative Method - Create It:
1. Open InDesign
2. Go to `Window > Utilities > Scripts`
3. Right-click in the Scripts panel
4. Choose "Reveal in Explorer" (Windows) or "Reveal in Finder" (macOS)
5. This will show you the correct Scripts folder location

## 📋 Install the Scripts

1. **Copy both files** to your Scripts Panel folder:
   - `InDesignDocumentAnalyzer.jsx`
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
3. In the Scripts panel, **double-click `InDesignDocumentAnalyzer.jsx`**
4. You should see: "Enhanced InDesign Document Analyzer Script loaded!"

### Step 2: Run the User Interface
1. **Double-click `InDesignComparisonUtility.jsx`**
2. You should see the main menu dialog appear
3. Choose "Quick Compare (Recommended)"

### Step 3: Create Your First Baseline
1. The script will analyze your document
2. It creates a baseline file: `[DocumentName]_baseline.json`
3. You'll see: "Baseline analysis created"

### Step 4: Test Change Detection
1. Make any change to your document (move an object, change text, etc.)
2. Run the Comparison Utility again
3. Choose "Quick Compare"
4. You should see a comparison summary showing your changes!

## 🚨 Troubleshooting

### "Script won't show up in Scripts panel"
- **Check file extension**: Must be `.jsx` (not `.js` or `.txt`)
- **Check folder location**: Must be in "Scripts Panel" subfolder
- **Restart InDesign**: Sometimes required for scripts to appear
- **Check permissions**: Make sure you can write to the Scripts folder

### "Enhanced analyzer functions not found"
- **Run order matters**: Always run `InDesignDocumentAnalyzer.jsx` first
- **Both scripts needed**: The utility depends on the main analyzer
- **Restart and retry**: If there are issues, restart InDesign and try again

### "Please open a document first"
- **Open a document**: The script needs an active InDesign document
- **Save the document**: Unsaved documents don't have file paths
- **Check document type**: Must be a regular InDesign document, not a book file

### "Analysis failed" or script crashes
- **Complex documents**: Some very complex documents may take longer
- **Memory issues**: Close other applications if you have limited RAM
- **Try simpler document**: Test with a basic document first

### "No changes detected" when you made changes
- **Baseline missing**: Make sure you created a baseline first
- **File permissions**: Check that the script can write to the document folder
- **Substantial changes**: Very minor changes might not be detected

## 🔧 Advanced Installation

### Install for All Users (Windows)
Copy scripts to the system-wide location:
`C:\Program Files\Adobe\Adobe InDesign [Version]\Scripts\Scripts Panel`

### Install for All Users (macOS)
Copy scripts to:
`/Applications/Adobe InDesign [Version]/Scripts/Scripts Panel`

### Network Installation
For multiple computers, you can:
1. Set up a shared network folder with the scripts
2. Each user copies them to their local Scripts folder
3. Or use InDesign's script menu: `File > Scripts > Other Script...` to run from network location

## 📱 Mobile/Cloud Considerations

These scripts work with:
- ✅ InDesign Desktop (Windows/Mac)
- ❌ InDesign on iPad (no ExtendScript support)
- ❌ InDesign web version (no ExtendScript support)

## 🔄 Updates

### Manual Update
1. Download new version from GitHub
2. Replace old `.jsx` files with new ones
3. Restart InDesign

### Check for Updates
- Watch the GitHub repository for new releases
- Subscribe to release notifications on GitHub

---

**Next Step**: Read the [Usage Guide](usage-guide.md) to learn how to use the analyzer effectively!