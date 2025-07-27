/**
 * Adobe ExtendScript ActionManager Navigator - Complete Type Definitions
 * 
 * Provides fluent, chainable interface for navigating Photoshop's ActionManager API
 * with automatic performance optimization, sentinel-based error handling, and 
 * criteria-based selection patterns.
 * 
 * @fileoverview Core type definitions for ActionManager navigation system
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Modern fluent navigation
 * ```typescript
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const textStyles = layer
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .whereMatches(range => range.getInteger('from') === 0)
 *   .select(range => ({
 *     fontName: range.getObject('textStyle').getString('fontPostScriptName'),
 *     fontSize: range.getObject('textStyle').getUnitDouble('sizeKey')
 *   }));
 * ```
 * 
 * @example Incorrect - Old brittle approach
 * ```typescript
 * // DON'T do this - crashes when structure changes
 * const firstRange = layer.getObject('textKey').getList('textStyleRange').getObject(0);
 * ```
 */

declare global {
    /**
     * ExtendScript global logging utility
     */
    var $: {
        writeln(message: string): void;
    };

    /**
     * Adobe ActionReference class for targeting specific objects
     */
    class ActionReference {
        constructor();
        putEnumerated(classID: number, typeID: number, enumID: number): void;
        putIndex(classID: number, index: number): void;
        putProperty(classID: number, propertyID: number): void;
        putName(classID: number, name: string): void;
        putIdentifier(classID: number, identifier: number): void;
        putOffset(classID: number, offset: number): void;
    }

    /**
     * Adobe ActionDescriptor class - container for property-value pairs
     */
    class ActionDescriptor {
        constructor();
        count: number;
        hasKey(key: number): boolean;
        getObjectValue(key: number): ActionDescriptor;
        getList(key: number): ActionList;
        getString(key: number): string;
        getDouble(key: number): number;
        getInteger(key: number): number;
        getBoolean(key: number): boolean;
        getEnumerationValue(key: number): number;
        getEnumerationType(key: number): number;
        getReference(key: number): ActionReference;
        getClass(key: number): number;
        getPath(key: number): File;
        getData(key: number): string;
        getType(key: number): number;
        getUnitDoubleType(key: number): number;
        getUnitDoubleValue(key: number): number;
        getLargeInteger(key: number): number;
        getObjectType(key: number): number;
    }

    /**
     * Adobe ActionList class - container for indexed items
     */
    class ActionList {
        constructor();
        count: number;
        getObjectValue(index: number): ActionDescriptor;
        getString(index: number): string;
        getDouble(index: number): number;
        getInteger(index: number): number;
        getBoolean(index: number): boolean;
        getEnumerationValue(index: number): number;
        getReference(index: number): ActionReference;
        getClass(index: number): number;
        getList(index: number): ActionList;
        getType(index: number): number;
        getData(index: number): string;
        getPath(index: number): File;
        getUnitDoubleType(index: number): number;
        getUnitDoubleValue(index: number): number;
        getLargeInteger(index: number): number;
        getObjectType(index: number): number;
        getEnumerationType(index: number): number;
    }

    /**
     * Execute ActionManager get operation
     */
    function executeActionGet(reference: ActionReference): ActionDescriptor;

    /**
     * Execute ActionManager action
     */
    function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogOptions?: number): ActionDescriptor;

    /**
     * Convert string ID to type ID
     */
    function stringIDToTypeID(stringID: string): number;

    /**
     * Convert type ID to string ID
     */
    function typeIDToStringID(typeID: number): string;

    /**
     * Convert 4-character ID to type ID
     */
    function charIDToTypeID(charID: string): number;

    /**
     * Convert type ID to 4-character ID
     */
    function typeIDToCharID(typeID: number): string;

    /**
     * Localize text string
     */
    function localize(text: string, ...args: any[]): string;
}

/**
 * Valid ActionManager value types for property extraction
 * 
 * @example Best - Type-safe property access
 * ```typescript
 * // Each method returns the appropriate type
 * const name: string = layer.getString('name');           // ValueType: 'string'
 * const opacity: number = layer.getInteger('opacity');    // ValueType: 'integer'
 * const visible: boolean = layer.getBoolean('visible');   // ValueType: 'boolean'
 * ```
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Sentinel value mapping for each ActionManager value type.
 * Used when operations fail to provide safe, non-crashing defaults.
 * 
 * @example Straightforward - Sentinel handling
 * ```typescript
 * const fontSize = textStyle.getDouble('sizeKey');
 * if (fontSize === SENTINELS.double) {
 *   // Handle failed operation gracefully
 *   console.log('Font size not available');
 * }
 * ```
 */
export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

/**
 * Sentinel value constants for graceful error handling.
 * These values are returned instead of throwing exceptions when operations fail.
 * 
 * @example Good - Checking for sentinel values
 * ```typescript
 * const layerName = layer.getString('name');
 * if (layerName !== SENTINELS.string) {
 *   // Safe to use layerName
 *   console.log('Layer name:', layerName);
 * }
 * 
 * const bounds = layer.getBounds();
 * if (hasValidBounds(bounds)) {
 *   // Safe to use bounds calculations
 *   const area = bounds.width * bounds.height;
 * }
 * ```
 * 
 * @example Incorrect - Assuming values are valid
 * ```typescript
 * // BAD - Could crash if layer has no name
 * const name = layer.getString('name').toUpperCase();
 * 
 * // BAD - Could crash if bounds are invalid
 * const area = layer.getBounds().width * layer.getBounds().height;
 * ```
 */
export interface SentinelValueMap {
    readonly "string": "";
    readonly "enumerated": "";
    readonly "integer": -1;
    readonly "double": -1;
    readonly "boolean": false;
}

/**
 * Sentinel values used throughout the system for graceful error handling.
 * Never returns null or undefined - always returns safe default values.
 */
export const SENTINELS: SentinelValueMap = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false
} as const;

/**
 * Function signature for filtering collections based on criteria.
 * Used with whereMatches() methods for criteria-based selection.
 * 
 * @param item - The item to evaluate
 * @returns true if item matches criteria, false otherwise
 * 
 * @example Best - Criteria-based text style filtering
 * ```typescript
 * // Find bold text ranges
 * .whereMatches(range => 
 *   range.getObject('textStyle').getBoolean('syntheticBold') === true
 * )
 * 
 * // Find large font sizes
 * .whereMatches(range => 
 *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
 * )
 * 
 * // Find specific font families
 * .whereMatches(range => 
 *   range.getObject('textStyle').getString('fontPostScriptName').includes('Arial')
 * )
 * ```
 * 
 * @example Good - Layer filtering
 * ```typescript
 * // Find visible layers
 * .whereMatches(layer => layer.getBoolean('visible') === true)
 * 
 * // Find text layers
 * .whereMatches(layer => layer.hasKey('textKey'))
 * 
 * // Find layers with effects
 * .whereMatches(layer => layer.getBoolean('layerFXVisible') === true)
 * ```
 * 
 * @example Incorrect - Brittle index-based access
 * ```typescript
 * // DON'T do this - assumes structure and index positions
 * .getFirstObject()              // BAD - assumes index 0 exists
 * .getObject(0)                  // BAD - brittle positional access
 * .getObject(items.length - 1)   // BAD - assumes last item is what you want
 * ```
 */
export type PredicateFunction = (item: any) => boolean;

