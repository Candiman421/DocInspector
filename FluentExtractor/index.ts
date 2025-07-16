/**
 * Fluent Photoshop Document Scoring API - Convenience Entry Point
 * 
 * Provides factory functions and common extraction patterns emphasizing
 * robust, search-based approaches over brittle indexing.
 * UPDATED: Reflects current method signatures and safer extraction patterns
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

/**
 * Enhanced factory for common extraction patterns with search capabilities
 */
var createExtractor = function () {
    return {
        /**
         * Create a path for extracting single values
         */
        path: function () { return ActionDescriptorPath.create(); },

        /**
         * Quick bounds extraction with unit conversion
         */
        bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
            return ActionDescriptorPath.create()
                .object('bounds')
                .value(property, 'double')
                .toPixels('pt')
                .floor()
                .defaultTo(-1);
        },

        /**
         * Safe text style extraction with fallbacks
         */
        textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return ActionDescriptorPath.create()
                .object('textKey')
                .list('textStyleRange')
                .at(index)
                .object('textStyle')
                .value(property, type)
                .defaultTo(type === 'string' ? "" : type === 'boolean' ? false : -1);
        },

        /**
         * Filter extraction with search capabilities
         */
        filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return ActionDescriptorPath.create()
                .object('smartObjectMore')
                .list('filterFXList')
                .at(index)
                .value(property, type)
                .defaultTo(type === 'string' ? "" : type === 'boolean' ? false : -1);
        },

        /**
         * SAFER: Search-based layer extraction
         */
        findLayerByName: function (namePattern: string | RegExp) {
            return {
                extract: function(): string | null {
                    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
                    
                    for (var i = 0; i < layerNames.length; i++) {
                        var layerName = layerNames[i];
                        var matches = false;
                        
                        if (typeof namePattern === 'string') {
                            matches = layerName.toLowerCase().indexOf(namePattern.toLowerCase()) !== -1;
                        } else if (namePattern instanceof RegExp) {
                            matches = namePattern.test(layerName);
                        }
                        
                        if (matches) {
                            return layerName;
                        }
                    }
                    
                    return null;
                }
            };
        },

        /**
         * SAFER: Extract all layers with analysis
         */
        allLayersAnalysis: function () {
            return {
                extract: function() {
                    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
                    return {
                        names: layerNames,
                        count: layerNames.length,
                        hasBackground: layerNames.some(function(name) { 
                            return /background/i.test(name); 
                        }),
                        textLayers: layerNames.filter(function(name) { 
                            return /text/i.test(name); 
                        }),
                        effectLayers: layerNames.filter(function(name) { 
                            return /effect/i.test(name); 
                        }),
                        followsNamingConvention: layerNames.every(function(name) { 
                            return name.trim().length > 0 && name !== "Layer 1"; 
                        })
                    };
                }
            };
        },

        /**
         * UPDATED: Safe bullet style extraction using static method
         */
        bulletStyles: function (count?: number, defaultValue: string = "plain") {
            return {
                extract: function(layerDesc: ActionDescriptor): string[] {
                    return ActionDescriptorPath.extractTextStyleValues<string>(
                        layerDesc, "paragraphStyle.listStyleType", "enumerated", count || 4, defaultValue
                    );
                }
            };
        },

        /**
         * ADVANCED: Search-based filter analysis
         */
        filterAnalysis: function () {
            return {
                extract: function(layerDesc: ActionDescriptor) {
                    try {
                        var filterExtractor = new ListValueExtractor(
                            ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                            "brightness",
                            "integer",
                            { skipErrors: true, defaultValue: 0 }
                        );
                        
                        var brightnessValues = filterExtractor.extractAll<number>(layerDesc);
                        
                        var contrastExtractor = new ListValueExtractor(
                            ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                            "contrast",
                            "integer",
                            { skipErrors: true, defaultValue: 0 }
                        );
                        
                        var contrastValues = contrastExtractor.extractAll<number>(layerDesc);
                        
                        return {
                            brightnessValues: brightnessValues,
                            contrastValues: contrastValues,
                            activeFilters: brightnessValues.filter(function(v) { return v !== 0; }).length +
                                         contrastValues.filter(function(v) { return v !== 0; }).length,
                            hasBrightness: brightnessValues.some(function(v) { return v > 0; }),
                            hasContrast: contrastValues.some(function(v) { return v !== 0; })
                        };
                    } catch (error) {
                        return {
                            brightnessValues: [],
                            contrastValues: [],
                            activeFilters: 0,
                            hasBrightness: false,
                            hasContrast: false
                        };
                    }
                }
            };
        }
    };
};

