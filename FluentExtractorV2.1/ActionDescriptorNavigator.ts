/**
 * Core navigation engine for Photoshop ActionDescriptor structures
 * Provides imperative-style navigation and tuple extraction capabilities
 * Optimized with consistent error handling and ES3 transpilation compatibility
 */
import "./extendscript-polyfills.js";
import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID, typeIDToStringID } from "./ps";
import { ValueType, SentinelValue, SentinelValueMap, ValueTransformer, ComparisonOptions } from "./types";

/**
 * Core navigation class for ActionDescriptor structures
 * Fixed: ExtendScript compatibility, memory management, sentinel handling, ES3 transpilation compatibility
 * 
 * @example
 * ```typescript
 * // Create navigator for current layer
 * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
 * const layerName = layerNav.getValue('name', 'string'); // Returns "" if missing
 * const opacity = layerNav.getValue('opacity', 'double'); // Returns -1 if missing
 * ```
 */
class ActionDescriptorNavigator {
    private readonly desc: ActionDescriptor | null;
    private readonly isSentinel: boolean;

    // Static sentinel constants for performance
    private static readonly SENTINELS: SentinelValueMap = {
        "string": "",
        "enumerated": "",
        "integer": -1,
        "double": -1,
        "boolean": false
    } as const;

    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    /**
     * Create navigator from ActionReference
     * 
     * @param ref - ActionReference to navigate from
     * @returns Navigator instance or sentinel if reference is invalid
     * 
     * @example
     * ```typescript
     * const ref = new ActionReference();
     * ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
     * const nav = ActionDescriptorNavigator.from(ref);
     * ```
     */
    static from(ref: ActionReference): ActionDescriptorNavigator {
        try {
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create navigator for current layer
     * 
     * @returns Navigator for the currently active layer
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * const name = layerNav.getValue('name', 'string');
     * const visible = layerNav.getValue('visible', 'boolean');
     * ```
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            // ActionReference cleanup - important for memory management
            ref = null;
        }
    }

    /**
     * Create navigator for current document
     * 
     * @returns Navigator for the currently active document
     * 
     * @example
     * ```typescript
     * const docNav = ActionDescriptorNavigator.forCurrentDocument();
     * const width = docNav.getValue('width', 'double');
     * const height = docNav.getValue('height', 'double');
     * const colorMode = docNav.getValue('mode', 'enumerated');
     * ```
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            // ActionReference cleanup - important for memory management
            ref = null;
        }
    }

    /**
     * Create navigator for layer by index (1-based)
     * 
     * @param index - Layer index (1-based, where 1 is the bottom layer)
     * @returns Navigator for the specified layer or sentinel if invalid
     * 
     * @example
     * ```typescript
     * const thirdLayer = ActionDescriptorNavigator.forLayerByIndex(3);
     * const layerName = thirdLayer.getValue('name', 'string');
     * const bounds = thirdLayer.getBounds();
     * ```
     */
    static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        } finally {
            // ActionReference cleanup - important for memory management
            ref = null;
        }
    }

    /**
     * Create navigator for layer by exact name (case-insensitive, leading/trailing spaces ignored)
     * 
     * @param layerName - Layer name to find (exact match after case/trim normalization)
     * @returns Navigator for the matching layer or sentinel if not found
     * 
     * @example
     * ```typescript
     * // Find layer with exact name match
     * const targetLayer = ActionDescriptorNavigator.forLayerByName("TargetTest");
     * const name = targetLayer.getValue('name', 'string');
     * 
     * // Case-insensitive matching
     * const headerLayer = ActionDescriptorNavigator.forLayerByName("HEADER"); // Finds "header"
     * const bgLayer = ActionDescriptorNavigator.forLayerByName("background"); // Finds "Background"
     * 
     * // Leading/trailing spaces ignored
     * const trimLayer = ActionDescriptorNavigator.forLayerByName("  MyLayer  "); // Finds "MyLayer"
     * 
     * // Internal spaces must match exactly
     * const spaceLayer = ActionDescriptorNavigator.forLayerByName("My Layer"); // Only finds "My Layer", not "MyLayer"
     * 
     * // Exact match required - no partial matching
     * const exactOnly = ActionDescriptorNavigator.forLayerByName("Target"); // Will NOT find "TargetTest"
     * 
     * // Safe - returns sentinel if layer not found
     * const missingLayer = ActionDescriptorNavigator.forLayerByName("NonExistent");
     * const safeName = missingLayer.getValue('name', 'string'); // Returns ""
     * 
     * // Use in scoring scripts
     * const textLayer = ActionDescriptorNavigator.forLayerByName("MyTextLayer");
     * const textNav = textLayer.object('textKey');
     * const styleList = textNav.list('textStyleRange');
     * const arialIndex = styleList.findIndex('fontName', 'Arial');
     * ```
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.trim().length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
            const searchName = layerName.toLowerCase().trim();

            for (let i = 0; i < layerNames.length; i++) {
                const currentName = layerNames[i].toLowerCase().trim();

                // Exact match after (case + trim)
                if (currentName === searchName) {
                    return ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
                }
            }

            // Layer not found
            return ActionDescriptorNavigator.createSentinel();
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create sentinel navigator that always returns sentinel values
     * Fixed: No shared mutable state
     * 
     * @returns Sentinel navigator instance
     * 
     * @example
     * ```typescript
     * const sentinel = ActionDescriptorNavigator.createSentinel();
     * const value = sentinel.getValue('anyKey', 'string'); // Always returns ""
     * ```
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Navigate to nested object property
     * Returns sentinel navigator for missing keys
     * 
     * @param key - Property key to navigate to
     * @returns New navigator for the nested object or sentinel
     * 
     * @example
     * ```typescript
     * const textNav = layerNav.object('textKey');
     * const boundsNav = layerNav.object('bounds');
     * const safeNav = layerNav.object('missingKey'); // Returns sentinel
     * ```
     */
    object(key: string): ActionDescriptorNavigator {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to list property
     * Returns sentinel navigator for missing keys
     * 
     * @param key - List property key to navigate to
     * @returns ActionListNavigator for the list or sentinel
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * const firstStyle = styleList.getObject(0);
     * ```
     */
    list(key: string): ActionListNavigator {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionListNavigator.createSentinel();
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch {
            return ActionListNavigator.createSentinel();
        }
    }

    /**
     * Get sentinel value based on type with exhaustive checking
     * 
     * @param type - Value type to get sentinel for
     * @returns Appropriate sentinel value for the type
     * 
     * @example
     * ```typescript
     * const stringSentinel = ActionDescriptorNavigator.getSentinelValue('string'); // ""
     * const numberSentinel = ActionDescriptorNavigator.getSentinelValue('double'); // -1
     * const boolSentinel = ActionDescriptorNavigator.getSentinelValue('boolean'); // false
     * ```
     */
    static getSentinelValue<T extends ValueType>(type: T): SentinelValue<T> {
        switch (type) {
            case 'string':
            case 'enumerated':
                return "" as SentinelValue<T>;
            case 'integer':
            case 'double':
                return -1 as SentinelValue<T>;
            case 'boolean':
                return false as SentinelValue<T>;
            default:
                const _exhaustive: never = type;
                throw new Error(`Invalid value type: ${type}`);
        }
    }

    /**
    * Get value with optional transformation and enumerated string support
    * Consistent sentinel value returns with enhanced enumerated handling
    * 
    * @param key - Property key to extract
    * @param type - Expected value type
    * @param options - Optional transformation and default value options
    * @returns Extracted value or sentinel/default (enumerated returns numbers - use getEnumeratedString for strings)
    * 
    * @example
    * ```typescript
    * const name = layerNav.getValue('name', 'string'); // "" if missing
    * const opacity = layerNav.getValue('opacity', 'double'); // -1 if missing
    * const visible = layerNav.getValue('visible', 'boolean'); // false if missing
    * 
    * // For enumerated values, use getEnumeratedString() for readable strings
    * const modeNumeric = layerNav.getValue('mode', 'enumerated'); // Returns number
    * const modeString = layerNav.getEnumeratedString('mode'); // Returns "normal", "multiply", etc.
    * 
    * // With transformation
    * const roundedOpacity = layerNav.getValue('opacity', 'double', {
    *   transformer: val => Math.round(val)
    * });
    * 
    * // With custom default
    * const nameOrDefault = layerNav.getValue('name', 'string', {
    *   defaultValue: 'Unnamed Layer'
    * });
    * ```
    */
    getValue<T = any>(
        key: string,
        type: ValueType,
        options?: ComparisonOptions
    ): T {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }

        try {
            const value = this.extractByType(typeID, type);

            if (options?.transformer) {
                try {
                    return options.transformer(value) as T;
                } catch {
                    return (options.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
                }
            }

            return value as T;
        } catch {
            return (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
        }
    }

    /**
 * Get string value with consistent error handling
 * Wrapper for getValue with string type, allows for future string-specific logic
 * 
 * @param key - Property key to extract
 * @returns String value or empty string if missing/error
 * 
 * @example
 * ```typescript
 * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
 * 
 * // Layer properties
 * const layerName = layerNav.getStringValue('name');           // "Background" or ""
 * const blendMode = layerNav.getStringValue('mode');           // "normal" or ""
 * 
 * // Text properties
 * const fontName = textStyle.getStringValue('fontName');       // "Arial" or ""
 * const textContent = textNav.getStringValue('text');         // "Hello World" or ""
 * 
 * // Safe usage - always returns string
 * const safeName = layerNav.getStringValue('missingProp');     // "" (never null/undefined)
 * 
 * // Future custom logic potential:
 * // - String trimming, case normalization
 * // - Character encoding handling
 * // - Localization support
 * ```
 */
    getStringValue(key: string): string {
        return this.getValue(key, 'string');
    }

    /**
     * Get numeric double value with consistent error handling
     * Wrapper for getValue with double type, allows for future numeric-specific logic
     * 
     * @param key - Property key to extract
     * @returns Double value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Layer properties
     * const opacity = layerNav.getDoubleValue('opacity');          // 75.5 or -1
     * const rotation = layerNav.getDoubleValue('rotation');        // 45.0 or -1
     * 
     * // Text style properties
     * const tracking = textStyle.getDoubleValue('tracking');       // 100.0 or -1
     * const leading = textStyle.getDoubleValue('leading');         // 14.4 or -1
     * const scale = textStyle.getDoubleValue('horizontalScale');   // 120.0 or -1
     * 
     * // Color properties
     * const redValue = colorObj.getDoubleValue('red');             // 255.0 or -1
     * 
     * // Safe usage - always returns number
     * const safeOpacity = layerNav.getDoubleValue('missingProp');  // -1 (never null/undefined)
     * 
     * // Future custom logic potential:
     * // - Value range validation (0-100 for opacity)
     * // - Precision rounding
     * // - Unit-aware calculations
     * ```
     */
    getDoubleValue(key: string): number {
        return this.getValue(key, 'double');
    }

    /**
     * Get integer value with consistent error handling
     * Wrapper for getValue with integer type, allows for future integer-specific logic
     * 
     * @param key - Property key to extract
     * @returns Integer value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * const docNav = ActionDescriptorNavigator.forCurrentDocument();
     * 
     * // Layer properties
     * const layerID = layerNav.getIntegerValue('layerID');         // 142 or -1
     * const itemIndex = layerNav.getIntegerValue('itemIndex');     // 33 or -1
     * const globalAngle = layerNav.getIntegerValue('globalAngle'); // 90 or -1
     * 
     * // Document properties
     * const layerCount = docNav.getIntegerValue('numberOfLayers'); // 15 or -1
     * const resolution = docNav.getIntegerValue('resolution');     // 300 or -1
     * 
     * // Text properties
     * const fontScript = textStyle.getIntegerValue('fontScript');  // 0 or -1
     * const tracking = textStyle.getIntegerValue('tracking');      // 50 or -1
     * 
     * // Safe usage - always returns number
     * const safeID = layerNav.getIntegerValue('missingProp');      // -1 (never null/undefined)
     * 
     * // Future custom logic potential:
     * // - Range validation (layer indices, counts)
     * // - Type coercion from doubles
     * // - ID validation and formatting
     * ```
     */
    getIntegerValue(key: string): number {
        return this.getValue(key, 'integer');
    }

    /**
     * Get boolean value with consistent error handling
     * Wrapper for getValue with boolean type, allows for future boolean-specific logic
     * 
     * @param key - Property key to extract
     * @returns Boolean value or false if missing/error
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Layer state properties
     * const isVisible = layerNav.getBooleanValue('visible');       // true or false
     * const isLocked = layerNav.getBooleanValue('preserveTransparency'); // true or false
     * const isBackground = layerNav.getBooleanValue('background'); // true or false
     * const hasEffects = layerNav.getBooleanValue('layerFXVisible'); // true or false
     * 
     * // Text style properties
     * const isBold = textStyle.getBooleanValue('syntheticBold');   // true or false
     * const isItalic = textStyle.getBooleanValue('syntheticItalic'); // true or false
     * const autoLeading = textStyle.getBooleanValue('autoLeading'); // true or false
     * const hasStroke = textStyle.getBooleanValue('stroke');       // true or false
     * 
     * // Safe usage - always returns boolean
     * const safeBool = layerNav.getBooleanValue('missingProp');    // false (never null/undefined)
     * 
     * // Usage in conditions
     * if (layerNav.getBooleanValue('visible')) {
     *     // Process visible layer
     * }
     * 
     * // Future custom logic potential:
     * // - String-to-boolean conversion ("true"/"false" strings)
     * // - Numeric-to-boolean conversion (0/1 values)
     * // - Default value customization
     * ```
     */
    getBooleanValue(key: string): boolean {
        return this.getValue(key, 'boolean');
    }

    /**
     * Get unit double value with consistent error handling and future unit conversion support
     * Wrapper for getValue with double type, specifically for UnitDouble properties
     * 
     * @param key - Property key to extract (typically size, distance, or measurement properties)
     * @returns Unit double value or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const textStyle = arialTextStyleObj;
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * 
     * // Text size properties (typically in points)
     * const fontSize = textStyle.getUnitDoubleValue('sizeKey');         // 217.8 or -1
     * const impliedSize = textStyle.getUnitDoubleValue('impliedFontSize'); // 114.9 or -1
     * const baselineShift = textStyle.getUnitDoubleValue('baselineShift'); // 0.0 or -1
     * const leading = textStyle.getUnitDoubleValue('autoLeading');      // 26.1 or -1
     * 
     * // Document measurements (typically in pixels or points)
     * const docWidth = docNav.getUnitDoubleValue('width');              // 3300.0 or -1
     * const docHeight = docNav.getUnitDoubleValue('height');            // 5100.0 or -1
     * const resolution = docNav.getUnitDoubleValue('resolution');       // 300.0 or -1
     * 
     * // Layer bounds (typically in pixels)
     * const bounds = layerNav.object('bounds');
     * const left = bounds.getUnitDoubleValue('left');                   // 68.0 or -1
     * const top = bounds.getUnitDoubleValue('top');                     // 300.0 or -1
     * const width = bounds.getUnitDoubleValue('width');                 // 772.0 or -1
     * const height = bounds.getUnitDoubleValue('height');               // 148.0 or -1
     * 
     * // Safe usage - always returns number
     * const safeSize = textStyle.getUnitDoubleValue('missingProp');     // -1 (never null/undefined)
     * 
     * // Future custom logic potential:
     * // - Unit conversion (points to pixels, mm to inches)
     * // - DPI-aware scaling
     * // - Precision rounding for UI display
     * // - Unit detection and labeling
     * ```
     */
    getUnitDoubleValue(key: string): number {
        return this.getValue(key, 'double');
    }

    /**
     * Get enumerated value as numeric ID with consistent error handling
     * Wrapper for getValue with enumerated type, returns numeric enumeration ID
     * Complement to getEnumeratedString() for cases where numeric ID is needed
     * 
     * @param key - Property key to extract
     * @returns Enumerated numeric ID or -1 if missing/error
     * 
     * @example
     * ```typescript
     * const layerNav = ActionDescriptorNavigator.forCurrentLayer();
     * const textStyle = arialTextStyleObj;
     * 
     * // Layer enumerated properties (as numeric IDs)
     * const blendModeID = layerNav.getEnumeratedNumeric('mode');        // 0 (normal) or -1
     * const colorModeID = docNav.getEnumeratedNumeric('mode');          // 1 (RGB) or -1
     * 
     * // Text style enumerated properties (as numeric IDs)
     * const fontCapsID = textStyle.getEnumeratedNumeric('fontCaps');    // 1 (smallCaps) or -1
     * const autoKernID = textStyle.getEnumeratedNumeric('autoKern');    // 0 (metricsKern) or -1
     * const figureStyleID = textStyle.getEnumeratedNumeric('figureStyle'); // 0 (normal) or -1
     * 
     * // Warp enumerated properties (as numeric IDs)
     * const warpStyleID = warpObj.getEnumeratedNumeric('warpStyle');    // 1 (warpArc) or -1
     * const orientationID = warpObj.getEnumeratedNumeric('warpRotate'); // 0 (horizontal) or -1
     * 
     * // Safe usage - always returns number
     * const safeID = layerNav.getEnumeratedNumeric('missingProp');      // -1 (never null/undefined)
     * 
     * // Use cases for numeric IDs:
     * // - Performance: Numeric comparison faster than string
     * // - Compatibility: Some APIs expect numeric enumeration values
     * // - Mapping: Create custom ID-to-string mappings
     * 
     * // Comparison with string version:
     * const warpStyleString = warpObj.getEnumeratedString('warpStyle'); // "warpArc" or ""
     * const warpStyleNumeric = warpObj.getEnumeratedNumeric('warpStyle'); // 1 or -1
     * 
     * // Future custom logic potential:
     * // - Custom ID-to-string mapping tables
     * // - Enumeration validation
     * // - Fallback ID handling
     * // - Performance optimization for numeric operations
     * ```
     */
    getEnumeratedNumeric(key: string): number {
        // Note: This will use the original enumerated extraction which returns numbers
        // We bypass our custom string-focused extractByType logic for this method
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return -1;
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return -1;
        }

        try {
            return this.desc.getEnumerationValue(typeID);
        } catch {
            return -1;
        }
    }

    /**
     * Extract value by type using direct switch
     * For enumerated types, returns empty string if string extraction fails
     * 
     * @param typeID - Photoshop type ID for the property
     * @param type - Expected value type
     * @returns Extracted value or sentinel value for failed extractions
     * 
     * @example
     * ```typescript
     * const nameTypeID = stringIDToTypeID('name');
     * const name = nav.extractByType(nameTypeID, 'string');
     * 
     * const modeTypeID = stringIDToTypeID('mode');
     * const mode = nav.extractByType(modeTypeID, 'enumerated'); // Returns string or ""
     * ```
     */
    extractByType(typeID: number, type: ValueType): any {
        if (this.isSentinel || !this.desc || !this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.getSentinelValue(type);
        }

        try {
            switch (type) {
                case 'string':
                    return this.desc.getString(typeID);
                case 'integer':
                    return this.desc.getInteger(typeID);
                case 'double':
                    return this.desc.getDouble(typeID);
                case 'boolean':
                    return this.desc.getBoolean(typeID);
                case 'enumerated':
                    // Try to get enumerated as string, return "" if fails
                    try {
                        return this.desc.getString(typeID);
                    } catch {
                        return "";
                    }
                default:
                    const _exhaustive: never = type;
                    throw new Error(`Unsupported type: ${type}`);
            }
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(type);
        }
    }

    /**
     * Check if key exists
     * 
     * @param key - Property key to check
     * @returns True if key exists, false otherwise
     * 
     * @example
     * ```typescript
     * if (layerNav.hasKey('textKey')) {
     *   const textNav = layerNav.object('textKey');
     *   // Process text layer
     * }
     * ```
     */
    hasKey(key: string): boolean {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return false;
        }
        try {
            return this.desc.hasKey(stringIDToTypeID(key));
        } catch {
            return false;
        }
    }

    /**
     * Get multiple values as tuple
     * Functional approach with proper error handling
     * 
     * @param specs - Array of extraction specifications
     * @returns Array of extracted values in the same order
     * 
     * @example
     * ```typescript
     * const specs = [
     *   { key: 'name', type: 'string' as ValueType },
     *   { key: 'opacity', type: 'double' as ValueType },
     *   { key: 'visible', type: 'boolean' as ValueType }
     * ];
     * const [name, opacity, visible] = layerNav.getValues(specs);
     * ```
     */
    getValues(specs: readonly { key: string; type: ValueType; options?: ComparisonOptions }[]): readonly any[] {
        if (!specs || specs.length === 0) {
            return [];
        }

        return specs.map(spec => {
            if (!spec || !spec.key || !spec.type) {
                return ActionDescriptorNavigator.getSentinelValue(spec?.type || 'string');
            }

            try {
                return this.getValue(spec.key, spec.type, spec.options);
            } catch {
                return ActionDescriptorNavigator.getSentinelValue(spec.type);
            }
        });
    }

    /**
     * Get multiple values as object with proper bounds checking
     * 
     * @param specs - Object mapping property names to extraction specifications
     * @returns Object with extracted values mapped to property names
     * 
     * @example
     * ```typescript
     * const properties = layerNav.getValuesAsObject({
     *   name: { key: 'name', type: 'string' },
     *   opacity: { key: 'opacity', type: 'double' },
     *   visible: { key: 'visible', type: 'boolean' },
     *   layerID: { key: 'layerID', type: 'integer' }
     * });
     * 
     * console.log(properties.name, properties.opacity, properties.visible);
     * ```
     */
    getValuesAsObject<T extends Record<string, any>>(
        specs: { readonly [K in keyof T]: { key: string; type: ValueType; options?: ComparisonOptions } }
    ): T {
        const result = {} as T;

        for (const propName in specs) {
            if (specs.hasOwnProperty(propName)) {
                const spec = specs[propName];
                try {
                    result[propName] = this.getValue(spec.key, spec.type, spec.options);
                } catch {
                    result[propName] = ActionDescriptorNavigator.getSentinelValue(spec.type) as any;
                }
            }
        }

        return result;
    }

    /**
     * Get bounds object - returns sentinel bounds instead of null
     * Fixed: Calculate width/height from left/top/right/bottom
     * 
     * @returns Bounds object with calculated width and height
     * 
     * @example
     * ```typescript
     * const bounds = layerNav.getBounds();
     * console.log(`Size: ${bounds.width}x${bounds.height}`);
     * console.log(`Position: ${bounds.left},${bounds.top}`);
     * 
     * // Check if bounds are valid
     * if (bounds.left !== -1) {
     *   // Process valid bounds
     * }
     * ```
     */
    getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
        if (this.isSentinel || !this.desc) {
            return { left: -1, top: -1, right: -1, bottom: -1, width: -1, height: -1 };
        }

        try {
            const boundsDesc = this.desc.getObjectValue(stringIDToTypeID('bounds'));
            const left = boundsDesc.getDouble(stringIDToTypeID('left'));
            const top = boundsDesc.getDouble(stringIDToTypeID('top'));
            const right = boundsDesc.getDouble(stringIDToTypeID('right'));
            const bottom = boundsDesc.getDouble(stringIDToTypeID('bottom'));

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
                width: right - left,
                height: bottom - top
            };
        } catch {
            return { left: -1, top: -1, right: -1, bottom: -1, width: -1, height: -1 };
        }
    }

    /**
     * Get text properties - returns sentinel properties instead of null
     * Fixed: Use correct property name for text content
     * 
     * @returns Text properties including content, font name, and size
     * 
     * @example
     * ```typescript
     * const textProps = layerNav.getTextProperties();
     * if (textProps.content !== "") {
     *   console.log(`Text: "${textProps.content}"`);
     *   console.log(`Font: ${textProps.fontName} ${textProps.fontSize}pt`);
     * }
     * ```
     */
    getTextProperties(): { content: string; fontName: string; fontSize: number } {
        if (this.isSentinel || !this.desc) {
            return { content: "", fontName: "", fontSize: -1 };
        }

        try {
            const textKey = this.desc.getObjectValue(stringIDToTypeID('textKey'));
            const textContent = textKey.getString(stringIDToTypeID('text')) || "";
            const textStyleRanges = textKey.getList(stringIDToTypeID('textStyleRange'));

            if (textStyleRanges.count > 0) {
                const firstRange = textStyleRanges.getObjectValue(0);
                const textStyle = firstRange.getObjectValue(stringIDToTypeID('textStyle'));

                return {
                    content: textContent,
                    fontName: textStyle.getString(stringIDToTypeID('fontName')) || "",
                    fontSize: textStyle.getDouble(stringIDToTypeID('size')) || -1
                };
            }

            return {
                content: textContent,
                fontName: "",
                fontSize: -1
            };
        } catch {
            return { content: "", fontName: "", fontSize: -1 };
        }
    }

    /**
     * Get layer count with proper ActionReference cleanup
     * 
     * @returns Number of layers in the document or -1 if error
     * 
     * @example
     * ```typescript
     * const layerCount = ActionDescriptorNavigator.getLayerCount();
     * console.log(`Document has ${layerCount} layers`);
     * 
     * if (layerCount > 0) {
     *   // Process layers
     * }
     * ```
     */
    static getLayerCount(): number {
        let ref: ActionReference | null = null;
        try {
            ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch {
            return -1;
        } finally {
            // ActionReference cleanup - important for memory management
            ref = null;
        }
    }

    /**
     * Extract all layer names with proper memory management
     * Fixed: Safer approach without ActionReference loops
     * 
     * @returns Array of all layer names in the document
     * 
     * @example
     * ```typescript
     * const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
     * console.log('Layers:', layerNames);
     * 
     * // Find specific layers
     * const backgroundExists = layerNames.some(name => 
     *   name.toLowerCase().includes('background')
     * );
     * ```
     */
    static extractAllLayerNames(): readonly string[] {
        try {
            const layerCount = ActionDescriptorNavigator.getLayerCount();
            if (layerCount <= 0) return [];

            const results: string[] = [];
            for (let i = 1; i <= layerCount; i++) {
                try {
                    const layerNav = ActionDescriptorNavigator.forLayerByIndex(i);
                    const name = layerNav.getValue('name', 'string');
                    results.push(name);
                } catch {
                    results.push("");
                }
            }
            return results;
        } catch {
            return [];
        }
    }

    /**
     * Extract value from descriptor using sub-path
     * Centralized implementation for reuse
     * 
     * @param subPath - Dot-separated path to the value
     * @param valueType - Type of value to extract
     * @returns Extracted value or sentinel
     * 
     * @example
     * ```typescript
     * const fontSize = layerNav.extractValueFromDescriptor('textStyle.size', 'double');
     * const fontName = layerNav.extractValueFromDescriptor('textStyle.fontName', 'string');
     * ```
     */
    extractValueFromDescriptor(subPath: string, valueType: ValueType): any {
        if (this.isSentinel || !this.desc || !this.validatePath(subPath)) {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }

        const pathParts = subPath.split('.').filter(Boolean);

        if (pathParts.length === 1) {
            // Single property access
            const typeID = stringIDToTypeID(pathParts[0]);
            return this.extractByType(typeID, valueType);
        }

        // Multi-level property access
        try {
            const finalDesc = pathParts.slice(0, -1).reduce((current, part) => {
                const typeID = stringIDToTypeID(part);
                if (!current.hasKey(typeID)) {
                    throw new Error(`Property '${part}' not found`);
                }
                return current.getObjectValue(typeID);
            }, this.desc);

            const finalPart = pathParts[pathParts.length - 1];
            const typeID = stringIDToTypeID(finalPart);

            if (!finalDesc.hasKey(typeID)) {
                return ActionDescriptorNavigator.getSentinelValue(valueType);
            }

            const navigator = new ActionDescriptorNavigator(finalDesc);
            return navigator.extractByType(typeID, valueType);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(valueType);
        }
    }

    /**
     * Extract enumerated value as human-readable string using proper ActionManager method
     * Converts numeric enumeration ID back to string using typeIDToStringID
     * 
     * @param key - Property key to extract enumerated value from
     * @returns Human-readable enumerated string or sentinel value if not found
     * 
     * @example
     * ```typescript
     * const textStyle = arialTextStyleObj;
     * const paragraphStyle = textNav.object('paragraphStyle');
     * 
     * // Get enumerated strings from actual XML Dump values
     * const autoKern = textStyle.getEnumeratedString('autoKern'); // "metricsKern" or ""
     * const baseline = textStyle.getEnumeratedString('baseline'); // "Normal" or ""
     * const underline = textStyle.getEnumeratedString('underline'); // "underlineOff" or ""
     * const figureStyle = textStyle.getEnumeratedString('figureStyle'); // "Normal" or ""
     * const textLanguage = textStyle.getEnumeratedString('textLanguage'); // "englishLanguage" or ""
     * const alignment = paragraphStyle.getEnumeratedString('alignment'); // "Left" or ""
     * const baselineDirection = textStyle.getEnumeratedString('baselineDirection'); // "withStream" or ""
     * 
     * // Check if enumerated extraction succeeded
     * if (autoKern !== "") {
     *     console.log('Auto kern setting:', autoKern);
     * }
     * ```
     */
    getEnumeratedString(key: string): string {
        if (this.isSentinel || !this.validateKey(key) || !this.desc) {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }

        const typeID = stringIDToTypeID(key);

        if (!this.desc.hasKey(typeID)) {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }

        try {
            // Get the numeric enumeration value
            const enumValue = this.desc.getEnumerationValue(typeID);

            // Convert numeric ID back to string using ActionManager function
            const enumString = typeIDToStringID(enumValue);

            return enumString || ActionDescriptorNavigator.getSentinelValue('enumerated');
        } catch {
            return ActionDescriptorNavigator.getSentinelValue('enumerated');
        }
    }

    /**
     * Validate key input
     */
    private validateKey(key: string): boolean {
        return key !== null && key !== undefined && key.trim().length > 0;
    }

    /**
     * Validate path input
     */
    private validatePath(path: string): boolean {
        return path !== null && path !== undefined && path.trim().length > 0;
    }
}

