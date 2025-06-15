// ============================================================================
// CHUNK 2.2: STANDARD ANALYSIS MODE - PROGRESSIVE TEXT ANALYSIS WITH SAFETY
// ES3 COMPATIBLE VERSION - TRUE PROGRESSIVE SAFETY BUILDING ON BASIC MODE
// ============================================================================

// ============================================================================
// STANDARD MODE: TEXT CONTENT ANALYSIS WITH ENHANCED SAFETY
// ============================================================================

function createStandardDocumentReport(doc) {
    enhancedStatusLog("STANDARD", "Starting standard document analysis", 0, 15, "Text analysis with progressive safety");
    
    // Start with basic report as foundation - TRUE PROGRESSIVE SAFETY
    enhancedStatusLog("STANDARD", "Building on basic analysis", 1, 15, "Getting basic report foundation");
    var report = createBasicDocumentReport(doc);
    
    // If basic failed or used emergency bailouts, don't proceed to standard
    if (report.error || report.fallbackToMinimal || hasEmergencyBailouts(report)) {
        enhancedStatusLog("STANDARD", "Basic analysis issues", 2, 15, "Cannot proceed to standard mode safely");
        report.standardModeSkipped = true;
        report.skipReason = "Basic analysis had issues - staying in basic mode for safety";
        return report;
    }
    
    // Upgrade to standard mode
    report.analysisVersion = "2.1-estk-standard";
    report.mode = "STANDARD_TEXT_ANALYSIS";
    report.safetyLevel = "progressive_safety";
    
    var standardStartTime = new Date().getTime();
    var standardTimeout = ENHANCED_ANALYSIS_CONFIG.modes.standard.timeout;
    
    try {
        // Enhanced pre-testing for standard mode collections
        enhancedStatusLog("STANDARD", "Pre-testing standard collections", 3, 15, "Testing text-related collections");
        report.standardPreTestResults = preTestStandardCollections(doc);
        
        // Only proceed if we have safe text-related collections
        if (!hasRequiredStandardCollections(report.standardPreTestResults)) {
            enhancedStatusLog("STANDARD", "Standard collections not safe", 4, 15, "Cannot do text analysis safely");
            report.textAnalysisSkipped = true;
            report.skipReason = "Text collections failed safety testing";
            return report;
        }
        
        // Enhanced text frame analysis (with content sampling)
        enhancedStatusLog("STANDARD", "Adding text frame analysis", 5, 15, "Safe content sampling");
        report.textFrames = emergencyAnalyzeSection("standardTextFrames", function() {
            return getStandardTextFramesInfo(doc, report.standardPreTestResults);
        }, standardTimeout / 3, 7, 15);
        
        // Story analysis (with content previews) - only if stories are safe
        if (arrayIndexOf(report.standardPreTestResults.safe, 'stories') !== -1) {
            enhancedStatusLog("STANDARD", "Adding story analysis", 9, 15, "Story threading and previews");
            report.stories = emergencyAnalyzeSection("standardStories", function() {
                return getStandardStoriesInfo(doc, report.standardPreTestResults);
            }, standardTimeout / 3, 10, 15);
        } else {
            enhancedStatusLog("STANDARD", "Skipping story analysis", 9, 15, "Stories collection not safe");
            report.stories = {
                skipped: true,
                reason: "Stories collection failed safety testing"
            };
        }
        
        // Text content summary (safe sampling) - core of standard mode
        enhancedStatusLog("STANDARD", "Adding text content analysis", 11, 15, "Safe text content sampling");
        report.textContent = emergencyAnalyzeSection("standardTextContent", function() {
            return getStandardTextContent(doc, report.standardPreTestResults);
        }, standardTimeout / 3, 13, 15);
        
        var standardDuration = new Date().getTime() - standardStartTime;
        report.standardProcessingTime = standardDuration;
        
        enhancedStatusLog("STANDARD", "Standard analysis completed", 15, 15, 
            "Text analysis completed in " + standardDuration + "ms");
        
        // Check if standard mode processing was reasonable
        if (standardDuration > standardTimeout) {
            report.warnings = report.warnings || [];
            report.warnings.push("Standard analysis exceeded timeout (" + standardDuration + "ms) - document may be complex");
        }
        
    } catch (exc) {
        enhancedStatusLog("STANDARD", "Standard analysis failed", 15, 15, "Error: " + exc.message);
        report.errors = report.errors || [];
        report.errors.push("Standard analysis failed: " + exc.message);
        report.partialResults = true;
        report.standardProcessingTime = new Date().getTime() - standardStartTime;
    }
    
    return report;
}

