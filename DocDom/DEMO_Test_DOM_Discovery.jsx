//
// 9_DEMO_Test_DOM_Discovery.jsx  
// InDesign DOM Discovery Builder - Demo and Testing Script
// CORE PURPOSE: Demonstrate and test DOM Discovery functionality
// DEPENDENCIES: All DOM Discovery modules (run 0_MAIN_DOM_Explorer.jsx first)
// USAGE: Run this after loading the main system to see demonstrations
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// DEMO CONFIGURATION
// ============================================================================

var DEMO_CONFIG = {
    runSafetyTests: true,
    runEnumerationDemo: true,
    runSamplingDemo: false,  // Optional - only if sampling module loaded
    runExportDemo: false,    // Optional - only if export module loaded
    showProgressInConsole: true,
    pauseBetweenDemos: true
};

// ============================================================================
// MAIN DEMO RUNNER
// ============================================================================

/**
 * Run comprehensive DOM Discovery demonstration
 */
function runDOMDiscoveryDemo() {
    $.writeln('');
    $.writeln('================================================================================');
    $.writeln('INDESIGN DOM DISCOVERY BUILDER - DEMONSTRATION');
    $.writeln('================================================================================');
    $.writeln('This demo will test and demonstrate all DOM Discovery functionality.');
    $.writeln('');
    
    try {
        // Check if system is loaded
        if (!isDOMDiscoverySystemLoaded()) {
            $.writeln('ERROR: DOM Discovery system not loaded.');
            $.writeln('Please run 0_MAIN_DOM_Explorer.jsx first to load the system.');
            alert('DOM Discovery system not loaded.\n\nPlease run 0_MAIN_DOM_Explorer.jsx first.');
            return false;
        }
        
        $.writeln('✓ DOM Discovery system detected and ready');
        $.writeln('');
        
        var demoResults = {
            safetyTests: null,
            enumerationDemo: null,
            samplingDemo: null,
            exportDemo: null,
            overallSuccess: false
        };
        
        // Demo 1: Safety Tests
        if (DEMO_CONFIG.runSafetyTests) {
            $.writeln('DEMO 1: Safety Foundation Tests');
            $.writeln('===============================');
            demoResults.safetyTests = runSafetyFoundationDemo();
            if (DEMO_CONFIG.pauseBetweenDemos) pauseForUser();
        }
        
        // Demo 2: DOM Enumeration
        if (DEMO_CONFIG.runEnumerationDemo) {
            $.writeln('DEMO 2: DOM Structure Enumeration');
            $.writeln('=================================');
            demoResults.enumerationDemo = runEnumerationDemo();
            if (DEMO_CONFIG.pauseBetweenDemos) pauseForUser();
        }
        
        // Demo 3: Property Sampling (optional)
        if (DEMO_CONFIG.runSamplingDemo && isSamplingModuleLoaded()) {
            $.writeln('DEMO 3: Property Value Sampling');
            $.writeln('===============================');
            demoResults.samplingDemo = runSamplingDemo();
            if (DEMO_CONFIG.pauseBetweenDemos) pauseForUser();
        }
        
        // Demo 4: Export (optional)
        if (DEMO_CONFIG.runExportDemo && isExportModuleLoaded()) {
            $.writeln('DEMO 4: DOM Structure Export');
            $.writeln('============================');
            demoResults.exportDemo = runExportDemo();
        }
        
        // Summary
        showDemoSummary(demoResults);
        
        return true;
        
    } catch (exc) {
        $.writeln('DEMO ERROR: ' + exc.message);
        alert('Demo failed:\n\n' + exc.message);
        return false;
    }
}

/**
 * Test safety foundation functions
 * @returns {Object} - Test results
 */
