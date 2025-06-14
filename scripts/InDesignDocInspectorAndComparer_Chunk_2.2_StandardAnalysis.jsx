// ============================================================================
// CHUNK 2.2: TEXT ANALYSIS - STANDARD MODE WITH EMERGENCY BAILOUTS
// ES3 COMPATIBLE VERSION - PROGRESSIVE TEXT CONTENT ANALYSIS
// ============================================================================

// ============================================================================
// STANDARD MODE: TEXT CONTENT ANALYSIS WITH BAILOUTS
// ============================================================================

function createStandardDocumentReport(doc) {
    enhancedStatusLog("STANDARD", "Starting standard document analysis", 0, 10, "Text analysis with bailouts");
    
    // Start with basic report
    var report = createBasicDocumentReport(doc);
    
    // If basic failed, don't proceed
    if (report.error || report.fallbackToMinimal) {
        enhancedStatusLog("STANDARD", "Basic analysis failed", 1, 10, "Cannot proceed to standard mode");
        return report;
    }
    
    // Upgrade to standard mode
    report.analysisVersion = "2.1-estk-standard";
    report.mode = "STANDARD_TEXT_ANALYSIS";
    
    var timeout = MODE_TIMEOUTS.standard;
    
    try {
        // Enhanced text frame analysis (with content sampling)
        enhancedStatusLog("STANDARD", "Adding text frame analysis", 3, 10, "Limited content sampling");
        report.textFrames = emergencyAnalyzeSection("textFrames", function() {
            return getStandardTextFramesInfo(doc);
        }, timeout, 4, 10);
        
        // Story analysis (with content previews)
        enhancedStatusLog("STANDARD", "Adding story analysis", 5, 10, "Story threading and previews");
        report.stories = emergencyAnalyzeSection("stories", function() {
            return getStandardStoriesInfo(doc);
        }, timeout, 6, 10);
        
        // Text content summary (safe sampling)
        enhancedStatusLog("STANDARD", "Adding text content summary", 7, 10, "Safe text content analysis");
        report.textContent = emergencyAnalyzeSection("textContent", function() {
            return getStandardTextContent(doc);
        }, timeout, 8, 10);
        
        enhancedStatusLog("STANDARD", "Standard analysis completed", 10, 10, "Text analysis successful");
        
    } catch (exc) {
        enhancedStatusLog("STANDARD", "Standard analysis failed", 10, 10, "Error: " + exc.message);
        report.error = "Standard analysis failed: " + exc.message;
        report.partialResults = true;
    }
    
    return report;
}

// ============================================================================
// STANDARD TEXT ANALYSIS FUNCTIONS - LIMITED SAMPLING
// ============================================================================

function getStandardTextFramesInfo(doc) {
    enhancedStatusLog("STANDARD_TEXT", "Analyzing text frames", 0, 5, "Limited sampling with bailouts");
    
    var textFrames = safeGetProperty(doc, 'textFrames');
    var frameCount = safeGetLength(textFrames);
    
    if (frameCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "standard",
            note: "No text frames found"
        };
    }
    
    // Limit sampling in standard mode for safety
    var sampleLimit = Math.min(frameCount, 5); // Only sample first 5 frames
    var frameDetails = [];
    var timeoutPerFrame = 500; // 500ms max per frame
    
    enhancedStatusLog("STANDARD_TEXT", "Sampling text frames", 1, 5, 
        "Processing " + sampleLimit + " of " + frameCount + " frames");
    
    for (var i = 0; i < sampleLimit; i++) {
        var frameStart = new Date().getTime();
        
        try {
            var frame = null;
            
            // Try multiple access methods with timeout
            try {
                frame = textFrames[i];
            } catch (e1) {
                try {
                    if (textFrames.item) {
                        frame = textFrames.item(i);
                    }
                } catch (e2) {
                    enhancedStatusLog("STANDARD_TEXT", "Frame access failed", 2, 5, 
                        "Frame " + i + " inaccessible");
                    continue;
                }
            }
            
            if (frame) {
                var frameAnalysis = analyzeTextFrameSafely(frame, i, timeoutPerFrame);
                frameDetails.push(frameAnalysis);
                
                // Check processing time
                var frameDuration = new Date().getTime() - frameStart;
                if (frameDuration > timeoutPerFrame) {
                    enhancedStatusLog("STANDARD_TEXT", "Frame timeout", 3, 5, 
                        "Frame " + i + " took " + frameDuration + "ms - stopping for safety");
                    break;
                }
            }
            
        } catch (exc) {
            enhancedStatusLog("STANDARD_TEXT", "Frame processing error", 3, 5, 
                "Frame " + i + ": " + exc.message);
            frameDetails.push({
                index: i,
                error: "Processing failed: " + exc.message,
                emergencySkip: true
            });
        }
    }
    
    enhancedStatusLog("STANDARD_TEXT", "Text frame sampling completed", 5, 5, 
        "Processed " + frameDetails.length + " frames safely");
    
    return {
        totalCount: frameCount,
        sampledCount: frameDetails.length,
        sampleLimit: sampleLimit,
        frameDetails: frameDetails,
        analysisMode: "standard",
        note: "Limited sampling for safety - increase mode for full analysis"
    };
}

