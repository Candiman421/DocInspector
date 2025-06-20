// ============================================================================
// FILE DISCOVERY CORE MODULE
// Auto-discovery and organization of DocDom module files
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
    isModuleFile,
    isExcludedFile,
    isExcludedFolder,
    extractVersion,
    groupByVersionPrefix,
    parseVersion,
    compareVersions
} from '../config/patterns.js';

/**
 * Discover all folders containing DocDom modules
 * @param {string} rootPath - Root path to scan from
 * @returns {Array} Array of folder information objects
 */
export const discoverProjectFolders = (rootPath = process.cwd()) => {
    console.log(chalk.blue('🔍 Scanning project for module folders...'));
    console.log(chalk.gray('='.repeat(50)));

    const foldersWithModules = [];

    /**
     * Recursively scan directories for module files
     * @param {string} dirPath - Directory path to scan
     * @param {string} relativePath - Relative path from root
     */
    const scanDirectory = (dirPath, relativePath = '') => {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            // Find module files in current directory
            const moduleFiles = entries
                .filter(entry => entry.isFile())
                .filter(entry => isModuleFile(entry.name))
                .filter(entry => !isExcludedFile(entry.name))
                .map(entry => entry.name);

            // If modules found, add folder to list
            if (moduleFiles.length > 0) {
                const folderName = relativePath || 'Root';
                const folderInfo = {
                    name: folderName,
                    path: dirPath,
                    relativePath: relativePath,
                    moduleFiles: moduleFiles,
                    moduleCount: moduleFiles.length
                };

                foldersWithModules.push(folderInfo);

                console.log(chalk.green(`📁 Found ${moduleFiles.length} modules in: ${folderName}`));
                moduleFiles.forEach(file => {
                    const version = extractVersion(file);
                    console.log(chalk.gray(`   📄 ${file} ${version ? `(v${version})` : ''}`));
                });
            }

            // Recursively scan subdirectories
            entries
                .filter(entry => entry.isDirectory())
                .filter(entry => !isExcludedFolder(entry.name))
                .forEach(entry => {
                    const subPath = path.join(dirPath, entry.name);
                    const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                    scanDirectory(subPath, subRelative);
                });

        } catch (error) {
            console.error(chalk.red(`❌ Error scanning ${dirPath}: ${error.message}`));
        }
    };

    scanDirectory(rootPath);

    console.log(chalk.blue(`\n🎯 Discovery complete: ${foldersWithModules.length} folders with modules found`));
    return foldersWithModules;
};

/**
 * Analyze folder context to determine analysis type
 * @param {Object} folderInfo - Folder information
 * @returns {Object} Analysis context information
 */
export const analyzeFolderContext = (folderInfo) => {
    const context = {
        analysisType: 'unknown',
        versionGroups: {},
        systemModules: [],
        hasVersionComparison: false,
        hasSystemModules: false
    };

    // Group files by version prefix
    const groups = groupByVersionPrefix(folderInfo.moduleFiles);

    // Check for version comparison scenario (multiple files with same prefix)
    const versionComparisonGroups = {};
    for (const [prefix, files] of Object.entries(groups)) {
        if (files.length > 1) {
            versionComparisonGroups[prefix] = files;
            context.hasVersionComparison = true;
        }
    }

    // Check for system scenario (multiple different prefixes)
    const uniquePrefixes = Object.keys(groups);
    if (uniquePrefixes.length > 1) {
        context.hasSystemModules = true;
        context.systemModules = uniquePrefixes.map(prefix => ({
            prefix,
            files: groups[prefix]
        }));
    }

    // Determine primary analysis type
    if (context.hasVersionComparison && !context.hasSystemModules) {
        context.analysisType = 'version_comparison';
    } else if (context.hasSystemModules && !context.hasVersionComparison) {
        context.analysisType = 'system_analysis';
    } else if (context.hasSystemModules && context.hasVersionComparison) {
        context.analysisType = 'mixed';
    } else {
        context.analysisType = 'single_module';
    }

    context.versionGroups = versionComparisonGroups;

    console.log(chalk.cyan(`📊 Folder context: ${context.analysisType}`));
    if (context.hasVersionComparison) {
        console.log(chalk.yellow(`   🔄 Version comparisons available: ${Object.keys(versionComparisonGroups).length} groups`));
    }
    if (context.hasSystemModules) {
        console.log(chalk.yellow(`   🔗 System modules: ${uniquePrefixes.length} different modules`));
    }

    return context;
};

/**
 * Sort module files by version for dependency order
 * @param {string[]} moduleFiles - Array of module filenames
 * @returns {Array} Sorted module file information
 */
