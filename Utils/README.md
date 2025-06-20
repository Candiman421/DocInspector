# DocDom Utility Scripts

**Professional-grade analysis and assembly tools for the DocDom module system**

This directory contains modular Node.js utilities for analyzing, assembling, and comparing DocDom modules with ES3/ExtendScript compatibility validation and sequential dependency management.

---

## 🎯 What These Tools Do

### **System Analysis** (Sequential Dependency Chains)
Analyzes how modules work together in dependency order (1.1 → 1.2 → 2.1)
- Individual module health reports
- System-wide dependency validation  
- Cross-module collision detection
- ES3 compatibility checking
- Function registration accuracy

### **Version Comparison** (Module Evolution)
Compares different versions of the same module (v1 vs v2 vs v3)
- Breaking change detection
- Function evolution tracking
- Quality trend analysis
- Migration recommendations

### **Module Assembly** (Production Builds)
Creates deployable files from module collections
- Sequential dependency assembly
- Dual format generation (concatenated + includes)
- Auto-start interface integration

---

## 🚀 Quick Start

### **1. Installation**
```bash
# Navigate to Utils directory
cd Utils/

# Install dependencies
npm install
```

### **2. Run Analysis on All Projects**
```bash
# Analyze all folders in your project
node main-system-analyzer.js

# Compare versions in all folders  
node main-version-comparator.js

# Assemble all module folders
node main-assembler.js
```

### **3. Target Specific Folders**
```bash
# Analyze specific folder
node main-system-analyzer.js --folder ../DocDomV3.1

# Compare versions in specific folder
node main-version-comparator.js --folder ../SafetyUtilsVersions

# Assemble specific folder
node main-assembler.js --folder ../CoreModules
```

---

## 📋 Command Reference

### **System Analysis Commands**

```bash
# Full project analysis (recommended)
node main-system-analyzer.js

# Analyze specific folder
node main-system-analyzer.js --folder ../DocDomV3.1
node main-system-analyzer.js -f ../MyModules

# Verbose output with detailed progress
node main-system-analyzer.js --verbose

# Quiet mode (minimal output)
node main-system-analyzer.js --quiet

# Generate only individual module reports
node main-system-analyzer.js --individual-only

# Generate only system aggregate report
node main-system-analyzer.js --system-only

# Skip function similarity analysis (faster)
node main-system-analyzer.js --skip-similarity

# Custom similarity threshold (default: 75%)
node main-system-analyzer.js --similarity-threshold 85
```

### **Version Comparison Commands**

```bash
# Compare all version folders in project
node main-version-comparator.js

# Compare versions in specific folder
node main-version-comparator.js --folder ../SafetyUtilsVersions
node main-version-comparator.js -f ../VersionTests

# Include code samples in reports (detailed)
node main-version-comparator.js --include-code

# Verbose comparison process
node main-version-comparator.js --verbose

# Require minimum 3 versions for comparison (default: 2)
node main-version-comparator.js --min-versions 3

# Custom similarity threshold for internal analysis
node main-version-comparator.js --similarity-threshold 90
```

### **Module Assembly Commands**

```bash
# Assemble all module folders in project
node main-assembler.js

# Assemble specific folder
node main-assembler.js --folder ../DocDomV3.1
node main-assembler.js -f ../CoreModules

# Verbose assembly process
node main-assembler.js --verbose

# Skip file validation (faster, less safe)
node main-assembler.js --skip-validation

# Don't generate includes-based files
node main-assembler.js --no-includes

# Disable auto-start interface in assembled files
node main-assembler.js --no-auto-start

# Quiet mode (minimal output)
node main-assembler.js --quiet
```

### **NPM Script Shortcuts**

```bash
# Quick analysis commands
npm run analyze              # System analysis
npm run compare              # Version comparison  
npm run assemble             # Module assembly

# Alternative forms
npm run analyze-system       # Same as analyze
npm run analyze-versions     # Same as compare
```

---

## 📊 Understanding the Analysis Types

### **When to Use System Analysis**
Use when you have **different modules** in a folder:
```
MyProject/
├── 1.1_bootstrap-foundation.jsx
├── 1.2_safety-utilities.jsx  
├── 2.1_dom-enumerator.jsx
└── 3.1_property-sampler.jsx
```

**Focus:** How modules work together, dependency compliance, cross-module issues

### **When to Use Version Comparison**  
Use when you have **multiple versions** of the same module:
```
SafetyUtilsVersions/
├── 1.2_safety-utilities_v1.jsx
├── 1.2_safety-utilities_v2.jsx
├── 1.2_safety-utilities_v3.jsx
└── 1.2_safety-utilities_latest.jsx
```

**Focus:** What changed between versions, breaking changes, evolution

---

## 📁 Generated Reports

All reports are generated **in the same folder** as the analyzed modules.

