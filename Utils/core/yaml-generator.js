// ============================================================================
// YAML GENERATOR CORE MODULE
// Clean YAML output generation for DocDom analysis reports
// ============================================================================

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Generate timestamp for file naming
 * @returns {string} Timestamp string in format YYYYMMDD-HHMMSS
 */
export const generateTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

// Timestamp format utilities
const TIMESTAMP_FORMAT = {
    generate: generateTimestamp
};

/**
 * Generate clean YAML output avoiding common formatting issues
 * @param {Object} data - Data to convert to YAML
 * @param {Object} options - YAML generation options
 * @returns {string} Clean YAML string
 */
export const generateCleanYAML = (data, options = {}) => {
    const defaultOptions = {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
        flowLevel: -1,
        noCompatMode: true,
        condenseFlow: false
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        // Pre-process data to handle potential YAML issues
        const processedData = preprocessDataForYAML(data);

        // Generate YAML
        const yamlString = yaml.dump(processedData, mergedOptions);

        // Post-process to fix common issues
        return postprocessYAML(yamlString);

    } catch (error) {
        console.error(chalk.red(`YAML generation error: ${error.message}`));

        // Fallback to basic JSON-like format
        return generateFallbackYAML(data);
    }
};

/**
 * Write YAML file with proper error handling
 * @param {string} filePath - Output file path
 * @param {Object} data - Data to write
 * @param {Object} options - Generation options
 * @returns {boolean} Success status
 */
export const writeYAMLFile = (filePath, data, options = {}) => {
    try {
        const yamlContent = generateCleanYAML(data, options);

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(filePath, yamlContent, 'utf8');

        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);

        console.log(chalk.green(`✅ YAML written: ${path.basename(filePath)} (${sizeKB}KB)`));
        return true;

    } catch (error) {
        console.error(chalk.red(`❌ Failed to write YAML file ${filePath}: ${error.message}`));
        return false;
    }
};

/**
 * Pre-process data to avoid YAML formatting issues
 * @param {*} data - Data to process
 * @returns {*} Processed data
 */
const preprocessDataForYAML = (data) => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => preprocessDataForYAML(item));
    }

    if (typeof data === 'object') {
        const processed = {};

        for (const [key, value] of Object.entries(data)) {
            // Clean up key names
            const cleanKey = cleanYAMLKey(key);
            processed[cleanKey] = preprocessDataForYAML(value);
        }

        return processed;
    }

    if (typeof data === 'string') {
        return cleanYAMLString(data);
    }

    return data;
};

/**
 * Clean up YAML key names
 * @param {string} key - Original key
 * @returns {string} Cleaned key
 */
const cleanYAMLKey = (key) => {
    // Replace problematic characters in keys
    return key
        .replace(/[^\w\-_]/g, '_')  // Replace non-alphanumeric with underscore
        .replace(/^(\d)/, '_$1')    // Prefix numbers with underscore
        .replace(/_+/g, '_')        // Collapse multiple underscores
        .replace(/^_|_$/g, '');     // Remove leading/trailing underscores
};

/**
 * Clean up string values for YAML
 * @param {string} str - Original string
 * @returns {string} Cleaned string
 */
const cleanYAMLString = (str) => {
    if (typeof str !== 'string') return str;

    // Handle special characters and escaping
    return str
        .replace(/\r\n/g, '\n')     // Normalize line endings
        .replace(/\r/g, '\n')       // Convert remaining CR to LF
        .replace(/\t/g, '  ')       // Convert tabs to spaces
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
};

/**
 * Post-process YAML to fix common formatting issues
 * @param {string} yamlString - Generated YAML
 * @returns {string} Cleaned YAML
 */
const postprocessYAML = (yamlString) => {
    return yamlString
        // Fix empty array/object formatting
        .replace(/:\s*\[\s*\]/g, ': []')
        .replace(/:\s*\{\s*\}/g, ': {}')

        // Fix boolean formatting
        .replace(/:\s*"true"/g, ': true')
        .replace(/:\s*"false"/g, ': false')

        // Fix null formatting
        .replace(/:\s*"null"/g, ': null')

        // Clean up excessive spacing
        .replace(/\n\s*\n\s*\n/g, '\n\n')

        // Ensure proper line ending
        .replace(/\n*$/, '\n');
};

/**
 * Generate fallback YAML when main generation fails
 * @param {Object} data - Data to convert
 * @returns {string} Fallback YAML string
 */
