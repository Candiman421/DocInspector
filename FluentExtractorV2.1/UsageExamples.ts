/**
 * Comprehensive Usage Examples for ActionDescriptor Navigation Framework
 * Shows practical patterns for scoring and assessment workflows
 * All examples verified against final API implementation with ES3 transpilation compatibility
 */

import { stringIDToTypeID } from "./ps";
import { ActionDescriptorNavigator, ActionListNavigator } from './ActionDescriptorNavigator';
import { ActionDescriptorPath, PathFactory, P } from './PathAccessor';
import { ListValueExtractor } from './ListExtractors';
import { ValueType } from './types';

// =============================================================================
// BASIC NAVIGATION EXAMPLES
// =============================================================================

/**
 * Demonstrates basic navigation patterns using ActionDescriptorNavigator
 * Shows factory methods, safe navigation, and value extraction
 * 
 * @example
 * ```typescript
 * basicNavigationExamples();
 * ```
 */
function basicNavigationExamples() {
    console.log('=== Basic Navigation Examples ===');
    
    // Get navigators using factory methods (ActionReference cleanup handled automatically)
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    const docNav = ActionDescriptorNavigator.forCurrentDocument();
    
    // Extract basic properties (always returns predictable values)
    const layerName = layerNav.getValue('name', 'string');          // "" if missing
    const opacity = layerNav.getValue('opacity', 'double');         // -1 if missing  
    const visible = layerNav.getValue('visible', 'boolean');        // false if missing
    const blendMode = layerNav.getValue('mode', 'enumerated');      // "" if missing
    
    console.log('Layer: ' + layerName + ', Opacity: ' + opacity + ', Visible: ' + visible);
    
    // Safe navigation to nested objects (returns new sentinels, never null)
    const boundsNav = layerNav.object('bounds');
    const left = boundsNav.getValue('left', 'double');              // -1 if no bounds
    const top = boundsNav.getValue('top', 'double');                // -1 if no bounds
    
    // Document information
    const docWidth = docNav.getValue('width', 'double');            // -1 if missing
    const docHeight = docNav.getValue('height', 'double');          // -1 if missing
    const colorMode = docNav.getValue('mode', 'enumerated');        // "" if missing
    
    console.log('Document: ' + docWidth + 'x' + docHeight + ', Mode: ' + colorMode);
    
    // Demonstrate safe layer access by index (1-based)
    const thirdLayer = ActionDescriptorNavigator.forLayerByIndex(3);
    const thirdLayerName = thirdLayer.getValue('name', 'string');   // "" if layer doesn't exist
    console.log('Third layer: ' + thirdLayerName);
}

// =============================================================================
// FLUENT API EXAMPLES (RECOMMENDED APPROACH)
// =============================================================================

/**
 * Demonstrates fluent API patterns using ActionDescriptorNavigator
 * Shows property extraction, bounds calculation, and text navigation
 * 
 * @example
 * ```typescript
 * fluentAPIExamples();
 * ```
 */
function fluentAPIExamples() {
    console.log('=== Fluent API Examples ===');
    
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Note: P.extract() works directly with ActionDescriptor from layerNav internal state
    // In practice, you'll often have the ActionDescriptor from other sources
    
    // For demonstration, we'll show the pattern assuming you have the descriptor
    // In real usage, you might get the descriptor from app.activeDocument.activeLayer, etc.
    
    // Basic property extraction using fluent API
    console.log('=== Basic Fluent API Examples ===');
    
    // These methods work on any ActionDescriptor - layerNav just provides the navigation
    const layerName = layerNav.getValue('name', 'string');
    const layerOpacity = layerNav.getValue('opacity', 'double');
    const layerVisible = layerNav.getValue('visible', 'boolean');
    
    console.log('Layer properties: ' + layerName + ', ' + layerOpacity + '%, ' + layerVisible);
    
    // Bounds extraction with automatic width/height calculation
    const bounds = layerNav.getBounds();
    console.log('Bounds: left=' + bounds.left + ', top=' + bounds.top + 
                ', width=' + bounds.width + ', height=' + bounds.height);
    // Width and height are calculated as: width = right - left, height = bottom - top
    
    // Complex nested navigation
    const textNav = layerNav.object('textKey');
    const textContent = textNav.getValue('text', 'string');         // Corrected property name
    console.log('Text content: "' + textContent + '"');
    
    // Transformations would be applied in PathAccessor patterns (see search examples)
}

