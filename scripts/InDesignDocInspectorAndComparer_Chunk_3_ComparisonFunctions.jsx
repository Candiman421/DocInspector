// ============================================================================
// CHUNK 3: COMPARISON FUNCTIONS - ROBUST PROPERTY CHANGE DETECTION
// ES3 COMPATIBLE VERSION - ALL RESERVED WORDS FIXED
// ============================================================================

// Enhanced comparison function - COMPREHENSIVE PROPERTY CHANGE ANALYSIS
function compareDocumentReports(report1, report2) {
    debugLog("Starting comprehensive document comparison", "COMPARE");
    enhancedStatusLog("COMPARE", "Document comparison initializing", 0, 100, "Setting up comparison analysis");
    
    var differences = {
        timestamp: toISOString(new Date()),
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
            changesBySection: {}
        }
    };
    
    try {
        // Compare all essential sections for comprehensive change detection
        var sections = ['documentInfo', 'pages', 'layers', 'stories', 'textFrames', 
                       'textContent', 'styles', 'colors', 'fonts', 'images', 'links', 'pageItems'];
        
        var totalSections = sections.length;
        
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var progress = Math.round((i / totalSections) * 80); // Reserve 20% for final processing
            enhancedStatusLog("COMPARE", "Comparing section: " + section, i + 1, totalSections, 
                "Analyzing " + section + " for property changes");
            
            try {
                debugLog("Comparing section: " + section, "COMPARE");
                var sectionReport1 = safeGetProperty(report1, section);
                var sectionReport2 = safeGetProperty(report2, section);
                var changes = compareSection(sectionReport1, sectionReport2, section);
                var changesLength = safeGetLength(changes); // FIXED: Use safeGetLength
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
            } catch (exc) { // FIXED: error -> exc
                differences.errors.push("Section comparison failed: " + section + " - " + exc.message);
                logError("Section comparison failed: " + section + " - " + exc.message, 'comparison', 'high');
                enhancedStatusLog("COMPARE", "Section comparison failed: " + section, i + 1, totalSections, 
                    "Error: " + exc.message);
            }
        }
        
        enhancedStatusLog("COMPARE", "Calculating discovery information", totalSections, totalSections, 
            "Generating comprehensive change analysis");
        
        // Calculate enhanced discovery info
        differences.discoveryInfo = calculateEnhancedDiscoveryInfo(report1, report2, differences.changes);
        differences.summary.significantChanges = safeGetProperty(differences.discoveryInfo, 'significantChanges', 0);
        
        enhancedStatusLog("COMPARE", "Comparison completed", 100, 100, 
            "Total changes: " + differences.summary.totalChanges + 
            ", Significant: " + differences.summary.significantChanges);
        
        debugLog("Comparison completed. Changes found: " + differences.summary.hasChanges + 
                ", Total changes: " + differences.summary.totalChanges, "COMPARE");
        
    } catch (exc) { // FIXED: error -> exc
        differences.errors.push("Overall comparison failed: " + exc.message);
        logError("Overall comparison failed: " + exc.message, 'comparison', 'critical');
        enhancedStatusLog("COMPARE", "Comparison failed", 100, 100, "Critical error: " + exc.message);
    }
    
    return differences;
}

