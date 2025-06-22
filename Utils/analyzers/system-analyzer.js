// analyzers/system-analyzer.js
// SYSTEM ANALYZER - FIXED VERSION
// ACCURATE DEPENDENCY ORDER VALIDATION - DETECTS ALL VIOLATIONS
// ============================================================================

import chalk from 'chalk';
import path from 'path';
import { analyzeIndividualModule } from './individual-module-analyzer.js';
import { analyzeFunctionSimilarity } from './similarity-detector.js';
import { 
    parseVersion, 
    compareVersions, 
    determineModuleType, 
    validateDependencyOrder 
} from '../config/patterns.js';

/**
 * FIXED - Analyze a system of modules with accurate dependency validation
 * DETECTS: 1.15→1.1 violations and all sequential order problems
 * @param {Object} folderInfo - Folder containing system modules
 * @param {Object} options - Analysis options
 * @returns {Object} Complete system analysis
 */
export const analyzeModuleSystem = (folderInfo, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔗 Analyzing module system: ${folderInfo.name}`));
    console.log(chalk.gray(`   Modules: ${folderInfo.moduleFiles.length}`));

    try {
        // STEP 1: Sort modules by correct dependency order first
        const sortedModules = sortModulesByDependencyOrder(folderInfo.moduleFiles);
        console.log(chalk.cyan('📋 Correct dependency order established'));

        // STEP 2: Analyze each module individually
        console.log(chalk.cyan('📋 Analyzing individual modules...'));
        const moduleAnalyses = [];

        for (const moduleFile of sortedModules) {
            const filePath = path.join(folderInfo.path, moduleFile.filename);
            const analysis = analyzeIndividualModule(filePath, options);

            if (analysis.success) {
                moduleAnalyses.push({
                    ...analysis,
                    moduleFile: moduleFile,
                    moduleType: determineModuleType(moduleFile.filename)
                });
                console.log(chalk.green(`   ✅ ${moduleFile.filename}`));
            } else {
                console.warn(chalk.yellow(`   ⚠️  Skipping failed module: ${moduleFile.filename}`));
            }
        }

        if (moduleAnalyses.length === 0) {
            throw new Error('No modules successfully analyzed');
        }

        // STEP 3: CRITICAL - Analyze actual load order vs correct order
        console.log(chalk.cyan('🔍 Validating sequential dependency order...'));
        const dependencyAnalysis = analyzeSequentialDependencies(
            folderInfo.moduleFiles, 
            sortedModules, 
            moduleAnalyses
        );

        // STEP 4: Cross-module analysis
        console.log(chalk.cyan('🔍 Performing cross-module analysis...'));
        const crossModuleAnalysis = analyzeCrossModuleFunctions(moduleAnalyses, options);

        // STEP 5: Build comprehensive system analysis
        const systemAnalysis = {
            // System metadata
            system_info: {
                folder_name: folderInfo.name,
                total_modules: folderInfo.moduleFiles.length,
                analyzed_modules: moduleAnalyses.length,
                analysis_timestamp: new Date().toISOString(),
                analysis_type: 'system_analysis'
            },

            // Individual module results with correct data mapping
            individual_modules: moduleAnalyses.map(ma => ({
                filename: ma?.analysis?.module_info?.filename || 'unknown',
                version: ma?.analysis?.module_info?.version || 'unknown',
                health_score: ma?.analysis?.health_score?.total_score || 0,
                grade: ma?.analysis?.health_score?.grade || 'F',
                function_count: ma?.analysis?.function_inventory?.total_count || 0,
                line_count: ma?.analysis?.module_info?.line_count || 0,
                es3_compliant: ma?.analysis?.es3_compliance?.compliant || false,
                registration_accuracy: ma?.analysis?.registration_compliance?.accuracyPercentage || 0,
                logging_coverage: ma?.analysis?.function_architecture?.loggingCoverage || 0,
                critical_issues: extractCriticalIssues(ma?.analysis),
                dependencies: ma?.analysis?.dependencies?.declared || [],
                module_type: ma?.moduleType?.category || 'unknown',
                load_order: ma?.moduleType?.loadOrder || 999
            })),

            // ENHANCED - Accurate dependency analysis
            dependency_analysis: dependencyAnalysis,

            // Cross-module function analysis
            cross_module_analysis: crossModuleAnalysis,

            // System health metrics
            system_health: calculateSystemHealth(moduleAnalyses),

            // Architecture compliance
            architecture_compliance: analyzeArchitectureCompliance(moduleAnalyses, dependencyAnalysis),

            // ENHANCED - System recommendations with dependency fixes
            recommendations: generateSystemRecommendations(moduleAnalyses, dependencyAnalysis),

            // Analysis timing
            analysis_time_ms: 0
        };

        systemAnalysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ System analysis complete (${systemAnalysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   System Health: ${systemAnalysis.system_health.overall_grade}`));
        console.log(chalk.cyan(`   Dependencies: ${dependencyAnalysis.dependency_violations?.length || 0} violations`));
        console.log(chalk.gray(`   Modules: ${systemAnalysis.system_info.analyzed_modules}, Issues: ${systemAnalysis.system_health.total_critical_issues}`));

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
 * ENHANCED - Sort modules by correct dependency order
 * @param {Array} moduleFiles - Array of module filenames
 * @returns {Array} Sorted module information with dependency order
 */
