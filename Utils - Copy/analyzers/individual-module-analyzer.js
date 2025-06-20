// ============================================================================
// INDIVIDUAL MODULE ANALYZER
// Deep analysis of single DocDom module files
// ============================================================================

import fs from 'fs';
import chalk from 'chalk';
import { parseModuleFile } from '../core/module-parser.js';
import {
    analyzeRegistrationCompliance,
    analyzeES3Compliance,
    analyzeReservedWordSafety,
    analyzeLoggingCompliance,
    analyzeFunctionArchitecture,
    analyzeInternalDependencies,
    generateFunctionInventory
} from '../core/function-analyzer.js';
import { calculateHealthScore } from '../config/analysis-rules.js';

/**
 * Perform complete analysis of a single module
 * @param {string} filePath - Path to module file
 * @param {Object} options - Analysis options
 * @returns {Object} Complete module analysis
 */
export const analyzeIndividualModule =  (filePath, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔍 Analyzing individual module: ${filePath}`));

    try {
        // Parse module file
        const moduleData = parseModuleFile(filePath);

        if (moduleData.error) {
            throw new Error(`Module parsing failed: ${moduleData.error}`);
        }

        // Read content for additional analysis
        const content = fs.readFileSync(filePath, 'utf8');

        // Perform all analysis types
        const analysis = {
            // Basic module information
            module_info: {
                filename: moduleData.filename,
                version: moduleData.metadata.versionFromFilename,
                file_size_bytes: moduleData.fileSize,
                file_size_kb: moduleData.metadata.fileSizeKB,
                line_count: moduleData.content.lineCount,
                character_count: moduleData.content.characterCount,
                comment_lines: moduleData.content.commentLines,
                blank_lines: moduleData.content.blankLines,
                code_lines: moduleData.content.codeLines,
                last_modified: moduleData.lastModified,
                analysis_timestamp: new Date().toISOString()
            },

            // Function inventory
            function_inventory: generateDetailedFunctionInventory(moduleData.functions),

            // Registration compliance
            registration_compliance: analyzeRegistrationCompliance(
                moduleData.functions,
                moduleData.registration
            ),

            // Code quality analysis
            es3_compliance: analyzeES3Compliance(content),
            reserved_word_safety: analyzeReservedWordSafety(content),
            logging_compliance: analyzeLoggingCompliance(content),
            function_architecture: analyzeFunctionArchitecture(moduleData.functions, content),
            internal_dependencies: analyzeInternalDependencies(moduleData.functions, content),

            // Additional analysis
            module_metadata: analyzeModuleMetadata(moduleData.metadata),
            code_organization: analyzeCodeOrganization(content),
            performance_indicators: analyzePerformanceIndicators(content),
            security_patterns: analyzeSecurityPatterns(content),

            // Analysis timing
            analysis_time_ms: 0
        };

        // Calculate overall health score
        analysis.health_score = calculateModuleHealthScore(analysis);

        analysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ Module analysis complete (${analysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   Health Score: ${analysis.health_score.total_score} (${analysis.health_score.grade})`));
        console.log(chalk.gray(`   Functions: ${analysis.function_inventory.total_count}, ES3: ${analysis.es3_compliance.compliant ? 'Yes' : 'No'}`));

        return {
            success: true,
            analysis,
            filePath,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(chalk.red(`❌ Individual module analysis failed: ${error.message}`));

        return {
            success: false,
            error: error.message,
            filePath,
            timestamp: new Date().toISOString(),
            analysis_time_ms: Date.now() - startTime
        };
    }
};

/**
 * Generate detailed function inventory with categorization
 * @param {Object} functions - Functions data from parser
 * @returns {Object} Detailed function inventory
 */
const generateDetailedFunctionInventory = (functions) => {
    const inventory = generateFunctionInventory(functions);

    // Add detailed signature analysis
    inventory.function_signatures = functions.signatures;

    // Categorize by complexity
    inventory.by_complexity = {
        simple: [],      // No parameters, short
        moderate: [],    // Few parameters, medium length
        complex: []      // Many parameters or long
    };

    // Categorize by purpose (heuristic based on name patterns)
    inventory.by_purpose = {
        utilities: [],        // helper, utility, safe, etc.
        validation: [],       // validate, check, verify, etc.
        processing: [],       // process, parse, analyze, etc.
        generation: [],       // create, generate, build, etc.
        logging: [],          // log, debug, etc.
        export_functions: [], // export, save, write, etc.
        other: []
    };

    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        // Complexity categorization
        const isSimple = func.parameterCount === 0 && func.estimatedLineCount < 20;
        const isComplex = func.parameterCount > 3 || func.estimatedLineCount > 50;

        if (isSimple) {
            inventory.by_complexity.simple.push(func.name);
        } else if (isComplex) {
            inventory.by_complexity.complex.push(func.name);
        } else {
            inventory.by_complexity.moderate.push(func.name);
        }

        // Purpose categorization (heuristic based on naming)
        const name = func.name.toLowerCase();
        if (name.includes('log') || name.includes('debug')) {
            inventory.by_purpose.logging.push(func.name);
        } else if (name.includes('validate') || name.includes('check') || name.includes('verify')) {
            inventory.by_purpose.validation.push(func.name);
        } else if (name.includes('process') || name.includes('parse') || name.includes('analyze')) {
            inventory.by_purpose.processing.push(func.name);
        } else if (name.includes('create') || name.includes('generate') || name.includes('build')) {
            inventory.by_purpose.generation.push(func.name);
        } else if (name.includes('export') || name.includes('save') || name.includes('write')) {
            inventory.by_purpose.export_functions.push(func.name);
        } else if (name.includes('safe') || name.includes('helper') || name.includes('utility')) {
            inventory.by_purpose.utilities.push(func.name);
        } else {
            inventory.by_purpose.other.push(func.name);
        }
    });

    return inventory;
};

