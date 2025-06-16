//
// InDesign DOM Discovery Builder v2.0 - INCLUDE-BASED LOADER (Enhanced)
// This script loads all DOM Discovery modules including the new Collection Sampler
// USAGE: Open this file in ExtendScript Toolkit and run it
//
// APPROACH: Uses ExtendScript #include for modular loading
// SCOPE: All included files share the same global scope
// BENEFITS: Easier debugging, individual file editing
//

// ============================================================================
// MODULE INCLUDES (Enhanced - Now with Collection Sampling!)
// ============================================================================

// Module 1: 1.0_safe-foundation.jsx (v1.0)
#include "1.0_safe-foundation.jsx"

// Module 2: 2.0_dom-enumerator.jsx (v2.0)
#include "2.0_dom-enumerator.jsx"

// Module 3: 3.0_dom-visualizer.jsx (v3.0) - Enhanced with Collection Sampling
#include "3.0_dom-visualizer.jsx"

// Module 4: 4.0_property-sampler.jsx (v4.0)
#include "4.0_property-sampler.jsx"

// Module 5: 5.0_dom-exporter.jsx (v5.0)
#include "5.0_dom-exporter.jsx"

// Module 6: 6.0_collection-sampler.jsx (v6.0) - NEW!
#include "6.0_collection-sampler.jsx"

// ============================================================================
// VERIFICATION AND AUTO-START
// ============================================================================

$.writeln("🎉 All 6 modules loaded via #include!");
$.writeln("📁 Include-based loading complete");
$.writeln("🆕 NEW: Collection sampling capability added!");

// Quick system check
var moduleStatus = {
    foundation: typeof safeTypeCheck === 'function',
    enumerator: typeof enumerateDocumentDOM === 'function', 
    visualizer: typeof showDOMVisualizer === 'function',
    sampler: typeof sampleDOMValues === 'function',
    exporter: typeof exportDOMStructure === 'function',
    collectionSampler: typeof sampleCollectionContents === 'function'
};

$.writeln("");
$.writeln("📋 Module Status Check:");
$.writeln("  ✓ Safe Foundation: " + (moduleStatus.foundation ? "Loaded" : "MISSING"));
$.writeln("  ✓ DOM Enumerator: " + (moduleStatus.enumerator ? "Loaded" : "MISSING"));
$.writeln("  ✓ DOM Visualizer: " + (moduleStatus.visualizer ? "Loaded" : "MISSING")); 
$.writeln("  ✓ Property Sampler: " + (moduleStatus.sampler ? "Loaded" : "MISSING"));
$.writeln("  ✓ DOM Exporter: " + (moduleStatus.exporter ? "Loaded" : "MISSING"));
$.writeln("  🆕 Collection Sampler: " + (moduleStatus.collectionSampler ? "Loaded" : "MISSING"));

// Auto-start DOM Discovery interface
try {
    if (typeof showDOMVisualizer === "function") {
        $.writeln("");
        $.writeln("🚀 Starting Enhanced DOM Discovery interface...");
        $.writeln("💡 NEW FEATURE: Click 'Sample Collections' after enumeration!");
        showDOMVisualizer();
    } else if (typeof showDOMExplorer === "function") {
        $.writeln("🚀 Starting DOM Explorer interface...");
        showDOMExplorer();
    } else {
        $.writeln("💡 Available functions:");
        $.writeln("  - showDOMVisualizer() - Full interface (enhanced with collection sampling)");
        $.writeln("  - quickDOMAnalysis() - Quick analysis (if available)");
        $.writeln("  - validateInDesignEnvironment() - Check environment");
        $.writeln("  - sampleCollectionContents(domStructure, document, config) - NEW!");
    }
} catch (exc) {
    $.writeln("❌ Auto-start failed: " + exc.message);
    $.writeln("💡 Try running showDOMVisualizer() manually");
}