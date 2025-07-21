/**
 * Photoshop ActionManager API Bindings
 * Production-ready ExtendScript integration layer
 * 
 * CRITICAL: This module provides the foundation layer that everything depends on.
 * All ActionDescriptor navigation ultimately calls these Photoshop ActionManager functions.
 * 
 * Dependencies: None (this is the foundation)
 * Used by: ActionDescriptorNavigator.ts, PathAccessor.ts, ListExtractors.ts
 * 
 * ARCHITECTURE INSIGHT: This is where your straightforward approach gets its power -
 * by minimizing calls to these ActionManager functions through object caching.
 */

// =============================================================================
// CORE ACTIONMANAGER FUNCTIONS
// =============================================================================

/**
 * Execute an action with ActionDescriptor parameters
 * Foundation for all ActionManager operations
 * 
 * @param eventID - Action event ID (from stringIDToTypeID or charIDToTypeID)
 * @param descriptor - ActionDescriptor with parameters
 * @param dialogOptions - Dialog display options
 * @returns Result ActionDescriptor
 */
export declare function executeAction(
    eventID: number,
    descriptor?: ActionDescriptor,
    dialogOptions?: ActionDescriptorDialogOptions
): ActionDescriptor;

/**
 * Get properties from ActionReference
 * MOST CRITICAL FUNCTION - Used by all factory methods
 * 
 * YOUR APPROACH INSIGHT: By caching the results of this function call,
 * your object caching pattern avoids repeated expensive ActionManager calls.
 * 
 * @param reference - ActionReference targeting the object
 * @returns ActionDescriptor with object properties
 * 
 * @example
 * ```typescript
 * // This is expensive - your approach minimizes these calls
 * const ref = new ActionReference();
 * ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
 * const desc = executeActionGet(ref); // Gets current layer properties
 * 
 * // Your approach: Cache this result, then navigate efficiently
 * const textObj = navigator.object('textKey');     // Uses cached desc
 * const warpObj = textObj.object('warp');          // Uses cached navigation
 * ```
 */
export declare function executeActionGet(reference: ActionReference): ActionDescriptor;

/**
 * Convert string ID to numeric type ID
 * HEAVILY USED - Every property access uses this (automatically by framework)
 * 
 * YOUR APPROACH INSIGHT: Framework handles these conversions automatically,
 * so your code uses clean property names like 'fontName', 'sizeKey', 'warpStyle'.
 * 
 * @param stringID - Property name in camelCase (e.g., 'textKey', 'fontName')
 * @returns Numeric type ID for ActionManager
 * 
 * @example
 * ```typescript
 * // XML Dump shows: <FontName> <SizeKey> <WarpStyle>
 * // Framework converts automatically to proper camelCase:
 * const textKeyID = stringIDToTypeID('textKey');        // NOT 'Text' from XML
 * const fontNameID = stringIDToTypeID('fontName');      // NOT 'FontName' from XML
 * const warpStyleID = stringIDToTypeID('warpStyle');    // NOT 'WarpStyle' from XML
 * 
 * // Your approach: You never call this directly - framework handles it
 * const fontName = arialStyle.getStringValue('fontName'); // Clean property name
 * ```
 */
export declare function stringIDToTypeID(stringID: string): number;

/**
 * Convert 4-character ID to numeric type ID
 * Used for legacy ActionManager compatibility and class identification
 * 
 * @param charID - 4-character string ID
 * @returns Numeric type ID
 * 
 * @example
 * ```typescript
 * const layerID = charIDToTypeID("Lyr ");  // Layer class
 * const orderID = charIDToTypeID("Ordn");  // Ordinal enum
 * const targetID = charIDToTypeID("Trgt"); // Target value
 * 
 * // Used internally by factory methods for layer/document access
 * ```
 */
export declare function charIDToTypeID(charID: string): number;