/**
 * Function signature for transforming items during selection operations.
 * Used with select() methods to project data into desired shapes.
 * 
 * @param item - The item to transform
 * @returns The transformed item
 * 
 * @example Best - Comprehensive text style extraction
 * ```typescript
 * .select(range => ({
 *   // Character range info
 *   from: range.getInteger('from'),
 *   to: range.getInteger('to'),
 *   
 *   // Font properties
 *   fontName: range.getObject('textStyle').getString('fontPostScriptName'),
 *   fontSize: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *   fontCaps: range.getObject('textStyle').getEnumerationString('fontCaps'),
 *   
 *   // Style properties
 *   isBold: range.getObject('textStyle').getBoolean('syntheticBold'),
 *   isItalic: range.getObject('textStyle').getBoolean('syntheticItalic'),
 *   
 *   // Color information
 *   color: {
 *     red: range.getObject('textStyle').getObject('color').getDouble('red'),
 *     green: range.getObject('textStyle').getObject('color').getDouble('green'),
 *     blue: range.getObject('textStyle').getObject('color').getDouble('blue')
 *   },
 *   
 *   // Layout properties
 *   horizontalScale: range.getObject('textStyle').getDouble('horizontalScale'),
 *   tracking: range.getObject('textStyle').getInteger('tracking')
 * }))
 * ```
 * 
 * @example Good - Layer information extraction
 * ```typescript
 * .select(layer => ({
 *   name: layer.getString('name'),
 *   id: layer.getInteger('layerID'),
 *   opacity: layer.getInteger('opacity'),
 *   blendMode: layer.getEnumerationString('mode'),
 *   bounds: layer.getBounds(),
 *   hasText: layer.hasKey('textKey')
 * }))
 * ```
 * 
 * @example Straightforward - Simple property extraction
 * ```typescript
 * .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
 * .select(layer => layer.getString('name'))
 * .select(color => color.getDouble('red'))
 * ```
 * 
 * @example Incorrect - Using string method names
 * ```typescript
 * // DON'T do this - not type-safe and breaks easily
 * .extract({ fontSize: 'getDouble', isBold: 'getBoolean' })  // BAD
 * .map('getString', 'name')                                  // BAD
 * .pluck('fontPostScriptName')                              // BAD
 * ```
 */
export type SelectorFunction<T> = (item: any) => T;

/**
 * Bounds information for Photoshop layers and objects.
 * All measurements are in document units (typically pixels).
 * 
 * @example Best - Bounds calculations
 * ```typescript
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const bounds = layer.getBounds();
 * 
 * if (hasValidBounds(bounds)) {
 *   const centerX = bounds.left + (bounds.width / 2);
 *   const centerY = bounds.top + (bounds.height / 2);
 *   const area = bounds.width * bounds.height;
 *   const aspectRatio = bounds.width / bounds.height;
 *   
 *   console.log(`Layer size: ${bounds.width} x ${bounds.height}`);
 *   console.log(`Layer center: (${centerX}, ${centerY})`);
 * }
 * ```
 */
export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Validates if bounds object contains valid, non-sentinel values.
 * 
 * @param bounds - The bounds object to validate
 * @returns true if bounds are valid (not sentinel values)
 * 
 * @example Straightforward - Bounds validation
 * ```typescript
 * const bounds = layer.getBounds();
 * if (hasValidBounds(bounds)) {
 *   // Safe to use bounds for calculations
 *   const isWide = bounds.width > bounds.height;
 *   const isLarge = bounds.width > 500 && bounds.height > 500;
 * } else {
 *   console.log('Layer has no valid bounds');
 * }
 * ```
 */
export function hasValidBounds(bounds: BoundsObject): boolean {
    return bounds.left !== -1 && bounds.top !== -1 &&
        bounds.width > 0 && bounds.height > 0;
}

/**
 * Primary interface for navigating ActionDescriptor objects.
 * Provides chainable, fluent API for traversing Photoshop's object hierarchy.
 * 
 * Key Features:
 * - Automatic API call caching for performance
 * - Sentinel-based error handling (never crashes)
 * - Direct function calls (no string method names)
 * - Chainable operations throughout
 * 
 * @example Best - Complete text analysis workflow
 * ```typescript
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * 
 * // Extract all text formatting information
 * const textAnalysis = layer
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .select(range => ({
 *     from: range.getInteger('from'),
 *     to: range.getInteger('to'),
 *     style: {
 *       font: range.getObject('textStyle').getString('fontPostScriptName'),
 *       size: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *       bold: range.getObject('textStyle').getBoolean('syntheticBold'),
 *       color: range.getObject('textStyle').getObject('color')
 *     }
 *   }))
 *   .toResultArray();
 * ```
 */
export interface IActionDescriptorNavigator {
    /** 
     * Indicates if this navigator represents a failed operation.
     * When true, all operations return sentinel values.
     * 
     * @example Good - Checking for failed operations
     * ```typescript
     * const textObject = layer.getObject('textKey');
     * if (textObject.isSentinel) {
     *   console.log('This layer has no text');
     *   return;
     * }
     * 
     * // Safe to proceed with text operations
     * const styleRanges = textObject.getList('textStyleRange');
     * ```
     */
    readonly isSentinel: boolean;

    /**
     * Navigate to a child object within this descriptor.
     * 
     * @param key - Property name using camelCase (e.g., 'textKey', 'textStyle')
     * @returns Navigator for the child object, or sentinel if not found
     * 
     * @example Best - Correct ActionManager property navigation
     * ```typescript
     * // Text layer navigation - uses actual ActionManager property names
     * layer.getObject('textKey')                    // Text layer data
     *      .getObject('warp')                       // Warp transformation
     *      .getEnumerationString('warpStyle')       // "warpArc", "warpNone", etc.
     * 
     * // Text style navigation
     * layer.getObject('textKey')
     *      .getList('textStyleRange')
     *      .getFirstWhere(range => range.getInteger('from') === 0)
     *      .getObject('textStyle')                  // Style properties
     *      .getObject('color')                      // RGB color object
     * 
     * // Layer properties
     * layer.getObject('layerLocking')              // Lock settings
     *      .getBoolean('protectTransparency')      // Transparency lock
     * ```
     * 
     * @example Good - Document and application objects
     * ```typescript
     * // Document navigation
     * const doc = ActionDescriptorNavigator.forCurrentDocument();
     * const colorMode = doc.getEnumerationString('mode');           // "RGBColor", "CMYKColor"
     * const resolution = doc.getDouble('resolution');              // 72, 300, etc.
     * 
     * // Bounds and measurements
     * const bounds = layer.getObject('bounds');                    // Rectangle object
     * const width = bounds.getUnitDouble('width');                // Width in pixels
     * ```
     * 
     * @example Incorrect - Wrong property names
     * ```typescript
     * // DON'T use these - these are XML display names, not ActionManager properties
     * layer.getObject('Text')              // WRONG - should be 'textKey'
     * layer.getObject('TextStyle')         // WRONG - should be 'textStyle'  
     * layer.getObject('Color')             // WRONG - should be 'color'
     * layer.getObject('Bounds')            // WRONG - should be 'bounds'
     * ```
     */
    getObject(key: string): IActionDescriptorNavigator;

