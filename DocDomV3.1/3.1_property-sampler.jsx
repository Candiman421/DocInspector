// =============================================================================
// 3.1_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~1500 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var PROPERTY_SAMPLER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator'];
var dependencyCheck = validateDependencies(PROPERTY_SAMPLER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Property Sampler missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// PROPERTY SAMPLING CONFIGURATION
// =============================================================================

var DEFAULT_SAMPLING_CONFIG = {
    safetyFilter: 'safe',
    maxSamples: 10,
    timeoutMs: 1000,
    includeCollectionSamples: false,
    maxStringLength: 500,
    maxObjectDepth: 1,
    trackObjectReferences: true,
    includeValueMetadata: true,
    generateValueFingerprints: true,
    enableProgressReporting: false,
    enableDetailedLogging: false,
    skipNullValues: false,
    skipUndefinedValues: false,
    maxCollectionDepth: 2,
    preserveOriginalTypes: true
};

// =============================================================================
// MAIN SAMPLING FUNCTIONS
// =============================================================================

/**
 * Sample DOM property values with comprehensive tracking
 * @param {Object} domStructure - DOM structure with discovered properties
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with sampled values
 */
function sampleDOMValues(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();
    
    $.writeln('[SAMPLE DEBUG] === STARTING sampleDOMValues ===');
    $.writeln('[SAMPLE DEBUG] domStructure type: ' + typeof domStructure);
    $.writeln('[SAMPLE DEBUG] sourceDocument type: ' + typeof sourceDocument);
    $.writeln('[SAMPLE DEBUG] samplingConfig type: ' + typeof samplingConfig);
    
    var config = samplingConfig ?
        objectMerge(DEFAULT_SAMPLING_CONFIG, samplingConfig) : 
        objectClone(DEFAULT_SAMPLING_CONFIG, 2);
    
    $.writeln('[SAMPLE DEBUG] Final config maxSamples: ' + config.maxSamples);
    $.writeln('[SAMPLE DEBUG] Final config safetyFilter: ' + config.safetyFilter);
    $.writeln('[SAMPLE DEBUG] Final config timeoutMs: ' + config.timeoutMs);
    
    try {
        // Validate inputs properly
        if (!domStructure || typeof domStructure !== 'object') {
            $.writeln('[SAMPLE DEBUG] ERROR: Invalid domStructure');
            return {
                error: 'Invalid DOM structure provided',
                timestamp: getCurrentTimestamp()
            };
        }
        
        if (!sourceDocument) {
            $.writeln('[SAMPLE DEBUG] ERROR: No source document');
            return {
                error: 'No source document provided',
                timestamp: getCurrentTimestamp()
            };
        }
        
        // Handle both input formats - direct structure or wrapped structure
        var docNode = null;
        if (domStructure.structure && domStructure.structure.document) {
            // Wrapped format: {structure: {document: {...}}}
            docNode = domStructure.structure.document;
            $.writeln('[SAMPLE DEBUG] Using wrapped format - domStructure.structure.document');
        } else if (domStructure.document) {
            // Direct format: {document: {...}}
            docNode = domStructure.document;
            $.writeln('[SAMPLE DEBUG] Using direct format - domStructure.document');
        } else {
            $.writeln('[SAMPLE DEBUG] ERROR: No document node found in either format');
            return {
                error: 'No document node found in structure',
                timestamp: getCurrentTimestamp()
            };
        }
        
        // Create sampling session
        var samplingSession = {
            startTime: startTime,
            timeoutChecker: createTimeoutChecker(config.timeoutMs),
            sampledCount: 0,
            errorCount: 0,
            skippedCount: 0
        };
        
        // Create reference tracker if needed
        var referenceTracker = null;
        if (config.trackObjectReferences && functionExists('createObjectReferenceTracker')) {
            referenceTracker = createObjectReferenceTracker();
        }
        
        $.writeln('[SAMPLE DEBUG] Sampling session created');
        
        // Count properties to sample
        var totalProperties = 0;
        if (docNode.properties) {
            totalProperties += docNode.properties.length;
            $.writeln('[SAMPLE DEBUG] Found ' + docNode.properties.length + ' properties to sample');
        }
        if (docNode.collections) {
            totalProperties += docNode.collections.length;
            $.writeln('[SAMPLE DEBUG] Found ' + docNode.collections.length + ' collections to sample');
        }
        
        if (totalProperties === 0) {
            $.writeln('[SAMPLE DEBUG] WARNING: No properties found to sample');
            return domStructure; // Return unchanged
        }
        
        // Check if sampling function exists (use the correct name!)
        if (!functionExists('samplePropertyValue')) {
            $.writeln('[SAMPLE DEBUG] CRITICAL: samplePropertyValue function NOT FOUND!');
            return domStructure; // Return unchanged
        }
        
        $.writeln('[SAMPLE DEBUG] Using existing samplePropertyValue function');
        
        // Sample properties
        if (docNode.properties) {
            $.writeln('[SAMPLE DEBUG] Starting property sampling...');
            for (var i = 0; i < docNode.properties.length; i++) {
                if (samplingSession.timeoutChecker()) {
                    $.writeln('[SAMPLE DEBUG] Timeout reached during property sampling');
                    break;
                }
                
                var property = docNode.properties[i];
                try {
                    // Use the existing samplePropertyValue function with correct parameters
                    var sampleResult = samplePropertyValue(
                        sourceDocument,           // targetObject
                        property.name,           // propName  
                        property.path,           // propPath
                        config,                  // config
                        referenceTracker         // referenceTracker
                    );
                    
                    if (sampleResult && sampleResult.success) {
                        property.sampledValue = sampleResult.formattedValue;
                        property.samplingMetadata = {
                            valueType: sampleResult.valueType,
                            accessTime: sampleResult.accessTime,
                            valueFingerprint: sampleResult.valueFingerprint
                        };
                        samplingSession.sampledCount++;
                        
                        if (i < 5) { // Debug first few
                            $.writeln('[SAMPLE DEBUG] Sampled: ' + property.name + ' = ' + sampleResult.formattedValue);
                        }
                    } else if (sampleResult && sampleResult.skipped) {
                        property.sampledValue = '[Skipped: ' + sampleResult.error + ']';
                        samplingSession.skippedCount++;
                    } else {
                        property.sampledValue = '[Error: ' + (sampleResult ? sampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;
                        
                        if (i < 5) { // Debug first few errors
                            $.writeln('[SAMPLE DEBUG] Error sampling: ' + property.name + ' - ' + (sampleResult ? sampleResult.error : 'unknown'));
                        }
                    }
                } catch (propException) {
                    property.sampledValue = '[Exception: ' + propException.message + ']';
                    samplingSession.errorCount++;
                }
                
                // Report progress every 50 properties
                if ((i + 1) % 50 === 0) {
                    $.writeln('[SAMPLE DEBUG] Progress: ' + (i + 1) + '/' + docNode.properties.length + ' properties processed');
                }
            }
        }
        
        // Sample collections if present
        if (docNode.collections && config.includeCollectionSamples) {
            $.writeln('[SAMPLE DEBUG] Starting collection sampling...');
            for (var j = 0; j < docNode.collections.length; j++) {
                if (samplingSession.timeoutChecker()) {
                    $.writeln('[SAMPLE DEBUG] Timeout reached during collection sampling');
                    break;
                }
                
                var collection = docNode.collections[j];
                try {
                    var collectionSampleResult = samplePropertyValue(
                        sourceDocument,
                        collection.name,
                        collection.path,
                        config,
                        referenceTracker
                    );
                    
                    if (collectionSampleResult && collectionSampleResult.success) {
                        collection.sampledValue = collectionSampleResult.formattedValue;
                        samplingSession.sampledCount++;
                    } else {
                        collection.sampledValue = '[Collection Error: ' + (collectionSampleResult ? collectionSampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;
                    }
                } catch (collExc) {
                    collection.sampledValue = '[Collection Exception: ' + collExc.message + ']';
                    samplingSession.errorCount++;
                }
            }
        }
        
        var endTime = new Date().getTime();
        $.writeln('[SAMPLE DEBUG] === SAMPLING COMPLETED ===');
        $.writeln('[SAMPLE DEBUG] Total time: ' + (endTime - startTime) + 'ms');
        $.writeln('[SAMPLE DEBUG] Properties sampled: ' + samplingSession.sampledCount);
        $.writeln('[SAMPLE DEBUG] Properties skipped: ' + samplingSession.skippedCount);
        $.writeln('[SAMPLE DEBUG] Errors encountered: ' + samplingSession.errorCount);
        
        // Add sampling metadata
        if (!domStructure.metadata) {
            domStructure.metadata = {};
        }
        domStructure.metadata.samplingCompleted = true;
        domStructure.metadata.samplingTime = endTime - startTime;
        domStructure.metadata.propertiesSampled = samplingSession.sampledCount;
        domStructure.metadata.propertiesSkipped = samplingSession.skippedCount;
        domStructure.metadata.samplingErrors = samplingSession.errorCount;
        
        return domStructure;
        
    } catch (exc) {
        $.writeln('[SAMPLE DEBUG] EXCEPTION: ' + exc.message);
        return {
            error: 'Property sampling failed: ' + exc.message,
            timestamp: getCurrentTimestamp()
        };
    }
}

/**
 * Sample property value with reference tracking and metadata
 * @param {Object} targetObject - Object containing the property
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
/**
 * Sample property value with reference tracking and metadata
 * @param {Object} targetObject - Object containing the property
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
function samplePropertyValue(targetObject, propName, propPath, config, referenceTracker) {
    // Static counter for debug limiting
    if (typeof samplePropertyValue.debugCount === 'undefined') {
        samplePropertyValue.debugCount = 0;
    }
    var showDebug = samplePropertyValue.debugCount < 5;
    samplePropertyValue.debugCount++;
    
    if (showDebug) {
        $.writeln('[PROP DEBUG] #' + samplePropertyValue.debugCount + ' Sampling: ' + propName + ' (path: ' + propPath + ')');
    }
    
    var result = {
        success: false,
        value: null,
        formattedValue: '',
        valueType: 'unknown',
        valueMetadata: null,
        valueFingerprint: null,
        objectReference: null,
        error: null,
        samplingMethod: 'direct',
        accessTime: 0,
        skipped: false
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Parameter validation
        if (!targetObject || typeof targetObject !== 'object') {
            result.error = 'Invalid target object';
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' FAILED: Invalid target object (type: ' + typeof targetObject + ')');
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' FAILED: Invalid property name (type: ' + typeof propName + ')');
            return result;
        }
        
        if (showDebug) {
            $.writeln('[PROP DEBUG] ' + propName + ' - Parameter validation passed');
            $.writeln('[PROP DEBUG] ' + propName + ' - Target object type: ' + typeof targetObject);
            $.writeln('[PROP DEBUG] ' + propName + ' - Property name: "' + propName + '"');
            $.writeln('[PROP DEBUG] ' + propName + ' - Config safetyFilter: ' + (config ? config.safetyFilter : 'undefined'));
        }
        
        // Safety filter check
        if (!functionExists('meetsSafetyFilter')) {
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - WARNING: meetsSafetyFilter function not found, skipping safety check');
        } else {
            var safetyCheck = meetsSafetyFilter({name: propName, path: propPath}, config.safetyFilter);
            if (!safetyCheck) {
                result.skipped = true;
                result.error = 'Property filtered by safety settings';
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' SKIPPED: Failed safety filter (' + config.safetyFilter + ')');
                return result;
            }
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Safety filter passed');
        }
        
        // Safe property value access
        if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Attempting property access...');
        
        var valueAccess;
        if (functionExists('safeGetPropertyValue')) {
            valueAccess = safeGetPropertyValue(targetObject, propName, null);
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Used safeGetPropertyValue, result type: ' + typeof valueAccess);
        } else {
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - safeGetPropertyValue not found, using direct access');
            try {
                valueAccess = targetObject[propName];
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Direct access result type: ' + typeof valueAccess);
            } catch (accessExc) {
                result.error = 'Direct property access failed: ' + accessExc.message;
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' FAILED: Direct access exception - ' + accessExc.message);
                return result;
            }
        }
        
        // Check if property exists
        var propertyExists = true;
        if (functionExists('safeHasProperty')) {
            propertyExists = safeHasProperty(targetObject, propName);
        } else {
            try {
                propertyExists = (propName in targetObject);
            } catch (hasExc) {
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Property existence check failed: ' + hasExc.message);
                propertyExists = false;
            }
        }
        
        if (valueAccess === null && !propertyExists) {
            result.error = 'Property does not exist';
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' FAILED: Property does not exist');
            return result;
        }
        
        var sampledValue = valueAccess;
        result.value = sampledValue;
        result.valueType = typeof sampledValue;
        result.accessTime = new Date().getTime() - startTime;
        
        if (showDebug) {
            $.writeln('[PROP DEBUG] ' + propName + ' - Property access SUCCESS!');
            $.writeln('[PROP DEBUG] ' + propName + ' - Value type: ' + result.valueType);
            $.writeln('[PROP DEBUG] ' + propName + ' - Access time: ' + result.accessTime + 'ms');
        }
        
        // Handle null/undefined based on configuration
        if (sampledValue === null) {
            if (config.skipNullValues) {
                result.skipped = true;
                result.error = 'Null value skipped per configuration';
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' SKIPPED: Null value (skipNullValues=true)');
                return result;
            }
        }
        
        if (sampledValue === undefined) {
            if (config.skipUndefinedValues) {
                result.skipped = true;
                result.error = 'Undefined value skipped per configuration';
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' SKIPPED: Undefined value (skipUndefinedValues=true)');
                return result;
            }
        }
        
        // Generate value metadata
        if (config.includeValueMetadata && functionExists('generateValueMetadata')) {
            try {
                result.valueMetadata = generateValueMetadata(sampledValue, config);
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Value metadata generated');
            } catch (metaExc) {
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Value metadata failed: ' + metaExc.message);
            }
        }
        
        // Generate value fingerprint for change tracking
        if (config.generateValueFingerprints && functionExists('generateValueFingerprint')) {
            try {
                result.valueFingerprint = generateValueFingerprint(sampledValue, propPath);
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Value fingerprint generated');
            } catch (fingerprintExc) {
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Value fingerprint failed: ' + fingerprintExc.message);
            }
        }
        
        // Track object references
        if (referenceTracker && sampledValue && typeof sampledValue === 'object') {
            try {
                result.objectReference = referenceTracker.track(sampledValue, propPath);
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Object reference tracked');
            } catch (refExc) {
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Object reference tracking failed: ' + refExc.message);
            }
        }
        
        // Format value for display
        if (functionExists('formatSampleValue')) {
            try {
                result.formattedValue = formatSampleValue(sampledValue, config);
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Formatted value: ' + result.formattedValue);
            } catch (formatExc) {
                result.formattedValue = '[Format Error: ' + formatExc.message + ']';
                if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Format error: ' + formatExc.message);
            }
        } else {
            // Fallback formatting
            if (sampledValue === null) {
                result.formattedValue = 'null';
            } else if (sampledValue === undefined) {
                result.formattedValue = 'undefined';
            } else {
                result.formattedValue = String(sampledValue) + ' (' + typeof sampledValue + ')';
            }
            if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - Used fallback formatting: ' + result.formattedValue);
        }
        
        result.success = true;
        if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' - COMPLETE SUCCESS!');
        return result;
        
    } catch (exc) {
        result.error = 'Property value sampling failed: ' + exc.message;
        result.accessTime = new Date().getTime() - startTime;
        if (showDebug) $.writeln('[PROP DEBUG] ' + propName + ' FAILED with EXCEPTION: ' + exc.message);
        return result;
    }
}

/**
 * ENHANCED: Safe property value getter with timeout and error handling
 * @param {Object} targetObject - Object to access
 * @param {String} propName - Property name
 * @param {String} propPath - Full property path for context
 * @param {Object} config - Sampling configuration
 * @returns {Object} Access result with success, value, error
 */
function safeGetPropertyValue(targetObject, propName, propPath, config) {
    var result = {
        success: false,
        value: null,
        error: null,
        accessMethod: 'direct'
    };
    
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            result.error = 'Invalid target object';
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }
        
        // Check if property exists safely
        if (!safeHasProperty(targetObject, propName)) {
            result.error = 'Property does not exist';
            return result;
        }
        
        // Access the property value
        result.value = targetObject[propName];
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Property access failed: ' + exc.message;
        return result;
    }
}

/**
 * Sample values from DOM node recursively
 * @param {Object} domNode - DOM node to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics tracker
 * @param {Object} referenceTracker - Reference tracker
 * @param {Function} timeoutChecker - Timeout checker
 */
function sampleNodeValues(domNode, sourceDocument, config, samplingStats, referenceTracker, timeoutChecker) {
    try {
        if (!domNode || timeoutChecker()) {
            return;
        }
        
        // Sample properties
        if (domNode.properties) {
            samplePropertiesFromArray(domNode.properties, sourceDocument, config, 
                                    samplingStats, referenceTracker, timeoutChecker);
        }
        
        // Sample collections
        if (domNode.collections) {
            samplePropertiesFromArray(domNode.collections, sourceDocument, config, 
                                    samplingStats, referenceTracker, timeoutChecker);
        }
        
        // Recursively sample child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                if (timeoutChecker()) break;
                
                sampleNodeValues(domNode.childNodes[i], sourceDocument, config, 
                               samplingStats, referenceTracker, timeoutChecker);
            }
        }
        
    } catch (exc) {
        samplingStats.errorsEncountered++;
    }
}

