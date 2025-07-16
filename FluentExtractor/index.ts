/**
 * Fluent Photoshop Document Scoring API - Global Script Entry Point
 * 
 * All classes and utilities for extracting and scoring Photoshop document properties.
 * This file should be included after all the core library files.
 * FIXED: Updated to match corrected PathAccessor method signatures
 */

// ExtendScript global function declarations
declare function charIDToTypeID(str: string): number;
declare function stringIDToTypeID(str: string): number;
declare function typeIDToStringID(id: number): string;
declare function executeActionGet(ref: ActionReference): ActionDescriptor;

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
         * Quick bounds extraction
         */
        bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
            return ActionDescriptorPath.create()
                .object('bounds')
                .value(property, 'double')
                .toPixels('pt')
                .floor();
        },

        /**
         * Quick text style extraction
         */
        textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return ActionDescriptorPath.create()
                .object('textKey')
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
                .value(property, type);
        },

        /**
         * Extract all layers using corrected method
         */
        allLayers: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
            if (property === "name") {
                // Special case for layer names - use corrected extraction method
                return {
                    extractAll: function<T>(d?: ActionDescriptor): T[] {
                        return ActionDescriptorPath.create().extractAllLayerNames() as T[];
                    }
                };
            } else {
                // For other properties, create a function that requires descriptor
                return {
                    extractAll: function<T>(d: ActionDescriptor): T[] {
                        return ActionDescriptorPath.create().extractAllFromList<T>(d, property, type, true);
                    }
                };
            }
        },

        /**
         * FIXED: Extract specific number of items as tuple
         */
        layerTuple: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', count: number, defaultValue?: any) {
            if (property === "name") {
                // Special case for layer names
                return {
                    extractAsTuple: function<T>(d?: ActionDescriptor): T[] {
                        return ActionDescriptorPath.create().extractLayerTuple(count, defaultValue || "Unnamed Layer") as T[];
                    }
                };
            } else {
                return {
                    extractAsTuple: function<T>(d: ActionDescriptor): T[] {
                        var allValues = ActionDescriptorPath.create().extractAllFromList<T>(d, property, type, true, defaultValue);
                        return allValues.slice(0, count);
                    }
                };
            }
        },

        /**
         * FIXED: Extract bullet point styles - now properly requires ActionDescriptor
         */
        bulletStyles: function (count?: number, defaultValue: string = "plain") {
            return {
                extract: function(layerDesc: ActionDescriptor): string[] {
                    return ActionDescriptorPath.create().extractTextStyleValues<string>(
                        layerDesc, "paragraphStyle.listStyleType", "enumerated", count || 4, defaultValue
                    );
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
 * Utility function to create a document reference
 */
var createDocumentReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(r);
};

/**
 * Utility function to create a layer reference
 */
var createLayerReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(r);
};

/**
 * Common extraction patterns as ready-to-use functions
 * FIXED: Updated to match corrected method signatures
 */
var CommonExtractions = {
    /**
     * Extract basic document properties
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
     * FIXED: Extract text properties using corrected method signatures
     */
    textProperties: function (d?: ActionDescriptor): TextProperties {
        if (!d) {
            d = createLayerReference();
        }
        
        return {
            content: ActionDescriptorPath.create()
                .object("textKey")
                .value('textKey', 'string')
                .defaultTo("")
                .extract<string>(d),
            fontFamily: P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(d),
            fontSize: P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(d),
            alignment: ActionDescriptorPath.create()
                .object("textKey")
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
     * Extract all layer names
     */
    allLayerNames: function (d?: ActionDescriptor): string[] {
        return ActionDescriptorPath.create().extractAllLayerNames();
    },

    /**
     * Extract specific number of layer names as tuple
     */
    layerNameTuple: function <T extends readonly string[]>(d: ActionDescriptor | undefined, count: number, defaultValue: string = "Missing Layer"): string[] {
        return ActionDescriptorPath.create().extractLayerTuple(count, defaultValue);
    },

    /**
     * FIXED: Extract bullet point styles using corrected method signature
     */
    bulletPointStyles: function (d?: ActionDescriptor, count?: number): string[] {
        if (!d) {
            d = createLayerReference();
        }
        
        return ActionDescriptorPath.create().extractTextStyleValues<string>(
            d, "paragraphStyle.listStyleType", "enumerated", count || 4, "plain"
        );
    }
};