### **System Analysis Reports**
```
~module-{filename}-analysis-{timestamp}.yaml     # Individual module details
~system-aggregate-analysis-{timestamp}.yaml      # System-wide summary
```

### **Version Comparison Reports**  
```
~version-comparison-{module}-{timestamp}.yaml    # Version evolution analysis
```

### **Assembly Outputs**
```
{FolderName}_ASSEMBLED_{timestamp}.jsx           # Concatenated version (recommended)
{FolderName}_INCLUDES_{timestamp}.jsx            # Include-based version (debugging)
```

---

## 🏥 Understanding Health Scores

### **Grade Scale**
- **A+** (950-1000): Exemplary architecture compliance
- **A** (900-949): Excellent with minor issues  
- **B+** (850-899): Good compliance, some improvements needed
- **B** (800-849): Acceptable with notable issues
- **C+** (750-799): Below standard, requires attention
- **C** (700-749): Poor compliance, needs refactoring
- **D** (600-699): Critical issues present
- **F** (<600): Unacceptable, major problems

### **What Affects Health Scores**
- **ES3 Compatibility:** Critical for ExtendScript (-50 points per violation)
- **Reserved Word Safety:** 'export' crashes ExtendScript (-100 points)
- **Function Registration:** Accuracy of registerModule() calls
- **Dependency Order:** Sequential loading compliance
- **Error Handling:** Try-catch coverage (+5 points per function)
- **Logging Modernization:** logDebug() vs $.writeln() usage

---

## 🔧 Typical Workflows

### **Workflow 1: Module Development Health Check**
```bash
cd Utils/

# Quick health check of all modules
node main-system-analyzer.js

# Review reports in each module folder
# Fix ES3 violations and registration mismatches
# Re-run to verify improvements
```

### **Workflow 2: Before/After Module Updates**
```bash
# Create versions folder with old and new module
mkdir ../ModuleVersions
cp ../DocDomV3.1/1.2_safety-utilities.jsx ../ModuleVersions/1.2_safety-utilities_old.jsx
# (make your changes)
cp ../DocDomV3.1/1.2_safety-utilities.jsx ../ModuleVersions/1.2_safety-utilities_new.jsx

# Compare versions
node main-version-comparator.js --folder ../ModuleVersions --include-code

# Review breaking changes and evolution
```

### **Workflow 3: Production Deployment**
```bash
# Full analysis before deployment
node main-system-analyzer.js --folder ../DocDomV3.1

# Verify no critical issues (Grade C+ or better)
# Assemble for deployment
node main-assembler.js --folder ../DocDomV3.1

# Deploy the *_ASSEMBLED_*.jsx file
```

### **Workflow 4: Cross-Project Analysis**
```bash
# Analyze entire project structure
node main-system-analyzer.js --verbose

# Look for:
# - Duplicate function names across modules
# - Dependency order violations  
# - ES3 compatibility issues
# - Registration accuracy problems
```

---

## 📋 Report Contents

### **Individual Module Reports**
- **Function Inventory:** All function signatures
- **Registration Analysis:** Missing/extra functions in registerModule()
- **ES3 Violations:** Specific line numbers and fixes
- **Logging Coverage:** Which functions have/lack logging
- **Internal Dependencies:** Function call order within module
- **Code Quality:** Architecture compliance scoring

### **System Aggregate Reports**
- **Dependency Chain:** Module load order validation
- **Cross-Module Issues:** Name collisions, circular dependencies
- **Health Distribution:** Grade breakdown across modules
- **Recommendations:** Prioritized action items
- **Compliance Summary:** ES3, registration, logging metrics

### **Version Comparison Reports**
- **Evolution Analysis:** Functions added/removed/modified
- **Breaking Changes:** Signature changes, removed functions
- **Quality Trends:** Health score evolution over versions  
- **Code Diffs:** Before/after samples for modified functions
- **Migration Guide:** How to safely upgrade versions

---

## 🎯 File Pattern Recognition

### **Module Files (System Analysis)**
```
✅ 1.2_safety-utilities.jsx           # Standard module
✅ 1.2.1_enhanced-safety.jsx          # Sub-version
✅ 1.4.2.1_micro-patch.jsx            # Up to 4 decimal levels
❌ safety_1.2_utilities.jsx           # Wrong pattern (decimal not first)
❌ 1.2_safety_ASSEMBLED_123.jsx       # Excluded (assembled file)
```

### **Version Files (Version Comparison)**
```
✅ 1.2_safety-utilities_v1.jsx        # Versioned
✅ 1.2_safety-utilities_old.jsx       # Named variant
✅ 1.2_safety-utilities_2024.jsx      # Date variant
✅ 1.2_safety-utilities_latest.jsx    # Status variant

Groups automatically by base: "1.2_safety-utilities"
```

---

## 🔍 Advanced Analysis Features

