// ============================================================================
// CHUNK 2.0: EMERGENCY MODE ANALYSIS - ULTRA-SAFE DOCUMENT ACCESS
// ES3 COMPATIBLE VERSION - ZERO COLLECTION ACCESS FOR BROKEN DOCUMENTS
// ============================================================================

// ============================================================================
// EMERGENCY MODE: ULTRA-SAFE MODE FOR COMPLETELY BROKEN DOCUMENTS
// ============================================================================

function createEmergencyPropertyDump(doc) {
    enhancedStatusLog("EMERGENCY", "Starting emergency property dump", 0, 8, "Ultra-safe mode - properties only");
    
    var dump = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk-emergency",
        mode: "EMERGENCY_PROPERTY_DUMP",
        safetyLevel: "ultra_safe",
        timeout: EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY,
        documentProperties: {},
        accessibilityTest: {},
        emergencyValidation: {},
        processingTime: 0,
        errors: [],
        warnings: [],
        recommendations: []
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Step 1: Emergency document validation
        enhancedStatusLog("EMERGENCY", "Emergency validation", 1, 8, "Testing basic document accessibility");
        dump.emergencyValidation = emergencyValidateBasicAccess(doc);
        
        if (!dump.emergencyValidation.accessible) {
            dump.errors.push("Document not accessible - cannot proceed with any analysis");
            dump.recommendations.push("Document may be corrupted or in incompatible state");
            enhancedStatusLog("EMERGENCY", "Document inaccessible", 8, 8, "Emergency analysis failed");
            return dump;
        }
        
        // Step 2: Essential document properties only
        enhancedStatusLog("EMERGENCY", "Testing essential properties", 2, 8, "Name, saved status, basic info");
        dump.documentProperties = emergencyDocumentInfo(doc);
        
        // Step 3: Property accessibility testing
        enhancedStatusLog("EMERGENCY", "Testing property accessibility", 4, 8, "Safe property exploration");
        dump.accessibilityTest = emergencyPropertyExploration(doc);
        
        // Step 4: Memory check
        enhancedStatusLog("EMERGENCY", "Memory validation", 6, 8, "Checking memory constraints");
        dump.memoryStatus = emergencyMemoryCheck();
        
        // Step 5: Generate recommendations
        enhancedStatusLog("EMERGENCY", "Generating recommendations", 7, 8, "Safe mode recommendations");
        dump.recommendations = generateEmergencyRecommendations(dump);
        
        dump.processingTime = new Date().getTime() - startTime;
        enhancedStatusLog("EMERGENCY", "Emergency analysis completed", 8, 8, 
            "Completed in " + dump.processingTime + "ms - ultra safe mode");
        
        // Final safety check - ensure we didn't exceed emergency timeout
        if (dump.processingTime > EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY) {
            dump.warnings.push("Emergency analysis exceeded ultra-safe timeout (" + dump.processingTime + "ms)");
            dump.recommendations.push("Document may require manual inspection - automated analysis too slow");
        }
        
    } catch (exc) {
        dump.errors.push("Emergency analysis failed: " + exc.message);
        dump.recommendations.push("Document is likely corrupted or incompatible");
        enhancedStatusLog("EMERGENCY", "Emergency analysis failed", 8, 8, "Error: " + exc.message);
    }
    
    return dump;
}

