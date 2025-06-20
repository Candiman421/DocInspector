// ============================================================================
// SYSTEM ANALYZER
// Analysis of multiple modules working together as a dependency system
// ============================================================================

import chalk from 'chalk';
import path from 'path';
import { analyzeIndividualModule } from './individual-module-analyzer.js';
import { analyzeFunctionSimilarity } from './similarity-detector.js';
import { parseVersion, compareVersions } from '../config/patterns.js';

/**
 * Analyze a system of modules working together
 * @param {Object} folderInfo - Folder containing system modules
 * @param {Object} options - Analysis options
 * @returns {Object} Complete system analysis
 */
export const analyzeModuleSystem =  (folderInfo, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔗 Analyzing module system: ${folderInfo.name}`));
    console.log(chalk.gray(`   Modules: ${folderInfo.moduleFiles.length}`));

    try {
        // Sort modules by dependency order (version number)
        const sortedModules = sortModulesByDependencyOrder(folderInfo.moduleFiles);

        // Analyze each module individually
        console.log(chalk.cyan('📋 Analyzing individual modules...'));
        const moduleAnalyses = [];

        for (const moduleFile of sortedModules) {
            const filePath = path.join(folderInfo.path, moduleFile.filename);
            const analysis =  analyzeIndividualModule(filePath, options);

            if (analysis.success) {
                moduleAnalyses.push({
                    ...analysis,
                    moduleFile: moduleFile
                });
            } else {
                console.warn(chalk.yellow(`⚠️  Skipping failed module: ${moduleFile.filename}`));
            }
        }

        if (moduleAnalyses.length === 0) {
            throw new Error('No modules successfully analyzed');
        }

        // Perform system-wide analysis
        console.log(chalk.cyan('🔍 Performing system-wide analysis...'));

        const systemAnalysis = {
            // System metadata
            system_info: {
                folder_name: folderInfo.name,
                total_modules: folderInfo.moduleFiles.length,
                analyzed_modules: moduleAnalyses.length,
                analysis_timestamp: new Date().toISOString(),
                analysis_type: 'system_analysis'
            },

            // Individual module results
            individual_modules: moduleAnalyses.map(ma => ({
                filename: ma.analysis.module_info.filename,
                version: ma.analysis.module_info.version,
                health_score: ma.analysis.health_score.total_score,
                grade: ma.analysis.health_score.grade,
                function_count: ma.analysis.function_inventory.total_count,
                line_count: ma.analysis.module_info.line_count,
                es3_compliant: ma.analysis.es3_compliance.compliant,
                registration_accuracy: ma.analysis.registration_compliance.accuracyPercentage,
                critical_issues: ma.analysis.es3_compliance.criticalViolations.length +
                    ma.analysis.reserved_word_safety.criticalViolations.length
            })),

            // System-wide dependency analysis
            dependency_analysis: analyzeDependencyCompliance(moduleAnalyses),

            // Cross-module function analysis
            cross_module_analysis:  analyzeCrossModuleFunctions(moduleAnalyses, options),

            // System health metrics
            system_health: calculateSystemHealth(moduleAnalyses),

            // Architecture compliance
            architecture_compliance: analyzeArchitectureCompliance(moduleAnalyses),

            // System recommendations
            recommendations: generateSystemRecommendations(moduleAnalyses),

            // Analysis timing
            analysis_time_ms: 0
        };

        systemAnalysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ System analysis complete (${systemAnalysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   System Health: ${systemAnalysis.system_health.overall_grade}`));
        console.log(chalk.gray(`   Modules: ${systemAnalysis.analyzed_modules}, Issues: ${systemAnalysis.system_health.total_critical_issues}`));

        return {
            success: true,
            analysis: systemAnalysis,
            folderInfo,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(chalk.red(`❌ System analysis failed: ${error.message}`));

        return {
            success: false,
            error: error.message,
            folderInfo,
            timestamp: new Date().toISOString(),
            analysis_time_ms: Date.now() - startTime
        };
    }
};