/**
 * Enhanced common extraction patterns with search capabilities
 */
var CommonExtractions = {
    /**
     * Extract basic document properties
     */
    documentProperties: function (d?: ActionDescriptor) {
        if (!d) {
            var r = new ActionReference();
            r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            d = executeActionGet(r);
        }
        
        return {
            width: ActionDescriptorPath.create()
                .value('width', 'integer')
                .defaultTo(0)
                .extract<number>(d),
            height: ActionDescriptorPath.create()
                .value('height', 'integer')
                .defaultTo(0)
                .extract<number>(d),
            layerCount: ActionDescriptorPath.create().getLayerCount()
        };
    },

    /**
     * UPDATED: Safe text properties extraction
     */
    textProperties: function (d?: ActionDescriptor) {
        if (!d) {
            var r = new ActionReference();
            r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            d = executeActionGet(r);
        }
        
        return {
            content: ActionDescriptorPath.create()
                .object("textKey")
                .value('textKey', 'string')
                .defaultTo("")
                .extract<string>(d),
            fontFamily: P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(d),
            fontSize: P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(d),
            alignment: ActionDescriptorPath.create()
                .object("textKey")
                .list("paragraphStyleRange")
                .at(0)
                .object("paragraphStyle")
                .value("alignment", "enumerated")
                .defaultTo("left")
                .extract<string>(d)
        };
    },

    /**
     * Enhanced filter properties with search capabilities
     */
    filterProperties: function (d?: ActionDescriptor) {
        if (!d) {
            var r = new ActionReference();
            r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            d = executeActionGet(r);
        }
        
        // Use ListExtractor for robust filter analysis
        try {
            var filterExtractor = new ListValueExtractor(
                ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                "brightness",
                "integer",
                { skipErrors: true, defaultValue: 0 }
            );
            
            var brightnessValues = filterExtractor.extractAll<number>(d);
            var primaryBrightness = 0;
            for (var i = 0; i < brightnessValues.length; i++) {
                if (brightnessValues[i] !== 0) {
                    primaryBrightness = brightnessValues[i];
                    break;
                }
            }
            
            var contrastExtractor = new ListValueExtractor(
                ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                "contrast",
                "integer",
                { skipErrors: true, defaultValue: 0 }
            );
            
            var contrastValues = contrastExtractor.extractAll<number>(d);
            var primaryContrast = 0;
            for (var i = 0; i < contrastValues.length; i++) {
                if (contrastValues[i] !== 0) {
                    primaryContrast = contrastValues[i];
                    break;
                }
            }
            
            return {
                brightness: primaryBrightness,
                contrast: primaryContrast,
                allBrightnessValues: brightnessValues,
                allContrastValues: contrastValues,
                activeFilterCount: brightnessValues.filter(function(v) { return v !== 0; }).length +
                                 contrastValues.filter(function(v) { return v !== 0; }).length
            };
        } catch (error) {
            return {
                brightness: 0,
                contrast: 0,
                allBrightnessValues: [],
                allContrastValues: [],
                activeFilterCount: 0
            };
        }
    },

    /**
     * Extract all layer names (safe method)
     */
    allLayerNames: function (d?: ActionDescriptor): string[] {
        return ActionDescriptorPath.create().extractAllLayerNames();
    },

    /**
     * SAFER: Layer analysis with search patterns
     */
    layerAnalysis: function (d?: ActionDescriptor) {
        var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
        
        var backgroundLayer: any = null;
        for (var i = 0; i < layerNames.length; i++) {
            if (/background/i.test(layerNames[i])) {
                backgroundLayer = layerNames[i];
                break;
            }
        }
        
        return {
            names: layerNames,
            count: layerNames.length,
            backgroundLayer: backgroundLayer,
            textLayers: layerNames.filter(function(name) { 
                return /text/i.test(name); 
            }),
            effectLayers: layerNames.filter(function(name) { 
                return /effect/i.test(name); 
            }),
            hasProperNaming: layerNames.every(function(name) { 
                return name.trim().length > 0 && name !== "Layer 1"; 
            })
        };
    },

    /**
     * UPDATED: Safe bullet point analysis using static method
     */
    bulletPointAnalysis: function (d?: ActionDescriptor, count?: number) {
        if (!d) {
            var r = new ActionReference();
            r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            d = executeActionGet(r);
        }
        
        var bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
            d, "paragraphStyle.listStyleType", "enumerated", count || 4, "plain"
        );
        
        return {
            styles: bulletStyles,
            hasBullets: bulletStyles.indexOf("bullet") !== -1,
            hasNumbered: bulletStyles.indexOf("numbered") !== -1,
            bulletCount: bulletStyles.filter(function(style) { return style === "bullet"; }).length,
            numberedCount: bulletStyles.filter(function(style) { return style === "numbered"; }).length,
            mixedFormatting: bulletStyles.indexOf("bullet") !== -1 && bulletStyles.indexOf("numbered") !== -1
        };
    },

    /**
     * ADVANCED: Font analysis across all layers
     */
    fontAnalysisAcrossLayers: function () {
        var fonts: string[] = [];
        var sizes: number[] = [];
        var layerCount = ActionDescriptorPath.create().getLayerCount();
        
        for (var i = 1; i <= layerCount; i++) {
            try {
                var lRef = new ActionReference();
                lRef.putIndex(charIDToTypeID("Lyr "), i);
                var lDesc = executeActionGet(lRef);
                
                var fontName = P.textStyle('fontName', 'string', 0).tryExtract<string>(lDesc);
                var fontSize = P.textStyle('sizeKey', 'double', 0).tryExtract<number>(lDesc);
                
                if (fontName && fontName !== "") fonts.push(fontName);
                if (fontSize && fontSize > 0) sizes.push(fontSize);
            } catch (error) {
                // Continue processing
            }
        }
        
        var uniqueFonts = fonts.filter(function(font, index) {
            return fonts.indexOf(font) === index;
        });
        
        return {
            allFonts: fonts,
            uniqueFonts: uniqueFonts,
            allSizes: sizes,
            hasArial: fonts.indexOf('Arial') !== -1,
            hasHelvetica: fonts.indexOf('Helvetica') !== -1,
            averageSize: sizes.length > 0 ? Math.round(sizes.reduce(function(sum, size) { 
                return sum + size; 
            }, 0) / sizes.length) : 12,
            fontConsistency: uniqueFonts.length <= 2,
            sizeConsistency: sizes.length > 1 ? (Math.max.apply(Math, sizes) - Math.min.apply(Math, sizes)) <= 4 : true
        };
    }
};

