// ============================================================================
// CHUNK 3: COMPARISON FUNCTIONS - MODE-AWARE PROPERTY CHANGE DETECTION
// ES3 COMPATIBLE VERSION - ALL RESERVED WORDS FIXED + MODE INTEGRATION
// ============================================================================

// Enhanced comparison function - MODE-AWARE COMPREHENSIVE PROPERTY CHANGE ANALYSIS
function compareDocumentReports(report1, report2) {
    debugLog("Starting mode-aware document comparison", "COMPARE");
    enhancedStatusLog("COMPARE", "Document comparison initializing", 0, 100, "Mode-aware comparison analysis");
    
    var differences = {
        timestamp: toISOString(new Date()),
        mode: getCurrentAnalysisMode(),
        summary: {
            hasChanges: false,
            changedSections: [],
            significantChanges: 0,
            totalChanges: 0
        },
        changes: {},
        errors: [],
        discoveryInfo: {
            textItemsProcessed: 0,
            textItemsChanged: 0,
            propertiesChanged: 0,
            significantChanges: 0,
            changesByType: {},
            changesBySection: {},
            modeBasedFiltering: true
        },
        modeInfo: {
            analysisMode: getCurrentAnalysisMode(),
            comparisonComplexity: "mode_appropriate",
            filteringApplied: true
        }
    };
    
    try {
        // Validate reports before comparison
        enhancedStatusLog("COMPARE", "Validating reports", 5, 100, "Checking report compatibility");
        var reportValidation = validateReportsForComparison(report1, report2);
        if (!reportValidation.compatible) {
            differences.errors.push("Reports not compatible for comparison: " + reportValidation.reason);
            differences.summary.hasChanges = false;
            return differences;
        }
        
        // Get sections to compare based on current mode
        var sectionsToCompare = getModeAppropriateSections(getCurrentAnalysisMode());
        enhancedStatusLog("COMPARE", "Mode-based section selection", 10, 100, 
            "Comparing " + sectionsToCompare.length + " sections for " + getCurrentAnalysisMode() + " mode");
        
        var totalSections = sectionsToCompare.length;
        
        // Compare sections with mode awareness
        for (var i = 0; i < sectionsToCompare.length; i++) {
            var section = sectionsToCompare[i];
            var progress = 15 + Math.round((i / totalSections) * 65); // 15-80% for section comparison
            enhancedStatusLog("COMPARE", "Comparing section: " + section, i + 1, totalSections, 
                "Mode-aware analysis of " + section);
            
            try {
                debugLog("Comparing section: " + section, "COMPARE");
                var sectionReport1 = safeGetProperty(report1, section);
                var sectionReport2 = safeGetProperty(report2, section);
                var changes = compareModeAwareSection(sectionReport1, sectionReport2, section, getCurrentAnalysisMode());
                var changesLength = safeGetLength(changes);
                
                if (changesLength > 0) {
                    differences.summary.hasChanges = true;
                    differences.summary.changedSections.push(section);
                    differences.changes[section] = changes;
                    differences.summary.totalChanges += changesLength;
                    debugLog("Found " + changesLength + " changes in " + section, "COMPARE");
                    enhancedStatusLog("COMPARE", "Changes detected in " + section, i + 1, totalSections, 
                        changesLength + " property changes found");
                } else {
                    enhancedStatusLog("COMPARE", "No changes in " + section, i + 1, totalSections, 
                        "Section identical to baseline");
                }
            } catch (exc) {
                differences.errors.push("Section comparison failed: " + section + " - " + exc.message);
                logError("Section comparison failed: " + section + " - " + exc.message, 'comparison', 'high');
                enhancedStatusLog("COMPARE", "Section comparison failed: " + section, i + 1, totalSections, 
                    "Error: " + exc.message);
            }
        }
        
        enhancedStatusLog("COMPARE", "Calculating discovery information", 85, 100, 
            "Generating mode-aware change analysis");
        
        // Calculate enhanced discovery info with mode awareness
        differences.discoveryInfo = calculateModeAwareDiscoveryInfo(report1, report2, differences.changes, getCurrentAnalysisMode());
        differences.summary.significantChanges = safeGetProperty(differences.discoveryInfo, 'significantChanges', 0);
        
        // Apply mode-based filtering to results
        enhancedStatusLog("COMPARE", "Applying mode-based filtering", 90, 100, 
            "Filtering results for " + getCurrentAnalysisMode() + " mode");
        differences = filterComparisonByMode(differences, getCurrentAnalysisMode());
        
        enhancedStatusLog("COMPARE", "Comparison completed", 100, 100, 
            "Total changes: " + differences.summary.totalChanges + 
            ", Significant: " + differences.summary.significantChanges + 
            " (Mode: " + getCurrentAnalysisMode() + ")");
        
        debugLog("Mode-aware comparison completed. Changes found: " + differences.summary.hasChanges + 
                ", Total changes: " + differences.summary.totalChanges + 
                ", Mode: " + getCurrentAnalysisMode(), "COMPARE");
        
    } catch (exc) {
        differences.errors.push("Overall comparison failed: " + exc.message);
        logError("Overall comparison failed: " + exc.message, 'comparison', 'critical');
        enhancedStatusLog("COMPARE", "Comparison failed", 100, 100, "Critical error: " + exc.message);
    }
    
    return differences;
}

