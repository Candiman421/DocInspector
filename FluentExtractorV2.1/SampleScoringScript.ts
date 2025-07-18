/**
 * Sample Scoring Script: Movie Poster Design Assignment
 * 
 * Assignment Requirements:
 * 1. Document: 11x17 inches, 300 DPI, RGB color mode
 * 2. Title text: Use Arial Bold, 48pt or larger, positioned in upper third
 * 3. Tagline text: Use Arial Regular, 18-24pt, positioned below title
 * 4. Background layer: Must be named "background" and include gradient or solid color
 * 5. Movie image: Must be at least 400x300 pixels in dimensions
 * 6. Drop shadow effect: Apply to title text with 5-10px distance
 * 7. Outer glow effect: Apply to tagline with 3-8px size
 * 8. Color overlay: Apply to movie image with 20-40% opacity
 * 9. Layer organization: At least 5 layers total
 * 10. Overall opacity: No layer should be completely transparent (>10% opacity)
 * 
 * This script demonstrates real-world usage of the ActionDescriptor Navigation Framework
 * for automated scoring of student design assignments.
 */

import { stringIDToTypeID } from "./ps";
import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';
import { ActionDescriptorPath, P } from './PathAccessor';

// Scoring results interface with comprehensive measurements
interface ScoringResults {
    // Document requirements (30 points)
    documentWidth: number;          // Actual width in pixels
    documentHeight: number;         // Actual height in pixels  
    documentDPI: number;           // Actual DPI
    documentColorMode: string;     // Actual color mode
    correctDocumentSize: boolean;   // 10 points: 11x17 at 300 DPI
    correctColorMode: boolean;      // 5 points: RGB mode
    
    // Text requirements (25 points)
    titleFontName: string;         // Actual font used for title
    titleFontSize: number;         // Actual size in points
    taglineFontName: string;       // Actual font used for tagline
    taglineFontSize: number;       // Actual size in points
    correctTitleFont: boolean;     // 10 points: Arial Bold
    correctTitleSize: boolean;     // 5 points: 48pt or larger
    correctTaglineFont: boolean;   // 5 points: Arial Regular
    correctTaglineSize: boolean;   // 5 points: 18-24pt
    
    // Layout requirements (20 points)
    titlePositionY: number;        // Title Y position
    taglinePositionY: number;      // Tagline Y position
    movieImageWidth: number;       // Movie image width
    movieImageHeight: number;      // Movie image height
    titleInUpperThird: boolean;    // 5 points: Title in upper third
    taglineBelowTitle: boolean;    // 5 points: Tagline below title
    correctImageSize: boolean;     // 10 points: Image >= 400x300
    
    // Effects requirements (15 points)
    titleShadowDistance: number;   // Drop shadow distance on title
    taglineGlowSize: number;       // Outer glow size on tagline
    imageOverlayOpacity: number;   // Color overlay opacity on image
    correctTitleShadow: boolean;   // 5 points: 5-10px shadow
    correctTaglineGlow: boolean;   // 5 points: 3-8px glow
    correctImageOverlay: boolean;  // 5 points: 20-40% overlay
    
    // Organization requirements (10 points)
    backgroundLayerExists: boolean; // Background layer named "background"
    totalLayerCount: number;       // Total number of layers
    minOpacity: number;            // Lowest opacity found
    correctLayerCount: boolean;    // 5 points: At least 5 layers
    correctOpacities: boolean;     // 5 points: All layers >10% opacity
    
    // Summary scores
    totalPointsEarned: number;     // Sum of all earned points
    totalPointsPossible: number;   // Maximum possible points (100)
    percentageScore: number;       // Final percentage
}

/**
 * Main scoring function - coordinates all scoring operations
 */