const generateFallbackYAML = (data) => {
    const lines = ['# FALLBACK YAML (Main generation failed)', ''];

    const traverse = (obj, indent = 0) => {
        const prefix = '  '.repeat(indent);

        if (obj === null || obj === undefined) {
            return 'null';
        }

        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '[]';
            }

            obj.forEach(item => {
                lines.push(`${prefix}- ${traverse(item, indent + 1)}`);
            });
            return '';
        }

        if (typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                const cleanKey = cleanYAMLKey(key);
                const valueStr = traverse(value, indent + 1);

                if (valueStr === '') {
                    lines.push(`${prefix}${cleanKey}:`);
                } else {
                    lines.push(`${prefix}${cleanKey}: ${valueStr}`);
                }
            }
            return '';
        }

        if (typeof obj === 'string') {
            // Quote strings that might be problematic
            if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
                return `"${obj.replace(/"/g, '\\"')}"`;
            }
            return obj;
        }

        return String(obj);
    };

    traverse(data);
    return lines.join('\n') + '\n';
};

/**
 * Create YAML header with metadata
 * @param {string} title - Report title
 * @param {string} description - Report description
 * @param {Object} metadata - Additional metadata
 * @returns {Array} Header lines
 */
export const createYAMLHeader = (title, description, metadata = {}) => {
    const header = [
        `# ${title.toUpperCase()}`,
        `# ${description}`,
        `# Generated: ${new Date().toISOString()}`,
        `# Timestamp: ${TIMESTAMP_FORMAT.generate()}`
    ];

    if (metadata.version) {
        header.push(`# Version: ${metadata.version}`);
    }

    if (metadata.moduleCount) {
        header.push(`# Modules Analyzed: ${metadata.moduleCount}`);
    }

    header.push('# ========================================');
    header.push('');

    return header;
};

/**
 * Create structured report data
 * @param {string} reportType - Type of report
 * @param {Object} data - Report data
 * @param {Object} metadata - Report metadata
 * @returns {Object} Structured report
 */
export const createStructuredReport = (reportType, data, metadata = {}) => {
    const report = {
        report_info: {
            type: reportType,
            generated: new Date().toISOString(),
            timestamp: TIMESTAMP_FORMAT.generate(),
            version: '1.0.0',
            ...metadata
        }
    };

    // Add data based on report type
    switch (reportType) {
        case 'individual_module':
            report.module_analysis = data;
            break;

        case 'system_analysis':
            report.system_analysis = data;
            break;

        case 'version_comparison':
            report.version_comparison = data;
            break;

        default:
            report.analysis_data = data;
    }

    return report;
};

/**
 * Format code snippets for YAML inclusion
 * @param {string} code - Code to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted code
 */
export const formatCodeForYAML = (code, options = {}) => {
    const {
        maxLines = 20,
        indent = 0,
        stripComments = false
    } = options;

    if (!code || typeof code !== 'string') {
        return 'No code available';
    }

    let lines = code.split('\n');

    // Strip comments if requested
    if (stripComments) {
        lines = lines.filter(line => !line.trim().startsWith('//'));
    }

    // Limit lines
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines.push('... (truncated)');
    }

    // Add indentation if needed
    if (indent > 0) {
        const prefix = '  '.repeat(indent);
        lines = lines.map(line => line ? prefix + line : '');
    }

    return lines.join('\n');
};

/**
 * Create comparison table data for YAML
 * @param {Array} items - Items to compare
 * @param {Array} fields - Fields to include in comparison
 * @returns {Object} Comparison table
 */
export const createComparisonTable = (items, fields) => {
    const table = {};

    items.forEach(item => {
        const key = item.name || item.filename || `item_${Object.keys(table).length}`;
        table[key] = {};

        fields.forEach(field => {
            const value = getNestedValue(item, field);
            table[key][field] = value !== undefined ? value : 'N/A';
        });
    });

    return table;
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-separated path
 * @returns {*} Value at path or undefined
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
};

/**
 * Validate YAML structure before writing
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export const validateYAMLStructure = (data) => {
    const validation = {
        valid: true,
        issues: [],
        warnings: []
    };

    try {
        // Test YAML generation
        const testYAML = yaml.dump(data);

        // Test parsing back
        const parsed = yaml.load(testYAML);

        // Check for data loss
        const originalKeys = Object.keys(data).length;
        const parsedKeys = Object.keys(parsed).length;

        if (originalKeys !== parsedKeys) {
            validation.warnings.push('Potential data loss detected in YAML conversion');
        }

    } catch (error) {
        validation.valid = false;
        validation.issues.push(`YAML validation error: ${error.message}`);
    }

    return validation;
};

/**
 * Generate file path with timestamp
 * @param {string} basePath - Base directory path
 * @param {string} template - Filename template
 * @param {Object} replacements - Template replacements
 * @returns {string} Complete file path
 */
export const generateFilePath = (basePath, template, replacements = {}) => {
    const timestamp = TIMESTAMP_FORMAT.generate();

    let filename = template.replace('{timestamp}', timestamp);

    for (const [key, value] of Object.entries(replacements)) {
        filename = filename.replace(`{${key}}`, value);
    }

    return path.join(basePath, filename);
};

export default {
    generateCleanYAML,
    writeYAMLFile,
    createYAMLHeader,
    createStructuredReport,
    formatCodeForYAML,
    createComparisonTable,
    validateYAMLStructure,
    generateFilePath
};