/**
 * Utility function to create document reference
 */
var createDocumentReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(r);
};

/**
 * Utility function to create layer reference
 */
var createLayerReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(r);
};

/**
 * ADVANCED: Search-based extraction utilities
 */
var SearchUtilities = {
    /**
     * Find layer by name pattern (safer than index-based access)
     */
    findLayerByPattern: function (pattern: string | RegExp): string | null {
        var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
        
        for (var i = 0; i < layerNames.length; i++) {
            var name = layerNames[i];
            var matches = typeof pattern === 'string' ? 
                name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1 :
                pattern.test(name);
                
            if (matches) return name;
        }
        
        return null;
    },

    /**
     * Find filter with specific property value
     */
    findFilterWithProperty: function (property: string, type: string, predicate: (value: any) => boolean): any {
        var layerCount = ActionDescriptorPath.create().getLayerCount();
        
        for (var i = 1; i <= layerCount; i++) {
            try {
                var lRef = new ActionReference();
                lRef.putIndex(charIDToTypeID("Lyr "), i);
                var lDesc = executeActionGet(lRef);
                
                var filterExtractor = new ListValueExtractor(
                    ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                    property,
                    type as any,
                    { skipErrors: true }
                );
                
                var values = filterExtractor.extractAll(lDesc);
                for (var j = 0; j < values.length; j++) {
                    if (predicate(values[j])) {
                        return values[j];
                    }
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        return null;
    },

    /**
     * Find text style with specific property
     */
    findTextStyleWithProperty: function (property: string, type: string, predicate: (value: any) => boolean): any {
        var layerCount = ActionDescriptorPath.create().getLayerCount();
        
        for (var i = 1; i <= layerCount; i++) {
            try {
                var lRef = new ActionReference();
                lRef.putIndex(charIDToTypeID("Lyr "), i);
                var lDesc = executeActionGet(lRef);
                
                var textStyles = ActionDescriptorPath.extractTextStyleValues(
                    lDesc, property, type as any, 10, null
                );
                
                for (var j = 0; j < textStyles.length; j++) {
                    if (textStyles[j] !== undefined && textStyles[j] !== null && predicate(textStyles[j])) {
                        return textStyles[j];
                    }
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        return null;
    }
};