    /**
     * Navigate to a list collection within this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Navigator for the list, or sentinel if not found
     * 
     * @example Best - Text style range processing
     * ```typescript
     * layer.getObject('textKey')
     *      .getList('textStyleRange')               // List of character ranges
     *      .whereMatches(range => range.getInteger('from') >= 0)
     *      .select(range => ({
     *        from: range.getInteger('from'),
     *        to: range.getInteger('to'),
     *        fontName: range.getObject('textStyle').getString('fontPostScriptName')
     *      }))
     * ```
     * 
     * @example Good - Paragraph style processing
     * ```typescript
     * layer.getObject('textKey')
     *      .getList('paragraphStyleRange')         // Paragraph formatting
     *      .getFirstWhere(para => para.getInteger('from') === 0)
     *      .getObject('paragraphStyle')
     *      .getEnumerationString('alignment')      // "left", "center", "right"
     * ```
     */
    getList(key: string): IActionListNavigator;

    /**
     * Extract string value from this descriptor.
     * 
     * @param key - Property name using camelCase  
     * @returns String value, or empty string ("") if failed
     * 
     * @example Best - Font and layer name extraction
     * ```typescript
     * // Font identification
     * const fontName = textStyle.getString('fontPostScriptName');     // "ArialMT"
     * const familyName = textStyle.getString('fontName');             // "Arial"
     * const styleName = textStyle.getString('fontStyleName');         // "Bold"
     * 
     * // Layer information
     * const layerName = layer.getString('name');                      // "My Text Layer"
     * const blendMode = layer.getEnumerationString('mode');           // "normal", "multiply"
     * 
     * // Document properties
     * const docName = document.getString('title');                    // "Untitled-1"
     * ```
     * 
     * @example Good - Text content extraction
     * ```typescript
     * const textContent = layer.getObject('textKey').getString('textKey');
     * if (textContent !== SENTINELS.string) {
     *   console.log('Layer text:', textContent);
     * }
     * ```
     */
    getString(key: string): string;

    /**
     * Extract double/number value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value, or -1 if failed
     * 
     * @example Best - Color and opacity values
     * ```typescript
     * // RGB color components (0-255)
     * const red = color.getDouble('red');                     // 255
     * const green = color.getDouble('green');                 // 128
     * const blue = color.getDouble('blue');                   // 0
     * 
     * // Layer properties (0-255)
     * const opacity = layer.getDouble('opacity');             // 255 = 100%
     * const fillOpacity = layer.getDouble('fillOpacity');     // 127 = 50%
     * 
     * // Text scaling percentages
     * const hScale = textStyle.getDouble('horizontalScale');  // 100.0
     * const vScale = textStyle.getDouble('verticalScale');    // 150.0
     * ```
     * 
     * @example Good - Warp and transform values
     * ```typescript
     * const warpValue = warp.getDouble('warpValue');          // 20.0
     * const perspective = warp.getDouble('warpPerspective');  // 0.0
     * 
     * // Transform matrix values
     * const scaleX = transform.getDouble('xx');               // 0.742043669990316
     * const scaleY = transform.getDouble('yy');               // 0.742043669990316
     * ```
     */
    getDouble(key: string): number;

    /**
     * Extract unit double value (measurements with units).
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value in document units, or -1 if failed
     * 
     * @example Best - Font sizes and measurements
     * ```typescript
     * // Font size in points
     * const fontSize = textStyle.getUnitDouble('sizeKey');           // 12.0, 18.5, 72.0
     * const impliedSize = textStyle.getUnitDouble('impliedFontSize'); // Calculated size
     * 
     * // Spacing and positioning
     * const tracking = textStyle.getUnitDouble('tracking');          // 0, 100, -50
     * const baseline = textStyle.getUnitDouble('baselineShift');     // 0, 5.5, -2.0
     * 
     * // Document measurements
     * const docWidth = document.getUnitDouble('width');              // 1920 (pixels)
     * const docHeight = document.getUnitDouble('height');            // 1080 (pixels)
     * const resolution = document.getUnitDouble('resolution');       // 72, 300 (DPI)
     * ```
     * 
     * @example Good - Bounds measurements
     * ```typescript
     * const bounds = layer.getObject('bounds');
     * const left = bounds.getUnitDouble('left');                     // 100.5
     * const top = bounds.getUnitDouble('top');                       // 50.0
     * const width = bounds.getUnitDouble('width');                   // 200.0
     * const height = bounds.getUnitDouble('height');                 // 150.0
     * ```
     */
    getUnitDouble(key: string): number;

    /**
     * Extract integer value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Integer value, or -1 if failed
     * 
     * @example Best - Layer and range identifiers
     * ```typescript
     * // Layer identification
     * const layerID = layer.getInteger('layerID');           // 142, 67, 111
     * const itemIndex = layer.getInteger('itemIndex');       // 31, 32, 33
     * const parentID = layer.getInteger('parentLayerID');    // 67 (group ID)
     * 
     * // Text range boundaries
     * const from = range.getInteger('from');                 // 0 (start character)
     * const to = range.getInteger('to');                     // 11 (end character)
     * 
     * // Opacity and other percentage values (0-255)
     * const opacity = layer.getInteger('opacity');           // 255 = 100%
     * const fillOpacity = layer.getInteger('fillOpacity');   // 127 = 50%
     * ```
     * 
     * @example Good - Font and style properties
     * ```typescript
     * // Font technical properties
     * const fontScript = textStyle.getInteger('fontScript');      // 0
     * const fontTech = textStyle.getInteger('fontTechnology');    // 1
     * 
     * // Tracking and spacing (in 1/1000 em units)
     * const tracking = textStyle.getInteger('tracking');          // 0, 100, -50
     * 
     * // Document properties
     * const layerCount = document.getInteger('numberOfLayers');   // 15, 23
     * const globalAngle = layer.getInteger('globalAngle');        // 90, 120
     * ```
     */
    getInteger(key: string): number;

    /**
     * Extract boolean value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Boolean value, or false if failed
     * 
     * @example Best - Text formatting flags
     * ```typescript
     * // Font style flags
     * const isBold = textStyle.getBoolean('syntheticBold');        // true/false
     * const isItalic = textStyle.getBoolean('syntheticItalic');    // true/false
     * const autoLeading = textStyle.getBoolean('autoLeading');     // true/false
     * 
     * // Typography features
     * const hasLigatures = textStyle.getBoolean('ligature');       // true/false
     * const hasKerning = textStyle.getBoolean('autoKern');         // depends on string value
     * const hasFractions = textStyle.getBoolean('fractions');      // true/false
     * ```
     * 
     * @example Good - Layer state flags
     * ```typescript
     * // Layer visibility and state
     * const isVisible = layer.getBoolean('visible');              // true/false
     * const isLocked = layer.getBoolean('protectAll');            // true/false
     * const hasEffects = layer.getBoolean('layerFXVisible');      // true/false
     * 
     * // Layer type and properties
     * const isBackground = layer.getBoolean('background');        // true/false
     * const hasUserMask = layer.getBoolean('hasUserMask');        // true/false
     * const hasVectorMask = layer.getBoolean('hasVectorMask');    // true/false
     * ```
     * 
     * @example Straightforward - Document flags
     * ```typescript
     * const isExpanded = group.getBoolean('layerSectionExpanded'); // true/false
     * const useAligned = layer.getBoolean('useAlignedRendering');  // true/false
     * ```
     */
    getBoolean(key: string): boolean;

