// ============================================================================
// CHUNK 3: COMPARISON FUNCTIONS - ROBUST PROPERTY CHANGE DETECTION
// ============================================================================

// Enhanced comparison function - COMPREHENSIVE PROPERTY CHANGE ANALYSIS
function compareDocumentReports(report1, report2) {
    debugLog("Starting comprehensive document comparison", "COMPARE");
    statusLog("Document Comparison", "Initializing", 0);
    
    var differences = {
        timestamp: new Date().toISOString(),
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
            statusLog("Document Comparison", "Comparing " + section, progress);
            
            try {
                debugLog("Comparing section: " + section, "COMPARE");
                var sectionReport1 = safeGetProperty(report1, section);
                var sectionReport2 = safeGetProperty(report2, section);
                var changes = compareSection(sectionReport1, sectionReport2, section);
                if (changes.length > 0) {
                    differences.summary.hasChanges = true;
                    differences.summary.changedSections.push(section);
                    differences.changes[section] = changes;
                    differences.summary.totalChanges += changes.length;
                    debugLog("Found " + changes.length + " changes in " + section, "COMPARE");
                }
            } catch (e) {
                differences.errors.push("Section comparison failed: " + section + " - " + e.message);
                logError("Section comparison failed: " + section + " - " + e.message, 'comparison', 'high');
            }
        }
        
        statusLog("Document Comparison", "Calculating discovery info", 90);
        
        // Calculate enhanced discovery info
        differences.discoveryInfo = calculateEnhancedDiscoveryInfo(report1, report2, differences.changes);
        differences.summary.significantChanges = safeGetProperty(differences.discoveryInfo, 'significantChanges', 0);
        
        statusLog("Document Comparison", "Completed", 100);
        debugLog("Comparison completed. Changes found: " + differences.summary.hasChanges + 
                ", Total changes: " + differences.summary.totalChanges, "COMPARE");
        
    } catch (e) {
        differences.errors.push("Overall comparison failed: " + e.message);
        logError("Overall comparison failed: " + e.message, 'comparison', 'critical');
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
        
        // Analyze structural changes
        analyzeStructuralChanges(report1, report2, info);
        
        // Count all property changes by type and section
        for (var section in changes) {
            info.changesBySection[section] = changes[section].length;
            info.propertiesChanged += changes[section].length;
            
            for (var i = 0; i < changes[section].length; i++) {
                var change = changes[section][i];
                var changeType = safeGetProperty(change, 'type', 'unknown');
                info.changesByType[changeType] = (info.changesByType[changeType] || 0) + 1;
                
                // Count style changes specifically
                var changePath = safeGetProperty(change, 'path', '');
                if (section === 'styles' || changePath.indexOf('Style') !== -1) {
                    info.textChangesDetailed.styleChanges++;
                }
                
                // Identify significant changes
                if (isSignificantChange(change, section)) {
                    info.significantChanges++;
                }
            }
        }
        
        // Get processing stats from reports using safe access
        var discoveryStats2 = safeGetProperty(report2, 'discoveryStats');
        if (discoveryStats2) {
            info.textItemsProcessed = safeGetProperty(discoveryStats2, 'textItemsProcessed', 0);
        }
        
        debugLog("Discovery info calculated. Properties changed: " + info.propertiesChanged + 
                ", Significant changes: " + info.significantChanges, "DISCOVERY");
        
    } catch (e) {
        logError("Discovery info calculation failed: " + e.message, 'comparison', 'medium');
    }
    
    return info;
}

function analyzeStructuralChanges(report1, report2, info) {
    try {
        // Page changes using safe access
        var pages1 = safeGetLength(safeGetProperty(report1, 'pages', []));
        var pages2 = safeGetLength(safeGetProperty(report2, 'pages', []));
        if (pages1 !== pages2) {
            info.structuralChanges.pagesChanged = Math.abs(pages2 - pages1);
            info.significantChanges++;
        }
        
        // Layer changes using safe access
        var layers1 = safeGetLength(safeGetProperty(report1, 'layers', []));
        var layers2 = safeGetLength(safeGetProperty(report2, 'layers', []));
        if (layers1 !== layers2) {
            info.structuralChanges.layersChanged = Math.abs(layers2 - layers1);
            info.significantChanges++;
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
            } else {
                info.structuralChanges.itemsRemoved = Math.abs(itemDiff);
            }
            info.significantChanges++;
        }
        
    } catch (e) {
        debugLog("Structural change analysis failed: " + e.message, "ERROR");
    }
}

