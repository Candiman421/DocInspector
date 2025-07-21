/**
 * Complete Type System for ActionDescriptor Navigation Framework
 * Production-ready type definitions for ExtendScript integration
 * 
 * CRITICAL: These types support your straightforward approach by providing
 * type safety and IntelliSense while maintaining ExtendScript compatibility.
 * 
 * Dependencies: None (foundation types)
 * Used by: All framework components
 */

// =============================================================================
// CORE VALUE TYPES
// =============================================================================

/**
 * Supported value types in ActionDescriptor system
 * These map directly to ActionDescriptor getter methods
 * 
 * YOUR APPROACH INSIGHT: Framework automatically returns appropriate sentinels
 * for each type - no manual initialization needed in your code.
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Type-safe sentinel values for missing data
 * Framework guarantees these exact values for failed extractions
 * 
 * YOUR APPROACH BENEFIT: Your direct assignment pattern works because
 * the framework always returns these predictable sentinel values.
 */
export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

/**
 * Sentinel value map for runtime lookup
 * Used internally by framework for consistent sentinel handling
 */
export type SentinelValueMap = {
    readonly "string": "";
    readonly "enumerated": "";
    readonly "integer": -1;
    readonly "double": -1;
    readonly "boolean": false;
};

// =============================================================================
// TRANSFORMATION AND COMPARISON TYPES
// =============================================================================

/**
 * Function type for transforming extracted values
 * Used by PathAccessor transformations and ListExtractors
 * 
 * @example
 * ```typescript
 * const roundTransformer: ValueTransformer = (value: number) => Math.round(value);
 * const upperTransformer: ValueTransformer = (value: string) => value.toUpperCase();
 * ```
 */
export interface ValueTransformer {
    (value: any): any;
}

/**
 * Options for value extraction with fallbacks and transformations
 * Supports your straightforward approach with optional enhancements
 * 
 * @example
 * ```typescript
 * const options: ComparisonOptions = {
 *     transformer: (size: number) => Math.round(size),
 *     defaultValue: 12,
 *     tolerance: 5
 * };
 * 
 * const fontSize = textStyle.getValue('sizeKey', 'double', options);
 * ```
 */
export interface ComparisonOptions {
    readonly tolerance?: number;      // For numeric comparisons
    readonly transformer?: ValueTransformer; // Value transformation function
    readonly defaultValue?: any;     // Override sentinel value
}

// =============================================================================
// NAVIGATION AND PATH TYPES
// =============================================================================

/**
 * Bounds property identifiers for layout analysis
 * Used by getBounds() and P.bounds() methods
 * 
 * YOUR APPROACH USAGE: Clean property access for layout validation
 */
export type BoundsProperty = 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height';

/**
 * Complete bounds object structure with calculated dimensions
 * Framework automatically calculates width/height from left/top/right/bottom
 * 
 * YOUR APPROACH BENEFIT: Direct assignment works with calculated properties
 */
export interface BoundsObject {
    readonly left: number;      // Left edge position or -1 if missing
    readonly top: number;       // Top edge position or -1 if missing  
    readonly right: number;     // Right edge position or -1 if missing
    readonly bottom: number;    // Bottom edge position or -1 if missing
    readonly width: number;     // Calculated: right - left, or -1 if missing
    readonly height: number;    // Calculated: bottom - top, or -1 if missing
}

/**
 * Path segment types for fluent navigation building
 * Used internally by PathAccessor for navigation chains
 */
export interface PathSegment {
    readonly key: string;                    // Property name
    readonly type: 'object' | 'list' | 'value'; // Navigation type
    readonly valueType?: ValueType;         // For value segments
    readonly index?: number;                // For list index access
}

// =============================================================================
// TEXT AND TYPOGRAPHY TYPES
// =============================================================================

/**
 * Complete text properties with font information
 * Used by getTextProperties() method for comprehensive text analysis
 * 
 * YOUR APPROACH BENEFIT: Single method call returns complete text analysis
 */
export interface TextProperties {
    readonly content: string;     // Text content or "" if missing
    readonly fontName: string;    // Font name or "" if missing  
    readonly fontSize: number;    // Font size in points or -1 if missing
}

/**
 * Comprehensive font style properties from XML dump analysis
 * Covers all typography properties extractable from textStyle objects
 */
