//
// InDesign DOM Discovery Builder v2.0 - INCLUDE-BASED LOADER
// This script loads all DOM Discovery modules using #include directives
// USAGE: Open this file in ExtendScript Toolkit and run it
//
// Generated: 2025-06-16T02:13:44.588Z
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

// ============================================================================
// VERIFICATION AND AUTO-START
// ============================================================================

$.writeln("🎉 All 5 modules loaded via #include!");
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