    /**
     * Extract enumeration value as string from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration string, or empty string ("") if failed
     * 
     * @example Best - Blend modes and alignments
     * ```typescript
     * // Layer blend modes
     * const blendMode = layer.getEnumerationString('mode');        // "normal", "multiply", "screen"
     * 
     * // Text alignment
     * const textAlign = paragraphStyle.getEnumerationString('alignment');  // "left", "center", "right"
     * 
     * // Font capabilities
     * const fontCaps = textStyle.getEnumerationString('fontCaps'); // "normal", "smallCaps", "allCaps"
     * ```
     * 
     * @example Good - Layer and document properties
     * ```typescript
     * // Layer section types
     * const sectionType = layer.getEnumerationString('layerSection');     // "layerSectionContent", "layerSectionStart"
     * 
     * // Document color modes
     * const colorMode = document.getEnumerationString('mode');            // "RGBColor", "CMYKColor", "grayscale"
     * 
     * // Text orientation and grid
     * const orientation = textShape.getEnumerationString('orientation');  // "horizontal", "vertical"
     * const gridding = textKey.getEnumerationString('textGridding');      // "none", "roman"
     * ```
     * 
     * @example Straightforward - Warp and effects
     * ```typescript
     * const warpStyle = warp.getEnumerationString('warpStyle');    // "warpNone", "warpArc", "warpBulge"
     * const antiAlias = textKey.getEnumerationString('antiAlias'); // "antiAliasSharp", "antiAliasSmooth"
     * ```
     */
    getEnumerationString(key: string): string;

    /**
     * Extract enumeration value as numeric ID.
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration ID, or -1 if failed
     * 
     * @example Straightforward - When you need the numeric enum ID
     * ```typescript
     * const blendModeID = layer.getEnumerationId('mode');          // Numeric blend mode ID
     * const alignmentID = paragraph.getEnumerationId('alignment'); // Numeric alignment ID
     * ```
     */
    getEnumerationId(key: string): number;

    /** Extract raw data value */
    getData(key: string): string;

    /** Extract class ID */
    getClass(key: string): number;

    /** Extract large integer value */
    getLargeInteger(key: string): number;

    /** Extract object type ID */
    getObjectType(key: string): number;

    /** Extract file path reference */
    getPath(key: string): File | null;

    /** Extract ActionReference object */
    getReference(key: string): ActionReference | null;

    /** Extract unit double type ID */
    getUnitDoubleType(key: string): number;

    /** Extract unit double value */
    getUnitDoubleValue(key: string): number;

    /** Extract enumeration type ID */
    getEnumerationType(key: string): number;

    /** Extract property type ID */
    getType(key: string): number;

    /**
     * Check if this descriptor contains the specified property.
     * 
     * @param key - Property name to check
     * @returns true if property exists, false otherwise
     * 
     * @example Best - Conditional property access
     * ```typescript
     * // Check for text content before accessing
     * if (layer.hasKey('textKey')) {
     *   const textContent = layer.getObject('textKey').getString('textKey');
     *   console.log('This is a text layer:', textContent);
     * }
     * 
     * // Check for layer effects
     * if (layer.hasKey('layerEffects')) {
     *   const effects = layer.getObject('layerEffects');
     *   // Process layer effects
     * }
     * 
     * // Check for mask properties
     * if (layer.hasKey('userMask')) {
     *   const maskEnabled = layer.getBoolean('userMaskEnabled');
     * }
     * ```
     * 
     * @example Good - Feature detection
     * ```typescript
     * // Detect layer capabilities
     * const hasText = layer.hasKey('textKey');
     * const hasEffects = layer.hasKey('layerEffects');
     * const hasAdjustment = layer.hasKey('adjustment');
     * 
     * console.log('Layer type:', {
     *   text: hasText,
     *   effects: hasEffects,
     *   adjustment: hasAdjustment
     * });
     * ```
     */
    hasKey(key: string): boolean;

    /**
     * Extract bounds/rectangle information from this descriptor.
     * 
     * @returns Bounds object with calculated width/height, or sentinel values if failed
     * 
     * @example Best - Layer size and position analysis
     * ```typescript
     * const bounds = layer.getBounds();
     * if (hasValidBounds(bounds)) {
     *   console.log(`Layer position: (${bounds.left}, ${bounds.top})`);
     *   console.log(`Layer size: ${bounds.width} x ${bounds.height}`);
     *   
     *   // Calculate derived properties
     *   const centerX = bounds.left + (bounds.width / 2);
     *   const centerY = bounds.top + (bounds.height / 2);
     *   const area = bounds.width * bounds.height;
     *   const aspectRatio = bounds.width / bounds.height;
     *   
     *   // Size categorization
     *   const isLarge = bounds.width > 500 || bounds.height > 500;
     *   const isWide = aspectRatio > 1.5;
     *   const isTall = aspectRatio < 0.67;
     * }
     * ```
     * 
     * @example Good - Multiple bounds comparison
     * ```typescript
     * const layerBounds = layer.getBounds();
     * const docBounds = document.getBounds();
     * 
     * if (hasValidBounds(layerBounds) && hasValidBounds(docBounds)) {
     *   const isOffCanvas = layerBounds.right < 0 || layerBounds.left > docBounds.width;
     *   const overlapsEdge = layerBounds.left <= 0 || layerBounds.top <= 0;
     * }
     * ```
     */
    getBounds(): BoundsObject;

    /**
     * Transform this descriptor using a custom selector function.
     * 
     * @param selector - Function to transform the descriptor
     * @returns Transformed result, or null if failed
     * 
     * @example Good - Custom data extraction
     * ```typescript
     * const customData = layer.select(layer => {
     *   if (!layer.hasKey('textKey')) return null;
     *   
     *   const textObj = layer.getObject('textKey');
     *   const styleRanges = textObj.getList('textStyleRange');
     *   
     *   return {
     *     hasText: true,
     *     rangeCount: styleRanges.getCount(),
     *     firstFont: styleRanges.getObject(0)
     *       .getObject('textStyle')
     *       .getString('fontPostScriptName')
     *   };
     * });
     * ```
     */
    select<T>(selector: SelectorFunction<T>): T | null;

    /**
     * Add debug information to the chain without breaking it.
     * 
     * @param label - Debug label to identify this step
     * @returns Same navigator for continued chaining
     * 
     * @example Good - Debug workflow
     * ```typescript
     * layer.debug('Starting with layer')
     *      .getObject('textKey')
     *      .debug('Got text object')
     *      .getList('textStyleRange')
     *      .debug('Got style ranges')
     *      .whereMatches(range => range.getInteger('from') === 0)
     *      .debug('Filtered to first range')
     *      .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *      .debug('Selected font names')
     *      .toResultArray();
     * ```
     */
    debug(label: string): IActionDescriptorNavigator;
}

/**
 * Interface for navigating ActionList collections.
 * Provides LINQ-style querying with automatic performance optimization.
 * 
 * Key Features:
 * - Criteria-based selection (never brittle index access)
 * - Lazy evaluation with single-pass execution
 * - Chainable filtering and transformation
 * - Direct methods without requiring .asEnumerable()
 * 
 * @example Best - Text style analysis workflow
 * ```typescript
 * const textStyles = layer
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .whereMatches(range => range.getInteger('to') > range.getInteger('from'))
 *   .select(range => ({
 *     text: layer.getObject('textKey').getString('textKey')
 *       .substring(range.getInteger('from'), range.getInteger('to')),
 *     style: range.getObject('textStyle')
 *   }))
 *   .whereMatches(item => item.text.trim().length > 0)
 *   .toResultArray();
 * ```
 */
export interface IActionListNavigator {
    /** Indicates if this navigator represents a failed operation */
    readonly isSentinel: boolean;

