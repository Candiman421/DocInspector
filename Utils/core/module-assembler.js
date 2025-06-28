// ============================================================================
// MODULE ASSEMBLER CORE MODULE - ENHANCED ADAPTER INTEGRATION
// Sequential dependency assembly with smart adapter insertion and naming
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateTimestamp } from './yaml-generator.js';
import { 
    parseVersion, 
    compareVersions, 
    sortModulesByVersion, 
    validateModuleFiles,
    extractVersion,
    isModuleFile
} from '../config/patterns.js';

// ============================================================================
// ADAPTER DETECTION AND SMART INTEGRATION
// ============================================================================

/**
 * Detect adapter type from filename for assembly naming
 * @param {string} filename - Adapter filename
 * @returns {string|null} App type for assembly naming
 */
const detectAdapterType = (filename) => {
    if (!filename) return null;
    
    const lower = filename.toLowerCase();
    if (lower.includes('indesign')) return 'INDESIGN';
    if (lower.includes('photoshop')) return 'PHOTOSHOP';
    if (lower.includes('illustrator')) return 'ILLUSTRATOR';
    if (lower.includes('aftereffects')) return 'AFTEREFFECTS';
    if (lower.includes('premiere')) return 'PREMIERE';
    return 'ADAPTER';
};

/**
 * Smart module sorting with adapter insertion at correct position
 * @param {Array} moduleFiles - Array of module filenames including adapter
 * @returns {Array} Sorted module data with adapter in correct position
 */
const smartSortModulesWithAdapter = (moduleFiles) => {
    console.log(chalk.cyan('🧠 Smart sorting modules with adapter integration'));
    
    // Separate adapter from other modules
    const adapterFiles = [];
    const regularModules = [];
    
    moduleFiles.forEach(filename => {
        if (filename.toLowerCase().includes('adapter')) {
            adapterFiles.push(filename);
        } else {
            regularModules.push(filename);
        }
    });
    
    console.log(chalk.gray(`   📦 Regular modules: ${regularModules.length}`));
    console.log(chalk.gray(`   🔌 Adapter modules: ${adapterFiles.length}`));
    
    if (adapterFiles.length > 1) {
        console.log(chalk.yellow(`   ⚠️  Multiple adapters detected, using: ${adapterFiles[0]}`));
    }
    
    // Sort regular modules by version
    const sortedRegular = sortModulesByVersion(regularModules);
    
    // Process adapter
    let adapterInfo = null;
    if (adapterFiles.length > 0) {
        const adapterFile = adapterFiles[0];
        const version = extractVersion(adapterFile);
        adapterInfo = {
            filename: adapterFile,
            version: version || '1.15.0',
            versionArray: parseVersion(version || '1.15.0'),
            sortKey: '0001.0015.0000',
            isAdapter: true,
            adapterType: detectAdapterType(adapterFile)
        };
        console.log(chalk.blue(`   🔌 Adapter: ${adapterInfo.filename} (${adapterInfo.adapterType})`));
    }
    
    // Insert adapter at correct position (after 1.1, before 1.2)
    const finalOrder = [];
    let adapterInserted = false;
    
    sortedRegular.forEach(module => {
        // Add foundation first
        if (module.version.startsWith('1.1')) {
            finalOrder.push(module);
        }
        // Insert adapter after foundation, before utilities
        else if (!adapterInserted && adapterInfo && (
            module.version.startsWith('1.2') || 
            module.version.startsWith('2.') ||
            module.versionArray[0] >= 2
        )) {
            finalOrder.push(adapterInfo);
            finalOrder.push(module);
            adapterInserted = true;
        }
        // Add all other modules
        else {
            finalOrder.push(module);
        }
    });
    
    // If adapter wasn't inserted (no 1.2+ modules), add it at the end
    if (adapterInfo && !adapterInserted) {
        finalOrder.push(adapterInfo);
    }
    
    console.log(chalk.cyan('📋 Final assembly order:'));
    finalOrder.forEach((module, index) => {
        const icon = module.isAdapter ? '🔌' : '📦';
        const type = module.isAdapter ? `(${module.adapterType})` : '(module)';
        console.log(chalk.white(`   ${String(index + 1).padStart(2)}. ${icon} ${module.filename} v${module.version} ${type}`));
    });
    
    return finalOrder;
};