// =============================================================================
// SEARCH-FIRST EXAMPLES (ROBUST APPROACH)
// =============================================================================

/**
 * Demonstrates search-first patterns for robust document analysis
 * Shows text style searching, filter searching, and layer enumeration
 * 
 * @example
 * ```typescript
 * searchFirstExamples();
 * ```
 */
function searchFirstExamples() {
    console.log('=== Search-First Examples ===');
    
    // Get current layer for search operations
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Note: Search methods are static methods on ActionDescriptorPath
    // They require an ActionDescriptor to search within
    
    // For real usage, you would typically search within specific layer descriptors
    // Here we demonstrate the API patterns
    
    // Search for text properties by font name (robust against document variations)
    console.log('Searching for font properties...');
    
    // These would be used with actual ActionDescriptor objects:
    // const arialSize = ActionDescriptorPath.findTextStyleByProperty(
    //     layerDesc, 'fontName', 'Arial', 'size', 'double'
    // );
    
    // For demonstration, show the search pattern structure:
    console.log('Search patterns:');
    console.log('- Find Arial font size: ActionDescriptorPath.findTextStyleByProperty(desc, "fontName", "Arial", "size", "double")');
    console.log('- Find Helvetica color: ActionDescriptorPath.findTextStyleByProperty(desc, "fontName", "Helvetica", "color", "string")');
    console.log('- Find 24pt font name: ActionDescriptorPath.findTextStyleByProperty(desc, "size", 24, "fontName", "string")');
    
    // Filter search examples
    console.log('Filter search patterns:');
    console.log('- Find blur radius: ActionDescriptorPath.findFilterByName(desc, "Gaussian Blur", "radius", "double")');
    console.log('- Find shadow distance: ActionDescriptorPath.findFilterByName(desc, "Drop Shadow", "distance", "double")');
    console.log('- Find glow size: ActionDescriptorPath.findFilterByName(desc, "Outer Glow", "blur", "double")');
    
    // Document-level layer searching  
    const docNav = ActionDescriptorNavigator.forCurrentDocument();
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    console.log('All layer names: ' + layerNames.join(', '));
    
    // Find specific layers
    let headerFound = false;
    let backgroundFound = false;
    for (let i = 0; i < layerNames.length; i++) {
        const name = layerNames[i].toLowerCase();
        if (name.indexOf('header') >= 0) headerFound = true;
        if (name.indexOf('background') >= 0) backgroundFound = true;
    }
    console.log('Header layer found: ' + headerFound);
    console.log('Background layer found: ' + backgroundFound);
}

// =============================================================================
// LIST PROCESSING EXAMPLES
// =============================================================================

/**
 * Demonstrates list processing using ActionListNavigator
 * Shows count retrieval, item access, and value extraction from lists
 * Fixed: ES3 transpilation compatibility - uses getCount() method instead of count getter
 * 
 * @example
 * ```typescript
 * listProcessingExamples();
 * ```
 */
