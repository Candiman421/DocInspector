/**
 * Fluent Photoshop Document Scoring API - Global Script Entry Point
 * 
 * All classes and utilities for extracting and scoring Photoshop document properties.
 * This file should be included after all the core library files.
 * FIXED: Updated factory functions to match corrected patterns
 */

/**
 * Quick start factory for common extraction patterns
 */
var createExtractor = function () {
    return {
        /**
         * Create a path for extracting single values
         */
        path: function () { return ActionDescriptorPath.create(); },

        /**
         * FIXED: Quick bounds extraction
         */
        bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
            return ActionDescriptorPath.create()
                .object('bounds')
                .value(property, 'double')
                .toPixels('pt')
                .floor();
        },

        /**
         * FIXED: Quick text style extraction using corrected textKey navigation
         */
        textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return ActionDescriptorPath.create()
                .object('textKey')  // FIXED: Use textKey not text
                .list('textStyleRange')
                .at(index)
                .object('textStyle')
                .value(property, type);
        },

        /**
         * Quick filter extraction
         */
        filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return ActionDescriptorPath.create()
                .object('smartObjectMore')
                .list('filterFXList')
                .at(index)
                .object('filter')
                .value(property, type);
        },

        /**
         * FIXED: Extract all layers using corrected method
         */
        allLayers: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
            if (property === "name") {
                // Special case for layer names - use corrected extraction method
                return {
                    extractAll: function<T>(d: ActionDescriptor): T[] {
                        return ActionDescriptorPath.create().extractAllLayerNames() as T[];
                    }
                };
            } else {
                // For other properties, use general method
                return ActionDescriptorPath.create().list("layers").extractAllFromList(property, type, true);
            }
        },

        /**
         * FIXED: Extract specific number of items as tuple using corrected methods
         */
        layerTuple: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', count: number, defaultValue?: any) {
            if (property === "name") {
                // Special case for layer names
                return {
                    extractAsTuple: function<T>(d: ActionDescriptor): T[] {
                        return ActionDescriptorPath.create().extractLayerTuple(count, defaultValue || "Unnamed Layer") as T[];
                    }
                };
            } else {
                return ActionDescriptorPath.create().list("layers").extractAllFromList(property, type, true, defaultValue).slice(0, count);
            }
        },

        /**
         * FIXED: Extract bullet point styles using corrected textKey navigation
         */
        bulletStyles: function (count?: number, defaultValue: string = "plain") {
            return {
                extract: function(layerDesc: ActionDescriptor): string[] {
                    try {
                        var textKey = layerDesc.getObjectValue(stringIDToTypeID("textKey"));
                        var paragraphStyleRanges = textKey.getList(stringIDToTypeID("paragraphStyleRange"));
                        var results: string[] = [];
                        
                        var maxCount = count !== undefined ? count : paragraphStyleRanges.count;
                        for (var i = 0; i < maxCount; i++) {
                            if (i < paragraphStyleRanges.count) {
                                try {
                                    var range = paragraphStyleRanges.getObjectValue(i);
                                    var paragraphStyle = range.getObjectValue(stringIDToTypeID("paragraphStyle"));
                                    var listStyleType = paragraphStyle.getEnumerationValue(stringIDToTypeID("listStyleType"));
                                    results.push(typeIDToStringID(listStyleType) || defaultValue);
                                } catch (error) {
                                    results.push(defaultValue);
                                }
                            } else {
                                results.push(defaultValue);
                            }
                        }
                        
                        return results;
                    } catch (error) {
                        var fallbackResults = [];
                        var fallbackCount = count !== undefined ? count : 4;
                        for (var i = 0; i < fallbackCount; i++) {
                            fallbackResults.push(defaultValue);
                        }
                        return fallbackResults;
                    }
                }
            };
        }
    };
};

/**
 * Type definitions for common extraction results
 */
interface DocumentProperties {
    width: number;
    height: number;
    layerCount: number;
}

interface TextProperties {
    content: string;
    fontFamily: string;
    fontSize: number;
    alignment: string;
}