/**
 * Generate smart assembly filename with adapter type
 * @param {string} folderName - Source folder name
 * @param {string} timestamp - Assembly timestamp
 * @param {Array} sortedModules - Sorted modules including adapter
 * @param {boolean} isIncludesFile - Whether this is includes file
 * @returns {string} Smart assembly filename
 */
const generateSmartAssemblyFilename = (folderName, timestamp, sortedModules, isIncludesFile = false) => {
    const cleanFolderName = folderName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileType = isIncludesFile ? 'INCLUDES' : 'ASSEMBLED';
    
    // Find adapter in modules
    const adapterModule = sortedModules.find(module => module.isAdapter);
    
    if (adapterModule && adapterModule.adapterType) {
        const adapterType = adapterModule.adapterType;
        const filename = `${cleanFolderName}_${adapterType}_${fileType}_${timestamp}.jsx`;
        console.log(chalk.green(`📝 Smart filename: ${filename} (${adapterType} adapter detected)`));
        return filename;
    } else {
        const filename = `${cleanFolderName}_${fileType}_${timestamp}.jsx`;
        console.log(chalk.gray(`📝 Standard filename: ${filename} (no adapter)`));
        return filename;
    }
};

// ============================================================================
// ENHANCED ASSEMBLY GENERATION
// ============================================================================

/**
 * Generate assembled file with enhanced adapter integration
 * @param {string} folderPath - Path to source folder
 * @param {Array} sortedModules - Sorted module information
 * @param {string} folderName - Folder name for output
 * @param {string} timestamp - Assembly timestamp
 * @param {Object} options - Assembly options
 * @returns {string} Generated filename
 */
