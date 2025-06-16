//
// DEMO_CollectionSampling.jsx
// InDesign DOM Discovery Builder - Collection Sampling Demonstration
// CORE PURPOSE: Show how to use collection sampling to discover usable property paths
// DEPENDENCIES: All DOM Discovery modules loaded
// USAGE: Run this after loading the complete system
//

/**
 * Comprehensive demonstration of collection sampling capabilities
 */
function demonstrateCollectionSampling() {
    $.writeln('');
    $.writeln('================================================================================');
    $.writeln('COLLECTION SAMPLING DEMONSTRATION');
    $.writeln('================================================================================');
    $.writeln('This demo shows how collection sampling transforms structure discovery into');
    $.writeln('actionable property access patterns for real InDesign documents.');
    $.writeln('');
    
    try {
        // Step 1: Validate environment
        $.writeln('STEP 1: Validating InDesign environment...');
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('ERROR: ' + envResult.error);
            alert('Cannot run demo: ' + envResult.error);
            return false;
        }
        
        var doc = envResult.document;
        $.writeln('✓ Document found: ' + (doc.name || 'Unnamed'));
        $.writeln('');
        
        // Step 2: Basic DOM enumeration
        $.writeln('STEP 2: Running basic DOM structure discovery...');
        var config = {
            maxDepth: 2,
            timeoutMs: 5000,
            skipDangerous: true,
            maxProperties: 1000
        };
        
        var domStructure = enumerateDocumentDOM(doc, config);
        if (!domStructure) {
            $.writeln('ERROR: DOM enumeration failed');
            return false;
        }
        
        var stats = getDOMStatistics(domStructure);
        $.writeln('✓ Basic enumeration complete:');
        $.writeln('  Properties discovered: ' + stats.totalProperties);
        $.writeln('  Objects found: ' + stats.totalNodes);
        $.writeln('  Time: ' + stats.enumerationTime + 'ms');
        $.writeln('');
        
        // Step 3: Find collections
        $.writeln('STEP 3: Analyzing discovered collections...');
        var collections = findAllCollections(domStructure);
        $.writeln('✓ Found ' + collections.length + ' collections:');
        for (var i = 0; i < Math.min(collections.length, 5); i++) {
            $.writeln('  - ' + collections[i].name + ' [' + collections[i].safetyLevel + ']');
        }
        if (collections.length > 5) {
            $.writeln('  ... and ' + (collections.length - 5) + ' more');
        }
        $.writeln('');
        
        // Step 4: Collection sampling
        $.writeln('STEP 4: Sampling collection contents (this is where the magic happens)...');
        var samplingConfig = {
            maxSamplesPerCollection: 2,
            timeoutPerCollection: 2000,
            safetyFilter: 'moderate',
            enableProgressLogging: false
        };
        
        var enhancedStructure = sampleCollectionContents(domStructure, doc, samplingConfig);
        var samplingStats = getCollectionSamplingStatistics(enhancedStructure);
        
        $.writeln('✓ Collection sampling complete:');
        $.writeln('  Collections sampled: ' + samplingStats.collectionsSampled + '/' + samplingStats.collectionsFound);
        $.writeln('  Items analyzed: ' + samplingStats.totalItemsSampled);
        $.writeln('  Properties discovered: ' + samplingStats.totalPropertiesDiscovered);
        $.writeln('  Time: ' + samplingStats.samplingTime + 'ms');
        $.writeln('');
        
        // Step 5: Show actionable results
        $.writeln('STEP 5: Generated actionable property access patterns...');
        showActionableResults(enhancedStructure);
        
        $.writeln('================================================================================');
        $.writeln('DEMO COMPLETE!');
        $.writeln('');
        $.writeln('What you just saw:');
        $.writeln('1. Document structure discovery (what collections exist)');
        $.writeln('2. Collection content sampling (what\'s inside each collection)');
        $.writeln('3. Property pattern analysis (how to access properties safely)');
        $.writeln('4. Code generation (ready-to-use property access examples)');
        $.writeln('');
        $.writeln('This transforms "I wonder what\'s available" into "Here\'s exactly how to access it"');
        $.writeln('================================================================================');
        
        return true;
        
    } catch (exc) {
        $.writeln('DEMO ERROR: ' + exc.message);
        return false;
    }
}

