/**
 * FIXED Sample Photoshop Test Scoring Script
 * Uses corrected ActionManager patterns and fixed PathAccessor methods
 * All method calls updated to match main file signatures
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
  fontFamily: string;
  fontSize: number;
  brightnessValue: number;
  contrastValue: number;
  bullet1Style: string;
  bullet2Style: string;
  bullet3Style: string;
  bullet4Style: string;
  layer1Name: string;
  layer2Name: string;
  layer3Name: string;
  textLayer1Font: string;
  textLayer2Font: string;
  textLayer3Font: string;
  fontSize1: number;
  fontSize2: number;
  fontSize3: number;
  opacity1: number;
  opacity2: number;
  opacity3: number;
  minimumOpacity: number;
  mustHaveArialFont: boolean;
}

interface CandidateAnswers {
  documentWidth: number;
  documentHeight: number;
  textContent: string;
  fontFamily: string;
  fontSize: number;
  brightnessValue: number;
  contrastValue: number;
  bullet1Style: string;
  bullet2Style: string;
  bullet3Style: string;
  bullet4Style: string;
  layer1Name: string;
  layer2Name: string;
  layer3Name: string;
  textLayer1Font: string;
  textLayer2Font: string;
  textLayer3Font: string;
  fontSize1: number;
  fontSize2: number;
  fontSize3: number;
  opacity1: number;
  opacity2: number;
  opacity3: number;
  averageOpacity: number;
  hasArialFont: boolean;
  layerCount: number;
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

    // Extract layer names using corrected method
    var layerNames = ActionDescriptorPath.create().extractLayerTuple(3, "Unnamed Layer");
    var layer1Name = layerNames[0];
    var layer2Name = layerNames[1];
    var layer3Name = layerNames[2];

    // FIXED: Extract bullet styles from current text layer using corrected method signature
    var bulletStyles = ActionDescriptorPath.create().extractTextStyleValues<string>(
      layerDesc, "paragraphStyle.listStyleType", "enumerated", 4, "plain"
    );
    var bullet1Style = bulletStyles[0];
    var bullet2Style = bulletStyles[1];
    var bullet3Style = bulletStyles[2];
    var bullet4Style = bulletStyles[3];

    // Extract font information from multiple layers
    var fontInfo = this.extractFontInformation();
    var textLayer1Font = fontInfo.fonts[0];
    var textLayer2Font = fontInfo.fonts[1];
    var textLayer3Font = fontInfo.fonts[2];
    var fontSize1 = fontInfo.sizes[0];
    var fontSize2 = fontInfo.sizes[1];
    var fontSize3 = fontInfo.sizes[2];

    // Extract opacity information
    var opacityInfo = this.extractOpacityInformation();
    var opacity1 = opacityInfo[0];
    var opacity2 = opacityInfo[1];
    var opacity3 = opacityInfo[2];

    return {
      // Document properties using correct reference
      documentWidth: ActionDescriptorPath.create()
        .value("width", "integer")
        .extract<number>(docDesc),
      
      documentHeight: ActionDescriptorPath.create()
        .value("height", "integer")
        .extract<number>(docDesc),

      // Current layer text properties using textKey
      textContent: ActionDescriptorPath.create()
        .object("textKey")
        .value("textKey", "string")
        .defaultTo("No text found")
        .extract<string>(layerDesc),

      fontFamily: P.textStyle('fontName', 'string', 0)
        .defaultTo("Unknown")
        .extract<string>(layerDesc),

      fontSize: P.textStyle('size', 'double', 0)
        .round(1)
        .defaultTo(12)
        .extract<number>(layerDesc),

      // Filter effects
      brightnessValue: P.filter('brightness', 'integer', 0)
        .defaultTo(0)
        .extract<number>(layerDesc),

      contrastValue: P.filter('contrast', 'integer', 0)
        .defaultTo(0)
        .extract<number>(layerDesc),

      // Individual extracted values
      bullet1Style: bullet1Style,
      bullet2Style: bullet2Style,
      bullet3Style: bullet3Style,
      bullet4Style: bullet4Style,

      layer1Name: layer1Name,
      layer2Name: layer2Name,
      layer3Name: layer3Name,

      textLayer1Font: textLayer1Font,
      textLayer2Font: textLayer2Font,
      textLayer3Font: textLayer3Font,

      fontSize1: fontSize1,
      fontSize2: fontSize2,
      fontSize3: fontSize3,

      opacity1: opacity1,
      opacity2: opacity2,
      opacity3: opacity3,

      // Advanced calculations
      averageOpacity: this.calculateAverageOpacity(),
      hasArialFont: this.checkForArialFont(),
      layerCount: ActionDescriptorPath.create().getLayerCount()
    };
  }

  private extractFontInformation(): { fonts: string[]; sizes: number[] } {
    var fonts: string[] = [];
    var sizes: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= Math.min(3, layerCount); i++) {
      try {
        // Use correct layer reference pattern
        var layerRef = new ActionReference();
        layerRef.putIndex(charIDToTypeID("Lyr "), i);
        var layerDesc = executeActionGet(layerRef);
        
        var fontName = P.textStyle('fontName', 'string', 0)
          .defaultTo("Unknown")
          .extract<string>(layerDesc);
        
        var fontSize = P.textStyle('size', 'double', 0)
          .round(1)
          .defaultTo(12)
          .extract<number>(layerDesc);
        
        fonts.push(fontName);
        sizes.push(fontSize);
      } catch (error) {
        fonts.push("Unknown");
        sizes.push(12);
      }
    }
    
    while (fonts.length < 3) {
      fonts.push("Unknown");
      sizes.push(12);
    }
    
    return { fonts: fonts, sizes: sizes };
  }

  private extractOpacityInformation(): number[] {
    var results: number[] = [];
    var layerCount = ActionDescriptorPath.create().getLayerCount();
    
    for (var i = 1; i <= Math.min(3, layerCount); i++) {
      try {
        // Use correct layer reference pattern
        var layerRef = new ActionReference();
        layerRef.putIndex(charIDToTypeID("Lyr "), i);
        var layerDesc = executeActionGet(layerRef);
        
        var opacity = ActionDescriptorPath.create()
          .value("opacity", "double")
          .toPercentage()
          .round()
          .extract<number>(layerDesc);
        
        results.push(opacity);
      } catch (error) {
        results.push(100);
      }
    }
    
    while (results.length < 3) {
      results.push(100);
    }
    
    return results;
  }

  private calculateAverageOpacity(): number {
    var opacities = this.extractOpacityInformation();
    var sum = 0;
    for (var i = 0; i < opacities.length; i++) {
      sum += opacities[i];
    }
    return Math.round(sum / opacities.length);
  }

  private checkForArialFont(): boolean {
    var fontInfo = this.extractFontInformation();
    for (var i = 0; i < fontInfo.fonts.length; i++) {
      if (fontInfo.fonts[i] === "Arial") {
        return true;
      }
    }
    return false;
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
    feedback.push(this.evaluateString("fontFamily", candidate.fontFamily, expected.fontFamily, 10));
    feedback.push(this.evaluateNumeric("fontSize", candidate.fontSize, expected.fontSize, tolerance, 10));

    // Filter effects
    feedback.push(this.evaluateNumeric("brightnessValue", candidate.brightnessValue, expected.brightnessValue, tolerance, 15));
    feedback.push(this.evaluateNumeric("contrastValue", candidate.contrastValue, expected.contrastValue, tolerance, 15));

    // Individual evaluations
    feedback.push(this.evaluateString("bullet1Style", candidate.bullet1Style, expected.bullet1Style, 5));
    feedback.push(this.evaluateString("bullet2Style", candidate.bullet2Style, expected.bullet2Style, 5));
    feedback.push(this.evaluateString("bullet3Style", candidate.bullet3Style, expected.bullet3Style, 5));
    feedback.push(this.evaluateString("bullet4Style", candidate.bullet4Style, expected.bullet4Style, 5));

    feedback.push(this.evaluateString("layer1Name", candidate.layer1Name, expected.layer1Name, 5));
    feedback.push(this.evaluateString("layer2Name", candidate.layer2Name, expected.layer2Name, 5));
    feedback.push(this.evaluateString("layer3Name", candidate.layer3Name, expected.layer3Name, 5));

    feedback.push(this.evaluateString("textLayer1Font", candidate.textLayer1Font, expected.textLayer1Font, 5));
    feedback.push(this.evaluateString("textLayer2Font", candidate.textLayer2Font, expected.textLayer2Font, 5));
    feedback.push(this.evaluateString("textLayer3Font", candidate.textLayer3Font, expected.textLayer3Font, 5));

    feedback.push(this.evaluateNumeric("fontSize1", candidate.fontSize1, expected.fontSize1, tolerance, 5));
    feedback.push(this.evaluateNumeric("fontSize2", candidate.fontSize2, expected.fontSize2, tolerance, 5));
    feedback.push(this.evaluateNumeric("fontSize3", candidate.fontSize3, expected.fontSize3, tolerance, 5));

    feedback.push(this.evaluateNumeric("opacity1", candidate.opacity1, expected.opacity1, tolerance, 3));
    feedback.push(this.evaluateNumeric("opacity2", candidate.opacity2, expected.opacity2, tolerance, 3));
    feedback.push(this.evaluateNumeric("opacity3", candidate.opacity3, expected.opacity3, tolerance, 3));

    feedback.push(this.evaluateMinimum("averageOpacity", candidate.averageOpacity, expected.minimumOpacity, 5));
    feedback.push(this.evaluateBoolean("hasArialFont", candidate.hasArialFont, expected.mustHaveArialFont, 5));

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

// Sample test configuration
var sampleTest: TestSpecification = {
  name: "Photoshop Layout Test - Individual Item Requirements",
  description: "Create a 800x600px document with specific formatting requirements",
  expectedAnswers: {
    documentWidth: 800,
    documentHeight: 600,
    textContent: "Hello World",
    fontFamily: "Arial",
    fontSize: 24,
    brightnessValue: 25,
    contrastValue: 15,
    bullet1Style: "bullet",
    bullet2Style: "bullet",
    bullet3Style: "numbered",
    bullet4Style: "numbered",
    layer1Name: "Background",
    layer2Name: "Text Layer",
    layer3Name: "Effects Layer",
    textLayer1Font: "Arial",
    textLayer2Font: "Helvetica",
    textLayer3Font: "Times",
    fontSize1: 24,
    fontSize2: 18,
    fontSize3: 14,
    opacity1: 100,
    opacity2: 75,
    opacity3: 50,
    minimumOpacity: 25,
    mustHaveArialFont: true
  },
  tolerance: 2
};

// Usage function
function runScoringExample() {
  try {
    var scorer = new PhotoshopTestScorer(sampleTest);
    var results = scorer.scoreDocument();

    console.log("\n=== " + sampleTest.name + " Results ===");
    console.log("Score: " + results.score + "% (" + (results.passed ? 'PASSED' : 'FAILED') + ")");
    
    return results;
  } catch (error) {
    var err = error as Error;
    console.error('Scoring failed: ' + err.message);
    throw error;
  }
}