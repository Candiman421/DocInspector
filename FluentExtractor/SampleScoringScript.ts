/**
 * Production-ready Photoshop Test Scoring Script
 * Uses current ActionManager patterns with emphasis on robust, search-based extraction
 * UPDATED: Reflects current method signatures and safer extraction patterns
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

interface TestSpecification {
  name: string;
  description: string;
  expectedAnswers: ExpectedAnswers;
  tolerance?: number;
}

interface ExpectedAnswers {
  documentWidth: number;
  documentHeight: number;
  textContent: string;
  primaryFontFamily: string;
  averageFontSize: number;
  activeBrightnessFilters: number;
  hasContrastFilter: boolean;
  bulletPointsUsed: boolean;
  numberedListsUsed: boolean;
  backgroundLayerExists: boolean;
  textLayerCount: number;
  hasArialFont: boolean;
  minimumOpacity: number;
  layerNamingConvention: boolean;
}

interface CandidateAnswers {
  documentWidth: number;
  documentHeight: number;
  textContent: string;
  primaryFontFamily: string;
  averageFontSize: number;
  activeBrightnessFilters: number;
  hasContrastFilter: boolean;
  bulletPointsUsed: boolean;
  numberedListsUsed: boolean;
  backgroundLayerExists: boolean;
  textLayerCount: number;
  hasArialFont: boolean;
  averageOpacity: number;
  layerNamingConvention: boolean;
  layerCount: number;
  
  // Detailed analysis
  allLayerNames: string[];
  fontAnalysis: FontAnalysis;
  filterAnalysis: FilterAnalysis;
}

interface FontAnalysis {
  fontsUsed: string[];
  sizesUsed: number[];
  primaryFont: string;
  hasConsistentSizing: boolean;
  hasArial: boolean;
}

interface FilterAnalysis {
  brightnessValues: number[];
  contrastValues: number[];
  activeFilterCount: number;
  filterTypes: string[];
}

interface ScoringResults {
  candidateAnswers: CandidateAnswers;
  score: number;
  maxPoints: number;
  passed: boolean;
  feedback: TestFeedback[];
}

interface TestFeedback {
  property: string;
  expected: any;
  actual: any;
  points: number;
  maxPoints: number;
  passed: boolean;
  message: string;
}

class PhotoshopTestScorer {
  private testSpec: TestSpecification;

  constructor(testSpec: TestSpecification) {
    this.testSpec = testSpec;
  }

  scoreDocument(): ScoringResults {
    try {
      var candidateAnswers = this.extractCandidateAnswers();
      var feedback = this.evaluateAnswers(candidateAnswers);

      var totalPoints = 0;
      var maxPoints = 0;
      for (var i = 0; i < feedback.length; i++) {
        totalPoints += feedback[i].points;
        maxPoints += feedback[i].maxPoints;
      }
      var score = Math.round((totalPoints / maxPoints) * 100);

      return {
        candidateAnswers: candidateAnswers,
        score: score,
        maxPoints: maxPoints,
        passed: score >= 70,
        feedback: feedback
      };
    } catch (error) {
      var err = error as Error;
      throw new Error("Scoring failed: " + err.message);
    }
  }

  private extractCandidateAnswers(): CandidateAnswers {
    // Get document descriptor for document properties
    var docRef = new ActionReference();
    docRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var docDesc = executeActionGet(docRef);

    // Get layer descriptor for current layer properties
    var layerRef = new ActionReference();
    layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var layerDesc = executeActionGet(layerRef);

    // ROBUST: Extract layer names safely
    var allLayerNames = ActionDescriptorPath.create().extractAllLayerNames();
    
    // SEARCH-BASED: Analyze layers by pattern instead of index
    var layerAnalysis = this.analyzeLayerStructure(allLayerNames);
    
    // ADVANCED: Font analysis across all layers
    var fontAnalysis = this.extractFontAnalysis();
    
    // ADVANCED: Filter analysis across all layers
    var filterAnalysis = this.extractFilterAnalysis();
    
    // SAFE: Extract text properties from current layer
    var textContent = ActionDescriptorPath.create()
      .object("textKey")
      .value("textKey", "string")
      .defaultTo("No text found")
      .extract<string>(layerDesc);

    // UPDATED: Use static method for bullet analysis
    var bulletStyles = ActionDescriptorPath.extractTextStyleValues<string>(
      layerDesc, "paragraphStyle.listStyleType", "enumerated", 10, "plain"
    );
    
    var bulletAnalysis = this.analyzeBulletStyles(bulletStyles);

    // ROBUST: Calculate average opacity across all layers
    var averageOpacity = this.calculateAverageOpacity();

    return {
      // Document properties
      documentWidth: P.bounds('width').extractOr(docDesc, 0),
      documentHeight: P.bounds('height').extractOr(docDesc, 0),

      // Text properties
      textContent: textContent,
      primaryFontFamily: fontAnalysis.primaryFont,
      averageFontSize: Math.round(fontAnalysis.sizesUsed.reduce(function(sum, size) { 
        return sum + size; 
      }, 0) / (fontAnalysis.sizesUsed.length || 1)),

      // Filter properties (search-based)
      activeBrightnessFilters: filterAnalysis.brightnessValues.filter(function(v) { return v > 0; }).length,
      hasContrastFilter: filterAnalysis.contrastValues.some(function(v) { return v !== 0; }),

      // Bullet analysis
      bulletPointsUsed: bulletAnalysis.hasBullets,
      numberedListsUsed: bulletAnalysis.hasNumbered,

      // Layer analysis (search-based)
      backgroundLayerExists: layerAnalysis.hasBackground,
      textLayerCount: layerAnalysis.textLayerCount,
      hasArialFont: fontAnalysis.hasArial,
      layerNamingConvention: layerAnalysis.followsConvention,

      // Calculated properties
      averageOpacity: averageOpacity,
      layerCount: allLayerNames.length,

      // Detailed analysis
      allLayerNames: allLayerNames,
      fontAnalysis: fontAnalysis,
      filterAnalysis: filterAnalysis
    };
  }

  private analyzeLayerStructure(layerNames: string[]) {
    return {
      hasBackground: layerNames.some(function(name) { 
        return /background/i.test(name); 
      }),
      textLayerCount: layerNames.filter(function(name) { 
        return /text/i.test(name); 
      }).length,
      followsConvention: layerNames.every(function(name) { 
        return name.trim().length > 0 && name !== "Layer 1"; 
      })
    };
  }

  private extractFontAnalysis(): FontAnalysis {
    var fonts: string[] = [];
    var sizes: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= layerCount; i++) {
      try {
        var lRef = new ActionReference();
        lRef.putIndex(charIDToTypeID("Lyr "), i);
        var lDesc = executeActionGet(lRef);
        
        // Use safe extraction methods
        var fontName = P.textStyle('fontName', 'string', 0).tryExtract<string>(lDesc);
        var fontSize = P.textStyle('sizeKey', 'double', 0).tryExtract<number>(lDesc);
        
        if (fontName && fontName !== "") {
          fonts.push(fontName);
        }
        if (fontSize && fontSize > 0) {
          sizes.push(fontSize);
        }
      } catch (error) {
        // Continue processing other layers
      }
    }
    
    // Analyze font consistency
    var uniqueFonts = fonts.filter(function(font, index) {
      return fonts.indexOf(font) === index;
    });
    
    var sizeVariation = sizes.length > 1 ? 
      Math.max.apply(Math, sizes) - Math.min.apply(Math, sizes) : 0;
    
    return {
      fontsUsed: uniqueFonts,
      sizesUsed: sizes,
      primaryFont: fonts[0] || "Unknown",
      hasConsistentSizing: sizeVariation <= 2,
      hasArial: fonts.indexOf('Arial') !== -1
    };
  }

  private extractFilterAnalysis(): FilterAnalysis {
    var brightnessValues: number[] = [];
    var contrastValues: number[] = [];
    var filterTypes: string[] = [];
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
          { skipErrors: true, defaultValue: 0 }
        );
        
        var layerBrightness = filterExtractor.extractAll<number>(lDesc);
        brightnessValues = brightnessValues.concat(layerBrightness);
        
        // Extract contrast values
        var contrastExtractor = new ListValueExtractor(
          ActionDescriptorPath.create().object("smartObjectMore").list("filterFXList"),
          "contrast",
          "integer",
          { skipErrors: true, defaultValue: 0 }
        );
        
        var layerContrast = contrastExtractor.extractAll<number>(lDesc);
        contrastValues = contrastValues.concat(layerContrast);
        
      } catch (error) {
        // Continue processing other layers
      }
    }
    
    return {
      brightnessValues: brightnessValues,
      contrastValues: contrastValues,
      activeFilterCount: brightnessValues.filter(function(v) { return v !== 0; }).length + 
                        contrastValues.filter(function(v) { return v !== 0; }).length,
      filterTypes: [] // Could be extended to detect filter types
    };
  }

  private analyzeBulletStyles(bulletStyles: string[]) {
    return {
      hasBullets: bulletStyles.indexOf("bullet") !== -1,
      hasNumbered: bulletStyles.indexOf("numbered") !== -1,
      bulletCount: bulletStyles.filter(function(style) { return style === "bullet"; }).length,
      numberedCount: bulletStyles.filter(function(style) { return style === "numbered"; }).length
    };
  }

  private calculateAverageOpacity(): number {
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
          .round()
          .defaultTo(100)
          .extract<number>(lDesc);
        
        opacities.push(opacity);
      } catch (error) {
        opacities.push(100);
      }
    }
    
    return opacities.length > 0 ? 
      Math.round(opacities.reduce(function(sum, op) { return sum + op; }, 0) / opacities.length) : 
      100;
  }

  private evaluateAnswers(candidate: CandidateAnswers): TestFeedback[] {
    var feedback: TestFeedback[] = [];
    var expected = this.testSpec.expectedAnswers;
    var tolerance = this.testSpec.tolerance || 1;

    // Document dimensions
    feedback.push(this.evaluateNumeric("documentWidth", candidate.documentWidth, expected.documentWidth, tolerance, 10));
    feedback.push(this.evaluateNumeric("documentHeight", candidate.documentHeight, expected.documentHeight, tolerance, 10));

    // Text properties
    feedback.push(this.evaluateString("textContent", candidate.textContent, expected.textContent, 10));
    feedback.push(this.evaluateString("primaryFontFamily", candidate.primaryFontFamily, expected.primaryFontFamily, 10));
    feedback.push(this.evaluateNumeric("averageFontSize", candidate.averageFontSize, expected.averageFontSize, tolerance, 10));

    // Filter analysis (search-based evaluation)
    feedback.push(this.evaluateNumeric("activeBrightnessFilters", candidate.activeBrightnessFilters, expected.activeBrightnessFilters, 0, 15));
    feedback.push(this.evaluateBoolean("hasContrastFilter", candidate.hasContrastFilter, expected.hasContrastFilter, 15));

    // Formatting analysis
    feedback.push(this.evaluateBoolean("bulletPointsUsed", candidate.bulletPointsUsed, expected.bulletPointsUsed, 10));
    feedback.push(this.evaluateBoolean("numberedListsUsed", candidate.numberedListsUsed, expected.numberedListsUsed, 10));

    // Layer structure (search-based evaluation)
    feedback.push(this.evaluateBoolean("backgroundLayerExists", candidate.backgroundLayerExists, expected.backgroundLayerExists, 10));
    feedback.push(this.evaluateNumeric("textLayerCount", candidate.textLayerCount, expected.textLayerCount, 0, 10));
    feedback.push(this.evaluateBoolean("hasArialFont", candidate.hasArialFont, expected.hasArialFont, 10));
    feedback.push(this.evaluateBoolean("layerNamingConvention", candidate.layerNamingConvention, expected.layerNamingConvention, 5));

    // Quality metrics
    feedback.push(this.evaluateMinimum("averageOpacity", candidate.averageOpacity, expected.minimumOpacity, 5));

    return feedback;
  }

  private evaluateNumeric(property: string, actual: number, expected: number, tolerance: number, maxPoints: number): TestFeedback {
    var passed = Math.abs(actual - expected) <= tolerance;
    var points = passed ? maxPoints : 0;

    return {
      property: property,
      expected: expected,
      actual: actual,
      points: points,
      maxPoints: maxPoints,
      passed: passed,
      message: passed
        ? "✅ " + property + ": " + actual + " (expected: " + expected + ")"
        : "❌ " + property + ": " + actual + " (expected: " + expected + ", tolerance: ±" + tolerance + ")"
    };
  }

  private evaluateString(property: string, actual: string, expected: string, maxPoints: number): TestFeedback {
    var passed = actual === expected;
    var points = passed ? maxPoints : 0;

    return {
      property: property,
      expected: expected,
      actual: actual,
      points: points,
      maxPoints: maxPoints,
      passed: passed,
      message: passed
        ? "✅ " + property + ": \"" + actual + "\""
        : "❌ " + property + ": \"" + actual + "\" (expected: \"" + expected + "\")"
    };
  }

  private evaluateBoolean(property: string, actual: boolean, expected: boolean, maxPoints: number): TestFeedback {
    var passed = actual === expected;
    var points = passed ? maxPoints : 0;

    return {
      property: property,
      expected: expected,
      actual: actual,
      points: points,
      maxPoints: maxPoints,
      passed: passed,
      message: passed
        ? "✅ " + property + ": " + actual
        : "❌ " + property + ": " + actual + " (expected: " + expected + ")"
    };
  }

  private evaluateMinimum(property: string, actual: number, minimum: number, maxPoints: number): TestFeedback {
    var passed = actual >= minimum;
    var points = passed ? maxPoints : 0;

    return {
      property: property,
      expected: "≥ " + minimum,
      actual: actual,
      points: points,
      maxPoints: maxPoints,
      passed: passed,
      message: passed
        ? "✅ " + property + ": " + actual + " (minimum: " + minimum + ")"
        : "❌ " + property + ": " + actual + " (minimum required: " + minimum + ")"
    };
  }
}

// Updated test configuration emphasizing search-based evaluation
var sampleTest: TestSpecification = {
  name: "Photoshop Professional Layout Test - Search-Based Evaluation",
  description: "Create a document with proper structure, evaluated using robust pattern matching",
  expectedAnswers: {
    documentWidth: 800,
    documentHeight: 600,
    textContent: "Professional Design",
    primaryFontFamily: "Arial",
    averageFontSize: 24,
    activeBrightnessFilters: 2,
    hasContrastFilter: true,
    bulletPointsUsed: true,
    numberedListsUsed: true,
    backgroundLayerExists: true,
    textLayerCount: 3,
    hasArialFont: true,
    minimumOpacity: 75,
    layerNamingConvention: true
  },
  tolerance: 2
};

// Usage function with enhanced error reporting
function runAdvancedScoringExample() {
  try {
    var scorer = new PhotoshopTestScorer(sampleTest);
    var results = scorer.scoreDocument();

    console.log("\n=== " + sampleTest.name + " Results ===");
    console.log("Score: " + results.score + "% (" + (results.passed ? 'PASSED' : 'FAILED') + ")");
    console.log("Layer Analysis: " + results.candidateAnswers.layerCount + " layers found");
    console.log("Font Analysis: " + results.candidateAnswers.fontAnalysis.fontsUsed.join(", "));
    console.log("Filter Analysis: " + results.candidateAnswers.filterAnalysis.activeFilterCount + " active filters");
    
    // Detailed feedback
    console.log("\n=== Detailed Feedback ===");
    for (var i = 0; i < results.feedback.length; i++) {
      console.log(results.feedback[i].message);
    }
    
    return results;
  } catch (error) {
    var err = error as Error;
    console.error('Scoring failed: ' + err.message);
    throw error;
  }
}