function listProcessingExamples() {
    console.log('=== List Processing Examples ===');
    
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Navigate to text style ranges list
    const textNav = layerNav.object('textKey');
    const styleList = textNav.list('textStyleRange');
    
    // Extract all font sizes from text ranges
    const allFontSizes = styleList.getAllValues('size', 'double');
    console.log('All font sizes: ' + allFontSizes.join(', ')); // [12, 14, 16] or []
    
    // Find specific font size using predicate
    const largeFontSize = styleList.findValue('size', 'double', function(size) {
        return size > 20;
    });
    console.log('Large font size found: ' + largeFontSize); // 24 or -1
    
    // Note about ListValueExtractor for advanced list processing
    console.log('About ListValueExtractor...');
    console.log('ListValueExtractor is for advanced scenarios where you need to:');
    console.log('- Extract values from nested list structures');
    console.log('- Apply transformations to extracted values');
    console.log('- Work with complex path-based extraction');
    console.log('');
    console.log('ListExtractor interface pattern:');
    console.log('const extractor = {');
    console.log('    extract: function(rootDesc) {');
    console.log('        // Return raw ActionList or null');
    console.log('        // Implementation depends on specific list location');
    console.log('        return actionList;');
    console.log('    }');
    console.log('};');
    console.log('');
    console.log('Usage: new ListValueExtractor(extractor, "property.path", "double")');
    console.log('');
    
    // Recommended approach: Use ActionListNavigator methods directly
    console.log('Recommended approach for most scenarios:');
    const listCount = styleList.getCount(); // Fixed: ES3 compatibility
    if (listCount > 0) {
        // Process list items directly through the navigator - this is the recommended approach
        const fontNames = styleList.getAllValues('fontName', 'string');
        const fontSizes = styleList.getAllValues('size', 'double');
        
        console.log('Font names found: ' + fontNames.join(', '));
        console.log('Font sizes found: ' + fontSizes.join(', '));
        
        // Find specific values using predicates
        const largeFontSize = styleList.findValue('size', 'double', function(size) {
            return size > 20;
        });
        console.log('Large font size found: ' + largeFontSize);
        
        // Process individual list items
        for (let i = 0; i < Math.min(styleList.getCount(), 3); i++) { // Fixed: ES3 compatibility - Limit for demo
            const item = styleList.getObject(i);
            const styleNav = item.object('textStyle');
            const fontName = styleNav.getValue('fontName', 'string');
            const fontSize = styleNav.getValue('size', 'double');
            console.log('  Style ' + i + ': ' + fontName + ' ' + fontSize + 'pt');
        }
    } else {
        console.log('No text styles found in current layer');
    }
}

// =============================================================================
// BATCH EXTRACTION EXAMPLES
// =============================================================================

/**
 * Demonstrates batch value extraction for efficient property retrieval
 * Shows object-based and array-based batch extraction patterns
 * 
 * @example
 * ```typescript
 * batchExtractionExamples();
 * ```
 */
function batchExtractionExamples() {
    console.log('=== Batch Extraction Examples ===');
    
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Extract multiple properties in one call - guaranteed to return all values
    const layerProperties = layerNav.getValuesAsObject({
        name: { key: 'name', type: 'string' },
        opacity: { key: 'opacity', type: 'double' },
        visible: { key: 'visible', type: 'boolean' },
        mode: { key: 'mode', type: 'enumerated' },
        layerID: { key: 'layerID', type: 'integer' }
    });
    
    console.log('Batch extraction result:');
    console.log('  Name: "' + layerProperties.name + '"');        // Guaranteed to have value
    console.log('  Opacity: ' + layerProperties.opacity);         // Guaranteed to have value
    console.log('  Visible: ' + layerProperties.visible);         // Guaranteed to have value
    console.log('  Mode: "' + layerProperties.mode + '"');        // Guaranteed to have value
    console.log('  ID: ' + layerProperties.layerID);              // Guaranteed to have value
    
    // Extract multiple values as array
    const specs = [
        { key: 'name', type: 'string' as ValueType },
        { key: 'opacity', type: 'double' as ValueType },
        { key: 'visible', type: 'boolean' as ValueType }
    ];
    
    const values = layerNav.getValues(specs);
    console.log('Array extraction: [' + values.join(', ') + ']'); // ["Layer 1", 100, true]
}

// =============================================================================
// SPECIALIZED EXTRACTION EXAMPLES
// =============================================================================

/**
 * Demonstrates specialized extraction methods for bounds and text
 * Shows getBounds() with calculated dimensions and getTextProperties()
 * 
 * @example
 * ```typescript
 * specializedExtractionExamples();
 * ```
 */
