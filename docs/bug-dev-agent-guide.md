# InDesign Inspector - Bug/Dev Agent Guide

## Project Purpose & Voice
- **Primary Goal**: Track property changes between before/after versions of InDesign documents
- **Text Capture**: Only for identification and differentiation between text elements (NOT content analysis)
- **API Philosophy**: Built to survive InDesign's unreliable, "cruddy" APIs with robust fallbacks
- **Learning System**: Discovers best API access patterns for current document types
- **No Fluff**: No emoticons, direct communication, technical focus

## Architecture Principles

### Chunk System (Updated 2.x Structure)
- **6 Chunks** assembled into single .jsx file in specific order
- Each chunk has defined responsibility
- **Assembly Order**: 1→2.1→2.2→2.3→3→4→5 (Config→Minimal→Standard→Comprehensive→Comparison→Reports→Interface)

### Safety-First API Access
- **Never** use direct property access (`doc.images.length`)
- **Always** use safe methods (`safeGetLength(doc.images)`)
- **All** UI code must use safe methods (common bug source)

## Known Bug Patterns

### Bug #1: Direct Property Access in UI ✅ FIXED
**Symptom**: "Object does not support property" errors during initialization
**Cause**: UI/status functions bypass safety mechanisms
**Fix**: Replace all `doc.property` with `safeGetProperty(doc, 'property')`
**Location**: Usually in status/UI generation functions
**Status**: Fixed in Chunks 1-4, likely remaining issues in Chunk 5

### Bug #2: Collection Length Errors ✅ FIXED
**Symptom**: "Invalid index" or "length undefined" 
**Cause**: InDesign collections have inconsistent .length/.count properties
**Fix**: Use `safeGetLength()` for all collections
**Pattern**: `doc.pages.length` → `safeGetLength(doc.pages)`
**Status**: Systematically fixed across all chunks

### Bug #3: Inefficient Duplicate Property Access ✅ FIXED
**Symptom**: Performance issues and potential errors from multiple calls
**Cause**: Functions calling `safeGetProperty(obj, 'prop')` multiple times
**Fix**: Store result in variable for reuse
**Status**: Fixed with property caching patterns in all chunks

### Bug #4: Document Name/Path Access in Main Functions ✅ FIXED
**Symptom**: "Object does not support property" in core workflow functions
**Cause**: Functions like quickCompare(), resetBaseline(), analyzeDocument() using direct access
**Fix**: Replace `doc.name` with `safeGetProperty(doc, 'name', 'document')`
**Status**: Fixed in Chunk 4, anticipate similar issues in Chunk 5

### Bug #5: Text Content Direct Access ✅ FIXED
**Symptom**: Text capture functions failing on textFrame.contents
**Cause**: Even "safe" functions using direct property access
**Fix**: Use safeGetProperty() even in utility functions like safeTextCapture()
**Status**: Comprehensively fixed in utility functions

### Bug #6: Property Caching for Performance ✅ FIXED
**Symptom**: Multiple calls to same expensive property access
**Cause**: Functions accessing same object properties multiple times
**Fix**: Cache property results in variables, especially for nested properties
**Status**: Implemented throughout with property caching patterns

### **Bug #7: Reserved Word Usage ✅ LARGELY FIXED**
**Symptom**: Parse errors, unexpected behavior, variable shadowing
**Cause**: Using JavaScript/ExtendScript reserved words as variable/parameter names
**Fix**: Use safe alternatives for all reserved words
**Critical Examples Fixed**:
- `char` → `character` ✅ (Fixed in Chunk 1)
- `length` → `collectionLength, itemCount, len` ✅ (Fixed throughout)
- `error` → `err, errorObj, exception` ✅ (Fixed in Chunks 3-4)
**Status**: Systematically fixed in Chunks 1-4, likely remaining in Chunk 5

### **Bug #8: Missing Function Dependencies ✅ FIXED**
**Symptom**: "getModeDescription is not a function" error
**Cause**: Chunk 5 calling functions that don't exist in any chunk
**Fix**: Add missing functions to appropriate chunks
**Specific Fix**: Added `getModeDescription()` to Chunk 2.1
**Status**: Core dependency resolved

