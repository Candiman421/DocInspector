/**
 * Usage examples for the Fluent Photoshop Document Scoring API
 * Demonstrates value extraction patterns with emphasis on robust, search-based approaches
 * UPDATED: Reflects current method signatures and safer extraction patterns
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

// === BASIC VALUE EXTRACTION (RECOMMENDED PATTERNS) ===

function basicValueExtraction() {
    // Setup using correct layer reference pattern
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    var answers = {
        // PRIMARY PATTERN: Direct fluent extraction
        brightness: ActionDescriptorPath.create()
            .object("smartObjectMore")
            .list("filterFXList")
            .at(0)
            .value("brightness", "integer")
            .extract<number>(d),

        // SAFER PATTERN: Search for filter instead of assuming index 0
        contrastSafe: P.findFilter("contrast", "integer")
            .extract<number>(d) || 0,

        // Factory function with transformations
        fontSize: P.textStyle("sizeKey", "double", 0)
            .round(1)
            .extract<number>(d),

        // Unit conversion with bounds checking
        layerWidth: P.bounds("width")
            .extract<number>(d),

        // Safe extraction with fallbacks
        opacity: ActionDescriptorPath.create()
            .value("opacity", "double")
            .toPercentage()
            .round()
            .defaultTo(100)
            .extract<number>(d)
    };

    console.log("Extracted values:", answers);
    return answers;
}

// === TUPLE EXTRACTION (CURRENT SIGNATURES) ===

function tupleExtractions() {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    // Extract multiple values as tuple using ActionDescriptorNavigator
    var navigator = ActionDescriptorNavigator.from(r);
    var filterObject = navigator.object("smartObjectMore").list("filterFXList").getObject(0);
    var filterValues = filterObject.getValues([
        { key: "brightness", type: "integer" },
        { key: "contrast", type: "integer" }
    ]);
    var brightness = filterValues[0];
    var contrast = filterValues[1];

    // Extract bounds as destructured object
    var boundsObject = ActionDescriptorNavigator.from(r).getValuesAsObject({
        left: { key: "bounds.left", type: "double", options: { transformer: Math.floor } },
        top: { key: "bounds.top", type: "double", options: { transformer: Math.floor } },
        width: { key: "bounds.width", type: "double", options: { transformer: Math.floor } },
        height: { key: "bounds.height", type: "double", options: { transformer: Math.floor } }
    });

    return { 
        brightness: brightness, 
        contrast: contrast, 
        bounds: boundsObject 
    };
}

// === SAFER FACTORY FUNCTION PATTERNS ===

function factoryFunctionExamples() {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    var answers = {
        // RECOMMENDED: Use factory functions with built-in safety
        leftBound: P.bounds('left').extract<number>(d),
        topBound: P.bounds('top').extract<number>(d),

        // Text style extraction - safer than manual navigation
        fontName: P.textStyle('fontName', 'string', 0).extract<string>(d),
        fontSize: P.textStyle('sizeKey', 'double', 0).round(1).extract<number>(d),

        // SAFER: Search-based filter extraction
        primaryFilter: P.findFilter('brightness', 'integer', function(value) {
            return value > 0; // Find first active brightness filter
        }).extract<number>(d),

        // Fallback to indexed if needed, but with error handling
        filterBrightness: P.filter('brightness', 'integer', 0)
            .defaultTo(0)
            .extract<number>(d)
    };

    return answers;
}

// === SEARCH-BASED EXTRACTION (RECOMMENDED OVER INDEXING) ===

function searchBasedExamples() {
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // RECOMMENDED: Search for layers by name pattern instead of index
    var backgroundLayer = P.findLayer(/background/i).extract();
    var textLayer = P.findLayer("text").extract();

    // RECOMMENDED: Search for text styles by property instead of index
    var arialFont = P.findTextStyle('fontName', 'string', function(fontName) {
        return fontName === 'Arial';
    }).extract<string>(layerDesc);

    // RECOMMENDED: Search for active filters instead of assuming index
    var activeFilters = P.findFilter('enabled', 'boolean', function(enabled) {
        return enabled === true;
    });

    // SAFER: Extract all layer names without assumptions
    var allLayerNames = ActionDescriptorPath.create().extractAllLayerNames();

    // RECOMMENDED: Use predicate-based list extraction
    var listExtractor = new ListValueExtractor(
        ActionDescriptorPath.create().object('smartObjectMore').list('filterFXList'),
        'brightness',
        'integer',
        { skipErrors: true }
    );

    var brightFilters = listExtractor.extractWhere(layerDesc, function(brightness, index) {
        return brightness > 25;
    });

    return {
        backgroundLayer: backgroundLayer,
        textLayer: textLayer,
        arialFont: arialFont,
        allLayerNames: allLayerNames,
        brightFilters: brightFilters
    };
}

// === ROBUST LIST EXTRACTION (AVOIDING BRITTLE INDEXING) ===

function robustListExtraction() {
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // UPDATED: Use static method with proper signature
    var bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "plain"
    );

    // SAFER: Use search instead of fixed indices for bullet evaluation
    var bulletAnalysis = {
        bulletCount: bulletStyles.filter(function(style) { return style === "bullet"; }).length,
        numberedCount: bulletStyles.filter(function(style) { return style === "numbered"; }).length,
        mixed: bulletStyles.indexOf("bullet") !== -1 && bulletStyles.indexOf("numbered") !== -1
    };

    // ADVANCED: Use ListExtractor for complex analysis
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
    var layerAnalysis = {
        totalLayers: layerNames.length,
        hasBackground: layerNames.some(function(name) { 
            return name.toLowerCase().indexOf('background') !== -1; 
        }),
        textLayers: layerNames.filter(function(name) { 
            return name.toLowerCase().indexOf('text') !== -1; 
        }),
        effectLayers: layerNames.filter(function(name) { 
            return name.toLowerCase().indexOf('effect') !== -1; 
        })
    };

    // ROBUST: Extract font information with error tolerance
    var fontAnalysis: Array<{layer: number; fontName: string; fontSize: number}> = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= layerCount; i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            
            // Use try/catch for each property
            var fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
            var fontSize = P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(lDesc);
            
            if (fontName && fontName !== "Unknown" && fontSize && fontSize !== 12) {
                fontAnalysis.push({
                    layer: i,
                    fontName: fontName,
                    fontSize: fontSize
                });
            }
        } catch (error) {
            // Continue processing other layers
        }
    }

    return {
        bulletAnalysis: bulletAnalysis,
        layerAnalysis: layerAnalysis,
        fontAnalysis: fontAnalysis
    };
}

// === ERROR-RESILIENT PATTERNS ===

function errorResilientPatterns() {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    // PATTERN 1: tryExtract with null coalescing
    var brightness = ActionDescriptorPath.create()
        .object("smartObjectMore")
        .list("filterFXList")
        .at(0)
        .value("brightness", "integer")
        .tryExtract<number>(d) ?? 0;

    // PATTERN 2: extractOr with fallback
    var contrast = ActionDescriptorPath.create()
        .object("smartObjectMore")
        .list("filterFXList")
        .at(0)
        .value("contrast", "integer")
        .extractOr(d, 0);

    // PATTERN 3: defaultTo in path
    var fontSize = P.textStyle("sizeKey", "double", 0)
        .round(1)
        .defaultTo(12)
        .extract<number>(d);

    // PATTERN 4: Safe layer extraction
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();

    // PATTERN 5: Advanced error handling with ListExtractor
    var safeExtractor = new ListValueExtractor(
        ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
        "brightness",
        "integer",
        { skipErrors: true, defaultValue: 0 }
    );

    var allBrightness = safeExtractor.extractAll<number>(d);

    return { 
        brightness: brightness, 
        contrast: contrast, 
        fontSize: fontSize, 
        layerNames: layerNames,
        allBrightness: allBrightness 
    };
}

// === COMPREHENSIVE REAL-WORLD EXAMPLE ===

interface TestAnswers {
    // Document properties
    documentWidth: number;
    documentHeight: number;
    
    // Text properties (search-based)
    hasArialFont: boolean;
    primaryFontName: string;
    averageFontSize: number;
    
    // Filter properties (search-based)
    activeBrightnessFilters: number[];
    hasContrastFilter: boolean;
    
    // Layer analysis (robust)
    layerCount: number;
    backgroundLayerExists: boolean;
    textLayerCount: number;
    
    // Bullet analysis (safe extraction)
    bulletPointCount: number;
    numberedListCount: number;
    mixedListFormatting: boolean;
}

function comprehensiveExample(): TestAnswers {
    // Document properties
    var docRef = new ActionReference();
    docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var docDesc = executeActionGet(docRef);

    // Layer properties
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // SEARCH-BASED font analysis
    var fontAnalysis = analyzeFontsAcrossLayers();
    
    // SEARCH-BASED filter analysis
    var filterAnalysis = analyzeFiltersAcrossLayers();
    
    // ROBUST layer analysis
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
    var layerAnalysis = {
        total: layerNames.length,
        hasBackground: layerNames.some(function(name) { 
            return /background/i.test(name); 
        }),
        textLayers: layerNames.filter(function(name) { 
            return /text/i.test(name); 
        }).length
    };

    // SAFE bullet analysis using static method
    var bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 10, "plain"
    );
    
    var bulletAnalysis = {
        bulletCount: bulletStyles.filter(function(style) { return style === "bullet"; }).length,
        numberedCount: bulletStyles.filter(function(style) { return style === "numbered"; }).length,
        mixed: bulletStyles.indexOf("bullet") !== -1 && bulletStyles.indexOf("numbered") !== -1
    };

    return {
        // Document dimensions
        documentWidth: P.bounds('width').extractOr(docDesc, 0),
        documentHeight: P.bounds('height').extractOr(docDesc, 0),

        // Font analysis (search-based)
        hasArialFont: fontAnalysis.hasArial,
        primaryFontName: fontAnalysis.primaryFont,
        averageFontSize: fontAnalysis.averageSize,

        // Filter analysis (search-based)
        activeBrightnessFilters: filterAnalysis.brightnessValues,
        hasContrastFilter: filterAnalysis.hasContrast,

        // Layer analysis (robust)
        layerCount: layerAnalysis.total,
        backgroundLayerExists: layerAnalysis.hasBackground,
        textLayerCount: layerAnalysis.textLayers,

        // Bullet analysis (safe)
        bulletPointCount: bulletAnalysis.bulletCount,
        numberedListCount: bulletAnalysis.numberedCount,
        mixedListFormatting: bulletAnalysis.mixed
    };
}

// === HELPER FUNCTIONS FOR ROBUST ANALYSIS ===

function analyzeFontsAcrossLayers() {
    var fonts: string[] = [];
    var sizes: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= layerCount; i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            
            var fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
            var fontSize = P.textStyle('sizeKey', 'double', 0).defaultTo(12).extract<number>(lDesc);
            
            if (fontName && fontName !== "Unknown") fonts.push(fontName);
            if (fontSize && fontSize > 0 && fontSize !== 12) sizes.push(fontSize);
        } catch (error) {
            // Continue processing
        }
    }
    
    return {
        hasArial: fonts.indexOf('Arial') !== -1,
        primaryFont: fonts[0] || 'Unknown',
        averageSize: sizes.length > 0 ? Math.round(sizes.reduce(function(sum, size) { 
            return sum + size; 
        }, 0) / sizes.length) : 12
    };
}

function analyzeFiltersAcrossLayers() {
    var brightnessValues: number[] = [];
    var hasContrast = false;
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= layerCount; i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            
            // Use ListExtractor for robust filter analysis
            var filterExtractor = new ListValueExtractor(
                ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
                "brightness",
                "integer",
                { skipErrors: true }
            );
            
            var layerBrightness = filterExtractor.extractAll<number>(lDesc);
            brightnessValues = brightnessValues.concat(layerBrightness.filter(function(b) { return b > 0; }));
            
            // Check for contrast filter
            var contrastFilter = P.filter("contrast", "integer", 0).defaultTo(0).extract<number>(lDesc);
            if (contrastFilter && contrastFilter !== 0) {
                hasContrast = true;
            }
        } catch (error) {
            // Continue processing
        }
    }
    
    return {
        brightnessValues: brightnessValues,
        hasContrast: hasContrast
    };
}