const sortModulesByDependencyOrder = (moduleFiles) => {
    const moduleData = moduleFiles.map(filename => {
        const moduleType = determineModuleType(filename);
        
        return {
            filename,
            version: moduleType.version,
            versionComponents: moduleType.versionComponents,
            category: moduleType.category,
            loadOrder: moduleType.loadOrder,
            sortKey: moduleType.versionComponents.map(n => String(n).padStart(3, '0')).join('.')
        };
    });

    // Sort by version components (ensures sequential order)
    moduleData.sort((a, b) => compareVersions(a.versionComponents, b.versionComponents));

    console.log(chalk.cyan('📊 Correct module dependency order:'));
    moduleData.forEach((module, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${module.filename} (v${module.version}) [${module.category}]`));
    });

    return moduleData;
};

/**
 * CRITICAL - Analyze sequential dependencies for order violations
 * DETECTS: 1.15→1.1 violations like the user example
 * @param {Array} actualLoadOrder - Files in actual load order
 * @param {Array} correctOrder - Files in correct dependency order  
 * @param {Array} moduleAnalyses - Individual module analyses
 * @returns {Object} Dependency compliance analysis
 */
const analyzeSequentialDependencies = (actualLoadOrder, correctOrder, moduleAnalyses) => {
    const analysis = {
        dependency_order_valid: true,
        dependency_violations: [],
        missing_dependencies: [],
        circular_dependencies: [],
        load_order_violations: [],
        compliance_score: 100
    };

    console.log(chalk.cyan('🔍 Comparing actual vs correct load order...'));

    // Create mapping of correct order positions
    const correctOrderMap = {};
    correctOrder.forEach((module, index) => {
        correctOrderMap[module.filename] = index;
    });

    // Check each file in actual load order against correct order
    for (let actualIndex = 0; actualIndex < actualLoadOrder.length; actualIndex++) {
        const filename = actualLoadOrder[actualIndex];
        const correctIndex = correctOrderMap[filename];

        if (correctIndex === undefined) {
            console.warn(chalk.yellow(`   ⚠️  File not in correct order mapping: ${filename}`));
            continue;
        }

        // CRITICAL CHECK: Dependency order violation detection
        for (let checkIndex = actualIndex + 1; checkIndex < actualLoadOrder.length; checkIndex++) {
            const laterFile = actualLoadOrder[checkIndex];
            const laterCorrectIndex = correctOrderMap[laterFile];

            if (laterCorrectIndex !== undefined && laterCorrectIndex < correctIndex) {
                // VIOLATION: Later file should actually load earlier
                const currentVersion = extractVersionFromFilename(filename);
                const laterVersion = extractVersionFromFilename(laterFile);

                const violation = {
                    type: 'load_order_violation',
                    severity: 'CRITICAL',
                    current_file: filename,
                    current_version: currentVersion,
                    current_actual_position: actualIndex + 1,
                    later_file: laterFile,
                    later_version: laterVersion,
                    later_actual_position: checkIndex + 1,
                    later_correct_position: laterCorrectIndex + 1,
                    description: `${filename} (v${currentVersion}) loads before ${laterFile} (v${laterVersion}), but ${laterFile} should load first`,
                    fix: `Move ${laterFile} before ${filename} in load order`,
                    runtime_impact: 'Will cause runtime dependency errors - functions not available when called'
                };

                analysis.dependency_violations.push(violation);
                analysis.load_order_violations.push(violation);
                analysis.dependency_order_valid = false;
                analysis.compliance_score -= 25;

                console.log(chalk.red(`   ❌ VIOLATION: ${filename} → ${laterFile} (wrong order)`));
            }
        }
    }

    // Check for declared dependencies that are missing or out of order
    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis?.module_info?.filename;
        const declaredDeps = extractDeclaredDependencies(ma.analysis);

        if (declaredDeps && declaredDeps.length > 0) {
            declaredDeps.forEach(depName => {
                // Find dependency in actual files
                const depFile = actualLoadOrder.find(file => 
                    file.includes(depName) || depName.includes(extractModuleBaseName(file))
                );

                if (!depFile) {
                    // Missing dependency
                    analysis.missing_dependencies.push({
                        module: moduleName,
                        missing_dependency: depName,
                        severity: 'CRITICAL',
                        description: `Module ${moduleName} declares dependency on ${depName} but it's not found`,
                        fix: `Include ${depName} in module loading`
                    });
                    analysis.dependency_order_valid = false;
                    analysis.compliance_score -= 30;
                } else {
                    // Check load order for this dependency
                    const moduleIndex = actualLoadOrder.indexOf(moduleName);
                    const depIndex = actualLoadOrder.indexOf(depFile);

                    if (moduleIndex !== -1 && depIndex !== -1 && depIndex > moduleIndex) {
                        // Dependency loads after the module that needs it
                        analysis.dependency_violations.push({
                            type: 'dependency_order_violation',
                            severity: 'CRITICAL',
                            module: moduleName,
                            dependency: depFile,
                            module_position: moduleIndex + 1,
                            dependency_position: depIndex + 1,
                            description: `${moduleName} depends on ${depFile} but ${depFile} loads later`,
                            fix: `Move ${depFile} before ${moduleName} in load order`,
                            runtime_impact: 'Dependency functions not available when needed'
                        });
                        analysis.dependency_order_valid = false;
                        analysis.compliance_score -= 35;
                    }
                }
            });
        }
    });

    // Check for circular dependencies (simplified)
    const dependencyMap = {};
    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis?.module_info?.filename;
        const deps = extractDeclaredDependencies(ma.analysis);
        dependencyMap[moduleName] = deps || [];
    });

    Object.keys(dependencyMap).forEach(moduleName => {
        const dependencies = dependencyMap[moduleName];
        dependencies.forEach(depName => {
            const depDependencies = dependencyMap[depName] || [];
            if (depDependencies.includes(moduleName)) {
                analysis.circular_dependencies.push({
                    moduleA: moduleName,
                    moduleB: depName,
                    severity: 'CRITICAL',
                    description: `Circular dependency detected between ${moduleName} and ${depName}`,
                    fix: 'Refactor to remove circular dependency'
                });
                analysis.dependency_order_valid = false;
                analysis.compliance_score -= 40;
            }
        });
    });

    // Ensure compliance score doesn't go below 0
    analysis.compliance_score = Math.max(0, analysis.compliance_score);

    // Summary logging
    if (analysis.dependency_violations.length > 0) {
        console.log(chalk.red(`   🚨 Found ${analysis.dependency_violations.length} dependency violations`));
    } else {
        console.log(chalk.green(`   ✅ No dependency order violations found`));
    }

    return analysis;
};