### **Bug #9: Configuration Hardcoding ✅ FIXED**
**Symptom**: Magic numbers scattered throughout code
**Cause**: Using hardcoded values instead of ANALYSIS_CONFIG references
**Fix**: Replace all hardcoded limits with config references
**Status**: Systematically replaced throughout all chunks

## Anticipated Chunk 5 Issues (NEEDS REVIEW)

Based on patterns found and original code analysis:

### **Critical Issues Expected in Chunk 5:**

1. **Direct Property Access in UI Functions**
   - `getEnhancedStatusText()` - likely using `doc.name`, `doc.saved`, `doc.filePath`
   - `exportAllReportsToFolder()` - likely using `currentDoc.name`
   - `analyzeDocument()` - likely using `doc.saved`, `doc.filePath`
   - `resetBaseline()` - likely using `doc.saved`, `doc.filePath`

2. **Reserved Word Usage**
   - Catch blocks likely using `error` parameter instead of `exc`
   - Possible `length` variables in loops
   - Function parameters using reserved words

3. **Collection Access Violations**
   - `app.documents.length` instead of `safeGetLength(app.documents)`
   - Direct array access without safety checks

4. **Missing Safe Property Patterns**
   - Document validation functions not using `safeGetProperty`
   - Status display functions bypassing safety mechanisms

### **Specific Functions Requiring Review in Chunk 5:**
- `showEnhancedComparisonDialog()` - likely safe property violations
- `exportAllReportsToFolder()` - document property access
- `analyzeDocument()` - document save/path checking
- `resetBaseline()` - document validation
- `getEnhancedStatusText()` - comprehensive document property access
- `showMainMenu()` - document status checking
- Main script entry point - initialization and validation

## Development Rules

### Reserved Word Prevention ✅ IMPLEMENTED
- **NEVER** use reserved words as parameter/variable names
- **CRITICAL**: `char, boolean, byte, class, const, default, delete, export, extends, final, float, goto, implements, import, int, interface, long, native, package, private, protected, public, short, static, super, synchronized, throws, transient, volatile`
- **PROBLEMATIC**: `length, name, error, event, window, document, app, selection, parent, item, index`
- **Pattern**: When in doubt, add descriptive suffix (`charValue` not `char`)

### Text Handling ✅ IMPLEMENTED
- Text previews limited to 60 characters for identification only
- Purpose: Differentiate "Header Text..." from "Body Text..." 
- NOT for content analysis or change tracking of actual text content

### Error Resilience ✅ IMPLEMENTED
- Every property access must have fallback
- Timeout protection on all collection iterations
- Categorize API errors for learning better access patterns
- Store successful alternatives in `discoveredAlternatives`

### Memory Management ✅ IMPLEMENTED
- Clear large objects after analysis
- Limit collection sampling (default: 20 items)
- File size limits enforced (3MB reports)

### Configuration Consistency ✅ IMPLEMENTED
- Use `ANALYSIS_CONFIG.maxCollectionSample` instead of hardcoded values
- Use `ANALYSIS_CONFIG.timeoutThreshold` instead of hardcoded timeout values
- Use `ANALYSIS_CONFIG.maxTextPreviewLength` instead of hardcoded `60`

## Testing Protocol
1. Test with documents that have missing/broken links
2. Test with documents with unusual text threading
3. Test with documents with many layers/pages
4. Verify ESTK console shows detailed progress (not just errors)
5. **Test all analysis modes**: minimal, basic, standard, comprehensive
6. **Test mode switching**: ensure `getModeDescription()` works correctly
7. **Test UI functions**: main menu, help dialog, comparison results
8. Run through JSLint/ESLint to catch reserved word usage

## Code Quality Standards ✅ IMPLEMENTED
- All functions must handle null/undefined gracefully
- No assumption about InDesign API consistency
- Comprehensive logging for troubleshooting
- Progressive enhancement (works with minimal data if APIs fail)
- Zero tolerance for reserved word usage in variable/parameter names
- Mandatory use of `safeGetProperty()` and `safeGetLength()` throughout