const generateAssembledFile = (folderPath, sortedModules, folderName, timestamp, options = {}) => {
    try {
        console.log(chalk.cyan('🔧 Generating assembled file with adapter integration'));
        
        const filename = generateSmartAssemblyFilename(folderName, timestamp, sortedModules, false);
        const outputPath = path.join(folderPath, filename);
        
        let assembledContent = [];
        
        // Enhanced header with adapter information
        const adapterModule = sortedModules.find(module => module.isAdapter);
        const adapterInfo = adapterModule ? 
            `WITH ${adapterModule.adapterType} ADAPTER (${adapterModule.filename})` :
            'NO ADAPTER INCLUDED';
            
        assembledContent.push(`// ============================================================================`);
        assembledContent.push(`// DOCDOM DISCOVERY BUILDER v4.1 - ASSEMBLED VERSION`);
        assembledContent.push(`// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY`);
        assembledContent.push(`// ============================================================================`);
        assembledContent.push(`// SOURCE FOLDER: ${folderName}`);
        assembledContent.push(`// ASSEMBLY DATE: ${new Date().toISOString()}`);
        assembledContent.push(`// TOTAL MODULES: ${sortedModules.length}`);
        assembledContent.push(`// ADAPTER CONFIG: ${adapterInfo}`);
        assembledContent.push(`// ASSEMBLY ORDER: Sequential dependency loading (1.1 → adapter → 1.2 → 2.x → etc.)`);
        assembledContent.push(`// ============================================================================`);
        assembledContent.push('');
        
        // Add module loading order documentation
        assembledContent.push('// MODULE LOADING ORDER:');
        sortedModules.forEach((module, index) => {
            const icon = module.isAdapter ? '// 🔌' : '// 📦';
            assembledContent.push(`${icon} ${index + 1}. ${module.filename} (v${module.version})`);
        });
        assembledContent.push('// ============================================================================');
        assembledContent.push('');
        
        // Add global assembly configuration
        assembledContent.push('// ASSEMBLY CONFIGURATION');
        assembledContent.push('var g_assemblyConfig = {');
        assembledContent.push(`    version: '4.1',`);
        assembledContent.push(`    assemblyDate: '${new Date().toISOString()}',`);
        assembledContent.push(`    sourceFolder: '${folderName}',`);
        assembledContent.push(`    totalModules: ${sortedModules.length},`);
        assembledContent.push(`    adapterIncluded: ${!!adapterModule},`);
        assembledContent.push(`    adapterType: '${adapterModule ? adapterModule.adapterType.toLowerCase() : 'none'}',`);
        assembledContent.push(`    loadOrder: [`);
        sortedModules.forEach((module, index) => {
            const comma = index < sortedModules.length - 1 ? ',' : '';
            assembledContent.push(`        '${module.filename}'${comma}`);
        });
        assembledContent.push('    ]');
        assembledContent.push('};');
        assembledContent.push('');
        
        // Process each module in order
        let totalLines = 0;
        let totalFunctions = 0;
        
        sortedModules.forEach((moduleInfo, index) => {
            const modulePath = path.join(folderPath, moduleInfo.filename);
            
            if (!fs.existsSync(modulePath)) {
                console.log(chalk.red(`   ❌ Module not found: ${moduleInfo.filename}`));
                return;
            }
            
            try {
                const moduleContent = fs.readFileSync(modulePath, 'utf8');
                const moduleLines = moduleContent.split('\n').length;
                totalLines += moduleLines;
                
                // Count functions for statistics
                const functionMatches = moduleContent.match(/^[\s]*function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/gm);
                const functionCount = functionMatches ? functionMatches.length : 0;
                totalFunctions += functionCount;
                
                assembledContent.push(`// ============================================================================`);
                assembledContent.push(`// MODULE ${index + 1}/${sortedModules.length}: ${moduleInfo.filename}`);
                assembledContent.push(`// VERSION: ${moduleInfo.version}`);
                assembledContent.push(`// FUNCTIONS: ${functionCount}`);
                assembledContent.push(`// LINES: ${moduleLines}`);
                if (moduleInfo.isAdapter) {
                    assembledContent.push(`// ADAPTER TYPE: ${moduleInfo.adapterType}`);
                }
                assembledContent.push(`// ============================================================================`);
                assembledContent.push('');
                assembledContent.push(moduleContent);
                assembledContent.push('');
                
                const icon = moduleInfo.isAdapter ? '🔌' : '📦';
                console.log(chalk.green(`   ${icon} ${moduleInfo.filename} (${functionCount} functions, ${moduleLines} lines)`));
                
            } catch (moduleError) {
                console.log(chalk.red(`   ❌ Failed to read ${moduleInfo.filename}: ${moduleError.message}`));
                assembledContent.push(`// ERROR: Could not include ${moduleInfo.filename} - ${moduleError.message}`);
            }
        });
        
        // Add assembly completion marker
        assembledContent.push('// ============================================================================');
        assembledContent.push('// ASSEMBLY COMPLETE');
        assembledContent.push(`// TOTAL LINES: ${totalLines}`);
        assembledContent.push(`// TOTAL FUNCTIONS: ${totalFunctions}`);
        assembledContent.push(`// MODULES INCLUDED: ${sortedModules.length}`);
        assembledContent.push('// ============================================================================');
        
        // Enhanced auto-start interface with adapter awareness
        if (!options.noAutoStart) {
            assembledContent.push('');
            assembledContent.push('// AUTO-START INTERFACE WITH ADAPTER SUPPORT');
            assembledContent.push('(function() {');
            assembledContent.push('    try {');
            assembledContent.push('        // Log assembly startup');
            assembledContent.push(`        if (typeof logInfo === 'function') {`);
            assembledContent.push(`            logInfo('DocDom v4.1 Assembly loaded: ${sortedModules.length} modules', 'assembly');`);
            if (adapterModule) {
                assembledContent.push(`            logInfo('Adapter loaded: ${adapterModule.adapterType}', 'assembly');`);
            }
            assembledContent.push('        }');
            assembledContent.push('        ');
            assembledContent.push('        // Validate adapter if included');
            if (adapterModule) {
                assembledContent.push('        if (typeof validateAppEnvironment === "function") {');
                assembledContent.push('            var validation = validateAppEnvironment();');
                assembledContent.push('            if (validation && !validation.isValid) {');
                assembledContent.push('                if (typeof logWarn === "function") {');
                assembledContent.push(`                    logWarn('${adapterModule.adapterType} adapter validation failed', 'assembly');`);
                assembledContent.push('                }');
                assembledContent.push('            }');
                assembledContent.push('        }');
            }
            assembledContent.push('    } catch (startupError) {');
            assembledContent.push('        // Silent fail for startup');
            assembledContent.push('    }');
            assembledContent.push('})();');
        }
        
        // Write assembled file
        const finalContent = assembledContent.join('\n');
        fs.writeFileSync(outputPath, finalContent, 'utf8');
        
        console.log(chalk.green(`✅ Assembled file created: ${filename}`));
        console.log(chalk.gray(`   📊 ${totalLines} total lines, ${totalFunctions} functions`));
        
        return filename;
        
    } catch (error) {
        console.error(chalk.red(`❌ Assembly generation failed: ${error.message}`));
        throw error;
    }
};