    /**
     * Get the number of items in this list.
     * 
     * @returns Item count, or -1 if failed
     * 
     * @example Straightforward - Count checking
     * ```typescript
     * const styleRanges = layer.getObject('textKey').getList('textStyleRange');
     * const count = styleRanges.getCount();
     * 
     * if (count > 0) {
     *   console.log(`Found ${count} text style ranges`);
     * } else if (count === 0) {
     *   console.log('No text styles found');
     * } else {
     *   console.log('Failed to get style ranges');
     * }
     * ```
     */
    getCount(): number;

    /**
     * Get item at specific index (use only when index is certain).
     * 
     * @param index - Zero-based index
     * @returns Navigator for the item, or sentinel if out of bounds
     * 
     * @example Straightforward - When index is guaranteed
     * ```typescript
     * // Only use when you know the index is valid
     * const firstRange = styleRanges.getObject(0);  // OK if you know it exists
     * const lastRange = styleRanges.getObject(styleRanges.getCount() - 1);
     * ```
     * 
     * @example Incorrect - Assumptions about structure
     * ```typescript
     * // DON'T assume these exist
     * const firstRange = styleRanges.getObject(0);     // BAD - might not exist
     * const secondRange = styleRanges.getObject(1);    // BAD - very brittle
     * ```
     * 
     * @deprecated Prefer criteria-based selection with getFirstWhere() or whereMatches()
     */
    getObject(index: number): IActionDescriptorNavigator;

    /**
     * Find first item matching criteria (PREFERRED approach).
     * 
     * @param predicate - Function to test each item
     * @returns First matching item, or sentinel if none found
     * 
     * @example Best - Text range analysis
     * ```typescript
     * // Find first character range (typically from=0)
     * const firstRange = styleRanges.getFirstWhere(range => 
     *   range.getInteger('from') === 0
     * );
     * 
     * // Find first bold text range
     * const boldRange = styleRanges.getFirstWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold') === true
     * );
     * 
     * // Find first large font
     * const largeRange = styleRanges.getFirstWhere(range => 
     *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
     * );
     * 
     * // Find specific font family
     * const arialRange = styleRanges.getFirstWhere(range => 
     *   range.getObject('textStyle').getString('fontPostScriptName').includes('Arial')
     * );
     * ```
     * 
     * @example Good - Layer filtering
     * ```typescript
     * // Find first visible layer
     * const visibleLayer = layers.getFirstWhere(layer => 
     *   layer.getBoolean('visible') === true
     * );
     * 
     * // Find first text layer
     * const textLayer = layers.getFirstWhere(layer => 
     *   layer.hasKey('textKey')
     * );
     * 
     * // Find layer by name
     * const titleLayer = layers.getFirstWhere(layer => 
     *   layer.getString('name').toLowerCase().includes('title')
     * );
     * ```
     * 
     * @example Incorrect - Brittle assumptions
     * ```typescript
     * // DON'T use these patterns
     * const first = list.getFirstObject();          // BAD - assumes exists
     * const item = list.getObject(0);               // BAD - positional assumption
     * const last = list.getObject(list.getCount() - 1); // BAD - assumes count > 0
     * ```
     */
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator;

    /**
     * Find exactly one item matching criteria, fail if 0 or multiple found.
     * 
     * @param predicate - Function to test each item
     * @returns The single matching item, or sentinel if 0 or multiple found
     * 
     * @example Good - Unique item selection
     * ```typescript
     * // Find the one range with a specific font (expecting exactly one)
     * const titleRange = styleRanges.getSingleWhere(range => 
     *   range.getObject('textStyle').getString('fontPostScriptName') === 'Arial-BoldMT'
     * );
     * 
     * // Find the one layer with a specific ID
     * const targetLayer = layers.getSingleWhere(layer => 
     *   layer.getInteger('layerID') === 142
     * );
     * 
     * if (!titleRange.isSentinel) {
     *   // Exactly one match found
     *   console.log('Found unique title range');
     * } else {
     *   // Either 0 or multiple matches (both are errors)
     *   console.log('Expected exactly one title range');
     * }
     * ```
     */
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator;

    /**
     * Find ALL items matching criteria - returns array directly (BEST for analysis).
     * 
     * @param predicate - Function to test each item
     * @returns Array of all matching items (empty array if none found)
     * 
     * @example Best - Complete text analysis with raw target values
     * ```typescript
     * // Get ALL bold text ranges for comprehensive analysis
     * const allBoldRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold') === true
     * );
     * 
     * console.log(`Found ${allBoldRanges.length} bold ranges`);
     * 
     * // Extract raw values for algorithmic processing (tolerance, grouping, etc.)
     * const rawAnalysisData = allBoldRanges.map(range => {
     *   const style = range.getObject('textStyle');
     *   const color = style.getObject('color');
     *   return {
     *     // Character positions (raw integers)
     *     from: range.getInteger('from'),
     *     to: range.getInteger('to'),
     *     
     *     // Font size (raw double, exact value from ActionManager)
     *     fontSize: style.getUnitDouble('sizeKey'),  // e.g., 12.5, 18.75, 24.0
     *     
     *     // Tracking (raw integer, 1/1000 em units)
     *     tracking: style.getInteger('tracking'),    // e.g., 0, 100, -50
     *     
     *     // Color values (raw doubles, 0-255 range)
     *     red: color.getDouble('red'),      // e.g., 255.0, 128.5, 0.0
     *     green: color.getDouble('green'),
     *     blue: color.getDouble('blue'),
     *     
     *     // Font name (raw string from ActionManager)
     *     fontName: style.getString('fontPostScriptName')  // e.g., "ArialMT", "TimesNewRomanPSMT"
     *   };
     * });
     * 
     * // Now apply your algorithms to raw target values:
     * // - Group font sizes within ±0.5pt tolerance
     * // - Detect near-black colors (RGB < 10,10,10)
     * // - Find tracking variations, etc.
     * ```
     * 
     * @example Good - Multi-condition filtering for analysis
     * ```typescript
     * // Get ALL ranges with large fonts
     * const largeTextRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
     * );
     * 
     * // Get ALL ranges with specific font family
     * const arialRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getString('fontPostScriptName').startsWith('Arial')
     * );
     * 
     * // Get ALL ranges with custom tracking
     * const trackedRanges = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getInteger('tracking') !== 0
     * );
     * 
     * // Extract raw font sizes for statistical analysis
     * const fontSizes = largeTextRanges.map(range => 
     *   range.getObject('textStyle').getUnitDouble('sizeKey')
     * );
     * // Your tolerance algorithms can now process the raw fontSizes array
     * ```
     * 
     * @example Straightforward - Layer analysis
     * ```typescript
     * // Get ALL visible layers (not just first one)
     * const visibleLayers = layers.getAllWhere(layer => 
     *   layer.getBoolean('visible') === true
     * );
     * 
     * // Get ALL text layers
     * const textLayers = layers.getAllWhere(layer => 
     *   layer.hasKey('textKey')
     * );
     * 
     * // Much more direct than: layers.whereMatches(...).toResultArray()
     * ```
     * 
     * @example Better - vs verbose chaining approach
     * ```typescript
     * // OLD verbose way:
     * const results1 = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .toResultArray();
     * 
     * // NEW direct way:
     * const results2 = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * );
     * 
     * // Both give same results, but getAllWhere is cleaner
     * ```
     */
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[];

