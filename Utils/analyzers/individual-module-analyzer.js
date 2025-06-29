// analyzers/individual-module-analyzer.js
// INDIVIDUAL MODULE ANALYZER - TARGETED FIXES ONLY
// SURGICAL UPDATES: Registration detection, function inventory, error handling
// PRESERVES: All existing working functionality, structure, and helper functions
// ============================================================================

import fs from 'fs';
import path from 'path';
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

// ADDED: Import enhanced capabilities for targeted fixes
import { PATTERN_UTILS } from '../config/patterns.js';

/**
 * Prepare function objects for similarity analysis with proper error recovery
 * Ensures all required properties are present for analysis
 * 
 * @param {Object} moduleData - Parsed module data
 * @param {string} filePath - File path for source property
 * @returns {Array} Function objects with required properties for similarity analysis
 */
const prepareFunctionsForSimilarityAnalysis = (moduleData, filePath) => {
    try {
        if (!moduleData.functions || !moduleData.functions.list) {
            return [];
        }

        return moduleData.functions.list.map(func => ({
            // Required properties for similarity analysis
            name: func.name || 'unknown',
            source: filePath,
            signature: func.signature || '',
            content: func.content || '',
            parameters: func.parameters || [],
            calls: func.calls || [],
            
            // Additional metadata for analysis
            lineCount: func.lineCount || 0,
            hasErrorHandling: func.hasErrorHandling || false,
            hasLogging: func.hasLogging || false,
            complexity: func.complexity || 'low'
        }));

    } catch (error) {
        console.error('Error preparing functions for similarity analysis:', error.message);
        return [];
    }
};

/**
 * Analyze individual module with proper path validation and error handling
 * Prevents undefined path errors and provides comprehensive module analysis
 * 
 * @param {string} moduleFile - Module filename to analyze
 * @param {string} folderPath - Path to folder containing the module
 * @param {Object} options - Analysis options
 * @returns {Object} Complete module analysis result
 */
export const analyzeIndividualModule = (moduleFile, folderPath, options = {}) => {
    const startTime = Date.now();
    
    // Critical validation to prevent undefined path errors
    if (!moduleFile || !folderPath) {
        console.error('❌ Invalid module file or folder path:', { moduleFile, folderPath });
        return {
            success: false,
            error: 'Invalid module file or folder path provided',
            filename: moduleFile || 'unknown',
            parseTime: 0
        };
    }

    const fullPath = path.join(folderPath, moduleFile);
    
    // Verify file exists before proceeding
    if (!fs.existsSync(fullPath)) {
        console.error('❌ Module file does not exist:', fullPath);
        return {
            success: false,
            error: `Module file does not exist: ${fullPath}`,
            filename: moduleFile,
            parseTime: 0
        };
    }

    try {
        console.log(chalk.cyan(`📋 Analyzing: ${moduleFile}`));

        // Parse module file
        const moduleData = parseModuleFile(fullPath);
        
        // Ensure moduleData is valid
        if (!moduleData || !moduleData.filename) {
            return {
                success: false,
                error: 'Failed to parse module data',
                filename: moduleFile,
                parseTime: Date.now() - startTime
            };
        }

        // Perform comprehensive analysis
        const analysis = {
            success: true,
            filename: moduleData.filename,
            filePath: fullPath,
            parseTime: Date.now() - startTime,
            
            // Core module information
            metadata: moduleData.metadata,
            functions: moduleData.functions,
            registration: moduleData.registration,
            dependencies: moduleData.dependencies,
            content: moduleData.content,
            quality: moduleData.quality,

            // Detailed compliance analysis
            es3_compliance: analyzeES3Compliance(moduleData.content, moduleData),
            reserved_word_safety: analyzeReservedWordSafety(moduleData.content, moduleData),
            registration_compliance: analyzeRegistrationCompliance(moduleData),
            logging_compliance: analyzeLoggingCompliance(moduleData.content, moduleData),
            function_architecture: analyzeFunctionArchitecture(moduleData.functions, moduleData),
            internal_dependencies: analyzeInternalDependencies(moduleData.functions, moduleData),

            // Generate function inventory for similarity analysis
            function_inventory: generateFunctionInventory(moduleData),

            // Calculate overall health score
            health_score: calculateHealthScore({
                es3_compliance: analysis?.es3_compliance,
                reserved_word_safety: analysis?.reserved_word_safety,
                registration_compliance: analysis?.registration_compliance,
                logging_compliance: analysis?.logging_compliance,
                function_architecture: analysis?.function_architecture,
                internal_dependencies: analysis?.internal_dependencies
            }, CONFIDENCE_LEVELS.HIGH)
        };

        // Prepare functions for similarity analysis with proper source attribution
        analysis.similarity_functions = prepareFunctionsForSimilarityAnalysis(moduleData, fullPath);

        console.log(chalk.green(`✅ ${moduleFile} analyzed successfully`));
        return analysis;

    } catch (error) {
        console.error('❌ Module analysis failed:', error.message);
        return {
            success: false,
            error: error.message,
            filename: moduleFile,
            parseTime: Date.now() - startTime
        };
    }
};