/**
 * Sample property values from array of property data
 * @param {Array} propertyArray - Array of property objects
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics tracker
 * @param {Object} referenceTracker - Reference tracker
 * @param {Function} timeoutChecker - Timeout checker
 */
function samplePropertiesFromArray(propertyArray, sourceDocument, config, samplingStats, referenceTracker, timeoutChecker) {
    try {
        if (!propertyArray || !propertyArray.length) return;
        
        var sampledCount = 0;
        
        for (var i = 0; i < propertyArray.length; i++) {
            if (timeoutChecker()) {
                samplingStats.timeoutCount++;
                break;
            }
            
            if (sampledCount >= config.maxSamples) {
                break;
            }
            
            var property = propertyArray[i];
            
            if (meetsSafetyFilter(property, config.safetyFilter)) {
                samplingStats.propertiesSampled++;
                
                // Get the parent object for value sampling
                var pathComponents = splitPath(property.path);
                if (pathComponents.length >= 1) {
                    var parentPath = '';
                    var propName = '';
                    
                    if (pathComponents.length === 1) {
                        // Root level property (e.g., "pages")
                        parentPath = '';
                        propName = pathComponents[0];
                    } else {
                        // Nested property (e.g., "document.pages")
                        parentPath = getParentPath(property.path);
                        propName = pathComponents[pathComponents.length - 1];
                    }
                    
                    // Get parent object
                    var parentAccess = parentPath ? 
                        safeGetObjectFromPath(sourceDocument, parentPath, config.timeoutMs) :
                        {success: true, value: sourceDocument};
                    
                    if (parentAccess.success && parentAccess.value) {
                        // Sample the property value
                        var sampleResult = samplePropertyValue(
                            parentAccess.value, 
                            propName, 
                            property.path, 
                            config, 
                            referenceTracker
                        );
                        
                        if (sampleResult.success && !sampleResult.skipped) {
                            // Store actual extracted value with comprehensive metadata
                            property.samplingMetadata = {
                                actualValue: sampleResult.value,
                                formattedValue: sampleResult.formattedValue,
                                valueType: sampleResult.valueType,
                                valueMetadata: sampleResult.valueMetadata,
                                valueFingerprint: sampleResult.valueFingerprint,
                                objectReference: sampleResult.objectReference,
                                extractionTimestamp: getCurrentTimestamp(),
                                accessTime: sampleResult.accessTime,
                                samplingMethod: sampleResult.samplingMethod
                            };
                            
                            samplingStats.valuesSampled++;
                            sampledCount++;
                            
                            if (sampleResult.valueFingerprint) {
                                samplingStats.fingerprintsGenerated++;
                            }
                            
                            // Track collections separately
                            if (sampleResult.valueMetadata && sampleResult.valueMetadata.isCollection) {
                                samplingStats.collectionsSampled++;
                            }
                            
                        } else if (sampleResult.skipped) {
                            samplingStats.safetyFilterRejects++;
                            property.extractionSkipped = true;
                            property.skipReason = sampleResult.error;
                        } else {
                            property.extractionError = sampleResult.error ? 
                                sampleResult.error : 'Unknown sampling error';
                            samplingStats.errorsEncountered++;
                        }
                        
                    } else {
                        property.extractionError = 'Parent object access failed: ' + 
                            (parentAccess.error || 'Unknown error');
                        samplingStats.errorsEncountered++;
                    }
                } else {
                    property.extractionError = 'Invalid property path';
                    samplingStats.errorsEncountered++;
                }
                
            } else {
                samplingStats.safetyFilterRejects++;
                property.extractionSkipped = true;
                property.skipReason = 'Safety filter rejection';
            }
        }
        
    } catch (exc) {
        samplingStats.errorsEncountered++;
    }
}