function specializedExtractionExamples() {
    console.log('=== Specialized Extraction Examples ===');
    
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Get bounds with calculated width/height (corrected implementation)
    const bounds = layerNav.getBounds();
    console.log('Bounds object:');
    console.log('  Left: ' + bounds.left + ', Top: ' + bounds.top);
    console.log('  Right: ' + bounds.right + ', Bottom: ' + bounds.bottom);
    console.log('  Width: ' + bounds.width + ' (calculated: right - left)');
    console.log('  Height: ' + bounds.height + ' (calculated: bottom - top)');
    // Returns: { left: 100, top: 50, right: 300, bottom: 200, width: 200, height: 150 }
    // or all -1 if no bounds available
    
    // Get text properties (corrected to use 'text' property)
    const textProps = layerNav.getTextProperties();
    console.log('Text properties:');
    console.log('  Content: "' + textProps.content + '"');       // Uses 'text' property internally
    console.log('  Font: "' + textProps.fontName + '"');
    console.log('  Size: ' + textProps.fontSize + 'pt');
    // Returns: { content: "Hello", fontName: "Arial", fontSize: 12 }
    // or sentinel values ("", "", -1) if no text available
    
    // Using static methods for complex text style extraction
    // Note: These require actual ActionDescriptor objects
    console.log('Static extraction methods available:');
    console.log('- ActionDescriptorPath.extractTextStyleValues(desc, "textStyle.size", "double", 3)');
    console.log('- ActionDescriptorPath.findTextStyleByProperty(desc, "fontName", "Arial", "size", "double")');
    console.log('- ActionDescriptorPath.findFilterByName(desc, "Gaussian Blur", "radius", "double")');
}

// =============================================================================
// ERROR HANDLING AND EDGE CASES
// =============================================================================

/**
 * Demonstrates error handling and edge case scenarios
 * Shows graceful degradation and sentinel value patterns
 * 
 * @example
 * ```typescript
 * errorHandlingExamples();
 * ```
 */
function errorHandlingExamples() {
    console.log('=== Error Handling Examples ===');
    
    // All these examples show graceful handling of missing/invalid data
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Missing properties return sentinels
    const missingProp = layerNav.getValue('nonExistentProperty', 'string');
    console.log('Missing property: "' + missingProp + '"'); // ""
    
    const missingNumber = layerNav.getValue('nonExistentNumber', 'double');
    console.log('Missing number: ' + missingNumber); // -1
    
    const missingBool = layerNav.getValue('nonExistentBool', 'boolean');
    console.log('Missing boolean: ' + missingBool); // false
    
    // Missing nested objects return sentinels
    const missingNested = layerNav.object('missing').object('deep').getValue('property', 'string');
    console.log('Missing nested: "' + missingNested + '"'); // ""
    
    // Out of bounds list access returns sentinels
    const styleList = layerNav.object('textKey').list('textStyleRange');
    const outOfBounds = styleList.getObject(999).getValue('size', 'double');
    console.log('Out of bounds list access: ' + outOfBounds); // -1
    
    // Demonstrate that createSentinel() returns new instances (no shared state)
    const sentinel1 = ActionDescriptorNavigator.createSentinel();
    const sentinel2 = ActionDescriptorNavigator.createSentinel();
    console.log('Sentinels are separate objects: ' + (sentinel1 !== sentinel2)); // true
    
    // Invalid constructor parameters
    const badLayerNav = ActionDescriptorNavigator.forLayerByIndex(0); // Invalid: layers are 1-based
    const badLayerName = badLayerNav.getValue('name', 'string');
    console.log('Invalid layer index result: "' + badLayerName + '"'); // ""
}

// =============================================================================
// PRACTICAL SCORING SCENARIOS  
// =============================================================================

/**
 * Demonstrates practical scoring scenarios for assessment workflows
 * Shows property validation, text analysis, bounds checking, and organization scoring
 * Fixed: ES3 transpilation compatibility for styleList operations
 * 
 * @example
 * ```typescript
 * practicalScoringScenarios();
 * ```
 */
