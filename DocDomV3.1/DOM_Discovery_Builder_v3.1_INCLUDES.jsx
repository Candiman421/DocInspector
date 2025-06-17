//
// InDesign DOM Discovery Builder v3.1 - INCLUDE-BASED LOADER
// This script loads all modules using #include directives
// USAGE: Open this file in ExtendScript Toolkit and run it
//
// Generated: 2025-06-17T19:57:17.548Z
// APPROACH: Uses ExtendScript #include for modular loading
// SCOPE: All included files share the same global scope
// BENEFITS: Easier debugging, individual file editing
// DEPENDENCIES: Sequential order maintained for proper loading
//

// ============================================================================
// MODULE INCLUDES (Sequential Dependency Order)
// ============================================================================

// Module 1: 1.1_bootstrap-foundation.jsx (v1.1)
#include "1.1_bootstrap-foundation.jsx"

// Module 2: 1.2_safety-utilities.jsx (v1.2)
#include "1.2_safety-utilities.jsx"

// Module 3: 2.1_dom-enumerator.jsx (v2.1)
#include "2.1_dom-enumerator.jsx"

// Module 4: 2.2_collection-sampler.jsx (v2.2)
#include "2.2_collection-sampler.jsx"

// Module 5: 3.1_property-sampler.jsx (v3.1)
#include "3.1_property-sampler.jsx"

// Module 6: 3.2_dom-exporter.jsx (v3.2)
#include "3.2_dom-exporter.jsx"

// Module 7: 4.1_json-analyzer.jsx (v4.1)
#include "4.1_json-analyzer.jsx"

// Module 8: 4.2_dom-comparator.jsx (v4.2)
#include "4.2_dom-comparator.jsx"

// Module 9: 5.1_deep-mapper.jsx (v5.1)
#include "5.1_deep-mapper.jsx"

// Module 10: 5.2_dom-visualizer.jsx (v5.2)
#include "5.2_dom-visualizer.jsx"

// Module 11: 6.1_advanced-ui.jsx (v6.1)
#include "6.1_advanced-ui.jsx"

// ============================================================================
// VERIFICATION AND AUTO-START
// ============================================================================

$.writeln("🎉 All 11 modules loaded via #include!");
$.writeln("📁 Include-based loading complete");

// Auto-start DOM Discovery interface
try {
    if (typeof showAdvancedUI === "function") {
        $.writeln("🚀 Starting Advanced UI interface...");
        showAdvancedUI();
    } else if (typeof showDOMVisualizer === "function") {
        showDOMVisualizer();
    } else if (typeof showDOMExplorer === "function") {
        showDOMExplorer();
    } else {
        $.writeln("💡 Use showAdvancedUI() to open the interface");
    }
} catch (exc) {
    $.writeln("❌ Auto-start failed: " + exc.message);
}