function runSafetyFoundationDemo() {
    var results = {
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        errors: []
    };
    
    $.writeln('Testing safety foundation functions...');
    
    try {
        // Test 1: Environment validation
        $.writeln('  Test 1: Environment validation');
        results.testsRun++;
        var envResult = validateInDesignEnvironment();
        if (envResult && typeof envResult.valid === 'boolean') {
            results.testsPassed++;
            $.writeln('    ✓ Environment validation works: ' + (envResult.valid ? 'Valid' : 'Invalid'));
            if (!envResult.valid) {
                $.writeln('    Note: ' + envResult.error);
            }
        } else {
            results.testsFailed++;
            results.errors.push('Environment validation failed');
            $.writeln('    ✗ Environment validation failed');
        }
        
        // Test 2: Safe type checking
        $.writeln('  Test 2: Safe type checking');
        results.testsRun++;
        var testObj = {testProp: 'testValue', testNumber: 42};
        var typeResult = safeTypeCheck(testObj, 'testProp');
        if (typeResult === 'string') {
            results.testsPassed++;
            $.writeln('    ✓ Safe type checking works correctly');
        } else {
            results.testsFailed++;
            results.errors.push('Safe type checking returned: ' + typeResult);
            $.writeln('    ✗ Safe type checking failed, returned: ' + typeResult);
        }
        
        // Test 3: Reserved word detection
        $.writeln('  Test 3: Reserved word detection');
        results.testsRun++;
        var isReserved = isReservedWord('function');
        var isNotReserved = isReservedWord('myProperty');
        if (isReserved === true && isNotReserved === false) {
            results.testsPassed++;
            $.writeln('    ✓ Reserved word detection works correctly');
        } else {
            results.testsFailed++;
            results.errors.push('Reserved word detection logic error');
            $.writeln('    ✗ Reserved word detection failed');
        }
        
        // Test 4: String builder
        $.writeln('  Test 4: String builder utility');
        results.testsRun++;
        var builder = createStringBuilder();
        builder.append('Hello');
        builder.append(' ');
        builder.appendLine('World');
        var result = builder.toString();
        if (result === 'Hello World\n') {
            results.testsPassed++;
            $.writeln('    ✓ String builder works correctly');
        } else {
            results.testsFailed++;
            results.errors.push('String builder output: ' + result);
            $.writeln('    ✗ String builder failed');
        }
        
    } catch (exc) {
        results.errors.push('Safety demo exception: ' + exc.message);
        $.writeln('    ✗ Safety demo exception: ' + exc.message);
    }
    
    $.writeln('');
    $.writeln('Safety Foundation Results:');
    $.writeln('  Tests run: ' + results.testsRun);
    $.writeln('  Passed: ' + results.testsPassed);
    $.writeln('  Failed: ' + results.testsFailed);
    $.writeln('');
    
    return results;
}

/**
 * Demonstrate DOM enumeration
 * @returns {Object} - Demo results
 */
function runEnumerationDemo() {
    var results = {
        success: false,
        domStructure: null,
        statistics: null,
        error: null
    };
    
    $.writeln('Running DOM enumeration demonstration...');
    
    try {
        // Validate environment first
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            results.error = envResult.error;
            $.writeln('  Cannot run enumeration demo: ' + envResult.error);
            $.writeln('  Please open an InDesign document and try again.');
            return results;
        }
        
        var doc = envResult.document;
        $.writeln('  Document found: ' + (doc.name || 'Unnamed'));
        
        // Run enumeration with demo settings
        var config = {
            maxDepth: 2,
            timeoutMs: 3000,
            skipDangerous: true,
            maxProperties: 500
        };
        
        $.writeln('  Starting enumeration with demo configuration...');
        $.writeln('    Max Depth: ' + config.maxDepth);
        $.writeln('    Timeout: ' + config.timeoutMs + 'ms');
        $.writeln('    Skip Dangerous: ' + config.skipDangerous);
        
        var startTime = new Date().getTime();
        var domStructure = enumerateDocumentDOM(doc, config);
        var enumTime = new Date().getTime() - startTime;
        
        if (domStructure) {
            results.success = true;
            results.domStructure = domStructure;
            results.statistics = getDOMStatistics(domStructure);
            
            $.writeln('  ✓ DOM enumeration completed successfully!');
            $.writeln('    Total objects: ' + results.statistics.totalNodes);
            $.writeln('    Total properties: ' + results.statistics.totalProperties);
            $.writeln('    Max depth reached: ' + results.statistics.maxDepth);
            $.writeln('    Enumeration time: ' + enumTime + 'ms');
            $.writeln('    Timeouts: ' + results.statistics.timeouts);
            $.writeln('    Circular refs: ' + results.statistics.circularRefs);
            $.writeln('    Errors: ' + results.statistics.errors);
            
            // Show some example discoveries
            if (domStructure.structure && domStructure.structure.document) {
                showDiscoveryExamples(domStructure.structure.document);
            }
            
        } else {
            results.error = 'Enumeration returned null result';
            $.writeln('  ✗ DOM enumeration failed - no structure returned');
        }
        
    } catch (exc) {
        results.error = 'Enumeration exception: ' + exc.message;
        $.writeln('  ✗ DOM enumeration failed: ' + exc.message);
    }
    
    $.writeln('');
    return results;
}