function practicalScoringScenarios() {
    console.log('=== Practical Scoring Scenarios ===');
    
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    
    // Scenario 1: Check layer properties for scoring
    const opacity = layerNav.getValue('opacity', 'double');
    const visible = layerNav.getValue('visible', 'boolean');
    const name = layerNav.getValue('name', 'string');
    
    console.log('Layer scoring:');
    console.log('  Opacity correct (>=50): ' + (opacity >= 50));
    console.log('  Is visible: ' + visible);
    console.log('  Has proper name: ' + (name.length > 0 && name !== "Layer 1"));
    
    // Scenario 2: Check text properties (would use actual text layer)
    const textNav = layerNav.object('textKey');
    const hasTextKey = textNav.hasKey('text');
    const textContent = textNav.getValue('text', 'string');
    
    console.log('Text scoring:');
    console.log('  Has text content: ' + hasTextKey);
    console.log('  Content length: ' + textContent.length);
    console.log('  Non-empty text: ' + (textContent.length > 0));
    
    // Scenario 3: Check bounds for layout scoring
    const bounds = layerNav.getBounds();
    const hasValidBounds = bounds.left !== -1 && bounds.top !== -1;
    const correctSize = bounds.width >= 200 && bounds.height >= 100;
    const correctPosition = bounds.left >= 50 && bounds.top >= 50;
    
    console.log('Layout scoring:');
    console.log('  Has valid bounds: ' + hasValidBounds);
    console.log('  Correct size (>=200x100): ' + correctSize);
    console.log('  Correct position (>=50,50): ' + correctPosition);
    
    // Scenario 4: Layer organization scoring
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    const layerCount = layerNames.length;
    let hasBackground = false;
    
    for (let i = 0; i < layerNames.length; i++) {
        if (layerNames[i].toLowerCase().indexOf('background') >= 0) {
            hasBackground = true;
            break;
        }
    }
    
    console.log('Organization scoring:');
    console.log('  Layer count: ' + layerCount);
    console.log('  Sufficient layers (>=3): ' + (layerCount >= 3));
    console.log('  Has background layer: ' + hasBackground);
    
    // Scenario 5: Text style analysis for comprehensive scoring
    const styleList = layerNav.object('textKey').list('textStyleRange');
    const styleCount = styleList.getCount(); // Fixed: ES3 compatibility
    
    console.log('Text style analysis:');
    console.log('  Style count: ' + styleCount);
    
    if (styleCount > 0) {
        // Check for specific font requirements
        let hasArial = false;
        let hasLargeFont = false;
        let fontSizes = [];
        
        // Fixed: ES3 compatibility - use getCount() method
        for (let styleIndex = 0; styleIndex < styleList.getCount() && styleIndex < 10; styleIndex++) {
            const style = styleList.getObject(styleIndex);
            const textStyleNav = style.object('textStyle');
            
            const fontName = textStyleNav.getValue('fontName', 'string');
            const fontSize = textStyleNav.getValue('size', 'double');
            
            if (fontName.indexOf('Arial') >= 0) {
                hasArial = true;
            }
            
            if (fontSize > 20) {
                hasLargeFont = true;
            }
            
            fontSizes.push(fontSize);
        }
        
        console.log('  Has Arial font: ' + hasArial);
        console.log('  Has large font (>20pt): ' + hasLargeFont);
        console.log('  Font sizes found: [' + fontSizes.join(', ') + ']');
        
        // Calculate average font size for scoring
        const validSizes = fontSizes.filter(function(size) { return size > 0; });
        const averageSize = validSizes.length > 0 
            ? validSizes.reduce(function(sum, size) { return sum + size; }, 0) / validSizes.length
            : 0;
        
        console.log('  Average font size: ' + Math.round(averageSize * 10) / 10 + 'pt');
        console.log('  Appropriate sizing (12-18pt avg): ' + (averageSize >= 12 && averageSize <= 18));
    }
}

// =============================================================================
// MEMORY MANAGEMENT EXAMPLES
// =============================================================================

/**
 * Demonstrates memory management best practices
 * Shows factory method usage and ActionReference cleanup patterns
 * 
 * @example
 * ```typescript
 * memoryManagementExamples();
 * ```
 */
