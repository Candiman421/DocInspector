## 📋 **Step-by-Step Guide for Node.js Script**

Based on your folder structure, here's exactly how to use the Node.js script:

### **1. Where to Save the Script**
Save `build-chunks.js` in your **root project folder** (same level as your `scripts` folder):

```
DOCINSPECTOR/                    <- Save build-chunks.js HERE
├── docs/
├── scripts/                     <- Your chunk files are here
│   ├── InDesignDocInspectorAndComparer_Chunk1_ConfigAndUtils.jsx
│   ├── InDesignDocInspectorAndComparer_Chunk2_CoreInspectorFunctions.jsx
│   ├── InDesignDocInspectorAndComparer_Chunk3_ComparisonFunctions.jsx
│   ├── InDesignDocInspectorAndComparer_Chunk4_ReportGeneration.jsx
│   └── InDesignDocInspectorAndComparer_Chunk5_MainInterfaceEntry.jsx
├── build-chunks.js             <- NEW FILE HERE
├── .gitignore
├── package.json
└── README.md
```

### **2. Terminal Steps**

Open your terminal/command prompt and navigate to your project folder:

```bash
# Navigate to your project folder
cd /path/to/DOCINSPECTOR

# Run the script
node build-chunks.js
```

### **3. What Happens Automatically**

The script will:
1. **Look in `./scripts`** folder for chunk files
2. **Find all files** matching `InDesignDocInspectorAndComparer_Chunk[N]_*.jsx`
3. **Sort them** by chunk number (1, 2, 3, 4, 5...)
4. **Create** `InDesignDocInspectorAndComparer_ChunkBuilt.jsx` in the **root folder**

### **4. Expected Output**

You'll see something like this:

```
🔧 InDesign Inspector Chunk Builder
=====================================
📂 Target folder: ./scripts
📄 Output file: InDesignDocInspectorAndComparer_ChunkBuilt.jsx
🔍 Pattern: /^InDesignDocInspectorAndComparer_Chunk(\d+)_.*\.jsx$/

📁 Found: InDesignDocInspectorAndComparer_Chunk1_ConfigAndUtils.jsx (Chunk 1)
📁 Found: InDesignDocInspectorAndComparer_Chunk2_CoreInspectorFunctions.jsx (Chunk 2)
📁 Found: InDesignDocInspectorAndComparer_Chunk3_ComparisonFunctions.jsx (Chunk 3)
📁 Found: InDesignDocInspectorAndComparer_Chunk4_ReportGeneration.jsx (Chunk 4)
📁 Found: InDesignDocInspectorAndComparer_Chunk5_MainInterfaceEntry.jsx (Chunk 5)

🔍 Validating chunk sequence...
✅ Chunk sequence validated: 5 chunks found in correct order

🔨 Building combined file...
📝 Processing: InDesignDocInspectorAndComparer_Chunk1_ConfigAndUtils.jsx
📝 Processing: InDesignDocInspectorAndComparer_Chunk2_CoreInspectorFunctions.jsx
📝 Processing: InDesignDocInspectorAndComparer_Chunk3_ComparisonFunctions.jsx
📝 Processing: InDesignDocInspectorAndComparer_Chunk4_ReportGeneration.jsx
📝 Processing: InDesignDocInspectorAndComparer_Chunk5_MainInterfaceEntry.jsx
✅ Successfully created: InDesignDocInspectorAndComparer_ChunkBuilt.jsx
📊 File size: 156 KB (159,872 bytes)
📊 Total chunks: 5

🎉 Build complete!

Next steps:
1. Test the generated file: InDesignDocInspectorAndComparer_ChunkBuilt.jsx
2. Copy to InDesign Scripts folder if needed
3. Run from ESTK or InDesign Scripts panel
```

### **5. Final Result**

Your folder structure will be:

```
DOCINSPECTOR/
├── docs/
├── scripts/                     <- Original chunk files (unchanged)
├── build-chunks.js             <- Your build script
├── InDesignDocInspectorAndComparer_ChunkBuilt.jsx  <- NEW! Combined file
├── .gitignore
├── package.json
└── README.md
```

### **6. Re-running the Script**

Every time you modify any chunk file, just run:
```bash
node build-chunks.js
```

It will **replace** the existing `ChunkBuilt.jsx` file with a fresh version containing all your latest changes.

### **7. Custom Options (Optional)**

If you want to change defaults:
```bash
# Use different input folder
node build-chunks.js ./my-chunks

# Use different output name
node build-chunks.js ./scripts MyCustomOutput.jsx

# Both custom
node build-chunks.js ./my-chunks MyCustomOutput.jsx
```

But with your current setup, just `node build-chunks.js` will work perfectly!