/**
 * Show examples of what was discovered
 * @param {Object} documentNode - Document DOM node
 */
function showDiscoveryExamples(documentNode) {
    $.writeln('    Discovery Examples:');
    
    // Show some safe properties
    if (documentNode.properties && documentNode.properties.length > 0) {
        var safeProps = [];
        for (var i = 0; i < documentNode.properties.length; i++) {
            var prop = documentNode.properties[i];
            if (prop.safetyLevel === 'safe' && safeProps.length < 3) {
                safeProps.push(prop);
            }
        }
        
        if (safeProps.length > 0) {
            $.writeln('      Safe properties found:');
            for (var i = 0; i < safeProps.length; i++) {
                var prop = safeProps[i];
                $.writeln('        - ' + prop.name + ' (' + prop.type + ')');
            }
        }
    }
    
    // Show collections found
    if (documentNode.collections && documentNode.collections.length > 0) {
        $.writeln('      Collections found:');
        for (var i = 0; i < Math.min(documentNode.collections.length, 3); i++) {
            var collection = documentNode.collections[i];
            $.writeln('        - ' + collection.name + ' [' + collection.safetyLevel + ']');
        }
    }
}

/**
 * Demonstrate property sampling (if module loaded)
 * @returns {Object} - Demo results  
 */
function runSamplingDemo() {
    var results = {
        success: false,
        sampledProperties: 0,
        errors: 0,
        error: null
    };
    
    $.writeln('Running property value sampling demonstration...');
    $.writeln('Note: This demo only samples SAFE properties to avoid crashes.');
    
    try {
        // First need a DOM structure
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            results.error = 'No document available';
            $.writeln('  Cannot run sampling demo: ' + envResult.error);
            return results;
        }
        
        // Quick enumeration for sampling
        var doc = envResult.document;
        var domStructure = enumerateDocumentDOM(doc, {maxDepth: 1, timeoutMs: 2000});
        
        if (!domStructure) {
            results.error = 'Could not enumerate DOM for sampling';
            $.writeln('  Could not enumerate DOM structure for sampling');
            return results;
        }
        
        // Sample with very safe settings
        var samplingConfig = {
            safetyFilter: 'safe',
            maxSamples: 5,
            timeoutMs: 500,
            includeCollectionSamples: false
        };
        
        $.writeln('  Sampling safe properties only...');
        var sampledStructure = sampleDOMValues(domStructure, samplingConfig);
        
        if (sampledStructure) {
            var samplingStats = getSamplingStatistics(sampledStructure);
            results.success = true;
            results.sampledProperties = samplingStats.successful;
            results.errors = samplingStats.errors;
            
            $.writeln('  ✓ Property sampling completed!');
            $.writeln('    Properties sampled: ' + samplingStats.successful);
            $.writeln('    Sampling errors: ' + samplingStats.errors);
            $.writeln('    Timeouts: ' + samplingStats.timeouts);
        }
        
    } catch (exc) {
        results.error = 'Sampling exception: ' + exc.message;
        $.writeln('  ✗ Property sampling failed: ' + exc.message);
    }
    
    $.writeln('');
    return results;
}

/**
 * Demonstrate export functionality (if module loaded)
 * @returns {Object} - Demo results
 */
function runExportDemo() {
    var results = {
        success: false,
        exportPath: '',
        error: null
    };
    
    $.writeln('Running DOM export demonstration...');
    
    try {
        // Need DOM structure to export
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            results.error = 'No document available';
            $.writeln('  Cannot run export demo: ' + envResult.error);
            return results;
        }
        
        // Quick enumeration for export
        var doc = envResult.document;
        var domStructure = enumerateDocumentDOM(doc, {maxDepth: 1, timeoutMs: 2000});
        
        if (!domStructure) {
            results.error = 'Could not enumerate DOM for export';
            $.writeln('  Could not enumerate DOM structure for export');
            return results;
        }
        
        $.writeln('  Exporting DOM structure to text format...');
        
        // Export to text format
        var exportResult = exportDOMStructure(domStructure, 'text');
        
        if (exportResult && exportResult.success) {
            results.success = true;
            results.exportPath = exportResult.filePath;
            
            $.writeln('  ✓ DOM export completed successfully!');
            $.writeln('    Export file: ' + exportResult.filePath);
        } else {
            results.error = exportResult ? exportResult.error : 'Export failed with no error message';
            $.writeln('  ✗ DOM export failed: ' + results.error);
        }
        
    } catch (exc) {
        results.error = 'Export exception: ' + exc.message;
        $.writeln('  ✗ DOM export failed: ' + exc.message);
    }
    
    $.writeln('');
    return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if DOM Discovery system is loaded
 * @returns {Boolean} - true if system appears to be loaded
 */