/**
 * Access property by dot notation path
 * @param {Object} rootObject - Root object
 * @param {String} path - Dot notation path
 * @param {Object} config - Access configuration
 * @returns {Object} Access result
 */
function accessPropertyByPath(rootObject, path, config) {
    var result = {
        success: false,
        value: null,
        error: null,
        pathResolved: ''
    };
    
    try {
        if (!rootObject) {
            result.error = 'Root object is null or undefined';
            return result;
        }
        
        if (!path || typeof path !== 'string') {
            result.value = rootObject;
            result.success = true;
            result.pathResolved = '';
            return result;
        }
        
        var pathComponents = splitPath(path);
        var currentObject = rootObject;
        var resolvedPath = '';
        
        for (var i = 0; i < pathComponents.length; i++) {
            var component = pathComponents[i];
            
            if (!currentObject || typeof currentObject !== 'object') {
                result.error = 'Cannot access ' + component + ' - not an object';
                return result;
            }
            
            if (!safeHasProperty(currentObject, component)) {
                result.error = 'Property ' + component + ' does not exist';
                return result;
            }
            
            currentObject = currentObject[component];
            resolvedPath += (resolvedPath ? '.' : '') + component;
        }
        
        result.value = currentObject;
        result.success = true;
        result.pathResolved = resolvedPath;
        
    } catch (exc) {
        result.error = 'Path access failed: ' + exc.message;
    }
    
    return result;
}

