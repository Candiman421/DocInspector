#!/usr/bin/env node

// ============================================================================
// SIMPLE TEMPLATE MAKER
// Creates claude-response.js files for the merger
// Location: Utils/AdHoc/make-template.js
// ============================================================================

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template generators for common operations
 */
const TEMPLATES = {
    'replace-function': (file, functionName) => ({
        description: `Replace ${functionName} function`,
        operations: [
            {
                action: 'REPLACE_FUNCTION',
                file: file,
                functionName: functionName,
                newCode: `
/**
 * PASTE CLAUDE'S FUNCTION HERE
 * @param {type} param - Description
 * @returns {type} Description
 */
const ${functionName} = (param) => {
    // Replace this entire block with Claude's function
    try {
        // Implementation here
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};`
            }
        ]
    }),

    'add-function': (file, afterFunction) => ({
        description: `Add new function after ${afterFunction}`,
        operations: [
            {
                action: 'INSERT_AFTER',
                file: file,
                afterFunction: afterFunction,
                newCode: `
/**
 * PASTE CLAUDE'S NEW FUNCTION HERE
 * @param {type} param - Description
 * @returns {type} Description
 */
const newFunction = (param) => {
    // Replace this entire block with Claude's function
    try {
        // Implementation here
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};`
            }
        ]
    }),

    'file-top': (file, stopBefore) => ({
        description: `Update file top (imports, headers) before ${stopBefore}`,
        operations: [
            {
                action: 'REPLACE_FILE_TOP',
                file: file,
                stopBefore: stopBefore,
                newCode: `// ============================================================================
// FILE HEADER
// PASTE CLAUDE'S IMPORTS AND HEADER HERE
// ============================================================================

import fs from 'fs';
import path from 'path';
// Add other imports here

// Constants or configuration
const CONFIG = {
    // Configuration here
};`
            }
        ]
    }),

    'exports': (file) => ({
        description: `Update exports in ${file}`,
        operations: [
            {
                action: 'REPLACE_EXPORTS',
                file: file,
                newCode: `export default {
    // PASTE CLAUDE'S EXPORT LIST HERE
    // function1,
    // function2,
    // function3
};`
            }
        ]
    }),

    'find-replace': (file, find, replace) => ({
        description: `Find and replace in ${file}`,
        operations: [
            {
                action: 'FIND_REPLACE',
                file: file,
                find: find || 'TEXT_TO_FIND',
                replace: replace || 'REPLACEMENT_TEXT'
            }
        ]
    }),

    'docdom-fixes': () => ({
        description: 'Fix DocDom registration issues',
        operations: [
            {
                action: 'FIND_REPLACE',
                file: 'config/patterns.js',
                find: 'register_module: /registerModule\\s*\\(\\s*([\'"])([^\'\"]+)\\1\\s*,\\s*([\'"])([^\'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/gs,',
                replace: 'register_module: /registerModule\\s*\\(\\s*([\'"])([^\'\"]+)\\1\\s*,\\s*([\'"])([^\'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/s,'
            },
            {
                action: 'FIND_REPLACE',
                file: '1.20.0.0_safety-utilities.jsx',
                find: "registerModule('1.2.0.0_safety-utilities'",
                replace: "registerModule('1.20.0.0_safety-utilities'"
            },
            {
                action: 'FIND_REPLACE', 
                file: '2.1.0.0_dom-enumerator.jsx',
                find: "registerModule('2.1_dom-enumerator'",
                replace: "registerModule('2.1.0.0_dom-enumerator'"
            },
            {
                action: 'FIND_REPLACE',
                file: '2.2.0.0_collection-sampler.jsx',
                find: "registerModule('2.2_collection-sampler'",
                replace: "registerModule('2.2.0.0_collection-sampler'"
            },
            {
                action: 'FIND_REPLACE',
                file: '3.1.0.0_property-sampler.jsx',
                find: "registerModule('3.1_property-sampler'",
                replace: "registerModule('3.1.0.0_property-sampler'"
            },
            {
                action: 'FIND_REPLACE',
                file: '3.2.0.0_dom-exporter.jsx',
                find: "registerModule('3.2_dom-exporter'",
                replace: "registerModule('3.2.0.0_dom-exporter'"
            },
            {
                action: 'FIND_REPLACE',
                file: '4.1.0.0_json-analyzer.jsx',
                find: "registerModule('4.1_json-analyzer'",
                replace: "registerModule('4.1.0.0_json-analyzer'"
            },
            {
                action: 'FIND_REPLACE',
                file: '4.2.0.0_dom-comparator.jsx',
                find: "registerModule('4.2_dom-comparator'",
                replace: "registerModule('4.2.0.0_dom-comparator'"
            },
            {
                action: 'FIND_REPLACE',
                file: '5.1.0.0_deep-mapper.jsx',
                find: "registerModule('5.1_deep-mapper'",
                replace: "registerModule('5.1.0.0_deep-mapper'"
            },
            {
                action: 'FIND_REPLACE',
                file: '5.2.0.0_dom-visualizer.jsx',
                find: "registerModule('5.2_dom-visualizer'",
                replace: "registerModule('5.2.0.0_dom-visualizer'"
            },
            {
                action: 'FIND_REPLACE',
                file: '6.1.0.0_advanced-ui.jsx',
                find: "registerModule('6.1_advanced-ui'",
                replace: "registerModule('6.1.0.0_advanced-ui'"
            }
        ]
    })
};

/**
 * Generate template and save to file
 */
function makeTemplate(type, filename = 'claude-response.js', ...args) {
    const generator = TEMPLATES[type];
    if (!generator) {
        console.error(`❌ Unknown template type: ${type}`);
        console.log('Available types:', Object.keys(TEMPLATES).join(', '));
        process.exit(1);
    }

    const template = generator(...args);
    const content = `// Claude Response Configuration
// Generated: ${new Date().toISOString()}
// Edit this file and paste Claude's code in the marked sections

export default ${JSON.stringify(template, null, 2)};`;

    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Template created: ${filename}`);
    console.log(`📝 Edit the file and paste Claude's code, then run:`);
    console.log(`   node merge-claude.js ${filename}`);
}

/**
 * Show usage help
 */
function showHelp() {
    console.log('🛠️  Simple Template Maker\n');
    console.log('Usage: node make-template.js <type> [filename] [args...]\n');
    console.log('Templates:');
    console.log('  replace-function <file> <functionName>');
    console.log('  add-function <file> <afterFunction>'); 
    console.log('  file-top <file> <stopBeforeFunction>');
    console.log('  exports <file>');
    console.log('  find-replace <file> [find] [replace]');
    console.log('  docdom-fixes (pre-built DocDom fix)\n');
    console.log('Examples:');
    console.log('  node make-template.js replace-function core/parser.js extractRegistration');
    console.log('  node make-template.js add-function core/parser.js extractRegistration');
    console.log('  node make-template.js file-top core/parser.js parseModuleFile');
    console.log('  node make-template.js exports core/parser.js');
    console.log('  node make-template.js docdom-fixes');
}

// CLI execution
if (process.argv[1] === __filename) {
    const type = process.argv[2];
    const filename = process.argv[3] || 'claude-response.js';
    const args = process.argv.slice(4);

    if (!type || type === 'help') {
        showHelp();
        process.exit(0);
    }

    makeTemplate(type, filename, ...args);
}

export { makeTemplate, TEMPLATES };