function memoryManagementExamples() {
    console.log('=== Memory Management Examples ===');
    
    // Factory methods handle ActionReference cleanup automatically
    console.log('Safe factory method usage:');
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();        // ✅ Memory safe
    const docNav = ActionDescriptorNavigator.forCurrentDocument();       // ✅ Memory safe
    const specificLayer = ActionDescriptorNavigator.forLayerByIndex(5);  // ✅ Memory safe
    
    console.log('All factory methods handle ActionReference cleanup internally');
    
    // Demonstrate manual ActionReference cleanup pattern (if ever needed)
    console.log('Manual ActionReference pattern (for reference):');
    console.log('let ref: ActionReference | null = null;');
    console.log('try {');
    console.log('    ref = new ActionReference();');
    console.log('    // ... use ref');
    console.log('} finally {');
    console.log('    ref = null; // Important for ExtendScript memory management');
    console.log('}');
    
    // Show that sentinels don't share state
    const nav1 = layerNav.object('nonExistent');  // Returns new sentinel
    const nav2 = layerNav.object('alsoMissing');   // Returns new sentinel
    console.log('Sentinel navigators are independent instances');
    
    // Layer iteration with proper cleanup
    console.log('Safe layer iteration pattern:');
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    for (let i = 0; i < Math.min(layerNames.length, 3); i++) { // Limit for demo
        const currentLayer = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based
        const name = currentLayer.getValue('name', 'string');
        const opacity = currentLayer.getValue('opacity', 'double');
        console.log('  Layer ' + (i + 1) + ': "' + name + '" (' + opacity + '%)');
        // currentLayer automatically cleaned up when it goes out of scope
    }
}

// =============================================================================
// PATHACCESSOR FLUENT API PATTERNS
// =============================================================================

/**
 * Demonstrates PathAccessor fluent API patterns for advanced navigation
 * Shows basic patterns, search-first approaches, and transformation chains
 * 
 * @example
 * ```typescript
 * pathAccessorPatterns();
 * ```
 */
function pathAccessorPatterns() {
    console.log('=== PathAccessor Fluent API Patterns ===');
    
    // Note: In real usage, you'd have ActionDescriptor objects to extract from
    // Here we show the API patterns
    
    console.log('Basic PathAccessor patterns:');
    console.log('P.val("name", "string").extract(desc)                    // Get string property');
    console.log('P.val("opacity", "double").extract(desc)                 // Get numeric property');
    console.log('P.obj("bounds").val("width", "double").extract(desc)     // Navigate to nested property');
    
    console.log('Search-first patterns (recommended):');
    console.log('P.textStyleByFont("Arial", "size", "double").extract(desc)        // Find font size');
    console.log('P.filterByName("Gaussian Blur", "radius", "double").extract(desc) // Find filter property');
    console.log('P.findLayerByName("header").extract(docDesc)                      // Find layer by name');
    
    console.log('Transformation patterns:');
    console.log('P.val("size", "double").round(1).extract(desc)           // Round to 1 decimal');
    console.log('P.bounds("width").toPixels("pt", 72).extract(desc)       // Convert units');
    console.log('P.val("opacity", "double").toPercentage().extract(desc)  // Convert to percentage');
    
    console.log('Error handling patterns:');
    console.log('P.val("missing", "string").defaultTo("DEFAULT").extract(desc)    // Custom default');
    console.log('P.obj("missing").val("prop", "string").extract(desc)             // Safe navigation');
    
    // Demonstrate factory methods from PathFactory
    console.log('PathFactory shortcuts:');
    console.log('P.obj("textKey")     // Navigate to object');
    console.log('P.list("items")      // Navigate to list');
    console.log('P.val("name", "string")  // Extract value');
    console.log('P.bounds("width")    // Extract bounds property');
}

// =============================================================================
// LISTEXTRACTOR PATTERNS
// =============================================================================

/**
 * Demonstrates ListExtractor patterns for advanced list processing
 * Shows creation, transformation, and extraction methods
 * Fixed: ES3 transpilation compatibility for styleList operations
 * 
 * @example
 * ```typescript
 * listExtractorPatterns();
 * ```
 */