// =============================================================================
// VALUE FORMATTING AND METADATA
// =============================================================================

/**
 * Format sampled value for display with enhanced options
 * @param {*} value - Value to format
 * @param {Object} config - Configuration
 * @returns {String} Formatted value
 */
function formatSampleValue(value, config) {
    try {
        if (value === null) {
            return 'null';
        } else if (value === undefined) {
            return 'undefined';
        } else if (typeof value === 'string') {
            var maxLen = config.maxStringLength || 100;
            if (value.length <= maxLen) {
                return '"' + value + '"';
            } else {
                return '"' + stringSubstring(value, 0, maxLen) + '..." (' + value.length + ' chars)';
            }
        } else if (typeof value === 'number') {
            if (value === Math.floor(value)) {
                return String(value) + ' (integer)';
            } else {
                return String(value) + ' (float)';
            }
        } else if (typeof value === 'boolean') {
            return String(value) + ' (boolean)';
        } else if (typeof value === 'function') {
            var funcName = value.name || 'anonymous';
            return '[Function: ' + funcName + ']';
        } else if (typeof value === 'object') {
            var objectInfo = '';
            
            if (value.constructor && value.constructor.name) {
                objectInfo = value.constructor.name;
            } else {
                objectInfo = 'Object';
            }
            
            if (typeof value.length === 'number') {
                return '[' + objectInfo + ' (length: ' + value.length + ')]';
            } else if (typeof value.count === 'number') {
                return '[' + objectInfo + ' (count: ' + value.count + ')]';
            } else {
                var propCount = countObjectKeys(value);
                return '[' + objectInfo + ' (' + propCount + ' properties)]';
            }
        }
        
        return '[' + typeof value + ']';
        
    } catch (exc) {
        return '[Format Error]';
    }
}