/**
 * Extract version from filename for dependency checking
 * @param {string} filename - Module filename
 * @returns {string} Version string
 */
const extractVersionFromFilename = (filename) => {
    const match = filename.match(/^(\d+(?:\.\d+){0,6})_/);
    return match ? match[1] : 'unknown';
};

/**
 * Extract module base name without version
 * @param {string} filename - Module filename  
 * @returns {string} Base module name
 */
const extractModuleBaseName = (filename) => {
    return filename.replace(/^(\d+(?:\.\d+){0,6})_/, '').replace(/\.jsx?$/, '');
};

/**
 * Extract declared dependencies from module analysis
 * @param {Object} moduleAnalysis - Individual module analysis
 * @returns {Array} Array of dependency names
 */
const extractDeclaredDependencies = (moduleAnalysis) => {
    // Check multiple locations for dependency declarations
    if (moduleAnalysis?.dependencies?.declared) {
        return moduleAnalysis.dependencies.declared;
    }
    
    if (moduleAnalysis?.registration_compliance?.dependencies) {
        return moduleAnalysis.registration_compliance.dependencies;
    }
    
    // Try to extract from registration validation
    if (moduleAnalysis?.registration_compliance?.moduleName) {
        const moduleName = moduleAnalysis.registration_compliance.moduleName;
        
        // Common dependency patterns based on module names
        if (moduleName.includes('adapter')) {
            return ['1.1.0.0_bootstrap-foundation'];
        }
        
        if (moduleName.includes('safety') || moduleName.includes('utilities')) {
            return ['1.1.0.0_bootstrap-foundation'];
        }
        
        if (moduleName.match(/^[2-9]/)) {
            return ['1.1.0.0_bootstrap-foundation', '1.2.0.0_safety-utilities'];
        }
    }
    
    return [];
};