function scoreMoviePosterAssignment(): ScoringResults {
    // Initialize results with sentinel values
    const results: ScoringResults = {
        // Document measurements
        documentWidth: -1,
        documentHeight: -1,
        documentDPI: -1,
        documentColorMode: "",
        correctDocumentSize: false,
        correctColorMode: false,
        
        // Text measurements
        titleFontName: "",
        titleFontSize: -1,
        taglineFontName: "",
        taglineFontSize: -1,
        correctTitleFont: false,
        correctTitleSize: false,
        correctTaglineFont: false,
        correctTaglineSize: false,
        
        // Layout measurements
        titlePositionY: -1,
        taglinePositionY: -1,
        movieImageWidth: -1,
        movieImageHeight: -1,
        titleInUpperThird: false,
        taglineBelowTitle: false,
        correctImageSize: false,
        
        // Effects measurements
        titleShadowDistance: -1,
        taglineGlowSize: -1,
        imageOverlayOpacity: -1,
        correctTitleShadow: false,
        correctTaglineGlow: false,
        correctImageOverlay: false,
        
        // Organization measurements
        backgroundLayerExists: false,
        totalLayerCount: -1,
        minOpacity: -1,
        correctLayerCount: false,
        correctOpacities: false,
        
        // Summary
        totalPointsEarned: 0,
        totalPointsPossible: 100,
        percentageScore: 0
    };
    
    try {
        // Score each section using the navigation framework
        scoreDocumentRequirements(results);
        scoreTextRequirements(results);
        scoreLayoutRequirements(results);
        scoreEffectsRequirements(results);
        scoreOrganizationRequirements(results);
        
        // Calculate final score
        calculateFinalScore(results);
        
    } catch (error) {
        console.log('Scoring error: ' + error);
        // Results remain at sentinel values for error cases
    }
    
    return results;
}

/**
 * Score document size, DPI, and color mode requirements
 * Uses ActionDescriptorNavigator.forCurrentDocument() with proper error handling
 */
function scoreDocumentRequirements(results: ScoringResults): void {
    const docNav = ActionDescriptorNavigator.forCurrentDocument();
    
    // Get document properties using getValue for consistent sentinel handling
    results.documentWidth = docNav.getValue('width', 'double');
    results.documentHeight = docNav.getValue('height', 'double');
    results.documentDPI = docNav.getValue('resolution', 'double');
    results.documentColorMode = docNav.getValue('mode', 'enumerated');
    
    // Check size requirements (11x17 inches at 300 DPI = 3300x5100 pixels)
    const expectedWidth = 11 * 300; // 3300 pixels
    const expectedHeight = 17 * 300; // 5100 pixels
    const tolerance = 50; // Allow 50 pixel tolerance for rounding
    
    results.correctDocumentSize = 
        Math.abs(results.documentWidth - expectedWidth) <= tolerance &&
        Math.abs(results.documentHeight - expectedHeight) <= tolerance &&
        Math.abs(results.documentDPI - 300) <= 10;
    
    // Check color mode (RGB mode can be represented various ways)
    const colorModeStr = results.documentColorMode.toLowerCase();
    results.correctColorMode = colorModeStr.indexOf('rgb') >= 0 || 
                              colorModeStr === '1' ||  // RGB mode ID
                              colorModeStr === 'rgbcolor';
}

/**
 * Score text font and size requirements using search-first approach
 * Demonstrates robust text layer identification and font searching
 */