// Determine if a change is significant for reporting
function isSignificantChange(change, section) {
    var significantTypes = ['addition', 'deletion', 'text_content_change', 'overflow_change'];
    var changeType = safeGetProperty(change, 'type');
    
    if (significantTypes.indexOf(changeType) !== -1) {
        return true;
    }
    
    // Section-specific significance rules
    var changePath = safeGetProperty(change, 'path', '');
    
    if (section === 'documentInfo') {
        var significantProps = ['saved', 'modified', 'readonly', 'pagesPerDocument'];
        return significantProps.some(function(prop) {
            return changePath.indexOf(prop) !== -1;
        });
    }
    
    if (section === 'textFrames' || section === 'textContent') {
        var textSignificantProps = ['overflows', 'characterCount', 'wordCount', 'appliedParagraphStyle', 'fontFamily', 'fontSize'];
        return textSignificantProps.some(function(prop) {
            return changePath.indexOf(prop) !== -1;
        });
    }
    
    if (section === 'pages') {
        var pageSignificantProps = ['bounds', 'appliedMaster', 'textFrameCount', 'imageCount'];
        return pageSignificantProps.some(function(prop) {
            return changePath.indexOf(prop) !== -1;
        });
    }
    
    if (section === 'images' || section === 'links') {
        var linkSignificantProps = ['status', 'filePath', 'size', 'date'];
        return linkSignificantProps.some(function(prop) {
            return changePath.indexOf(prop) !== -1;
        });
    }
    
    return false;
}

