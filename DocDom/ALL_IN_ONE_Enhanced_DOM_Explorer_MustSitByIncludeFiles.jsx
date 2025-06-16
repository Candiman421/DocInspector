//
// ALL_IN_ONE_Enhanced_DOM_Explorer.jsx
// InDesign DOM Discovery Builder v2.0 - Complete System with Collection Sampling
// USAGE: Just run this ONE file in ExtendScript and everything works!
//
// WHAT IT DOES:
// 1. Loads all DOM discovery modules
// 2. Opens the enhanced UI with collection sampling  
// 3. Provides demo functions for testing
//
// JUST RUN THIS FILE AND CLICK THE BUTTONS!
//

// ============================================================================
// MODULE INCLUDES - ALL MODULES IN ONE FILE
// ============================================================================

// Include all the enhanced modules
#include "DocDom/1.0_safe-foundation.jsx"
#include "DocDom/2.0_dom-enumerator.jsx"
#include "DocDom/3.0_dom-visualizer.jsx"
#include "DocDom/4.0_property-sampler.jsx"  
#include "DocDom/5.0_dom-exporter.jsx"
#include "DocDom/6.0_collection-sampler.jsx"

// ============================================================================
// DEMO FUNCTIONS BUILT-IN
// ============================================================================

/**
 * Quick demo - run this to see collection sampling in action
 */
function quickDemo() {
    $.writeln('');
    $.writeln('🚀 QUICK COLLECTION SAMPLING DEMO');
    $.writeln('=================================');
    
    try {
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('❌ No document available: ' + envResult.error);
            alert('Please open an InDesign document first.');
            return;
        }
        
        var doc = envResult.document;
        $.writeln('✓ Document: ' + (doc.name || 'Unnamed'));
        
        // Step 1: Basic enumeration
        $.writeln('📋 Step 1: Discovering DOM structure...');
        var domStructure = enumerateDocumentDOM(doc, {
            maxDepth: 2,
            timeoutMs: 3000,
            skipDangerous: true
        });
        
        var stats = getDOMStatistics(domStructure);
        $.writeln('  ✓ Found ' + stats.totalProperties + ' properties in ' + stats.enumerationTime + 'ms');
        
        // Step 2: Collection sampling  
        $.writeln('🔍 Step 2: Sampling collection contents...');
        var enhanced = sampleCollectionContents(domStructure, doc, {
            maxSamplesPerCollection: 2,
            timeoutPerCollection: 2000,
            safetyFilter: 'moderate'
        });
        
        var samplingStats = getCollectionSamplingStatistics(enhanced);
        $.writeln('  ✓ Sampled ' + samplingStats.collectionsSampled + ' collections');
        $.writeln('  ✓ Analyzed ' + samplingStats.totalItemsSampled + ' items');
        $.writeln('  ✓ Discovered ' + samplingStats.totalPropertiesDiscovered + ' item properties');
        
        // Step 3: Show actionable results
        $.writeln('🎯 Step 3: Generated access patterns...');
        showQuickResults(enhanced);
        
        $.writeln('');
        $.writeln('✅ DEMO COMPLETE! Now you know what\'s in your document and how to access it safely.');
        $.writeln('💡 Use showDOMVisualizer() for the full UI experience.');
        
    } catch (exc) {
        $.writeln('❌ Demo failed: ' + exc.message);
    }
}

/**
 * Show quick actionable results
 */
function showQuickResults(enhancedStructure) {
    try {
        var document_node = enhancedStructure.structure.document;
        if (!document_node || !document_node.collections) {
            $.writeln('  No collections found.');
            return;
        }
        
        var exampleCount = 0;
        for (var i = 0; i < document_node.collections.length && exampleCount < 3; i++) {
            var collection = document_node.collections[i];
            
            if (collection.hasSamplingData && collection.samplingData) {
                $.writeln('  📁 ' + collection.name + ' collection:');
                $.writeln('     Length: ' + collection.samplingData.collectionLength);
                
                if (collection.samplingData.accessPatterns && collection.samplingData.accessPatterns.length > 0) {
                    var pattern = collection.samplingData.accessPatterns[0];
                    var exampleCode = pattern.pattern.replace('[index]', '[0]');
                    $.writeln('     Example: var value = ' + exampleCode + ';');
                }
                
                exampleCount++;
            }
        }
        
        if (exampleCount === 0) {
            $.writeln('  Collections found but no safe access patterns generated.');
            $.writeln('  This might be a very simple document or all collections are empty.');
        }
        
    } catch (exc) {
        $.writeln('  Error showing results: ' + exc.message);
    }
}