/**
 * Analyze module metadata quality
 * @param {Object} metadata - Module metadata
 * @returns {Object} Metadata analysis
 */
const analyzeModuleMetadata = (metadata) => {
    const analysis = {
        completeness_score: 0,
        has_purpose: !!metadata.purpose,
        has_dependencies: !!metadata.dependencies,
        has_size_comment: !!metadata.sizeComment,
        has_version: !!metadata.versionFromFilename,

        issues: [],
        recommendations: []
    };

    // Calculate completeness score
    const checks = [
        analysis.has_purpose,
        analysis.has_dependencies,
        analysis.has_size_comment,
        analysis.has_version
    ];

    analysis.completeness_score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    // Add specific recommendations
    if (!analysis.has_purpose) {
        analysis.issues.push('Missing PURPOSE comment in header');
        analysis.recommendations.push('Add // PURPOSE: description to module header');
    }

    if (!analysis.has_dependencies) {
        analysis.issues.push('Missing DEPENDENCIES comment in header');
        analysis.recommendations.push('Add // DEPENDENCIES: [...] to module header');
    }

    if (!analysis.has_size_comment) {
        analysis.issues.push('Missing SIZE comment in header');
        analysis.recommendations.push('Add // SIZE: ~XXX lines comment to module header');
    }

    return analysis;
};

/**
 * Analyze code organization patterns
 * @param {string} content - Module content
 * @returns {Object} Code organization analysis
 */
const analyzeCodeOrganization = (content) => {
    const analysis = {
        has_section_headers: false,
        section_count: 0,
        has_consistent_indentation: false,
        has_function_grouping: false,
        organization_score: 0,

        sections_found: [],
        issues: []
    };

    // Check for section headers (// ====...)
    const sectionHeaders = content.match(/\/\/ =+/g);
    if (sectionHeaders) {
        analysis.has_section_headers = true;
        analysis.section_count = sectionHeaders.length;

        // Extract section names (heuristic)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.match(/\/\/ =+/)) {
                // Look for section name in nearby lines
                for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
                    const checkLine = lines[i].trim();
                    if (checkLine.startsWith('//') && !checkLine.match(/\/\/ =+/) && checkLine.length > 10) {
                        analysis.sections_found.push(checkLine.replace('//', '').trim());
                        break;
                    }
                }
            }
        });
    }

    // Check indentation consistency (simplified)
    const lines = content.split('\n');
    const indentedLines = lines.filter(line => line.match(/^    \w/) || line.match(/^\t\w/));
    const indentationConsistency = lines.length > 0 ? (indentedLines.length / lines.length) * 100 : 0;
    analysis.has_consistent_indentation = indentationConsistency > 70;

    // Calculate organization score
    const factors = [
        analysis.has_section_headers,
        analysis.section_count >= 3,
        analysis.has_consistent_indentation,
        analysis.sections_found.length > 0
    ];

    analysis.organization_score = Math.round((factors.filter(Boolean).length / factors.length) * 100);

    // Add issues
    if (!analysis.has_section_headers) {
        analysis.issues.push('No section headers found - consider organizing code into sections');
    }

    if (!analysis.has_consistent_indentation) {
        analysis.issues.push('Inconsistent indentation detected');
    }

    return analysis;
};

/**
 * Analyze performance indicators
 * @param {string} content - Module content
 * @returns {Object} Performance analysis
 */