// Check if basic report has emergency bailouts that prevent standard mode
function hasEmergencyBailouts(basicReport) {
    if (!basicReport) return true;
    
    // Check for bailouts in key sections
    var keyBasicSections = ['documentInfo', 'pageInfo', 'textInfo', 'layerInfo'];
    
    for (var i = 0; i < keyBasicSections.length; i++) {
        var section = basicReport[keyBasicSections[i]];
        if (section && section.emergencyBailout) {
            return true;
        }
    }
    
    return false;
}

// Check if we have the required collections for standard mode
function hasRequiredStandardCollections(preTestResults) {
    if (!preTestResults || !preTestResults.safe) return false;
    
    // Standard mode requires at least textFrames to be safe for text analysis
    return arrayIndexOf(preTestResults.safe, 'textFrames') !== -1;
}

// Pre-test collections specifically for standard mode
function preTestStandardCollections(doc) {
    var standardCollections = createModeFilteredCollectionList("standard");
    var testResults = {
        tested: [],
        safe: [],
        unsafe: [],
        textRelatedSafe: [],
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    enhancedStatusLog("STANDARD_PRETEST", "Testing standard collections", 0, standardCollections.length, 
        "Pre-testing " + standardCollections.length + " collections for text analysis");
    
    for (var i = 0; i < standardCollections.length; i++) {
        var collName = standardCollections[i];
        
        try {
            enhancedStatusLog("STANDARD_PRETEST", "Testing " + collName, i + 1, standardCollections.length, 
                "Collection safety for standard mode");
            
            var testResult = testCollectionSafety(doc, collName, 
                ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess / 4);
            
            testResults.tested.push({
                name: collName,
                result: testResult
            });
            
            if (testResult.safety === "safe" || testResult.safety === "moderate") {
                testResults.safe.push(collName);
                
                // Track text-related collections separately
                if (collName === 'textFrames' || collName === 'stories') {
                    testResults.textRelatedSafe.push(collName);
                    enhancedStatusLog("STANDARD_PRETEST", collName + " is text-safe", i + 1, standardCollections.length, 
                        "Safe for text analysis");
                } else {
                    enhancedStatusLog("STANDARD_PRETEST", collName + " is safe", i + 1, standardCollections.length, 
                        "Safety: " + testResult.safety);
                }
            } else {
                testResults.unsafe.push(collName);
                enhancedStatusLog("STANDARD_PRETEST", collName + " is unsafe", i + 1, standardCollections.length, 
                    "Safety: " + testResult.safety + " - " + testResult.error);
            }
            
        } catch (exc) {
            testResults.unsafe.push(collName);
            enhancedStatusLog("STANDARD_PRETEST", collName + " test failed", i + 1, standardCollections.length, 
                "Error: " + exc.message);
        }
    }
    
    testResults.processingTime = new Date().getTime() - startTime;
    
    enhancedStatusLog("STANDARD_PRETEST", "Standard pre-testing completed", standardCollections.length, standardCollections.length, 
        "Safe: " + testResults.safe.length + ", Text-safe: " + testResults.textRelatedSafe.length);
    
    return testResults;
}

// ============================================================================
// STANDARD TEXT ANALYSIS FUNCTIONS - LIMITED SAMPLING WITH SAFETY
// ============================================================================

function getStandardTextFramesInfo(doc, preTestResults) {
    enhancedStatusLog("STANDARD_TEXT", "Analyzing text frames", 0, 8, "Limited sampling with progressive safety");
    
    // Only proceed if textFrames passed pre-testing
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'textFrames') === -1) {
        return {
            skipped: true,
            reason: "TextFrames collection failed safety pre-testing",
            analysisMode: "standard",
            recommendation: "Use basic mode for this document"
        };
    }
    
    var textFrames = progressiveCollectionAccess(doc, 'textFrames', 'standard');
    if (!textFrames) {
        return {
            error: "Progressive collection access denied textFrames for standard mode",
            analysisMode: "standard"
        };
    }
    
    var frameCount = emergencyGetLength(textFrames, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess);
    
    if (frameCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "standard",
            note: "No text frames found"
        };
    }
    
    // Progressive sampling for standard mode - more conservative than comprehensive
    var sampleLimit = Math.min(frameCount, 8); // Increased from 5 but still limited
    var frameDetails = [];
    var timeoutPerFrame = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess / sampleLimit;
    
    enhancedStatusLog("STANDARD_TEXT", "Sampling text frames", 1, 8, 
        "Processing " + sampleLimit + " of " + frameCount + " frames");
    
    for (var i = 0; i < sampleLimit; i++) {
        var frameStart = new Date().getTime();
        
        try {
            enhancedStatusLog("STANDARD_TEXT", "Processing frame " + (i + 1), 2 + i, 8, 
                "Frame " + (i + 1) + " of " + sampleLimit);
            
            var frame = null;
            
            // Enhanced access with progressive safety
            var frameResult = emergencyBailoutHandler(function() {
                try {
                    frame = textFrames[i];
                    return frame;
                } catch (e1) {
                    if (textFrames.item) {
                        return textFrames.item(i);
                    }
                    throw e1;
                }
            }, timeoutPerFrame);
            
            if (frameResult.bailout || !frameResult.result) {
                enhancedStatusLog("STANDARD_TEXT", "Frame access failed", 2 + i, 8, 
                    "Frame " + i + " not accessible - " + (frameResult.error || "timeout"));
                frameDetails.push({
                    index: i,
                    error: "Frame access failed: " + (frameResult.error || "timeout"),
                    emergencySkip: true,
                    mode: "standard"
                });
                continue;
            }
            
            frame = frameResult.result;
            
            // Analyze frame safely with standard mode constraints
            var frameAnalysis = analyzeTextFrameForStandard(frame, i, timeoutPerFrame);
            frameDetails.push(frameAnalysis);
            
            // Check frame processing time
            var frameDuration = new Date().getTime() - frameStart;
            if (frameDuration > timeoutPerFrame) {
                enhancedStatusLog("STANDARD_TEXT", "Frame timeout", 2 + i, 8, 
                    "Frame " + i + " took " + frameDuration + "ms - stopping for safety");
                break;
            }
            
        } catch (exc) {
            enhancedStatusLog("STANDARD_TEXT", "Frame processing error", 2 + i, 8, 
                "Frame " + i + ": " + exc.message);
            frameDetails.push({
                index: i,
                error: "Processing failed: " + exc.message,
                emergencySkip: true,
                mode: "standard"
            });
        }
    }
    
    enhancedStatusLog("STANDARD_TEXT", "Text frame sampling completed", 8, 8, 
        "Processed " + frameDetails.length + " frames safely");
    
    return {
        totalCount: frameCount,
        sampledCount: frameDetails.length,
        sampleLimit: sampleLimit,
        frameDetails: frameDetails,
        analysisMode: "standard",
        progressiveSafety: true,
        note: "Limited sampling for safety and performance - use comprehensive mode for full analysis"
    };
}

