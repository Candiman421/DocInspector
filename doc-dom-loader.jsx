//
// InDesign DOM Discovery Builder v2.1 - COMPREHENSIVE SEQUENTIAL LOADER
// This script loads all DOM Discovery modules in proper sequential order
// USAGE: Place this file as peer to DocDom/ folder and run in ExtendScript Toolkit
// 
// PROJECT STRUCTURE:
// ProjectRoot/
// ├── DocDom/                    # Module directory
// │   ├── 1.0_safe-foundation.jsx
// │   ├── 2.0_dom-enumerator.jsx
// │   ├── ... (all 11 modules)
// │   └── 10.0_advanced-ui.jsx
// └── doc-dom-loader.jsx         # This loader file
//
// APPROACH: Uses ExtendScript #include for modular loading
// SCOPE: All included files share the same global scope (no scope isolation)
// BENEFITS: Easier debugging, individual file editing, comprehensive analysis
// ES3 COMPATIBLE: No emoticons, no modern JS features, ExtendScript safe
//

// ============================================================================
// SEQUENTIAL MODULE INCLUDES (v2.1 - Complete System)
// ============================================================================

$.writeln('InDesign DOM Discovery Builder v2.1 - Sequential Loading Started');
$.writeln('Loading modules from DocDom/ directory...');
$.writeln('');

// Module 1: Enhanced Safe Foundation with Object Reference Tracking
$.writeln('Loading 1.0: Enhanced Safe Foundation...');
#include "DocDom/1.0_safe-foundation.jsx"

// Module 2: Enhanced DOM Enumerator with Deeper Traversal
$.writeln('Loading 2.0: Enhanced DOM Enumerator...');
#include "DocDom/2.0_dom-enumerator.jsx"

// Module 3: Fixed DOM Visualizer (Basic Interface)
$.writeln('Loading 3.0: DOM Visualizer (Fixed Dependencies)...');
#include "DocDom/3.0_dom-visualizer.jsx"

// Module 4: Enhanced Property Sampler with Reference Tracking
$.writeln('Loading 4.0: Enhanced Property Sampler...');
#include "DocDom/4.0_property-sampler.jsx"

// Module 5: Enhanced DOM Exporter with Reference IDs
$.writeln('Loading 5.0: Enhanced DOM Exporter...');
#include "DocDom/5.0_dom-exporter.jsx"

// Module 6: Enhanced Collection Sampler (Discovery-First)
$.writeln('Loading 6.0: Enhanced Collection Sampler...');
#include "DocDom/6.0_collection-sampler.jsx"

// Module 7: JSON Analyzer for Post-Processing
$.writeln('Loading 7.0: JSON Analyzer...');
#include "DocDom/7.0_json-analyzer.jsx"

// Module 8: DOM Comparator for Before/After Analysis
$.writeln('Loading 8.0: DOM Comparator...');
#include "DocDom/8.0_dom-comparator.jsx"

// Module 9.1: Deep Mapper Core Engine
$.writeln('Loading 9.1: Deep Mapper Core...');
#include "DocDom/9.1_deep-mapper-core.jsx"

// Module 9.2: Deep Mapper Analysis and Reporting
$.writeln('Loading 9.2: Deep Mapper Analysis...');
#include "DocDom/9.2_deep-mapper-analysis.jsx"

// Module 10: Advanced UI with Comprehensive Analysis
$.writeln('Loading 10.0: Advanced UI Interface...');
#include "DocDom/10.0_advanced-ui.jsx"

// ============================================================================
// COMPREHENSIVE SYSTEM VERIFICATION
// ============================================================================

$.writeln('');
$.writeln('All 11 modules loaded via sequential #include!');
$.writeln('Include-based loading complete');
$.writeln('NEW v2.1: Deep mapping, JSON analysis, before/after comparison!');
$.writeln('');

// Comprehensive module status check
var moduleStatus = {
    // Core modules
    foundation: typeof safeTypeCheck === 'function' && typeof createObjectReferenceTracker === 'function',
    enumerator: typeof enumerateDocumentDOM === 'function',
    visualizer: typeof showDOMVisualizer === 'function',
    sampler: typeof sampleDOMValues === 'function',
    exporter: typeof exportDOMStructure === 'function',
    collectionSampler: typeof sampleCollectionContents === 'function',
    
    // Advanced analysis modules
    jsonAnalyzer: typeof analyzeJSONStructure === 'function',
    comparator: typeof compareDOMStructures === 'function',
    deepMapperCore: typeof performDeepDOMMapping === 'function',
    deepMapperAnalysis: typeof analyzeDeepMappingSession === 'function',
    advancedUI: typeof showAdvancedDOMAnalysis === 'function'
};

$.writeln('Comprehensive Module Status Check:');
$.writeln('====================================');

// Core Foundation Modules
$.writeln('CORE FOUNDATION:');
$.writeln('  1.0 Enhanced Safe Foundation: ' + (moduleStatus.foundation ? 'LOADED' : 'MISSING'));
$.writeln('  2.0 Enhanced DOM Enumerator: ' + (moduleStatus.enumerator ? 'LOADED' : 'MISSING'));

// Core Feature Modules  
$.writeln('CORE FEATURES:');
$.writeln('  3.0 DOM Visualizer (Fixed): ' + (moduleStatus.visualizer ? 'LOADED' : 'MISSING'));
$.writeln('  4.0 Enhanced Property Sampler: ' + (moduleStatus.sampler ? 'LOADED' : 'MISSING'));
$.writeln('  5.0 Enhanced DOM Exporter: ' + (moduleStatus.exporter ? 'LOADED' : 'MISSING'));
$.writeln('  6.0 Enhanced Collection Sampler: ' + (moduleStatus.collectionSampler ? 'LOADED' : 'MISSING'));