const analyzePerformanceIndicators = (content) => {
    const analysis = {
        potential_issues: [],
        optimizations: [],
        score: 100 // Start with perfect score, subtract for issues
    };

    // Check for nested loops
    const nestedLoopPattern = /for\s*\([^}]*for\s*\(/g;
    const nestedLoops = content.match(nestedLoopPattern);
    if (nestedLoops) {
        analysis.potential_issues.push({
            type: 'nested_loops',
            count: nestedLoops.length,
            description: 'Nested loops detected - may impact performance',
            severity: 'medium'
        });
        analysis.score -= nestedLoops.length * 10;
    }

    // Check for string concatenation in loops
    const stringConcatInLoop = content.match(/for[^}]*\+=/g);
    if (stringConcatInLoop) {
        analysis.potential_issues.push({
            type: 'string_concat_in_loop',
            count: stringConcatInLoop.length,
            description: 'String concatenation in loops - consider StringBuilder pattern',
            severity: 'medium'
        });
        analysis.score -= stringConcatInLoop.length * 15;
    }

    // Check for frequent DOM access patterns
    const domAccess = content.match(/app\./g);
    if (domAccess && domAccess.length > 20) {
        analysis.potential_issues.push({
            type: 'frequent_dom_access',
            count: domAccess.length,
            description: 'Frequent DOM access detected - consider caching references',
            severity: 'low'
        });
        analysis.score -= 5;
    }

    // Look for optimization patterns
    if (content.includes('createStringBuilder')) {
        analysis.optimizations.push('Uses StringBuilder pattern for efficient string building');
        analysis.score += 5;
    }

    if (content.includes('memoryCleanup')) {
        analysis.optimizations.push('Implements memory cleanup patterns');
        analysis.score += 10;
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
};

/**
 * Analyze security patterns
 * @param {string} content - Module content
 * @returns {Object} Security analysis
 */
const analyzeSecurityPatterns = (content) => {
    const analysis = {
        security_issues: [],
        security_measures: [],
        risk_level: 'low',
        score: 100
    };

    // Check for dangerous patterns
    if (content.includes('eval(')) {
        analysis.security_issues.push({
            type: 'eval_usage',
            severity: 'critical',
            description: 'eval() usage detected - can execute arbitrary code'
        });
        analysis.score -= 50;
        analysis.risk_level = 'critical';
    }

    if (content.includes('new Function(')) {
        analysis.security_issues.push({
            type: 'function_constructor',
            severity: 'high',
            description: 'Function constructor usage - can execute arbitrary code'
        });
        analysis.score -= 30;
        if (analysis.risk_level === 'low') analysis.risk_level = 'high';
    }

    // Check for input validation
    if (content.includes('validate') && content.includes('Input')) {
        analysis.security_measures.push('Input validation patterns detected');
        analysis.score += 10;
    }

    if (content.includes('isDangerousProperty')) {
        analysis.security_measures.push('Property access validation implemented');
        analysis.score += 15;
    }

    if (content.includes('try') && content.includes('catch')) {
        analysis.security_measures.push('Error handling implemented');
        analysis.score += 5;
    }

    // Determine final risk level
    if (analysis.security_issues.length === 0) {
        analysis.risk_level = 'low';
    } else if (analysis.security_issues.some(issue => issue.severity === 'critical')) {
        analysis.risk_level = 'critical';
    } else if (analysis.security_issues.some(issue => issue.severity === 'high')) {
        analysis.risk_level = 'high';
    } else {
        analysis.risk_level = 'medium';
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
};

/**
 * Calculate overall module health score
 * @param {Object} analysis - Complete analysis results
 * @returns {Object} Health score calculation
 */
const calculateModuleHealthScore = (analysis) => {
    const penalties = [];
    const bonuses = [];

    // ES3 compliance penalties
    if (analysis.es3_compliance.totalPenalty > 0) {
        penalties.push({
            category: 'es3_compliance',
            value: analysis.es3_compliance.totalPenalty,
            reason: 'ES3 compatibility violations'
        });
    }

    // Reserved word safety penalties
    if (analysis.reserved_word_safety.totalPenalty > 0) {
        penalties.push({
            category: 'reserved_word_safety',
            value: analysis.reserved_word_safety.totalPenalty,
            reason: 'Reserved word safety violations'
        });
    }

    // Registration accuracy penalties
    if (analysis.registration_compliance.accuracyPercentage < 100) {
        const penalty = (100 - analysis.registration_compliance.accuracyPercentage) * 2;
        penalties.push({
            category: 'registration_compliance',
            value: penalty,
            reason: 'Function registration inaccuracies'
        });
    }

    // Logging compliance score
    if (analysis.logging_compliance.score > 0) {
        bonuses.push({
            category: 'logging_compliance',
            value: analysis.logging_compliance.score,
            reason: 'Modern logging compliance'
        });
    } else if (analysis.logging_compliance.score < 0) {
        penalties.push({
            category: 'logging_compliance',
            value: Math.abs(analysis.logging_compliance.score),
            reason: 'Poor logging compliance'
        });
    }

    // Function architecture score
    if (analysis.function_architecture.score > 0) {
        bonuses.push({
            category: 'function_architecture',
            value: analysis.function_architecture.score,
            reason: 'Good function architecture'
        });
    } else if (analysis.function_architecture.score < 0) {
        penalties.push({
            category: 'function_architecture',
            value: Math.abs(analysis.function_architecture.score),
            reason: 'Function architecture issues'
        });
    }

    // Code organization bonuses
    if (analysis.code_organization.organization_score > 80) {
        bonuses.push({
            category: 'code_organization',
            value: 20,
            reason: 'Excellent code organization'
        });
    }

    // Security penalties
    if (analysis.security_patterns.risk_level === 'critical') {
        penalties.push({
            category: 'security',
            value: 200,
            reason: 'Critical security issues'
        });
    } else if (analysis.security_patterns.risk_level === 'high') {
        penalties.push({
            category: 'security',
            value: 100,
            reason: 'High security risk'
        });
    }

    return calculateHealthScore(penalties, bonuses);
};

export default {
    analyzeIndividualModule
};