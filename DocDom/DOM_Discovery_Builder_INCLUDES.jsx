//
// InDesign DOM Discovery Builder v2.0 - INCLUDE-BASED LOADER
// This script loads all DOM Discovery modules using #include directives
// USAGE: Open this file in ExtendScript Toolkit and run it
//
// Generated: 2025-06-16T06:24:45.650Z
// APPROACH: Uses ExtendScript #include for modular loading
// SCOPE: All included files share the same global scope
// BENEFITS: Easier debugging, individual file editing
//

// ============================================================================
// MODULE INCLUDES (Auto-Generated)
// ============================================================================

// Module 1: 1.0_safe-foundation.jsx (v1.0)
#include "1.0_safe-foundation.jsx"

// Module 2: 2.0_dom-enumerator.jsx (v2.0)
#include "2.0_dom-enumerator.jsx"

// Module 3: 3.0_dom-visualizer.jsx (v3.0)
#include "3.0_dom-visualizer.jsx"

// Module 4: 4.0_property-sampler.jsx (v4.0)
#include "4.0_property-sampler.jsx"

// Module 5: 5.0_dom-exporter.jsx (v5.0)
#include "5.0_dom-exporter.jsx"

// Module 6: 6.0_collection-sampler.jsx (v6.0)
#include "6.0_collection-sampler.jsx"

// Module 7: 7.0_json-analyzer.jsx (v7.0)
#include "7.0_json-analyzer.jsx"

// Module 8: 8.0_dom-comparator.jsx (v8.0)
#include "8.0_dom-comparator.jsx"

// Module 9: 9.1_deep-mapper-core.jsx (v9.1)
#include "9.1_deep-mapper-core.jsx"

// Module 10: 9.2_deep-mapper-analysis.jsx (v9.2)
#include "9.2_deep-mapper-analysis.jsx"

// Module 11: 10.0_advanced-ui.jsx (v10.0)
#include "10.0_advanced-ui.jsx"

// ============================================================================
// VERIFICATION AND AUTO-START
// ============================================================================

$.writeln("🎉 All 11 modules loaded via #include!");
$.writeln("📁 Include-based loading complete");

// Auto-start DOM Discovery interface
try {
    if (typeof showDOMExplorer === "function") {
        $.writeln("🚀 Starting DOM Discovery interface...");
        showDOMExplorer();
    } else {
        $.writeln("💡 Use showDOMExplorer() to open the interface");
    }
} catch (exc) {
    $.writeln("❌ Auto-start failed: " + exc.message);
}