/**
 * Comprehensive demo with detailed output
 */
function fullDemo() {
    $.writeln('');
    $.writeln('🎯 COMPREHENSIVE COLLECTION SAMPLING DEMO');
    $.writeln('=========================================');
    $.writeln('This demo shows the complete workflow from discovery to actionable access patterns.');
    $.writeln('');
    
    try {
        // Environment check
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('❌ Cannot run demo: ' + envResult.error);
            return;
        }
        
        var doc = envResult.document;
        $.writeln('📄 Document: ' + (doc.name || 'Unnamed'));
        $.writeln('📄 Pages: ' + safeGetLength(doc.pages));
        $.writeln('');
        
        // Full enumeration
        $.writeln('🔍 Phase 1: Complete DOM Structure Discovery');
        $.writeln('--------------------------------------------');
        var domStructure = enumerateDocumentDOM(doc, {
            maxDepth: 2,
            timeoutMs: 5000,
            skipDangerous: true,
            maxProperties: 1000
        });
        
        var stats = getDOMStatistics(domStructure);
        $.writeln('✓ DOM enumeration complete:');
        $.writeln('  • Objects discovered: ' + stats.totalNodes);
        $.writeln('  • Properties found: ' + stats.totalProperties);
        $.writeln('  • Max depth reached: ' + stats.maxDepth);
        $.writeln('  • Enumeration time: ' + stats.enumerationTime + 'ms');
        
        // Find collections
        var collections = findAllCollections(domStructure);
        $.writeln('  • Collections found: ' + collections.length);
        for (var i = 0; i < Math.min(collections.length, 5); i++) {
            $.writeln('    - ' + collections[i].name + ' [' + collections[i].safetyLevel + ']');
        }
        $.writeln('');
        
        // Collection sampling
        $.writeln('🔬 Phase 2: Collection Content Sampling');
        $.writeln('---------------------------------------');
        var enhanced = sampleCollectionContents(domStructure, doc, {
            maxSamplesPerCollection: 3,
            timeoutPerCollection: 3000,
            safetyFilter: 'moderate',
            enableProgressLogging: false
        });
        
        var samplingStats = getCollectionSamplingStatistics(enhanced);
        $.writeln('✓ Collection sampling complete:');
        $.writeln('  • Collections analyzed: ' + samplingStats.collectionsSampled + '/' + samplingStats.collectionsFound);
        $.writeln('  • Items sampled: ' + samplingStats.totalItemsSampled);
        $.writeln('  • Item properties discovered: ' + samplingStats.totalPropertiesDiscovered);
        $.writeln('  • Sampling time: ' + samplingStats.samplingTime + 'ms');
        $.writeln('  • Errors: ' + samplingStats.errors);
        $.writeln('');
        
        // Actionable results
        $.writeln('🎯 Phase 3: Actionable Access Patterns');
        $.writeln('--------------------------------------');
        showDetailedResults(enhanced);
        
        $.writeln('');
        $.writeln('🎉 FULL DEMO COMPLETE!');
        $.writeln('');
        $.writeln('What you just saw:');
        $.writeln('1. Document structure mapped (what collections exist)');
        $.writeln('2. Collection contents analyzed (what\'s inside each collection)'); 
        $.writeln('3. Safe access patterns generated (how to use the data)');
        $.writeln('');
        $.writeln('This transforms guesswork into reliable, document-specific property access!');
        
    } catch (exc) {
        $.writeln('❌ Demo error: ' + exc.message);
    }
}

/**
 * Show detailed actionable results
 */