/**
 * Extract critical issues from module analysis
 * @param {Object} analysis - Module analysis
 * @returns {Array} Array of critical issue descriptions
 */
const extractCriticalIssues = (analysis) => {
    const issues = [];
    
    if (analysis?.es3_compliance?.criticalViolations) {
        analysis.es3_compliance.criticalViolations.forEach(v => {
            issues.push(`ES3: ${v.type || v.keyword || 'violation'}`);
        });
    }
    
    if (analysis?.reserved_word_safety?.criticalViolations) {
        analysis.reserved_word_safety.criticalViolations.forEach(v => {
            issues.push(`Reserved: ${v.word || 'word'}`);
        });
    }
    
    if (analysis?.registration_compliance?.functionsNotRegistered) {
        analysis.registration_compliance.functionsNotRegistered.forEach(f => {
            issues.push(`Unregistered: ${f}`);
        });
    }
    
    return issues.slice(0, 5); // Limit to 5 most important
};

/**
 * ENHANCED - Analyze cross-module functions with improved collision detection
 * @param {Array} moduleAnalyses - Individual module analyses
 * @param {Object} options - Analysis options
 * @returns {Object} Cross-module function analysis
 */
const analyzeCrossModuleFunctions = (moduleAnalyses, options) => {
    console.log(chalk.cyan('🔍 Analyzing cross-module functions...'));

    const analysis = {
        total_functions: 0,
        duplicate_functions: [],
        similar_functions: [],
        function_name_collisions: [],
        exact_name_matches: [],
        recommendations: []
    };

    // Collect all functions from all modules with their signatures
    const allFunctions = [];

    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis?.module_info?.filename || 'unknown';
        const functions = ma.analysis?.function_inventory;

        if (functions) {
            analysis.total_functions += functions.total_count || 0;

            // Process functions with parameters
            if (functions.withParameters) {
                functions.withParameters.forEach(funcInfo => {
                    const funcName = typeof funcInfo === 'string' ? funcInfo : funcInfo.name;
                    const parameters = typeof funcInfo === 'object' ? funcInfo.parameters : [];
                    
                    allFunctions.push({
                        name: funcName,
                        module: moduleName,
                        parameters: parameters,
                        parameterCount: parameters.length,
                        signature: findFunctionSignature(functions, funcName)
                    });
                });
            }

            // Process functions without parameters
            if (functions.withoutParameters) {
                functions.withoutParameters.forEach(funcName => {
                    allFunctions.push({
                        name: funcName,
                        module: moduleName,
                        parameters: [],
                        parameterCount: 0,
                        signature: findFunctionSignature(functions, funcName)
                    });
                });
            }
        }
    });

    // ENHANCED - Find exact function name collisions
    const functionsByName = {};
    allFunctions.forEach(func => {
        if (!functionsByName[func.name]) {
            functionsByName[func.name] = [];
        }
        functionsByName[func.name].push(func);
    });

    // Identify exact name collisions with detailed analysis
    Object.keys(functionsByName).forEach(funcName => {
        const functions = functionsByName[funcName];

        if (functions.length > 1) {
            const uniqueModules = [...new Set(functions.map(f => f.module))];

            if (uniqueModules.length > 1) {
                // Same function name in different modules - collision!
                const collision = {
                    function_name: funcName,
                    modules: uniqueModules,
                    instances: functions.length,
                    signatures: functions.map(f => f.signature).filter(s => s),
                    signature_match: functions.every(f => f.signature === functions[0].signature),
                    parameter_counts: [...new Set(functions.map(f => f.parameterCount))],
                    severity: 'HIGH',
                    runtime_impact: 'Last loaded module will override earlier definitions',
                    recommendation: `Rename function '${funcName}' in one of the modules: ${uniqueModules.join(', ')}`
                };

                analysis.function_name_collisions.push(collision);
                analysis.exact_name_matches.push(collision);

                console.log(chalk.yellow(`   ⚠️  COLLISION: ${funcName} in ${uniqueModules.length} modules`));
            }
        }
    });

    // Use similarity detector for detailed analysis if enabled
    if (options.enableSimilarityDetection !== false) {
        try {
            const similarityResults = analyzeFunctionSimilarity(moduleAnalyses, {
                context: 'system',
                threshold: options.similarityThreshold || 75
            });

            if (similarityResults.similarities) {
                analysis.similar_functions = similarityResults.similarities;
            }
            if (similarityResults.exact_duplicates) {
                analysis.duplicate_functions = similarityResults.exact_duplicates;
            }
        } catch (error) {
            console.warn(chalk.yellow(`   ⚠️  Similarity analysis failed: ${error.message}`));
        }
    }

    // Generate recommendations
    if (analysis.function_name_collisions.length > 0) {
        analysis.recommendations.push({
            priority: 'HIGH',
            category: 'function_collisions',
            count: analysis.function_name_collisions.length,
            description: `Found ${analysis.function_name_collisions.length} function name collisions`,
            action: 'Review and rename conflicting functions to avoid runtime overrides'
        });
    }

    if (analysis.duplicate_functions.length > 0) {
        analysis.recommendations.push({
            priority: 'MEDIUM',
            category: 'duplicate_functions',
            count: analysis.duplicate_functions.length,
            description: `Found ${analysis.duplicate_functions.length} duplicate functions`,
            action: 'Consider consolidating duplicate functionality'
        });
    }

    return analysis;
};