/**
 * Show actionable results from collection sampling
 * @param {Object} enhancedStructure - DOM structure with collection sampling data
 */
function showActionableResults(enhancedStructure) {
    try {
        $.writeln('');
        $.writeln('🎯 ACTIONABLE PROPERTY ACCESS PATTERNS:');
        $.writeln('========================================');
        
        var document_node = enhancedStructure.structure.document;
        if (!document_node || !document_node.collections) {
            $.writeln('No collections with sampling data found.');
            return;
        }
        
        var exampleCount = 0;
        
        for (var i = 0; i < document_node.collections.length && exampleCount < 10; i++) {
            var collection = document_node.collections[i];
            
            if (collection.hasSamplingData && collection.samplingData) {
                $.writeln('');
                $.writeln('Collection: ' + collection.name);
                $.writeln('Length: ' + collection.samplingData.collectionLength);
                $.writeln('Safety: [' + collection.safetyLevel + ']');
                
                if (collection.samplingData.accessPatterns && collection.samplingData.accessPatterns.length > 0) {
                    $.writeln('Ready-to-use access patterns:');
                    
                    for (var j = 0; j < Math.min(collection.samplingData.accessPatterns.length, 3); j++) {
                        var pattern = collection.samplingData.accessPatterns[j];
                        var exampleCode = pattern.pattern.replace('[index]', '[0]');
                        $.writeln('  var value = ' + exampleCode + ';  // ' + pattern.type + ' [' + pattern.safetyLevel + ']');
                        exampleCount++;
                    }
                    
                    // Show safe iteration pattern
                    $.writeln('Safe iteration pattern:');
                    $.writeln('  try {');
                    $.writeln('    var collection = document.' + collection.name + ';');
                    $.writeln('    for (var i = 0; i < Math.min(collection.length, 10); i++) {');
                    $.writeln('      var item = collection[i];');
                    if (collection.samplingData.commonProperties && collection.samplingData.commonProperties.length > 0) {
                        var firstProp = collection.samplingData.commonProperties[0];
                        $.writeln('      var ' + firstProp.name + ' = item.' + firstProp.name + ';  // ' + firstProp.type);
                    }
                    $.writeln('    }');
                    $.writeln('  } catch (exc) { /* handle error */ }');
                }
                
                exampleCount++;
            }
        }
        
        if (exampleCount === 0) {
            $.writeln('No sampled collections found. Try running with more lenient safety settings.');
        }
        
    } catch (exc) {
        $.writeln('Error showing actionable results: ' + exc.message);
    }
}

/**
 * Quick collection sampling demo for immediate results
 */
function quickCollectionDemo() {
    $.writeln('');
    $.writeln('QUICK COLLECTION SAMPLING DEMO');
    $.writeln('==============================');
    
    try {
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('No document available: ' + envResult.error);
            return;
        }
        
        var doc = envResult.document;
        $.writeln('Analyzing: ' + (doc.name || 'Unnamed document'));
        
        // Quick enumeration
        var domStructure = enumerateDocumentDOM(doc, {
            maxDepth: 1,
            timeoutMs: 3000,
            skipDangerous: true,
            maxProperties: 500
        });
        
        // Quick sampling
        var enhanced = quickSampleCollections(domStructure, doc);
        var stats = getCollectionSamplingStatistics(enhanced);
        
        $.writeln('');
        $.writeln('RESULTS:');
        $.writeln('Collections found: ' + stats.collectionsFound);
        $.writeln('Collections sampled: ' + stats.collectionsSampled);
        $.writeln('Items analyzed: ' + stats.totalItemsSampled);
        $.writeln('Properties discovered: ' + stats.totalPropertiesDiscovered);
        
        // Show first few access patterns
        $.writeln('');
        $.writeln('SAMPLE ACCESS PATTERNS:');
        var document_node = enhanced.structure.document;
        if (document_node && document_node.collections) {
            for (var i = 0; i < Math.min(document_node.collections.length, 3); i++) {
                var collection = document_node.collections[i];
                if (collection.hasSamplingData) {
                    $.writeln('document.' + collection.name + '.length = ' + collection.samplingData.collectionLength);
                }
            }
        }
        
        $.writeln('');
        $.writeln('Use demonstrateCollectionSampling() for full demo.');
        
    } catch (exc) {
        $.writeln('Quick demo error: ' + exc.message);
    }
}