// Validate reports for comparison compatibility
function validateReportsForComparison(report1, report2) {
    var validation = {
        compatible: false,
        reason: "",
        warnings: []
    };
    
    try {
        // Basic validation
        if (!report1 || !report2) {
            validation.reason = "One or both reports are null or undefined";
            return validation;
        }
        
        // Check if both reports have required structure
        var requiredSections = ['timestamp', 'mode'];
        for (var i = 0; i < requiredSections.length; i++) {
            var section = requiredSections[i];
            if (!safeGetProperty(report1, section) || !safeGetProperty(report2, section)) {
                validation.warnings.push("Missing " + section + " in one or both reports");
            }
        }
        
        // Check mode compatibility
        var mode1 = safeGetProperty(report1, 'mode');
        var mode2 = safeGetProperty(report2, 'mode');
        
        if (mode1 && mode2 && mode1 !== mode2) {
            validation.warnings.push("Reports from different analysis modes: " + mode1 + " vs " + mode2);
            // Still compatible, but note the difference
        }
        
        validation.compatible = true;
        validation.reason = "Reports are compatible for comparison";
        
    } catch (exc) {
        validation.reason = "Report validation failed: " + exc.message;
    }
    
    return validation;
}

// Get sections to compare based on analysis mode
function getModeAppropriateSections(mode) {
    var sectionsByMode = {
        emergency: ['documentProperties', 'accessibilityTest'], // Very limited for emergency mode
        minimal: ['documentInfo', 'documentProperties', 'collectionSizes'], // Basic sections only
        basic: ['documentInfo', 'pageInfo', 'textInfo', 'layerInfo'], // Safe sections
        standard: ['documentInfo', 'pages', 'layers', 'textFrames', 'stories', 'textContent'], // Add text analysis
        comprehensive: ['documentInfo', 'pages', 'layers', 'stories', 'textFrames', 'textContent', 
                       'styles', 'colors', 'fonts', 'images', 'links', 'pageItems'] // All sections
    };
    
    return sectionsByMode[mode] || sectionsByMode.basic; // Default to basic mode sections
}

// Mode-aware comparison that respects the analysis mode capabilities
function compareModeAwareSection(section1, section2, sectionName, mode) {
    var changes = [];
    
    try {
        enhancedStatusLog("MODE_COMPARE", "Comparing " + sectionName + " (mode: " + mode + ")", 0, 1, 
            "Mode-aware section analysis");
        
        // Apply mode-specific comparison depth
        var comparisonDepth = getModeComparisonDepth(mode);
        
        // Type mismatch check
        if (typeof section1 !== typeof section2) {
            changes.push(createModeAwareChangeObject({
                type: "type_change",
                path: sectionName,
                oldValue: typeof section1,
                newValue: typeof section2,
                significance: "high",
                mode: mode
            }, sectionName, mode));
            return changes;
        }
        
        // Null/undefined handling
        if (section1 === null || section2 === null) {
            if (section1 !== section2) {
                changes.push(createModeAwareChangeObject({
                    type: "value_change",
                    path: sectionName,
                    oldValue: section1,
                    newValue: section2,
                    significance: "medium",
                    mode: mode
                }, sectionName, mode));
            }
            return changes;
        }
        
        // Array comparison with mode-aware depth control
        if (typeof section1 === 'object' && section1.constructor === Array) {
            var section1Length = safeGetLength(section1);
            var section2Length = safeGetLength(section2);
            
            if (section1Length !== section2Length) {
                changes.push(createModeAwareChangeObject({
                    type: "length_change",
                    path: sectionName,
                    oldLength: section1Length,
                    newLength: section2Length,
                    significance: "high",
                    mode: mode
                }, sectionName, mode));
                
                enhancedStatusLog("MODE_COMPARE", "Array length changed", 1, 1, 
                    sectionName + ": " + section1Length + " → " + section2Length + " (mode: " + mode + ")");
            }
            
            // Limit comparison depth based on mode
            var maxLength = Math.min(Math.max(section1Length, section2Length), comparisonDepth.arrayItemLimit);
            
            for (var i = 0; i < maxLength; i++) {
                if (i >= section1Length) {
                    changes.push(createModeAwareChangeObject({
                        type: "addition",
                        path: sectionName + "[" + i + "]",
                        newValue: section2[i],
                        significance: "high",
                        mode: mode
                    }, sectionName + "[" + i + "]", mode));
                } else if (i >= section2Length) {
                    changes.push(createModeAwareChangeObject({
                        type: "deletion",
                        path: sectionName + "[" + i + "]",
                        oldValue: section1[i],
                        significance: "high",
                        mode: mode
                    }, sectionName + "[" + i + "]", mode));
                } else {
                    // Recursive comparison with depth control
                    if (comparisonDepth.recursionDepth > 0) {
                        var subDepth = {
                            recursionDepth: comparisonDepth.recursionDepth - 1,
                            arrayItemLimit: comparisonDepth.arrayItemLimit,
                            propertyDepth: comparisonDepth.propertyDepth
                        };
                        var subChanges = compareModeAwareSectionWithDepth(section1[i], section2[i], 
                                                                         sectionName + "[" + i + "]", mode, subDepth);
                        changes = changes.concat(subChanges);
                    }
                }
            }
            
            // Note if we truncated the comparison due to mode limits
            if (Math.max(section1Length, section2Length) > maxLength) {
                changes.push(createModeAwareChangeObject({
                    type: "comparison_truncated",
                    path: sectionName,
                    reason: "Comparison limited by " + mode + " mode (limit: " + maxLength + " items)",
                    totalItems: Math.max(section1Length, section2Length),
                    comparedItems: maxLength,
                    significance: "low",
                    mode: mode
                }, sectionName, mode));
            }
            
        } else if (typeof section1 === 'object') {
            // Enhanced object comparison with mode-aware property depth
            var allKeys = {};
            for (var key in section1) allKeys[key] = true;
            for (var key in section2) allKeys[key] = true;
            
            var keyCount = 0;
            for (var key in allKeys) {
                keyCount++;
                
                // Limit property comparison based on mode
                if (keyCount > comparisonDepth.propertyDepth) {
                    changes.push(createModeAwareChangeObject({
                        type: "comparison_truncated",
                        path: sectionName,
                        reason: "Property comparison limited by " + mode + " mode (limit: " + comparisonDepth.propertyDepth + " properties)",
                        significance: "low",
                        mode: mode
                    }, sectionName, mode));
                    break;
                }
                
                if (!(key in section1)) {
                    changes.push(createModeAwareChangeObject({
                        type: "addition",
                        path: sectionName + "." + key,
                        newValue: section2[key],
                        significance: determineModeAwarePropertySignificance(key, sectionName, mode),
                        mode: mode
                    }, sectionName + "." + key, mode));
                } else if (!(key in section2)) {
                    changes.push(createModeAwareChangeObject({
                        type: "deletion",
                        path: sectionName + "." + key,
                        oldValue: section1[key],
                        significance: determineModeAwarePropertySignificance(key, sectionName, mode),
                        mode: mode
                    }, sectionName + "." + key, mode));
                } else {
                    // Recursive comparison with depth control
                    if (comparisonDepth.recursionDepth > 0) {
                        var subDepth = {
                            recursionDepth: comparisonDepth.recursionDepth - 1,
                            arrayItemLimit: comparisonDepth.arrayItemLimit,
                            propertyDepth: comparisonDepth.propertyDepth - 1
                        };
                        var subChanges = compareModeAwareSectionWithDepth(section1[key], section2[key], 
                                                                         sectionName + "." + key, mode, subDepth);
                        changes = changes.concat(subChanges);
                    }
                }
            }
        } else {
            // Enhanced primitive comparison with mode-aware categorization
            if (section1 !== section2) {
                var changeType = "value_change";
                var significance = "medium";
                
                // Mode-aware change type detection
                if (mode === "standard" || mode === "comprehensive") {
                    // Enhanced handling for text-aware modes
                    if (stringIndexOf(sectionName, 'text') !== -1 || stringIndexOf(sectionName, 'contents') !== -1 || stringIndexOf(sectionName, 'textPreview') !== -1) {
                        changeType = "text_content_change";
                        significance = "high";
                    } else if (stringIndexOf(sectionName, 'characterCount') !== -1 || stringIndexOf(sectionName, 'wordCount') !== -1) {
                        changeType = "text_metric_change";
                        significance = "medium";
                    } else if (stringIndexOf(sectionName, 'overflows') !== -1) {
                        changeType = "overflow_change";
                        significance = "high";
                    }
                }
                
                // Enhanced categorization for all modes
                if (stringIndexOf(sectionName, 'bounds') !== -1) {
                    changeType = "geometry_change";
                    significance = "medium";
                } else if (stringIndexOf(sectionName, 'Style') !== -1) {
                    changeType = "style_change";
                    significance = mode === "basic" ? "low" : "medium"; // Less significant in basic mode
                } else if (stringIndexOf(sectionName, 'color') !== -1 || stringIndexOf(sectionName, 'Color') !== -1) {
                    changeType = "color_change";
                    significance = mode === "basic" || mode === "minimal" ? "low" : "medium";
                } else if (stringIndexOf(sectionName, 'font') !== -1 || stringIndexOf(sectionName, 'Font') !== -1) {
                    changeType = "font_change";
                    significance = mode === "basic" || mode === "minimal" ? "low" : "medium";
                }
                
                changes.push(createModeAwareChangeObject({
                    type: changeType,
                    path: sectionName,
                    oldValue: section1,
                    newValue: section2,
                    significance: significance,
                    mode: mode
                }, sectionName, mode));
            }
        }
    } catch (exc) {
        logError("compareModeAwareSection failed for " + sectionName + ": " + exc.message, 'comparison', 'medium');
        changes.push(createModeAwareChangeObject({
            type: "comparison_error",
            path: sectionName,
            error: exc.message,
            significance: "low",
            mode: mode
        }, sectionName, mode));
        enhancedStatusLog("MODE_COMPARE", "Section comparison failed", 1, 1, 
            sectionName + " error: " + exc.message);
    }
    
    return changes;
}

