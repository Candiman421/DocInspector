/**
 * Core Type System for ActionDescriptor Navigation Framework
 * Trimmed version focused on essential types for direct navigation
 * 
 * Dependencies: None (foundation types)
 * Used by: ActionDescriptorNavigator
 */

// =============================================================================
// CORE VALUE TYPES
// =============================================================================

/**
 * Supported value types in ActionDescriptor system
 * These map directly to ActionDescriptor getter methods
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Type-safe sentinel values for missing data
 * Framework guarantees these exact values for failed extractions
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
 * Used by getValue() with options parameter
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
 * Used by getValue() method for optional enhancements
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
// BOUNDS AND LAYOUT TYPES
// =============================================================================

/**
 * Bounds property identifiers for layout analysis
 * Used by getBounds() method
 */
export type BoundsProperty = 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height';

/**
 * Complete bounds object structure with calculated dimensions
 * Framework automatically calculates width/height from left/top/right/bottom
 * 
 * @example
 * ```typescript
 * const bounds = layerNav.getBounds();
 * if (bounds.left !== -1 && bounds.width > 0) {
 *   console.log(`Layer size: ${bounds.width}x${bounds.height}`);
 * }
 * ```
 */
export interface BoundsObject {
    readonly left: number;      // Left edge position or -1 if missing
    readonly top: number;       // Top edge position or -1 if missing  
    readonly right: number;     // Right edge position or -1 if missing
    readonly bottom: number;    // Bottom edge position or -1 if missing
    readonly width: number;     // Calculated: right - left, or -1 if missing
    readonly height: number;    // Calculated: bottom - top, or -1 if missing
}

// =============================================================================
// TEXT AND TYPOGRAPHY TYPES
// =============================================================================

/**
 * Font style properties for comprehensive text analysis
 * Covers key typography properties extractable from textStyle objects
 */
export interface FontStyleProperties {
    readonly fontName: string;           // "Arial", "Trebuchet MS", etc.
    readonly fontPostScriptName: string; // "ArialMT", "TrebuchetMS", etc.
    readonly sizeKey: number;            // Font size in points
    readonly impliedFontSize: number;    // Computed font size
    readonly horizontalScale: number;    // Horizontal scaling percentage
    readonly verticalScale: number;      // Vertical scaling percentage
    readonly tracking: number;           // Letter spacing
    readonly autoKern: string;           // "metricsKern", "opticalKern", "manual"
    readonly fontCaps: string;           // "smallCaps", "Normal", etc.
    readonly syntheticBold: boolean;     // Artificial bold applied
    readonly syntheticItalic: boolean;   // Artificial italic applied
    readonly autoLeading: boolean;       // Auto-calculated leading enabled
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
 * Text warp effect properties
 * Comprehensive warp settings for text distortion effects
 * 
 * @example
 * ```typescript
 * const warpObj = textNav.object('warp');
 * const warpStyle = warpObj.getEnumeratedString('warpStyle');
 * const warpValue = warpObj.getDoubleValue('warpValue');
 * ```
 */
export interface WarpProperties {
    readonly warpStyle: string;        // "warpArc", "warpFlag", "warpNone", etc.
    readonly warpValue: number;        // Warp intensity percentage  
    readonly warpPerspective: number;  // Perspective distortion amount
    readonly warpRotate: string;       // "horizontal", "vertical"  
}

/**
 * Layer effects properties for effect analysis
 * Common layer effects like shadows, glows, overlays
 */
export interface LayerEffectProperties {
    readonly dropShadowDistance: number;    // Drop shadow distance in pixels
    readonly dropShadowAngle: number;       // Drop shadow angle in degrees
    readonly dropShadowOpacity: number;     // Drop shadow opacity percentage
    readonly outerGlowSize: number;         // Outer glow blur size in pixels  
    readonly outerGlowOpacity: number;      // Outer glow opacity percentage
    readonly colorOverlayOpacity: number;   // Color overlay opacity percentage
}

// =============================================================================
// DOCUMENT AND LAYER ANALYSIS TYPES
// =============================================================================

/**
 * Complete document properties for analysis
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
 * Complete layer properties for analysis
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
 * Used by scoring systems for design evaluation
 * 
 * @example
 * ```typescript
 * function analyzeLayer(layerName: string): LayerAssessmentResults {
 *   const targetLayer = ActionDescriptorNavigator.forLayerByName(layerName);
 *   
 *   // Direct property extraction
 *   const name = targetLayer.getStringValue('name');
 *   const opacity = targetLayer.getDoubleValue('opacity');
 *   const visible = targetLayer.getBooleanValue('visible');
 *   
 *   // Text style extraction
 *   const styleList = targetLayer.object('textKey').list('textStyleRange');
 *   const arialStyle = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial');
 *   const fontSize = arialStyle.object('textStyle').getUnitDoubleValue('sizeKey');
 *   
 *   return {
 *     layerName: name,
 *     opacity: opacity,
 *     visible: visible,
 *     fontSize: fontSize,
 *     // ... validation and scoring logic
 *   };
 * }
 * ```
 */
export interface LayerAssessmentResults {
    // Basic properties
    readonly layerName: string;
    readonly opacity: number;
    readonly visible: boolean;
    readonly bounds: BoundsObject;

    // Typography properties
    readonly fontName: string;
    readonly fontSize: number;
    readonly fontCaps: string;
    readonly tracking: number;
    readonly color: ColorProperties;

    // Effects properties
    readonly warpStyle: string;
    readonly warpValue: number;

    // Validation flags
    readonly hasValidText: boolean;
    readonly hasValidSize: boolean;
    readonly hasValidColor: boolean;
    readonly hasValidEffects: boolean;
    readonly meetsRequirements: boolean;

    // Scoring results
    readonly pointsEarned: number;
    readonly pointsPossible: number;
    readonly percentageScore: number;
    readonly letterGrade: string;
}

/**
 * Document-level assessment for complete design evaluation
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
 */
export type PropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Utility type for making all properties optional
 */
export type PartialExtract<T> = {
    [K in keyof T]?: T[K];
};

/**
 * Utility type for sentinel-aware property types
 */
export type SentinelAware<T> = T | SentinelValue<ValueType>;

// =============================================================================
// TYPE GUARDS AND VALIDATION
// =============================================================================

/**
 * Type guard for checking if a value is a valid ValueType
 */
export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
        ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

/**
 * Type guard for checking if a value is a sentinel value
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
 * 
 * @example
 * ```typescript
 * const bounds = layerNav.getBounds();
 * if (hasValidBounds(bounds)) {
 *   const area = bounds.width * bounds.height;
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