function analyzeTextFrameSafely(textFrame, frameIndex, timeoutMs) {
    var startTime = new Date().getTime();
    
    var analysis = {
        index: frameIndex,
        id: safeGetProperty(textFrame, 'id'),
        bounds: safeGetProperty(textFrame, 'bounds'),
        overflows: safeGetProperty(textFrame, 'overflows', false),
        layer: safeGetProperty(safeGetProperty(textFrame, 'itemLayer'), 'name'),
        emergencyAnalysis: true
    };
    
    // Try to get text content with timeout protection
    try {
        var content = safeGetProperty(textFrame, 'contents');
        if (content && typeof content === 'string') {
            analysis.hasText = true;
            analysis.characterCount = content.length;
            analysis.textPreview = content.substring(0, 30) + (content.length > 30 ? "..." : "");
            
            // Quick word count (ES3 compatible)
            var words = content.split(/\s+/);
            var wordCount = 0;
            for (var i = 0; i < words.length && i < 100; i++) { // Limit word counting
                if (words[i].length > 0) wordCount++;
            }
            analysis.wordCount = wordCount;
        } else {
            analysis.hasText = false;
            analysis.textPreview = "[NO TEXT]";
        }
        
        // Check timeout
        var duration = new Date().getTime() - startTime;
        if (duration > timeoutMs) {
            analysis.timeoutWarning = "Analysis took " + duration + "ms";
        }
        
    } catch (exc) {
        analysis.textError = "Text access failed: " + exc.message;
        analysis.hasText = false;
    }
    
    return analysis;
}

function getStandardStoriesInfo(doc) {
    enhancedStatusLog("STANDARD_STORIES", "Analyzing stories", 0, 3, "Limited story sampling");
    
    var stories = safeGetProperty(doc, 'stories');
    var storyCount = safeGetLength(stories);
    
    if (storyCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "standard",
            note: "No stories found"
        };
    }
    
    // Limit story sampling for safety
    var sampleLimit = Math.min(storyCount, 3); // Only sample first 3 stories
    var storyDetails = [];
    
    enhancedStatusLog("STANDARD_STORIES", "Sampling stories", 1, 3, 
        "Processing " + sampleLimit + " of " + storyCount + " stories");
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var story = null;
            try {
                story = stories[i];
            } catch (e1) {
                if (stories.item) {
                    story = stories.item(i);
                }
            }
            
            if (story) {
                var storyAnalysis = {
                    index: i,
                    id: safeGetProperty(story, 'id'),
                    length: safeGetProperty(story, 'length', 0),
                    textFrameCount: safeGetLength(safeGetProperty(story, 'textFrames')),
                    overflows: safeGetProperty(story, 'overflows', false),
                    isThreaded: safeGetLength(safeGetProperty(story, 'textFrames')) > 1,
                    analysisMode: "standard"
                };
                
                // Try to get content preview safely
                try {
                    var content = safeGetProperty(story, 'contents');
                    if (content && typeof content === 'string') {
                        storyAnalysis.contentPreview = content.substring(0, 50) + 
                            (content.length > 50 ? "..." : "");
                    } else {
                        storyAnalysis.contentPreview = "[NO CONTENT]";
                    }
                } catch (exc) {
                    storyAnalysis.contentPreview = "[ACCESS FAILED]";
                }
                
                storyDetails.push(storyAnalysis);
            }
            
        } catch (exc) {
            storyDetails.push({
                index: i,
                error: "Story analysis failed: " + exc.message,
                emergencySkip: true
            });
        }
    }
    
    enhancedStatusLog("STANDARD_STORIES", "Story sampling completed", 3, 3, 
        "Processed " + storyDetails.length + " stories");
    
    return {
        totalCount: storyCount,
        sampledCount: storyDetails.length,
        storyDetails: storyDetails,
        analysisMode: "standard",
        note: "Limited story sampling for safety"
    };
}