export const sortModulesByVersion = (moduleFiles) => {
    const moduleData = moduleFiles.map(filename => {
        const version = extractVersion(filename);
        const versionArray = version ? parseVersion(version) : [0];

        return {
            filename,
            version,
            versionArray,
            sortKey: versionArray.join('.')
        };
    });

    // Sort by version array comparison
    moduleData.sort((a, b) => compareVersions(a.versionArray, b.versionArray));

    console.log(chalk.cyan('📋 Module dependency order:'));
    moduleData.forEach((module, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${module.filename} (v${module.version || 'unknown'})`));
    });

    return moduleData;
};

/**
 * Validate module files accessibility and basic structure
 * @param {string} folderPath - Path to folder containing modules
 * @param {string[]} moduleFiles - Array of module filenames
 * @returns {Object} Validation results
 */
export const validateModuleFiles = (folderPath, moduleFiles) => {
    const validation = {
        valid: [],
        invalid: [],
        warnings: [],
        totalSize: 0
    };

    console.log(chalk.cyan(`🔍 Validating ${moduleFiles.length} module files...`));

    moduleFiles.forEach(filename => {
        const fullPath = path.join(folderPath, filename);

        try {
            // Check file accessibility
            fs.accessSync(fullPath, fs.constants.R_OK);

            // Get file stats
            const stats = fs.statSync(fullPath);
            const sizeKB = Math.round(stats.size / 1024);
            validation.totalSize += stats.size;

            // Basic content validation
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasFunction = content.includes('function ');
            const hasRegisterModule = content.includes('registerModule');

            validation.valid.push({
                filename,
                path: fullPath,
                size: stats.size,
                sizeKB,
                hasFunction,
                hasRegisterModule,
                lastModified: stats.mtime
            });

            // Warnings for potential issues
            if (sizeKB > 500) {
                validation.warnings.push(`${filename} is very large (${sizeKB}KB)`);
            }

            if (!hasFunction) {
                validation.warnings.push(`${filename} contains no function definitions`);
            }

            if (!hasRegisterModule) {
                validation.warnings.push(`${filename} missing registerModule call`);
            }

            console.log(chalk.green(`   ✅ ${filename} (${sizeKB}KB)`));

        } catch (error) {
            validation.invalid.push({
                filename,
                path: fullPath,
                error: error.message
            });

            console.error(chalk.red(`   ❌ ${filename} - ${error.message}`));
        }
    });

    const totalSizeKB = Math.round(validation.totalSize / 1024);
    console.log(chalk.blue(`📊 Validation complete: ${validation.valid.length}/${moduleFiles.length} valid, total size: ${totalSizeKB}KB`));

    if (validation.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings:'));
        validation.warnings.forEach(warning => {
            console.log(chalk.yellow(`   ${warning}`));
        });
    }

    return validation;
};

/**
 * Create output filename with timestamp
 * @param {string} template - Filename template with placeholders
 * @param {Object} replacements - Values to replace in template
 * @returns {string} Generated filename
 */
export const createOutputFilename = (template, replacements) => {
    let filename = template;

    for (const [key, value] of Object.entries(replacements)) {
        filename = filename.replace(`{${key}}`, value);
    }

    return filename;
};

/**
 * Find specific folder by path or name
 * @param {string} targetPath - Target folder path
 * @param {string} rootPath - Root path to search from
 * @returns {Object|null} Folder information or null
 */
export const findTargetFolder = (targetPath, rootPath = process.cwd()) => {
    const resolvedTarget = path.resolve(targetPath);

    // Check if target path exists
    if (!fs.existsSync(resolvedTarget)) {
        throw new Error(`Folder does not exist: ${targetPath}`);
    }

    const stats = fs.statSync(resolvedTarget);
    if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${targetPath}`);
    }

    // Find module files in target directory
    const entries = fs.readdirSync(resolvedTarget);
    const moduleFiles = entries
        .filter(file => isModuleFile(file))
        .filter(file => !isExcludedFile(file));

    if (moduleFiles.length === 0) {
        throw new Error(`No module files found in: ${targetPath}`);
    }

    return {
        name: path.basename(resolvedTarget),
        path: resolvedTarget,
        relativePath: path.relative(rootPath, resolvedTarget),
        moduleFiles,
        moduleCount: moduleFiles.length
    };
};

/**
 * Generate folder summary for reporting
 * @param {Object} folderInfo - Folder information
 * @param {Object} context - Analysis context
 * @returns {Object} Folder summary
 */
export const generateFolderSummary = (folderInfo, context) => {
    const summary = {
        folder_name: folderInfo.name,
        folder_path: folderInfo.relativePath || folderInfo.path,
        module_count: folderInfo.moduleCount,
        analysis_type: context.analysisType,
        timestamp: new Date().toISOString(),

        modules: folderInfo.moduleFiles.map(filename => {
            const version = extractVersion(filename);
            return {
                filename,
                version: version || 'unknown'
            };
        })
    };

    if (context.hasVersionComparison) {
        summary.version_groups = context.versionGroups;
    }

    if (context.hasSystemModules) {
        summary.system_modules = context.systemModules;
    }

    return summary;
};

export default {
    discoverProjectFolders,
    analyzeFolderContext,
    sortModulesByVersion,
    validateModuleFiles,
    createOutputFilename,
    findTargetFolder,
    generateFolderSummary
};