/**
 * PRESERVED - Generate detailed function inventory with categorization
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
 * PRESERVED - Analyze module metadata quality
 * @param {Object} metadata - Module metadata
 * @returns {Object} Metadata analysis
 */
const analyzeModuleMetadata = (metadata) => {
    const analysis = {
        completeness_score: 0,
        has_purpose: !!metadata.purpose,
        has_dependencies: !!metadata.dependencies,
        has_size_comment: !!metadata.sizeComment,
        has_version: !!metadata.version,
        has_name: !!metadata.name
    };

    // Calculate completeness score
    const fields = ['purpose', 'dependencies', 'sizeComment', 'version', 'name'];
    const presentFields = fields.filter(field => !!metadata[field]);
    analysis.completeness_score = Math.round((presentFields.length / fields.length) * 100);

    analysis.present_fields = presentFields;
    analysis.missing_fields = fields.filter(field => !metadata[field]);

    return analysis;
};

/**
 * PRESERVED - Analyze code organization patterns
 * @param {string} content - File content
 * @returns {Object} Organization analysis
 */
const analyzeCodeOrganization = (content) => {
    const organizationMetrics = {
        has_header: /^\/\/.*/.test(content),
        has_sections: content.includes('// ===') || content.includes('// ---'),
        function_grouping: /\/\/.*functions?/i.test(content),
        has_constants: /var\s+[A-Z_]+\s*=/.test(content),
        proper_spacing: content.includes('\n\n')
    };

    const score = Object.values(organizationMetrics).filter(Boolean).length * 20;
    
    return {
        organization_score: score,
        metrics: organizationMetrics,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
    };
};

/**
 * PRESERVED - Analyze performance indicators
 * @param {string} content - File content
 * @returns {Object} Performance analysis
 */
const analyzePerformanceIndicators = (content) => {
    const performanceMetrics = {
        has_caching: /cache|Cache/.test(content),
        has_timeouts: /setTimeout|setInterval/.test(content),
        has_optimization: /optimize|Optimize/.test(content),
        avoids_eval: !content.includes('eval('),
        efficient_loops: !/for.*in.*length/.test(content)
    };

    const score = Object.values(performanceMetrics).filter(Boolean).length * 20;
    
    return {
        performance_score: score,
        metrics: performanceMetrics,
        recommendations: score < 60 ? ['Consider adding caching', 'Optimize loops', 'Add timeout handling'] : []
    };
};

/**
 * PRESERVED - Analyze security patterns
 * @param {string} content - File content
 * @returns {Object} Security analysis
 */