function getStandardTextContent(doc) {
    enhancedStatusLog("STANDARD_CONTENT", "Creating text content summary", 0, 4, "Safe text analysis");
    
    var textSummary = {
        analysisMode: "standard",
        limitedAnalysis: true,
        timestamp: toISOString(new Date())
    };
    
    try {
        // Get basic counts safely
        enhancedStatusLog("STANDARD_CONTENT", "Getting text counts", 1, 4, "Basic text metrics");
        
        var textFrames = safeGetProperty(doc, 'textFrames');
        var stories = safeGetProperty(doc, 'stories');
        
        textSummary.summary = {
            totalTextFrames: safeGetLength(textFrames),
            totalStories: safeGetLength(stories),
            samplingNote: "Standard mode - limited content analysis for safety"
        };
        
        // Try to get overflow count safely
        enhancedStatusLog("STANDARD_CONTENT", "Checking overflows", 2, 4, "Overflow detection");
        textSummary.overflowInfo = getOverflowInfoSafely(textFrames);
        
        // Get basic text statistics from sampled frames
        enhancedStatusLog("STANDARD_CONTENT", "Computing text statistics", 3, 4, "Statistical summary");
        textSummary.textStatistics = getBasicTextStatistics(textFrames);
        
        enhancedStatusLog("STANDARD_CONTENT", "Text content analysis completed", 4, 4, "Summary generated");
        
    } catch (exc) {
        textSummary.error = "Text content analysis failed: " + exc.message;
        textSummary.partialResults = true;
    }
    
    return textSummary;
}

function getOverflowInfoSafely(textFrames) {
    var overflowInfo = {
        totalFrames: safeGetLength(textFrames),
        overflowingFrames: 0,
        sampleSize: 0,
        note: "Limited overflow check for safety"
    };
    
    var frameCount = overflowInfo.totalFrames;
    var sampleLimit = Math.min(frameCount, 10); // Check only first 10 frames
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frame = null;
            try {
                frame = textFrames[i];
            } catch (e1) {
                if (textFrames.item) {
                    frame = textFrames.item(i);
                }
            }
            
            if (frame) {
                var overflows = safeGetProperty(frame, 'overflows', false);
                if (overflows) {
                    overflowInfo.overflowingFrames++;
                }
                overflowInfo.sampleSize++;
            }
            
        } catch (exc) {
            // Skip problematic frames
            continue;
        }
    }
    
    // Estimate total overflows if we sampled
    if (overflowInfo.sampleSize > 0 && overflowInfo.sampleSize < frameCount) {
        var ratio = overflowInfo.overflowingFrames / overflowInfo.sampleSize;
        overflowInfo.estimatedTotalOverflows = Math.round(ratio * frameCount);
        overflowInfo.isEstimate = true;
    }
    
    return overflowInfo;
}

function getBasicTextStatistics(textFrames) {
    var stats = {
        analysisMode: "standard",
        limitedSampling: true,
        sampleSize: 0,
        totalCharacters: 0,
        totalWords: 0,
        emptyFrames: 0,
        textFrames: 0
    };
    
    var frameCount = safeGetLength(textFrames);
    var sampleLimit = Math.min(frameCount, 5); // Sample only 5 frames for statistics
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frame = null;
            try {
                frame = textFrames[i];
            } catch (e1) {
                if (textFrames.item) {
                    frame = textFrames.item(i);
                }
            }
            
            if (frame) {
                var content = safeGetProperty(frame, 'contents');
                if (content && typeof content === 'string') {
                    stats.totalCharacters += content.length;
                    
                    // Quick word count
                    var words = content.split(/\s+/);
                    var wordCount = 0;
                    for (var j = 0; j < words.length && j < 50; j++) { // Limit processing
                        if (words[j].length > 0) wordCount++;
                    }
                    stats.totalWords += wordCount;
                    
                    if (content.length === 0) {
                        stats.emptyFrames++;
                    } else {
                        stats.textFrames++;
                    }
                } else {
                    stats.emptyFrames++;
                }
                
                stats.sampleSize++;
            }
            
        } catch (exc) {
            // Skip problematic frames
            continue;
        }
    }
    
    // Calculate averages from sample
    if (stats.sampleSize > 0) {
        stats.averageCharactersPerFrame = Math.round(stats.totalCharacters / stats.sampleSize);
        stats.averageWordsPerFrame = Math.round(stats.totalWords / stats.sampleSize);
        
        // Estimate totals if we sampled
        if (stats.sampleSize < frameCount) {
            stats.estimatedTotalCharacters = Math.round((stats.totalCharacters / stats.sampleSize) * frameCount);
            stats.estimatedTotalWords = Math.round((stats.totalWords / stats.sampleSize) * frameCount);
            stats.isEstimate = true;
        }
    }
    
    stats.note = "Based on limited sampling of " + stats.sampleSize + " frames out of " + frameCount;
    
    return stats;
}