/**
 * Find function signature in inventory
 * @param {Object} functions - Function inventory
 * @param {string} funcName - Function name
 * @returns {string|null} Function signature
 */
const findFunctionSignature = (functions, funcName) => {
    if (functions.function_signatures) {
        return functions.function_signatures.find(sig => sig.includes(`function ${funcName}`)) || null;
    }
    if (functions.signatures) {
        return functions.signatures.find(sig => sig.includes(`function ${funcName}`)) || null;
    }
    return null;
};

/**
 * ENHANCED - Calculate overall system health with dependency awareness
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
        const moduleHealth = ma.analysis?.health_score;
        if (!moduleHealth) return;
        
        const grade = moduleHealth.grade;
        const score = moduleHealth.total_score;

        // Count grades
        health.grade_distribution[grade]++;

        // Track health status (raised threshold due to better detection)
        if (score >= 800) {
            health.healthy_modules++;
        } else {
            health.unhealthy_modules++;
        }

        totalScore += score;

        // Count critical issues with better detection
        const criticalIssues = extractCriticalIssues(ma.analysis).length;
        health.total_critical_issues += criticalIssues;

        // Track common issues
        if (!ma.analysis?.es3_compliance?.compliant) {
            issueFrequency['es3_violations'] = (issueFrequency['es3_violations'] || 0) + 1;
        }

        if ((ma.analysis?.registration_compliance?.accuracyPercentage || 0) < 100) {
            issueFrequency['registration_issues'] = (issueFrequency['registration_issues'] || 0) + 1;
        }

        if (ma.analysis?.logging_compliance?.compliance === 'poor') {
            issueFrequency['logging_issues'] = (issueFrequency['logging_issues'] || 0) + 1;
        }
    });

    // Calculate average health score
    health.average_health_score = moduleAnalyses.length > 0 ? 
        Math.round(totalScore / moduleAnalyses.length) : 0;

    // Determine overall system grade (more stringent due to better detection)
    if (health.average_health_score >= 920 && health.unhealthy_modules === 0 && health.total_critical_issues === 0) {
        health.overall_grade = 'A+';
    } else if (health.average_health_score >= 880 && health.unhealthy_modules <= 1 && health.total_critical_issues === 0) {
        health.overall_grade = 'A';
    } else if (health.average_health_score >= 840 && health.total_critical_issues === 0) {
        health.overall_grade = 'B+';
    } else if (health.average_health_score >= 800 && health.total_critical_issues <= 2) {
        health.overall_grade = 'B';
    } else if (health.average_health_score >= 750 && health.total_critical_issues <= 5) {
        health.overall_grade = 'C+';
    } else if (health.average_health_score >= 700) {
        health.overall_grade = 'C';
    } else if (health.average_health_score >= 600) {
        health.overall_grade = 'D';
    } else {
        health.overall_grade = 'F';
    }

    // Identify common issues (affecting >40% of modules)
    const moduleCount = moduleAnalyses.length;
    Object.keys(issueFrequency).forEach(issue => {
        if (issueFrequency[issue] > moduleCount * 0.4) {
            health.common_issues.push({
                issue,
                affected_modules: issueFrequency[issue],
                percentage: Math.round((issueFrequency[issue] / moduleCount) * 100)
            });
        }
    });

    // Identify system strengths
    if (health.healthy_modules > health.unhealthy_modules) {
        health.system_strengths.push('Majority of modules have good health scores');
    }

    const perfectRegistration = moduleAnalyses.filter(ma => 
        (ma.analysis?.registration_compliance?.accuracyPercentage || 0) === 100).length;
    
    if (perfectRegistration > moduleCount * 0.8) {
        health.system_strengths.push('Strong function registration compliance');
    }

    const goodLogging = moduleAnalyses.filter(ma => 
        (ma.analysis?.function_architecture?.loggingCoverage || 0) > 50).length;
    
    if (goodLogging > moduleCount * 0.6) {
        health.system_strengths.push('Good logging coverage across modules');
    }

    if (health.total_critical_issues === 0) {
        health.system_strengths.push('No critical issues detected');
    }

    return health;
};

/**
 * ENHANCED - Analyze architecture compliance with dependency validation
 * @param {Array} moduleAnalyses - Individual module analyses
 * @param {Object} dependencyAnalysis - Dependency analysis results
 * @returns {Object} Architecture compliance analysis
 */