function isDOMDiscoverySystemLoaded() {
    try {
        return (typeof safeTypeCheck === 'function' && 
                typeof enumerateDocumentDOM === 'function' &&
                typeof validateInDesignEnvironment === 'function');
    } catch (exc) {
        return false;
    }
}

/**
 * Check if sampling module is loaded
 * @returns {Boolean} - true if sampling module available
 */
function isSamplingModuleLoaded() {
    try {
        return typeof sampleDOMValues === 'function';
    } catch (exc) {
        return false;
    }
}

/**
 * Check if export module is loaded
 * @returns {Boolean} - true if export module available
 */
function isExportModuleLoaded() {
    try {
        return typeof exportDOMStructure === 'function';
    } catch (exc) {
        return false;
    }
}

/**
 * Pause for user input (simple implementation)
 */
function pauseForUser() {
    if (confirm('Demo paused. Continue to next section?')) {
        $.writeln('');
    }
}

/**
 * Show comprehensive demo summary
 * @param {Object} demoResults - Results from all demo sections
 */
function showDemoSummary(demoResults) {
    $.writeln('================================================================================');
    $.writeln('DEMO SUMMARY');
    $.writeln('================================================================================');
    
    var overallSuccess = true;
    
    // Safety tests
    if (demoResults.safetyTests) {
        var safety = demoResults.safetyTests;
        $.writeln('Safety Foundation Tests: ' + safety.testsPassed + '/' + safety.testsRun + ' passed');
        if (safety.testsFailed > 0) overallSuccess = false;
    }
    
    // Enumeration
    if (demoResults.enumerationDemo) {
        var enum_result = demoResults.enumerationDemo;
        $.writeln('DOM Enumeration: ' + (enum_result.success ? 'SUCCESS' : 'FAILED'));
        if (enum_result.success && enum_result.statistics) {
            $.writeln('  Properties discovered: ' + enum_result.statistics.totalProperties);
        }
        if (!enum_result.success) overallSuccess = false;
    }
    
    // Sampling
    if (demoResults.samplingDemo) {
        var sampling = demoResults.samplingDemo;
        $.writeln('Property Sampling: ' + (sampling.success ? 'SUCCESS' : 'FAILED'));
        if (sampling.success) {
            $.writeln('  Properties sampled: ' + sampling.sampledProperties);
        }
    }
    
    // Export
    if (demoResults.exportDemo) {
        var export_result = demoResults.exportDemo;
        $.writeln('DOM Export: ' + (export_result.success ? 'SUCCESS' : 'FAILED'));
        if (export_result.success) {
            $.writeln('  Export file created: ' + export_result.exportPath);
        }
    }
    
    $.writeln('');
    $.writeln('Overall Demo Result: ' + (overallSuccess ? 'SUCCESS' : 'SOME ISSUES'));
    
    if (overallSuccess) {
        $.writeln('✓ All core functionality is working correctly!');
        $.writeln('The DOM Discovery system is ready for production use.');
    } else {
        $.writeln('⚠ Some issues were detected during testing.');
        $.writeln('Please review the detailed results above.');
    }
    
    $.writeln('');
    $.writeln('To use the DOM Discovery system:');
    $.writeln('  1. Run showDOMVisualizer() to open the interface');
    $.writeln('  2. Click "Enumerate DOM" to discover document structure');
    $.writeln('  3. Export results for analysis and development');
    $.writeln('================================================================================');
}

// ============================================================================
// AUTO-RUN DEMO
// ============================================================================

// Offer to run demo automatically
try {
    if (isDOMDiscoverySystemLoaded()) {
        $.writeln('DOM Discovery Demo Script loaded.');
        $.writeln('Use runDOMDiscoveryDemo() to test all functionality.');
        
        // Optionally auto-run
        if (confirm('DOM Discovery system detected.\n\nWould you like to run the demonstration now?')) {
            runDOMDiscoveryDemo();
        }
    } else {
        $.writeln('DOM Discovery system not detected.');
        $.writeln('Please load the main system first using 0_MAIN_DOM_Explorer.jsx');
    }
} catch (exc) {
    $.writeln('Demo script initialization error: ' + exc.message);
}