    /**
     * Filter items by criteria (returns chainable collection).
     * Use for complex multi-stage filtering. For simple "get all matches", use getAllWhere().
     * 
     * @param predicate - Function to test each item
     * @returns Chainable enumerable for further filtering/transformation
     * 
     * @example Best - Multi-stage filtering pipeline
     * ```typescript
     * // Complex analysis with multiple filters and transformations
     * const analysisResults = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .whereMatches(range => range.getInteger('to') > range.getInteger('from'))
     *   .whereMatches(range => {
     *     const style = range.getObject('textStyle');
     *     return style.getUnitDouble('sizeKey') > 12;
     *   })
     *   .select(range => {
     *     const style = range.getObject('textStyle');
     *     return {
     *       range: { from: range.getInteger('from'), to: range.getInteger('to') },
     *       font: style.getString('fontPostScriptName'),
     *       size: style.getUnitDouble('sizeKey'),
     *       bold: style.getBoolean('syntheticBold'),
     *       color: style.getObject('color')
     *     };
     *   })
     *   .whereMatches(item => item.font !== SENTINELS.string)
     *   .toResultArray();
     * ```
     * 
     * @example Good - When you need chaining vs direct results
     * ```typescript
     * // Use whereMatches() for complex pipelines:
     * const processed = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)    // Filter step 1
     *   .whereMatches(range => someComplexCheck(range))          // Filter step 2  
     *   .select(range => transformData(range))                   // Transform step
     *   .whereMatches(item => item.isValid)                     // Filter transformed
     *   .toResultArray();                                        // Get final results
     * 
     * // Use getAllWhere() for simple "get all that match":
     * const simple = styleRanges.getAllWhere(range => 
     *   range.getObject('textStyle').getBoolean('syntheticBold')
     * ); // Direct array result
     * ```
     * 
     * @example Straightforward - Layer filtering pipeline
     * ```typescript
     * const visibleTextLayers = layers
     *   .whereMatches(layer => layer.getBoolean('visible') === true)
     *   .whereMatches(layer => layer.hasKey('textKey'))
     *   .whereMatches(layer => layer.getString('name') !== SENTINELS.string)
     *   .select(layer => ({
     *     name: layer.getString('name'),
     *     id: layer.getInteger('layerID'),
     *     bounds: layer.getBounds()
     *   }))
     *   .toResultArray();
     * ```
     */
    whereMatches(predicate: PredicateFunction): IEnumerable;

    /**
     * Transform items using selector function (returns chainable array).
     * 
     * @param transformer - Function to transform each item
     * @returns Chainable enumerable array for further operations
     * 
     * @example Best - Comprehensive data extraction
     * ```typescript
     * const fontAnalysis = styleRanges.select(range => {
     *   const style = range.getObject('textStyle');
     *   const color = style.getObject('color');
     *   
     *   return {
     *     // Range information
     *     from: range.getInteger('from'),
     *     to: range.getInteger('to'),
     *     length: range.getInteger('to') - range.getInteger('from'),
     *     
     *     // Font properties
     *     fontFamily: style.getString('fontName'),
     *     fontPostScript: style.getString('fontPostScriptName'),
     *     fontSize: style.getUnitDouble('sizeKey'),
     *     fontCaps: style.getEnumerationString('fontCaps'),
     *     
     *     // Style properties
     *     bold: style.getBoolean('syntheticBold'),
     *     italic: style.getBoolean('syntheticItalic'),
     *     
     *     // Color (RGB 0-255)
     *     color: {
     *       red: color.getDouble('red'),
     *       green: color.getDouble('green'),
     *       blue: color.getDouble('blue'),
     *       hex: `#${Math.round(color.getDouble('red')).toString(16).padStart(2, '0')}${Math.round(color.getDouble('green')).toString(16).padStart(2, '0')}${Math.round(color.getDouble('blue')).toString(16).padStart(2, '0')}`
     *     },
     *     
     *     // Layout properties
     *     horizontalScale: style.getDouble('horizontalScale'),
     *     verticalScale: style.getDouble('verticalScale'),
     *     tracking: style.getInteger('tracking'),
     *     
     *     // Typography features
     *     autoLeading: style.getBoolean('autoLeading'),
     *     ligatures: style.getBoolean('ligature'),
     *     kerning: style.getEnumerationString('autoKern')
     *   };
     * });
     * ```
     * 
     * @example Good - Simple property extraction
     * ```typescript
     * // Extract just font names
     * const fontNames = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .toResultArray();
     * 
     * // Extract layer names
     * const layerNames = layers
     *   .select(layer => layer.getString('name'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;

    /**
     * Convert to enumerable for complex operations (usually not needed).
     * 
     * @returns Enumerable wrapper for advanced LINQ-style operations
     * 
     * @example Straightforward - When you need enumerable-specific methods
     * ```typescript
     * const enumerable = styleRanges.asEnumerable();
     * const hasAnyBold = enumerable
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .hasAnyMatches();
     * ```
     */
    asEnumerable(): IEnumerable;

    /**
     * Add debug information without breaking the chain.
     * 
     * @param label - Debug label
     * @returns Same navigator for continued chaining
     * 
     * @example Good - Debugging list operations
     * ```typescript
     * styleRanges
     *   .debug('Starting with style ranges')
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .debug('After filtering valid ranges')
     *   .select(range => range.getObject('textStyle'))
     *   .debug('After selecting styles')
     *   .toResultArray();
     * ```
     */
    debug(label: string): IActionListNavigator;
}

/**
 * Interface for LINQ-style enumerable collections of ActionDescriptors.
 * Supports lazy evaluation with automatic performance optimization.
 * 
 * @example Best - Multi-stage text analysis
 * ```typescript
 * const boldTextRanges = styleRanges
 *   .whereMatches(range => range.getInteger('to') > range.getInteger('from'))
 *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
 *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 16);
 * 
 * if (boldTextRanges.hasAnyMatches()) {
 *   const firstBold = boldTextRanges.getFirst();
 *   const allBold = boldTextRanges.toResultArray();
 * }
 * ```
 */
export interface IEnumerable {
    /**
     * Filter items by criteria.
     * 
     * @param predicate - Function to test each item
     * @returns New enumerable with filtered items
     * 
     * @example Best - Progressive filtering
     * ```typescript
     * const filteredRanges = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 12)
     *   .whereMatches(range => range.getObject('textStyle').getString('fontPostScriptName') !== '');
     * ```
     */
    whereMatches(predicate: PredicateFunction): IEnumerable;

    /**
     * Get first item from filtered results.
     * 
     * @returns First item, or sentinel if none found
     * 
     * @example Good - First matching item
     * ```typescript
     * const firstLargeFont = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 24)
     *   .getFirst();
     * 
     * if (!firstLargeFont.isSentinel) {
     *   console.log('Found large font range');
     * }
     * ```
     */
    getFirst(): IActionDescriptorNavigator;

    /**
     * Check if any items match current filters.
     * 
     * @returns true if any items exist, false otherwise
     * 
     * @example Straightforward - Existence checking
     * ```typescript
     * const hasBoldText = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .hasAnyMatches();
     * 
     * const hasLargeFonts = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 36)
     *   .hasAnyMatches();
     * 
     * console.log('Text analysis:', { hasBoldText, hasLargeFonts });
     * ```
     */
    hasAnyMatches(): boolean;

    /**
     * Count items matching current filters.
     * 
     * @returns Number of matching items
     * 
     * @example Good - Counting filtered results
     * ```typescript
     * const boldRangeCount = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .getCount();
     * 
     * const largeTextCount = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getUnitDouble('sizeKey') > 24)
     *   .getCount();
     * 
     * console.log(`Found ${boldRangeCount} bold ranges and ${largeTextCount} large text ranges`);
     * ```
     */
    getCount(): number;

