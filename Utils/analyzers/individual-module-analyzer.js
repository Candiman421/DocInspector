// analyzers/individual-module-analyzer.js
// INDIVIDUAL MODULE ANALYZER - FIXED VERSION
// EVIDENCE-BASED HEALTH SCORING - NO MORE 1000/1000 FOR BROKEN MODULES
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
import { 
    calculateHealthScore, 
    CONFIDENCE_LEVELS,
    SEVERITY_CLASSIFICATION 
} from '../config/analysis-rules.js';

/**
 * FIXED - Perform complete analysis of a single module with accurate health scoring
 * NO MORE FALSE A+ GRADES FOR BROKEN MODULES
 * @param {string} filePath - Path to module file
 * @param {Object} options - Analysis options
 * @returns {Object} Complete module analysis with accurate health scoring
 */
export const analyzeIndividualModule = (filePath, options = {}) => {
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

        // Perform all analysis types with confidence scoring
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

            // FIXED - Registration compliance with proper penalty application
            registration_compliance: analyzeRegistrationCompliance(
                moduleData.functions,
                moduleData.registration
            ),

            // FIXED - Code quality analysis with context-aware detection
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

        // CRITICAL - Calculate health score with proper penalty application
        analysis.health_score = calculateModuleHealthScore(analysis);

        analysis.analysis_time_ms = Date.now() - startTime;

        // ENHANCED - Validation against known patterns
        const validationResult = validateAnalysisAccuracy(analysis, content);
        if (validationResult.warnings.length > 0) {
            console.warn(chalk.yellow(`⚠️  Analysis validation warnings: ${validationResult.warnings.length}`));
        }

        console.log(chalk.green(`✅ Module analysis complete (${analysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   Health Score: ${analysis.health_score.total_score} (${analysis.health_score.grade})`));
        console.log(chalk.gray(`   Functions: ${analysis.function_inventory.total_count}, ES3: ${analysis.es3_compliance.compliant ? 'Yes' : 'No'}`));
        console.log(chalk.gray(`   Violations: ${analysis.health_score.violations_count} total, ${analysis.health_score.high_confidence_violations} high confidence`));

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
 * ENHANCED - Generate detailed function inventory with categorization
 * @param {Object} functions - Functions data from parser
 * @returns {Object} Detailed function inventory
 */
const generateDetailedFunctionInventory = (functions) => {
    const inventory = generateFunctionInventory(functions);

    // Add detailed signature analysis
    inventory.function_signatures = functions.signatures;

    // Categorize by complexity with better thresholds
    inventory.by_complexity = {
        simple: [],      // 0-1 parameters, <20 lines
        moderate: [],    // 2-3 parameters, 20-50 lines
        complex: []      // 4+ parameters or >50 lines
    };

    // Categorize by purpose (enhanced heuristics)
    inventory.by_purpose = {
        utilities: [],        // helper, utility, safe, etc.
        validation: [],       // validate, check, verify, etc.
        processing: [],       // process, parse, analyze, etc.
        generation: [],       // create, generate, build, etc.
        logging: [],          // log, debug, etc.
        export_functions: [], // export, save, write, etc.
        registration: [],     // register, declare, etc.
        other: []
    };

    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        // ENHANCED - Complexity categorization with better metrics
        const isSimple = func.parameterCount <= 1 && func.estimatedLineCount < 20;
        const isComplex = func.parameterCount > 3 || func.estimatedLineCount > 50;

        if (isSimple) {
            inventory.by_complexity.simple.push(func.name);
        } else if (isComplex) {
            inventory.by_complexity.complex.push(func.name);
        } else {
            inventory.by_complexity.moderate.push(func.name);
        }

        // ENHANCED - Purpose categorization with better patterns
        const name = func.name.toLowerCase();
        if (name.includes('log') || name.includes('debug')) {
            inventory.by_purpose.logging.push(func.name);
        } else if (name.includes('validate') || name.includes('check') || name.includes('verify') || name.includes('is') && name.length > 4) {
            inventory.by_purpose.validation.push(func.name);
        } else if (name.includes('process') || name.includes('parse') || name.includes('analyze') || name.includes('extract')) {
            inventory.by_purpose.processing.push(func.name);
        } else if (name.includes('create') || name.includes('generate') || name.includes('build') || name.includes('make')) {
            inventory.by_purpose.generation.push(func.name);
        } else if (name.includes('export') || name.includes('save') || name.includes('write') || name.includes('output')) {
            inventory.by_purpose.export_functions.push(func.name);
        } else if (name.includes('register') || name.includes('declare') || name.includes('define')) {
            inventory.by_purpose.registration.push(func.name);
        } else if (name.includes('safe') || name.includes('helper') || name.includes('utility') || name.includes('get') || name.includes('set')) {
            inventory.by_purpose.utilities.push(func.name);
        } else {
            inventory.by_purpose.other.push(func.name);
        }
    });

    return inventory;
};