### **Function Similarity Detection**
- **Purpose:** Find duplicate or nearly-identical functions
- **Configurable:** Adjust similarity threshold (default: 75%)
- **Smart Filtering:** Ignores intentionally similar functions (logging, exports)
- **Multi-Factor:** Analyzes signatures, content, API calls, purpose

### **Cross-Module Analysis**  
- **Name Collisions:** Same function name in different modules
- **Dependency Violations:** Higher modules calling lower modules
- **Circular Dependencies:** Module A → B → A chains
- **Missing Dependencies:** Undeclared module usage

### **ES3 Compatibility Validation**
- **Forbidden Features:** const, let, arrow functions, template literals
- **Reserved Words:** 'export' and other ExtendScript crashers
- **Syntax Patterns:** Modern JS features that break in ExtendScript
- **Line-by-Line:** Specific fixes for each violation

---

## 🛠 Troubleshooting

### **Common Issues**

**"No folders with module files found"**
```bash
# Ensure files match pattern: 1.2_*.jsx, 1.2.1_*.jsx
ls ../*/*.jsx | grep -E '^[0-9]+(\.[0-9]+)*_.*\.jsx$'

# Check if you're in the Utils/ directory
pwd  # Should end with /Utils
```

**"Module not found" errors**
```bash
# Install dependencies
npm install

# Check Node.js version (requires 18+)
node --version
```

**"Permission denied" errors**
```bash
# Make scripts executable (Linux/Mac)
chmod +x *.js

# Or run with explicit node
node main-system-analyzer.js
```

**Large projects running slowly**
```bash
# Skip similarity analysis for speed
node main-system-analyzer.js --skip-similarity

# Analyze specific folders only
node main-system-analyzer.js --folder ../TargetFolder
```

### **Getting Help**

```bash
# Show help for any command
node main-system-analyzer.js --help
node main-version-comparator.js --help  
node main-assembler.js --help

# Show version info
node main-system-analyzer.js --version
```

---

## 📂 Directory Structure

```
Utils/
├── package.json                          # Dependencies & NPM scripts
├── README.md                             # This file
├── config/
│   ├── analysis-rules.js                 # Quality rules & scoring
│   ├── whitelists.js                     # Similarity detection filters
│   └── patterns.js                       # File patterns & exclusions
├── core/
│   ├── file-discovery.js                 # Auto-discovery logic
│   ├── module-parser.js                  # Function extraction
│   ├── function-analyzer.js              # Signature analysis
│   ├── yaml-generator.js                 # Clean YAML output
│   └── module-assembler.js               # Assembly logic
├── analyzers/
│   ├── individual-module-analyzer.js     # Single module analysis
│   ├── system-analyzer.js                # Multi-module system
│   ├── version-comparator.js             # Version diff analysis
│   └── similarity-detector.js            # Function similarity
├── reporters/
│   ├── individual-report.js              # Per-module reports
│   ├── system-report.js                  # System aggregate
│   ├── version-report.js                 # Version comparison
│   └── code-snippet-extractor.js         # Code formatting
├── main-system-analyzer.js               # System analysis CLI
├── main-version-comparator.js            # Version comparison CLI
└── main-assembler.js                     # Assembly CLI
```

---

## 🎯 Best Practices

### **For System Analysis**
1. **Run regularly** during development to catch issues early
2. **Fix ES3 violations first** - they break ExtendScript
3. **Maintain 95%+ registration accuracy** for reliability
4. **Address dependency violations** before they cascade
5. **Target Grade B+ or better** for production modules

### **For Version Comparison**  
1. **Always check breaking changes** before version upgrades
2. **Review code diffs** for unintended modifications
3. **Track quality trends** to identify regression patterns
4. **Document migration steps** for major version changes
5. **Test compatibility** with dependent modules

### **For Assembly**
1. **Validate before assembly** using system analysis
2. **Use ASSEMBLED files** for production deployment
3. **Use INCLUDES files** for development/debugging
4. **Test auto-start interface** in target environment
5. **Keep assembly artifacts** out of version control

---

## 🔧 GitIgnore Recommendations

Add these patterns to your `.gitignore`:

```gitignore
# Assembly outputs
*_ASSEMBLED_*.jsx
*_INCLUDES_*.jsx

# Analysis reports  
~analysis-*.yaml
~module-*.yaml
~system-*.yaml
~version-*.yaml

# Node modules (if Utils/ is in main project)
Utils/node_modules/
```

---

## 📈 Performance Notes

- **Large Projects:** Use `--skip-similarity` for faster analysis
- **Memory Usage:** Each module analysis uses ~50-100MB peak
- **Disk Space:** Reports are typically 10-100KB each
- **Network:** No network access required (offline analysis)

---

*For issues, questions, or feature requests, review the generated reports first - they contain detailed recommendations and actionable fixes for most common problems.*