// Get comparison depth limits based on analysis mode
function getModeComparisonDepth(mode) {
    var depthLimits = {
        emergency: {
            recursionDepth: 1,
            arrayItemLimit: 2,
            propertyDepth: 5
        },
        minimal: {
            recursionDepth: 2,
            arrayItemLimit: 5,
            propertyDepth: 10
        },
        basic: {
            recursionDepth: 3,
            arrayItemLimit: 10,
            propertyDepth: 20
        },
        standard: {
            recursionDepth: 4,
            arrayItemLimit: 20,
            propertyDepth: 50
        },
        comprehensive: {
            recursionDepth: 5,
            arrayItemLimit: 50,
            propertyDepth: 100
        }
    };
    
    return depthLimits[mode] || depthLimits.basic;
}

// Compare sections with depth control
function compareModeAwareSectionWithDepth(section1, section2, sectionName, mode, depth) {
    if (depth.recursionDepth <= 0) {
        // Reached depth limit - create a truncation note
        return [createModeAwareChangeObject({
            type: "depth_limit_reached",
            path: sectionName,
            reason: "Comparison depth limit reached for " + mode + " mode",
            significance: "low",
            mode: mode
        }, sectionName, mode)];
    }
    
    // Use the regular comparison but with updated depth
    return compareModeAwareSection(section1, section2, sectionName, mode);
}