function scoreTextRequirements(results: ScoringResults): void {
    // Get all layer names for text layer identification
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    // Search for title and tagline layers using name-based identification
    let titleLayerNav: ActionDescriptorNavigator | null = null;
    let taglineLayerNav: ActionDescriptorNavigator | null = null;
    
    for (let i = 0; i < layerNames.length; i++) {
        const layerName = layerNames[i].toLowerCase();
        
        // Look for title layer (various naming patterns)
        if ((layerName.indexOf('title') >= 0 || layerName.indexOf('heading') >= 0) && !titleLayerNav) {
            titleLayerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        }
        
        // Look for tagline layer (various naming patterns)
        if ((layerName.indexOf('tagline') >= 0 || layerName.indexOf('subtitle') >= 0 || 
             layerName.indexOf('subtext') >= 0) && !taglineLayerNav) {
            taglineLayerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        }
    }
    
    // Score title text requirements using search-first approach
    if (titleLayerNav) {
        // Check for text layer type
        const hasTextKey = titleLayerNav.hasKey('textKey');
        if (hasTextKey) {
            // Search for Arial Bold font in multiple naming variations
            const textNav = titleLayerNav.object('textKey');
            const styleList = textNav.list('textStyleRange');
            
            // Search through all text styles for Arial Bold
            let foundArialBold = false;
            let maxFontSize = -1;
            
            for (let styleIndex = 0; styleIndex < styleList.count && styleIndex < 10; styleIndex++) {
                const styleNav = styleList.getObject(styleIndex);
                const textStyleNav = styleNav.object('textStyle');
                
                const fontName = textStyleNav.getValue('fontName', 'string');
                const fontSize = textStyleNav.getValue('size', 'double');
                
                // Check for Arial Bold variations
                if (fontName.indexOf('Arial') >= 0 && 
                   (fontName.indexOf('Bold') >= 0 || fontName.indexOf('BoldMT') >= 0)) {
                    foundArialBold = true;
                    results.titleFontName = fontName;
                    if (fontSize > maxFontSize) {
                        maxFontSize = fontSize;
                    }
                }
            }
            
            results.correctTitleFont = foundArialBold;
            results.titleFontSize = maxFontSize;
            results.correctTitleSize = maxFontSize >= 48;
        }
    }
    
    // Score tagline text requirements using similar approach
    if (taglineLayerNav) {
        const hasTextKey = taglineLayerNav.hasKey('textKey');
        if (hasTextKey) {
            const textNav = taglineLayerNav.object('textKey');
            const styleList = textNav.list('textStyleRange');
            
            // Search for Arial Regular (not Bold)
            let foundArialRegular = false;
            let taglineFontSize = -1;
            
            for (let styleIndex = 0; styleIndex < styleList.count && styleIndex < 10; styleIndex++) {
                const styleNav = styleList.getObject(styleIndex);
                const textStyleNav = styleNav.object('textStyle');
                
                const fontName = textStyleNav.getValue('fontName', 'string');
                const fontSize = textStyleNav.getValue('size', 'double');
                
                // Check for Arial Regular (Arial without Bold)
                if (fontName.indexOf('Arial') >= 0 && fontName.indexOf('Bold') === -1) {
                    foundArialRegular = true;
                    results.taglineFontName = fontName;
                    taglineFontSize = fontSize;
                    break; // Use first Arial Regular found
                }
            }
            
            results.correctTaglineFont = foundArialRegular;
            results.taglineFontSize = taglineFontSize;
            results.correctTaglineSize = taglineFontSize >= 18 && taglineFontSize <= 24;
        }
    }
}

/**
 * Score layout and positioning requirements
 * Uses getBounds() with calculated width/height
 */
function scoreLayoutRequirements(results: ScoringResults): void {
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    const docNav = ActionDescriptorNavigator.forCurrentDocument();
    const docHeight = docNav.getValue('height', 'double');
    
    // Search through layers for title, tagline, and movie image
    for (let i = 0; i < layerNames.length; i++) {
        const layerName = layerNames[i].toLowerCase();
        const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        
        // Get bounds using corrected getBounds() method (calculates width/height)
        const bounds = layerNav.getBounds();
        
        // Check for title layer positioning
        if (layerName.indexOf('title') >= 0 && results.titlePositionY === -1) {
            results.titlePositionY = bounds.top;
        }
        
        // Check for tagline layer positioning
        if (layerName.indexOf('tagline') >= 0 && results.taglinePositionY === -1) {
            results.taglinePositionY = bounds.top;
        }
        
        // Look for movie image layer (largest content layer, excluding background)
        if ((layerName.indexOf('movie') >= 0 || layerName.indexOf('image') >= 0 || 
             layerName.indexOf('photo') >= 0 || layerName.indexOf('picture') >= 0) &&
            layerName.indexOf('background') === -1) {
            
            // Use the largest qualifying image found
            if (bounds.width > results.movieImageWidth && bounds.height > results.movieImageHeight) {
                results.movieImageWidth = bounds.width;   // Calculated: right - left
                results.movieImageHeight = bounds.height; // Calculated: bottom - top
            }
        }
    }
    
    // Check position requirements
    if (results.titlePositionY !== -1 && docHeight !== -1) {
        // Title should be in upper third of document
        results.titleInUpperThird = results.titlePositionY <= (docHeight / 3);
    }
    
    if (results.titlePositionY !== -1 && results.taglinePositionY !== -1) {
        // Tagline should be below title (higher Y value)
        results.taglineBelowTitle = results.taglinePositionY > results.titlePositionY;
    }
    
    // Check image size requirement (at least 400x300 pixels)
    results.correctImageSize = results.movieImageWidth >= 400 && results.movieImageHeight >= 300;
}