function analyzeTextFrameForStandard(textFrame, frameIndex, timeoutMs) {
    var startTime = new Date().getTime();
    
    var analysis = {
        index: frameIndex,
        mode: "standard",
        progressiveSafety: true,
        processingTime: 0
    };
    
    try {
        // Basic properties with emergency access
        var idResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(textFrame, 'id');
        }, timeoutMs / 4);
        
        var boundsResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(textFrame, 'bounds');
        }, timeoutMs / 4);
        
        var overflowsResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(textFrame, 'overflows', false);
        }, timeoutMs / 4);
        
        // Safe property assignment
        analysis.id = idResult.bailout ? null : idResult.result;
        analysis.bounds = boundsResult.bailout ? null : boundsResult.result;
        analysis.overflows = overflowsResult.bailout ? false : overflowsResult.result;
        
        // Layer information (if accessible)
        var layerResult = emergencyBailoutHandler(function() {
            var itemLayer = emergencyGetProperty(textFrame, 'itemLayer');
            return itemLayer ? emergencyGetProperty(itemLayer, 'name') : null;
        }, timeoutMs / 4);
        
        analysis.layer = layerResult.bailout ? null : layerResult.result;
        
        // Text content analysis - core of standard mode
        enhancedStatusLog("STANDARD_FRAME", "Analyzing text content", 0, 1, 
            "Frame " + frameIndex + " content analysis");
        
        var contentResult = analyzeFrameTextContent(textFrame, timeoutMs / 2);
        analysis.textAnalysis = contentResult;
        
        // Calculate totals
        analysis.hasText = contentResult.hasText || false;
        analysis.characterCount = contentResult.characterCount || 0;
        analysis.wordCount = contentResult.wordCount || 0;
        analysis.textPreview = contentResult.textPreview || "[NO TEXT]";
        
        analysis.processingTime = new Date().getTime() - startTime;
        
        // Check timeout
        if (analysis.processingTime > timeoutMs) {
            analysis.timeoutWarning = "Analysis took " + analysis.processingTime + "ms (limit: " + timeoutMs + "ms)";
        }
        
    } catch (exc) {
        analysis.error = "Frame analysis failed: " + exc.message;
        analysis.processingTime = new Date().getTime() - startTime;
    }
    
    return analysis;
}