interface FilterProperties {
    brightness: number;
    contrast: number;
    saturation?: number;
    hue?: number;
}

/**
 * FIXED: Utility function to create a document reference using correct pattern
 */
var createDocumentReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(r);
};

/**
 * FIXED: Utility function to create a layer reference using correct pattern
 */
var createLayerReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(r);
};

/**
 * Common extraction patterns as ready-to-use functions
 * FIXED: Updated to use corrected navigation patterns
 */
var CommonExtractions = {
    /**
     * FIXED: Extract basic document properties using correct reference
     */
    documentProperties: function (d?: ActionDescriptor): DocumentProperties {
        if (!d) {
            d = createDocumentReference();
        }
        
        return {
            width: ActionDescriptorPath.create()
                .value('width', 'integer')
                .defaultTo(0)
                .extract<number>(d),
            height: ActionDescriptorPath.create()
                .value('height', 'integer')
                .defaultTo(0)
                .extract<number>(d),
            layerCount: ActionDescriptorPath.create().getLayerCount()
        };
    },

    /**
     * FIXED: Extract text properties using corrected textKey navigation
     */
    textProperties: function (d?: ActionDescriptor): TextProperties {
        if (!d) {
            d = createLayerReference();
        }
        
        return {
            content: ActionDescriptorPath.create()
                .object("textKey")  // FIXED: Use textKey
                .value('textKey', 'string')
                .defaultTo("")
                .extract<string>(d),
            fontFamily: P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(d),
            fontSize: P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(d),
            alignment: ActionDescriptorPath.create()
                .object("textKey")  // FIXED: Use textKey
                .list("paragraphStyleRange")
                .at(0)
                .object("paragraphStyle")
                .value("alignment", "enumerated")
                .defaultTo("left")
                .extract<string>(d)
        };
    },

    /**
     * Extract filter properties from first filter
     */
    filterProperties: function (d?: ActionDescriptor): FilterProperties {
        if (!d) {
            d = createLayerReference();
        }
        
        return {
            brightness: P.filter('brightness', 'integer', 0).defaultTo(0).extract<number>(d),
            contrast: P.filter('contrast', 'integer', 0).defaultTo(0).extract<number>(d)
        };
    },

    /**
     * FIXED: Extract all layer names using corrected method
     */
    allLayerNames: function (d?: ActionDescriptor): string[] {
        return ActionDescriptorPath.create().extractAllLayerNames();
    },

    /**
     * FIXED: Extract specific number of layer names as tuple using corrected method
     */
    layerNameTuple: function <T extends readonly string[]>(d: ActionDescriptor | undefined, count: number, defaultValue: string = "Missing Layer"): T {
        return ActionDescriptorPath.create().extractLayerTuple(count, defaultValue) as T;
    },

    /**
     * FIXED: Extract bullet point styles using corrected textKey navigation
     */
    bulletPointStyles: function (d?: ActionDescriptor, count?: number): string[] {
        if (!d) {
            d = createLayerReference();
        }
        
        try {
            var textKey = d.getObjectValue(stringIDToTypeID("textKey"));
            var paragraphStyleRanges = textKey.getList(stringIDToTypeID("paragraphStyleRange"));
            var results: string[] = [];
            
            var maxCount = count !== undefined ? count : paragraphStyleRanges.count;
            for (var i = 0; i < maxCount; i++) {
                if (i < paragraphStyleRanges.count) {
                    try {
                        var range = paragraphStyleRanges.getObjectValue(i);
                        var paragraphStyle = range.getObjectValue(stringIDToTypeID("paragraphStyle"));
                        var listStyleType = paragraphStyle.getEnumerationValue(stringIDToTypeID("listStyleType"));
                        results.push(typeIDToStringID(listStyleType) || "plain");
                    } catch (error) {
                        results.push("plain");
                    }
                } else {
                    results.push("plain");
                }
            }
            
            return results;
        } catch (error) {
            var fallbackResults = [];
            var fallbackCount = count !== undefined ? count : 4;
            for (var i = 0; i < fallbackCount; i++) {
                fallbackResults.push("plain");
            }
            return fallbackResults;
        }
    }
};