// Emergency document validation - test if document is accessible at all
function emergencyValidateBasicAccess(doc) {
    var validation = {
        accessible: false,
        canAccessName: false,
        canAccessSaved: false,
        canAccessBasicState: false,
        responseTime: 0,
        errors: []
    };
    
    var startTime = new Date().getTime();
    
    try {
        enhancedStatusLog("EMERGENCY_VAL", "Testing document object", 0, 3, "Checking if document exists");
        
        // Test 1: Document exists
        if (!doc) {
            validation.errors.push("Document object is null or undefined");
            return validation;
        }
        
        // Test 2: Basic property access with ultra-fast timeout
        enhancedStatusLog("EMERGENCY_VAL", "Testing name property", 1, 3, "Ultra-fast property test");
        
        var nameTestResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(doc, 'name');
        }, EMERGENCY_TIMEOUTS.PROPERTY_ACCESS);
        
        if (!nameTestResult.bailout && nameTestResult.result) {
            validation.canAccessName = true;
            enhancedStatusLog("EMERGENCY_VAL", "Name accessible", 1, 3, "Document name: " + nameTestResult.result);
        } else {
            validation.errors.push("Cannot access document name property");
        }
        
        // Test 3: Saved status
        enhancedStatusLog("EMERGENCY_VAL", "Testing saved property", 2, 3, "Document state check");
        
        var savedTestResult = emergencyBailoutHandler(function() {
            return emergencyGetProperty(doc, 'saved');
        }, EMERGENCY_TIMEOUTS.PROPERTY_ACCESS);
        
        if (!savedTestResult.bailout) {
            validation.canAccessSaved = true;
            enhancedStatusLog("EMERGENCY_VAL", "Saved status accessible", 2, 3, "Saved: " + savedTestResult.result);
        } else {
            validation.errors.push("Cannot access document saved property");
        }
        
        // Test 4: Overall accessibility determination
        enhancedStatusLog("EMERGENCY_VAL", "Determining accessibility", 3, 3, "Final validation");
        
        if (validation.canAccessName || validation.canAccessSaved) {
            validation.accessible = true;
            validation.canAccessBasicState = true;
            enhancedStatusLog("EMERGENCY_VAL", "Document accessible", 3, 3, "Emergency analysis can proceed");
        } else {
            validation.errors.push("Document is not accessible for emergency analysis");
            enhancedStatusLog("EMERGENCY_VAL", "Document not accessible", 3, 3, "Cannot proceed with any analysis");
        }
        
        validation.responseTime = new Date().getTime() - startTime;
        
    } catch (exc) {
        validation.errors.push("Emergency validation failed: " + exc.message);
        validation.responseTime = new Date().getTime() - startTime;
        enhancedStatusLog("EMERGENCY_VAL", "Validation failed", 3, 3, "Error: " + exc.message);
    }
    
    return validation;
}

// Emergency document info - only the most essential properties
function emergencyDocumentInfo(doc) {
    var info = {
        retrievalMethod: "emergency_ultra_safe",
        timeout: EMERGENCY_TIMEOUTS.PROPERTY_ACCESS,
        properties: {},
        accessible: 0,
        failed: 0,
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    // Ultra-essential properties only
    var emergencyProperties = [
        'name',
        'saved', 
        'modified',
        'visible',
        'id'
    ];
    
    enhancedStatusLog("EMERGENCY_DOC", "Getting emergency document info", 0, emergencyProperties.length, 
        "Testing " + emergencyProperties.length + " essential properties");
    
    for (var i = 0; i < emergencyProperties.length; i++) {
        var prop = emergencyProperties[i];
        
        try {
            enhancedStatusLog("EMERGENCY_DOC", "Testing property: " + prop, i + 1, emergencyProperties.length, 
                "Ultra-fast property access");
            
            var propResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(doc, prop);
            }, EMERGENCY_TIMEOUTS.PROPERTY_ACCESS);
            
            if (!propResult.bailout && propResult.result !== null && propResult.result !== undefined) {
                info.properties[prop] = {
                    value: String(propResult.result),
                    type: typeof propResult.result,
                    accessible: true,
                    responseTime: propResult.duration
                };
                info.accessible++;
                enhancedStatusLog("EMERGENCY_DOC", "Property " + prop + " OK", i + 1, emergencyProperties.length, 
                    "Value: " + String(propResult.result).substring(0, 20));
            } else {
                info.properties[prop] = {
                    accessible: false,
                    error: propResult.bailout ? "Timeout/bailout" : "Null result",
                    responseTime: propResult.duration,
                    bailout: propResult.bailout
                };
                info.failed++;
                enhancedStatusLog("EMERGENCY_DOC", "Property " + prop + " failed", i + 1, emergencyProperties.length, 
                    "Reason: " + (propResult.bailout ? "timeout" : "null result"));
            }
            
        } catch (exc) {
            info.properties[prop] = {
                accessible: false,
                error: exc.message,
                exception: true
            };
            info.failed++;
            enhancedStatusLog("EMERGENCY_DOC", "Property " + prop + " exception", i + 1, emergencyProperties.length, 
                "Error: " + exc.message);
        }
    }
    
    info.processingTime = new Date().getTime() - startTime;
    info.successRate = emergencyProperties.length > 0 ? 
        Math.round((info.accessible / emergencyProperties.length) * 100) : 0;
    
    enhancedStatusLog("EMERGENCY_DOC", "Emergency document info completed", emergencyProperties.length, emergencyProperties.length, 
        "Success rate: " + info.successRate + "% (" + info.accessible + "/" + emergencyProperties.length + ")");
    
    return info;
}