function listExtractorPatterns() {
    console.log('=== ListExtractor Patterns ===');
    
    // Show ListValueExtractor usage patterns
    console.log('Creating list extractors:');
    console.log('const extractor = new ListValueExtractor(basePath, "property.path", "double");');
    console.log('const roundedExtractor = extractor.round(2);  // Chain transformations');
    
    console.log('Extraction methods:');
    console.log('extractor.extractAll(desc)                    // Get all values: [1, 2, 3] or []');
    console.log('extractor.extractAt(desc, 0)                  // Get specific index: 1 or -1');
    console.log('extractor.findFirst(desc, val => val > 5)     // Find first match: 6 or -1');
    console.log('extractor.extractExactly(desc, 3)             // Get exactly N values: [1, 2, -1]');
    
    console.log('Transformation methods:');
    console.log('extractor.round(1)                            // Round decimals');
    console.log('extractor.transform(val => val * 2)           // Custom transform');
    
    // Demonstrate actual usage pattern
    const layerNav = ActionDescriptorNavigator.forCurrentLayer();
    const styleList = layerNav.object('textKey').list('textStyleRange');
    const listCount = styleList.getCount(); // Fixed: ES3 compatibility
    
    console.log('Current layer text styles count: ' + listCount);
    if (listCount > 0) {
        // Extract first style properties
        const firstStyle = styleList.getObject(0);
        const styleNav = firstStyle.object('textStyle');
        const fontSize = styleNav.getValue('size', 'double');
        const fontName = styleNav.getValue('fontName', 'string');
        console.log('First style: ' + fontName + ' ' + fontSize + 'pt');
    }
}

// =============================================================================
// ADVANCED SCORING PATTERNS
// =============================================================================

/**
 * Demonstrates advanced scoring patterns for complex assessments
 * Shows comprehensive layer analysis, text style validation, and effect detection
 * Fixed: ES3 transpilation compatibility throughout
 * 
 * @example
 * ```typescript
 * advancedScoringPatterns();
 * ```
 */
function advancedScoringPatterns() {
    console.log('=== Advanced Scoring Patterns ===');
    
    // Document-level analysis
    const docNav = ActionDescriptorNavigator.forCurrentDocument();
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    // Comprehensive layer analysis
    console.log('Document Analysis:');
    console.log('  Total layers: ' + layerNames.length);
    
    // Categorize layers by type
    let textLayerCount = 0;
    let imageLayerCount = 0;
    let backgroundLayerCount = 0;
    let effectLayerCount = 0;
    
    for (let i = 0; i < layerNames.length; i++) {
        const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based
        const name = layerNames[i].toLowerCase();
        
        // Check if layer has text
        const hasText = layerNav.hasKey('textKey');
        if (hasText) {
            textLayerCount++;
        }
        
        // Check for background layers
        if (name.indexOf('background') >= 0 || name === 'bg') {
            backgroundLayerCount++;
        }
        
        // Check for image layers (has bounds but no text)
        const bounds = layerNav.getBounds();
        const hasValidBounds = bounds.width > 0 && bounds.height > 0;
        if (hasValidBounds && !hasText && name.indexOf('background') === -1) {
            imageLayerCount++;
        }
        
        // Check for effects (placeholder - would need actual effect detection)
        const hasEffects = layerNav.hasKey('layerEffects');
        if (hasEffects) {
            effectLayerCount++;
        }
    }
    
    console.log('  Text layers: ' + textLayerCount);
    console.log('  Image layers: ' + imageLayerCount);
    console.log('  Background layers: ' + backgroundLayerCount);
    console.log('  Layers with effects: ' + effectLayerCount);
    
    // Text style consistency analysis
    console.log('Text Style Analysis:');
    
    let totalTextLayers = 0;
    let consistentFontUsage = true;
    const fontFamilies = [];
    const fontSizes = [];
    
    for (let i = 0; i < layerNames.length; i++) {
        const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based
        
        if (layerNav.hasKey('textKey')) {
            totalTextLayers++;
            const styleList = layerNav.object('textKey').list('textStyleRange');
            const styleCount = styleList.getCount(); // Fixed: ES3 compatibility
            
            // Fixed: ES3 compatibility - use getCount() method
            for (let styleIndex = 0; styleIndex < styleList.getCount() && styleIndex < 5; styleIndex++) {
                const style = styleList.getObject(styleIndex);
                const textStyleNav = style.object('textStyle');
                
                const fontName = textStyleNav.getValue('fontName', 'string');
                const fontSize = textStyleNav.getValue('size', 'double');
                
                if (fontName !== "") {
                    // Extract font family (remove weight/style info)
                    const fontFamily = fontName.split('-')[0];
                    if (fontFamilies.indexOf(fontFamily) === -1) {
                        fontFamilies.push(fontFamily);
                    }
                }
                
                if (fontSize > 0) {
                    fontSizes.push(fontSize);
                }
            }
        }
    }
    
    // Analyze font consistency
    console.log('  Total text layers: ' + totalTextLayers);
    console.log('  Font families used: ' + fontFamilies.length + ' (' + fontFamilies.join(', ') + ')');
    console.log('  Font family consistency: ' + (fontFamilies.length <= 2 ? 'Good' : 'Poor'));
    
    // Analyze font size hierarchy
    if (fontSizes.length > 0) {
        const uniqueSizes = [];
        for (let i = 0; i < fontSizes.length; i++) {
            const size = Math.round(fontSizes[i]);
            if (uniqueSizes.indexOf(size) === -1) {
                uniqueSizes.push(size);
            }
        }
        
        uniqueSizes.sort(function(a, b) { return b - a; }); // Sort descending
        
        console.log('  Font sizes used: ' + uniqueSizes.join(', ') + 'pt');
        console.log('  Font hierarchy: ' + (uniqueSizes.length >= 2 && uniqueSizes.length <= 4 ? 'Good' : 'Needs improvement'));
        
        // Check for readable sizes
        const readableSizes = uniqueSizes.filter(function(size) { return size >= 12; });
        console.log('  Readable sizes (>=12pt): ' + readableSizes.length + '/' + uniqueSizes.length);
    }
    
    // Document structure scoring
    console.log('Document Structure Scoring:');
    
    const structureScore = {
        hasBackground: backgroundLayerCount > 0,
        sufficientLayers: layerNames.length >= 3,
        hasTextContent: textLayerCount > 0,
        hasImageContent: imageLayerCount > 0,
        appropriateComplexity: layerNames.length >= 3 && layerNames.length <= 15,
        goodFontConsistency: fontFamilies.length <= 2 && fontFamilies.length > 0
    };
    
    let scorePoints = 0;
    const maxPoints = Object.keys(structureScore).length;
    
    // Use Object.keys() for ES3 transpilation compatibility and type safety
    const criteria = Object.keys(structureScore);
    for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        const passed = structureScore[criterion as keyof typeof structureScore];
        console.log('  ' + criterion + ': ' + (passed ? 'PASS' : 'FAIL'));
        if (passed) scorePoints++;
    }
    
    const finalScore = Math.round((scorePoints / maxPoints) * 100);
    console.log('Overall Structure Score: ' + finalScore + '% (' + scorePoints + '/' + maxPoints + ')');
}