/**
 * Generate includes-based file with adapter integration
 * @param {string} folderPath - Path to source folder
 * @param {Array} sortedModules - Sorted module information
 * @param {string} folderName - Folder name for output
 * @param {string} timestamp - Assembly timestamp
 * @param {Object} options - Assembly options
 * @returns {string} Generated filename
 */
const generateIncludesFile = (folderPath, sortedModules, folderName, timestamp, options = {}) => {
    try {
        console.log(chalk.cyan('📋 Generating includes file with adapter integration'));
        
        const filename = generateSmartAssemblyFilename(folderName, timestamp, sortedModules, true);
        const outputPath = path.join(folderPath, filename);
        
        let includesContent = [];
        
        // Enhanced header
        const adapterModule = sortedModules.find(module => module.isAdapter);
        const adapterInfo = adapterModule ? 
            `WITH ${adapterModule.adapterType} ADAPTER` :
            'NO ADAPTER';
            
        includesContent.push(`// ============================================================================`);
        includesContent.push(`// DOCDOM DISCOVERY BUILDER v4.1 - INCLUDES VERSION`);
        includesContent.push(`// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY`);
        includesContent.push(`// ============================================================================`);
        includesContent.push(`// SOURCE FOLDER: ${folderName}`);
        includesContent.push(`// ASSEMBLY DATE: ${new Date().toISOString()}`);
        includesContent.push(`// TOTAL MODULES: ${sortedModules.length}`);
        includesContent.push(`// ADAPTER CONFIG: ${adapterInfo}`);
        includesContent.push(`// LOADING METHOD: Sequential includes with dependency validation`);
        includesContent.push(`// ============================================================================`);
        includesContent.push('');
        
        // Add loading order documentation
        includesContent.push('// SEQUENTIAL LOADING ORDER:');
        sortedModules.forEach((module, index) => {
            const icon = module.isAdapter ? '// 🔌' : '// 📦';
            includesContent.push(`${icon} ${index + 1}. ${module.filename} (v${module.version})`);
        });
        includesContent.push('// ============================================================================');
        includesContent.push('');
        
        // Add includes configuration
        includesContent.push('// INCLUDES CONFIGURATION');
        includesContent.push('var g_includesConfig = {');
        includesContent.push(`    version: '4.1',`);
        includesContent.push(`    loadingMethod: 'sequential',`);
        includesContent.push(`    totalModules: ${sortedModules.length},`);
        includesContent.push(`    adapterIncluded: ${!!adapterModule},`);
        if (adapterModule) {
            includesContent.push(`    adapterType: '${adapterModule.adapterType.toLowerCase()}',`);
            includesContent.push(`    adapterFile: '${adapterModule.filename}',`);
        }
        includesContent.push('    loadOrder: [');
        sortedModules.forEach((module, index) => {
            const comma = index < sortedModules.length - 1 ? ',' : '';
            includesContent.push(`        '${module.filename}'${comma}`);
        });
        includesContent.push('    ]');
        includesContent.push('};');
        includesContent.push('');
        
        // Generate includes with error handling
        includesContent.push('// SEQUENTIAL MODULE LOADING WITH ERROR HANDLING');
        includesContent.push('(function() {');
        includesContent.push('    var loadedModules = [];');
        includesContent.push('    var failedModules = [];');
        includesContent.push('    ');
        
        sortedModules.forEach((moduleInfo, index) => {
            const icon = moduleInfo.isAdapter ? '🔌' : '📦';
            includesContent.push(`    // ${icon} Module ${index + 1}: ${moduleInfo.filename}`);
            includesContent.push('    try {');
            includesContent.push(`        #include "${moduleInfo.filename}"`);
            includesContent.push(`        loadedModules.push('${moduleInfo.filename}');`);
            if (moduleInfo.isAdapter) {
                includesContent.push(`        // Adapter loaded: ${moduleInfo.adapterType}`);
            }
            includesContent.push('    } catch (error) {');
            includesContent.push(`        failedModules.push({module: '${moduleInfo.filename}', error: error.message});`);
            includesContent.push('    }');
            includesContent.push('    ');
        });
        
        includesContent.push('    // Report loading results');
        includesContent.push('    if (typeof logInfo === "function") {');
        includesContent.push('        logInfo("Includes loading complete: " + loadedModules.length + " succeeded, " + failedModules.length + " failed", "includes");');
        if (adapterModule) {
            includesContent.push(`        logInfo("${adapterModule.adapterType} adapter integration active", "includes");`);
        }
        includesContent.push('    }');
        includesContent.push('})();');
        
        // Write includes file
        const finalContent = includesContent.join('\n');
        fs.writeFileSync(outputPath, finalContent, 'utf8');
        
        console.log(chalk.green(`✅ Includes file created: ${filename}`));
        
        return filename;
        
    } catch (error) {
        console.error(chalk.red(`❌ Includes generation failed: ${error.message}`));
        throw error;
    }
};