/**
 * Generate comprehensive value metadata
 * @param {*} value - Value to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Value metadata
 */
function generateValueMetadata(value, config) {
    try {
        var metadata = {
            type: typeof value,
            isNull: value === null,
            isUndefined: value === undefined,
            isEmpty: false,
            isCollection: false,
            length: 0,
            hasContent: false,
            complexity: 'simple'
        };
        
        if (value === null || value === undefined) {
            metadata.isEmpty = true;
            return metadata;
        }
        
        if (typeof value === 'string') {
            metadata.length = value.length;
            metadata.hasContent = value.length > 0;
            metadata.isEmpty = value.length === 0;
            metadata.complexity = value.length > 100 ? 'complex' : 'simple';
        } else if (typeof value === 'object') {
            if (typeof value.length === 'number') {
                metadata.isCollection = true;
                metadata.length = value.length;
                metadata.hasContent = value.length > 0;
                metadata.complexity = value.length > 20 ? 'complex' : 'simple';
            } else if (typeof value.count === 'number') {
                metadata.isCollection = true;
                metadata.length = value.count;
                metadata.hasContent = value.count > 0;
                metadata.complexity = value.count > 20 ? 'complex' : 'simple';
            } else {
                // Object properties count
                metadata.length = countObjectKeys(value);
                metadata.hasContent = metadata.length > 0;
                metadata.complexity = metadata.length > 10 ? 'complex' : 'simple';
            }
        }
        
        // Additional analysis based on config
        if (config.includeCollectionSamples && metadata.isCollection) {
            metadata.collectionType = determineCollectionType(value);
            metadata.sampleItems = extractCollectionSample(value, Math.min(3, config.maxSamples));
        }
        
        return metadata;
        
    } catch (exc) {
        return {
            type: 'error',
            error: exc.message,
            hasContent: false,
            complexity: 'error'
        };
    }
}