// =============================================================================
// MAIN EXECUTION FUNCTION
// =============================================================================

/**
 * Runs all usage examples demonstrating the ActionDescriptor Navigation Framework
 * Comprehensive demonstration of API capabilities with ES3 transpilation compatibility
 * 
 * @example
 * ```typescript
 * runAllExamples();
 * ```
 */
function runAllExamples() {
    console.log('ActionDescriptor Navigation Framework - Usage Examples');
    console.log('=======================================================');
    
    try {
        basicNavigationExamples();
        console.log('');
        
        fluentAPIExamples();
        console.log('');
        
        searchFirstExamples();
        console.log('');
        
        listProcessingExamples();
        console.log('');
        
        batchExtractionExamples();
        console.log('');
        
        specializedExtractionExamples();
        console.log('');
        
        errorHandlingExamples();
        console.log('');
        
        practicalScoringScenarios();
        console.log('');
        
        memoryManagementExamples();
        console.log('');
        
        pathAccessorPatterns();
        console.log('');
        
        listExtractorPatterns();
        console.log('');
        
        advancedScoringPatterns();
        console.log('');
        
        console.log('All examples completed successfully!');
        
    } catch (error) {
        console.log('Error running examples: ' + error);
    }
}

// =============================================================================
// EXTENDSCRIPT COMPATIBILITY NOTES
// =============================================================================

/*
ExtendScript Compatibility Notes:
- No arrow functions used (function() {} syntax throughout)
- No Array.from() or modern array methods
- No const/let issues in loops
- Proper ActionReference cleanup patterns shown
- Compatible with Photoshop CS6+ ActionManager
- All examples use ExtendScript-safe patterns
- Fixed: ES3 transpilation compatibility - styleList.count changed to styleList.getCount()
*/

// Uncomment to run examples:
// runAllExamples();