/**
 * Convert numeric type ID back to string ID
 * Used for enumerated value string extraction
 * 
 * FRAMEWORK INSIGHT: This enables getEnumeratedString() to return human-readable values
 * like "warpArc", "smallCaps", "metricsKern" instead of numeric IDs.
 * 
 * @param typeID - Numeric type ID
 * @returns String representation
 * 
 * @example
 * ```typescript
 * // Your approach enables clean enumerated value extraction:
 * const warpStyle = warpObj.getEnumeratedString('warpStyle'); // "warpArc"
 * const fontCaps = textStyle.getEnumeratedString('fontCaps'); // "smallCaps"
 * 
 * // Framework handles the conversion internally:
 * const enumValue = desc.getEnumerationValue(stringIDToTypeID('warpStyle'));
 * const enumString = typeIDToStringID(enumValue); // "warpArc"
 * ```
 */
export declare function typeIDToStringID(typeID: number): string;

// =============================================================================
// ACTIONMANAGER TYPE DECLARATIONS
// =============================================================================

/**
 * ActionDescriptor - Primary data container
 * Contains all layer/document properties as key-value pairs
 * 
 * CRITICAL: This is what the entire framework navigates through
 */
export declare class ActionDescriptor {
    readonly count: number;

    // Property existence checking
    hasKey(key: number): boolean;

    // Value extraction by type
    getString(key: number): string;
    getDouble(key: number): number;
    getInteger(key: number): number;
    getBoolean(key: number): boolean;
    getEnumerationValue(key: number): number;

    // Navigation to nested structures
    getObjectValue(key: number): ActionDescriptor;
    getList(key: number): ActionList;

    // Value setting (for action creation)
    putString(key: number, value: string): void;
    putDouble(key: number, value: number): void;
    putInteger(key: number, value: number): void;
    putBoolean(key: number, value: boolean): void;
    putEnumerated(key: number, enumType: number, value: number): void;
    putObject(key: number, classID: number, value: ActionDescriptor): void;
    putList(key: number, value: ActionList): void;
}

/**
 * ActionList - Container for arrays of ActionDescriptors
 * Used for text style ranges, layer effects, etc.
 * 
 * CRITICAL: Framework's list navigation depends on this
 */
export declare class ActionList {
    readonly count: number;

    // Item access
    getObjectValue(index: number): ActionDescriptor;
    getString(index: number): string;
    getDouble(index: number): number;
    getInteger(index: number): number;
    getBoolean(index: number): boolean;

    // Item adding (for action creation)
    putObject(classID: number, value: ActionDescriptor): void;
    putString(value: string): void;
    putDouble(value: number): void;
    putInteger(value: number): void;
    putBoolean(value: boolean): void;
}

/**
 * ActionReference - Used to target specific objects
 * CRITICAL: All factory methods create and manage these
 * 
 * Memory Management: Framework handles cleanup automatically
 */
export declare class ActionReference {
    // Target by enumeration (most common - current layer, document)
    putEnumerated(desiredClass: number, enumType: number, value: number): void;

    // Target by index (specific layer by number)
    putIndex(desiredClass: number, value: number): void;

    // Target by name (layer by name)
    putName(desiredClass: number, value: string): void;

    // Target by identifier (layer by ID)
    putIdentifier(desiredClass: number, value: number): void;

    // Target property of object
    putProperty(desiredClass: number, property: number): void;
}

/**
 * Dialog options for executeAction
 */
export declare enum ActionDescriptorDialogOptions {
    dontDisplay = 0,
    display = 1,
    displayForRecord = 2
}

// =============================================================================
// COMMON TYPE IDS FOR PERFORMANCE
// =============================================================================

/**
 * Pre-computed type IDs for performance-critical operations
 * Avoids repeated stringIDToTypeID() calls
 */