/**
 * ENHANCED - Analyze module metadata quality
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

    // Add specific recommendations with priorities
    if (!analysis.has_purpose) {
        analysis.issues.push('Missing PURPOSE comment in header');
        analysis.recommendations.push({
            priority: 'LOW',
            action: 'Add // PURPOSE: description to module header',
            effort: 'minimal'
        });
    }

    if (!analysis.has_dependencies) {
        analysis.issues.push('Missing DEPENDENCIES comment in header');
        analysis.recommendations.push({
            priority: 'MEDIUM',
            action: 'Add // DEPENDENCIES: [...] to module header',
            effort: 'low'
        });
    }

    if (!analysis.has_size_comment) {
        analysis.issues.push('Missing SIZE comment in header');
        analysis.recommendations.push({
            priority: 'LOW',
            action: 'Add // SIZE: ~XXX lines comment to module header',
            effort: 'minimal'
        });
    }

    return analysis;
};

/**
 * ENHANCED - Analyze code organization patterns
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

        // Extract section names (enhanced heuristics)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.match(/\/\/ =+/)) {
                // Look for section name in nearby lines with better detection
                for (let i = Math.max(0, index - 3); i <= Math.min(lines.length - 1, index + 3); i++) {
                    const checkLine = lines[i].trim();
                    if (checkLine.startsWith('//') && !checkLine.match(/\/\/ =+/) && checkLine.length > 10) {
                        const sectionName = checkLine.replace(/^\/\/\s*/, '').trim();
                        if (sectionName && !analysis.sections_found.includes(sectionName)) {
                            analysis.sections_found.push(sectionName);
                        }
                        break;
                    }
                }
            }
        });
    }

    // Check indentation consistency (improved detection)
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const indentedLines = nonEmptyLines.filter(line => line.match(/^(\s{4}|\t)/));
    const indentationConsistency = nonEmptyLines.length > 0 ? (indentedLines.length / nonEmptyLines.length) * 100 : 0;
    analysis.has_consistent_indentation = indentationConsistency > 60;

    // Check for function grouping patterns
    const functions = content.match(/^[\s]*function\s+/gm) || [];
    const sectionSeparators = content.match(/\/\/ =+/g) || [];
    analysis.has_function_grouping = functions.length > 3 && sectionSeparators.length >= 2;

    // Calculate organization score with better weighting
    const factors = [
        analysis.has_section_headers,
        analysis.section_count >= 3,
        analysis.has_consistent_indentation,
        analysis.has_function_grouping,
        analysis.sections_found.length > 0
    ];

    analysis.organization_score = Math.round((factors.filter(Boolean).length / factors.length) * 100);

    // Add issues with priorities
    if (!analysis.has_section_headers) {
        analysis.issues.push({
            type: 'missing_section_headers',
            description: 'No section headers found - consider organizing code into sections',
            priority: 'LOW'
        });
    }

    if (!analysis.has_consistent_indentation) {
        analysis.issues.push({
            type: 'inconsistent_indentation',
            description: 'Inconsistent indentation detected',
            priority: 'LOW'
        });
    }

    return analysis;
};