// Emergency property exploration - test which properties are safely accessible
function emergencyPropertyExploration(doc) {
    var exploration = {
        testMethod: "emergency_property_scanning",
        timeout: EMERGENCY_TIMEOUTS.PROPERTY_ACCESS,
        safeProperties: [],
        riskyProperties: [],
        failedProperties: [],
        totalTested: 0,
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    // Test only the most basic, essential property paths
    var testPaths = [
        'name',
        'saved',
        'modified',
        'visible',
        'id',
        'readonly'
        // NOTE: NO nested paths, NO collections, NO complex properties
        // This is emergency mode - ultra-minimal testing only
    ];
    
    enhancedStatusLog("EMERGENCY_EXPLORE", "Starting property exploration", 0, testPaths.length, 
        "Testing " + testPaths.length + " basic properties");
    
    for (var i = 0; i < testPaths.length; i++) {
        var path = testPaths[i];
        exploration.totalTested++;
        
        try {
            enhancedStatusLog("EMERGENCY_EXPLORE", "Testing: " + path, i + 1, testPaths.length, 
                "Emergency property test");
            
            var testResult = emergencyBailoutHandler(function() {
                return emergencyGetProperty(doc, path);
            }, EMERGENCY_TIMEOUTS.PROPERTY_ACCESS);
            
            if (!testResult.bailout) {
                if (testResult.result !== null && testResult.result !== undefined) {
                    exploration.safeProperties.push({
                        path: path,
                        type: typeof testResult.result,
                        preview: String(testResult.result).substring(0, 30),
                        responseTime: testResult.duration
                    });
                    enhancedStatusLog("EMERGENCY_EXPLORE", "Property " + path + " SAFE", i + 1, testPaths.length, 
                        "Response: " + testResult.duration + "ms");
                } else {
                    exploration.riskyProperties.push({
                        path: path,
                        reason: "Returned null/undefined",
                        responseTime: testResult.duration
                    });
                    enhancedStatusLog("EMERGENCY_EXPLORE", "Property " + path + " RISKY", i + 1, testPaths.length, 
                        "Null result");
                }
            } else {
                exploration.failedProperties.push({
                    path: path,
                    reason: "Timeout or bailout in emergency mode",
                    responseTime: testResult.duration,
                    error: testResult.error
                });
                enhancedStatusLog("EMERGENCY_EXPLORE", "Property " + path + " FAILED", i + 1, testPaths.length, 
                    "Emergency bailout triggered");
            }
            
        } catch (exc) {
            exploration.failedProperties.push({
                path: path,
                reason: "Exception during emergency test",
                error: exc.message
            });
            enhancedStatusLog("EMERGENCY_EXPLORE", "Property " + path + " EXCEPTION", i + 1, testPaths.length, 
                "Error: " + exc.message);
        }
        
        // Check if we're exceeding emergency time limits
        var currentTime = new Date().getTime() - startTime;
        if (currentTime > EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY / 2) {
            enhancedStatusLog("EMERGENCY_EXPLORE", "Emergency time limit approaching", i + 1, testPaths.length, 
                "Stopping exploration for safety");
            break;
        }
    }
    
    exploration.processingTime = new Date().getTime() - startTime;
    
    enhancedStatusLog("EMERGENCY_EXPLORE", "Property exploration completed", testPaths.length, testPaths.length, 
        "Safe: " + exploration.safeProperties.length + 
        ", Risky: " + exploration.riskyProperties.length + 
        ", Failed: " + exploration.failedProperties.length);
    
    return exploration;
}

// Emergency memory check - ultra-fast memory validation
function emergencyMemoryCheck() {
    var memoryStatus = {
        testMethod: "emergency_memory_validation",
        available: false,
        smallObjectTest: false,
        stringTest: false,
        gcAvailable: false,
        recommendations: [],
        processingTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        enhancedStatusLog("EMERGENCY_MEM", "Testing memory availability", 0, 3, "Ultra-fast memory tests");
        
        // Test 1: Small object creation
        try {
            var testObj = { test: "emergency", mode: "ultra_safe" };
            if (testObj.test === "emergency") {
                memoryStatus.smallObjectTest = true;
                enhancedStatusLog("EMERGENCY_MEM", "Small object test passed", 1, 3, "Basic memory allocation OK");
            }
        } catch (objError) {
            memoryStatus.recommendations.push("Cannot create small objects - severe memory constraint");
        }
        
        // Test 2: String operations
        try {
            var testString = "emergency" + "_" + "mode";
            if (testString.length === 14) {
                memoryStatus.stringTest = true;
                enhancedStatusLog("EMERGENCY_MEM", "String operations OK", 2, 3, "String manipulation working");
            }
        } catch (strError) {
            memoryStatus.recommendations.push("String operations failing - critical memory issue");
        }
        
        // Test 3: Garbage collection availability
        try {
            if (typeof $.gc === 'function') {
                memoryStatus.gcAvailable = true;
                enhancedStatusLog("EMERGENCY_MEM", "GC available", 3, 3, "Garbage collection accessible");
            } else {
                memoryStatus.recommendations.push("Garbage collection not available");
            }
        } catch (gcError) {
            memoryStatus.recommendations.push("Cannot test garbage collection");
        }
        
        // Overall memory availability
        if (memoryStatus.smallObjectTest && memoryStatus.stringTest) {
            memoryStatus.available = true;
            enhancedStatusLog("EMERGENCY_MEM", "Memory status OK", 3, 3, "Sufficient memory for emergency analysis");
        } else {
            memoryStatus.recommendations.push("Severe memory constraints - analysis may fail");
            enhancedStatusLog("EMERGENCY_MEM", "Memory constrained", 3, 3, "Limited memory available");
        }
        
    } catch (exc) {
        memoryStatus.recommendations.push("Memory testing failed: " + exc.message);
        enhancedStatusLog("EMERGENCY_MEM", "Memory test failed", 3, 3, "Error: " + exc.message);
    }
    
    memoryStatus.processingTime = new Date().getTime() - startTime;
    return memoryStatus;
}

// Generate emergency mode recommendations
function generateEmergencyRecommendations(emergencyDump) {
    var recommendations = [];
    
    try {
        enhancedStatusLog("EMERGENCY_REC", "Generating recommendations", 0, 1, "Analyzing emergency results");
        
        // Document accessibility recommendations
        if (emergencyDump.emergencyValidation && !emergencyDump.emergencyValidation.accessible) {
            recommendations.push("CRITICAL: Document not accessible - may be corrupted or incompatible");
            recommendations.push("Try opening document in InDesign and saving before analysis");
            recommendations.push("Check document permissions and file integrity");
        } else if (emergencyDump.emergencyValidation && emergencyDump.emergencyValidation.accessible) {
            recommendations.push("Document accessible - can proceed with higher analysis modes");
        }
        
        // Property access recommendations
        if (emergencyDump.documentProperties) {
            var successRate = emergencyDump.documentProperties.successRate || 0;
            
            if (successRate >= 80) {
                recommendations.push("Good property access - minimal or basic mode recommended");
                recommendations.push("Document appears stable for standard analysis");
            } else if (successRate >= 50) {
                recommendations.push("Moderate property access - stick with minimal mode initially");
                recommendations.push("Test basic mode with caution");
            } else if (successRate >= 20) {
                recommendations.push("Poor property access - stay in emergency mode");
                recommendations.push("Document may have compatibility issues");
            } else {
                recommendations.push("CRITICAL: Very poor property access - document likely corrupted");
                recommendations.push("Manual inspection required - automated analysis unreliable");
            }
        }
        
        // Memory status recommendations
        if (emergencyDump.memoryStatus && !emergencyDump.memoryStatus.available) {
            recommendations.push("Memory constraints detected - use emergency mode only");
            recommendations.push("Close other applications to free memory");
            recommendations.push("Restart InDesign if memory issues persist");
        }
        
        // Performance recommendations
        if (emergencyDump.processingTime > EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY) {
            recommendations.push("Emergency analysis too slow - document may be problematic");
            recommendations.push("Consider manual inspection instead of automated analysis");
        } else if (emergencyDump.processingTime < EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY / 4) {
            recommendations.push("Fast emergency analysis - document likely suitable for higher modes");
            recommendations.push("Try minimal or basic mode for more detailed analysis");
        }
        
        // Safe mode progression recommendations
        var accessibilityTest = emergencyDump.accessibilityTest;
        if (accessibilityTest) {
            var safeCount = accessibilityTest.safeProperties ? accessibilityTest.safeProperties.length : 0;
            var failedCount = accessibilityTest.failedProperties ? accessibilityTest.failedProperties.length : 0;
            
            if (safeCount >= 4 && failedCount <= 1) {
                recommendations.push("Property access stable - safe to try minimal mode");
                recommendations.push("Consider basic mode if minimal mode works well");
            } else if (safeCount >= 2) {
                recommendations.push("Limited property access - minimal mode may work with caution");
            } else {
                recommendations.push("Very limited property access - stay in emergency mode");
            }
        }
        
        // General recommendations
        recommendations.push("Emergency analysis complete - document basic state captured");
        recommendations.push("Use higher modes only if emergency analysis indicates safety");
        
        enhancedStatusLog("EMERGENCY_REC", "Recommendations generated", 1, 1, 
            recommendations.length + " recommendations created");
        
    } catch (exc) {
        recommendations.push("Failed to generate recommendations: " + exc.message);
        recommendations.push("Proceed with extreme caution - recommendation system failed");
        enhancedStatusLog("EMERGENCY_REC", "Recommendation generation failed", 1, 1, "Error: " + exc.message);
    }
    
    return recommendations;
}

// Emergency status report for UI display
function emergencyStatusReport(doc) {
    var status = {
        mode: "emergency",
        documentAccessible: false,
        basicInfo: "Unknown",
        recommendations: [],
        processingTime: 0,
        canProceedToHigherMode: false
    };
    
    var startTime = new Date().getTime();
    
    try {
        enhancedStatusLog("EMERGENCY_STATUS", "Creating emergency status", 0, 3, "Quick document assessment");
        
        // Quick accessibility test
        var validation = emergencyValidateBasicAccess(doc);
        status.documentAccessible = validation.accessible;
        
        if (status.documentAccessible) {
            // Get basic document name if possible
            var docName = emergencyGetProperty(doc, 'name', 'Unknown Document');
            var docSaved = emergencyGetProperty(doc, 'saved', false);
            
            status.basicInfo = "Document: " + docName + " (Saved: " + (docSaved ? "Yes" : "No") + ")";
            status.canProceedToHigherMode = true;
            status.recommendations.push("Document accessible - can try minimal mode");
            
            enhancedStatusLog("EMERGENCY_STATUS", "Document accessible", 2, 3, "Name: " + docName);
        } else {
            status.basicInfo = "Document not accessible or corrupted";
            status.recommendations.push("Document has serious accessibility issues");
            status.recommendations.push("Manual inspection required");
            
            enhancedStatusLog("EMERGENCY_STATUS", "Document not accessible", 2, 3, "Critical access issues");
        }
        
        enhancedStatusLog("EMERGENCY_STATUS", "Emergency status completed", 3, 3, "Status report ready");
        
    } catch (exc) {
        status.basicInfo = "Emergency status failed: " + exc.message;
        status.recommendations.push("Critical error in emergency mode - document likely corrupted");
        enhancedStatusLog("EMERGENCY_STATUS", "Emergency status failed", 3, 3, "Error: " + exc.message);
    }
    
    status.processingTime = new Date().getTime() - startTime;
    return status;
}

// Emergency timeout protection wrapper
function emergencyTimeoutProtection(operation, timeoutMs, operationName) {
    var timeout = timeoutMs || EMERGENCY_TIMEOUTS.TOTAL_EMERGENCY;
    var name = operationName || "emergency_operation";
    
    enhancedStatusLog("EMERGENCY_TIMEOUT", "Starting protected operation", 0, 1, 
        name + " (timeout: " + timeout + "ms)");
    
    return emergencyBailoutHandler(operation, timeout);
}

// Emergency mode document capabilities for mode recommendation
function emergencyDetectCapabilities(doc) {
    var capabilities = {
        mode: "emergency",
        basicAccess: false,
        propertyAccess: 0,
        recommendedNextMode: "emergency",
        processingTime: 0,
        canProgress: false
    };
    
    var startTime = new Date().getTime();
    
    try {
        enhancedStatusLog("EMERGENCY_CAP", "Emergency capability detection", 0, 2, "Testing basic capabilities");
        
        // Test basic access
        var validation = emergencyValidateBasicAccess(doc);
        capabilities.basicAccess = validation.accessible;
        
        if (capabilities.basicAccess) {
            // Test property access count
            var properties = emergencyDocumentInfo(doc);
            capabilities.propertyAccess = properties.accessible || 0;
            
            // Recommend next mode based on results
            if (capabilities.propertyAccess >= 4) {
                capabilities.recommendedNextMode = "minimal";
                capabilities.canProgress = true;
                enhancedStatusLog("EMERGENCY_CAP", "Can progress to minimal", 2, 2, "Good property access");
            } else if (capabilities.propertyAccess >= 2) {
                capabilities.recommendedNextMode = "minimal";
                capabilities.canProgress = false; // Can try but with caution
                enhancedStatusLog("EMERGENCY_CAP", "Minimal mode with caution", 2, 2, "Limited property access");
            } else {
                capabilities.recommendedNextMode = "emergency";
                capabilities.canProgress = false;
                enhancedStatusLog("EMERGENCY_CAP", "Stay in emergency mode", 2, 2, "Poor property access");
            }
        } else {
            capabilities.recommendedNextMode = "emergency";
            enhancedStatusLog("EMERGENCY_CAP", "Document not accessible", 2, 2, "Cannot progress");
        }
        
    } catch (exc) {
        capabilities.recommendedNextMode = "emergency";
        enhancedStatusLog("EMERGENCY_CAP", "Capability detection failed", 2, 2, "Error: " + exc.message);
    }
    
    capabilities.processingTime = new Date().getTime() - startTime;
    return capabilities;
}