// Calculate discovery info with mode awareness
function calculateModeAwareDiscoveryInfo(report1, report2, changes, mode) {
    var info = {
        textItemsProcessed: 0,
        textItemsChanged: 0,
        propertiesChanged: 0,
        significantChanges: 0,
        changesByType: {},
        changesBySection: {},
        textChangesDetailed: {
            characterChanges: 0,
            wordChanges: 0,
            paragraphChanges: 0,
            overflowChanges: 0,
            styleChanges: 0
        },
        structuralChanges: {
            pagesChanged: 0,
            layersChanged: 0,
            itemsAdded: 0,
            itemsRemoved: 0
        },
        modeInfo: {
            analysisMode: mode,
            modeAwareFiltering: true,
            comparisonDepth: getModeComparisonDepth(mode)
        }
    };
    
    try {
        enhancedStatusLog("MODE_DISCOVERY", "Analyzing changes for " + mode + " mode", 0, 5, "Mode-aware discovery analysis");
        
        // Enhanced text analysis changes using safe access - only for modes that support text
        if (mode === "standard" || mode === "comprehensive") {
            enhancedStatusLog("MODE_DISCOVERY", "Analyzing text changes", 1, 5, "Text content analysis for " + mode + " mode");
            
            var textContent1 = safeGetProperty(report1, 'textContent');
            var textContent2 = safeGetProperty(report2, 'textContent');
            var text1 = textContent1 ? safeGetProperty(textContent1, 'summary') : null;
            var text2 = textContent2 ? safeGetProperty(textContent2, 'summary') : null;
            
            if (text1 && text2) {
                info.textItemsProcessed = safeGetProperty(text2, 'totalTextFrames', 0);
                
                // Detailed text change analysis using safe access
                var chars1 = safeGetProperty(text1, 'totalCharacters', 0);
                var chars2 = safeGetProperty(text2, 'totalCharacters', 0);
                if (chars2 !== chars1) {
                    info.textItemsChanged++;
                    info.significantChanges++;
                    info.textChangesDetailed.characterChanges = Math.abs(chars2 - chars1);
                }
                
                var words1 = safeGetProperty(text1, 'totalWords', 0);
                var words2 = safeGetProperty(text2, 'totalWords', 0);
                if (words2 !== words1) {
                    info.textItemsChanged++;
                    info.textChangesDetailed.wordChanges = Math.abs(words2 - words1);
                }
                
                var paras1 = safeGetProperty(text1, 'totalParagraphs', 0);
                var paras2 = safeGetProperty(text2, 'totalParagraphs', 0);
                if (paras2 !== paras1) {
                    info.textChangesDetailed.paragraphChanges = Math.abs(paras2 - paras1);
                }
                
                var overflow1 = safeGetProperty(text1, 'overflowingFrames', 0);
                var overflow2 = safeGetProperty(text2, 'overflowingFrames', 0);
                if (overflow2 !== overflow1) {
                    info.textChangesDetailed.overflowChanges = Math.abs(overflow2 - overflow1);
                    info.significantChanges++;
                }
            }
        }
        
        enhancedStatusLog("MODE_DISCOVERY", "Analyzing structural changes", 2, 5, "Document structure analysis for " + mode + " mode");
        
        // Analyze structural changes with mode awareness
        analyzeModeAwareStructuralChanges(report1, report2, info, mode);
        
        enhancedStatusLog("MODE_DISCOVERY", "Counting property changes", 3, 5, "Change categorization for " + mode + " mode");
        
        // Count all property changes by type and section with mode filtering
        for (var section in changes) {
            var sectionChanges = changes[section];
            var sectionChangesLength = safeGetLength(sectionChanges);
            info.changesBySection[section] = sectionChangesLength;
            info.propertiesChanged += sectionChangesLength;
            
            for (var i = 0; i < sectionChangesLength; i++) {
                var change = sectionChanges[i];
                var changeType = safeGetProperty(change, 'type', 'unknown');
                info.changesByType[changeType] = (info.changesByType[changeType] || 0) + 1;
                
                // Count style changes specifically (only relevant for higher modes)
                if (mode === "standard" || mode === "comprehensive") {
                    var changePath = safeGetProperty(change, 'path', '');
                    if (section === 'styles' || stringIndexOf(changePath, 'Style') !== -1) {
                        info.textChangesDetailed.styleChanges++;
                    }
                }
                
                // Identify significant changes with mode awareness
                if (isModeAwareSignificantChange(change, section, mode)) {
                    info.significantChanges++;
                }
            }
        }
        
        enhancedStatusLog("MODE_DISCOVERY", "Processing report statistics", 4, 5, "Extracting mode-specific metrics");
        
        // Get processing stats from reports using safe access
        var discoveryStats2 = safeGetProperty(report2, 'discoveryStats');
        if (discoveryStats2) {
            info.textItemsProcessed = safeGetProperty(discoveryStats2, 'textItemsProcessed', 0);
        }
        
        enhancedStatusLog("MODE_DISCOVERY", "Mode-aware discovery completed", 5, 5, 
            "Properties: " + info.propertiesChanged + ", Significant: " + info.significantChanges + " (Mode: " + mode + ")");
        
        debugLog("Mode-aware discovery info calculated. Properties changed: " + info.propertiesChanged + 
                ", Significant changes: " + info.significantChanges + ", Mode: " + mode, "DISCOVERY");
        
    } catch (exc) {
        logError("Mode-aware discovery info calculation failed: " + exc.message, 'comparison', 'medium');
        enhancedStatusLog("MODE_DISCOVERY", "Discovery analysis failed", 5, 5, "Error: " + exc.message);
    }
    
    return info;
}