export interface FontStyleProperties {
    readonly fontName: string;           // "Arial-BoldMT", "MyriadPro-Regular", etc.
    readonly sizeKey: number;            // Font size in points
    readonly impliedFontSize: number;    // Computed font size
    readonly horizontalScale: number;    // Horizontal scaling percentage
    readonly verticalScale: number;      // Vertical scaling percentage
    readonly tracking: number;           // Letter spacing
    readonly leading: number;            // Line spacing (points)
    readonly autoLeading: number;        // Auto-calculated leading
    readonly baselineShift: number;      // Baseline shift in points
    readonly fontCaps: string;           // "smallCaps", "allCaps", "normal"
    readonly autoKern: string;           // "metricsKern", "opticalKern", "manual"
    readonly baseline: string;           // "normal", "superScript", "subScript"
    readonly underline: string;          // "underlineOff", "underlineRight", etc.
    readonly textLanguage: string;       // "englishLanguage", "spanishLanguage", etc.
    readonly syntheticBold: boolean;     // Artificial bold applied
    readonly syntheticItalic: boolean;   // Artificial italic applied
}

/**
 * Color properties with RGB values
 * Standard RGB color representation with sentinel handling
 */
export interface ColorProperties {
    readonly red: number;     // Red component 0-255 or -1 if missing
    readonly green: number;   // Green component 0-255 or -1 if missing  
    readonly blue: number;    // Blue component 0-255 or -1 if missing
}

// =============================================================================
// WARP AND EFFECTS TYPES
// =============================================================================

/**
 * Text warp effect properties from XML dump analysis
 * Comprehensive warp settings for text distortion effects
 * 
 * YOUR APPROACH USAGE: Direct extraction from cached warp objects
 */
export interface WarpProperties {
    readonly warpStyle: string;        // "warpArc", "warpFlag", "warpFish", etc.
    readonly warpValue: number;        // Warp intensity percentage  
    readonly warpPerspective: number;  // Perspective distortion amount
    readonly warpRotate: string;       // "horizontal", "vertical"  
    readonly warpHorizontalDistort: number; // Horizontal distortion
    readonly warpVerticalDistort: number;   // Vertical distortion
}

/**
 * Layer effects properties for comprehensive effect analysis
 * Covers common layer effects like shadows, glows, overlays
 */
export interface LayerEffectProperties {
    readonly dropShadowDistance: number;    // Drop shadow distance in pixels
    readonly dropShadowAngle: number;       // Drop shadow angle in degrees
    readonly dropShadowOpacity: number;     // Drop shadow opacity percentage
    readonly outerGlowSize: number;         // Outer glow blur size in pixels  
    readonly outerGlowOpacity: number;      // Outer glow opacity percentage
    readonly colorOverlayOpacity: number;   // Color overlay opacity percentage
    readonly gradientOverlayOpacity: number; // Gradient overlay opacity percentage
}

// =============================================================================
// EXTRACTION SPECIFICATION TYPES
// =============================================================================

/**
 * Single property extraction specification
 * Used by batch extraction methods for type safety
 * 
 * YOUR APPROACH BENEFIT: Type-safe batch property extraction
 */
export interface ExtractSpec {
    readonly key: string;                  // Property name
    readonly type: ValueType;             // Expected value type
    readonly options?: ComparisonOptions; // Optional transformation/defaults
}

/**
 * Object-based extraction specification mapping
 * Used by getValuesAsObject() for structured extraction
 * 
 * @example
 * ```typescript
 * const specs: ObjectExtractSpec<LayerAnalysis> = {
 *     name: { key: 'name', type: 'string' },
 *     opacity: { key: 'opacity', type: 'double' },
 *     visible: { key: 'visible', type: 'boolean' }
 * };
 * 
 * const result = layerNav.getValuesAsObject(specs);
 * // result is typed as LayerAnalysis with name, opacity, visible properties
 * ```
 */
export type ObjectExtractSpec<T extends Record<string, any>> = {
    readonly [K in keyof T]: ExtractSpec;
};

// =============================================================================
// DOCUMENT AND LAYER ANALYSIS TYPES
// =============================================================================

/**
 * Complete document properties for comprehensive analysis
 * Used by document-level assessment and scoring systems
 */
export interface DocumentProperties {
    readonly width: number;          // Document width in pixels or -1
    readonly height: number;         // Document height in pixels or -1  
    readonly resolution: number;     // DPI/PPI or -1 if missing
    readonly mode: string;           // "rgbColor", "cmykColor", "grayscale", etc.
    readonly colorDepth: number;     // Bits per channel or -1
    readonly layerCount: number;     // Total number of layers or -1
    readonly hasBackground: boolean; // Background layer exists
}

/**
 * Complete layer properties for comprehensive analysis
 * Covers all major layer attributes for scoring systems
 */