/**
 * Generate enhanced value fingerprint for change detection
 * @param {*} value - Value to fingerprint
 * @param {String} path - Property path
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value, path) {
    try {
        var components = [];
        
        components[components.length] = 'path:' + (path || 'unknown');
        components[components.length] = 'type:' + typeof value;
        
        if (value === null) {
            components[components.length] = 'value:null';
        } else if (value === undefined) {
            components[components.length] = 'value:undefined';
        } else if (typeof value === 'string') {
            components[components.length] = 'length:' + value.length;
            if (value.length > 0 && value.length <= 50) {
                components[components.length] = 'content:' + value;
            } else if (value.length > 50) {
                components[components.length] = 'hash:' + simpleStringHash(value);
            }
        } else if (typeof value === 'number') {
            components[components.length] = 'value:' + value;
            if (value === Math.floor(value)) {
                components[components.length] = 'integer:true';
            }
        } else if (typeof value === 'boolean') {
            components[components.length] = 'value:' + value;
        } else if (typeof value === 'object') {
            if (typeof value.length === 'number') {
                components[components.length] = 'length:' + value.length;
            } else if (typeof value.count === 'number') {
                components[components.length] = 'count:' + value.count;
            } else {
                components[components.length] = 'keys:' + countObjectKeys(value);
            }
            
            if (value.constructor && value.constructor.name) {
                components[components.length] = 'constructor:' + value.constructor.name;
            }
            
            // Add structural fingerprint for objects
            if (value instanceof Array) {
                components[components.length] = 'array:true';
            } else {
                components[components.length] = 'object:true';
            }
        } else if (typeof value === 'function') {
            components[components.length] = 'function:true';
            if (value.name) {
                components[components.length] = 'name:' + value.name;
            }
        }
        
        components[components.length] = 'timestamp:' + (new Date().getTime());
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fingerprint_error:' + (path || 'unknown') + '|timestamp:' + (new Date().getTime());
    }
}

/**
 * Simple string hash function for ES3 compatibility
 * @param {String} sourceString - String to hash
 * @returns {String} Simple hash
 */
