// ============================================================================
// FILE DISCOVERY CORE MODULE - ENHANCED WITH DYNAMIC PROJECT ROOT DETECTION
// Auto-discovery and organization of DocDom module files with robust path handling
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
    compareVersions,
    sortModulesByVersion,
    validateModuleFiles
} from '../config/patterns.js';

// ============================================================================
// DYNAMIC PROJECT ROOT DETECTION - ROBUST MULTI-METHOD APPROACH
// ============================================================================

/**
 * Find DocDom project root using multiple detection methods
 * Supports running tools from any location within project
 * @param {string} startDir - Directory to start search from (defaults to cwd)
 * @returns {string} Absolute path to project root
 * @throws {Error} If project root cannot be found
 */
export const findDocDomProjectRoot = (startDir = process.cwd()) => {
    let currentDir = path.resolve(startDir);
    let attempts = [];
    
    console.log(chalk.gray(`🔍 Searching for DocDom project root from: ${currentDir}`));
    
    while (currentDir !== path.dirname(currentDir)) {
        attempts.push(currentDir);
        
        try {
            const pkgPath = path.join(currentDir, 'package.json');
            
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                
                // Method 1: Check for explicit docdom metadata
                if (pkg.docdom && pkg.docdom.isProjectRoot) {
                    console.log(chalk.green(`✅ Found project root via metadata: ${currentDir}`));
                    return currentDir;
                }
                
                // Method 2: Check for characteristic project structure
                const hasUtils = fs.existsSync(path.join(currentDir, 'Utils'));
                const hasUtilsWithTools = hasUtils && 
                    fs.existsSync(path.join(currentDir, 'Utils', 'main-assembler.js'));
                
                // Look for module folders (DocDomV4.1, DocDomV5.0, etc.)
                const moduleFolders = fs.readdirSync(currentDir).filter(item => {
                    try {
                        const itemPath = path.join(currentDir, item);
                        const isDir = fs.statSync(itemPath).isDirectory();
                        const matchesPattern = item.match(/^[A-Za-z]+V\d+\.\d+$/); // DocDomV4.1 pattern
                        
                        if (isDir && matchesPattern) {
                            // Verify folder contains module files
                            const folderContents = fs.readdirSync(itemPath);
                            const hasModuleFiles = folderContents.some(file => isModuleFile(file));
                            return hasModuleFiles;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                });
                
                if (hasUtilsWithTools && moduleFolders.length > 0) {
                    console.log(chalk.green(`✅ Found project root via structure: ${currentDir}`));
                    console.log(chalk.gray(`   Utils folder: ${hasUtils ? '✓' : '✗'}`));
                    console.log(chalk.gray(`   Module folders: ${moduleFolders.join(', ')}`));
                    return currentDir;
                }
                
                // Method 3: Check for DocDom-specific package names/keywords
                if (pkg.name && (
                    pkg.name.includes('docdom') || 
                    pkg.name.includes('dom-discovery') ||
                    pkg.name.includes('docinspector')
                )) {
                    // Additional verification - must have Utils or module folders
                    if (hasUtils || moduleFolders.length > 0) {
                        console.log(chalk.green(`✅ Found project root via package name: ${currentDir}`));
                        return currentDir;
                    }
                }
                
                // Method 4: Check keywords
                if (pkg.keywords && pkg.keywords.some(keyword => 
                    ['extendscript', 'adobe', 'docdom', 'dom-discovery'].includes(keyword.toLowerCase())
                )) {
                    if (hasUtils || moduleFolders.length > 0) {
                        console.log(chalk.green(`✅ Found project root via keywords: ${currentDir}`));
                        return currentDir;
                    }
                }
            }
            
        } catch (e) {
            // Invalid package.json or file access error, continue searching
            console.log(chalk.gray(`   Skipping ${currentDir}: ${e.message}`));
        }
        
        currentDir = path.dirname(currentDir);
    }
    
    // Create detailed error message
    const errorDetails = [
        'DocDom project root not found.',
        '',
        'Expected project structure:',
        '  ProjectRoot/',
        '  ├── package.json (with docdom metadata)',
        '  ├── Utils/ (containing analysis tools)',
        '  └── DocDomV4.1/ (or similar module folder)',
        '',
        'Searched directories:',
        ...attempts.map(dir => `  - ${dir}`),
        '',
        'Solutions:',
        '1. Run from within DocDom project directory',
        '2. Ensure package.json has docdom.isProjectRoot: true',
        '3. Verify Utils/ and module folders exist'
    ];
    
    throw new Error(errorDetails.join('\n'));
};

/**
 * Get project-relative path for a given absolute path
 * @param {string} absolutePath - Absolute path to convert
 * @param {string} projectRoot - Project root directory (optional)
 * @returns {string} Relative path from project root
 */
export const getProjectRelativePath = (absolutePath, projectRoot = null) => {
    try {
        const root = projectRoot || findDocDomProjectRoot();
        return path.relative(root, absolutePath);
    } catch (e) {
        // Fallback to relative path from cwd
        return path.relative(process.cwd(), absolutePath);
    }
};

/**
 * Resolve module folder path relative to project root
 * @param {string} folderName - Name of module folder (e.g., 'DocDomV4.1')
 * @param {string} projectRoot - Project root directory (optional)
 * @returns {string} Absolute path to module folder
 */
export const resolveModuleFolderPath = (folderName, projectRoot = null) => {
    const root = projectRoot || findDocDomProjectRoot();
    
    // Try direct path first
    const directPath = path.resolve(folderName);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
        return directPath;
    }
    
    // Try relative to project root
    const rootRelativePath = path.join(root, folderName);
    if (fs.existsSync(rootRelativePath) && fs.statSync(rootRelativePath).isDirectory()) {
        return rootRelativePath;
    }
    
    // Try relative to current working directory
    const cwdRelativePath = path.resolve(process.cwd(), folderName);
    if (fs.existsSync(cwdRelativePath) && fs.statSync(cwdRelativePath).isDirectory()) {
        return cwdRelativePath;
    }
    
    throw new Error(`Module folder not found: ${folderName}\nSearched:\n  - ${directPath}\n  - ${rootRelativePath}\n  - ${cwdRelativePath}`);
};