export interface LayerProperties {
    readonly name: string;           // Layer name or ""
    readonly opacity: number;        // Opacity percentage or -1
    readonly visible: boolean;       // Visibility state
    readonly mode: string;           // Blend mode or ""
    readonly layerID: number;        // Unique layer ID or -1
    readonly itemIndex: number;      // Layer index or -1
    readonly bounds: BoundsObject;   // Layer bounds or sentinel bounds
    readonly hasTextKey: boolean;    // Contains text content
    readonly hasEffects: boolean;    // Has layer effects applied
    readonly isBackground: boolean;  // Is background layer
    readonly isLocked: boolean;      // Layer is locked
}

// =============================================================================
// ASSESSMENT AND SCORING TYPES
// =============================================================================

/**
 * Comprehensive layer assessment results
 * Used by professional scoring systems for design evaluation
 * 
 * YOUR APPROACH BENEFIT: Direct assignment pattern works perfectly
 * because framework handles all sentinel values automatically
 */
export interface LayerAssessmentResults {
    // Basic properties - extracted directly
    readonly layerName: string;              // Direct from getValue()
    readonly opacity: number;                // Direct from getValue() 
    readonly visible: boolean;               // Direct from getValue()
    readonly bounds: BoundsObject;           // Direct from getBounds()

    // Typography - extracted from cached objects (your approach)
    readonly fontName: string;               // From cached textStyle
    readonly fontSize: number;               // From cached textStyle
    readonly fontCaps: string;               // From cached textStyle
    readonly tracking: number;               // From cached textStyle
    readonly color: ColorProperties;         // From cached color object

    // Effects - extracted from cached objects (your approach) 
    readonly warpStyle: string;              // From cached warp object
    readonly warpValue: number;              // From cached warp object
    readonly dropShadowDistance: number;     // From effects analysis
    readonly outerGlowSize: number;          // From effects analysis

    // Validation flags - computed from extracted properties
    readonly hasValidText: boolean;          // fontName !== ""
    readonly hasValidSize: boolean;          // fontSize > 0
    readonly hasValidColor: boolean;         // color.red >= 0
    readonly hasValidEffects: boolean;       // warpStyle !== ""
    readonly meetsRequirements: boolean;     // Overall assessment

    // Scoring - calculated from validation flags
    readonly pointsEarned: number;           // Points earned
    readonly pointsPossible: number;         // Maximum points
    readonly percentageScore: number;        // Final percentage
    readonly letterGrade: string;            // A-F grade
}

/**
 * Document-level assessment for complete design evaluation
 * Used by comprehensive scoring systems
 */