function calculateEnhancedDiscoveryInfo(report1, report2, changes) {
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
        }
    };
    
    try {
        enhancedStatusLog("DISCOVERY", "Analyzing text changes", 0, 5, "Comparing text content metrics");
        
        // Enhanced text analysis changes using safe access
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
        
        enhancedStatusLog("DISCOVERY", "Analyzing structural changes", 1, 5, "Comparing document structure");
        
        // Analyze structural changes
        analyzeStructuralChanges(report1, report2, info);
        
        enhancedStatusLog("DISCOVERY", "Counting property changes", 2, 5, "Categorizing all detected changes");
        
        // Count all property changes by type and section
        for (var section in changes) {
            var sectionChanges = changes[section];
            var sectionChangesLength = safeGetLength(sectionChanges); // FIXED: Use safeGetLength
            info.changesBySection[section] = sectionChangesLength;
            info.propertiesChanged += sectionChangesLength;
            
            for (var i = 0; i < sectionChangesLength; i++) {
                var change = sectionChanges[i];
                var changeType = safeGetProperty(change, 'type', 'unknown');
                info.changesByType[changeType] = (info.changesByType[changeType] || 0) + 1;
                
                // Count style changes specifically
                var changePath = safeGetProperty(change, 'path', '');
                if (section === 'styles' || stringIndexOf(changePath, 'Style') !== -1) {
                    info.textChangesDetailed.styleChanges++;
                }
                
                // Identify significant changes
                if (isSignificantChange(change, section)) {
                    info.significantChanges++;
                }
            }
        }
        
        enhancedStatusLog("DISCOVERY", "Processing report statistics", 3, 5, "Extracting processing metrics");
        
        // Get processing stats from reports using safe access
        var discoveryStats2 = safeGetProperty(report2, 'discoveryStats');
        if (discoveryStats2) {
            info.textItemsProcessed = safeGetProperty(discoveryStats2, 'textItemsProcessed', 0);
        }
        
        enhancedStatusLog("DISCOVERY", "Discovery analysis completed", 5, 5, 
            "Properties: " + info.propertiesChanged + ", Significant: " + info.significantChanges);
        
        debugLog("Discovery info calculated. Properties changed: " + info.propertiesChanged + 
                ", Significant changes: " + info.significantChanges, "DISCOVERY");
        
    } catch (exc) { // FIXED: error -> exc
        logError("Discovery info calculation failed: " + exc.message, 'comparison', 'medium');
        enhancedStatusLog("DISCOVERY", "Discovery analysis failed", 5, 5, "Error: " + exc.message);
    }
    
    return info;
}

function analyzeStructuralChanges(report1, report2, info) {
    try {
        enhancedStatusLog("STRUCTURAL", "Analyzing structural changes", 0, 4, "Comparing document structure elements");
        
        // Page changes using safe access
        var pages1 = safeGetLength(safeGetProperty(report1, 'pages', []));
        var pages2 = safeGetLength(safeGetProperty(report2, 'pages', []));
        if (pages1 !== pages2) {
            info.structuralChanges.pagesChanged = Math.abs(pages2 - pages1);
            info.significantChanges++;
            enhancedStatusLog("STRUCTURAL", "Page count changed", 1, 4, 
                "From " + pages1 + " to " + pages2 + " pages");
        }
        
        // Layer changes using safe access
        var layers1 = safeGetLength(safeGetProperty(report1, 'layers', []));
        var layers2 = safeGetLength(safeGetProperty(report2, 'layers', []));
        if (layers1 !== layers2) {
            info.structuralChanges.layersChanged = Math.abs(layers2 - layers1);
            info.significantChanges++;
            enhancedStatusLog("STRUCTURAL", "Layer count changed", 2, 4, 
                "From " + layers1 + " to " + layers2 + " layers");
        }
        
        // Page item changes using safe access
        var pageItems1 = safeGetProperty(report1, 'pageItems', {});
        var pageItems2 = safeGetProperty(report2, 'pageItems', {});
        var items1 = safeGetProperty(pageItems1, 'totalCount', 0);
        var items2 = safeGetProperty(pageItems2, 'totalCount', 0);
        if (items1 !== items2) {
            var itemDiff = items2 - items1;
            if (itemDiff > 0) {
                info.structuralChanges.itemsAdded = itemDiff;
                enhancedStatusLog("STRUCTURAL", "Page items added", 3, 4, itemDiff + " items added");
            } else {
                info.structuralChanges.itemsRemoved = Math.abs(itemDiff);
                enhancedStatusLog("STRUCTURAL", "Page items removed", 3, 4, Math.abs(itemDiff) + " items removed");
            }
            info.significantChanges++;
        }
        
        enhancedStatusLog("STRUCTURAL", "Structural analysis completed", 4, 4, "Structure comparison complete");
        
    } catch (exc) { // FIXED: error -> exc
        debugLog("Structural change analysis failed: " + exc.message, "ERROR");
        enhancedStatusLog("STRUCTURAL", "Structural analysis failed", 4, 4, "Error: " + exc.message);
    }
}