function analyzeModeAwareStructuralChanges(report1, report2, info, mode) {
    try {
        enhancedStatusLog("MODE_STRUCTURAL", "Analyzing structural changes for " + mode, 0, 4, "Mode-specific structure comparison");
        
        // Page changes using safe access - available in all modes except emergency
        if (mode !== "emergency") {
            var pages1 = safeGetLength(safeGetProperty(report1, 'pages', []));
            var pages2 = safeGetLength(safeGetProperty(report2, 'pages', []));
            if (pages1 !== pages2) {
                info.structuralChanges.pagesChanged = Math.abs(pages2 - pages1);
                info.significantChanges++;
                enhancedStatusLog("MODE_STRUCTURAL", "Page count changed", 1, 4, 
                    "From " + pages1 + " to " + pages2 + " pages (mode: " + mode + ")");
            }
        }
        
        // Layer changes using safe access - available in basic and higher modes
        if (mode === "basic" || mode === "standard" || mode === "comprehensive") {
            var layers1 = safeGetLength(safeGetProperty(report1, 'layers', []));
            var layers2 = safeGetLength(safeGetProperty(report2, 'layers', []));
            if (layers1 !== layers2) {
                info.structuralChanges.layersChanged = Math.abs(layers2 - layers1);
                info.significantChanges++;
                enhancedStatusLog("MODE_STRUCTURAL", "Layer count changed", 2, 4, 
                    "From " + layers1 + " to " + layers2 + " layers (mode: " + mode + ")");
            }
        }
        
        // Page item changes using safe access - only in comprehensive mode
        if (mode === "comprehensive") {
            var pageItems1 = safeGetProperty(report1, 'pageItems', {});
            var pageItems2 = safeGetProperty(report2, 'pageItems', {});
            var items1 = safeGetProperty(pageItems1, 'totalCount', 0);
            var items2 = safeGetProperty(pageItems2, 'totalCount', 0);
            if (items1 !== items2) {
                var itemDiff = items2 - items1;
                if (itemDiff > 0) {
                    info.structuralChanges.itemsAdded = itemDiff;
                    enhancedStatusLog("MODE_STRUCTURAL", "Page items added", 3, 4, itemDiff + " items added (comprehensive mode)");
                } else {
                    info.structuralChanges.itemsRemoved = Math.abs(itemDiff);
                    enhancedStatusLog("MODE_STRUCTURAL", "Page items removed", 3, 4, Math.abs(itemDiff) + " items removed (comprehensive mode)");
                }
                info.significantChanges++;
            }
        }
        
        enhancedStatusLog("MODE_STRUCTURAL", "Structural analysis completed", 4, 4, "Mode: " + mode + " structure comparison complete");
        
    } catch (exc) {
        debugLog("Mode-aware structural change analysis failed: " + exc.message, "ERROR");
        enhancedStatusLog("MODE_STRUCTURAL", "Structural analysis failed", 4, 4, "Error: " + exc.message);
    }
}

