/**
 * Fluent Photoshop Document Scoring API - Global Script Entry Point
 * 
 * All classes and utilities for extracting and scoring Photoshop document properties.
 * This file should be included after all the core library files.
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
         * Quick bounds extraction
         */
        bounds: function (property: 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height') {
            return P.bounds(property);
        },

        /**
         * Quick text style extraction
         */
        textStyle: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return P.textStyle(property, type, index);
        },

        /**
         * Quick filter extraction
         */
        filter: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', index: number = 0) {
            return P.filter(property, type, index);
        },

        /**
         * Extract all items from a list
         */
        allLayers: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated') {
            return ActionDescriptorPath.create().list("layers").extractAll(property, type);
        },

        /**
         * Extract specific number of items as tuple
         */
        layerTuple: function (property: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'enumerated', count: number, defaultValue?: any) {
            return ActionDescriptorPath.create().list("layers").extractAsTuple(property, type, count, defaultValue);
        },

        /**
         * Extract bullet point styles
         */
        bulletStyles: function (count?: number, defaultValue: string = "plain") {
            var path = ActionDescriptorPath.create()
                .object("text")
                .list("paragraphStyleRange");

            if (count !== undefined) {
                return path.extractAsTuple("paragraphStyle.listStyleType", "enumerated", count, defaultValue);
            } else {
                return path.extractAll("paragraphStyle.listStyleType", "enumerated");
            }
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
    r.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
    return executeActionGet(r);
};

/**
 * Utility function to create a layer reference
 */
var createLayerReference = function (): ActionDescriptor {
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
    return executeActionGet(r);
};

/**
 * Common extraction patterns as ready-to-use functions
 */
var CommonExtractions = {
    /**
     * Extract basic document properties
     */
    documentProperties: function (d: ActionDescriptor): DocumentProperties {
        return {
            width: P.bounds('width').extract<number>(d),
            height: P.bounds('height').extract<number>(d),
            layerCount: ActionDescriptorPath.create().list("layers").getCount(d)
        };
    },

    /**
     * Extract text properties from first text layer
     */
    textProperties: function (d: ActionDescriptor): TextProperties {
        return {
            content: P.textStyle('text', 'string', 0).defaultTo("").extract<string>(d),
            fontFamily: P.textStyle('fontName', 'string', 0).defaultTo("Unknown").extract<string>(d),
            fontSize: P.textStyle('sizeKey', 'double', 0).round(1).defaultTo(12).extract<number>(d),
            alignment: ActionDescriptorPath.create()
                .object("text")
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
    filterProperties: function (d: ActionDescriptor): FilterProperties {
        return {
            brightness: P.filter('brightness', 'integer', 0).defaultTo(0).extract<number>(d),
            contrast: P.filter('contrast', 'integer', 0).defaultTo(0).extract<number>(d)
        };
    },

    /**
     * Extract all layer names
     */
    allLayerNames: function (d: ActionDescriptor): string[] {
        return ActionDescriptorPath.create()
            .list("layers")
            .extractAll("name", "string")
            .skipErrors("Unnamed Layer")
            .extractAll<string>(d);
    },

    /**
     * Extract specific number of layer names as tuple
     */
    layerNameTuple: function <T extends readonly string[]>(d: ActionDescriptor, count: number, defaultValue: string = "Missing Layer"): T {
        return ActionDescriptorPath.create()
            .list("layers")
            .extractAsTuple("name", "string", count, defaultValue)
            .extractAsTuple<T>(d, count, defaultValue);
    },

    /**
     * Extract bullet point styles
     */
    bulletPointStyles: function (d: ActionDescriptor, count?: number): string[] {
        var path = ActionDescriptorPath.create()
            .object("text")
            .list("paragraphStyleRange");

        if (count !== undefined) {
            return path.extractAsTuple("paragraphStyle.listStyleType", "enumerated", count, "plain")
                .extractAsTuple<string[]>(d, count, "plain");
        } else {
            return path.extractAll("paragraphStyle.listStyleType", "enumerated")
                .extractAll<string>(d);
        }
    }
};