/**
 * ENHANCED - Analyze performance indicators
 * @param {string} content - Module content
 * @returns {Object} Performance analysis
 */
const analyzePerformanceIndicators = (content) => {
    const analysis = {
        potential_issues: [],
        optimizations: [],
        score: 100 // Start with perfect score, subtract for issues
    };

    // Check for nested loops with context verification
    const nestedLoopPattern = /for\s*\([^{}]*\{[^{}]*for\s*\(/g;
    const nestedLoops = [...content.matchAll(nestedLoopPattern)];
    if (nestedLoops.length > 0) {
        analysis.potential_issues.push({
            type: 'nested_loops',
            count: nestedLoops.length,
            description: 'Nested loops detected - may impact performance with large datasets',
            severity: 'MEDIUM',
            confidence: CONFIDENCE_LEVELS.HIGH,
            locations: nestedLoops.map(match => getLineNumber(content, match.index))
        });
        analysis.score -= nestedLoops.length * 15;
    }

    // Check for string concatenation in loops with better detection
    const stringConcatPattern = /for\s*\([^{}]*\{[^{}]*[\w\s]*\+\s*=/g;
    const stringConcatInLoop = [...content.matchAll(stringConcatPattern)];
    if (stringConcatInLoop.length > 0) {
        analysis.potential_issues.push({
            type: 'string_concat_in_loop',
            count: stringConcatInLoop.length,
            description: 'String concatenation in loops - consider arrayJoin() pattern',
            severity: 'MEDIUM',
            confidence: CONFIDENCE_LEVELS.MEDIUM,
            locations: stringConcatInLoop.map(match => getLineNumber(content, match.index)),
            fix_suggestion: 'Use array.push() in loop, then array.join() after'
        });
        analysis.score -= stringConcatInLoop.length * 20;
    }

    // Check for frequent DOM access patterns (ExtendScript specific)
    const domAccessPattern = /app\./g;
    const domAccess = [...content.matchAll(domAccessPattern)];
    if (domAccess.length > 30) {
        analysis.potential_issues.push({
            type: 'frequent_dom_access',
            count: domAccess.length,
            description: 'Frequent app object access - consider caching references',
            severity: 'LOW',
            confidence: CONFIDENCE_LEVELS.MEDIUM,
            fix_suggestion: 'Cache app references in variables at function start'
        });
        analysis.score -= 10;
    }

    // Look for optimization patterns (bonuses)
    if (content.includes('createStringBuilder') || content.includes('arrayJoin')) {
        analysis.optimizations.push('Uses efficient string building patterns');
        analysis.score += 10;
    }

    if (content.includes('memoryCleanup') || content.match(/\w+\s*=\s*null/g)) {
        analysis.optimizations.push('Implements memory cleanup patterns');
        analysis.score += 15;
    }

    // Check for algorithm efficiency patterns
    if (content.includes('indexOf') && content.includes('for')) {
        // Potential O(n²) pattern
        const indexOfInLoop = content.match(/for[^{}]*indexOf/g);
        if (indexOfInLoop && indexOfInLoop.length > 0) {
            analysis.potential_issues.push({
                type: 'inefficient_search',
                count: indexOfInLoop.length,
                description: 'indexOf() in loop - consider using object/map for O(1) lookup',
                severity: 'MEDIUM',
                confidence: CONFIDENCE_LEVELS.HIGH,
                fix_suggestion: 'Use object properties for faster lookups'
            });
            analysis.score -= 25;
        }
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
};

/**
 * ENHANCED - Analyze security patterns
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

    // Check for dangerous patterns with context verification
    const evalPattern = /\beval\s*\(/g;
    const evalUsage = [...content.matchAll(evalPattern)];
    if (evalUsage.length > 0) {
        // Verify not in comments
        const realEvalUsage = evalUsage.filter(match => 
            !isInCommentOrString(content, match.index)
        );
        
        if (realEvalUsage.length > 0) {
            analysis.security_issues.push({
                type: 'eval_usage',
                severity: 'CRITICAL',
                confidence: CONFIDENCE_LEVELS.CERTAIN,
                count: realEvalUsage.length,
                description: 'eval() usage detected - can execute arbitrary code',
                locations: realEvalUsage.map(match => getLineNumber(content, match.index))
            });
            analysis.score -= 60;
            analysis.risk_level = 'critical';
        }
    }

    const functionConstructorPattern = /new\s+Function\s*\(/g;
    const constructorUsage = [...content.matchAll(functionConstructorPattern)];
    if (constructorUsage.length > 0) {
        const realUsage = constructorUsage.filter(match => 
            !isInCommentOrString(content, match.index)
        );
        
        if (realUsage.length > 0) {
            analysis.security_issues.push({
                type: 'function_constructor',
                severity: 'HIGH',
                confidence: CONFIDENCE_LEVELS.CERTAIN,
                count: realUsage.length,
                description: 'Function constructor usage - can execute arbitrary code',
                locations: realUsage.map(match => getLineNumber(content, match.index))
            });
            analysis.score -= 40;
            if (analysis.risk_level === 'low') analysis.risk_level = 'high';
        }
    }

    // Check for positive security measures
    if (content.includes('validate') && content.includes('Input')) {
        analysis.security_measures.push('Input validation patterns detected');
        analysis.score += 15;
    }

    if (content.includes('isDangerousProperty') || content.includes('validateEnvironment')) {
        analysis.security_measures.push('Environment safety validation implemented');
        analysis.score += 20;
    }

    if (content.includes('try') && content.includes('catch')) {
        analysis.security_measures.push('Error handling implemented (reduces crash risk)');
        analysis.score += 10;
    }

    // ExtendScript-specific security checks
    if (content.includes('app.quit') || content.includes('application.quit')) {
        analysis.security_issues.push({
            type: 'application_termination',
            severity: 'HIGH',
            confidence: CONFIDENCE_LEVELS.HIGH,
            description: 'Application termination calls detected - dangerous in scripts',
            fix_suggestion: 'Remove app.quit() calls to prevent accidental application closure'
        });
        analysis.score -= 30;
        if (analysis.risk_level === 'low') analysis.risk_level = 'high';
    }

    // Determine final risk level
    if (analysis.security_issues.length === 0) {
        analysis.risk_level = 'low';
    } else if (analysis.security_issues.some(issue => issue.severity === 'CRITICAL')) {
        analysis.risk_level = 'critical';
    } else if (analysis.security_issues.some(issue => issue.severity === 'HIGH')) {
        analysis.risk_level = 'high';
    } else {
        analysis.risk_level = 'medium';
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
};

/**
 * FIXED - Calculate overall module health score with proper penalty application
 * THIS IS THE CRITICAL FIX - No more 1000/1000 for broken modules
 * @param {Object} analysis - Complete analysis results
 * @returns {Object} Health score calculation
 */
const calculateModuleHealthScore = (analysis) => {
    const violations = [];
    const bonuses = [];

    // CRITICAL - ES3 compliance violations (these CRASH ExtendScript)
    if (analysis.es3_compliance.violations && analysis.es3_compliance.violations.length > 0) {
        analysis.es3_compliance.violations.forEach(violation => {
            violations.push({
                category: 'es3_compliance',
                type: violation.type,
                severity: 'CRITICAL',
                confidence: violation.confidence || CONFIDENCE_LEVELS.MEDIUM,
                penalty: violation.penalty || 100,
                description: violation.description,
                locations: violation.line ? [violation.line] : []
            });
        });
    }

    // CRITICAL - Reserved word safety violations  
    if (analysis.reserved_word_safety.violations && analysis.reserved_word_safety.violations.length > 0) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            violations.push({
                category: 'reserved_word_safety',
                type: violation.type,
                severity: violation.critical ? 'CRITICAL' : 'HIGH',
                confidence: violation.confidence || CONFIDENCE_LEVELS.MEDIUM,
                penalty: violation.penalty || 150,
                description: violation.description,
                locations: violation.line ? [violation.line] : []
            });
        });
    }

    // HIGH - Registration accuracy violations
    if (analysis.registration_compliance.accuracyPercentage < 100) {
        const inaccuracyPenalty = (100 - analysis.registration_compliance.accuracyPercentage) * 3;
        violations.push({
            category: 'registration_compliance',
            type: 'inaccurate_registration',
            severity: analysis.registration_compliance.accuracyPercentage < 80 ? 'CRITICAL' : 'HIGH',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            penalty: inaccuracyPenalty,
            description: `Function registration ${analysis.registration_compliance.accuracyPercentage}% accurate`,
            locations: []
        });
    }

    // MEDIUM/HIGH - Logging compliance issues
    if (analysis.logging_compliance.violations && analysis.logging_compliance.violations.length > 0) {
        analysis.logging_compliance.violations.forEach(violation => {
            violations.push({
                category: 'logging_compliance',
                type: violation.type,
                severity: violation.severity || 'MEDIUM',
                confidence: violation.confidence || CONFIDENCE_LEVELS.MEDIUM,
                penalty: violation.penalty || 25,
                description: violation.fix || violation.description
            });
        });
    }

    // MEDIUM - Function architecture issues
    if (analysis.function_architecture.oversizedFunctions && analysis.function_architecture.oversizedFunctions.length > 0) {
        analysis.function_architecture.oversizedFunctions.forEach(func => {
            violations.push({
                category: 'function_architecture',
                type: 'oversized_function',
                severity: func.severity === 'critical' ? 'HIGH' : 'MEDIUM',
                confidence: CONFIDENCE_LEVELS.CERTAIN,
                penalty: func.penalty || 50,
                description: `Function '${func.name}' is too large (${func.lines} lines)`
            });
        });
    }

    // HIGH - Security issues
    if (analysis.security_patterns.security_issues && analysis.security_patterns.security_issues.length > 0) {
        analysis.security_patterns.security_issues.forEach(issue => {
            violations.push({
                category: 'security',
                type: issue.type,
                severity: issue.severity || 'HIGH',
                confidence: issue.confidence || CONFIDENCE_LEVELS.HIGH,
                penalty: issue.severity === 'CRITICAL' ? 200 : 100,
                description: issue.description
            });
        });
    }

    // MEDIUM - Performance issues
    if (analysis.performance_indicators.potential_issues && analysis.performance_indicators.potential_issues.length > 0) {
        analysis.performance_indicators.potential_issues.forEach(issue => {
            if (issue.severity === 'MEDIUM' || issue.severity === 'HIGH') {
                violations.push({
                    category: 'performance',
                    type: issue.type,
                    severity: issue.severity,
                    confidence: issue.confidence || CONFIDENCE_LEVELS.MEDIUM,
                    penalty: issue.severity === 'HIGH' ? 75 : 40,
                    description: issue.description
                });
            }
        });
    }

    // BONUSES for good practices
    if (analysis.function_architecture.functionsWithErrorHandling > 0) {
        bonuses.push({
            category: 'error_handling',
            value: analysis.function_architecture.functionsWithErrorHandling * 5,
            description: 'Functions with error handling'
        });
    }

    if (analysis.function_architecture.functionsWithLogging > 0) {
        bonuses.push({
            category: 'logging_coverage',
            value: analysis.function_architecture.functionsWithLogging * 3,
            description: 'Functions with logging'
        });
    }

    if (analysis.logging_compliance.modernCalls > 0) {
        bonuses.push({
            category: 'modern_logging',
            value: analysis.logging_compliance.modernCalls * 2,
            description: 'Modern logging calls'
        });
    }

    if (analysis.code_organization.organization_score > 80) {
        bonuses.push({
            category: 'organization',
            value: 25,
            description: 'Excellent code organization'
        });
    }

    if (analysis.performance_indicators.optimizations && analysis.performance_indicators.optimizations.length > 0) {
        bonuses.push({
            category: 'performance_optimizations',
            value: analysis.performance_indicators.optimizations.length * 10,
            description: 'Performance optimization patterns'
        });
    }

    // CRITICAL - Use the fixed calculateHealthScore function
    return calculateHealthScore(violations, bonuses, 1000);
};

/**
 * ENHANCED - Validate analysis accuracy against known patterns
 * @param {Object} analysis - Complete analysis
 * @param {string} content - Original content
 * @returns {Object} Validation result
 */
const validateAnalysisAccuracy = (analysis, content) => {
    const validation = {
        warnings: [],
        confidence_issues: [],
        accuracy_score: 100
    };

    // Check for suspiciously high health scores with violations
    if (analysis.health_score.total_score > 950 && analysis.es3_compliance.violations.length > 0) {
        validation.warnings.push('High health score despite ES3 violations - check penalty calculation');
        validation.accuracy_score -= 20;
    }

    // Check for low confidence violations that might be false positives
    let lowConfidenceCount = 0;
    [
        ...(analysis.es3_compliance.violations || []),
        ...(analysis.reserved_word_safety.violations || [])
    ].forEach(violation => {
        if (violation.confidence < CONFIDENCE_LEVELS.MEDIUM) {
            lowConfidenceCount++;
            validation.confidence_issues.push({
                type: violation.type,
                confidence: violation.confidence,
                description: 'Low confidence violation - manual review recommended'
            });
        }
    });

    if (lowConfidenceCount > 3) {
        validation.warnings.push(`${lowConfidenceCount} low confidence violations detected`);
        validation.accuracy_score -= 10;
    }

    // Validate against known good patterns (DocDom v4.1 style)
    const knownGoodPatterns = [
        /var\s+\w+\s*=\s*\{/, // var obj = { - valid ES3
        /function\s+\w+/,     // function declarations - valid ES3
        /\w+\[\w+\]\s*=/     // obj[prop] = value - valid ES3
    ];

    let falsePositiveRisk = 0;
    knownGoodPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            // Check if we flagged valid ES3 patterns
            const relatedViolations = analysis.es3_compliance.violations.filter(v => 
                v.type.includes('destructuring') || v.type.includes('object')
            );
            if (relatedViolations.length > 0) {
                falsePositiveRisk++;
            }
        }
    });

    if (falsePositiveRisk > 0) {
        validation.warnings.push('Possible false positives detected in ES3 compliance');
        validation.accuracy_score -= falsePositiveRisk * 15;
    }

    return validation;
};

/**
 * Helper function to get line number from character position
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Line number
 */
const getLineNumber = (content, position) => {
    if (position < 0 || position >= content.length) return 1;
    const beforePosition = content.substring(0, position);
    return beforePosition.split('\n').length;
};

/**
 * Helper function to check if position is in comment or string
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {boolean} True if in comment or string
 */
const isInCommentOrString = (content, position) => {
    const beforePosition = content.substring(0, position);
    
    // Check for single-line comment
    const lastNewline = beforePosition.lastIndexOf('\n');
    const afterNewline = beforePosition.substring(lastNewline);
    if (afterNewline.indexOf('//') !== -1) {
        return true;
    }
    
    // Check for multi-line comment
    const lastCommentStart = beforePosition.lastIndexOf('/*');
    const lastCommentEnd = beforePosition.lastIndexOf('*/');
    if (lastCommentStart > lastCommentEnd) {
        return true;
    }
    
    // Check for string literals
    const doubleQuotes = (beforePosition.match(/"/g) || []).length;
    const singleQuotes = (beforePosition.match(/'/g) || []).length;
    
    return (doubleQuotes % 2 === 1) || (singleQuotes % 2 === 1);
};

export default {
    analyzeIndividualModule
};