function simpleStringHash(sourceString) {
    try {
        if (typeof sourceString !== 'string') return 'invalid';
        
        var hash = 0;
        for (var i = 0; i < sourceString.length; i++) {
            var charValue = sourceString.charCodeAt(i);
            hash = ((hash << 5) - hash) + charValue;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
        
    } catch (exc) {
        return 'hash_error';
    }
}

// =============================================================================
// COLLECTION ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Check if value is collection-like
 * @param {*} value - Value to check
 * @returns {Boolean} True if collection-like
 */
function isCollectionLike(value) {
    try {
        if (!value || typeof value !== 'object') {
            return false;
        }
        
        return (typeof value.length === 'number') || (typeof value.count === 'number');
        
    } catch (exc) {
        return false;
    }
}

/**
 * Analyze collection structure and content
 * @param {Object} collection - Collection to analyze
 * @param {Object} config - Analysis configuration
 * @returns {Object} Collection analysis
 */
function analyzeCollection(collection, config) {
    var analysis = {
        isCollection: false,
        collectionType: 'unknown',
        itemCount: 0,
        itemTypes: {},
        sampleItems: [],
        hasContent: false,
        analysisError: null
    };
    
    try {
        if (!collection || typeof collection !== 'object') {
            analysis.analysisError = 'Invalid collection object';
            return analysis;
        }
        
        analysis.isCollection = isCollectionLike(collection);
        
        if (!analysis.isCollection) {
            analysis.analysisError = 'Object is not collection-like';
            return analysis;
        }
        
        // Determine collection type and size
        if (typeof collection.length === 'number') {
            analysis.collectionType = 'array-like';
            analysis.itemCount = collection.length;
        } else if (typeof collection.count === 'number') {
            analysis.collectionType = 'count-based';
            analysis.itemCount = collection.count;
        }
        
        analysis.hasContent = analysis.itemCount > 0;
        
        // Sample items if configuration allows
        if (config.includeCollectionSamples && analysis.hasContent) {
            analysis.sampleItems = extractCollectionSample(collection, 
                Math.min(config.maxSamples || 3, analysis.itemCount));
            
            // Analyze item types
            for (var i = 0; i < analysis.sampleItems.length; i++) {
                var item = analysis.sampleItems[i];
                var itemType = typeof item;
                
                if (analysis.itemTypes[itemType]) {
                    analysis.itemTypes[itemType]++;
                } else {
                    analysis.itemTypes[itemType] = 1;
                }
            }
        }
        
        return analysis;
        
    } catch (exc) {
        analysis.analysisError = 'Collection analysis failed: ' + exc.message;
        return analysis;
    }
}

/**
 * Extract sample from collection safely
 * @param {Object} collection - Collection to sample
 * @param {Number} maxSamples - Maximum samples to extract
 * @returns {Array} Sample items
 */
function extractCollectionSample(collection, maxSamples) {
    try {
        var samples = [];
        var sampleCount = maxSamples || 3;
        
        if (!collection || typeof collection !== 'object') {
            return samples;
        }
        
        var itemCount = 0;
        if (typeof collection.length === 'number') {
            itemCount = collection.length;
        } else if (typeof collection.count === 'number') {
            itemCount = collection.count;
        }
        
        if (itemCount === 0) {
            return samples;
        }
        
        // Extract samples up to the limit
        var samplesToTake = Math.min(sampleCount, itemCount);
        
        for (var i = 0; i < samplesToTake; i++) {
            try {
                var item = collection[i];
                if (item !== undefined) {
                    samples[samples.length] = item;
                }
            } catch (itemExc) {
                // Skip problematic items
                samples[samples.length] = '[Sample Error: ' + itemExc.message + ']';
            }
        }
        
        return samples;
        
    } catch (exc) {
        return ['[Sample extraction error]'];
    }
}

/**
 * Get collection item types
 * @param {Object} collection - Collection to analyze
 * @param {Number} sampleSize - Number of items to sample
 * @returns {Object} Type distribution
 */
function getCollectionItemTypes(collection, sampleSize) {
    try {
        var types = {};
        var samples = extractCollectionSample(collection, sampleSize || 5);
        
        for (var i = 0; i < samples.length; i++) {
            var itemType = typeof samples[i];
            
            if (types[itemType]) {
                types[itemType]++;
            } else {
                types[itemType] = 1;
            }
        }
        
        return types;
        
    } catch (exc) {
        return { 'error': 1 };
    }
}

/**
 * Get preview of collection content
 * @param {Object} collection - Collection to preview
 * @param {Number} previewLength - Length of preview
 * @returns {String} Collection preview
 */
function getCollectionPreview(collection, previewLength) {
    try {
        if (!collection || typeof collection !== 'object') {
            return '[Not a collection]';
        }
        
        var itemCount = 0;
        if (typeof collection.length === 'number') {
            itemCount = collection.length;
        } else if (typeof collection.count === 'number') {
            itemCount = collection.count;
        }
        
        if (itemCount === 0) {
            return '[Empty collection]';
        }
        
        var previewSize = previewLength || 2;
        var samples = extractCollectionSample(collection, previewSize);
        var previewParts = [];
        
        for (var i = 0; i < samples.length; i++) {
            var sample = samples[i];
            if (typeof sample === 'string') {
                previewParts[previewParts.length] = '"' + sample + '"';
            } else if (typeof sample === 'object' && sample !== null) {
                previewParts[previewParts.length] = '[Object]';
            } else {
                previewParts[previewParts.length] = String(sample);
            }
        }
        
        var preview = '[' + arrayJoin(previewParts, ', ');
        
        if (itemCount > previewSize) {
            preview += ', ... +' + (itemCount - previewSize) + ' more';
        }
        
        preview += ']';
        
        return preview;
        
    } catch (exc) {
        return '[Preview error]';
    }
}

/**
 * Determine collection type
 * @param {Object} collection - Collection to analyze
 * @returns {String} Collection type
 */
function determineCollectionType(collection) {
    try {
        if (!collection || typeof collection !== 'object') {
            return 'not_collection';
        }
        
        if (typeof collection.length === 'number') {
            if (collection.constructor && collection.constructor.name) {
                return collection.constructor.name.toLowerCase();
            } else {
                return 'array_like';
            }
        } else if (typeof collection.count === 'number') {
            return 'count_based';
        }
        
        return 'object';
        
    } catch (exc) {
        return 'unknown';
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property meets safety filter requirements
 * @param {Object} property - Property object with name and path
 * @param {String} safetyFilter - Safety filter level
 * @returns {Boolean} True if property passes filter
 */
function shouldSampleProperty(property, safetyFilter) {
    return meetsSafetyFilter(property, safetyFilter);
}

/**
 * Check if property meets safety filter requirements
 * @param {Object} property - Property object
 * @param {String} safetyFilter - Safety filter level
 * @returns {Boolean} True if meets filter
 */
function meetsSafetyFilter(property, safetyFilter) {
    try {
        if (!property || !property.name) {
            return false;
        }
        
        var safetyLevel = getPropertySafetyLevel(property.name);
        
        switch (safetyFilter) {
            case 'safe':
                return safetyLevel === 'safe';
            case 'caution':
                return safetyLevel === 'safe' || safetyLevel === 'caution';
            case 'all':
                return true;
            default:
                return safetyLevel === 'safe';
        }
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get sampling statistics from DOM structure
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} Sampling statistics
 */
function getSamplingStatistics(domStructure) {
    try {
        var stats = {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0,
            samplingErrors: 0,
            successRate: 0
        };
        
        if (domStructure.metadata && domStructure.metadata.valueSampling) {
            var samplingMeta = domStructure.metadata.valueSampling;
            stats.samplingEnabled = samplingMeta.enabled || false;
            
            if (samplingMeta.statistics) {
                var samplingStats = samplingMeta.statistics;
                stats.propertiesSampled = samplingStats.propertiesSampled || 0;
                stats.valuesSampled = samplingStats.valuesSampled || 0;
                stats.fingerprintsGenerated = samplingStats.fingerprintsGenerated || 0;
                stats.samplingErrors = samplingStats.samplingErrors || 0;
                stats.timeoutCount = samplingStats.timeoutCount || 0;
                stats.safetyFilterRejects = samplingStats.safetyFilterRejects || 0;
                stats.nullValuesSkipped = samplingStats.nullValuesSkipped || 0;
                stats.undefinedValuesSkipped = samplingStats.undefinedValuesSkipped || 0;
                stats.collectionsSampled = samplingStats.collectionsSampled || 0;
            }
            
            if (samplingMeta.referenceTracking) {
                stats.objectReferencesTracked = samplingMeta.referenceTracking.totalTracked || 0;
            }
            
            if (samplingMeta.performance) {
                stats.samplingTime = samplingMeta.performance.totalTime || 0;
                stats.averageTimePerProperty = samplingMeta.performance.averageTimePerProperty || 0;
                stats.successRate = samplingMeta.performance.successRate || 0;
            } else {
                stats.samplingTime = samplingMeta.samplingTime || 0;
                if (stats.propertiesSampled > 0) {
                    stats.successRate = (stats.valuesSampled / stats.propertiesSampled) * 100;
                }
            }
        }
        
        return stats;
        
    } catch (exc) {
        return {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0,
            samplingErrors: 0,
            successRate: 0
        };
    }
}

/**
 * Merge property sampling configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} Merged configuration
 */
function mergePropertySamplingConfig(defaults, userConfig) {
    try {
        var config = objectClone(defaults, 1);
        
        if (userConfig && typeof userConfig === 'object') {
            // Override with user settings, preserving user preferences
            if (typeof userConfig.safetyFilter !== 'undefined') config.safetyFilter = userConfig.safetyFilter;
            if (typeof userConfig.maxSamples !== 'undefined') config.maxSamples = userConfig.maxSamples;
            if (typeof userConfig.timeoutMs !== 'undefined') config.timeoutMs = userConfig.timeoutMs;
            if (typeof userConfig.includeCollectionSamples !== 'undefined') config.includeCollectionSamples = userConfig.includeCollectionSamples;
            if (typeof userConfig.maxStringLength !== 'undefined') config.maxStringLength = userConfig.maxStringLength;
            if (typeof userConfig.maxObjectDepth !== 'undefined') config.maxObjectDepth = userConfig.maxObjectDepth;
            if (typeof userConfig.trackObjectReferences !== 'undefined') config.trackObjectReferences = userConfig.trackObjectReferences;
            if (typeof userConfig.includeValueMetadata !== 'undefined') config.includeValueMetadata = userConfig.includeValueMetadata;
            if (typeof userConfig.generateValueFingerprints !== 'undefined') config.generateValueFingerprints = userConfig.generateValueFingerprints;
            if (typeof userConfig.enableProgressReporting !== 'undefined') config.enableProgressReporting = userConfig.enableProgressReporting;
            if (typeof userConfig.enableDetailedLogging !== 'undefined') config.enableDetailedLogging = userConfig.enableDetailedLogging;
            if (typeof userConfig.skipNullValues !== 'undefined') config.skipNullValues = userConfig.skipNullValues;
            if (typeof userConfig.skipUndefinedValues !== 'undefined') config.skipUndefinedValues = userConfig.skipUndefinedValues;
            if (typeof userConfig.maxCollectionDepth !== 'undefined') config.maxCollectionDepth = userConfig.maxCollectionDepth;
            if (typeof userConfig.preserveOriginalTypes !== 'undefined') config.preserveOriginalTypes = userConfig.preserveOriginalTypes;
        }
        
        return config;
        
    } catch (exc) {
        return defaults;
    }
}

/**
 * Create sampling result object
 * @param {Boolean} success - Success flag
 * @param {*} value - Result value
 * @param {String} error - Error message
 * @returns {Object} Sampling result
 */
function createSamplingResult(success, value, error) {
    try {
        return {
            success: success || false,
            value: value || null,
            error: error || null,
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            success: false,
            value: null,
            error: 'Sampling result creation failed',
            timestamp: 'unknown'
        };
    }
}

// =============================================================================
// LOGGING FUNCTIONS
// =============================================================================

/**
 * Log sampling progress
 * @param {String} message - Progress message
 */
function logSamplingProgress(message) {
    try {
        $.writeln('[Property Sampler] ' + getCurrentTimestamp() + ': ' + message);
    } catch (exc) {
        // Silent failure
    }
}

/**
 * Log sampling error
 * @param {String} message - Error message
 */
function logSamplingError(message) {
    try {
        $.writeln('[Property Sampler ERROR] ' + getCurrentTimestamp() + ': ' + message);
    } catch (exc) {
        // Silent failure
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('3.1_property-sampler', '3.1', [
    // Main Sampling Functions
    'sampleDOMValues', 'samplePropertyValue', 'safeGetPropertyValue',
    
    // Node Value Sampling
    'sampleNodeValues', 'samplePropertiesFromArray',
    
    // Property Access
    'accessPropertyByPath',
    
    // Value Formatting
    'formatSampleValue', 'generateValueMetadata', 'generateValueFingerprint',
    'simpleStringHash',
    
    // Collection Analysis
    'isCollectionLike', 'analyzeCollection', 'extractCollectionSample', 
    'getCollectionItemTypes', 'getCollectionPreview', 'determineCollectionType',
    
    // Utility Functions
    'shouldSampleProperty', 'meetsSafetyFilter', 'getSamplingStatistics', 
    'mergePropertySamplingConfig', 'createSamplingResult',
    
    // Logging
    'logSamplingProgress', 'logSamplingError'
]);

// =============================================================================
// END OF 3.1_property-sampler.jsx
// =============================================================================