/**
 * Navigator for ActionList objects with consistent error handling
 * Fixed: No shared mutable state, proper list count handling, ES3 transpilation compatibility
 * 
 * @example
 * ```typescript
 * const styleList = textNav.list('textStyleRange');
 * const count = styleList.getCount();
 * 
 * for (let i = 0; i < count; i++) {
 *   const style = styleList.getObject(i);
 *   const fontSize = style.getValue('size', 'double');
 * }
 * ```
 */
class ActionListNavigator {
    private readonly list: ActionList | null;
    private readonly isSentinel: boolean;

    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    /**
     * Create sentinel list navigator without shared state
     * 
     * @returns Sentinel list navigator instance
     * 
     * @example
     * ```typescript
     * const sentinel = ActionListNavigator.createSentinel();
     * const count = sentinel.getCount(); // Always returns -1
     * ```
     */
    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get count with consistent sentinel values
     * Fixed: ES3 transpilation compatibility - changed from getter to method
     * 
     * @returns Number of items in the list or -1 if sentinel/error
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const count = styleList.getCount();
     * 
     * if (count > 0) {
     *   // Process list items
     *   for (let i = 0; i < count; i++) {
     *     const item = styleList.getObject(i);
     *   }
     * }
     * ```
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1; // Consistent with other numeric failures
        }

        try {
            return this.list.count;
        } catch {
            return -1; // Consistent with other numeric failures
        }
    }

    /**
     * Get object at specific index with bounds checking
     * 
     * @param index - Zero-based index of the item to retrieve
     * @returns Navigator for the list item or sentinel if out of bounds
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * const firstStyle = styleList.getObject(0);
     * const secondStyle = styleList.getObject(1);
     * const invalidStyle = styleList.getObject(999); // Returns sentinel
     * 
     * // Extract properties from style
     * const fontSize = firstStyle.getValue('size', 'double');
     * const fontName = firstStyle.getValue('fontName', 'string');
     * ```
     */
    getObject(index: number): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get all values from list
     * 
     * @param key - Property key to extract from each list item
     * @param type - Value type to extract
     * @param options - Optional transformation and default value options
     * @returns Array of extracted values
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Get all font sizes
     * const fontSizes = styleList.getAllValues('size', 'double');
     * console.log('Font sizes:', fontSizes); // [12, 14, 16] or []
     * 
     * // Get all font names
     * const fontNames = styleList.getAllValues('fontName', 'string');
     * console.log('Font names:', fontNames); // ["Arial", "Helvetica"] or []
     * 
     * // With transformation
     * const roundedSizes = styleList.getAllValues('size', 'double', {
     *   transformer: size => Math.round(size)
     * });
     * ```
     */
    getAllValues<T = any>(
        key: string,
        type: ValueType,
        options?: ComparisonOptions
    ): readonly T[] {
        if (this.isSentinel || !this.list) {
            return [];
        }

        const results: T[] = [];
        const listCount = this.getCount();

        if (listCount <= 0) {
            return [];
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const value = obj.getValue<T>(key, type, options);
                results.push(value);
            } catch {
                const fallback = (options?.defaultValue ?? ActionDescriptorNavigator.getSentinelValue(type)) as T;
                results.push(fallback);
            }
        }
        return results;
    }

    /**
     * Find first matching value
     * 
     * @param key - Property key to extract from each list item
     * @param type - Value type to extract
     * @param predicate - Function to test each value
     * @param options - Optional transformation and default value options
     * @returns First matching value or sentinel
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find first font size larger than 20
     * const largeFontSize = styleList.findValue('size', 'double', size => size > 20);
     * console.log('Large font found:', largeFontSize); // 24 or -1
     * 
     * // Find Arial font
     * const arialSize = styleList.findValue('fontName', 'string', name => 
     *   name.includes('Arial')
     * );
     * 
     * // Find font with specific tracking
     * const trackedFont = styleList.findValue('tracking', 'double', 
     *   tracking => Math.abs(tracking - 100) < 10
     * );
     * ```
     */
    findValue<T = any>(
        key: string,
        type: ValueType,
        predicate: (value: T) => boolean,
        options?: ComparisonOptions
    ): T {
        if (this.isSentinel || !this.list || !predicate) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const value = obj.getValue<T>(key, type, options);
                if (predicate(value)) {
                    return value;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return ActionDescriptorNavigator.getSentinelValue(type) as T;
    }

    /**
         * Find index of first item where property matches value
         * ES3 transpilation compatible with case-insensitive string matching
         * 
         * @param key - Property key to search in each list item
         * @param value - Value to find (supports partial string matching)
         * @returns Zero-based index of matching item or -1 if not found
         * 
         * @example
         * ```typescript
         * const styleList = textNav.list('textStyleRange');
         * 
         * // Find Arial font index
         * const arialIndex = styleList.findIndex('fontName', 'Arial');
         * console.log('Arial at index:', arialIndex); // 0 or -1
         * 
         * // Find by exact match
         * const boldIndex = styleList.findIndex('fontName', 'Arial-BoldMT');
         * 
         * // Find by partial match (case-insensitive)
         * const anyArialIndex = styleList.findIndex('fontName', 'arial'); // Finds "Arial", "ArialMT", etc.
         * 
         * // Find by numeric value
         * const size24Index = styleList.findIndex('sizeKey', 24);
         * ```
         */
    findIndex(key: string, value: any): number {
        if (this.isSentinel || !this.list || !key) {
            return -1;
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return -1;
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const obj = this.getObject(i);
                const itemValue = obj.getValue(key, typeof value === 'string' ? 'string' : 'double');

                // Handle string matching (case-insensitive, partial match)
                if (typeof value === 'string' && typeof itemValue === 'string') {
                    if (itemValue.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        return i;
                    }
                } else if (itemValue === value) {
                    // Exact match for numbers, booleans, etc.
                    return i;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return -1; // Not found
    }

    /**
     * Find object navigator for first item where property matches value
     * Returns sentinel navigator if not found - no null checks needed
     * 
     * @param key - Property key to search in each list item
     * @param value - Value to find (supports partial string matching)
     * @returns Navigator for matching object or sentinel navigator
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find Arial text style object
     * const arialStyleRange = styleList.findObjectBy('fontName', 'Arial');
     * const textStyle = arialStyleRange.object('textStyle');
     * const fontSize = textStyle.getValue('sizeKey', 'double');
     * 
     * // Chain directly for cleaner syntax
     * const boldFont = styleList.findObjectBy('fontName', 'Bold')
     *                           .object('textStyle')
     *                           .getValue('fontName', 'string');
     * 
     * // Safe - returns sentinel if not found
     * const missingStyle = styleList.findObjectBy('fontName', 'NonExistent');
     * const safeName = missingStyle.getValue('fontName', 'string'); // Returns ""
     * 
     * // Find by numeric property
     * const largeTextStyle = styleList.findObjectBy('sizeKey', 24);
     * ```
     */
    findObjectBy(key: string, value: any): ActionDescriptorNavigator {
        const index = this.findIndex(key, value);
        if (index >= 0) {
            return this.getObject(index);
        }
        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Get value at specific index without navigating to object first
     * Combines getObject(index) + getValue() in one call
     * 
     * @param index - Zero-based index in the list
     * @param key - Property key to extract from the object at index
     * @param type - Value type to extract
     * @returns Extracted value or sentinel value if index/key invalid
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Get font name at specific index
     * const firstFont = styleList.getValueAt(0, 'fontName', 'string');
     * const secondFont = styleList.getValueAt(1, 'fontName', 'string');
     * 
     * // Combine with findIndex for peer values
     * const arialIndex = styleList.findIndex('fontName', 'Arial');
     * const arialSize = styleList.getValueAt(arialIndex, 'sizeKey', 'double');
     * const arialColor = styleList.getValueAt(arialIndex, 'color.red', 'double');
     * 
     * // Safe - returns sentinel if index out of bounds
     * const safeFont = styleList.getValueAt(999, 'fontName', 'string'); // Returns ""
     * const safeSize = styleList.getValueAt(-1, 'sizeKey', 'double');    // Returns -1
     * 
     * // Extract multiple peer values efficiently
     * const targetIndex = styleList.findIndex('fontName', 'Arial');
     * const font = styleList.getValueAt(targetIndex, 'fontName', 'string');
     * const size = styleList.getValueAt(targetIndex, 'sizeKey', 'double');
     * const scale = styleList.getValueAt(targetIndex, 'horizontalScale', 'double');
     * ```
     */
    getValueAt<T = any>(index: number, key: string, type: ValueType): T {
        if (this.isSentinel || !this.list || index < 0 || !key) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }

        try {
            const obj = this.getObject(index);
            return obj.getValue<T>(key, type);
        } catch {
            return ActionDescriptorNavigator.getSentinelValue(type) as T;
        }
    }

    /**
     * Find list object where a nested property matches a value
     * Searches through list items, navigates to nested object, and checks property value
     * 
     * @param nestedObjectKey - Key to navigate to nested object within each list item
     * @param propertyKey - Property key to check within the nested object
     * @param searchValue - Value to search for (case-insensitive, partial match)
     * @returns Navigator for matching list item or sentinel if not found
     * 
     * @example
     * ```typescript
     * const styleList = textNav.list('textStyleRange');
     * 
     * // Find TextStyleRange object where textStyle.fontName contains 'Arial'
     * const arialStyleRange = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial');
     * const arialTextStyle = arialStyleRange.object('textStyle');
     * 
     * // Find TextStyleRange object where textStyle.size is 24
     * const largeStyleRange = styleList.findObjectWhereNested('textStyle', 'sizeKey', '24');
     * 
     * // Chain navigation after finding
     * const fontColor = styleList.findObjectWhereNested('textStyle', 'fontName', 'Arial')
     *                            .object('textStyle')
     *                            .object('color')
     *                            .getValue('red', 'double');
     * ```
     */
    findObjectWhereNested(nestedObjectKey: string, propertyKey: string, searchValue: any): ActionDescriptorNavigator {
        if (this.isSentinel || !this.list || !nestedObjectKey || !propertyKey) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < listCount; i++) {
            try {
                const listItem = this.getObject(i);
                const nestedObject = listItem.object(nestedObjectKey);

                // Check if nested object exists using hasKey instead of isSentinel
                if (!listItem.hasKey(nestedObjectKey)) {
                    continue; // Skip if nested object doesn't exist
                }

                // Get property value from nested object
                const propertyValue = nestedObject.getValue(propertyKey, typeof searchValue === 'string' ? 'string' : 'double');

                // Handle string matching (case-insensitive, partial match)
                if (typeof searchValue === 'string' && typeof propertyValue === 'string') {
                    if (propertyValue.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0) {
                        return listItem;
                    }
                } else if (propertyValue === searchValue) {
                    // Exact match for numbers, booleans, etc.
                    return listItem;
                }
            } catch {
                // Continue searching on errors
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }
}

export { ActionDescriptorNavigator, ActionListNavigator };