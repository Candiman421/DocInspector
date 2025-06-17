//
// InDesign DOM Discovery Builder v2.1 - INCLUDE-BASED LOADER
// This script loads all modules using #include directives
// USAGE: Open this file in ExtendScript Toolkit and run it
//
// Generated: 2025-06-17T03:27:38.660Z
// APPROACH: Uses ExtendScript #include for modular loading
// SCOPE: All included files share the same global scope
// BENEFITS: Easier debugging, individual file editing
// DEPENDENCIES: Sequential order maintained for proper loading
//

// ============================================================================
// MODULE INCLUDES (Sequential Dependency Order)
// ============================================================================

// Module 1: 0.0_module-loader.jsx (v0.0)
#include "0.0_module-loader.jsx"

// Module 2: 1.0_safe-foundation.jsx (v1.0)
#include "1.0_safe-foundation.jsx"

// Module 3: 2.0_dom-enumerator.jsx (v2.0)
#include "2.0_dom-enumerator.jsx"

// Module 4: 3.0_collection-sampler.jsx (v3.0)
#include "3.0_collection-sampler.jsx"

// Module 5: 4.0_property-sampler.jsx (v4.0)
#include "4.0_property-sampler.jsx"

// Module 6: 5.0_dom-exporter.jsx (v5.0)
#include "5.0_dom-exporter.jsx"

// Module 7: 6.0_json-analyzer.jsx (v6.0)
#include "6.0_json-analyzer.jsx"

// Module 8: 7.0_dom-comparator.jsx (v7.0)
#include "7.0_dom-comparator.jsx"

// Module 9: 8.0_deep-mapper.jsx (v8.0)
#include "8.0_deep-mapper.jsx"

// Module 10: 9.0_dom-visualizer.jsx (v9.0)
#include "9.0_dom-visualizer.jsx"

// Module 11: 10.0_advanced-ui.jsx (v10.0)
#include "10.0_advanced-ui.jsx"

// ============================================================================
// VERIFICATION AND AUTO-START
// ============================================================================

$.writeln("🎉 All 11 modules loaded via #include!");
$.writeln("📁 Include-based loading complete");

// Auto-start DOM Discovery interface
try {
    if (typeof showDOMVisualizer === "function") {
        $.writeln("🚀 Starting DOM Discovery interface...");
        showDOMVisualizer();
    } else if (typeof showDOMExplorer === "function") {
        showDOMExplorer();
    } else {
        $.writeln("💡 Use showDOMVisualizer() to open the interface");
    }
} catch (exc) {
    $.writeln("❌ Auto-start failed: " + exc.message);
}
