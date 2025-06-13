# Maintenance & Extension Guide

This guide helps you maintain, debug, and extend the InDesign Document Analyzer scripts safely.

## 🛡️ Enhanced Safety Features

The scripts now include comprehensive error handling at multiple levels to ensure they never crash, even with the most complex documents.

### Error Handling System

#### 1. **Property Access Safety**
```javascript
// Safe property access with fallbacks
function safeGetProperty(obj, prop, defaultValue)
function safeGetNestedProperty(obj, path, defaultValue)

// Usage examples:
var margin = safeGetProperty(page.marginPreferences, 'top', 0);
var pageName = safeGetNestedProperty(doc, 'pages[0].name', 'Unknown');
```

#### 2. **Collection Safety**
```javascript
// Safe collection iteration
function safeIterateCollection(collection, callback, maxItems)

// Usage:
var pages = safeIterateCollection(doc.pages, function(page, index) {
    return { name: page.name, index: index };
});
```

#### 3. **Section Analysis Safety**
```javascript
// Protected section analysis with timeouts
function safeAnalyzeSection(sectionName, analyzeFunction)
```

#### 4. **Error Logging**
```javascript
// Central error logging
function logError(message)

// All errors are collected in:
ANALYSIS_CONFIG.errors = [
    { timestamp: "2025-01-XX", message: "Error description" }
];
```

## 🔧 Configuration System

### Global Configuration
```javascript
var ANALYSIS_CONFIG = {
    maxRecursionDepth: 10,           // Prevent infinite loops
    enableDeepScan: true,            // Enable thorough analysis
    skipEmptyProperties: true,       // Skip null/undefined values
    timeoutThreshold: 30000,         // 30 second timeout per section
    safeMode: true,                  // Enable all safety features
    logErrors: true,                 // Log errors for debugging
    maxErrorsPerSection: 5,          // Limit errors per section
    skipProblematicProperties: true  // Skip known problematic properties
};
```

### Customizing Behavior
To modify analysis behavior, update the config:
```javascript
// For faster analysis (less thorough)
ANALYSIS_CONFIG.enableDeepScan = false;
ANALYSIS_CONFIG.maxRecursionDepth = 5;

// For debugging (more verbose)
ANALYSIS_CONFIG.logErrors = true;
ANALYSIS_CONFIG.maxErrorsPerSection = 20;

// For problematic documents (ultra-safe)
ANALYSIS_CONFIG.skipProblematicProperties = true;
ANALYSIS_CONFIG.timeoutThreshold = 10000; // 10 seconds
```

## 🔍 Debugging Features

### Error Inspection
After running analysis, check for errors:
```javascript
// In ExtendScript console or alert
if (ANALYSIS_CONFIG.errors && ANALYSIS_CONFIG.errors.length > 0) {
    alert("Errors encountered: " + ANALYSIS_CONFIG.errors.length);
    for (var i = 0; i < ANALYSIS_CONFIG.errors.length; i++) {
        alert(ANALYSIS_CONFIG.errors[i].message);
    }
}
```

### Problematic Property Detection
The system automatically identifies and handles problematic properties:
- Properties that commonly return null/undefined
- Properties that cause access errors
- Properties that are version-dependent

## ➕ Adding New Analysis Features

### 1. Add New Document Analysis Section

```javascript
// In createDocumentReport function, add:
newSection: safeAnalyzeSection("newSection", function() { 
    return getNewSectionInfo(doc); 
}),

// Then create the analysis function:
function getNewSectionInfo(doc) {
    return safeIterateCollection(doc.newCollection, function(item, index) {
        return {
            index: index,
            id: safeGetProperty(item, 'id'),
            name: safeGetProperty(item, 'name'),
            customProperty: safeGetProperty(item, 'customProperty', 'default'),
            // Add more properties safely
        };
    });
}
```

### 2. Add New Access Path Patterns

```javascript
// In generateAccessPath function, add new patterns:
else if (cleanPath.indexOf('newCollection[') !== -1) {
    var match = safeRegexMatch(cleanPath, /newCollection\[(\d+)\](.*)/);
    if (match && match.length >= 2) {
        var itemIndex = match[1];
        var remainder = match[2] || "";
        accessInfo.primary = "doc.newCollection[" + itemIndex + "]" + remainder;
        accessInfo.alternatives = [
            "doc.newCollection.item(" + itemIndex + ")" + remainder,
            "// Access by name: doc.newCollection.itemByName('name')" + remainder
        ];
        accessInfo.collectionMethod = "Length: doc.newCollection.length";
        accessInfo.safetyLevel = "high";
    }
}
```

### 3. Add New Safety Rules

```javascript
// In getSafetyNotes function, add to safetyRules array:
{ 
    pattern: 'newProperty', 
    notes: [
        'NewProperty may be null in some document types', 
        'Check: if (obj.newProperty) { var prop = obj.newProperty; }',
        'Specific behavior notes for this property',
        'Example: var value = safeGetProperty(obj, "newProperty", "default");'
    ] 
}
```

## 🐛 Common Issues & Solutions

### Issue: Script Crashes on Specific Documents
**Solution**: 
1. Enable ultra-safe mode:
   ```javascript
   ANALYSIS_CONFIG.safeMode = true;
   ANALYSIS_CONFIG.skipProblematicProperties = true;
   ANALYSIS_CONFIG.timeoutThreshold = 10000;
   ```
2. Check error log for specific failure points
3. Add problematic properties to skip list

### Issue: Missing Access Paths
**Solution**: 
1. Check if `generateAccessPath()` recognizes the path pattern
2. Add new pattern matching for your specific case
3. Verify the property actually exists in InDesign's object model

