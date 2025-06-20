// ============================================================================
// MODULE ASSEMBLER CORE MODULE
// Sequential dependency assembly of DocDom modules
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateTimestamp } from './yaml-generator.js';
import { parseVersion, compareVersions } from '../config/patterns.js';

/**
 * Assemble modules in dependency order
 * @param {Object} folderInfo - Folder information
 * @param {Object} options - Assembly options
 * @returns {Object} Assembly result
 */
export const assembleModules =  (folderInfo, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔧 Assembling modules in: ${folderInfo.name}`));

    try {
        // Sort modules by dependency order
        const sortedModules = sortModulesByVersion(folderInfo.moduleFiles);

        // Validate modules if requested
        if (options.validateFiles) {
            const validation = validateModuleFiles(folderInfo.path, folderInfo.moduleFiles);
            if (validation.invalid.length > 0) {
                throw new Error(`Module validation failed: ${validation.invalid.length} invalid files`);
            }
        }

        const timestamp = generateTimestamp();
        const folderName = folderInfo.name.replace(/[^a-zA-Z0-9]/g, '_');

        let assembledFile = null;
        let includesFile = null;

        // Generate assembled file (concatenated)
        assembledFile =  generateAssembledFile(
            folderInfo.path,
            sortedModules,
            folderName,
            timestamp,
            options
        );

        // Generate includes file (development)
        if (options.generateIncludes !== false) {
            includesFile =  generateIncludesFile(
                folderInfo.path,
                sortedModules,
                folderName,
                timestamp,
                options
            );
        }

        const result = {
            success: true,
            folderName: folderInfo.name,
            moduleCount: sortedModules.length,
            assembledFile,
            includesFile,
            assemblyTime: Date.now() - startTime
        };

        console.log(chalk.green(`✅ Assembly complete (${result.assemblyTime}ms)`));
        return result;

    } catch (error) {
        console.error(chalk.red(`❌ Assembly failed: ${error.message}`));
        return {
            success: false,
            error: error.message,
            folderName: folderInfo.name,
            moduleCount: 0,
            assemblyTime: Date.now() - startTime
        };
    }
};

/**
 * Sort modules by version for dependency order
 */
const sortModulesByVersion = (moduleFiles) => {
    return moduleFiles.map(filename => {
        const versionMatch = filename.match(/^(\d+(?:\.\d+){0,3})_/);
        const version = versionMatch ? versionMatch[1] : '0';
        const versionArray = parseVersion(version);

        return {
            filename,
            version,
            versionArray
        };
    }).sort((a, b) => compareVersions(a.versionArray, b.versionArray));
};

/**
 * Validate module files
 */
const validateModuleFiles = (folderPath, moduleFiles) => {
    const validation = { valid: [], invalid: [] };
    
    moduleFiles.forEach(filename => {
        const fullPath = path.join(folderPath, filename);
        try {
            fs.accessSync(fullPath, fs.constants.R_OK);
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('function ')) {
                validation.valid.push(filename);
            } else {
                validation.invalid.push(filename);
            }
        } catch (error) {
            validation.invalid.push(filename);
        }
    });

    return validation;
};

/**
 * Generate concatenated assembled file
 */
const generateAssembledFile =  (folderPath, sortedModules, folderName, timestamp, options) => {
    const filename = `${folderName}_ASSEMBLED_${timestamp}.jsx`;
    const filepath = path.join(folderPath, filename);

    const parts = [
        '// ============================================================================',
        `// ASSEMBLED DOCDOM MODULES - ${folderName}`,
        `// Generated: ${new Date().toISOString()}`,
        `// Modules: ${sortedModules.length}`,
        '// ============================================================================',
        ''
    ];

    // Add each module content
    for (const module of sortedModules) {
        const moduleContent = fs.readFileSync(path.join(folderPath, module.filename), 'utf8');
        
        parts.push(`// === MODULE: ${module.filename} (v${module.version}) ===`);
        parts.push(moduleContent);
        parts.push('');
    }

    // Add auto-start interface if requested
    if (options.autoStartInterface) {
        parts.push('// === AUTO-START INTERFACE ===');
        parts.push('if (typeof app !== "undefined") {');
        parts.push('    // Auto-start document analysis interface');
        parts.push('    // Add your auto-start code here');
        parts.push('}');
    }

    const assembledContent = parts.join('\n');
    fs.writeFileSync(filepath, assembledContent, 'utf8');

    return filename;
};

/**
 * Generate includes-based file
 */
const generateIncludesFile =  (folderPath, sortedModules, folderName, timestamp, options) => {
    const filename = `${folderName}_INCLUDES_${timestamp}.jsx`;
    const filepath = path.join(folderPath, filename);

    const parts = [
        '// ============================================================================',
        `// INCLUDES-BASED DOCDOM MODULES - ${folderName}`,
        `// Generated: ${new Date().toISOString()}`,
        `// Development Version - Uses #include directives`,
        '// ============================================================================',
        ''
    ];

    // Add include statements
    for (const module of sortedModules) {
        parts.push(`#include "${module.filename}"`);
    }

    // Add auto-start interface if requested
    if (options.autoStartInterface) {
        parts.push('');
        parts.push('// === AUTO-START INTERFACE ===');
        parts.push('if (typeof app !== "undefined") {');
        parts.push('    // Auto-start document analysis interface');
        parts.push('    // Add your auto-start code here');
        parts.push('}');
    }

    const includesContent = parts.join('\n');
    fs.writeFileSync(filepath, includesContent, 'utf8');

    return filename;
};

export default {
    assembleModules
};