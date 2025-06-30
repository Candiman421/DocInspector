# AI Response Template Guide for AdHoc System

This guide defines the exact format that AI assistants (Claude, ChatGPT, etc.) must use when responding to code modification requests for the AdHoc Code Updater system.

## Required Template Format

Every response for code changes must follow this exact structure:

```
Location: [relative/path/to/file.ext]
Operation: [OPERATION_TYPE]
Target: [target_identifier]
Notes: [brief explanation]
---
[actual code content]
```

## Template Fields

### Location (Required)
- **Format**: `Location: path/to/file.ext`
- **Purpose**: Specifies the target file relative to the DocDom project root
- **Examples**:
  - `Location: DocDomV4.1/1.20.0.0_safety-utilities.jsx`
  - `Location: Utils/core/module-parser.js`
  - `Location: Utils/config/patterns.js`

### Operation (Required)
- **Format**: `Operation: OPERATION_TYPE`
- **Purpose**: Specifies what type of modification to perform
- **Valid Operations**:
  - `REPLACE_FUNCTION` - Replace an entire function
  - `REPLACE_TEXT` - Replace specific text patterns
  - `ADD_FUNCTION` - Add a new function
  - `ADD_IMPORT` - Add an import statement
  - `ADD_EXPORT` - Add an export statement
  - `QUERY_FUNCTION` - Analyze function (returns info, no changes)

### Target (Required for most operations)
- **Format**: `Target: identifier`
- **Purpose**: Specifies what to target for the operation
- **Examples**:
  - For `REPLACE_FUNCTION`: `Target: functionName`
  - For `REPLACE_TEXT`: `Target: old_text -> new_text` or just `Target: search_pattern`
  - For `ADD_FUNCTION`: `Target: afterFunction` (optional placement hint)

### Notes (Optional)
- **Format**: `Notes: explanation`
- **Purpose**: Human-readable explanation of the change
- **Will be stripped**: This content is removed before processing

### Separator (Required)
- **Format**: `---` (exactly three dashes on their own line)
- **Purpose**: Separates metadata from actual code content

### Content (Required)
- **Format**: Raw code content after the `---` separator
- **Purpose**: The actual code to insert, replace, or add

## Operation Examples

### REPLACE_FUNCTION
Replace an entire function with enhanced version:

```
Location: Utils/core/module-parser.js
Operation: REPLACE_FUNCTION
Target: extractRegistration
Notes: Enhanced function with debugging and error handling
---
/**
 * ENHANCED - Extract module registration with comprehensive debugging
 * @param {string} content - File content to analyze
 * @returns {Object} Registration analysis with debug info
 */
const extractRegistration = (content) => {
    console.log('🔍 Processing registration extraction...');
    
    try {
        // Enhanced implementation with debugging
        const registrationPattern = /registerModule\(['"`]([^'"`]+)['"`]/;
        const match = content.match(registrationPattern);
        
        if (match) {
            console.log(`✅ Found registration: ${match[1]}`);
            return {
                found: true,
                module: match[1],
                line: content.substring(0, match.index).split('\n').length
            };
        }
        
        console.log('❌ No registration found');
        return { found: false };
    } catch (error) {
        console.error('🚨 Registration extraction error:', error);
        return { found: false, error: error.message };
    }
};
```

### REPLACE_TEXT
Fix a specific text pattern:

```
Location: DocDomV4.1/1.20.0.0_safety-utilities.jsx
Operation: REPLACE_TEXT
Target: registerModule('1.2.0.0_safety-utilities' -> registerModule('1.20.0.0_safety-utilities'
Notes: Fix critical version mismatch in module registration
---
registerModule('1.20.0.0_safety-utilities'
```

### ADD_FUNCTION
Add a new function to existing file:

```
Location: Utils/core/module-parser.js
Operation: ADD_FUNCTION
Target: afterFunction:extractRegistration
Notes: Add new debugging utility function
---
/**
 * Debug registration analysis with detailed output
 * @param {string} content - File content
 * @returns {Object} Detailed debug information
 */
const debugRegistration = (content) => {
    const analysis = extractRegistration(content);
    
    console.log('🔍 Registration Debug Report:');
    console.log(`  📄 Content length: ${content.length} chars`);
    console.log(`  🎯 Registration found: ${analysis.found}`);
    
    if (analysis.found) {
        console.log(`  📋 Module: ${analysis.module}`);
        console.log(`  📍 Line: ${analysis.line}`);
    }
    
    return {
        ...analysis,
        debug: {
            contentLength: content.length,
            timestamp: new Date().toISOString()
        }
    };
};
```

### ADD_IMPORT
Add new import statement:

```
Location: Utils/core/module-parser.js
Operation: ADD_IMPORT
Target: top
Notes: Add chalk for colored console output
---
import chalk from 'chalk';
```

### QUERY_FUNCTION
Analyze existing function (no changes):

```
Location: Utils/core/module-parser.js
Operation: QUERY_FUNCTION
Target: extractRegistration
Notes: Analyze current function for potential improvements
---
{
    "analysis": "Function is well-structured but could benefit from error handling",
    "suggestions": [
        "Add try-catch block",
        "Add input validation",
        "Add debug logging"
    ],
    "complexity": "medium",
    "maintainability": "good"
}
```

## Batch Operations

For multiple changes, create separate templates:

```
Location: DocDomV4.1/module1.jsx
Operation: REPLACE_TEXT
Target: old_version -> new_version
Notes: Fix version in module 1
---
new_version

Location: DocDomV4.1/module2.jsx
Operation: REPLACE_TEXT
Target: old_version -> new_version
Notes: Fix version in module 2
---
new_version
```

## Error Prevention

### Common Mistakes to Avoid:
1. **Missing separator**: Always include `---` line
2. **Wrong operation**: Use only valid operation types
3. **Missing Location**: Every template needs a file path
4. **Incorrect Target format**: Follow examples for each operation type
5. **Extra formatting**: Don't wrap code in markdown backticks

### Validation Checklist:
- ✅ Location field present and valid
- ✅ Operation is one of the valid types
- ✅ Target matches operation requirements
- ✅ Separator `---` on its own line
- ✅ Code content after separator
- ✅ No markdown formatting in code section

## Integration with DocDom Project

### File Paths:
- All paths are relative to DocDom project root
- Common locations:
  - `DocDomV4.1/` - Module files
  - `Utils/core/` - Core utilities
  - `Utils/config/` - Configuration files
  - `Utils/AdHoc/` - AdHoc system files

### DocDom-Specific Operations:
- Module registration fixes: Use `REPLACE_TEXT` with version patterns
- Function enhancements: Use `REPLACE_FUNCTION` with complete function
- Import additions: Use `ADD_IMPORT` for new dependencies

## Success Criteria

A properly formatted template will:
1. Parse without errors in the AdHoc system
2. Generate accurate preview in the right panel
3. Apply changes safely to the target file
4. Maintain code structure and formatting
5. Preserve existing functionality

Follow this template format exactly for guaranteed compatibility with the AdHoc Code Updater system.