function analyzeFrameTextContent(textFrame, timeoutMs) {
    var contentAnalysis = {
        hasText: false,
        characterCount: 0,
        wordCount: 0,
        textPreview: "[NO TEXT]",
        contentAccessible: false,
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Get text content with progressive safety
        var contentResult = emergencyBailoutHandler(function() {
            return safeTextCapture(textFrame); // Uses safe text capture from Chunk 1
        }, timeoutMs);
        
        if (contentResult.bailout) {
            contentAnalysis.textPreview = "[TIMEOUT]";
            contentAnalysis.error = "Text content access timed out";
            return contentAnalysis;
        }
        
        var textPreview = contentResult.result;
        
        if (textPreview && textPreview !== "[NO TEXT]" && textPreview !== "[ERROR]") {
            contentAnalysis.hasText = true;
            contentAnalysis.textPreview = textPreview;
            contentAnalysis.contentAccessible = true;
            
            // Try to get full content for analysis (with timeout protection)
            var fullContentResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(textFrame, 'contents');
            }, timeoutMs / 2);
            
            if (!fullContentResult.bailout && fullContentResult.result && typeof fullContentResult.result === 'string') {
                var content = fullContentResult.result;
                contentAnalysis.characterCount = content.length;
                
                // ES3-compatible word counting with safety limits
                var words = content.split(/\s+/);
                var wordCount = 0;
                var maxWordsToCount = Math.min(words.length, 500); // Limit word counting for performance
                
                for (var i = 0; i < maxWordsToCount; i++) {
                    if (words[i] && words[i].length > 0) {
                        wordCount++;
                    }
                }
                
                contentAnalysis.wordCount = wordCount;
                
                // If we didn't count all words, estimate
                if (words.length > maxWordsToCount) {
                    var ratio = wordCount / maxWordsToCount;
                    contentAnalysis.wordCount = Math.round(ratio * words.length);
                    contentAnalysis.wordCountEstimated = true;
                }
            } else {
                // Use preview for basic metrics
                contentAnalysis.characterCount = textPreview.length;
                contentAnalysis.wordCount = textPreview.split(/\s+/).length;
                contentAnalysis.metricsFromPreview = true;
            }
        }
        
        contentAnalysis.processingTime = new Date().getTime() - startTime;
        
    } catch (exc) {
        contentAnalysis.error = "Text content analysis failed: " + exc.message;
        contentAnalysis.processingTime = new Date().getTime() - startTime;
    }
    
    return contentAnalysis;
}