// Determine if a change is significant with mode awareness
function isModeAwareSignificantChange(change, section, mode) {
    var significantTypes = ['addition', 'deletion', 'text_content_change', 'overflow_change'];
    var changeType = safeGetProperty(change, 'type');
    
    if (arrayIndexOf(significantTypes, changeType) !== -1) {
        return true;
    }
    
    // Mode-specific significance rules
    var changePath = safeGetProperty(change, 'path', '');
    
    if (section === 'documentInfo') {
        var significantProps = ['saved', 'modified', 'readonly'];
        // Add page count only for higher modes
        if (mode === "basic" || mode === "standard" || mode === "comprehensive") {
            significantProps.push('pagesPerDocument');
        }
        return arraySome(significantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    // Text significance only matters for text-aware modes
    if ((section === 'textFrames' || section === 'textContent') && (mode === "standard" || mode === "comprehensive")) {
        var textSignificantProps = ['overflows', 'characterCount', 'wordCount', 'appliedParagraphStyle', 'fontFamily', 'fontSize'];
        return arraySome(textSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    if (section === 'pages' && mode !== "emergency") {
        var pageSignificantProps = ['bounds', 'appliedMaster'];
        // Add item counts only for higher modes
        if (mode === "standard" || mode === "comprehensive") {
            pageSignificantProps.push('textFrameCount', 'imageCount');
        }
        return arraySome(pageSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    // Image/link significance only for comprehensive mode
    if ((section === 'images' || section === 'links') && mode === "comprehensive") {
        var linkSignificantProps = ['status', 'filePath', 'size', 'date'];
        return arraySome(linkSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    return false;
}

// Determine property significance with mode awareness
function determineModeAwarePropertySignificance(propertyName, sectionName, mode) {
    // High significance properties - adjust based on mode
    var highSigProps = ['overflows', 'bounds', 'name', 'saved', 'modified'];
    
    // Add mode-specific high significance properties
    if (mode === "standard" || mode === "comprehensive") {
        highSigProps = highSigProps.concat(['characterCount', 'wordCount', 'status', 'filePath']);
    }
    
    if (arrayIndexOf(highSigProps, propertyName) !== -1) {
        return "high";
    }
    
    // Text-related properties are significant only in text-aware modes
    if ((mode === "standard" || mode === "comprehensive") && 
        (stringIndexOf(sectionName, 'text') !== -1 || stringIndexOf(sectionName, 'Text') !== -1)) {
        var textSigProps = ['appliedParagraphStyle', 'appliedCharacterStyle', 'fontFamily', 'fontSize', 'textColor', 'isThreaded'];
        if (arrayIndexOf(textSigProps, propertyName) !== -1) {
            return "high";
        }
    }
    
    // Style and color changes significance varies by mode
    if (stringIndexOf(sectionName, 'style') !== -1 || stringIndexOf(sectionName, 'color') !== -1) {
        return mode === "comprehensive" ? "medium" : "low";
    }
    
    // Image and link properties only significant in comprehensive mode
    if ((stringIndexOf(sectionName, 'image') !== -1 || stringIndexOf(sectionName, 'link') !== -1) && mode === "comprehensive") {
        var imageLinkSigProps = ['status', 'filePath', 'size', 'date', 'actualPpi', 'effectivePpi'];
        if (arrayIndexOf(imageLinkSigProps, propertyName) !== -1) {
            return "high";
        }
    }
    
    // Page and layout properties significance varies by mode
    if (stringIndexOf(sectionName, 'page') !== -1 || stringIndexOf(sectionName, 'layer') !== -1) {
        var layoutSigProps = ['appliedMaster', 'visible', 'locked'];
        if (mode === "standard" || mode === "comprehensive") {
            layoutSigProps = layoutSigProps.concat(['pageItems', 'textFrameCount', 'imageCount']);
        }
        if (arrayIndexOf(layoutSigProps, propertyName) !== -1) {
            return "medium";
        }
    }
    
    // Default significance based on mode
    return mode === "emergency" || mode === "minimal" ? "low" : "medium";
}

// Create mode-aware change objects with enhanced information
function createModeAwareChangeObject(changeData, analysisPath, mode) {
    var change = {
        type: safeGetProperty(changeData, 'type', 'unknown_change'),
        path: safeGetProperty(changeData, 'path', 'unknown_path'),
        significance: safeGetProperty(changeData, 'significance', 'medium'),
        mode: mode,
        modeAware: true,
        accessPath: null,
        safetyNotes: []
    };
    
    // Copy other properties safely
    var knownProps = ['oldValue', 'newValue', 'oldLength', 'newLength', 'error'];
    for (var i = 0; i < knownProps.length; i++) {
        var prop = knownProps[i];
        if (changeData.hasOwnProperty && changeData.hasOwnProperty(prop)) {
            change[prop] = changeData[prop];
        }
    }
    
    // Generate mode-aware access path and safety notes
    try {
        change.accessPath = generateModeAwareAccessPath(analysisPath, mode);
        change.safetyNotes = generateModeAwareSafetyNotes(analysisPath, mode);
    } catch (exc) {
        logError("Failed to generate mode-aware access info for " + analysisPath + ": " + exc.message, 'accessPath', 'medium');
        change.accessPath = {
            primary: "// Error generating access path: " + exc.message,
            alternatives: ["// Use try-catch for safe access", "// Check InDesign API documentation"],
            safetyLevel: "error",
            mode: mode
        };
        change.safetyNotes = [
            "Error generating safety notes - use comprehensive error handling",
            "Test access patterns with your specific InDesign version and " + mode + " mode"
        ];
    }
    
    return change;
}

// Generate mode-aware access paths
function generateModeAwareAccessPath(analysisPath, mode) {
    var accessInfo = {
        primary: "",
        alternatives: [],
        safetyLevel: "medium",
        collectionMethod: "",
        errorMessage: null,
        mode: mode,
        modeRecommendations: []
    };
    
    try {
        if (!analysisPath || typeof analysisPath !== 'string') {
            accessInfo.primary = "// Invalid path provided";
            accessInfo.errorMessage = "Path is null, undefined, or not a string";
            accessInfo.safetyLevel = "error";
            return accessInfo;
        }
        
        var cleanPath = analysisPath.replace(/^\/+|\/+$/g, '').replace(/\s+/g, '');
        var fullPath = "doc." + cleanPath;
        accessInfo.primary = fullPath;
        
        // Mode-aware safety recommendations
        if (mode === "emergency") {
            accessInfo.modeRecommendations.push("Emergency mode: Use only emergencyGetProperty() for ultra-safe access");
            accessInfo.safetyLevel = "emergency";
        } else if (mode === "minimal") {
            accessInfo.modeRecommendations.push("Minimal mode: Pre-test all collection access before use");
            accessInfo.safetyLevel = "high";
        } else if (mode === "basic") {
            accessInfo.modeRecommendations.push("Basic mode: Use progressive collection access for safety");
            accessInfo.safetyLevel = "high";
        } else if (mode === "standard") {
            accessInfo.modeRecommendations.push("Standard mode: Safe to access text content with timeouts");
            accessInfo.safetyLevel = "medium";
        } else if (mode === "comprehensive") {
            accessInfo.modeRecommendations.push("Comprehensive mode: Pre-test risky collections before access");
            accessInfo.safetyLevel = "medium";
        }
        
        // Enhanced pattern matching with mode awareness
        if (stringIndexOf(cleanPath, 'textContent') !== -1) {
            // Text content access patterns with mode considerations
            if (mode === "emergency" || mode === "minimal") {
                accessInfo.primary = "// Text content not available in " + mode + " mode";
                accessInfo.alternatives = [
                    "// Use standard or comprehensive mode for text content access",
                    "// Consider upgrading to higher analysis mode"
                ];
                accessInfo.safetyLevel = "not_available";
            } else {
                accessInfo.primary = "doc.textFrames[n].contents";
                accessInfo.alternatives = [
                    "doc.stories[n].contents",
                    "doc.textFrames.item(n).contents",
                    "// Use safeTextCapture() for safe text extraction"
                ];
                accessInfo.collectionMethod = "Length: safeGetLength(doc.textFrames)";
                accessInfo.safetyLevel = "high";
            }
        } else if (stringIndexOf(cleanPath, 'images') !== -1 || stringIndexOf(cleanPath, 'links') !== -1) {
            // Risky collection access with mode restrictions
            if (mode !== "comprehensive") {
                accessInfo.primary = "// Images/links not available in " + mode + " mode";
                accessInfo.alternatives = [
                    "// Use comprehensive mode for images/links access",
                    "// These collections require pre-testing for safety"
                ];
                accessInfo.safetyLevel = "not_available";
            } else {
                var collType = stringIndexOf(cleanPath, 'images') !== -1 ? 'images' : 'links';
                accessInfo.primary = "doc." + collType + "[n] // Pre-tested safe access only";
                accessInfo.alternatives = [
                    "// Pre-test collection safety before access",
                    "// Use progressiveCollectionAccess() for safety",
                    "// Emergency bailouts recommended for these collections"
                ];
                accessInfo.safetyLevel = "low"; // Still risky even in comprehensive mode
            }
        } else if (stringIndexOf(cleanPath, 'pages') !== -1) {
            // Page access patterns - available in most modes
            if (mode === "emergency") {
                accessInfo.primary = "// Page collection not available in emergency mode";
                accessInfo.alternatives = ["// Use minimal or higher mode for page access"];
                accessInfo.safetyLevel = "not_available";
            } else {
                accessInfo.primary = "doc.pages[n]";
                accessInfo.alternatives = [
                    "doc.pages.item(n)",
                    "doc.pages.itemByRange(n, n)[0]"
                ];
                accessInfo.collectionMethod = "Length: safeGetLength(doc.pages)";
                accessInfo.safetyLevel = "high";
            }
        }
        
        // Add mode-specific safety alternatives
        if (accessInfo.alternatives.length === 0) {
            accessInfo.alternatives = [
                "// Use try-catch for safe access",
                "// Check object exists before accessing properties",
                "// Mode: " + mode + " - use appropriate safety level"
            ];
        }
        
        // Add discovered alternatives if available
        for (var prop in ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives) {
            if (stringIndexOf(cleanPath, prop) !== -1) {
                accessInfo.alternatives.unshift("// Alternative discovered: use ." + 
                    ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives[prop] + " instead of ." + prop);
                break;
            }
        }
        
    } catch (exc) {
        logError("generateModeAwareAccessPath failed: " + exc.message, 'accessPath', 'high');
        accessInfo.primary = "// Error generating access path: " + exc.message;
        accessInfo.errorMessage = "Path generation failed: " + exc.message;
        accessInfo.safetyLevel = "error";
        accessInfo.alternatives = [
            "// Use comprehensive try-catch pattern",
            "// Test with " + mode + " mode constraints",
            "// Check InDesign version compatibility"
        ];
    }
    
    return accessInfo;
}

// Generate mode-aware safety notes
function generateModeAwareSafetyNotes(analysisPath, mode) {
    var notes = [];
    
    try {
        if (!analysisPath || typeof analysisPath !== 'string') {
            notes.push("Invalid path - cannot generate safety notes");
            return notes;
        }
        
        var pathLower = analysisPath.toLowerCase();
        
        // Mode-specific safety rules
        var modeNotes = {
            emergency: [
                "Emergency mode: Use only emergencyGetProperty() with ultra-fast timeouts",
                "No collection access allowed - properties only",
                "Maximum 500ms timeout for entire operation"
            ],
            minimal: [
                "Minimal mode: Pre-test all collections before access",
                "Limited to safest collections only (pages)",
                "Use progressive collection access for safety"
            ],
            basic: [
                "Basic mode: Safe collections only with timeouts",
                "No text content processing in this mode",
                "Collection pre-testing recommended"
            ],
            standard: [
                "Standard mode: Text content available with sampling",
                "Limited risky collection access",
                "Use emergency bailouts for safety"
            ],
            comprehensive: [
                "Comprehensive mode: Full access with pre-testing",
                "Risky collections require safety verification",
                "Use shortest timeouts for dangerous collections"
            ]
        };
        
        // Add mode-specific notes
        var currentModeNotes = modeNotes[mode];
        if (currentModeNotes) {
            for (var i = 0; i < currentModeNotes.length; i++) {
                notes.push(currentModeNotes[i]);
            }
        }
        
        // Enhanced safety rules based on InDesign API experience and mode
        var safetyRules = [
            { 
                pattern: 'textcontent', 
                notes: mode === "standard" || mode === "comprehensive" ? [
                    'Text content may be large - use substring() for previews',
                    'Check for special characters and formatting codes',
                    'Verify contents property exists before accessing'
                ] : ['Text content not available in ' + mode + ' mode']
            },
            { 
                pattern: 'images', 
                notes: mode === "comprehensive" ? [
                    'Images collection requires pre-testing for safety',
                    'Use emergency bailouts - this collection causes hanging',
                    'Limit sample size and use short timeouts'
                ] : ['Images collection not available in ' + mode + ' mode']
            },
            { 
                pattern: 'links', 
                notes: mode === "comprehensive" ? [
                    'Links collection extremely dangerous - pre-test required',
                    'File paths may be invalid or moved',
                    'Use ultra-short timeouts for link access'
                ] : ['Links collection not available in ' + mode + ' mode']
            },
            { 
                pattern: 'pages', 
                notes: mode !== "emergency" ? [
                    'Page access generally reliable in ' + mode + ' mode',
                    'Check documentOffset for proper page numbering',
                    'Master page properties may be inherited'
                ] : ['Page collection not available in emergency mode']
            }
        ];
        
        // Apply specific safety rules - ES3 compatible
        for (var i = 0; i < safetyRules.length; i++) {
            var rule = safetyRules[i];
            if (stringIndexOf(pathLower, rule.pattern) !== -1) {
                for (var j = 0; j < rule.notes.length; j++) {
                    if (arrayIndexOf(notes, rule.notes[j]) === -1) {
                        notes.push(rule.notes[j]);
                    }
                }
                break;
            }
        }
        
        // Universal safety patterns with mode awareness
        if (stringIndexOf(pathLower, '[') !== -1) {
            notes.push("Array/collection access - always check length first");
            if (mode === "emergency") {
                notes.push("Collections not allowed in emergency mode");
            } else {
                notes.push("Use progressive collection access for " + mode + " mode safety");
            }
        }
        
        // Ensure we always have basic safety guidance
        if (notes.length === 0) {
            notes.push("Use mode-appropriate safety patterns for " + mode + " mode");
            notes.push("Always validate objects exist before accessing properties");
            notes.push("Test thoroughly with your specific document types and " + mode + " mode constraints");
        }
        
    } catch (exc) {
        logError("generateModeAwareSafetyNotes failed: " + exc.message, 'safetyNotes', 'medium');
        notes = [
            "Error generating safety notes: " + exc.message,
            "Use comprehensive try-catch pattern for all property access",
            "Test access patterns with " + mode + " mode constraints"
        ];
    }
    
    return notes;
}

// Filter comparison results based on analysis mode
function filterComparisonByMode(differences, mode) {
    try {
        enhancedStatusLog("MODE_FILTER", "Filtering comparison results", 0, 3, "Applying " + mode + " mode filters");
        
        // Get mode-specific filtering rules
        var filterRules = getModeFilteringRules(mode);
        
        // Filter changes based on mode significance levels
        for (var section in differences.changes) {
            var sectionChanges = differences.changes[section];
            var filteredChanges = [];
            
            for (var i = 0; i < safeGetLength(sectionChanges); i++) {
                var change = sectionChanges[i];
                var changeSignificance = safeGetProperty(change, 'significance', 'medium');
                
                // Include change if it meets the mode's significance threshold
                if (arrayIndexOf(filterRules.significanceLevels, changeSignificance) !== -1) {
                    filteredChanges.push(change);
                }
            }
            
            differences.changes[section] = filteredChanges;
        }
        
        // Recalculate summary after filtering
        enhancedStatusLog("MODE_FILTER", "Recalculating summary", 2, 3, "Updating totals after mode filtering");
        var totalChanges = 0;
        var significantChanges = 0;
        
        for (var section in differences.changes) {
            var sectionChanges = differences.changes[section];
            totalChanges += safeGetLength(sectionChanges);
            
            for (var i = 0; i < safeGetLength(sectionChanges); i++) {
                var change = sectionChanges[i];
                if (safeGetProperty(change, 'significance') === 'high') {
                    significantChanges++;
                }
            }
        }
        
        differences.summary.totalChanges = totalChanges;
        differences.summary.significantChanges = significantChanges;
        differences.summary.hasChanges = totalChanges > 0;
        
        // Add filtering info
        differences.modeInfo.filteringApplied = true;
        differences.modeInfo.filterRules = filterRules;
        
        enhancedStatusLog("MODE_FILTER", "Mode filtering completed", 3, 3, 
            "Filtered to " + totalChanges + " changes for " + mode + " mode");
        
    } catch (exc) {
        logError("Mode-based filtering failed: " + exc.message, 'comparison', 'medium');
    }
    
    return differences;
}

// Get filtering rules based on analysis mode
function getModeFilteringRules(mode) {
    var rules = {
        emergency: {
            significanceLevels: ['high'], // Only show critical changes
            maxChangesToShow: 5,
            description: "Only critical changes shown"
        },
        minimal: {
            significanceLevels: ['high'], // Only show important changes
            maxChangesToShow: 10,
            description: "Important changes only"
        },
        basic: {
            significanceLevels: ['high', 'medium'], // Show important and moderate changes
            maxChangesToShow: 25,
            description: "Important and moderate changes"
        },
        standard: {
            significanceLevels: ['high', 'medium'], // Show most changes
            maxChangesToShow: 50,
            description: "Most changes with text analysis"
        },
        comprehensive: {
            significanceLevels: ['high', 'medium', 'low'], // Show all changes
            maxChangesToShow: 100,
            description: "All detected changes"
        }
    };
    
    return rules[mode] || rules.basic;
}

// Progressive comparison strategy that adapts to analysis mode
function progressiveComparisonStrategy(report1, report2) {
    var strategy = {
        mode: getCurrentAnalysisMode(),
        sectionsToCompare: [],
        comparisonDepth: {},
        timeoutLimits: {},
        filteringRules: {}
    };
    
    try {
        // Get mode-appropriate sections and limits
        strategy.sectionsToCompare = getModeAppropriateSections(strategy.mode);
        strategy.comparisonDepth = getModeComparisonDepth(strategy.mode);
        strategy.filteringRules = getModeFilteringRules(strategy.mode);
        
        // Set timeout limits based on mode
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[strategy.mode];
        if (modeConfig) {
            strategy.timeoutLimits = {
                totalComparison: modeConfig.timeout,
                perSection: modeConfig.timeout / strategy.sectionsToCompare.length,
                perProperty: modeConfig.timeout / 100 // Rough estimate
            };
        }
        
        debugLog("Progressive comparison strategy configured for " + strategy.mode + " mode", "STRATEGY");
        
    } catch (exc) {
        debugLog("Progressive comparison strategy failed: " + exc.message, "ERROR");
        strategy = { mode: "basic", error: exc.message };
    }
    
    return strategy;
}

// Main comparison function that uses mode-aware comparison
function compareModeAwareReports(report1, report2, mode) {
    // Set the current mode for this comparison
    var originalMode = getCurrentAnalysisMode();
    setAnalysisMode(mode);
    
    try {
        // Use the standard comparison function which now respects the current mode
        var result = compareDocumentReports(report1, report2);
        return result;
    } finally {
        // Restore original mode
        setAnalysisMode(originalMode);
    }
}

// Legacy function for backwards compatibility - now mode-aware
function compareSection(section1, section2, sectionName) {
    return compareModeAwareSection(section1, section2, sectionName, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function isSignificantChange(change, section) {
    return isModeAwareSignificantChange(change, section, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function createChangeObject(changeData, analysisPath) {
    return createModeAwareChangeObject(changeData, analysisPath, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function calculateEnhancedDiscoveryInfo(report1, report2, changes) {
    return calculateModeAwareDiscoveryInfo(report1, report2, changes, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function determinePropertySignificance(propertyName, sectionName) {
    return determineModeAwarePropertySignificance(propertyName, sectionName, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function generateEnhancedAccessPath(analysisPath) {
    return generateModeAwareAccessPath(analysisPath, getCurrentAnalysisMode());
}

// Legacy function for backwards compatibility - now mode-aware
function generateSafetyNotes(analysisPath) {
    return generateModeAwareSafetyNotes(analysisPath, getCurrentAnalysisMode());
}