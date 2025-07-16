/**
 * Usage examples for the Fluent Photoshop Document Scoring API
 * Shows how to extract values for assignment to answer objects
 * FIXED: All method calls updated to match corrected signatures in main files
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

// === BASIC USAGE EXAMPLES ===

function basicValueExtraction() {
    // Setup using correct layer reference pattern
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    // Example 1: Extract simple values directly
    var answers = {
        // Path-based extraction (your preferred method)
        brightness: ActionDescriptorPath.create()
            .object("smartObjectMore")
            .list("filterFXList")
            .at(0)
            .value("brightness", "integer")
            .extract<number>(d),

        contrast: ActionDescriptorPath.create()
            .object("smartObjectMore")
            .list("filterFXList")
            .at(0)
            .value("contrast", "integer")
            .extract<number>(d),

        // Extract with transformation using corrected textKey
        fontSize: ActionDescriptorPath.create()
            .object("textKey")
            .list("textStyleRange")
            .at(0)
            .object("textStyle")
            .value("sizeKey", "double")
            .round(1)
            .extract<number>(d),

        // Extract with unit conversion
        layerWidth: ActionDescriptorPath.create()
            .object("bounds")
            .value("width", "double")
            .toPixels("pt")
            .floor()
            .extract<number>(d),

        // Extract with fallback default
        opacity: ActionDescriptorPath.create()
            .object("layerEffects")
            .value("opacity", "double")
            .toPercentage()
            .round()
            .defaultTo(100)
            .extract<number>(d)
    };

    console.log("Extracted values:", answers);
    return answers;
}

// === TUPLE AND DESTRUCTURED VALUE EXAMPLES ===

function tupleExtractions() {
    // Use correct layer reference
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    // Extract multiple values as tuple
    var navigator = ActionDescriptorNavigator.from(r);
    var filterObject = navigator.object("smartObjectMore").list("filterFXList").getObject(0);
    var filterValues = filterObject.getValues([
        { key: "brightness", type: "integer" },
        { key: "contrast", type: "integer" }
    ]);
    var brightness = filterValues[0];
    var contrast = filterValues[1];

    // Extract bounds as destructured object
    var boundsObject = ActionDescriptorNavigator.from(r).object("bounds").getValuesAsObject({
        left: { key: "left", type: "double", options: { transformer: Math.floor } },
        top: { key: "top", type: "double", options: { transformer: Math.floor } },
        width: { key: "width", type: "double", options: { transformer: Math.floor } },
        height: { key: "height", type: "double", options: { transformer: Math.floor } }
    });
    var left = boundsObject.left;
    var top = boundsObject.top;
    var width = boundsObject.width;
    var height = boundsObject.height;

    return { brightness: brightness, contrast: contrast, left: left, top: top, width: width, height: height };
}

// === CONVENIENT FACTORY FUNCTION USAGE ===

function factoryFunctionExamples() {
    // Use correct layer reference
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    var answers = {
        // Using convenient P.bounds() factory
        leftBound: P.bounds('left').extract<number>(d),
        topBound: P.bounds('top').extract<number>(d),
        rightBound: P.bounds('right').extract<number>(d),
        bottomBound: P.bounds('bottom').extract<number>(d),

        // Using P.textStyle() factory with corrected textKey navigation
        fontName: P.textStyle('fontName', 'string', 0).extract<string>(d),
        fontSize: P.textStyle('sizeKey', 'double', 0).round(1).extract<number>(d),

        // Using P.filter() factory
        filterBrightness: P.filter('brightness', 'integer', 0).extract<number>(d),
        filterContrast: P.filter('contrast', 'integer', 0).extract<number>(d)
    };

    return answers;
}

// === TUPLE DESTRUCTURING FOR LISTS ===

function tupleDestructuringExamples() {
    // Use correct document reference for document-level properties
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var d = executeActionGet(r);

    // Use correct layer reference for layer properties
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // FIXED: Extract exactly 4 bullet point styles using corrected method signature
    var bulletResults = ActionDescriptorPath.create().extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "none"
    );
    var bullet1 = bulletResults[0];
    var bullet2 = bulletResults[1];
    var bullet3 = bulletResults[2];
    var bullet4 = bulletResults[3];

    // Extract 3 layer names using corrected method
    var layerResults = ActionDescriptorPath.create().extractLayerTuple(3, "Unnamed Layer");
    var layer1Name = layerResults[0];
    var layer2Name = layerResults[1];
    var layer3Name = layerResults[2];

    // Extract font sizes using proper layer iteration with type safety
    var fontSizeResults: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    for (var i = 1; i <= Math.min(4, layerCount); i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var fontSize = P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12.0).extract<number>(lDesc);
            fontSizeResults.push(fontSize);
        } catch (error) {
            fontSizeResults.push(12.0);
        }
    }
    while (fontSizeResults.length < 4) {
        fontSizeResults.push(12.0);
    }
    var fontSize1 = fontSizeResults[0];
    var fontSize2 = fontSizeResults[1];
    var fontSize3 = fontSizeResults[2];
    var fontSize4 = fontSizeResults[3];

    // Extract opacity values for exactly 5 layers with type safety
    var opacityResults: number[] = [];
    for (var i = 1; i <= Math.min(5, layerCount); i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var opacity = ActionDescriptorPath.create()
                .value("opacity", "double")
                .toPercentage()
                .round()
                .defaultTo(100)
                .extract<number>(lDesc);
            opacityResults.push(opacity);
        } catch (error) {
            opacityResults.push(100);
        }
    }
    while (opacityResults.length < 5) {
        opacityResults.push(100);
    }
    var op1 = opacityResults[0];
    var op2 = opacityResults[1];
    var op3 = opacityResults[2];
    var op4 = opacityResults[3];
    var op5 = opacityResults[4];

    return {
        bulletStyles: [bullet1, bullet2, bullet3, bullet4],
        layerNames: [layer1Name, layer2Name, layer3Name],
        fontSizes: [fontSize1, fontSize2, fontSize3, fontSize4],
        opacities: [op1, op2, op3, op4, op5]
    };
}

// === DYNAMIC/UNKNOWN QUANTITY EXTRACTION ===

function dynamicListExtraction() {
    // Use correct document reference
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var d = executeActionGet(r);

    // For text properties, use layer reference
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // SCENARIO 1: Extract all bullet points from current text layer using corrected method
    var bulletStyles: Record<string, string> = {};
    var bulletResults = ActionDescriptorPath.create().extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 10, "plain"
    );
    
    for (var i = 0; i < bulletResults.length; i++) {
        bulletStyles["bullet" + (i + 1)] = bulletResults[i];
    }

    // SCENARIO 2: Extract all layer names using corrected method
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();

    // Ensure minimum 3 layers
    while (layerNames.length < 3) {
        layerNames.push("Missing Layer");
    }

    // Extract font names from up to 6 layers with proper typing
    var fontNames: string[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    for (var i = 1; i <= Math.min(6, layerCount); i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
            fontNames.push(fontName);
        } catch (error) {
            fontNames.push("Unknown");
        }
    }

    // SCENARIO 4: Extract filter brightness values with proper typing
    var allBrightness: number[] = [];
    try {
        var smartObjectMore = layerDesc.getObjectValue(stringIDToTypeID("smartObjectMore"));
        var filterFXList = smartObjectMore.getList(stringIDToTypeID("filterFXList"));
        
        for (var i = 0; i < Math.min(8, filterFXList.count); i++) {
            try {
                var filter = filterFXList.getObjectValue(i);
                var brightness = filter.getInteger(stringIDToTypeID("brightness"));
                allBrightness.push(brightness);
            } catch (error) {
                allBrightness.push(0);
            }
        }
    } catch (error) {
        // No filters found
    }

    // Pad to 8 elements
    while (allBrightness.length < 8) {
        allBrightness.push(0);
    }

    var bright1 = allBrightness[0];
    var bright2 = allBrightness[1];
    var bright3 = allBrightness[2];
    var bright4 = allBrightness[3];
    var bright5 = allBrightness[4];
    var bright6 = allBrightness[5];
    var bright7 = allBrightness[6];
    var bright8 = allBrightness[7];

    return {
        bulletStyles: bulletStyles,
        layerNames: layerNames,
        fontNames: fontNames,
        allBrightness: [bright1, bright2, bright3, bright4, bright5, bright6, bright7, bright8]
    };
}

// === DESTRUCTURING UNKNOWN QUANTITIES ===

function destructuringUnknownQuantities() {
    // Use correct document reference
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var d = executeActionGet(r);

    // Use layer reference for layer properties
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // Method 1: Object destructuring with dynamic keys using corrected method
    var bulletObject: Record<string, string> = {};
    var bulletResults = ActionDescriptorPath.create().extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 5, "none"
    );
    
    for (var i = 0; i < bulletResults.length; i++) {
        bulletObject["style" + (i + 1)] = bulletResults[i];
    }

    var style1 = bulletObject["style1"] || "none";
    var style2 = bulletObject["style2"] || "none";
    var style3 = bulletObject["style3"] || "none";
    var style4 = bulletObject["style4"] || "none";
    var style5 = bulletObject["style5"] || "none";

    // Method 2: Array with rest operator simulation with proper typing
    var allFontSizes: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    for (var i = 1; i <= Math.min(10, layerCount); i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var fontSize = P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12.0).extract<number>(lDesc);
            allFontSizes.push(fontSize);
        } catch (error) {
            allFontSizes.push(12.0);
        }
    }
    while (allFontSizes.length < 10) {
        allFontSizes.push(12.0);
    }

    var firstSize = allFontSizes[0];
    var secondSize = allFontSizes[1];
    var thirdSize = allFontSizes[2];
    var restSizes = allFontSizes.slice(3);

    // Method 3: Metadata extraction for complex scenarios with proper typing
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();
    var layerMetadata = {
        values: layerNames,
        count: layerNames.length,
        indices: [] as number[],
        isEmpty: layerNames.length === 0,
        hasMinimum: function (min: number) { return layerNames.length >= min; }
    };
    
    for (var i = 0; i < layerNames.length; i++) {
        layerMetadata.indices.push(i);
    }

    var hasEnoughLayers = layerMetadata.hasMinimum(3);
    var firstLayer = layerMetadata.values[0] || "Missing";
    var secondLayer = layerMetadata.values[1] || "Missing";
    var thirdLayer = layerMetadata.values[2] || "Missing";

    return {
        // Individual bullet styles (unknown quantity)
        bulletStyle1: style1,
        bulletStyle2: style2,
        bulletStyle3: style3,
        bulletStyle4: style4,
        bulletStyle5: style5,

        // Font sizes (first few individual, rest as array)
        primaryFontSize: firstSize,
        secondaryFontSize: secondSize,
        tertiaryFontSize: thirdSize,
        additionalFontSizes: restSizes,

        // Layer info
        backgroundLayer: firstLayer,
        mainTextLayer: secondLayer,
        effectsLayer: thirdLayer,
        layerCount: layerMetadata.count,
        hasMinimumLayers: hasEnoughLayers
    };
}

// === SAFE EXTRACTION PATTERNS ===

function safeExtractionPatterns() {
    // Use correct layer reference
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var d = executeActionGet(r);

    // Pattern 1: Try extraction with fallback
    var brightnessTry = ActionDescriptorPath.create()
        .object("smartObjectMore")
        .list("filterFXList")
        .at(0)
        .value("brightness", "integer")
        .tryExtract<number>(d);
    var brightness = brightnessTry !== null ? brightnessTry : 0; // null coalescing

    // Pattern 2: Extract with fallback value
    var contrast = ActionDescriptorPath.create()
        .object("smartObjectMore")
        .list("filterFXList")
        .at(0)
        .value("contrast", "integer")
        .extractOr(d, 0);

    // Pattern 3: Extract with default defined in path using corrected textKey
    var fontSize = ActionDescriptorPath.create()
        .object("textKey")
        .list("textStyleRange")
        .at(0)
        .object("textStyle")
        .value("sizeKey", "double")
        .defaultTo(12.0)
        .extract<number>(d);

    // Pattern 4: Safe layer extraction using corrected method
    var layerNames = ActionDescriptorPath.create().extractAllLayerNames();

    return { brightness: brightness, contrast: contrast, fontSize: fontSize, layerNames: layerNames };
}

// === COMPLEX REAL-WORLD SCORING EXAMPLE ===

interface TestAnswers {
    // Document properties
    documentWidth: number;
    documentHeight: number;

    // Text properties
    textContent: string;
    fontFamily: string;
    fontSize: number;
    textColor: [number, number, number]; // RGB values

    // Filter properties  
    brightnessValue: number;
    contrastValue: number;

    // List properties
    allLayerNames: string[];
    bulletPointStyles: string[];
    layerCount: number;

    // Advanced extractions
    averageOpacity: number;
    hasArialFont: boolean;
    filterCount: number;
}

function comprehensiveScoring(): TestAnswers {
    // Get document reference for document properties
    var docRef = new ActionReference();
    docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var docDesc = executeActionGet(docRef);

    // Get layer reference for layer properties
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // Extract RGB color values as tuple - simplified for ES5
    var textColorResult = ActionDescriptorPath.create()
        .object("textKey")
        .list("textStyleRange")
        .at(0)
        .object("textStyle")
        .object("color")
        .extractOr(layerDesc, [0, 0, 0]);

    // Calculate average opacity - ES5 compatible using corrected layer iteration with proper typing
    var opacities: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    for (var i = 1; i <= layerCount; i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var opacity = ActionDescriptorPath.create()
                .value("opacity", "double")
                .toPercentage()
                .defaultTo(100)
                .extract<number>(lDesc);
            opacities.push(opacity);
        } catch (error) {
            opacities.push(100);
        }
    }

    var averageOpacity = 100;
    if (opacities.length > 0) {
        var sum = 0;
        for (var i = 0; i < opacities.length; i++) {
            sum += opacities[i];
        }
        averageOpacity = Math.round(sum / opacities.length);
    }

    // Check for Arial font - ES5 compatible
    var hasArialFont = false;
    for (var i = 1; i <= layerCount; i++) {
        try {
            var lRef = new ActionReference();
            lRef.putIndex(charIDToTypeID("Lyr "), i);
            var lDesc = executeActionGet(lRef);
            var fontName = P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(lDesc);
            if (fontName === "Arial") {
                hasArialFont = true;
                break;
            }
        } catch (error) {
            // Continue checking
        }
    }

    // FIXED: Extract bullet point styles using corrected method signature
    var bulletPointStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
        layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "plain"
    );

    // Get filter count
    var filterCount = 0;
    try {
        var smartObjectMore = layerDesc.getObjectValue(stringIDToTypeID("smartObjectMore"));
        var filterFXList = smartObjectMore.getList(stringIDToTypeID("filterFXList"));
        filterCount = filterFXList.count;
    } catch (error) {
        filterCount = 0;
    }

    // Extract all values for comprehensive scoring
    var answers: TestAnswers = {
        // Basic document dimensions using document reference
        documentWidth: P.bounds('width').extractOr(docDesc, 0),
        documentHeight: P.bounds('height').extractOr(docDesc, 0),

        // Text layer properties using corrected textKey navigation
        textContent: P.textStyle('text', 'string', 0)
            .defaultTo("No text found")
            .extract<string>(layerDesc),

        fontFamily: P.textStyle('fontName', 'string', 0)
            .defaultTo("Unknown")
            .extract<string>(layerDesc),

        fontSize: P.textStyle('sizeKey', 'double', 0)
            .round(1)
            .defaultTo(12)
            .extract<number>(layerDesc),

        // Extract RGB color values as tuple
        textColor: textColorResult as [number, number, number],

        // Filter effect values
        brightnessValue: P.filter('brightness', 'integer', 0)
            .defaultTo(0)
            .extract<number>(layerDesc),

        contrastValue: P.filter('contrast', 'integer', 0)
            .defaultTo(0)
            .extract<number>(layerDesc),

        // List extractions using corrected methods
        allLayerNames: ActionDescriptorPath.create().extractAllLayerNames(),

        bulletPointStyles: bulletPointStyles,

        layerCount: layerCount,

        // Advanced calculations
        averageOpacity: averageOpacity,
        hasArialFont: hasArialFont,
        filterCount: filterCount
    };

    return answers;
}