export interface DocumentAssessmentResults {
    readonly documentProperties: DocumentProperties;
    readonly layerAssessments: readonly LayerAssessmentResults[];
    readonly overallScore: number;
    readonly passesRequirements: boolean;
    readonly recommendations: readonly string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Utility type for extracting property names from objects
 * Useful for dynamic property access patterns
 */
export type PropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Utility type for making all properties optional
 * Useful for partial updates and progressive extraction
 */
export type PartialExtract<T> = {
    [K in keyof T]?: T[K];
};

/**
 * Utility type for sentinel-aware property types
 * Represents a property that might be extracted with a sentinel value
 */
export type SentinelAware<T> = T | SentinelValue<ValueType>;

// =============================================================================
// FRAMEWORK CONFIGURATION TYPES
// =============================================================================

/**
 * Framework configuration options
 * For advanced framework customization (typically not needed)
 */
export interface FrameworkConfig {
    readonly enableCaching: boolean;         // Enable object caching (default: true)
    readonly enableSentinels: boolean;      // Enable sentinel values (default: true)  
    readonly enableTransformations: boolean; // Enable value transformations (default: true)
    readonly enableMemoryCleanup: boolean;  // Enable ActionReference cleanup (default: true)
    readonly debugMode: boolean;            // Enable debug logging (default: false)
}

/**
 * Performance metrics for framework monitoring
 * Used for optimization analysis in production systems
 */
export interface PerformanceMetrics {
    readonly actionManagerCalls: number;    // Total ActionManager calls made
    readonly objectCacheHits: number;       // Cache hits (performance indicator) 
    readonly sentinelReturns: number;       // Sentinel values returned
    readonly executionTime: number;         // Total execution time in ms
    readonly memoryCleanups: number;        // ActionReference cleanups performed
}

// =============================================================================
// TYPE GUARDS AND VALIDATION
// =============================================================================

/**
 * Type guard for checking if a value is a valid ValueType
 * Useful for runtime type validation
 */
export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
        ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

/**
 * Type guard for checking if a value is a sentinel value
 * Useful for validation logic in your assessment code
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
 * Type guard for checking if bounds are valid (not sentinel)
 * Useful for layout validation in your scoring code
 * 
 * @example
 * ```typescript
 * const bounds = layerNav.getBounds();
 * if (hasValidBounds(bounds)) {
 *     // bounds.width and bounds.height are > 0
 *     const area = bounds.width * bounds.height;
 * }
 * ```
 */
export function hasValidBounds(bounds: BoundsObject): boolean {
    return bounds.left !== -1 && bounds.top !== -1 &&
        bounds.width > 0 && bounds.height > 0;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Standard sentinel values as constants
 * Use these for explicit sentinel comparisons in your code
 */
export const SENTINELS = {
    STRING: "" as const,
    NUMBER: -1 as const,
    BOOLEAN: false as const,
    EMPTY_ARRAY: [] as const
} as const;

/**
 * Common XML dump property name mappings
 * Reference for correct camelCase property names
 */
export const XML_PROPERTY_MAPPINGS = {
    // Text properties
    'Text': 'textKey',
    'FontName': 'fontName',
    'SizeKey': 'sizeKey',
    'HorizontalScale': 'horizontalScale',
    'VerticalScale': 'verticalScale',
    'FontCaps': 'fontCaps',
    'AutoKern': 'autoKern',
    'BaselineShift': 'baselineShift',
    'ImpliedFontSize': 'impliedFontSize',
    'AutoLeading': 'autoLeading',

    // Warp properties  
    'WarpStyle': 'warpStyle',
    'WarpValue': 'warpValue',
    'WarpPerspective': 'warpPerspective',
    'WarpRotate': 'warpRotate',

    // Document properties
    'Width': 'width',
    'Height': 'height',
    'Resolution': 'resolution',
    'Mode': 'mode'
} as const;

// =============================================================================
// FRAMEWORK USAGE DOCUMENTATION
// =============================================================================

/*
TYPE SYSTEM USAGE GUIDE:

✅ YOUR STRAIGHTFORWARD APPROACH - Type-Safe Direct Assignment:

```typescript
// Framework provides complete type safety for your direct assignment pattern
function analyzeLayer(layerName: string): LayerAssessmentResults {
    const targetLayer = ActionDescriptorNavigator.forLayerByName(layerName);
    
    // Cache objects (your approach)
    const textObj = targetLayer.object('textKey');
    const styleList = textObj.list('textStyleRange');
    const arialStyle = styleList.findObjectBy('fontName', 'Arial').object('textStyle');
    
    // Direct assignment with full type safety - no manual sentinels needed
    return {
        layerName: targetLayer.getStringValue('name'),           // Type: string (or "")
        opacity: targetLayer.getDoubleValue('opacity'),          // Type: number (or -1)
        visible: targetLayer.getBooleanValue('visible'),         // Type: boolean (or false)
        bounds: targetLayer.getBounds(),                         // Type: BoundsObject
        fontName: arialStyle.getStringValue('fontName'),         // Type: string (or "")
        fontSize: arialStyle.getUnitDoubleValue('sizeKey'),      // Type: number (or -1)
        warpStyle: textObj.object('warp').getEnumeratedString('warpStyle'), // Type: string
        
        // Computed validation using automatic sentinels
        hasValidText: arialStyle.getStringValue('fontName') !== SENTINELS.STRING,
        hasValidSize: arialStyle.getUnitDoubleValue('sizeKey') > 0,
        meetsRequirements: targetLayer.getStringValue('name') !== SENTINELS.STRING
        // ... framework guarantees type safety throughout
    };
}
```

✅ BATCH EXTRACTION - Type-Safe Specifications:

```typescript
// Use ObjectExtractSpec for type-safe batch extraction  
const layerSpecs: ObjectExtractSpec<LayerProperties> = {
    name: { key: 'name', type: 'string' },
    opacity: { key: 'opacity', type: 'double' },
    visible: { key: 'visible', type: 'boolean' },
    mode: { key: 'mode', type: 'enumerated' }
};

const layerProps = layerNav.getValuesAsObject(layerSpecs);
// layerProps is fully typed as LayerProperties
```

✅ VALIDATION - Type Guards for Assessment:

```typescript
const bounds = layerNav.getBounds();
if (hasValidBounds(bounds)) {
    // TypeScript knows bounds.width and bounds.height are valid numbers
    const area = bounds.width * bounds.height;
}

const fontSize = textStyle.getUnitDoubleValue('sizeKey');
if (!isSentinelValue(fontSize, 'double')) {
    // TypeScript knows fontSize is a valid number, not -1
    const scaledSize = fontSize * 1.2;
}
```

DESIGN PRINCIPLE: Types support your straightforward approach by providing
safety and IntelliSense while never interfering with the direct assignment pattern.
The framework handles all complexity internally, leaving you with clean, typed code.
*/