// Advanced Analysis Modules
$.writeln('ADVANCED ANALYSIS:');
$.writeln('  7.0 JSON Analyzer: ' + (moduleStatus.jsonAnalyzer ? 'LOADED' : 'MISSING'));
$.writeln('  8.0 DOM Comparator: ' + (moduleStatus.comparator ? 'LOADED' : 'MISSING'));
$.writeln('  9.1 Deep Mapper Core: ' + (moduleStatus.deepMapperCore ? 'LOADED' : 'MISSING'));
$.writeln('  9.2 Deep Mapper Analysis: ' + (moduleStatus.deepMapperAnalysis ? 'LOADED' : 'MISSING'));

// Advanced Interface
$.writeln('ADVANCED INTERFACE:');
$.writeln('  10.0 Advanced UI: ' + (moduleStatus.advancedUI ? 'LOADED' : 'MISSING'));

$.writeln('====================================');

// Calculate overall system health
var loadedModules = 0;
var totalModules = 0;
for (var module in moduleStatus) {
    totalModules++;
    if (moduleStatus[module]) loadedModules++;
}

$.writeln('SYSTEM STATUS: ' + loadedModules + '/' + totalModules + ' modules loaded (' + 
          Math.round((loadedModules/totalModules)*100) + '%)');

if (loadedModules === totalModules) {
    $.writeln('SYSTEM READY: Full v2.1 capabilities available!');
} else if (loadedModules >= 6) {
    $.writeln('PARTIAL SYSTEM: Basic capabilities available, some advanced features missing');
} else {
    $.writeln('SYSTEM ISSUES: Critical modules missing, check file paths and permissions');
}

// ============================================================================
// AUTO-START OPTIONS
// ============================================================================

$.writeln('');
$.writeln('INTERFACE OPTIONS:');
$.writeln('==================');

// Determine best interface to start
try {
    if (moduleStatus.advancedUI && moduleStatus.jsonAnalyzer && moduleStatus.comparator) {
        $.writeln('RECOMMENDED: Advanced Analysis Interface');
        $.writeln('   Features: JSON analysis, before/after comparison, deep mapping');
        $.writeln('   Command: showAdvancedDOMAnalysis()');
        $.writeln('');
        
        var startAdvanced = confirm('Start Advanced Analysis Interface?\n\n' +
                                   'Features:\n' +
                                   '• Load and analyze JSON exports\n' +
                                   '• Compare document snapshots\n' +
                                   '• Deep DOM mapping and analysis\n' +
                                   '• Comprehensive reporting\n\n' +
                                   'Choose OK for Advanced or Cancel for Basic interface');
        
        if (startAdvanced) {
            $.writeln('Starting Advanced Analysis Interface...');
            showAdvancedDOMAnalysis();
        } else {
            $.writeln('Starting Basic DOM Discovery Interface...');
            showDOMVisualizer();
        }
        
    } else if (moduleStatus.visualizer) {
        $.writeln('AVAILABLE: Basic DOM Discovery Interface');
        $.writeln('   Features: DOM enumeration, collection sampling, export');
        $.writeln('   Command: showDOMVisualizer()');
        $.writeln('');
        $.writeln('Starting Basic DOM Discovery Interface...');
        showDOMVisualizer();
        
    } else {
        throw new Error('No UI interfaces available');
    }
    
} catch (exc) {
    $.writeln('Auto-start failed: ' + exc.message);
    $.writeln('');
    $.writeln('MANUAL COMMANDS AVAILABLE:');
    
    if (moduleStatus.advancedUI) {
        $.writeln('  showAdvancedDOMAnalysis() - Advanced analysis interface');
    }
    if (moduleStatus.visualizer) {
        $.writeln('  showDOMVisualizer() - Basic discovery interface');
    }
    if (moduleStatus.deepMapperCore) {
        $.writeln('  performDeepDOMMapping(doc, config) - Deep DOM mapping');
    }
    if (moduleStatus.comparator) {
        $.writeln('  compareDOMStructures(before, after, config) - Document comparison');
    }
    if (moduleStatus.jsonAnalyzer) {
        $.writeln('  analyzeJSONStructure(domStructure, config) - JSON analysis');
    }
    
    $.writeln('  validateInDesignEnvironment() - Check environment');
    $.writeln('');
    $.writeln('See doc-dom-readme.md for complete usage guide');
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

$.writeln('');
$.writeln('SYSTEM INFORMATION:');
$.writeln('===================');
$.writeln('Version: InDesign DOM Discovery Builder v2.1');
$.writeln('Modules: 11 total (1.0-10.0)');
$.writeln('Capabilities: Discovery, Sampling, Export, Analysis, Comparison, Deep Mapping');
$.writeln('Architecture: Sequential dependency model with ES3 compatibility');
$.writeln('Safety: Discovery-first approach with comprehensive error handling');
$.writeln('Scope: All modules share global scope via #include (no scope isolation)');
$.writeln('');
$.writeln('WORKFLOW OPTIONS:');
$.writeln('1. BASIC: Discover -> Sample -> Export');
$.writeln('2. ADVANCED: Export -> Modify -> Export -> Compare -> Report');
$.writeln('3. DEEP: Map -> Analyze -> Report');
$.writeln('');
$.writeln('For complete documentation, see doc-dom-readme.md');
$.writeln('Ready for comprehensive DOM analysis and comparison!');
$.writeln('');