// Determine if a change is significant for reporting - ES3 compatible
function isSignificantChange(change, section) {
    var significantTypes = ['addition', 'deletion', 'text_content_change', 'overflow_change'];
    var changeType = safeGetProperty(change, 'type');
    
    if (arrayIndexOf(significantTypes, changeType) !== -1) {
        return true;
    }
    
    // Section-specific significance rules
    var changePath = safeGetProperty(change, 'path', '');
    
    if (section === 'documentInfo') {
        var significantProps = ['saved', 'modified', 'readonly', 'pagesPerDocument'];
        return arraySome(significantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    if (section === 'textFrames' || section === 'textContent') {
        var textSignificantProps = ['overflows', 'characterCount', 'wordCount', 'appliedParagraphStyle', 'fontFamily', 'fontSize'];
        return arraySome(textSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    if (section === 'pages') {
        var pageSignificantProps = ['bounds', 'appliedMaster', 'textFrameCount', 'imageCount'];
        return arraySome(pageSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    if (section === 'images' || section === 'links') {
        var linkSignificantProps = ['status', 'filePath', 'size', 'date'];
        return arraySome(linkSignificantProps, function(prop) {
            return stringIndexOf(changePath, prop) !== -1;
        });
    }
    
    return false;
}

function compareSection(section1, section2, sectionName) {
    var changes = [];
    
    try {
        enhancedStatusLog("SECTION_COMPARE", "Comparing " + sectionName, 0, 1, "Analyzing section properties");
        
        // Type mismatch check
        if (typeof section1 !== typeof section2) {
            changes.push(createChangeObject({
                type: "type_change",
                path: sectionName,
                oldValue: typeof section1,
                newValue: typeof section2,
                significance: "high"
            }, sectionName));
            return changes;
        }
        
        // Null/undefined handling
        if (section1 === null || section2 === null) {
            if (section1 !== section2) {
                changes.push(createChangeObject({
                    type: "value_change",
                    path: sectionName,
                    oldValue: section1,
                    newValue: section2,
                    significance: "medium"
                }, sectionName));
            }
            return changes;
        }
        
        // Array comparison with enhanced change detection
        if (typeof section1 === 'object' && section1.constructor === Array) {
            var section1Length = safeGetLength(section1); // FIXED: Use safeGetLength
            var section2Length = safeGetLength(section2); // FIXED: Use safeGetLength
            
            if (section1Length !== section2Length) {
                changes.push(createChangeObject({
                    type: "length_change",
                    path: sectionName,
                    oldLength: section1Length,
                    newLength: section2Length,
                    significance: "high" // Length changes are usually significant
                }, sectionName));
                
                enhancedStatusLog("SECTION_COMPARE", "Array length changed", 1, 1, 
                    sectionName + ": " + section1Length + " → " + section2Length);
            }
            
            var maxLength = Math.max(section1Length, section2Length);
            for (var i = 0; i < maxLength; i++) {
                if (i >= section1Length) {
                    changes.push(createChangeObject({
                        type: "addition",
                        path: sectionName + "[" + i + "]",
                        newValue: section2[i],
                        significance: "high"
                    }, sectionName + "[" + i + "]"));
                } else if (i >= section2Length) {
                    changes.push(createChangeObject({
                        type: "deletion",
                        path: sectionName + "[" + i + "]",
                        oldValue: section1[i],
                        significance: "high"
                    }, sectionName + "[" + i + "]"));
                } else {
                    var subChanges = compareSection(section1[i], section2[i], sectionName + "[" + i + "]");
                    changes = changes.concat(subChanges);
                }
            }
        } else if (typeof section1 === 'object') {
            // Enhanced object comparison - ES3 compatible
            var allKeys = {};
            for (var key in section1) allKeys[key] = true;
            for (var key in section2) allKeys[key] = true;
            
            for (var key in allKeys) {
                if (!(key in section1)) {
                    changes.push(createChangeObject({
                        type: "addition",
                        path: sectionName + "." + key,
                        newValue: section2[key],
                        significance: determinePropertySignificance(key, sectionName)
                    }, sectionName + "." + key));
                } else if (!(key in section2)) {
                    changes.push(createChangeObject({
                        type: "deletion",
                        path: sectionName + "." + key,
                        oldValue: section1[key],
                        significance: determinePropertySignificance(key, sectionName)
                    }, sectionName + "." + key));
                } else {
                    var subChanges = compareSection(section1[key], section2[key], sectionName + "." + key);
                    changes = changes.concat(subChanges);
                }
            }
        } else {
            // Enhanced primitive comparison
            if (section1 !== section2) {
                var changeType = "value_change";
                var significance = "medium";
                
                // Enhanced handling for specific content changes
                if (stringIndexOf(sectionName, 'text') !== -1 || stringIndexOf(sectionName, 'contents') !== -1 || stringIndexOf(sectionName, 'textPreview') !== -1) {
                    changeType = "text_content_change";
                    significance = "high";
                } else if (stringIndexOf(sectionName, 'characterCount') !== -1 || stringIndexOf(sectionName, 'wordCount') !== -1) {
                    changeType = "text_metric_change";
                    significance = "medium";
                } else if (stringIndexOf(sectionName, 'overflows') !== -1) {
                    changeType = "overflow_change";
                    significance = "high";
                } else if (stringIndexOf(sectionName, 'bounds') !== -1) {
                    changeType = "geometry_change";
                    significance = "medium";
                } else if (stringIndexOf(sectionName, 'Style') !== -1) {
                    changeType = "style_change";
                    significance = "medium";
                } else if (stringIndexOf(sectionName, 'color') !== -1 || stringIndexOf(sectionName, 'Color') !== -1) {
                    changeType = "color_change";
                    significance = "low";
                } else if (stringIndexOf(sectionName, 'font') !== -1 || stringIndexOf(sectionName, 'Font') !== -1) {
                    changeType = "font_change";
                    significance = "medium";
                }
                
                changes.push(createChangeObject({
                    type: changeType,
                    path: sectionName,
                    oldValue: section1,
                    newValue: section2,
                    significance: significance
                }, sectionName));
            }
        }
    } catch (exc) { // FIXED: error -> exc
        logError("compareSection failed for " + sectionName + ": " + exc.message, 'comparison', 'medium');
        changes.push(createChangeObject({
            type: "comparison_error",
            path: sectionName,
            error: exc.message,
            significance: "low"
        }, sectionName));
        enhancedStatusLog("SECTION_COMPARE", "Section comparison failed", 1, 1, 
            sectionName + " error: " + exc.message);
    }
    
    return changes;
}

// Determine property significance for better change prioritization - ES3 compatible
function determinePropertySignificance(propertyName, sectionName) {
    // High significance properties - major document changes
    var highSigProps = ['overflows', 'bounds', 'name', 'status', 'filePath', 'saved', 'modified', 'characterCount', 'wordCount'];
    if (arrayIndexOf(highSigProps, propertyName) !== -1) {
        return "high";
    }
    
    // Text-related properties are generally significant
    if (stringIndexOf(sectionName, 'text') !== -1 || stringIndexOf(sectionName, 'Text') !== -1) {
        var textSigProps = ['appliedParagraphStyle', 'appliedCharacterStyle', 'fontFamily', 'fontSize', 'textColor', 'isThreaded'];
        if (arrayIndexOf(textSigProps, propertyName) !== -1) {
            return "high";
        }
    }
    
    // Style and color changes are medium significance
    if (stringIndexOf(sectionName, 'style') !== -1 || stringIndexOf(sectionName, 'color') !== -1) {
        return "medium";
    }
    
    // Image and link properties
    if (stringIndexOf(sectionName, 'image') !== -1 || stringIndexOf(sectionName, 'link') !== -1) {
        var imageLinkSigProps = ['status', 'filePath', 'size', 'date', 'actualPpi', 'effectivePpi'];
        if (arrayIndexOf(imageLinkSigProps, propertyName) !== -1) {
            return "high";
        }
    }
    
    // Page and layout properties
    if (stringIndexOf(sectionName, 'page') !== -1 || stringIndexOf(sectionName, 'layer') !== -1) {
        var layoutSigProps = ['appliedMaster', 'visible', 'locked', 'pageItems', 'textFrameCount', 'imageCount'];
        if (arrayIndexOf(layoutSigProps, propertyName) !== -1) {
            return "medium";
        }
    }
    
    // Default to low significance
    return "low";
}

function createChangeObject(changeData, analysisPath) {
    var change = {
        type: safeGetProperty(changeData, 'type', 'unknown_change'),
        path: safeGetProperty(changeData, 'path', 'unknown_path'),
        significance: safeGetProperty(changeData, 'significance', 'medium'),
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
    
    // Generate enhanced access path with alternatives
    try {
        change.accessPath = generateEnhancedAccessPath(analysisPath);
        change.safetyNotes = generateSafetyNotes(analysisPath);
    } catch (exc) { // FIXED: error -> exc
        logError("Failed to generate access info for " + analysisPath + ": " + exc.message, 'accessPath', 'medium');
        change.accessPath = {
            primary: "// Error generating access path: " + exc.message,
            alternatives: ["// Use try-catch for safe access", "// Check InDesign API documentation"],
            safetyLevel: "error"
        };
        change.safetyNotes = [
            "Error generating safety notes - use comprehensive error handling",
            "Test access patterns with your specific InDesign version"
        ];
    }
    
    return change;
}

// Enhanced access path generation with multiple alternatives for clunky APIs
function generateEnhancedAccessPath(analysisPath) {
    var accessInfo = {
        primary: "",
        alternatives: [],
        safetyLevel: "medium",
        collectionMethod: "",
        errorMessage: null
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
        
        // Enhanced pattern matching for InDesign-specific access
        if (stringIndexOf(cleanPath, 'textContent') !== -1) {
            // Text content access patterns
            if (stringIndexOf(cleanPath, 'textFrameDetails[') !== -1) {
                var frameMatch = cleanPath.match(/textFrameDetails\[(\d+)\]/);
                if (frameMatch && frameMatch.length >= 2) {
                    var frameIndex = frameMatch[1];
                    accessInfo.primary = "doc.textFrames[" + frameIndex + "].contents";
                    accessInfo.alternatives = [
                        "doc.textFrames.item(" + frameIndex + ").contents",
                        "doc.stories[n].textFrames[m].contents // if threaded",
                        "doc.textFrames.itemByRange(" + frameIndex + ", " + frameIndex + ")[0].contents"
                    ];
                    accessInfo.collectionMethod = "Length: doc.textFrames.length";
                    accessInfo.safetyLevel = "high";
                }
            } else {
                accessInfo.primary = "doc.textFrames[n].contents";
                accessInfo.alternatives = [
                    "doc.stories[n].contents",
                    "doc.textFrames.item(n).contents",
                    "doc.allPageItems[n].contents // if mixed content"
                ];
                accessInfo.safetyLevel = "high";
            }
        } else if (stringIndexOf(cleanPath, 'pages[') !== -1) {
            // Page access patterns with InDesign-specific methods
            var pageMatch = cleanPath.match(/pages\[(\d+)\](.*)/);
            if (pageMatch && pageMatch.length >= 2) {
                var pageIndex = pageMatch[1];
                var remainder = pageMatch[2] || "";
                accessInfo.primary = "doc.pages[" + pageIndex + "]" + remainder;
                accessInfo.alternatives = [
                    "doc.pages.item(" + pageIndex + ")" + remainder,
                    "doc.pages.itemByRange(" + pageIndex + ", " + pageIndex + ")[0]" + remainder,
                    "doc.spreads[n].pages[m]" + remainder + " // via spread access"
                ];
                accessInfo.collectionMethod = "Length: doc.pages.length";
                accessInfo.safetyLevel = "high";
            }
        } else if (stringIndexOf(cleanPath, 'styles[') !== -1) {
            // Style access patterns
            var styleMatch = cleanPath.match(/(paragraphStyles|characterStyles)\[(\d+)\]/);
            if (styleMatch && styleMatch.length >= 3) {
                var styleType = styleMatch[1];
                var styleIndex = styleMatch[2];
                accessInfo.primary = "doc." + styleType + "[" + styleIndex + "]";
                accessInfo.alternatives = [
                    "doc." + styleType + ".item(" + styleIndex + ")",
                    "doc." + styleType + ".itemByName('StyleName')",
                    "doc." + styleType + ".itemByID(styleId)"
                ];
                accessInfo.safetyLevel = "medium";
            }
        } else if (stringIndexOf(cleanPath, 'images[') !== -1 || stringIndexOf(cleanPath, 'links[') !== -1) {
            // Image and link access patterns - often problematic
            var linkMatch = cleanPath.match(/(images|links)\[(\d+)\]/);
            if (linkMatch && linkMatch.length >= 3) {
                var linkType = linkMatch[1];
                var linkIndex = linkMatch[2];
                accessInfo.primary = "doc." + linkType + "[" + linkIndex + "]";
                accessInfo.alternatives = [
                    "doc." + linkType + ".item(" + linkIndex + ")",
                    "doc." + linkType + ".itemByName('fileName')",
                    "doc.allPageItems[n]." + linkType + "[0] // via page item"
                ];
                accessInfo.safetyLevel = "low"; // Images/links are often problematic
            }
        } else if (stringIndexOf(cleanPath, 'layers[') !== -1) {
            // Layer access patterns
            var layerMatch = cleanPath.match(/layers\[(\d+)\]/);
            if (layerMatch && layerMatch.length >= 2) {
                var layerIndex = layerMatch[1];
                accessInfo.primary = "doc.layers[" + layerIndex + "]";
                accessInfo.alternatives = [
                    "doc.layers.item(" + layerIndex + ")",
                    "doc.layers.itemByName('LayerName')",
                    "doc.layers.itemByID(layerId)"
                ];
                accessInfo.safetyLevel = "high";
            }
        } else if (stringIndexOf(cleanPath, 'pageItems[') !== -1) {
            // Page item access patterns
            var itemMatch = cleanPath.match(/pageItems\[(\d+)\]/);
            if (itemMatch && itemMatch.length >= 2) {
                var itemIndex = itemMatch[1];
                accessInfo.primary = "doc.pageItems[" + itemIndex + "]";
                accessInfo.alternatives = [
                    "doc.pageItems.item(" + itemIndex + ")",
                    "doc.allPageItems[" + itemIndex + "]",
                    "doc.pages[n].pageItems[" + itemIndex + "] // specific page"
                ];
                accessInfo.safetyLevel = "medium";
            }
        }
        
        // If no specific pattern matched, provide general alternatives
        if (accessInfo.alternatives.length === 0) {
            accessInfo.alternatives = [
                "// Use try-catch for safe access",
                "// Check object exists before accessing properties",
                "// Consider using .item() method for collections"
            ];
        }
        
        // Add discovered alternatives if available
        for (var prop in ANALYSIS_CONFIG.discoveredAlternatives) {
            if (stringIndexOf(cleanPath, prop) !== -1) {
                accessInfo.alternatives.unshift("// Alternative discovered: use ." + ANALYSIS_CONFIG.discoveredAlternatives[prop] + " instead of ." + prop);
                break;
            }
        }
        
    } catch (exc) { // FIXED: error -> exc
        logError("generateEnhancedAccessPath failed: " + exc.message, 'accessPath', 'high');
        accessInfo.primary = "// Error generating access path: " + exc.message;
        accessInfo.errorMessage = "Path generation failed: " + exc.message;
        accessInfo.safetyLevel = "error";
        accessInfo.alternatives = [
            "// Use comprehensive try-catch pattern",
            "// Test with minimal document first",
            "// Check InDesign version compatibility"
        ];
    }
    
    return accessInfo;
}

// Generate safety notes based on analysis path and common InDesign API issues
function generateSafetyNotes(analysisPath) {
    var notes = [];
    
    try {
        if (!analysisPath || typeof analysisPath !== 'string') {
            notes.push("Invalid path - cannot generate safety notes");
            return notes;
        }
        
        var pathLower = analysisPath.toLowerCase();
        
        // Enhanced safety rules based on InDesign API experience
        var safetyRules = [
            { 
                pattern: 'textcontent', 
                notes: [
                    'Text content may be large - use substring() for previews',
                    'Check for special characters and formatting codes',
                    'Verify contents property exists before accessing',
                    'Text overflow can affect content availability'
                ] 
            },
            { 
                pattern: 'images', 
                notes: [
                    'Image links may be missing or modified',
                    'Use try-catch for itemLink property access',
                    'Check link status before accessing file properties',
                    'Image resolution properties may be undefined'
                ] 
            },
            { 
                pattern: 'links', 
                notes: [
                    'Link status can change between document sessions',
                    'File paths may be invalid or moved',
                    'Always verify link exists before processing',
                    'Link type and version state may vary'
                ] 
            },
            { 
                pattern: 'pages', 
                notes: [
                    'Page access is generally reliable',
                    'Check documentOffset for proper page numbering',
                    'Master page properties may be inherited',
                    'Page bounds affected by margins and bleeds'
                ] 
            },
            { 
                pattern: 'styles', 
                notes: [
                    'Style access is generally stable',
                    'Check for based-on relationships',
                    'Style properties may be inherited from parent',
                    'Font properties may reference missing fonts'
                ] 
            },
            { 
                pattern: 'pageitems', 
                notes: [
                    'Page items can have complex parent-child relationships',
                    'Transform properties may affect bounds calculations',
                    'Visibility and lock states can affect access'
                ] 
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
        
        // Universal safety patterns
        if (stringIndexOf(pathLower, '[') !== -1) {
            notes.push("Array/collection access - always check length first");
            notes.push("Use both index and .item() methods for robustness");
        }
        
        if (stringIndexOf(pathLower, 'bounds') !== -1) {
            notes.push("Bounds may be affected by transformations and parent containers");
        }
        
        if (stringIndexOf(pathLower, 'overflows') !== -1) {
            notes.push("Overflow status critical for text layout - may change with edits");
        }
        
        if (stringIndexOf(pathLower, 'font') !== -1) {
            notes.push("Font properties may reference missing or substituted fonts");
        }
        
        if (stringIndexOf(pathLower, 'color') !== -1) {
            notes.push("Color properties may reference custom color spaces");
        }
        
        // Ensure we always have basic safety guidance
        if (notes.length === 0) {
            notes.push("Use comprehensive try-catch blocks for property access");
            notes.push("Always validate objects exist before accessing properties");
            notes.push("Test thoroughly with your specific document types and InDesign version");
        }
        
    } catch (exc) { // FIXED: error -> exc
        logError("generateSafetyNotes failed: " + exc.message, 'safetyNotes', 'medium');
        notes = [
            "Error generating safety notes: " + exc.message,
            "Use comprehensive try-catch pattern for all property access",
            "Test access patterns with your specific InDesign environment"
        ];
    }
    
    return notes;
}