const analyzeSecurityPatterns = (content) => {
    const securityMetrics = {
        no_eval: !content.includes('eval('),
        no_innerHTML: !content.includes('innerHTML'),
        has_validation: /validate|check|verify/i.test(content),
        safe_parsing: /JSON\.parse/.test(content) && /try.*catch/.test(content),
        proper_escaping: /escape|encode/i.test(content)
    };

    const score = Object.values(securityMetrics).filter(Boolean).length * 20;
    
    return {
        security_score: score,
        metrics: securityMetrics,
        vulnerabilities: score < 60 ? ['Potential XSS risks', 'Missing input validation'] : []
    };
};

/**
 * PRESERVED - Validate analysis accuracy using cross-referencing
 * @param {Object} analysis - Analysis results
 * @param {string} content - Original content
 * @returns {Object} Validation results
 */
const validateAnalysisAccuracy = (analysis, content) => {
    const validation = {
        warnings: [],
        accuracy_score: 100,
        cross_references: {}
    };

    // Cross-reference function counts
    const registeredCount = analysis.registration_compliance?.registeredFunctions?.length || 0;
    const inventoryCount = analysis.function_inventory?.total_count || 0;
    const architectureCount = analysis.function_architecture?.functionCount || 0;

    if (Math.abs(registeredCount - inventoryCount) > 2) {
        validation.warnings.push({
            type: 'function_count_mismatch',
            description: `Registration count (${registeredCount}) differs significantly from inventory count (${inventoryCount})`,
            severity: 'medium'
        });
        validation.accuracy_score -= 10;
    }

    // Detect systematic false positives (like universal 0% registration accuracy)
    if (registeredCount === 0 && inventoryCount > 0) {
        validation.warnings.push({
            type: 'potential_registration_parser_failure',
            description: 'Registration parser may have failed - found functions but no registration',
            severity: 'high'
        });
        validation.accuracy_score -= 20;
    }

    // Check for ES3 violations that seem like false positives
    const es3Violations = analysis.es3_compliance?.violations || [];
    const reservedViolations = analysis.reserved_word_safety?.violations || [];
    
    if (es3Violations.length > 10 || reservedViolations.length > 10) {
        validation.warnings.push({
            type: 'potential_false_positives',
            description: 'High number of ES3/reserved word violations may indicate false positives',
            severity: 'medium'
        });
    }

    // Calculate false positive risk score
    const falsePositiveRisk = Math.min(es3Violations.length + reservedViolations.length, 20) / 20;
    if (falsePositiveRisk > 0.3) {
        validation.accuracy_score -= falsePositiveRisk * 15;
    }

    return validation;
};

/**
 * PRESERVED - Calculate grade from health score
 * @param {number} score - Health score
 * @returns {string} Letter grade
 */
const calculateGrade = (score) => {
    if (score >= 950) return 'A+';
    if (score >= 900) return 'A';
    if (score >= 850) return 'B+';
    if (score >= 800) return 'B';
    if (score >= 750) return 'C+';
    if (score >= 700) return 'C';
    if (score >= 600) return 'D';
    return 'F';
};

/**
 * PRESERVED - Create basic function inventory from module data when full inventory fails
 * @param {Object} moduleData - Parsed module data
 * @returns {Object} Basic function inventory
 */
const createBasicFunctionInventory = (moduleData) => {
    const functions = moduleData.functions || {};
    
    return {
        total_count: functions.total || 0,
        globalCount: functions.globalFunctions?.length || 0,
        nestedCount: functions.nestedFunctions?.length || 0,
        withParameters: functions.globalFunctions?.filter(f => f.parameterCount > 0) || [],
        withoutParameters: functions.globalFunctions?.filter(f => f.parameterCount === 0) || [],
        withErrorHandling: functions.globalFunctions?.filter(f => f.hasErrorHandling) || [],
        withLogging: functions.globalFunctions?.filter(f => f.hasLogging) || [],
        signatures: functions.signatures || [],
        similarity_analysis: { skipped: true, reason: 'Fallback inventory used' },
        fallback_used: true,
        source_data: 'module_parser'
    };
};

/**
 * PRESERVED - Helper function to get line number from character position
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
 * PRESERVED - Helper function to check if position is in comment or string
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