function compareSection(section1, section2, sectionName) {
    var changes = [];
    
    try {
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
            if (section1.length !== section2.length) {
                changes.push(createChangeObject({
                    type: "length_change",
                    path: sectionName,
                    oldLength: section1.length,
                    newLength: section2.length,
                    significance: "high" // Length changes are usually significant
                }, sectionName));
            }
            
            var maxLength = Math.max(section1.length, section2.length);
            for (var i = 0; i < maxLength; i++) {
                if (i >= section1.length) {
                    changes.push(createChangeObject({
                        type: "addition",
                        path: sectionName + "[" + i + "]",
                        newValue: section2[i],
                        significance: "high"
                    }, sectionName + "[" + i + "]"));
                } else if (i >= section2.length) {
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
            // Enhanced object comparison
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
                if (sectionName.indexOf('text') !== -1 || sectionName.indexOf('contents') !== -1 || sectionName.indexOf('textPreview') !== -1) {
                    changeType = "text_content_change";
                    significance = "high";
                } else if (sectionName.indexOf('characterCount') !== -1 || sectionName.indexOf('wordCount') !== -1) {
                    changeType = "text_metric_change";
                    significance = "medium";
                } else if (sectionName.indexOf('overflows') !== -1) {
                    changeType = "overflow_change";
                    significance = "high";
                } else if (sectionName.indexOf('bounds') !== -1) {
                    changeType = "geometry_change";
                    significance = "medium";
                } else if (sectionName.indexOf('Style') !== -1) {
                    changeType = "style_change";
                    significance = "medium";
                } else if (sectionName.indexOf('color') !== -1 || sectionName.indexOf('Color') !== -1) {
                    changeType = "color_change";
                    significance = "low";
                } else if (sectionName.indexOf('font') !== -1 || sectionName.indexOf('Font') !== -1) {
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
    } catch (e) {
        logError("compareSection failed for " + sectionName + ": " + e.message, 'comparison', 'medium');
        changes.push(createChangeObject({
            type: "comparison_error",
            path: sectionName,
            error: e.message,
            significance: "low"
        }, sectionName));
    }
    
    return changes;
}

// Determine property significance for better change prioritization
function determinePropertySignificance(propertyName, sectionName) {
    // High significance properties - major document changes
    var highSigProps = ['overflows', 'bounds', 'name', 'status', 'filePath', 'saved', 'modified', 'characterCount', 'wordCount'];
    if (highSigProps.indexOf(propertyName) !== -1) {
        return "high";
    }
    
    // Text-related properties are generally significant
    if (sectionName.indexOf('text') !== -1 || sectionName.indexOf('Text') !== -1) {
        var textSigProps = ['appliedParagraphStyle', 'appliedCharacterStyle', 'fontFamily', 'fontSize', 'textColor', 'isThreaded'];
        if (textSigProps.indexOf(propertyName) !== -1) {
            return "high";
        }
    }
    
    // Style and color changes are medium significance
    if (sectionName.indexOf('style') !== -1 || sectionName.indexOf('color') !== -1) {
        return "medium";
    }
    
    // Image and link properties
    if (sectionName.indexOf('image') !== -1 || sectionName.indexOf('link') !== -1) {
        var imageLinkSigProps = ['status', 'filePath', 'size', 'date', 'actualPpi', 'effectivePpi'];
        if (imageLinkSigProps.indexOf(propertyName) !== -1) {
            return "high";
        }
    }
    
    // Page and layout properties
    if (sectionName.indexOf('page') !== -1 || sectionName.indexOf('layer') !== -1) {
        var layoutSigProps = ['appliedMaster', 'visible', 'locked', 'pageItems', 'textFrameCount', 'imageCount'];
        if (layoutSigProps.indexOf(propertyName) !== -1) {
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
        if (changeData.hasOwnProperty(prop)) {
            change[prop] = changeData[prop];
        }
    }
    
    // Generate enhanced access path with alternatives
    try {
        change.accessPath = generateEnhancedAccessPath(analysisPath);
        change.safetyNotes = generateSafetyNotes(analysisPath);
    } catch (e) {
        logError("Failed to generate access info for " + analysisPath + ": " + e.message, 'accessPath', 'medium');
        change.accessPath = {
            primary: "// Error generating access path: " + e.message,
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
        if (cleanPath.indexOf('textContent') !== -1) {
            // Text content access patterns
            if (cleanPath.indexOf('textFrameDetails[') !== -1) {
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
        } else if (cleanPath.indexOf('pages[') !== -1) {
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
        } else if (cleanPath.indexOf('styles[') !== -1) {
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
        } else if (cleanPath.indexOf('images[') !== -1 || cleanPath.indexOf('links[') !== -1) {
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
        } else if (cleanPath.indexOf('layers[') !== -1) {
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
        } else if (cleanPath.indexOf('pageItems[') !== -1) {
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
            if (cleanPath.indexOf(prop) !== -1) {
                accessInfo.alternatives.unshift("// Alternative discovered: use ." + ANALYSIS_CONFIG.discoveredAlternatives[prop] + " instead of ." + prop);
                break;
            }
        }
        
    } catch (e) {
        logError("generateEnhancedAccessPath failed: " + e.message, 'accessPath', 'high');
        accessInfo.primary = "// Error generating access path: " + e.message;
        accessInfo.errorMessage = "Path generation failed: " + e.message;
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
        
        // Apply specific safety rules
        for (var i = 0; i < safetyRules.length; i++) {
            var rule = safetyRules[i];
            if (pathLower.indexOf(rule.pattern) !== -1) {
                for (var j = 0; j < rule.notes.length; j++) {
                    if (notes.indexOf(rule.notes[j]) === -1) {
                        notes.push(rule.notes[j]);
                    }
                }
                break;
            }
        }
        
        // Universal safety patterns
        if (pathLower.indexOf('[') !== -1) {
            notes.push("Array/collection access - always check length first");
            notes.push("Use both index and .item() methods for robustness");
        }
        
        if (pathLower.indexOf('bounds') !== -1) {
            notes.push("Bounds may be affected by transformations and parent containers");
        }
        
        if (pathLower.indexOf('overflows') !== -1) {
            notes.push("Overflow status critical for text layout - may change with edits");
        }
        
        if (pathLower.indexOf('font') !== -1) {
            notes.push("Font properties may reference missing or substituted fonts");
        }
        
        if (pathLower.indexOf('color') !== -1) {
            notes.push("Color properties may reference custom color spaces");
        }
        
        // Ensure we always have basic safety guidance
        if (notes.length === 0) {
            notes.push("Use comprehensive try-catch blocks for property access");
            notes.push("Always validate objects exist before accessing properties");
            notes.push("Test thoroughly with your specific document types and InDesign version");
        }
        
    } catch (e) {
        logError("generateSafetyNotes failed: " + e.message, 'safetyNotes', 'medium');
        notes = [
            "Error generating safety notes: " + e.message,
            "Use comprehensive try-catch pattern for all property access",
            "Test access patterns with your specific InDesign environment"
        ];
    }
    
    return notes;
}