    /**
     * Materialize results into array (terminal operation).
     * 
     * @returns Array of matching ActionDescriptor navigators
     * 
     * @example Best - Final result collection
     * ```typescript
     * const boldRanges = styleRanges
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .toResultArray();
     * 
     * // Process each bold range
     * boldRanges.forEach((range, index) => {
     *   if (!range.isSentinel) {
     *     const from = range.getInteger('from');
     *     const to = range.getInteger('to');
     *     console.log(`Bold range ${index}: characters ${from}-${to}`);
     *   }
     * });
     * ```
     */
    toResultArray(): IActionDescriptorNavigator[];

    /**
     * Transform items and continue chaining.
     * 
     * @param transformer - Function to transform each item
     * @returns Chainable enumerable array
     * 
     * @example Best - Transform and continue filtering
     * ```typescript
     * const processedStyles = styleRanges
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .select(range => ({
     *     font: range.getObject('textStyle').getString('fontPostScriptName'),
     *     size: range.getObject('textStyle').getUnitDouble('sizeKey')
     *   }))
     *   .whereMatches(style => style.font !== SENTINELS.string)
     *   .whereMatches(style => style.size > 12)
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;

    /**
     * Add debug information.
     * 
     * @param label - Debug label
     * @returns Same enumerable for continued chaining
     * 
     * @example Good - Debug enumerable operations
     * ```typescript
     * const results = styleRanges
     *   .debug('Starting enumerable')
     *   .whereMatches(range => range.getInteger('from') >= 0)
     *   .debug('After filtering valid ranges')
     *   .whereMatches(range => range.getObject('textStyle').getBoolean('syntheticBold'))
     *   .debug('After filtering bold ranges')
     *   .toResultArray();
     * ```
     */
    debug(label: string): IEnumerable;
}

/**
 * Interface for chainable arrays supporting continued filtering and transformation.
 * Maintains lazy evaluation until terminal operations.
 * 
 * @example Best - Complex data pipeline
 * ```typescript
 * const fontReport = styleRanges
 *   .select(range => ({
 *     font: range.getObject('textStyle').getString('fontPostScriptName'),
 *     size: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *     bold: range.getObject('textStyle').getBoolean('syntheticBold')
 *   }))
 *   .whereMatches(item => item.font !== SENTINELS.string)
 *   .whereMatches(item => item.size > 0)
 *   .select(item => ({
 *     ...item,
 *     category: item.size > 24 ? 'large' : item.size > 16 ? 'medium' : 'small',
 *     weight: item.bold ? 'bold' : 'normal'
 *   }))
 *   .whereMatches(item => item.category !== 'small')
 *   .toResultArray();
 * ```
 */
export interface IEnumerableArray {
    /** Raw array access (avoid using directly) */
    readonly array: any[];

    /**
     * Continue filtering after transformation.
     * 
     * @param predicate - Function to test each transformed item
     * @returns New enumerable array with filtered items
     * 
     * @example Best - Post-transform filtering
     * ```typescript
     * const report = styleRanges
     *   .select(range => ({
     *     fontName: range.getObject('textStyle').getString('fontPostScriptName'),
     *     fontSize: range.getObject('textStyle').getUnitDouble('sizeKey'),
     *     isBold: range.getObject('textStyle').getBoolean('syntheticBold')
     *   }))
     *   .whereMatches(item => item.fontSize > 12)           // Filter transformed items
     *   .whereMatches(item => item.fontName.includes('Arial'))  // Chain more filters
     *   .select(item => ({                                   // Transform again
     *     ...item,
     *     displaySize: `${item.fontSize}pt`,
     *     weight: item.isBold ? 'Bold' : 'Regular'
     *   }))
     *   .toResultArray();                                    // Terminal operation
     * ```
     */
    whereMatches(predicate: (item: any) => boolean): IEnumerableArray;

    /**
     * Get first item from current results.
     * 
     * @returns First item, or null if none found
     * 
     * @example Straightforward - First transformed item
     * ```typescript
     * const firstFontName = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .getFirst();
     * 
     * if (firstFontName) {
     *   console.log('First font:', firstFontName);
     * }
     * ```
     */
    getFirst(): any;

    /**
     * Count current items.
     * 
     * @returns Number of items
     * 
     * @example Good - Counting after transformation
     * ```typescript
     * const uniqueFontCount = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .select(name => name.split('-')[0])  // Get font family without style
     *   .getCount();
     * 
     * console.log(`Found ${uniqueFontCount} font references`);
     * ```
     */
    getCount(): number;

    /**
     * Check if any items exist.
     * 
     * @returns true if items exist, false otherwise
     * 
     * @example Straightforward - Existence after transformation
     * ```typescript
     * const hasValidFonts = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .whereMatches(name => name !== SENTINELS.string && name.length > 0)
     *   .hasAnyMatches();
     * ```
     */
    hasAnyMatches(): boolean;

    /**
     * Materialize results into plain array (terminal operation).
     * 
     * @returns Plain JavaScript array with all transformed items
     * 
     * @example Best - Final data collection
     * ```typescript
     * const fontSummary = styleRanges
     *   .select(range => {
     *     const style = range.getObject('textStyle');
     *     return {
     *       name: style.getString('fontPostScriptName'),
     *       size: style.getUnitDouble('sizeKey'),
     *       bold: style.getBoolean('syntheticBold')
     *     };
     *   })
     *   .whereMatches(font => font.name !== SENTINELS.string)
     *   .whereMatches(font => font.size > 0)
     *   .toResultArray();
     * 
     * // Now you have a plain JavaScript array
     * fontSummary.forEach(font => {
     *   console.log(`${font.name}: ${font.size}pt ${font.bold ? '(Bold)' : ''}`);
     * });
     * ```
     */
    toResultArray(): any[];

    /**
     * Continue transforming items.
     * 
     * @param transformer - Function to transform each item
     * @returns New enumerable array with transformed items
     * 
     * @example Best - Chained transformations
     * ```typescript
     * const processedFonts = styleRanges
     *   .select(range => range.getObject('textStyle'))
     *   .select(style => ({
     *     postscript: style.getString('fontPostScriptName'),
     *     display: style.getString('fontName'),
     *     size: style.getUnitDouble('sizeKey')
     *   }))
     *   .select(font => ({
     *     ...font,
     *     family: font.postscript.split('-')[0],
     *     sizeCategory: font.size > 24 ? 'large' : font.size > 16 ? 'medium' : 'small'
     *   }))
     *   .toResultArray();
     * ```
     */
    select<T>(transformer: (item: any) => T): IEnumerableArray;

    /**
     * Add debug information.
     * 
     * @param label - Debug label
     * @returns Same enumerable array for continued chaining
     * 
     * @example Good - Debugging transformations
     * ```typescript
     * const results = styleRanges
     *   .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
     *   .debug('After selecting font names')
     *   .whereMatches(name => name !== SENTINELS.string)
     *   .debug('After filtering valid names')
     *   .select(name => name.toUpperCase())
     *   .debug('After converting to uppercase')
     *   .toResultArray();
     * ```
     */
    debug(label: string): IEnumerableArray;
}