function getStandardStoriesInfo(doc, preTestResults) {
    enhancedStatusLog("STANDARD_STORIES", "Analyzing stories", 0, 5, "Limited story sampling with safety");
    
    // Only proceed if stories passed pre-testing
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'stories') === -1) {
        return {
            skipped: true,
            reason: "Stories collection failed safety pre-testing",
            analysisMode: "standard"
        };
    }
    
    var stories = progressiveCollectionAccess(doc, 'stories', 'standard');
    if (!stories) {
        return {
            error: "Progressive collection access denied stories for standard mode",
            analysisMode: "standard"
        };
    }
    
    var storyCount = emergencyGetLength(stories, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess);
    
    if (storyCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "standard",
            note: "No stories found"
        };
    }
    
    // Conservative story sampling for standard mode
    var sampleLimit = Math.min(storyCount, 5); // Limit to 5 stories for safety
    var storyDetails = [];
    var timeoutPerStory = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess / sampleLimit;
    
    enhancedStatusLog("STANDARD_STORIES", "Sampling stories", 1, 5, 
        "Processing " + sampleLimit + " of " + storyCount + " stories");
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            enhancedStatusLog("STANDARD_STORIES", "Processing story " + (i + 1), 2 + i, 5, 
                "Story " + (i + 1) + " of " + sampleLimit);
            
            var story = null;
            
            var storyResult = emergencyBailoutHandler(function() {
                try {
                    story = stories[i];
                    return story;
                } catch (e1) {
                    if (stories.item) {
                        return stories.item(i);
                    }
                    throw e1;
                }
            }, timeoutPerStory);
            
            if (storyResult.bailout || !storyResult.result) {
                enhancedStatusLog("STANDARD_STORIES", "Story access failed", 2 + i, 5, 
                    "Story " + i + " not accessible");
                storyDetails.push({
                    index: i,
                    error: "Story access failed: " + (storyResult.error || "timeout"),
                    emergencySkip: true,
                    mode: "standard"
                });
                continue;
            }
            
            story = storyResult.result;
            
            var storyAnalysis = analyzeStoryForStandard(story, i, timeoutPerStory);
            storyDetails.push(storyAnalysis);
            
        } catch (exc) {
            enhancedStatusLog("STANDARD_STORIES", "Story processing error", 2 + i, 5, 
                "Story " + i + ": " + exc.message);
            storyDetails.push({
                index: i,
                error: "Story analysis failed: " + exc.message,
                emergencySkip: true,
                mode: "standard"
            });
        }
    }
    
    enhancedStatusLog("STANDARD_STORIES", "Story sampling completed", 5, 5, 
        "Processed " + storyDetails.length + " stories");
    
    return {
        totalCount: storyCount,
        sampledCount: storyDetails.length,
        storyDetails: storyDetails,
        analysisMode: "standard",
        progressiveSafety: true,
        note: "Limited story sampling for safety - use comprehensive mode for full analysis"
    };
}

function analyzeStoryForStandard(story, storyIndex, timeoutMs) {
    var analysis = {
        index: storyIndex,
        mode: "standard",
        progressiveSafety: true
    };
    
    try {
        // Basic story properties with emergency access
        var idResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(story, 'id');
        }, timeoutMs / 6);
        
        var lengthResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(story, 'length', 0);
        }, timeoutMs / 6);
        
        var textFrameCountResult = emergencyBailoutHandler(function() {
            var textFrames = emergencyGetProperty(story, 'textFrames');
            return textFrames ? emergencyGetLength(textFrames, timeoutMs / 6) : 0;
        }, timeoutMs / 6);
        
        var overflowsResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(story, 'overflows', false);
        }, timeoutMs / 6);
        
        // Safe assignment
        analysis.id = idResult.bailout ? null : idResult.result;
        analysis.length = lengthResult.bailout ? 0 : lengthResult.result;
        analysis.textFrameCount = textFrameCountResult.bailout ? 0 : textFrameCountResult.result;
        analysis.overflows = overflowsResult.bailout ? false : overflowsResult.result;
        analysis.isThreaded = analysis.textFrameCount > 1;
        
        // Content preview with safety
        var contentResult = emergencyBailoutHandler(function() {
            var content = emergencyGetProperty(story, 'contents');
            if (content && typeof content === 'string') {
                return content.substring(0, 80) + (content.length > 80 ? "..." : "");
            }
            return "[NO CONTENT]";
        }, timeoutMs / 3);
        
        analysis.contentPreview = contentResult.bailout ? "[TIMEOUT]" : contentResult.result;
        
    } catch (exc) {
        analysis.error = "Story analysis failed: " + exc.message;
    }
    
    return analysis;
}