// ============================================================================
// ENHANCED FOLDER DISCOVERY WITH PROJECT ROOT AWARENESS
// ============================================================================

/**
 * Discover all folders containing DocDom modules with project root awareness
 * @param {string} rootPath - Root path to scan from (defaults to project root)
 * @returns {Array} Array of folder information objects
 */
export const discoverProjectFolders = (rootPath = null) => {
    const projectRoot = rootPath || findDocDomProjectRoot();
    
    console.log(chalk.blue('🔍 Scanning project for module folders...'));
    console.log(chalk.gray(`   Project root: ${projectRoot}`));
    console.log(chalk.gray('='.repeat(60)));

    const foldersWithModules = [];

    /**
     * Recursively scan directories for module files
     * @param {string} dirPath - Directory path to scan
     * @param {string} relativePath - Relative path from project root
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
                const folderName = relativePath || path.basename(dirPath);
                
                // Separate adapters for display
                const adapters = moduleFiles.filter(f => f.toLowerCase().includes('adapter'));
                const regular = moduleFiles.filter(f => !f.toLowerCase().includes('adapter'));
                
                const folderInfo = {
                    name: folderName,
                    path: dirPath,
                    relativePath: relativePath,
                    projectRelativePath: getProjectRelativePath(dirPath, projectRoot),
                    moduleFiles: moduleFiles,
                    moduleCount: moduleFiles.length,
                    adapterCount: adapters.length,
                    regularCount: regular.length,
                    adapters: adapters,
                    regularModules: regular
                };

                foldersWithModules.push(folderInfo);

                console.log(chalk.green(`📁 Found ${folderInfo.regularCount} modules + ${folderInfo.adapterCount} adapters in: ${folderName}`));
                console.log(chalk.gray(`   Path: ${folderInfo.projectRelativePath}`));
            }

            // Recursively scan subdirectories (but skip certain folders)
            entries
                .filter(entry => entry.isDirectory())
                .filter(entry => !isExcludedFolder(entry.name))
                .filter(entry => entry.name !== 'node_modules') // Always skip node_modules
                .forEach(entry => {
                    const subPath = path.join(dirPath, entry.name);
                    const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                    scanDirectory(subPath, subRelative);
                });

        } catch (error) {
            console.log(chalk.yellow(`⚠️  Cannot scan directory: ${dirPath} (${error.message})`));
        }
    };

    scanDirectory(projectRoot);

    console.log(chalk.cyan(`🏁 Discovery complete: ${foldersWithModules.length} folders with modules found`));
    return foldersWithModules;
};

/**
 * Analyze folder context for processing type determination
 * @param {string} folderPath - Path to folder to analyze
 * @param {string} projectRoot - Project root directory (optional)
 * @returns {Object} Analysis context information
 */
export const analyzeFolderContext = (folderPath, projectRoot = null) => {
    const root = projectRoot || findDocDomProjectRoot();
    const resolvedPath = resolveModuleFolderPath(folderPath, root);
    
    console.log(chalk.blue(`🔍 Analyzing folder context: ${path.basename(resolvedPath)}`));
    
    try {
        const moduleFiles = fs.readdirSync(resolvedPath)
            .filter(file => isModuleFile(file))
            .filter(file => !isExcludedFile(file));

        if (moduleFiles.length === 0) {
            throw new Error(`No module files found in: ${resolvedPath}`);
        }

        // Group files by version prefix for version comparison analysis
        const versionGroups = groupByVersionPrefix(moduleFiles);
        
        // Identify adapters
        const adapterFiles = moduleFiles.filter(file => file.toLowerCase().includes('adapter'));
        const regularFiles = moduleFiles.filter(file => !file.toLowerCase().includes('adapter'));

        // Determine analysis type based on content
        const hasVersionGroups = Object.keys(versionGroups).some(prefix => versionGroups[prefix].length > 1);
        const hasSystemModules = regularFiles.length > 1;
        const hasAdapters = adapterFiles.length > 0;

        const context = {
            folderPath: resolvedPath,
            projectRelativePath: getProjectRelativePath(resolvedPath, root),
            moduleFiles: moduleFiles,
            versionGroups: versionGroups,
            adapterFiles: adapterFiles,
            regularFiles: regularFiles,
            
            // Analysis type flags
            hasVersionComparison: hasVersionGroups,
            hasSystemModules: hasSystemModules,
            hasAdapters: hasAdapters,
            
            // Recommended analysis type
            analysisType: hasVersionGroups ? 'version-comparison' : 
                         hasSystemModules ? 'system-analysis' : 'individual-analysis',
            
            // Statistics
            totalModules: moduleFiles.length,
            versionGroupCount: Object.keys(versionGroups).length,
            adapterCount: adapterFiles.length,
            regularModuleCount: regularFiles.length
        };

        console.log(chalk.cyan(`📊 Context analysis complete:`));
        console.log(chalk.gray(`   Analysis type: ${context.analysisType}`));
        console.log(chalk.gray(`   Total modules: ${context.totalModules}`));
        console.log(chalk.gray(`   Adapters: ${context.adapterCount}`));
        console.log(chalk.gray(`   Version groups: ${context.versionGroupCount}`));

        return context;

    } catch (error) {
        console.error(chalk.red(`❌ Folder analysis failed: ${error.message}`));
        throw error;
    }
};

/**
 * Find target folder with enhanced project root awareness
 * @param {string} targetPath - Target folder path or name
 * @param {string} rootPath - Root path to search from (optional)
 * @returns {Object} Target folder information
 */
export const findTargetFolder = (targetPath, rootPath = null) => {
    const projectRoot = rootPath || findDocDomProjectRoot();
    
    console.log(chalk.blue(`🎯 Finding target folder: ${targetPath}`));
    console.log(chalk.gray(`   Project root: ${projectRoot}`));

    try {
        const resolvedTarget = resolveModuleFolderPath(targetPath, projectRoot);

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

        // Separate adapters from regular modules
        const adapterFiles = moduleFiles.filter(file => file.toLowerCase().includes('adapter'));
        const regularFiles = moduleFiles.filter(file => !file.toLowerCase().includes('adapter'));

        const folderInfo = {
            name: path.basename(resolvedTarget),
            path: resolvedTarget,
            relativePath: getProjectRelativePath(resolvedTarget, projectRoot),
            projectRoot: projectRoot,
            moduleFiles,
            moduleCount: moduleFiles.length,
            adapterFiles,
            regularFiles,
            adapterCount: adapterFiles.length,
            regularCount: regularFiles.length
        };

        console.log(chalk.green(`✅ Target folder found: ${folderInfo.name}`));
        console.log(chalk.gray(`   Path: ${folderInfo.relativePath}`));
        console.log(chalk.gray(`   Modules: ${folderInfo.moduleCount} (${folderInfo.regularCount} + ${folderInfo.adapterCount} adapters)`));

        return folderInfo;

    } catch (error) {
        console.error(chalk.red(`❌ Target folder search failed: ${error.message}`));
        throw error;
    }
};

/**
 * Generate folder summary for reporting with project context
 * @param {Object} folderInfo - Folder information
 * @param {Object} context - Analysis context
 * @returns {Object} Folder summary
 */
export const generateFolderSummary = (folderInfo, context) => {
    try {
        const projectRoot = findDocDomProjectRoot();
        
        const summary = {
            folder_name: folderInfo.name,
            folder_path: folderInfo.relativePath || getProjectRelativePath(folderInfo.path, projectRoot),
            absolute_path: folderInfo.path,
            project_root: projectRoot,
            module_count: folderInfo.moduleCount,
            analysis_type: context.analysisType,
            timestamp: new Date().toISOString(),

            modules: folderInfo.moduleFiles.map(filename => {
                const version = extractVersion(filename);
                const isAdapter = filename.toLowerCase().includes('adapter');
                return {
                    filename,
                    version: version || 'unknown',
                    isAdapter,
                    type: isAdapter ? 'adapter' : 'module'
                };
            })
        };

        if (context.hasVersionComparison) {
            summary.version_groups = context.versionGroups;
        }

        if (context.hasSystemModules) {
            summary.system_modules = context.regularFiles;
        }

        if (context.hasAdapters) {
            summary.adapters = context.adapterFiles;
        }

        return summary;

    } catch (error) {
        console.error(chalk.yellow(`⚠️ Summary generation failed: ${error.message}`));
        return {
            folder_name: folderInfo.name || 'unknown',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Create output filename with project awareness
 * @param {string} baseName - Base name for file
 * @param {string} suffix - File suffix
 * @param {string} extension - File extension
 * @param {string} outputDir - Output directory (optional)
 * @returns {string} Full output file path
 */
export const createOutputFilename = (baseName, suffix, extension, outputDir = null) => {
    try {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
        
        const filename = `${baseName}_${suffix}_${timestamp}.${extension}`;
        
        if (outputDir) {
            return path.join(outputDir, filename);
        }
        
        return filename;

    } catch (error) {
        console.error(chalk.yellow(`⚠️ Filename generation failed: ${error.message}`));
        return `${baseName}_${suffix}.${extension}`;
    }
};

// ============================================================================
// DEFAULT EXPORT WITH ALL FUNCTIONALITY
// ============================================================================

export default {
    // Project root detection
    findDocDomProjectRoot,
    getProjectRelativePath,
    resolveModuleFolderPath,
    
    // Enhanced discovery
    discoverProjectFolders,
    analyzeFolderContext,
    findTargetFolder,
    
    // Module utilities (re-exported from patterns)
    sortModulesByVersion,
    validateModuleFiles,
    
    // Output utilities
    generateFolderSummary,
    createOutputFilename
};