export const CommonTypeIDs = {
    // Document/Layer classes
    document: charIDToTypeID('Dcmn'),
    layer: charIDToTypeID('Lyr '),

    // Common enums
    ordinal: charIDToTypeID('Ordn'),
    target: charIDToTypeID('Trgt'),

    // Frequently used properties (computed at runtime)
    get textKey() { return stringIDToTypeID('textKey'); },
    get fontName() { return stringIDToTypeID('fontName'); },
    get sizeKey() { return stringIDToTypeID('sizeKey'); },
    get warpStyle() { return stringIDToTypeID('warpStyle'); },
    get textStyleRange() { return stringIDToTypeID('textStyleRange'); }
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely create and cleanup ActionReference
 * Used internally by framework factory methods
 * 
 * @param setup - Function to configure the reference
 * @returns ActionDescriptor result or null if error
 * 
 * @example
 * ```typescript
 * const desc = safeActionReference(ref => {
 *     ref.putEnumerated(CommonTypeIDs.layer, CommonTypeIDs.ordinal, CommonTypeIDs.target);
 * });
 * ```
 */
export function safeActionReference(setup: (ref: ActionReference) => void): ActionDescriptor | null {
    let ref: ActionReference | null = null;
    try {
        ref = new ActionReference();
        setup(ref);
        return executeActionGet(ref);
    } catch {
        return null;
    } finally {
        // Critical for ExtendScript memory management
        ref = null;
    }
}

/**
 * Check if property exists in ActionDescriptor
 * Utility to avoid exceptions in property checking
 * 
 * @param desc - ActionDescriptor to check
 * @param property - Property name (will be converted to type ID)
 * @returns True if property exists
 */
export function hasProperty(desc: ActionDescriptor, property: string): boolean {
    if (!desc || !property) return false;

    try {
        const typeID = stringIDToTypeID(property);
        return desc.hasKey(typeID);
    } catch {
        return false;
    }
}

/**
 * Get string property safely
 * Utility that handles the full stringIDToTypeID -> getString chain
 * 
 * @param desc - ActionDescriptor to extract from
 * @param property - Property name
 * @returns String value or empty string if missing
 */
export function getStringProperty(desc: ActionDescriptor, property: string): string {
    if (!desc || !property) return "";

    try {
        const typeID = stringIDToTypeID(property);
        if (!desc.hasKey(typeID)) return "";
        return desc.getString(typeID);
    } catch {
        return "";
    }
}

/**
 * Get numeric property safely
 * Utility that handles the full stringIDToTypeID -> getDouble chain
 * 
 * @param desc - ActionDescriptor to extract from
 * @param property - Property name
 * @returns Numeric value or -1 if missing
 */
export function getDoubleProperty(desc: ActionDescriptor, property: string): number {
    if (!desc || !property) return -1;

    try {
        const typeID = stringIDToTypeID(property);
        if (!desc.hasKey(typeID)) return -1;
        return desc.getDouble(typeID);
    } catch {
        return -1;
    }
}

// =============================================================================
// FRAMEWORK INTEGRATION NOTES
// =============================================================================

/*
DEPENDENCY HIERARCHY:

1. ps.ts (THIS FILE) - Foundation layer
   ├── Provides all ActionManager bindings
   ├── No dependencies
   └── Used by ALL other framework components

2. ActionDescriptorNavigator.ts - Core navigation
   ├── Imports: ps.ts, types.ts, extendscript-polyfills.js
   ├── Provides: Factory methods, safe navigation, error handling
   └── Used by: PathAccessor.ts, ListExtractors.ts

3. PathAccessor.ts - Fluent API
   ├── Imports: ActionDescriptorNavigator.ts, ps.ts, types.ts
   ├── Provides: P factory, search methods, transformations
   └── Used by: Application code (90% of usage)

4. ListExtractors.ts - Advanced processing
   ├── Imports: ActionDescriptorNavigator.ts, ps.ts, types.ts
   ├── Provides: Complex list extraction and transformation
   └── Used by: Advanced scenarios requiring list processing

XML DUMP vs ACTUAL PROPERTY NAMES:
- XML Dump shows: <Text> <FontName> <WarpStyle>
- Actual properties: 'textKey', 'fontName', 'warpStyle' (camelCase)
- Always use camelCase starting with lowercase for property names
- The framework handles the stringIDToTypeID conversion automatically

PERFORMANCE CONSIDERATIONS:
- stringIDToTypeID() calls have overhead - framework caches when possible
- ActionReference creation/cleanup is expensive - factory methods handle this
- Object navigation is fast once you have the ActionDescriptor
- Batch property extraction (getValuesAsObject) is more efficient than individual calls

MEMORY MANAGEMENT:
- ActionReference objects must be explicitly cleaned up in ExtendScript
- Factory methods in ActionDescriptorNavigator handle this automatically  
- Never manually create ActionReference unless you handle cleanup
- Use safeActionReference() utility if you need custom references
*/