/**
 * Score visual effects requirements using search-first filter approach
 * Demonstrates filter searching by name across multiple layers
 */
function scoreEffectsRequirements(results: ScoringResults): void {
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    
    // Search each layer for required effects
    for (let i = 0; i < layerNames.length; i++) {
        const layerName = layerNames[i].toLowerCase();
        const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        
        // Check title layer for drop shadow effect
        if (layerName.indexOf('title') >= 0) {
            // Search for Drop Shadow effect using multiple property names
            let shadowDistance = searchForEffectProperty(layerNav, 'Drop Shadow', [
                'distance', 'localLightingDistance', 'shadowDistance'
            ]);
            
            if (shadowDistance !== -1) {
                results.titleShadowDistance = shadowDistance;
                results.correctTitleShadow = shadowDistance >= 5 && shadowDistance <= 10;
            }
        }
        
        // Check tagline layer for outer glow effect
        if (layerName.indexOf('tagline') >= 0) {
            // Search for Outer Glow effect using multiple property names
            let glowSize = searchForEffectProperty(layerNav, 'Outer Glow', [
                'blur', 'chokeMatte', 'glowSize', 'size'
            ]);
            
            if (glowSize !== -1) {
                results.taglineGlowSize = glowSize;
                results.correctTaglineGlow = glowSize >= 3 && glowSize <= 8;
            }
        }
        
        // Check movie image layer for color overlay
        if ((layerName.indexOf('movie') >= 0 || layerName.indexOf('image') >= 0) &&
            layerName.indexOf('background') === -1) {
            
            // Search for Color Overlay effect
            let overlayOpacity = searchForEffectProperty(layerNav, 'Color Overlay', [
                'opacity', 'overlayOpacity'
            ]);
            
            // If no color overlay found, check layer blend mode opacity
            if (overlayOpacity === -1) {
                overlayOpacity = layerNav.getValue('opacity', 'double');
                // Only consider as overlay if opacity is in overlay range
                if (overlayOpacity < 20 || overlayOpacity > 40) {
                    overlayOpacity = -1;
                }
            }
            
            if (overlayOpacity !== -1) {
                results.imageOverlayOpacity = overlayOpacity;
                results.correctImageOverlay = overlayOpacity >= 20 && overlayOpacity <= 40;
            }
        }
    }
}

/**
 * Helper function to search for effect properties using multiple property names
 * Demonstrates robust effect searching patterns
 */
function searchForEffectProperty(layerNav: ActionDescriptorNavigator, effectName: string, propertyNames: string[]): number {
    // Check if layer has effects
    if (!layerNav.hasKey('layerEffects') && !layerNav.hasKey('layerFXVisible')) {
        return -1;
    }
    
    // Try to access effects list
    const effectsNav = layerNav.object('layerEffects');
    if (!effectsNav) return -1;
    
    // Search through multiple possible effect list names
    const possibleEffectLists = ['dropShadow', 'outerGlow', 'colorOverlay', 'layerEffects'];
    
    for (let listIndex = 0; listIndex < possibleEffectLists.length; listIndex++) {
        const effectList = effectsNav.list(possibleEffectLists[listIndex]);
        
        for (let effectIndex = 0; effectIndex < effectList.count && effectIndex < 10; effectIndex++) {
            const effect = effectList.getObject(effectIndex);
            const name = effect.getValue('name', 'string');
            
            if (name.indexOf(effectName) >= 0) {
                // Found the effect, now search for the property
                for (let propIndex = 0; propIndex < propertyNames.length; propIndex++) {
                    const value = effect.getValue(propertyNames[propIndex], 'double');
                    if (value !== -1) {
                        return value;
                    }
                }
            }
        }
    }
    
    return -1; // Effect or property not found
}