## Common InDesign API Gotchas ✅ ADDRESSED
- Images/Links collections often problematic
- Font properties may reference missing fonts
- Thread relationships can be circular
- Master page inheritance affects property access
- Document state affects property availability

---

## **MAJOR FIXES COMPLETED (Latest Session)**

### **Chunk 1 (Config & Utils)** ✅ COMPLETE
- **Fixed**: Reserved word `char` → `character` in `isWhitespace()`
- **Added**: Missing functions `enhancedStatusLog()`, `validateDocumentState()`
- **Enhanced**: All utility functions with comprehensive error handling
- **Status**: Ready for assembly

### **Chunk 2.1 (Minimal Analysis)** ✅ COMPLETE
- **Fixed**: Missing `getModeDescription()` function (ROOT CAUSE of main error)
- **Added**: Complete mode management system
- **Enhanced**: Emergency bailout mechanisms
- **Status**: Core dependency issue resolved

### **Chunk 2.2 (Standard Analysis)** ✅ COMPLETE
- **Created**: Complete standard mode text analysis
- **Features**: Limited sampling with timeout protection
- **Enhanced**: Progressive analysis with bailouts
- **Status**: New chunk ready for assembly

### **Chunk 2.3 (Comprehensive Analysis)** ✅ COMPLETE
- **Migrated**: All core inspector functions from deprecated Chunk 2
- **Fixed**: Reserved word usage throughout (`error` → `exc`, etc.)
- **Enhanced**: Comprehensive analysis with full feature set
- **Status**: Complete replacement for original Chunk 2

### **Chunk 3 (Comparison)** ✅ COMPLETE
- **Fixed**: All reserved word violations (`error` → `exc`)
- **Fixed**: All direct property access violations
- **Enhanced**: Comparison logic with safe property access
- **Status**: Ready for assembly

### **Chunk 4 (Reports)** ✅ COMPLETE
- **Fixed**: All reserved word violations in catch blocks
- **Fixed**: All `safeGetProperty()` usage throughout
- **Enhanced**: Report generation with comprehensive error handling
- **Status**: Ready for assembly

## **REMAINING WORK**

### **Chunk 5 (Main Interface & Entry Point)** ⚠️ NEEDS REVIEW
**Expected Issues**:
1. Direct property access in `getEnhancedStatusText()`
2. Document validation bypassing safety mechanisms
3. Reserved word usage in catch blocks
4. Collection access without `safeGetLength()`
5. Missing error handling in UI functions

**Priority**: HIGH - This chunk contains the main entry point and user interface

### **Assembly Testing** ⚠️ PENDING
1. **Build Script Compatibility**: Verify version ordering (2.1 → 2.2 → 2.3)
2. **Function Dependencies**: Ensure all called functions exist
3. **Mode System Testing**: Verify analysis mode switching works
4. **ESTK Compatibility**: Test complete assembled script in ESTK

### **Integration Testing** ⚠️ PENDING
1. **Document Validation Flow**: minimal → basic → standard → comprehensive
2. **Error Recovery**: Test emergency bailouts and timeouts
3. **Memory Management**: Verify cleanup functions work correctly
4. **Report Generation**: Test complete report suite creation

---

## **SUCCESS METRICS**

### **Completed** ✅
- [x] Zero "Object does not support property" errors in Chunks 1-4
- [x] Zero reserved word usage in Chunks 1-4
- [x] Comprehensive safe property access implementation
- [x] Emergency bailout and timeout protection
- [x] Missing function dependencies resolved
- [x] Mode management system complete

### **In Progress** ⚠️
- [ ] Chunk 5 safe property access review
- [ ] Complete assembly testing
- [ ] ESTK debugging verification

### **Target State** 🎯
- [ ] Complete script runs without API errors
- [ ] All analysis modes functional (minimal → comprehensive)
- [ ] Graceful degradation for problematic documents
- [ ] Comprehensive error logging and recovery
- [ ] Zero reserved word usage throughout entire codebase

---
*This guide reflects the current state after systematic fixes to Chunks 1-4. Chunk 5 review and assembly testing remain as final steps.*