const analyzeArchitectureCompliance = (moduleAnalyses, dependencyAnalysis) => {
    const compliance = {
        sequential_dependency_compliance: dependencyAnalysis.dependency_order_valid,
        es3_compliance_system: true,
        logging_modernization: 0,
        function_registration_accuracy: 0,
        architecture_score: 100,

        violations: [],
        achievements: []
    };

    let totalLoggingScore = 0;
    let totalRegistrationAccuracy = 0;
    const moduleCount = moduleAnalyses.length;

    moduleAnalyses.forEach((ma, index) => {
        const analysis = ma.analysis;
        if (!analysis) return;

        // Check ES3 compliance
        if (!analysis.es3_compliance?.compliant) {
            compliance.es3_compliance_system = false;
            compliance.violations.push({
                module: analysis.module_info?.filename || 'unknown',
                issue: 'ES3 compliance violations detected',
                severity: 'CRITICAL',
                confidence: 'HIGH'
            });
        }

        // Accumulate scores
        totalLoggingScore += analysis.function_architecture?.loggingCoverage || 0;
        totalRegistrationAccuracy += analysis.registration_compliance?.accuracyPercentage || 0;

        // Check for achievements
        if (analysis.health_score?.grade === 'A+' || analysis.health_score?.grade === 'A') {
            compliance.achievements.push({
                module: analysis.module_info?.filename || 'unknown',
                achievement: `Excellent health score: ${analysis.health_score.grade} (${analysis.health_score.total_score})`
            });
        }

        if ((analysis.registration_compliance?.accuracyPercentage || 0) === 100) {
            compliance.achievements.push({
                module: analysis.module_info?.filename || 'unknown',
                achievement: 'Perfect function registration accuracy'
            });
        }
    });

    // Add dependency violations to compliance violations
    if (dependencyAnalysis.dependency_violations) {
        dependencyAnalysis.dependency_violations.forEach(violation => {
            compliance.violations.push({
                module: violation.current_file || violation.module,
                issue: violation.description,
                severity: violation.severity,
                confidence: 'CERTAIN',
                fix: violation.fix
            });
        });
    }

    // Calculate averages
    compliance.logging_modernization = moduleCount > 0 ? Math.round(totalLoggingScore / moduleCount) : 0;
    compliance.function_registration_accuracy = moduleCount > 0 ? Math.round(totalRegistrationAccuracy / moduleCount) : 0;

    // Calculate overall architecture score with dependency compliance
    let score = 100;
    if (!compliance.sequential_dependency_compliance) score -= 50;  // Major penalty for dependency issues
    if (!compliance.es3_compliance_system) score -= 40;
    if (compliance.logging_modernization < 50) score -= 15;
    if (compliance.function_registration_accuracy < 95) score -= 15;

    compliance.architecture_score = Math.max(0, score);

    return compliance;
};

