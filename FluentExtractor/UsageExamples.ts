/**
 * Usage examples for the Fluent Photoshop Document Scoring API
 * Shows how to extract values for assignment to answer objects
 */

// === BASIC USAGE EXAMPLES ===

function basicValueExtraction() {
  // Setup: Get the document descriptor
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
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

    // Extract with transformation
    fontSize: ActionDescriptorPath.create()
      .object("text")
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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  var d = executeActionGet(r);

  var answers = {
    // Using convenient P.bounds() factory
    leftBound: P.bounds('left').extract<number>(d),
    topBound: P.bounds('top').extract<number>(d),
    rightBound: P.bounds('right').extract<number>(d),
    bottomBound: P.bounds('bottom').extract<number>(d),

    // Using P.textStyle() factory  
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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  var d = executeActionGet(r);

  // Extract exactly 4 bullet point styles as tuple
  var bulletStyleExtractor = ActionDescriptorPath.create()
    .object("text")
    .list("paragraphStyleRange")
    .extractAsTuple("paragraphStyle.listStyleType", "enumerated", 4, "none");
  var bulletResults = bulletStyleExtractor.extractAsTuple<[string, string, string, string]>(d, 4, "none");
  var bullet1 = bulletResults[0];
  var bullet2 = bulletResults[1];
  var bullet3 = bulletResults[2];
  var bullet4 = bulletResults[3];

  // Extract 3 layer names as tuple
  var layerNameExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAsTuple("name", "string", 3, "Unnamed Layer");
  var layerResults = layerNameExtractor.extractAsTuple<[string, string, string]>(d, 3, "Unnamed Layer");
  var layer1Name = layerResults[0];
  var layer2Name = layerResults[1];
  var layer3Name = layerResults[2];

  // Extract font sizes for first 4 text layers
  var fontSizeExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAsTuple("text.textStyleRange.0.textStyle.sizeKey", "double", 4, 12.0);
  var fontSizeResults = fontSizeExtractor.round(1).extractAsTuple<[number, number, number, number]>(d, 4, 12.0);
  var fontSize1 = fontSizeResults[0];
  var fontSize2 = fontSizeResults[1];
  var fontSize3 = fontSizeResults[2];
  var fontSize4 = fontSizeResults[3];

  // Extract opacity values for exactly 5 layers
  var opacityExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAsTuple("opacity", "double", 5, 1.0);
  var opacityResults = opacityExtractor.toPercentage().round().extractAsTuple<[number, number, number, number, number]>(d, 5, 100);
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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  var d = executeActionGet(r);

  // SCENARIO 1: Extract all bullet points (unknown quantity) as object
  var bulletStyleExtractor = ActionDescriptorPath.create()
    .object("text")
    .list("paragraphStyleRange")
    .extractAllAsObject("paragraphStyle.listStyleType", "enumerated", "bullet");
  var bulletStyles = bulletStyleExtractor.extractAllAsObject<Record<string, string>>(d, "bullet");

  // Result: { bullet1: "bullet", bullet2: "numbered", bullet3: "bullet" }
  // Can destructure: const { bullet1, bullet2, bullet3 } = bulletStyles;

  // SCENARIO 2: Extract all layer names (unknown quantity) as array but ensure minimum 3
  var layerNameExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAllWithMinimum("name", "string", 3, "Missing Layer");
  var layerNames = layerNameExtractor.extractAllWithMinimum<string>(d, 3, "Missing Layer");

  // If document has 2 layers, result: ["Layer 1", "Layer 2", "Missing Layer"]
  // If document has 5 layers, result: ["Layer 1", "Layer 2", "Layer 3", "Layer 4", "Layer 5"]

  // SCENARIO 3: Extract all font names but limit to first 6
  var fontExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAllUpTo("text.textStyleRange.0.textStyle.fontName", "string", 6);
  var fontNames = fontExtractor.extractAllUpTo<string>(d, 6);

  // Result: ["Arial", "Helvetica", "Times", "Courier", "Georgia", "Verdana"] (max 6)

  // SCENARIO 4: Extract all filter brightness values as dynamic tuple
  var brightnessExtractor = ActionDescriptorPath.create()
    .object("smartObjectMore")
    .list("filterFXList")
    .extractAllAsDynamicTuple("filter.brightness", "integer", 8, 0);
  var allBrightness = brightnessExtractor.extractAllAsDynamicTuple<number>(d, 8, 0);

  // Can destructure unknown quantity (padded to 8):
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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  var d = executeActionGet(r);

  // Method 1: Object destructuring with dynamic keys
  var bulletExtractor = ActionDescriptorPath.create()
    .object("text")
    .list("paragraphStyleRange")
    .extractAllAsObject("paragraphStyle.listStyleType", "enumerated", "style");
  var bulletObject = bulletExtractor.extractAllAsObject<Record<string, string>>(d, "style");

  // Destructure dynamically found items
  var style1 = bulletObject.style1 || "none";
  var style2 = bulletObject.style2 || "none";
  var style3 = bulletObject.style3 || "none";
  var style4 = bulletObject.style4 || "none";
  var style5 = bulletObject.style5 || "none";

  // Method 2: Array destructuring with rest operator
  var fontSizeExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAllAsDynamicTuple("text.textStyleRange.0.textStyle.sizeKey", "double", 10, 12.0);
  var allFontSizes = fontSizeExtractor.round(1).extractAllAsDynamicTuple<number>(d, 10, 12.0);

  // Extract first few, rest in array
  var firstSize = allFontSizes[0];
  var secondSize = allFontSizes[1];
  var thirdSize = allFontSizes[2];
  var restSizes = allFontSizes.slice(3);

  // Method 3: Metadata extraction for complex scenarios
  var layerExtractor = ActionDescriptorPath.create()
    .list("layers")
    .extractAllWithMetadata("name", "string");
  var layerMetadata = layerExtractor.extractAllWithMetadata<string>(d);

  // layerMetadata = {
  //   values: ["Background", "Text", "Effects"],
  //   count: 3,
  //   indices: [0, 1, 2],
  //   isEmpty: false,
  //   hasMinimum: (min) => count >= min
  // }

  var hasEnoughLayers = layerMetadata.hasMinimum(3);
  var firstLayer = layerMetadata.values[0];
  var secondLayer = layerMetadata.values[1];
  var thirdLayer = layerMetadata.values[2];

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
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
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

  // Pattern 3: Extract with default defined in path
  var fontSize = ActionDescriptorPath.create()
    .object("text")
    .list("textStyleRange")
    .at(0)
    .object("textStyle")
    .value("sizeKey", "double")
    .defaultTo(12.0)
    .extract<number>(d);

  // Pattern 4: Safe list extraction
  var layerNames = ActionDescriptorPath.create()
    .list("layers")
    .extractAll("name", "string")
    .skipErrors("Unnamed")
    .extractAll<string>(d);

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
  // Get document reference
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  var d = executeActionGet(r);

  // Extract RGB color values as tuple - simplified for ES5
  var textColorResult = ActionDescriptorPath.create()
    .object("text")
    .list("textStyleRange")
    .at(0)
    .object("textStyle")
    .object("color")
    .extractOr(d, [0, 0, 0]);

  // Calculate average opacity - ES5 compatible
  var opacities = ActionDescriptorPath.create()
    .list("layers")
    .extractAll("opacity", "double")
    .toPercentage()
    .skipErrors(100)
    .extractAll<number>(d);

  var averageOpacity = 100;
  if (opacities.length > 0) {
    var sum = 0;
    for (var i = 0; i < opacities.length; i++) {
      sum += opacities[i];
    }
    averageOpacity = Math.round(sum / opacities.length);
  }

  // Check for Arial font - ES5 compatible
  var hasArialFont = ActionDescriptorPath.create()
    .list("layers")
    .extractFirst("text.textStyleRange.0.textStyle.fontName", "string", function (font: string) { return font === "Arial"; })
    .extractFirst<string>(d) !== null;

  // Extract all values for comprehensive scoring
  var answers: TestAnswers = {
    // Basic document dimensions (converted from points to pixels)
    documentWidth: P.bounds('width').extract<number>(d),
    documentHeight: P.bounds('height').extract<number>(d),

    // Text layer properties
    textContent: P.textStyle('text', 'string', 0)
      .defaultTo("No text found")
      .extract<string>(d),

    fontFamily: P.textStyle('fontName', 'string', 0)
      .defaultTo("Unknown")
      .extract<string>(d),

    fontSize: P.textStyle('sizeKey', 'double', 0)
      .round(1)
      .defaultTo(12)
      .extract<number>(d),

    // Extract RGB color values as tuple
    textColor: textColorResult as [number, number, number],

    // Filter effect values
    brightnessValue: P.filter('brightness', 'integer', 0)
      .defaultTo(0)
      .extract<number>(d),

    contrastValue: P.filter('contrast', 'integer', 0)
      .defaultTo(0)
      .extract<number>(d),

    // List extractions
    allLayerNames: ActionDescriptorPath.create()
      .list("layers")
      .extractAll("name", "string")
      .skipErrors("Unnamed Layer")
      .extractAll<string>(d),

    bulletPointStyles: ActionDescriptorPath.create()
      .object("text")
      .list("paragraphStyleRange")
      .extractWhere("paragraphStyle.listStyleType", "enumerated", function (style: string) { return style.indexOf("bullet") !== -1; })
      .extractAll<string>(d),

    layerCount: ActionDescriptorPath.create()
      .list("layers")
      .getCount(d),

    // Advanced calculations
    averageOpacity: averageOpacity,
    hasArialFont: hasArialFont,
    filterCount: ActionDescriptorPath.create()
      .object("smartObjectMore")
      .list("filterFXList")
      .getCount(d)
  };

  return answers;
}