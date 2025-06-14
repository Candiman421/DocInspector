# InDesign Inspector - Bug/Dev Agent Guide

## Project Purpose & Voice
- **Primary Goal**: Track property changes between before/after versions of InDesign documents
- **Text Capture**: Only for identification and differentiation between text elements (NOT content analysis)
- **API Philosophy**: Built to survive InDesign's unreliable, "cruddy" APIs with robust fallbacks
- **Learning System**: Discovers best API access patterns for current document types
- **No Fluff**: No emoticons, direct communication, technical focus

## Architecture Principles

### Chunk System
- **5 Chunks** assembled into single .jsx file in specific order
- Each chunk has defined responsibility
- **Assembly Order**: 1→2→3→4→5 (Config→Inspector→Comparison→Reports→Interface)

### Safety-First API Access
- **Never** use direct property access (`doc.images.length`)
- **Always** use safe methods (`safeGetLength(doc.images)`)
- **All** UI code must use safe methods (common bug source)

## Known Bug Patterns

### Bug #1: Direct Property Access in UI
**Symptom**: "Object does not support property" errors during initialization
**Cause**: UI/status functions bypass safety mechanisms
**Fix**: Replace all `doc.property` with `safeGetProperty(doc, 'property')`
**Location**: Usually in status/UI generation functions
**Fixed in**: getEnhancedStatusText(), exportAllReportsToFolder()

### Bug #2: Collection Length Errors
**Symptom**: "Invalid index" or "length undefined" 
**Cause**: InDesign collections have inconsistent .length/.count properties
**Fix**: Use `safeGetLength()` for all collections
**Pattern**: `doc.pages.length` → `safeGetLength(doc.pages)`

### Bug #3: Inefficient Duplicate Property Access
**Symptom**: Performance issues and potential errors from multiple calls
**Cause**: Functions calling `safeGetProperty(obj, 'prop')` multiple times
**Fix**: Store result in variable for reuse
**Pattern**: 
```javascript
// BAD
filePath: safeGetProperty(doc, 'filePath') ? safeGetProperty(doc, 'filePath').toString() : null

// GOOD  
filePath: (function() {
    var path = safeGetProperty(doc, 'filePath');
    return path ? path.toString() : null;
})()
```

### Bug #4: Document Name/Path Access in Main Functions
**Symptom**: "Object does not support property" in core workflow functions
**Cause**: Functions like quickCompare(), resetBaseline(), analyzeDocument() using direct access
**Fix**: Replace `doc.name` with `safeGetProperty(doc, 'name', 'document')`
**Fixed in**: quickCompare(), resetBaseline(), analyzeDocument()

### Bug #5: Text Content Direct Access
**Symptom**: Text capture functions failing on textFrame.contents
**Cause**: Even "safe" functions using direct property access
**Fix**: Use safeGetProperty() even in utility functions like safeTextCapture()
**Pattern**: `textFrame.contents` → `safeGetProperty(textFrame, 'contents')`

## Development Rules

### Text Handling
- Text previews limited to 60 characters for identification only
- Purpose: Differentiate "Header Text..." from "Body Text..." 
- NOT for content analysis or change tracking of actual text content

### Error Resilience
- Every property access must have fallback
- Timeout protection on all collection iterations
- Categorize API errors for learning better access patterns
- Store successful alternatives in `discoveredAlternatives`

### Memory Management
- Clear large objects after analysis
- Limit collection sampling (default: 20 items)
- File size limits enforced (3MB reports)

### Configuration Consistency
- Use `ANALYSIS_CONFIG.maxCollectionSample` instead of hardcoded `15` or `20`
- Use `ANALYSIS_CONFIG.timeoutThreshold` instead of hardcoded timeout values
- Use `ANALYSIS_CONFIG.maxTextPreviewLength` instead of hardcoded `60`
- All configurable values should reference the config objects

### Function-Level Rules
- Store frequently accessed properties in variables to avoid duplicate calls
- Use anonymous functions for complex inline calculations
- Always handle the case where objects might be null/undefined

## Testing Protocol
1. Test with documents that have missing/broken links
2. Test with documents with unusual text threading
3. Test with documents with many layers/pages
4. Verify ESTK console shows detailed progress (not just errors)

## Code Quality Standards
- All functions must handle null/undefined gracefully
- No assumption about InDesign API consistency
- Comprehensive logging for troubleshooting
- Progressive enhancement (works with minimal data if APIs fail)

## Common InDesign API Gotchas
- Images/Links collections often problematic
- Font properties may reference missing fonts
- Thread relationships can be circular
- Master page inheritance affects property access
- Document state affects property availability

---
*This guide grows with each bug fix and discovery. Update after every major issue resolution.*

## Recent Fixes Applied (Latest Session)
**Fixed 15+ direct property access violations across all chunks:**
- Chunk 1: safeTextCapture() function, configuration usage
- Chunk 2: getDocumentInfo(), getTextFramesInfo(), calculateWordCount(), getFirstParagraphStyle(), getStoriesInfo()
- Chunk 3: analyzeStructuralChanges(), calculateEnhancedDiscoveryInfo() 
- Chunk 4: quickCompare(), all report generation functions
- Chunk 5: getEnhancedStatusText(), analyzeDocument(), resetBaseline(), exportAllReportsToFolder()

**Key Pattern**: Even functions named "safe" were bypassing safety mechanisms. The script preached safe API access but violated its own rules in core functions.

**Result**: Should eliminate "Object does not support property" errors during script initialization and operation.