function showDetailedResults(enhancedStructure) {
    try {
        var document_node = enhancedStructure.structure.document;
        if (!document_node || !document_node.collections) {
            $.writeln('No collections with data found.');
            return;
        }
        
        var foundUseful = false;
        
        for (var i = 0; i < document_node.collections.length; i++) {
            var collection = document_node.collections[i];
            
            if (collection.hasSamplingData && collection.samplingData) {
                foundUseful = true;
                $.writeln('');
                $.writeln('📁 Collection: ' + collection.name);
                $.writeln('   Safety Level: [' + collection.safetyLevel + ']');
                $.writeln('   Length: ' + collection.samplingData.collectionLength);
                
                if (collection.samplingData.accessPatterns && collection.samplingData.accessPatterns.length > 0) {
                    $.writeln('   Ready-to-use access patterns:');
                    
                    for (var j = 0; j < Math.min(collection.samplingData.accessPatterns.length, 3); j++) {
                        var pattern = collection.samplingData.accessPatterns[j];
                        var exampleCode = pattern.pattern.replace('[index]', '[0]');
                        $.writeln('   • var value = ' + exampleCode + ';  // ' + pattern.type + ' [' + pattern.safetyLevel + ']');
                    }
                    
                    // Safe iteration example
                    $.writeln('   Safe iteration pattern:');
                    $.writeln('   • try {');
                    $.writeln('   •   var items = document.' + collection.name + ';');
                    $.writeln('   •   for (var i = 0; i < items.length; i++) {');
                    $.writeln('   •     var item = items[i];');
                    $.writeln('   •     // Use item properties here');
                    $.writeln('   •   }');
                    $.writeln('   • } catch (exc) { /* handle safely */ }');
                    
                } else {
                    $.writeln('   No safe access patterns identified.');
                }
            }
        }
        
        if (!foundUseful) {
            $.writeln('No collections were successfully sampled.');
            $.writeln('This might indicate:');
            $.writeln('• Document has no collections');
            $.writeln('• All collections are empty');  
            $.writeln('• Collections are too risky to sample safely');
            $.writeln('• Try with more lenient safety settings');
        }
        
    } catch (exc) {
        $.writeln('Error showing detailed results: ' + exc.message);
    }
}

// ============================================================================
// AUTO-START AND USER GUIDANCE
// ============================================================================

$.writeln('');
$.writeln('🎉 ENHANCED DOM DISCOVERY SYSTEM LOADED!');
$.writeln('=======================================');
$.writeln('');
$.writeln('🚀 THREE WAYS TO USE THIS SYSTEM:');
$.writeln('');
$.writeln('1. 📱 GUI WAY (Recommended):');
$.writeln('   showDOMVisualizer()');
$.writeln('   → Click "Enumerate DOM"');  
$.writeln('   → Click "Sample Collections"');
$.writeln('   → Click "Export DOM"');
$.writeln('');
$.writeln('2. ⚡ QUICK DEMO WAY:');
$.writeln('   quickDemo()');
$.writeln('   → See results in console in 10 seconds');
$.writeln('');
$.writeln('3. 🔬 FULL DEMO WAY:');
$.writeln('   fullDemo()');
$.writeln('   → Complete analysis with detailed explanations');
$.writeln('');
$.writeln('💡 RECOMMENDED: Try quickDemo() first, then use the GUI!');

// Auto-start the GUI
try {
    if (confirm('DOM Discovery System loaded successfully!\n\nWould you like to:\n\n• OK = Open the GUI interface\n• Cancel = Use console commands')) {
        $.writeln('');
        $.writeln('🚀 Starting DOM Discovery GUI...');
        showDOMVisualizer();
    } else {
        $.writeln('');
        $.writeln('💡 GUI not started. Use these commands:');
        $.writeln('   • quickDemo() - Fast demo');
        $.writeln('   • fullDemo() - Detailed demo');  
        $.writeln('   • showDOMVisualizer() - Open GUI anytime');
    }
} catch (exc) {
    $.writeln('');
    $.writeln('💡 Use these commands:');
    $.writeln('   • quickDemo() - Fast demo');
    $.writeln('   • showDOMVisualizer() - Open GUI');
}