// ============================================================================
// SPECIFIC USE CASE EXAMPLES
// ============================================================================

/**
 * Example: Safely access story text content
 */
function exampleAccessStoryContent() {
    $.writeln('');
    $.writeln('EXAMPLE: Safe Story Content Access');
    $.writeln('==================================');
    
    try {
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) return;
        
        var doc = envResult.document;
        
        // Use our discovery system to safely access stories
        var domStructure = enumerateDocumentDOM(doc, {maxDepth: 1, timeoutMs: 2000});
        var enhanced = quickSampleCollections(domStructure, doc);
        
        // Find stories collection info
        var document_node = enhanced.structure.document;
        var storiesCollection = null;
        
        if (document_node && document_node.collections) {
            for (var i = 0; i < document_node.collections.length; i++) {
                if (document_node.collections[i].name === 'stories') {
                    storiesCollection = document_node.collections[i];
                    break;
                }
            }
        }
        
        if (storiesCollection && storiesCollection.hasSamplingData) {
            $.writeln('Stories collection discovered:');
            $.writeln('  Length: ' + storiesCollection.samplingData.collectionLength);
            $.writeln('  Safety level: ' + storiesCollection.safetyLevel);
            
            if (storiesCollection.samplingData.commonProperties) {
                $.writeln('  Common properties on story items:');
                for (var j = 0; j < storiesCollection.samplingData.commonProperties.length; j++) {
                    var prop = storiesCollection.samplingData.commonProperties[j];
                    $.writeln('    - ' + prop.name + ' (' + prop.type + ') [' + prop.safetyLevel + ']');
                }
            }
            
            // Now we can safely access stories because we know they exist
            try {
                var stories = doc.stories;
                if (stories && stories.length > 0) {
                    $.writeln('');
                    $.writeln('✓ Successfully accessed stories collection!');
                    $.writeln('  Story count: ' + stories.length);
                    
                    // Access first story safely based on discovered properties
                    var firstStory = stories[0];
                    for (var k = 0; k < storiesCollection.samplingData.commonProperties.length; k++) {
                        var prop = storiesCollection.samplingData.commonProperties[k];
                        if (prop.safetyLevel === 'safe' || prop.safetyLevel === 'moderate') {
                            try {
                                var value = firstStory[prop.name];
                                $.writeln('  story[0].' + prop.name + ' = ' + (typeof value === 'string' ? '"' + value.substring(0, 50) + '"' : value));
                            } catch (propExc) {
                                $.writeln('  story[0].' + prop.name + ' = [access failed]');
                            }
                        }
                    }
                }
            } catch (accessExc) {
                $.writeln('Story access failed: ' + accessExc.message);
            }
            
        } else {
            $.writeln('Stories collection not found or not sampled.');
        }
        
    } catch (exc) {
        $.writeln('Example failed: ' + exc.message);
    }
}

// ============================================================================
// AUTO-DEMO INVITATION
// ============================================================================

try {
    $.writeln('');
    $.writeln('🎯 COLLECTION SAMPLING DEMO AVAILABLE!');
    $.writeln('=====================================');
    $.writeln('New functions available:');
    $.writeln('  - demonstrateCollectionSampling() - Full demonstration');  
    $.writeln('  - quickCollectionDemo() - Quick 30-second demo');
    $.writeln('  - exampleAccessStoryContent() - Real story access example');
    $.writeln('');
    $.writeln('These demos show how DOM discovery + collection sampling = actionable property access!');
} catch (exc) {
    // Ignore demo invitation errors
}