/**
 * ENHANCED - Generate system-wide recommendations with dependency fixes
 * @param {Array} moduleAnalyses - Individual module analyses
 * @param {Object} dependencyAnalysis - Dependency analysis results
 * @returns {Array} Array of recommendations
 */
const generateSystemRecommendations = (moduleAnalyses, dependencyAnalysis) => {
    const recommendations = [];

    // CRITICAL - Dependency order violations (highest priority)
    if (dependencyAnalysis.dependency_violations && dependencyAnalysis.dependency_violations.length > 0) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'dependency_order',
            title: 'Fix dependency loading order violations',
            description: `${dependencyAnalysis.dependency_violations.length} modules have dependency order violations`,
            affected_modules: dependencyAnalysis.dependency_violations.map(v => v.current_file || v.module),
            action: 'Reorder module loading to match dependency requirements',
            estimated_effort: 'low',
            runtime_impact: 'CRITICAL - Will cause runtime failures',
            specific_fixes: dependencyAnalysis.dependency_violations.map(v => v.fix)
        });
    }

    // ES3 compliance issues
    const es3Issues = moduleAnalyses.filter(ma => !ma.analysis?.es3_compliance?.compliant);
    if (es3Issues.length > 0) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'es3_compliance',
            title: 'Fix ES3 compatibility violations',
            description: `${es3Issues.length} modules have ES3 violations that will break ExtendScript`,
            affected_modules: es3Issues.map(ma => ma.analysis?.module_info?.filename),
            action: 'Review ES3 violations in individual module reports and fix syntax',
            estimated_effort: 'medium'
        });
    }

    // Registration accuracy issues
    const regIssues = moduleAnalyses.filter(ma => (ma.analysis?.registration_compliance?.accuracyPercentage || 0) < 95);
    if (regIssues.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'registration_accuracy',
            title: 'Improve function registration accuracy',
            description: `${regIssues.length} modules have registration mismatches`,
            affected_modules: regIssues.map(ma => ma.analysis?.module_info?.filename),
            action: 'Update registerModule() calls to match actual functions',
            estimated_effort: 'low'
        });
    }

    // Function collision issues
    if (dependencyAnalysis.function_name_collisions && dependencyAnalysis.function_name_collisions.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'function_collisions',
            title: 'Resolve function name collisions',
            description: `${dependencyAnalysis.function_name_collisions.length} function name collisions detected`,
            action: 'Rename conflicting functions to avoid runtime overrides',
            estimated_effort: 'medium'
        });
    }

    // System architecture improvements
    const moduleCount = moduleAnalyses.length;
    if (moduleCount > 8) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'system_architecture',
            title: 'Consider automated testing for large module system',
            description: `System has ${moduleCount} modules - automated testing recommended`,
            action: 'Implement continuous integration and automated testing',
            estimated_effort: 'high'
        });
    }

    return recommendations;
};

export default {
    analyzeModuleSystem
};