// ============================================================================
// MAIN ASSEMBLY FUNCTION - ENHANCED
// ============================================================================

/**
 * Assemble modules with smart adapter integration
 * @param {Object} folderInfo - Folder information
 * @param {Object} options - Assembly options
 * @returns {Object} Assembly result
 */
export const assembleModules = (folderInfo, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔧 Assembling modules with smart adapter integration: ${folderInfo.name}`));
    
    try {
        // Smart sort modules with adapter integration
        const sortedModules = smartSortModulesWithAdapter(folderInfo.moduleFiles);
        
        // Validate modules if requested
        if (options.validateFiles) {
            const validation = validateModuleFiles(folderInfo.path, folderInfo.moduleFiles);
            if (validation.invalid.length > 0) {
                throw new Error(`Module validation failed: ${validation.invalid.length} invalid files`);
            }
            console.log(chalk.green(`✅ File validation passed: ${validation.valid.length} valid modules`));
        }
        
        const timestamp = generateTimestamp();
        const folderName = folderInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
        
        let assembledFile = null;
        let includesFile = null;
        
        // Generate assembled file (recommended)
        assembledFile = generateAssembledFile(
            folderInfo.path,
            sortedModules,
            folderName,
            timestamp,
            options
        );
        
        // Generate includes file (debugging/development)
        if (!options.noIncludes) {
            includesFile = generateIncludesFile(
                folderInfo.path,
                sortedModules,
                folderName,
                timestamp,
                options
            );
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
            success: true,
            folderName: folderInfo.name,
            moduleCount: sortedModules.length,
            adapterIncluded: sortedModules.some(m => m.isAdapter),
            adapterType: (sortedModules.find(m => m.isAdapter) || {}).adapterType || null,
            assembledFile,
            includesFile,
            duration,
            sortedModules: sortedModules.map(m => ({
                filename: m.filename,
                version: m.version,
                isAdapter: m.isAdapter,
                adapterType: m.adapterType
            }))
        };
        
        console.log(chalk.green(`✅ Assembly completed successfully in ${duration}ms`));
        console.log(chalk.cyan(`📦 ${result.moduleCount} modules assembled`));
        if (result.adapterIncluded) {
            console.log(chalk.blue(`🔌 ${result.adapterType} adapter integrated`));
        }
        
        return result;
        
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.error(chalk.red(`❌ Assembly failed after ${duration}ms: ${error.message}`));
        
        return {
            success: false,
            folderName: folderInfo.name,
            error: error.message,
            duration
        };
    }
};

export default {
    assembleModules,
    smartSortModulesWithAdapter,
    generateSmartAssemblyFilename,
    detectAdapterType
};