function getStandardTextContent(doc, preTestResults) {
    enhancedStatusLog("STANDARD_CONTENT", "Creating text content summary", 0, 6, "Safe text analysis with sampling");
    
    var textSummary = {
        analysisMode: "standard",
        progressiveSafety: true,
        limitedAnalysis: true,
        timestamp: toISOString(new Date()),
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Get basic counts safely
        enhancedStatusLog("STANDARD_CONTENT", "Getting text counts", 1, 6, "Basic text metrics");
        
        textSummary.summary = getStandardTextSummary(doc, preTestResults);
        
        // Get overflow info with safety
        enhancedStatusLog("STANDARD_CONTENT", "Checking overflows", 3, 6, "Overflow detection with safety");
        textSummary.overflowInfo = getOverflowInfoForStandard(doc, preTestResults);
        
        // Get enhanced text statistics from sampled content
        enhancedStatusLog("STANDARD_CONTENT", "Computing text statistics", 5, 6, "Statistical analysis of samples");
        textSummary.textStatistics = getStandardTextStatistics(doc, preTestResults);
        
        textSummary.processingTime = new Date().getTime() - startTime;
        
        enhancedStatusLog("STANDARD_CONTENT", "Text content analysis completed", 6, 6, 
            "Summary generated in " + textSummary.processingTime + "ms");
        
    } catch (exc) {
        textSummary.error = "Text content analysis failed: " + exc.message;
        textSummary.partialResults = true;
        textSummary.processingTime = new Date().getTime() - startTime;
    }
    
    return textSummary;
}

function getStandardTextSummary(doc, preTestResults) {
    var summary = {
        mode: "standard",
        progressiveSafety: true
    };
    
    // Text frames summary
    if (preTestResults && arrayIndexOf(preTestResults.safe, 'textFrames') !== -1) {
        var textFrames = progressiveCollectionAccess(doc, 'textFrames', 'standard');
        summary.totalTextFrames = textFrames ? emergencyGetLength(textFrames, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess) : 0;
        summary.textFramesAccessible = true;
    } else {
        summary.totalTextFrames = 0;
        summary.textFramesAccessible = false;
        summary.textFramesReason = "TextFrames collection failed pre-testing";
    }
    
    // Stories summary
    if (preTestResults && arrayIndexOf(preTestResults.safe, 'stories') !== -1) {
        var stories = progressiveCollectionAccess(doc, 'stories', 'standard');
        summary.totalStories = stories ? emergencyGetLength(stories, 
            ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess) : 0;
        summary.storiesAccessible = true;
    } else {
        summary.totalStories = 0;
        summary.storiesAccessible = false;
        summary.storiesReason = "Stories collection not available or failed pre-testing";
    }
    
    summary.samplingNote = "Standard mode - safe sampling with pre-tested collections";
    return summary;
}