/**
 * Score layer organization requirements
 * Demonstrates layer enumeration and opacity checking
 */
function scoreOrganizationRequirements(results: ScoringResults): void {
    // Get all layer information using safe extraction
    const layerNames = ActionDescriptorNavigator.extractAllLayerNames();
    results.totalLayerCount = layerNames.length;
    
    // Check for background layer using flexible name matching
    for (let i = 0; i < layerNames.length; i++) {
        const layerName = layerNames[i].toLowerCase();
        if (layerName === 'background' || layerName.indexOf('background') >= 0 || 
            layerName.indexOf('bg ') >= 0 || layerName === 'bg') {
            results.backgroundLayerExists = true;
            break;
        }
    }
    
    // Check all layer opacities to find minimum
    let minOpacity = 100; // Start with maximum possible
    for (let i = 0; i < layerNames.length; i++) {
        const layerNav = ActionDescriptorNavigator.forLayerByIndex(i + 1); // 1-based indexing
        const opacity = layerNav.getValue('opacity', 'double');
        
        // Only consider valid opacity values
        if (opacity !== -1 && opacity >= 0 && opacity <= 100) {
            if (opacity < minOpacity) {
                minOpacity = opacity;
            }
        }
    }
    
    results.minOpacity = minOpacity;
    
    // Check organization requirements
    results.correctLayerCount = results.totalLayerCount >= 5;
    results.correctOpacities = results.minOpacity > 10; // No layer completely transparent
}

/**
 * Calculate final score based on all requirements
 * Demonstrates comprehensive scoring logic
 */
function calculateFinalScore(results: ScoringResults): void {
    let points = 0;
    
    // Document requirements (30 points total)
    if (results.correctDocumentSize) points += 25; // Major requirement
    if (results.correctColorMode) points += 5;
    
    // Text requirements (25 points total)  
    if (results.correctTitleFont) points += 10;
    if (results.correctTitleSize) points += 5;
    if (results.correctTaglineFont) points += 5;
    if (results.correctTaglineSize) points += 5;
    
    // Layout requirements (20 points total)
    if (results.titleInUpperThird) points += 5;
    if (results.taglineBelowTitle) points += 5;
    if (results.correctImageSize) points += 10;
    
    // Effects requirements (15 points total)
    if (results.correctTitleShadow) points += 5;
    if (results.correctTaglineGlow) points += 5;
    if (results.correctImageOverlay) points += 5;
    
    // Organization requirements (10 points total)
    if (results.backgroundLayerExists) points += 2;
    if (results.correctLayerCount) points += 5;
    if (results.correctOpacities) points += 3;
    
    results.totalPointsEarned = points;
    results.percentageScore = Math.round((points / results.totalPointsPossible) * 100);
}

/**
 * Generate comprehensive scoring report
 * Demonstrates detailed result formatting for educational use
 */