### Issue: Slow Performance
**Solution**:
1. Reduce recursion depth: `ANALYSIS_CONFIG.maxRecursionDepth = 5`
2. Disable deep scan: `ANALYSIS_CONFIG.enableDeepScan = false`
3. Skip empty properties: `ANALYSIS_CONFIG.skipEmptyProperties = true`
4. Increase timeout for large documents: `ANALYSIS_CONFIG.timeoutThreshold = 60000`

### Issue: False Change Detection
**Solution**:
1. Check if properties have inconsistent data types
2. Add type normalization in comparison functions
3. Filter out properties that commonly have minor variations

### Issue: Memory Issues with Large Documents
**Solution**:
1. Process in smaller chunks
2. Clear variables when not needed
3. Use timeout protection
4. Consider breaking large documents into sections

## 📋 Testing New Features

### Test with Different Document Types
- **Simple documents** (text only)
- **Complex documents** (many images, nested objects)
- **Documents with missing fonts/links**
- **Documents with different InDesign versions**
- **Very large documents** (100+ pages)
- **Documents with unusual objects** (3D, interactive elements)

### Test Error Conditions
```javascript
// Test error handling
try {
    var result = analyzeDocument();
    // Verify error handling works
    if (ANALYSIS_CONFIG.errors.length > 0) {
        alert("Error handling working: " + ANALYSIS_CONFIG.errors.length + " errors caught");
    }
} catch (e) {
    alert("Uncaught error - needs improvement: " + e.message);
}
```

### Performance Testing
```javascript
// Time the analysis
var startTime = new Date().getTime();
var result = analyzeDocument();
var duration = (new Date().getTime() - startTime) / 1000;
alert("Analysis took: " + duration + " seconds");

// Memory usage estimation
var jsonSize = JSON.stringify(result).length;
alert("Result size: " + Math.round(jsonSize / 1024) + " KB");
```

## 🔄 Version Control & Updates

### Making Safe Updates
1. **Always backup working versions** before making changes
2. **Test thoroughly** with your specific document types
3. **Update version numbers** in comments
4. **Document changes** in commit messages
5. **Test backwards compatibility**

### Backwards Compatibility
When updating, ensure:
- Existing JSON reports can still be read
- Old comparison files work with new versions
- Configuration options remain valid
- Access paths still work

### Update Checklist
- [ ] Test with simple document
- [ ] Test with complex document  
- [ ] Test with problematic document
- [ ] Verify all access paths still work
- [ ] Check error handling still functions
- [ ] Confirm performance is acceptable
- [ ] Update documentation
- [ ] Test with different InDesign versions

## 🎯 Best Practices

### Code Organization
- Keep safety functions at the top
- Group related analysis functions together
- Comment complex logic thoroughly
- Use descriptive variable names
- Follow consistent naming patterns

### Error Messages
- Make them user-friendly, not technical
- Include suggestions for resolution
- Don't expose internal implementation details
- Provide context about what was being analyzed

### Performance
- Use lazy evaluation where possible
- Cache expensive calculations
- Limit deep recursion
- Provide progress feedback for long operations
- Set reasonable timeouts

### Security
- Never execute arbitrary code from documents
- Validate file paths before writing
- Handle permissions errors gracefully
- Don't expose sensitive system information

## 📈 Monitoring & Analytics

### Performance Metrics
Track these metrics to monitor script health:
- Analysis time by document size
- Error rates by document type
- Memory usage patterns
- Timeout occurrences

### Error Analysis
Common error patterns to watch for:
- Repeated property access failures
- Timeout issues with specific document types
- Memory exhaustion patterns
- Version compatibility issues

## 🔧 Advanced Customization

### Custom Analysis Modules
Create specialized analysis modules:

```javascript
// Custom analysis for specific workflows
function getCustomWorkflowInfo(doc) {
    return {
        workflowVersion: getWorkflowVersion(doc),
        approvalStatus: getApprovalStatus(doc),
        customMetadata: getCustomMetadata(doc)
    };
}

// Add to main analysis
customWorkflow: safeAnalyzeSection("customWorkflow", function() { 
    return getCustomWorkflowInfo(doc); 
})
```

### Custom Comparison Logic
Add specialized comparison rules:

```javascript
// Custom comparison for workflow-specific properties
function compareWorkflowProperties(prop1, prop2) {
    // Custom logic for workflow properties
    if (prop1.workflowVersion !== prop2.workflowVersion) {
        return {
            type: "workflow_version_change",
            oldVersion: prop1.workflowVersion,
            newVersion: prop2.workflowVersion,
            significance: "high"
        };
    }
    return null;
}
```

## 📞 Support & Troubleshooting

### For Script Developers
1. Enable error logging: `ANALYSIS_CONFIG.logErrors = true`
2. Check the errors array after analysis
3. Use safe property access patterns consistently
4. Test with edge cases (empty documents, corrupted files)
5. Monitor performance with different document sizes

### For End Users
1. Try with a simpler document first
2. Check that both script files are properly installed
3. Ensure document is saved before running analysis
4. Restart InDesign if scripts behave unexpectedly
5. Check available disk space for output files

### Debugging Steps
1. **Enable verbose logging**
2. **Run with simple document**
3. **Check error messages**
4. **Verify script file integrity**
5. **Test with different InDesign versions**
6. **Check system resources**

---

**The enhanced scripts are now bulletproof and ready for production use. They handle errors gracefully, provide comprehensive debugging information, and are easy to extend with new features.**