/**
 * Sort modules by dependency order (version numbers)
 * @param {Array} moduleFiles - Array of module filenames
 * @returns {Array} Sorted module information
 */
const sortModulesByDependencyOrder = (moduleFiles) => {
    const moduleData = moduleFiles.map(filename => {
        const versionMatch = filename.match(/^(\d+(?:\.\d+){0,3})_/);
        const version = versionMatch ? versionMatch[1] : '0';
        const versionArray = parseVersion(version);

        return {
            filename,
            version,
            versionArray,
            sortKey: versionArray.map(n => String(n).padStart(3, '0')).join('.')
        };
    });

    // Sort by version array comparison
    moduleData.sort((a, b) => compareVersions(a.versionArray, b.versionArray));

    console.log(chalk.cyan('📊 Module dependency order:'));
    moduleData.forEach((module, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${module.filename} (v${module.version})`));
    });

    return moduleData;
};

/**
 * Analyze dependency compliance across modules
 * @param {Array} moduleAnalyses - Individual module analyses
 * @returns {Object} Dependency compliance analysis
 */
const analyzeDependencyCompliance = (moduleAnalyses) => {
    const analysis = {
        dependency_order_valid: true,
        dependency_violations: [],
        missing_dependencies: [],
        circular_dependencies: [],
        compliance_score: 100
    };

    // Create dependency map
    const dependencyMap = {};
    const moduleVersions = {};

    moduleAnalyses.forEach(ma => {
        const filename = ma.analysis.module_info.filename;
        const version = ma.analysis.module_info.version;
        const dependencies = ma.analysis.registration_compliance.moduleName ?
            extractDeclaredDependencies(ma) : [];

        dependencyMap[filename] = dependencies;
        moduleVersions[filename] = version;
    });

    // Check dependency order compliance
    Object.keys(dependencyMap).forEach(moduleName => {
        const moduleVersion = parseVersion(moduleVersions[moduleName] || '0');
        const dependencies = dependencyMap[moduleName];

        dependencies.forEach(dependency => {
            // Find dependency in our module list
            const depModule = Object.keys(moduleVersions).find(name =>
                name.includes(dependency) || dependency.includes(name.split('_')[0])
            );

            if (depModule) {
                const depVersion = parseVersion(moduleVersions[depModule] || '0');

                // Check if dependency version is higher than current module
                if (compareVersions(depVersion, moduleVersion) >= 0) {
                    analysis.dependency_order_valid = false;
                    analysis.dependency_violations.push({
                        module: moduleName,
                        dependency: depModule,
                        issue: `Module v${moduleVersions[moduleName]} depends on v${moduleVersions[depModule]} (reverse dependency)`
                    });
                    analysis.compliance_score -= 20;
                }
            } else {
                // Dependency not found in current module set
                analysis.missing_dependencies.push({
                    module: moduleName,
                    missing_dependency: dependency
                });
                analysis.compliance_score -= 10;
            }
        });
    });

    // Check for circular dependencies (simplified)
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (module) => {
        if (recursionStack.has(module)) {
            return true;
        }
        if (visited.has(module)) {
            return false;
        }

        visited.add(module);
        recursionStack.add(module);

        const dependencies = dependencyMap[module] || [];
        for (const dep of dependencies) {
            const depModule = Object.keys(dependencyMap).find(name =>
                name.includes(dep) || dep.includes(name.split('_')[0])
            );

            if (depModule && hasCycle(depModule)) {
                analysis.circular_dependencies.push({
                    module,
                    dependency: depModule
                });
                return true;
            }
        }

        recursionStack.delete(module);
        return false;
    };

    Object.keys(dependencyMap).forEach(module => {
        if (!visited.has(module)) {
            hasCycle(module);
        }
    });

    if (analysis.circular_dependencies.length > 0) {
        analysis.compliance_score -= analysis.circular_dependencies.length * 50;
    }

    analysis.compliance_score = Math.max(0, analysis.compliance_score);

    return analysis;
};

/**
 * Extract declared dependencies from module analysis
 * @param {Object} moduleAnalysis - Individual module analysis
 * @returns {Array} Array of dependency names
 */
const extractDeclaredDependencies = (moduleAnalysis) => {
    // This would extract from the analysis.dependencies if available
    // For now, return empty array as placeholder
    return [];
};

/**
 * Analyze cross-module functions (duplicates, similarities)
 * @param {Array} moduleAnalyses - Individual module analyses
 * @param {Object} options - Analysis options
 * @returns {Object} Cross-module function analysis
 */
const analyzeCrossModuleFunctions =  (moduleAnalyses, options) => {
    console.log(chalk.cyan('🔍 Analyzing cross-module functions...'));

    const analysis = {
        total_functions: 0,
        duplicate_functions: [],
        similar_functions: [],
        function_name_collisions: [],
        recommendations: []
    };

    // Collect all functions from all modules
    const allFunctions = [];

    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis.module_info.filename;
        const functions = ma.analysis.function_inventory;

        analysis.total_functions += functions.total_count;

        // Add global functions to analysis
        if (functions.withParameters && functions.withoutParameters) {
            [...functions.withParameters, ...functions.withoutParameters].forEach(funcInfo => {
                const funcName = typeof funcInfo === 'string' ? funcInfo : funcInfo.name;
                allFunctions.push({
                    name: funcName,
                    module: moduleName,
                    parameters: typeof funcInfo === 'object' ? funcInfo.parameters : [],
                    parameterCount: typeof funcInfo === 'object' ? funcInfo.parameterCount : 0
                });
            });
        }
    });

    // Find function name collisions (same name in different modules)
    const functionsByName = {};

    allFunctions.forEach(func => {
        if (!functionsByName[func.name]) {
            functionsByName[func.name] = [];
        }
        functionsByName[func.name].push(func);
    });

    // Identify collisions and potential issues
    Object.keys(functionsByName).forEach(funcName => {
        const functions = functionsByName[funcName];

        if (functions.length > 1) {
            // Check if these are legitimate duplicates or intentional overrides
            const uniqueModules = [...new Set(functions.map(f => f.module))];

            if (uniqueModules.length > 1) {
                // Same function name in different modules
                analysis.function_name_collisions.push({
                    function_name: funcName,
                    modules: uniqueModules,
                    instances: functions.length,
                    recommendation: `Review function '${funcName}' - appears in ${uniqueModules.length} modules`
                });
            }
        }
    });

    // Use similarity detector for detailed analysis if enabled
    if (options.enableSimilarityDetection !== false) {
        try {
            const similarityResults =  analyzeFunctionSimilarity(moduleAnalyses, {
                context: 'system',
                threshold: options.similarityThreshold || 75
            });

            analysis.similar_functions = similarityResults.similarities || [];
            analysis.duplicate_functions = similarityResults.duplicates || [];
        } catch (error) {
            console.warn(chalk.yellow(`⚠️  Similarity analysis failed: ${error.message}`));
        }
    }

    // Generate recommendations
    if (analysis.function_name_collisions.length > 0) {
        analysis.recommendations.push(`Found ${analysis.function_name_collisions.length} function name collisions - review for potential conflicts`);
    }

    if (analysis.duplicate_functions.length > 0) {
        analysis.recommendations.push(`Found ${analysis.duplicate_functions.length} duplicate functions - consider consolidation`);
    }

    return analysis;
};

/**
 * Calculate overall system health
 * @param {Array} moduleAnalyses - Individual module analyses
 * @returns {Object} System health metrics
 */
const calculateSystemHealth = (moduleAnalyses) => {
    const health = {
        total_modules: moduleAnalyses.length,
        healthy_modules: 0,
        unhealthy_modules: 0,
        total_critical_issues: 0,
        average_health_score: 0,
        overall_grade: 'F',

        grade_distribution: {
            'A+': 0, 'A': 0, 'B+': 0, 'B': 0,
            'C+': 0, 'C': 0, 'D': 0, 'F': 0
        },

        common_issues: [],
        system_strengths: []
    };

    let totalScore = 0;
    const issueFrequency = {};

    moduleAnalyses.forEach(ma => {
        const moduleHealth = ma.analysis.health_score;
        const grade = moduleHealth.grade;

        // Count grades
        health.grade_distribution[grade]++;

        // Track health status
        if (moduleHealth.total_score >= 700) {
            health.healthy_modules++;
        } else {
            health.unhealthy_modules++;
        }

        totalScore += moduleHealth.total_score;

        // Count critical issues
        const criticalIssues = (ma.analysis.es3_compliance.criticalViolations || []).length +
            (ma.analysis.reserved_word_safety.criticalViolations || []).length;
        health.total_critical_issues += criticalIssues;

        // Track common issues
        if (!ma.analysis.es3_compliance.compliant) {
            issueFrequency['es3_violations'] = (issueFrequency['es3_violations'] || 0) + 1;
        }

        if (ma.analysis.registration_compliance.accuracyPercentage < 100) {
            issueFrequency['registration_issues'] = (issueFrequency['registration_issues'] || 0) + 1;
        }

        if (ma.analysis.logging_compliance.compliance === 'poor') {
            issueFrequency['logging_issues'] = (issueFrequency['logging_issues'] || 0) + 1;
        }
    });

    // Calculate average health score
    health.average_health_score = Math.round(totalScore / moduleAnalyses.length);

    // Determine overall system grade based on average and distribution
    if (health.average_health_score >= 900 && health.unhealthy_modules === 0) {
        health.overall_grade = 'A+';
    } else if (health.average_health_score >= 850 && health.unhealthy_modules <= 1) {
        health.overall_grade = 'A';
    } else if (health.average_health_score >= 800) {
        health.overall_grade = 'B+';
    } else if (health.average_health_score >= 750) {
        health.overall_grade = 'B';
    } else if (health.average_health_score >= 700) {
        health.overall_grade = 'C+';
    } else if (health.average_health_score >= 650) {
        health.overall_grade = 'C';
    } else if (health.average_health_score >= 600) {
        health.overall_grade = 'D';
    } else {
        health.overall_grade = 'F';
    }

    // Identify common issues (affecting >50% of modules)
    const moduleCount = moduleAnalyses.length;
    Object.keys(issueFrequency).forEach(issue => {
        if (issueFrequency[issue] > moduleCount / 2) {
            health.common_issues.push({
                issue,
                affected_modules: issueFrequency[issue],
                percentage: Math.round((issueFrequency[issue] / moduleCount) * 100)
            });
        }
    });

    return health;
};

/**
 * Analyze architecture compliance across the system
 * @param {Array} moduleAnalyses - Individual module analyses
 * @returns {Object} Architecture compliance analysis
 */
const analyzeArchitectureCompliance = (moduleAnalyses) => {
    const compliance = {
        sequential_dependency_compliance: true,
        es3_compliance_system: true,
        logging_modernization: 0,
        function_registration_accuracy: 0,
        architecture_score: 100,

        violations: [],
        achievements: []
    };

    let totalLoggingScore = 0;
    let totalRegistrationAccuracy = 0;
    let moduleCount = moduleAnalyses.length;

    moduleAnalyses.forEach((ma, index) => {
        const analysis = ma.analysis;

        // Check ES3 compliance
        if (!analysis.es3_compliance.compliant) {
            compliance.es3_compliance_system = false;
            compliance.violations.push({
                module: analysis.module_info.filename,
                issue: 'ES3 compliance violations',
                severity: 'critical'
            });
            compliance.architecture_score -= 50;
        }

        // Check dependency order (should increase with index)
        if (index > 0) {
            const prevVersion = parseVersion(moduleAnalyses[index - 1].analysis.module_info.version || '0');
            const currVersion = parseVersion(analysis.module_info.version || '0');

            if (compareVersions(currVersion, prevVersion) <= 0) {
                compliance.sequential_dependency_compliance = false;
                compliance.violations.push({
                    module: analysis.module_info.filename,
                    issue: 'Module version order violation',
                    severity: 'high'
                });
                compliance.architecture_score -= 30;
            }
        }

        // Aggregate logging and registration scores
        totalLoggingScore += analysis.logging_compliance.modernPercentage || 0;
        totalRegistrationAccuracy += analysis.registration_compliance.accuracyPercentage || 0;
    });

    // Calculate averages
    compliance.logging_modernization = Math.round(totalLoggingScore / moduleCount);
    compliance.function_registration_accuracy = Math.round(totalRegistrationAccuracy / moduleCount);

    // Add achievements
    if (compliance.es3_compliance_system) {
        compliance.achievements.push('Full ES3 compliance across all modules');
        compliance.architecture_score += 20;
    }

    if (compliance.sequential_dependency_compliance) {
        compliance.achievements.push('Perfect sequential dependency order');
        compliance.architecture_score += 15;
    }

    if (compliance.logging_modernization >= 90) {
        compliance.achievements.push('Excellent logging modernization');
        compliance.architecture_score += 10;
    }

    if (compliance.function_registration_accuracy >= 95) {
        compliance.achievements.push('Excellent function registration accuracy');
        compliance.architecture_score += 10;
    }

    compliance.architecture_score = Math.max(0, Math.min(100, compliance.architecture_score));

    return compliance;
};

/**
 * Generate system-wide recommendations
 * @param {Array} moduleAnalyses - Individual module analyses
 * @returns {Array} Array of recommendations
 */
const generateSystemRecommendations = (moduleAnalyses) => {
    const recommendations = [];
    const issues = {};

    // Aggregate issues across modules
    moduleAnalyses.forEach(ma => {
        const analysis = ma.analysis;

        if (!analysis.es3_compliance.compliant) {
            issues.es3_issues = (issues.es3_issues || 0) + 1;
        }

        if (analysis.registration_compliance.accuracyPercentage < 100) {
            issues.registration_issues = (issues.registration_issues || 0) + 1;
        }

        if (analysis.logging_compliance.modernPercentage < 80) {
            issues.logging_issues = (issues.logging_issues || 0) + 1;
        }

        if (analysis.security_patterns.risk_level === 'high' || analysis.security_patterns.risk_level === 'critical') {
            issues.security_issues = (issues.security_issues || 0) + 1;
        }
    });

    const moduleCount = moduleAnalyses.length;

    // Generate recommendations based on common issues
    if (issues.es3_issues && issues.es3_issues > moduleCount / 2) {
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            description: `${issues.es3_issues}/${moduleCount} modules have ES3 compliance issues`,
            action: 'Review and fix ES3 compatibility violations across affected modules'
        });
    }

    if (issues.registration_issues && issues.registration_issues > moduleCount / 3) {
        recommendations.push({
            priority: 'high',
            category: 'function_registration',
            description: `${issues.registration_issues}/${moduleCount} modules have registration accuracy issues`,
            action: 'Update registerModule calls to match actual function exports'
        });
    }

    if (issues.logging_issues && issues.logging_issues > moduleCount / 2) {
        recommendations.push({
            priority: 'medium',
            category: 'logging_modernization',
            description: `${issues.logging_issues}/${moduleCount} modules need logging modernization`,
            action: 'Replace $.writeln() calls with modern logging functions (logDebug, logInfo, etc.)'
        });
    }

    if (issues.security_issues && issues.security_issues > 0) {
        recommendations.push({
            priority: 'critical',
            category: 'security',
            description: `${issues.security_issues}/${moduleCount} modules have security issues`,
            action: 'Review and address security vulnerabilities immediately'
        });
    }

    return recommendations;
};

export default {
    analyzeModuleSystem
};