function generateScoringReport(results: ScoringResults): string {
    let report = 'MOVIE POSTER DESIGN SCORING REPORT\n';
    report += '=====================================\n\n';
    
    // Document section with actual measurements
    report += 'DOCUMENT REQUIREMENTS (30 points possible)\n';
    report += '  Actual Size: ' + results.documentWidth + 'x' + results.documentHeight + ' pixels\n';
    report += '  Actual DPI: ' + results.documentDPI + '\n';
    report += '  Actual Color Mode: "' + results.documentColorMode + '"\n';
    report += '  Expected: 3300x5100 pixels at 300 DPI, RGB color\n';
    report += '  ✓ Correct Size: ' + (results.correctDocumentSize ? 'YES (25 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ RGB Color Mode: ' + (results.correctColorMode ? 'YES (5 pts)' : 'NO (0 pts)') + '\n\n';
    
    // Text section with font analysis
    report += 'TEXT REQUIREMENTS (25 points possible)\n';
    report += '  Title Font: "' + results.titleFontName + '" (' + results.titleFontSize + 'pt)\n';
    report += '  Tagline Font: "' + results.taglineFontName + '" (' + results.taglineFontSize + 'pt)\n';
    report += '  Expected: Title = Arial Bold 48pt+, Tagline = Arial Regular 18-24pt\n';
    report += '  ✓ Title Arial Bold: ' + (results.correctTitleFont ? 'YES (10 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Title 48pt+: ' + (results.correctTitleSize ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Tagline Arial Regular: ' + (results.correctTaglineFont ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Tagline 18-24pt: ' + (results.correctTaglineSize ? 'YES (5 pts)' : 'NO (0 pts)') + '\n\n';
    
    // Layout section with positioning data
    report += 'LAYOUT REQUIREMENTS (20 points possible)\n';
    report += '  Title Y Position: ' + results.titlePositionY + 'px\n';
    report += '  Tagline Y Position: ' + results.taglinePositionY + 'px\n';
    report += '  Movie Image Size: ' + results.movieImageWidth + 'x' + results.movieImageHeight + 'px\n';
    report += '  Expected: Title in upper third, tagline below title, image 400x300+\n';
    report += '  ✓ Title in Upper Third: ' + (results.titleInUpperThird ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Tagline Below Title: ' + (results.taglineBelowTitle ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Image Size 400x300+: ' + (results.correctImageSize ? 'YES (10 pts)' : 'NO (0 pts)') + '\n\n';
    
    // Effects section with measurements
    report += 'EFFECTS REQUIREMENTS (15 points possible)\n';
    report += '  Title Shadow Distance: ' + results.titleShadowDistance + 'px\n';
    report += '  Tagline Glow Size: ' + results.taglineGlowSize + 'px\n';
    report += '  Image Overlay Opacity: ' + results.imageOverlayOpacity + '%\n';
    report += '  Expected: Shadow 5-10px, Glow 3-8px, Overlay 20-40%\n';
    report += '  ✓ Title Shadow 5-10px: ' + (results.correctTitleShadow ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Tagline Glow 3-8px: ' + (results.correctTaglineGlow ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ Image Overlay 20-40%: ' + (results.correctImageOverlay ? 'YES (5 pts)' : 'NO (0 pts)') + '\n\n';
    
    // Organization section with layer analysis
    report += 'ORGANIZATION REQUIREMENTS (10 points possible)\n';
    report += '  Total Layers: ' + results.totalLayerCount + '\n';
    report += '  Minimum Layer Opacity: ' + results.minOpacity + '%\n';
    report += '  Expected: 5+ layers, background layer exists, all layers >10% opacity\n';
    report += '  ✓ Background Layer Exists: ' + (results.backgroundLayerExists ? 'YES (2 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ 5+ Layers: ' + (results.correctLayerCount ? 'YES (5 pts)' : 'NO (0 pts)') + '\n';
    report += '  ✓ All Layers >10% Opacity: ' + (results.correctOpacities ? 'YES (3 pts)' : 'NO (0 pts)') + '\n\n';
    
    // Final score with grade assignment
    report += 'FINAL SCORE\n';
    report += '===========\n';
    report += 'Points Earned: ' + results.totalPointsEarned + ' / ' + results.totalPointsPossible + '\n';
    report += 'Percentage: ' + results.percentageScore + '%\n';
    
    // Grade assignment
    let grade = 'F';
    if (results.percentageScore >= 97) grade = 'A+';
    else if (results.percentageScore >= 93) grade = 'A';
    else if (results.percentageScore >= 90) grade = 'A-';
    else if (results.percentageScore >= 87) grade = 'B+';
    else if (results.percentageScore >= 83) grade = 'B';
    else if (results.percentageScore >= 80) grade = 'B-';
    else if (results.percentageScore >= 77) grade = 'C+';
    else if (results.percentageScore >= 73) grade = 'C';
    else if (results.percentageScore >= 70) grade = 'C-';
    else if (results.percentageScore >= 67) grade = 'D+';
    else if (results.percentageScore >= 63) grade = 'D';
    else if (results.percentageScore >= 60) grade = 'D-';
    
    report += 'Letter Grade: ' + grade + '\n';
    
    return report;
}

/**
 * Convert scoring results to answer object format
 * Demonstrates integration with external scoring systems
 */
function convertToAnswers(results: ScoringResults): any {
    // This demonstrates how results would be converted for external systems
    return {
        // Document answers
        documentCorrect: results.correctDocumentSize && results.correctColorMode,
        documentWidth: results.documentWidth,
        documentHeight: results.documentHeight,
        documentDPI: results.documentDPI,
        
        // Text answers
        textCorrect: results.correctTitleFont && results.correctTitleSize && 
                    results.correctTaglineFont && results.correctTaglineSize,
        titleFont: results.titleFontName,
        titleSize: results.titleFontSize,
        taglineFont: results.taglineFontName,
        taglineSize: results.taglineFontSize,
        
        // Layout answers
        layoutCorrect: results.titleInUpperThird && results.taglineBelowTitle && 
                      results.correctImageSize,
        titlePosition: results.titlePositionY,
        taglinePosition: results.taglinePositionY,
        imageWidth: results.movieImageWidth,
        imageHeight: results.movieImageHeight,
        
        // Effects answers
        effectsCorrect: results.correctTitleShadow && results.correctTaglineGlow && 
                       results.correctImageOverlay,
        shadowDistance: results.titleShadowDistance,
        glowSize: results.taglineGlowSize,
        overlayOpacity: results.imageOverlayOpacity,
        
        // Organization answers
        organizationCorrect: results.backgroundLayerExists && results.correctLayerCount && 
                           results.correctOpacities,
        layerCount: results.totalLayerCount,
        hasBackground: results.backgroundLayerExists,
        minOpacity: results.minOpacity,
        
        // Summary answers
        totalScore: results.totalPointsEarned,
        percentage: results.percentageScore,
        passed: results.percentageScore >= 70
    };
}

/**
 * Main execution function with comprehensive error handling
 */
function runScoringScript(): void {
    console.log('Movie Poster Design Assignment - Automated Scoring');
    console.log('==================================================');
    console.log('Using ActionDescriptor Navigation Framework');
    console.log('');
    
    try {
        // Run the complete scoring process
        const startTime = new Date().getTime();
        const results = scoreMoviePosterAssignment();
        const endTime = new Date().getTime();
        
        // Generate and display the report
        const report = generateScoringReport(results);
        console.log(report);
        
        // Show performance info
        console.log('Scoring completed in ' + (endTime - startTime) + 'ms');
        
        // Example of converting to external answer format
        const answers = convertToAnswers(results);
        console.log('\n=== ANSWER OBJECT FOR EXTERNAL SYSTEM ===');
        console.log('answers.documentCorrect = ' + answers.documentCorrect);
        console.log('answers.textCorrect = ' + answers.textCorrect);
        console.log('answers.layoutCorrect = ' + answers.layoutCorrect);
        console.log('answers.effectsCorrect = ' + answers.effectsCorrect);
        console.log('answers.organizationCorrect = ' + answers.organizationCorrect);
        console.log('answers.totalScore = ' + answers.totalScore);
        console.log('answers.percentage = ' + answers.percentage);
        console.log('answers.passed = ' + answers.passed);
        
    } catch (error) {
        console.log('SCORING ERROR: ' + error);
        console.log('This indicates a serious issue with the document or framework');
        
        // Return safe fallback answers for error cases
        console.log('\n=== FALLBACK ANSWERS (ERROR CASE) ===');
        console.log('answers.documentCorrect = false');
        console.log('answers.textCorrect = false');
        console.log('answers.layoutCorrect = false');
        console.log('answers.effectsCorrect = false');
        console.log('answers.organizationCorrect = false');
        console.log('answers.totalScore = 0');
        console.log('answers.percentage = 0');
        console.log('answers.passed = false');
    }
}

// Uncomment to run the scoring script:
// runScoringScript();