/**
 * Properties extracted from text style information.
 * These match ActionManager property names (camelCase).
 * 
 * @example Best - Complete text style extraction
 * ```typescript
 * const extractTextStyle = (styleRange: IActionDescriptorNavigator): FontStyleProperties => {
 *   const style = styleRange.getObject('textStyle');
 *   
 *   return {
 *     fontName: style.getString('fontName'),                    // "Arial"
 *     fontPostScriptName: style.getString('fontPostScriptName'), // "ArialMT"
 *     fontSize: style.getUnitDouble('sizeKey'),                 // 12.0
 *     horizontalScale: style.getDouble('horizontalScale'),      // 100.0
 *     verticalScale: style.getDouble('verticalScale'),          // 100.0
 *     tracking: style.getInteger('tracking'),                   // 0
 *     autoKern: style.getEnumerationString('autoKern'),         // "metricsKern"
 *     fontCaps: style.getEnumerationString('fontCaps'),         // "normal"
 *     syntheticBold: style.getBoolean('syntheticBold'),         // false
 *     syntheticItalic: style.getBoolean('syntheticItalic'),     // false
 *     autoLeading: style.getBoolean('autoLeading')              // true
 *   };
 * };
 * ```
 */
export interface FontStyleProperties {
    readonly fontName: string;
    readonly fontPostScriptName: string;
    readonly fontSize: number;
    readonly horizontalScale: number;
    readonly verticalScale: number;
    readonly tracking: number;
    readonly autoKern: string;
    readonly fontCaps: string;
    readonly syntheticBold: boolean;
    readonly syntheticItalic: boolean;
    readonly autoLeading: boolean;
}

/**
 * RGB color values extracted from ActionManager.
 * Values are typically in the range 0-255.
 * 
 * @example Best - Color extraction and conversion
 * ```typescript
 * const extractColor = (colorObj: IActionDescriptorNavigator): ColorProperties => {
 *   return {
 *     red: colorObj.getDouble('red'),     // 255
 *     green: colorObj.getDouble('green'), // 128
 *     blue: colorObj.getDouble('blue')    // 0
 *   };
 * };
 * 
 * const toHex = (color: ColorProperties): string => {
 *   const r = Math.round(color.red).toString(16).padStart(2, '0');
 *   const g = Math.round(color.green).toString(16).padStart(2, '0');
 *   const b = Math.round(color.blue).toString(16).padStart(2, '0');
 *   return `#${r}${g}${b}`;
 * };
 * ```
 */
export interface ColorProperties {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}

/**
 * Text warp transformation properties.
 * 
 * @example Good - Warp analysis
 * ```typescript
 * const extractWarp = (textObj: IActionDescriptorNavigator): WarpProperties => {
 *   const warp = textObj.getObject('warp');
 *   
 *   return {
 *     warpStyle: warp.getEnumerationString('warpStyle'),        // "warpArc", "warpNone"
 *     warpValue: warp.getDouble('warpValue'),                   // 20.0
 *     warpPerspective: warp.getDouble('warpPerspective'),       // 0.0
 *     warpRotate: warp.getEnumerationString('warpRotate')       // "horizontal"
 *   };
 * };
 * ```
 */
export interface WarpProperties {
    readonly warpStyle: string;
    readonly warpValue: number;
    readonly warpPerspective: number;
    readonly warpRotate: string;
}

/**
 * Basic layer properties commonly needed for analysis.
 * 
 * @example Best - Complete layer analysis
 * ```typescript
 * const analyzeLayer = (layer: IActionDescriptorNavigator): LayerProperties => {
 *   return {
 *     name: layer.getString('name'),                    // "My Layer"
 *     opacity: layer.getInteger('opacity'),             // 255
 *     visible: layer.getBoolean('visible'),             // true
 *     mode: layer.getEnumerationString('mode'),         // "normal"
 *     layerID: layer.getInteger('layerID'),             // 142
 *     itemIndex: layer.getInteger('itemIndex'),         // 33
 *     bounds: layer.getBounds(),                        // BoundsObject
 *     hasTextKey: layer.hasKey('textKey'),              // true/false
 *     isBackground: layer.getBoolean('background'),     // false
 *     isLocked: layer.getBoolean('protectAll')          // false
 *   };
 * };
 * ```
 */
export interface LayerProperties {
    readonly name: string;
    readonly opacity: number;
    readonly visible: boolean;
    readonly mode: string;
    readonly layerID: number;
    readonly itemIndex: number;
    readonly bounds: BoundsObject;
    readonly hasTextKey: boolean;
    readonly isBackground: boolean;
    readonly isLocked: boolean;
}

/**
 * Simplified font data for scoring/analysis.
 */
export type FontDataProjection = {
    name: string;
    size: number;
    bold: boolean;
    caps: string;
};

/**
 * Simplified color data for scoring/analysis.
 */
export type ColorDataProjection = {
    red: number;
    green: number;
    blue: number;
};

/**
 * Combined text style data for scoring/analysis.
 */
export type TextStyleProjection = {
    fontName: string;
    fontSize: number;
    fontCaps: string;
    syntheticBold: boolean;
    color: ColorDataProjection;
};

/**
 * Type guard to validate ActionManager value types.
 * 
 * @param type - Value to test
 * @returns true if valid ValueType
 * 
 * @example Straightforward - Type validation
 * ```typescript
 * function validateType(type: unknown): asserts type is ValueType {
 *   if (!isValidValueType(type)) {
 *     throw new Error(`Invalid value type: ${type}`);
 *   }
 * }
 * ```
 */
export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
        ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

/**
 * Check if a value represents a sentinel (failed operation).
 * 
 * @param value - Value to test
 * @param type - Expected value type
 * @returns true if value is the sentinel for this type
 * 
 * @example Good - Sentinel detection
 * ```typescript
 * const fontSize = textStyle.getUnitDouble('sizeKey');
 * if (isSentinelValue(fontSize, 'double')) {
 *   console.log('Could not get font size');
 * } else {
 *   console.log(`Font size: ${fontSize}pt`);
 * }
 * ```
 */
export function isSentinelValue(value: any, type: ValueType): boolean {
    switch (type) {
        case 'string':
        case 'enumerated':
            return value === '';
        case 'integer':
        case 'double':
            return value === -1;
        case 'boolean':
            return value === false;
        default:
            return false;
    }
}

/**
 * Type guard for ActionDescriptorNavigator interface.
 * 
 * @param obj - Object to test
 * @returns true if object implements IActionDescriptorNavigator
 * 
 * @example Straightforward - Interface validation
 * ```typescript
 * function processDescriptor(obj: unknown) {
 *   if (isActionDescriptorNavigator(obj)) {
 *     // TypeScript now knows obj is IActionDescriptorNavigator
 *     const name = obj.getString('name');
 *   }
 * }
 * ```
 */
export function isActionDescriptorNavigator(obj: any): obj is IActionDescriptorNavigator {
    return obj && typeof obj.getObject === 'function' && typeof obj.getString === 'function';
}

/**
 * Type guard for ActionListNavigator interface.
 * 
 * @param obj - Object to test
 * @returns true if object implements IActionListNavigator
 * 
 * @example Straightforward - List validation
 * ```typescript
 * function processList(obj: unknown) {
 *   if (isActionListNavigator(obj)) {
 *     // TypeScript now knows obj is IActionListNavigator
 *     const count = obj.getCount();
 *   }
 * }
 * ```
 */
export function isActionListNavigator(obj: any): obj is IActionListNavigator {
    return obj && typeof obj.getCount === 'function' && typeof obj.asEnumerable === 'function';
}