function getOverflowInfoForStandard(doc, preTestResults) {
    var overflowInfo = {
        mode: "standard",
        progressiveSafety: true,
        sampleSize: 0,
        overflowingFrames: 0,
        note: "Limited overflow check with safety constraints"
    };
    
    // Only check overflows if textFrames are safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'textFrames') === -1) {
        overflowInfo.skipped = true;
        overflowInfo.reason = "TextFrames collection not safe for overflow checking";
        return overflowInfo;
    }
    
    var textFrames = progressiveCollectionAccess(doc, 'textFrames', 'standard');
    if (!textFrames) {
        overflowInfo.error = "Cannot access textFrames for overflow checking";
        return overflowInfo;
    }
    
    var frameCount = emergencyGetLength(textFrames, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess);
    overflowInfo.totalFrames = frameCount;
    
    // Conservative sampling for overflow checking
    var sampleLimit = Math.min(frameCount, 10); // Check only first 10 frames
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess / 2;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frameResult = emergencyBailoutHandler(function() {
                try {
                    return textFrames[i];
                } catch (e1) {
                    if (textFrames.item) {
                        return textFrames.item(i);
                    }
                    throw e1;
                }
            }, timeout / sampleLimit);
            
            if (frameResult.bailout || !frameResult.result) {
                break; // Stop on first failure for safety
            }
            
            var frame = frameResult.result;
            var overflowResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(frame, 'overflows', false);
            }, timeout / sampleLimit);
            
            if (!overflowResult.bailout) {
                if (overflowResult.result) {
                    overflowInfo.overflowingFrames++;
                }
                overflowInfo.sampleSize++;
            }
            
        } catch (exc) {
            // Skip problematic frames and continue
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

function getStandardTextStatistics(doc, preTestResults) {
    var stats = {
        analysisMode: "standard",
        progressiveSafety: true,
        limitedSampling: true,
        sampleSize: 0,
        totalCharacters: 0,
        totalWords: 0,
        emptyFrames: 0,
        textFrames: 0,
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    // Only analyze if textFrames are safe
    if (!preTestResults || arrayIndexOf(preTestResults.safe, 'textFrames') === -1) {
        stats.skipped = true;
        stats.reason = "TextFrames collection not safe for statistics";
        return stats;
    }
    
    var textFrames = progressiveCollectionAccess(doc, 'textFrames', 'standard');
    if (!textFrames) {
        stats.error = "Cannot access textFrames for statistics";
        return stats;
    }
    
    var frameCount = emergencyGetLength(textFrames, 
        ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess);
    
    // Conservative sampling for statistics
    var sampleLimit = Math.min(frameCount, 8); // Sample only 8 frames for statistics
    var timeout = ENHANCED_ANALYSIS_CONFIG.progressiveTimeouts.standard.collectionAccess / 2;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frameResult = emergencyBailoutHandler(function() {
                try {
                    return textFrames[i];
                } catch (e1) {
                    if (textFrames.item) {
                        return textFrames.item(i);
                    }
                    throw e1;
                }
            }, timeout / sampleLimit);
            
            if (frameResult.bailout || !frameResult.result) {
                break; // Stop sampling on first failure
            }
            
            var frame = frameResult.result;
            
            var contentResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(frame, 'contents');
            }, timeout / sampleLimit);
            
            if (!contentResult.bailout && contentResult.result && typeof contentResult.result === 'string') {
                var content = contentResult.result;
                stats.totalCharacters += content.length;
                
                // Quick word count with limit
                var words = content.split(/\s+/);
                var wordCount = 0;
                var maxWords = Math.min(words.length, 100); // Limit word processing
                
                for (var j = 0; j < maxWords; j++) {
                    if (words[j] && words[j].length > 0) {
                        wordCount++;
                    }
                }
                
                // Estimate if we limited word counting
                if (words.length > maxWords) {
                    wordCount = Math.round((wordCount / maxWords) * words.length);
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
    
    stats.processingTime = new Date().getTime() - startTime;
    stats.note = "Based on limited sampling of " + stats.sampleSize + " frames out of " + frameCount + " for safety";
    
    return stats;
}

// Progressive text sampling strategy for standard mode
function progressiveTextSampling(textFrames, mode) {
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    if (!modeConfig) return null;
    
    var frameCount = emergencyGetLength(textFrames, modeConfig.timeout / 4);
    var sampleLimits = {
        minimal: Math.min(frameCount, 2),
        basic: Math.min(frameCount, 5),
        standard: Math.min(frameCount, 8),
        comprehensive: Math.min(frameCount, 20)
    };
    
    return {
        totalFrames: frameCount,
        sampleLimit: sampleLimits[mode] || sampleLimits.basic,
        timeout: modeConfig.timeout,
        timeoutPerFrame: modeConfig.timeout / (sampleLimits[mode] || sampleLimits.basic)
    };
}