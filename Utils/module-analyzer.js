#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// DOCDOM MODULE ANALYZER CONFIGURATION
// ============================================================================

const ANALYZER_CONFIG = {
    // File pattern matching - supports multi-level decimal notation
    FILE_PATTERN: /^(\d+(\.\d+){0,3})_.*\.jsx?$/,
    
    // Folders to exclude from scanning
    EXCLUDED_FOLDERS: [
        'node_modules', '.git', '.vscode', 'Utils', 'UtilsOutput',
        'build', 'dist', 'temp', '.tmp'
    ],
    
    // Files to exclude from analysis
    EXCLUDED_FILES: [
        /.*_ASSEMBLED_.*\.jsx$/,
        /.*_INCLUDES_.*\.jsx$/,
        /^~analysis-.*\.yaml$/,
        /\.bak$/, /\.old$/, /\.backup$/
    ],
    
    // Analysis options
    options: {
        DETAILED_FUNCTION_ANALYSIS: true,
        CHECK_REGISTRATION_COMPLIANCE: true,
        APPLY_QUALITY_RULES: true,
        GENERATE_COMPARISON_REPORTS: true,
        INCLUDE_CODE_SNIPPETS: false,
        VERBOSE_OUTPUT: true,
        ANALYZE_CODE_DUPLICATION: true,
        CHECK_NAMING_CONVENTIONS: true,
        DETECT_PERFORMANCE_PATTERNS: true,
        VALIDATE_CONFIGURATIONS: true,
        ANALYZE_COMMENT_QUALITY: true,
        CHECK_SECURITY_PATTERNS: true,
        DETECT_FUNCTION_SIMILARITY: true,      // NEW: Function duplication detection
        VALIDATE_DEPENDENCY_FLOW: true,       // NEW: Dependency direction validation
        CROSS_MODULE_ANALYSIS: true,          // NEW: Cross-module duplicate detection
        SIMILARITY_THRESHOLD: 75              // NEW: Percentage threshold for similarity
    }
};

// ============================================================================
// ARCHITECTURE-SPECIFIC QUALITY RULES
// ============================================================================

const QUALITY_RULES = {
    // ES3 Compatibility Rules
    es3_compliance: {
        forbidden_keywords: ['const', 'let', 'class', 'import', 'export', 'async', 'await'],
        forbidden_features: ['arrow functions', 'template literals', 'destructuring', 'spread operator'],
        penalty_per_violation: 50,
        critical: true
    },
    
    // Reserved Word Safety
    reserved_word_safety: {
        dangerous_property_names: ['export', 'import', 'class', 'const', 'let'],
        extendscript_crashers: ['export'],  // These crash ExtendScript
        penalty_per_violation: 100,
        critical: true
    },
    
    // Dependency Architecture
    dependency_compliance: {
        load_order_violations: 20,
        circular_dependencies: 200,
        missing_validations: 30,
        critical: true
    },
    
    // Logging System Compliance
    logging_compliance: {
        modern_call_bonus: 10,
        legacy_call_penalty: 5,
        invalid_category_penalty: 25,
        target_modern_percentage: 90
    },
    
    // Memory Management
    memory_management: {
        function_length_warning: 100,
        function_length_critical: 200,
        penalty_per_line_over_warning: 1,
        penalty_per_line_over_critical: 5,
        cleanup_bonus: 20
    },
    
    // Function Architecture
    function_architecture: {
        registration_mismatch_penalty: 15,
        nesting_depth_warning: 3,
        nesting_depth_penalty: 2,
        try_catch_bonus: 5,
        error_logging_bonus: 10
    },
    
    // Document Analysis API Safety (Generic, not just InDesign)
    api_safety: {
        dangerous_access_penalty: 50,
        validation_bonus: 15,
        environment_check_bonus: 30
    },
    
    // Code Quality & Organization
    code_organization: {
        naming_convention_bonus: 5,
        consistent_formatting_bonus: 10,
        header_structure_bonus: 15,
        section_organization_bonus: 10
    },
    
    // Performance & Security Patterns
    performance_patterns: {
        loop_complexity_warning: 3,
        recursion_depth_warning: 5,
        eval_usage_penalty: 100,
        dynamic_code_penalty: 50
    },
    
    // Documentation Quality
    documentation_quality: {
        jsdoc_coverage_bonus: 2,
        comment_quality_bonus: 5,
        readme_references_bonus: 10,
        example_code_bonus: 15
    },
    
    // Configuration & Data Validation
    configuration_validation: {
        config_object_structure_bonus: 10,
        default_value_handling_bonus: 5,
        validation_function_bonus: 15
    },
    
    // Function Similarity & Duplication Detection
    function_similarity: {
        exact_duplicate_penalty: 100,      // Identical functions
        high_similarity_penalty: 75,       // >90% similar
        moderate_similarity_penalty: 50,   // >75% similar
        cross_module_duplicate_penalty: 150, // Duplicates across modules
        similar_purpose_warning: 25,       // Similar intent but different implementation
        consolidation_opportunity_bonus: 20 // When similarity is detected and flagged
    },
    
    // Dependency Flow Validation
    dependency_flow: {
        reverse_dependency_penalty: 200,   // Higher module depending on lower
        circular_dependency_penalty: 300,  // Circular dependencies
        missing_dependency_penalty: 100,   // Undeclared dependencies
        proper_flow_bonus: 15,             // Correct dependency direction
        dependency_isolation_bonus: 25     // Good module isolation
    }
};

// Health scoring thresholds
const HEALTH_THRESHOLDS = {
    'A+': 950, 'A': 900, 'B+': 850, 'B': 800, 
    'C+': 750, 'C': 700, 'D': 600
};

// ============================================================================
// PROJECT DISCOVERY AND FOLDER SCANNING
// ============================================================================

/**
 * Discover all folders in project containing decimal-notation modules
 * @returns {Array} Array of folder info objects
 */
function discoverProjectFolders() {
    console.log('🔍 Scanning project for module folders...');
    console.log('='.repeat(50));
    
    const projectRoot = path.resolve(__dirname, '..');  // Go up from Utils/ to project root
    const foldersWithModules = [];
    
    function scanDirectory(dirPath, relativePath = '') {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            // Check current directory for module files
            const moduleFiles = entries
                .filter(entry => entry.isFile() && ANALYZER_CONFIG.FILE_PATTERN.test(entry.name))
                .filter(entry => !isFileExcluded(entry.name));
            
            if (moduleFiles.length > 0) {
                const folderName = relativePath || 'Root';
                foldersWithModules.push({
                    name: folderName,
                    path: dirPath,
                    relativePath: relativePath,
                    moduleFiles: moduleFiles.map(entry => entry.name),
                    moduleCount: moduleFiles.length
                });
                
                console.log(`📁 Found ${moduleFiles.length} modules in: ${folderName}`);
                moduleFiles.forEach(file => {
                    console.log(`   📄 ${file.name}`);
                });
            }
            
            // Recursively scan subdirectories
            entries
                .filter(entry => entry.isDirectory())
                .filter(entry => !ANALYZER_CONFIG.EXCLUDED_FOLDERS.includes(entry.name))
                .filter(entry => !entry.name.startsWith('.'))
                .forEach(entry => {
                    const subPath = path.join(dirPath, entry.name);
                    const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                    scanDirectory(subPath, subRelative);
                });
                
        } catch (error) {
            console.error(`❌ Error scanning ${dirPath}: ${error.message}`);
        }
    }
    
    scanDirectory(projectRoot);
    
    console.log(`\n🎯 Discovery complete: ${foldersWithModules.length} folders with modules found`);
    return foldersWithModules;
}

/**
 * Check if file should be excluded from analysis
 * @param {string} filename - File name to check
 * @returns {boolean} True if file should be excluded
 */
function isFileExcluded(filename) {
    return ANALYZER_CONFIG.EXCLUDED_FILES.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
}

// ============================================================================
// MODULE ANALYSIS ENGINE
// ============================================================================

/**
 * Analyze modules in a specific folder
 * @param {Object} folderInfo - Folder information object
 * @returns {Object} Analysis result
 */
function analyzeModulesInFolder(folderInfo) {
    console.log(`\n🔬 Analyzing modules in: ${folderInfo.name}`);
    console.log('='.repeat(40));
    
    try {
        // Parse all module files
        const moduleAnalyses = [];
        
        folderInfo.moduleFiles.forEach(filename => {
            console.log(`📋 Analyzing: ${filename}`);
            const analysis = analyzeModuleFile(path.join(folderInfo.path, filename), filename);
            moduleAnalyses.push(analysis);
        });
        
        // Perform cross-module analysis for similarity detection
        console.log(`🔍 Performing cross-module analysis...`);
        const crossModuleAnalysis = performCrossModuleAnalysis(moduleAnalyses);
        
        // Generate folder-level statistics
        const folderStats = generateFolderStatistics(moduleAnalyses, folderInfo, crossModuleAnalysis);
        
        // Detect comparison opportunities (same decimal prefix)
        const comparisonGroups = detectComparisonOpportunities(moduleAnalyses);
        
        // Generate reports
        const timestamp = generateTimestamp();
        const reports = generateReports(folderStats, moduleAnalyses, comparisonGroups, folderInfo, timestamp, crossModuleAnalysis);
        
        return {
            success: true,
            folderName: folderInfo.name,
            moduleCount: moduleAnalyses.length,
            folderStats: folderStats,
            moduleAnalyses: moduleAnalyses,
            crossModuleAnalysis: crossModuleAnalysis,
            comparisonGroups: comparisonGroups,
            reports: reports
        };
        
    } catch (error) {
        console.error(`❌ Error analyzing ${folderInfo.name}: ${error.message}`);
        return {
            success: false,
            error: error.message,
            folderName: folderInfo.name
        };
    }
}

/**
 * Analyze a single module file with enhanced analysis
 * @param {string} filePath - Path to module file
 * @param {string} filename - File name
 * @returns {Object} Module analysis result
 */
function analyzeModuleFile(filePath, filename) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        
        // Extract basic metadata
        const metadata = extractModuleMetadata(content, filename, stats);
        
        // Parse functions with enhanced details
        const functions = extractFunctions(content, filename);
        
        // Check registration compliance
        const registration = checkRegistrationCompliance(content, functions);
        
        // Apply quality rules
        const qualityAnalysis = applyQualityRules(content, functions, metadata);
        
        // Calculate health score
        const healthScore = calculateHealthScore(qualityAnalysis);
        
        return {
            filename: filename,
            filePath: filePath,
            content: content,  // Store for cross-module analysis
            metadata: metadata,
            functions: functions,
            registration: registration,
            quality: qualityAnalysis,
            health: healthScore,
            success: true
        };
        
    } catch (error) {
        console.error(`   ⚠️  Analysis error for ${filename}: ${error.message}`);
        return {
            filename: filename,
            success: false,
            error: error.message,
            // Provide minimal fallback data
            metadata: { filename: filename, line_count: 0, function_count: 0 },
            functions: { total_count: 0, global_functions: [], nested_functions: [] },
            health: { total_score: 0, grade: 'F', critical_violations: [] }
        };
    }
}

/**
 * Extract module metadata from content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {Object} stats - File stats
 * @returns {Object} Metadata object
 */
function extractModuleMetadata(content, filename, stats) {
    const lines = content.split('\n');
    const versionMatch = filename.match(ANALYZER_CONFIG.FILE_PATTERN);
    
    return {
        filename: filename,
        version_from_filename: versionMatch ? versionMatch[1] : null,
        file_size_bytes: stats.size,
        line_count: lines.length,
        character_count: content.length,
        last_modified: stats.mtime.toISOString(),
        
        // Extract from header comments
        module_name: extractFromHeader(content, /\/\/ ([^-\n]+) - /),
        purpose: extractFromHeader(content, /\/\/ PURPOSE: (.*)/),
        dependencies: extractDependencies(content),
        size_comment: extractFromHeader(content, /\/\/ SIZE: (.*)/),
        
        // Basic content analysis
        has_try_catch: content.includes('try {'),
        has_error_handling: content.includes('catch ('),
        comment_lines: lines.filter(line => line.trim().startsWith('//')).length,
        blank_lines: lines.filter(line => line.trim() === '').length,
        
        // Enhanced content analysis
        has_configuration_objects: content.includes('_CONFIG'),
        has_validation_functions: content.includes('validate'),
        has_jsdoc_comments: content.includes('/**'),
        estimated_complexity: estimateComplexity(content),
        api_calls_detected: detectAPIUsage(content)
    };
}

/**
 * Extract function purpose from comments
 * @param {string} content - File content
 * @param {number} functionStart - Function start position
 * @returns {string} Function purpose description
 */
function extractFunctionPurpose(content, functionStart) {
    const beforeFunction = content.substring(0, functionStart);
    const lines = beforeFunction.split('\n');
    
    // Look for JSDoc @param, @returns, or description
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 15); i--) {
        const line = lines[i].trim();
        if (line.includes('/**') || line.includes('*/')) {
            // Extract description from JSDoc block
            const jsdocStart = beforeFunction.lastIndexOf('/**');
            const jsdocEnd = beforeFunction.lastIndexOf('*/');
            if (jsdocStart > -1 && jsdocEnd > jsdocStart) {
                const jsdocContent = beforeFunction.substring(jsdocStart, jsdocEnd + 2);
                const descMatch = jsdocContent.match(/\/\*\*\s*(.*?)\s*\n/);
                if (descMatch) {
                    return descMatch[1].replace(/\*/g, '').trim();
                }
            }
        }
        // Look for single-line comments
        if (line.startsWith('//') && line.length > 10) {
            return line.replace('//', '').trim();
        }
    }
    
    return 'No description found';
}

/**
 * Extract complete function content
 * @param {string} content - File content
 * @param {number} startIndex - Function start position
 * @returns {string} Function content
 */
function extractFunctionContent(content, startIndex) {
    try {
        const fromStart = content.substring(startIndex);
        let braceCount = 0;
        let endIndex = -1;
        let inFunction = false;
        
        for (let i = 0; i < fromStart.length; i++) {
            if (fromStart[i] === '{') {
                inFunction = true;
                braceCount++;
            } else if (fromStart[i] === '}') {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
        
        if (endIndex > -1) {
            return fromStart.substring(0, endIndex + 1);
        }
        
        return '';
    } catch (error) {
        return '';
    }
}

/**
 * Normalize function content for comparison
 * @param {string} functionContent - Raw function content
 * @returns {string} Normalized content
 */
function normalizeFunctionContent(functionContent) {
    try {
        let normalized = functionContent;
        
        // Remove comments
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = normalized.replace(/\/\/.*$/gm, '');
        
        // Normalize whitespace
        normalized = normalized.replace(/\s+/g, ' ');
        
        // Remove variable names but keep structure
        normalized = normalized.replace(/\bvar\s+\w+/g, 'var VAR');
        normalized = normalized.replace(/\bfunction\s+\w+/g, 'function FUNC');
        
        // Normalize string literals
        normalized = normalized.replace(/'[^']*'/g, "'STRING'");
        normalized = normalized.replace(/"[^"]*"/g, '"STRING"');
        
        // Normalize numbers
        normalized = normalized.replace(/\b\d+\b/g, 'NUM');
        
        return normalized.trim();
    } catch (error) {
        return functionContent;
    }
}

/**
 * Extract function calls from function content
 * @param {string} functionContent - Function content
 * @returns {Array} Array of function calls
 */
function extractFunctionCalls(functionContent) {
    const calls = [];
    
    try {
        // Match function calls: functionName(
        const callRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let match;
        
        while ((match = callRegex.exec(functionContent)) !== null) {
            const funcName = match[1];
            
            // Filter out keywords and common statements
            const keywords = ['if', 'for', 'while', 'switch', 'catch', 'typeof', 'return'];
            if (!keywords.includes(funcName) && !calls.includes(funcName)) {
                calls.push(funcName);
            }
        }
    } catch (error) {
        // Silent fail
    }
    
    return calls;
}

// ============================================================================
// CROSS-MODULE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Perform cross-module analysis for similarity and dependency validation
 * @param {Array} moduleAnalyses - Array of module analyses
 * @returns {Object} Cross-module analysis results
 */
function performCrossModuleAnalysis(moduleAnalyses) {
    console.log(`   🔍 Checking function similarity across modules...`);
    
    const analysis = {
        function_similarities: [],
        dependency_violations: [],
        duplicate_functions: [],
        consolidation_opportunities: [],
        cross_module_calls: []
    };
    
    try {
        const successfulModules = moduleAnalyses.filter(m => m.success && m.functions && m.functions.function_content);
        
        if (successfulModules.length === 0) {
            console.log(`   ⚠️  No modules with valid function content for cross-module analysis`);
            return analysis;
        }
        
        // Analyze function similarity across modules
        try {
            analysis.function_similarities = analyzeFunctionSimilarities(successfulModules);
        } catch (error) {
            console.error(`   ❌ Function similarity analysis failed: ${error.message}`);
        }
        
        // Check dependency flow direction
        try {
            analysis.dependency_violations = validateDependencyFlow(successfulModules);
        } catch (error) {
            console.error(`   ❌ Dependency flow validation failed: ${error.message}`);
        }
        
        // Identify exact duplicates
        try {
            analysis.duplicate_functions = findExactDuplicates(successfulModules);
        } catch (error) {
            console.error(`   ❌ Duplicate function detection failed: ${error.message}`);
        }
        
        // Find consolidation opportunities
        try {
            analysis.consolidation_opportunities = findConsolidationOpportunities(analysis.function_similarities);
        } catch (error) {
            console.error(`   ❌ Consolidation opportunity analysis failed: ${error.message}`);
        }
        
        console.log(`   📊 Found ${analysis.function_similarities.length} similarity matches`);
        console.log(`   ⚠️  Found ${analysis.dependency_violations.length} dependency violations`);
        console.log(`   🔄 Found ${analysis.duplicate_functions.length} exact duplicates`);
        
    } catch (error) {
        console.error(`   ❌ Cross-module analysis error: ${error.message}`);
    }
    
    return analysis;
}

/**
 * Analyze function similarities across modules
 * @param {Array} modules - Module analyses
 * @returns {Array} Similarity analysis results
 */
function analyzeFunctionSimilarities(modules) {
    const similarities = [];
    const threshold = ANALYZER_CONFIG.options.SIMILARITY_THRESHOLD || 75;
    
    // Compare all functions across all modules
    for (let i = 0; i < modules.length; i++) {
        const moduleA = modules[i];
        if (!moduleA.functions || !moduleA.functions.function_content) continue;
        
        const functionsA = [...moduleA.functions.global_functions, ...moduleA.functions.nested_functions];
        
        for (let j = i; j < modules.length; j++) {
            const moduleB = modules[j];
            if (!moduleB.functions || !moduleB.functions.function_content) continue;
            
            const functionsB = [...moduleB.functions.global_functions, ...moduleB.functions.nested_functions];
            
            // Compare functions between modules (or within same module if i === j)
            functionsA.forEach(funcA => {
                functionsB.forEach(funcB => {
                    // Skip comparing function to itself
                    if (i === j && funcA.name === funcB.name) return;
                    
                    const similarity = calculateFunctionSimilarity(
                        moduleA.functions.function_content[funcA.name],
                        moduleB.functions.function_content[funcB.name],
                        funcA,
                        funcB
                    );
                    
                    if (similarity.percentage >= threshold) {
                        similarities.push({
                            function_a: {
                                name: funcA.name,
                                module: moduleA.filename,
                                purpose: funcA.purpose
                            },
                            function_b: {
                                name: funcB.name,
                                module: moduleB.filename,
                                purpose: funcB.purpose
                            },
                            similarity_percentage: similarity.percentage,
                            similarity_type: similarity.type,
                            recommendation: similarity.recommendation,
                            same_module: i === j
                        });
                    }
                });
            });
        }
    }
    
    // Sort by similarity percentage (highest first)
    return similarities.sort((a, b) => b.similarity_percentage - a.similarity_percentage);
}

/**
 * Calculate similarity between two functions
 * @param {Object} funcContentA - Function A content object
 * @param {Object} funcContentB - Function B content object
 * @param {Object} funcInfoA - Function A info
 * @param {Object} funcInfoB - Function B info
 * @returns {Object} Similarity analysis
 */
function calculateFunctionSimilarity(funcContentA, funcContentB, funcInfoA, funcInfoB) {
    if (!funcContentA || !funcContentB) {
        return { percentage: 0, type: 'no_content', recommendation: 'Cannot compare' };
    }
    
    let totalScore = 0;
    let maxScore = 0;
    
    // 1. Signature similarity (25 points)
    maxScore += 25;
    const sigSimilarity = calculateSignatureSimilarity(funcInfoA, funcInfoB);
    totalScore += sigSimilarity * 25;
    
    // 2. Content similarity (40 points)
    maxScore += 40;
    const contentSimilarity = calculateContentSimilarity(
        funcContentA.normalized_content, 
        funcContentB.normalized_content
    );
    totalScore += contentSimilarity * 40;
    
    // 3. API calls similarity (20 points)
    maxScore += 20;
    const callsSimilarity = calculateCallsSimilarity(funcContentA.calls, funcContentB.calls);
    totalScore += callsSimilarity * 20;
    
    // 4. Purpose similarity (15 points)
    maxScore += 15;
    const purposeSimilarity = calculatePurposeSimilarity(funcInfoA.purpose, funcInfoB.purpose);
    totalScore += purposeSimilarity * 15;
    
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    return {
        percentage: percentage,
        type: determineSimilarityType(percentage),
        recommendation: generateSimilarityRecommendation(percentage, funcInfoA.name, funcInfoB.name),
        details: {
            signature_similarity: Math.round(sigSimilarity * 100),
            content_similarity: Math.round(contentSimilarity * 100),
            calls_similarity: Math.round(callsSimilarity * 100),
            purpose_similarity: Math.round(purposeSimilarity * 100)
        }
    };
}

/**
 * Calculate signature similarity
 * @param {Object} funcA - Function A info
 * @param {Object} funcB - Function B info
 * @returns {number} Similarity score (0-1)
 */
function calculateSignatureSimilarity(funcA, funcB) {
    if (funcA.parameter_count === funcB.parameter_count) {
        if (funcA.parameter_count === 0) return 1.0; // Both have no parameters
        
        // Compare parameter names/patterns
        const paramsA = funcA.parameters || [];
        const paramsB = funcB.parameters || [];
        
        let matchingParams = 0;
        for (let i = 0; i < Math.min(paramsA.length, paramsB.length); i++) {
            if (paramsA[i] === paramsB[i] || 
                normalizeParameterName(paramsA[i]) === normalizeParameterName(paramsB[i])) {
                matchingParams++;
            }
        }
        
        return matchingParams / Math.max(paramsA.length, paramsB.length);
    }
    
    // Different parameter counts - partial credit based on difference
    const diff = Math.abs(funcA.parameter_count - funcB.parameter_count);
    const maxParams = Math.max(funcA.parameter_count, funcB.parameter_count);
    return maxParams === 0 ? 0 : Math.max(0, (maxParams - diff) / maxParams);
}

/**
 * Calculate content similarity using multiple techniques
 * @param {string} contentA - Normalized content A
 * @param {string} contentB - Normalized content B
 * @returns {number} Similarity score (0-1)
 */
function calculateContentSimilarity(contentA, contentB) {
    if (!contentA || !contentB) return 0;
    if (contentA === contentB) return 1.0;
    
    // Use Jaccard similarity on tokens
    const tokensA = new Set(contentA.split(/\W+/).filter(t => t.length > 2));
    const tokensB = new Set(contentB.split(/\W+/).filter(t => t.length > 2));
    
    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculate calls similarity
 * @param {Array} callsA - Function calls from A
 * @param {Array} callsB - Function calls from B
 * @returns {number} Similarity score (0-1)
 */
function calculateCallsSimilarity(callsA, callsB) {
    if (!callsA || !callsB) return 0;
    if (callsA.length === 0 && callsB.length === 0) return 1.0;
    
    const setA = new Set(callsA);
    const setB = new Set(callsB);
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculate purpose similarity
 * @param {string} purposeA - Purpose description A
 * @param {string} purposeB - Purpose description B
 * @returns {number} Similarity score (0-1)
 */
function calculatePurposeSimilarity(purposeA, purposeB) {
    if (!purposeA || !purposeB || 
        purposeA === 'No description found' || 
        purposeB === 'No description found') {
        return 0;
    }
    
    if (purposeA === purposeB) return 1.0;
    
    // Simple keyword matching
    const wordsA = purposeA.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const wordsB = purposeB.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Normalize parameter name for comparison
 * @param {string} param - Parameter name
 * @returns {string} Normalized parameter name
 */
function normalizeParameterName(param) {
    return param.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Determine similarity type based on percentage
 * @param {number} percentage - Similarity percentage
 * @returns {string} Similarity type
 */
function determineSimilarityType(percentage) {
    if (percentage >= 95) return 'exact_duplicate';
    if (percentage >= 85) return 'very_similar';
    if (percentage >= 75) return 'similar';
    return 'somewhat_similar';
}

/**
 * Generate similarity recommendation
 * @param {number} percentage - Similarity percentage
 * @param {string} nameA - Function A name
 * @param {string} nameB - Function B name
 * @returns {string} Recommendation
 */
function generateSimilarityRecommendation(percentage, nameA, nameB) {
    if (percentage >= 95) {
        return `CONSOLIDATE: Functions '${nameA}' and '${nameB}' appear to be duplicates`;
    }
    if (percentage >= 85) {
        return `REVIEW: Functions '${nameA}' and '${nameB}' are very similar - consider consolidation`;
    }
    if (percentage >= 75) {
        return `INVESTIGATE: Functions '${nameA}' and '${nameB}' have similar purpose - verify if intentional`;
    }
    return `MONITOR: Functions may have overlapping functionality`;
}

/**
 * Validate dependency flow direction
 * @param {Array} modules - Module analyses
 * @returns {Array} Dependency violations
 */
function validateDependencyFlow(modules) {
    const violations = [];
    
    modules.forEach(module => {
        if (!module.functions || !module.functions.function_calls) return;
        
        const moduleVersion = extractModuleVersion(module.filename);
        if (!moduleVersion) return;
        
        module.functions.function_calls.forEach(callInfo => {
            callInfo.calls.forEach(calledFunction => {
                // Find which module contains the called function
                const targetModule = findModuleContainingFunction(modules, calledFunction);
                if (targetModule && targetModule.filename !== module.filename) {
                    const targetVersion = extractModuleVersion(targetModule.filename);
                    
                    if (targetVersion && compareModuleVersions(moduleVersion, targetVersion) < 0) {
                        // Lower numbered module calling higher numbered module - violation!
                        violations.push({
                            caller_module: module.filename,
                            caller_function: callInfo.caller,
                            called_function: calledFunction,
                            target_module: targetModule.filename,
                            violation_type: 'reverse_dependency',
                            description: `Module ${module.filename} (v${moduleVersion.join('.')}) calls function '${calledFunction}' from higher-numbered module ${targetModule.filename} (v${targetVersion.join('.')})`
                        });
                    }
                }
            });
        });
    });
    
    return violations;
}

/**
 * Find exact duplicate functions
 * @param {Array} modules - Module analyses
 * @returns {Array} Exact duplicates
 */
function findExactDuplicates(modules) {
    const duplicates = [];
    const seen = new Map();
    
    modules.forEach(module => {
        if (!module.functions || !module.functions.function_content) return;
        
        Object.keys(module.functions.function_content).forEach(funcName => {
            const funcContent = module.functions.function_content[funcName];
            const normalizedContent = funcContent.normalized_content;
            
            if (seen.has(normalizedContent)) {
                const original = seen.get(normalizedContent);
                duplicates.push({
                    original: original,
                    duplicate: {
                        name: funcName,
                        module: module.filename
                    },
                    type: 'exact_duplicate',
                    recommendation: `Remove duplicate function '${funcName}' and use '${original.name}' from ${original.module}`
                });
            } else {
                seen.set(normalizedContent, {
                    name: funcName,
                    module: module.filename
                });
            }
        });
    });
    
    return duplicates;
}

/**
 * Find consolidation opportunities
 * @param {Array} similarities - Function similarities
 * @returns {Array} Consolidation opportunities
 */
function findConsolidationOpportunities(similarities) {
    return similarities
        .filter(sim => sim.similarity_percentage >= 85)
        .map(sim => ({
            functions: [sim.function_a, sim.function_b],
            similarity: sim.similarity_percentage,
            opportunity_type: sim.similarity_percentage >= 95 ? 'immediate_consolidation' : 'review_for_consolidation',
            estimated_effort: sim.similarity_percentage >= 95 ? 'low' : 'medium',
            recommendation: sim.recommendation
        }));
}

/**
 * Extract module version from filename
 * @param {string} filename - Module filename
 * @returns {Array|null} Version array or null
 */
function extractModuleVersion(filename) {
    const match = filename.match(ANALYZER_CONFIG.FILE_PATTERN);
    return match ? match[1].split('.').map(Number) : null;
}

/**
 * Find module containing a specific function
 * @param {Array} modules - Module analyses
 * @param {string} functionName - Function name to find
 * @returns {Object|null} Module containing the function
 */
function findModuleContainingFunction(modules, functionName) {
    for (let module of modules) {
        if (!module.functions) continue;
        
        const allFunctions = [...module.functions.global_functions, ...module.functions.nested_functions];
        if (allFunctions.some(func => func.name === functionName)) {
            return module;
        }
    }
    return null;
}

/**
 * Compare module versions
 * @param {Array} versionA - Version array A
 * @param {Array} versionB - Version array B
 * @returns {number} Comparison result (-1, 0, 1)
 */
function compareModuleVersions(versionA, versionB) {
    const maxLength = Math.max(versionA.length, versionB.length);
    
    for (let i = 0; i < maxLength; i++) {
        const aVal = versionA[i] || 0;
        const bVal = versionB[i] || 0;
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
    }
    
    return 0;
}

/**
 * Check intra-module function similarity
 * @param {Object} functions - Functions object
 * @returns {Object} Intra-module similarity analysis
 */
function checkIntraModuleSimilarity(functions) {
    const analysis = {
        score: 0,
        similar_functions: [],
        duplicates: [],
        recommendations: []
    };
    
    if (!functions.function_content) return analysis;
    
    const rules = QUALITY_RULES.function_similarity;
    const threshold = ANALYZER_CONFIG.options.SIMILARITY_THRESHOLD || 75;
    const funcNames = Object.keys(functions.function_content);
    
    // Compare all functions within the module
    for (let i = 0; i < funcNames.length; i++) {
        for (let j = i + 1; j < funcNames.length; j++) {
            const nameA = funcNames[i];
            const nameB = funcNames[j];
            
            const funcA = functions.global_functions.find(f => f.name === nameA) || 
                         functions.nested_functions.find(f => f.name === nameA);
            const funcB = functions.global_functions.find(f => f.name === nameB) || 
                         functions.nested_functions.find(f => f.name === nameB);
            
            if (!funcA || !funcB) continue;
            
            const similarity = calculateFunctionSimilarity(
                functions.function_content[nameA],
                functions.function_content[nameB],
                funcA,
                funcB
            );
            
            if (similarity.percentage >= threshold) {
                const similarityInfo = {
                    function_a: nameA,
                    function_b: nameB,
                    similarity_percentage: similarity.percentage,
                    type: similarity.type,
                    recommendation: similarity.recommendation
                };
                
                if (similarity.percentage >= 95) {
                    analysis.duplicates.push(similarityInfo);
                    analysis.score -= rules.exact_duplicate_penalty;
                } else if (similarity.percentage >= 85) {
                    analysis.similar_functions.push(similarityInfo);
                    analysis.score -= rules.high_similarity_penalty;
                } else {
                    analysis.similar_functions.push(similarityInfo);
                    analysis.score -= rules.moderate_similarity_penalty;
                }
                
                analysis.recommendations.push(similarity.recommendation);
            }
        }
    }
    
    return analysis;
}

/**
 * Extract information from header comments
 * @param {string} content - File content
 * @param {RegExp} pattern - Regex pattern to match
 * @returns {string|null} Extracted value
 */
function extractFromHeader(content, pattern) {
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

/**
 * Extract dependencies from content
 * @param {string} content - File content
 * @returns {Array} Array of dependencies
 */
function extractDependencies(content) {
    const dependencies = [];
    
    // Look for dependency arrays
    const depArrayMatch = content.match(/DEPENDENCIES.*?=.*?\[(.*?)\]/s);
    if (depArrayMatch) {
        const depString = depArrayMatch[1];
        const matches = depString.match(/'([^']+)'/g);
        if (matches) {
            dependencies.push(...matches.map(m => m.slice(1, -1)));
        }
    }
    
    // Look for validateDependencies calls
    const validateMatch = content.match(/validateDependencies\(\[(.*?)\]/s);
    if (validateMatch) {
        const depString = validateMatch[1];
        const matches = depString.match(/'([^']+)'/g);
        if (matches) {
            matches.forEach(dep => {
                const cleaned = dep.slice(1, -1);
                if (!dependencies.includes(cleaned)) {
                    dependencies.push(cleaned);
                }
            });
        }
    }
    
    return dependencies;
}

/**
 * Estimate code complexity (simplified metric)
 * @param {string} content - File content
 * @returns {number} Complexity score
 */
function estimateComplexity(content) {
    let complexity = 0;
    
    // Count decision points
    const decisionPatterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bfor\s*\(/g,
        /\bwhile\s*\(/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\bcatch\s*\(/g,
        /\?\s*.*\s*:/g  // ternary operators
    ];
    
    decisionPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            complexity += matches.length;
        }
    });
    
    // Add weight for nested structures
    const nesting = (content.match(/{[^}]*{/g) || []).length;
    complexity += nesting * 2;
    
    return complexity;
}

/**
 * Detect API usage patterns
 * @param {string} content - File content
 * @returns {Array} Array of detected APIs
 */
function detectAPIUsage(content) {
    const apis = [];
    
    // Common ExtendScript/Adobe APIs
    const apiPatterns = [
        { name: 'Adobe_App', pattern: /\bapp\./g },
        { name: 'Document_API', pattern: /\.document\b/g },
        { name: 'File_System', pattern: /\bFile\(/g },
        { name: 'JSON_API', pattern: /JSON\./g },
        { name: 'Date_API', pattern: /new Date\(/g },
        { name: 'RegExp_API', pattern: /new RegExp\(/g },
        { name: 'Array_Methods', pattern: /\.(push|pop|slice|splice|join)\(/g },
        { name: 'String_Methods', pattern: /\.(substring|indexOf|replace|match)\(/g },
        { name: 'Math_API', pattern: /Math\./g },
        { name: 'Console_Output', pattern: /\$\.writeln\(/g }
    ];
    
    apiPatterns.forEach(api => {
        const matches = content.match(api.pattern);
        if (matches) {
            apis.push({
                name: api.name,
                usage_count: matches.length
            });
        }
    });
    
    return apis;
}

// ============================================================================
// FUNCTION ANALYSIS
// ============================================================================

/**
 * Extract functions from module content with enhanced details
 * @param {string} content - File content
 * @param {string} filename - File name for context
 * @returns {Object} Functions analysis
 */
function extractFunctions(content, filename) {
    const functions = {
        global_functions: [],
        nested_functions: [],
        total_count: 0,
        statistics: {},
        function_calls: [],  // NEW: Track function calls for dependency analysis
        function_content: {} // NEW: Store function content for similarity analysis
    };
    
    try {
        // Find function declarations
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1];
            const startIndex = match.index;
            
            // Analyze function context and parameters
            const functionInfo = analyzeFunctionDetails(content, functionName, startIndex, filename);
            
            // Extract function content for similarity analysis
            const functionContent = extractFunctionContent(content, startIndex);
            functions.function_content[functionName] = {
                raw_content: functionContent,
                normalized_content: normalizeFunctionContent(functionContent),
                signature: functionInfo.signature,
                calls: extractFunctionCalls(functionContent)
            };
            
            // Track function calls made by this function
            const calls = extractFunctionCalls(functionContent);
            functions.function_calls.push({
                caller: functionName,
                calls: calls,
                module: filename
            });
            
            // Determine if nested (simplified heuristic)
            const beforeFunction = content.substring(0, startIndex);
            const functionKeywordCount = (beforeFunction.match(/function\s+/g) || []).length;
            const closeBraceCount = (beforeFunction.match(/}/g) || []).length;
            
            if (functionKeywordCount > closeBraceCount) {
                functions.nested_functions.push(functionInfo);
            } else {
                functions.global_functions.push(functionInfo);
            }
        }
        
        functions.total_count = functions.global_functions.length + functions.nested_functions.length;
        
        // Generate statistics
        functions.statistics = {
            global_count: functions.global_functions.length,
            nested_count: functions.nested_functions.length,
            average_parameters: calculateAverageParameters(functions),
            longest_function: findLongestFunction(content, functions),
            functions_with_params: countFunctionsWithParameters(functions),
            functions_with_try_catch: countFunctionsWithTryCatch(content, functions)
        };
        
    } catch (error) {
        console.error(`Error extracting functions: ${error.message}`);
    }
    
    return functions;
}

/**
 * Analyze function details with enhanced information
 * @param {string} content - File content
 * @param {string} functionName - Function name
 * @param {number} startIndex - Start position in content
 * @param {string} filename - File name for context
 * @returns {Object} Function details
 */
function analyzeFunctionDetails(content, functionName, startIndex, filename) {
    // Extract function signature
    const signatureMatch = content.substring(startIndex).match(/function\s+[^{]+/);
    const signature = signatureMatch ? signatureMatch[0].trim() : `function ${functionName}()`;
    
    // Count parameters
    const paramMatch = signature.match(/\(([^)]*)\)/);
    const parameters = paramMatch && paramMatch[1].trim() ? 
        paramMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];
    
    // Estimate function length (simplified)
    const functionLength = estimateFunctionLength(content, startIndex);
    
    // Extract function purpose from comments
    const purpose = extractFunctionPurpose(content, startIndex);
    
    return {
        name: functionName,
        signature: signature,
        parameter_count: parameters.length,
        parameters: parameters,
        estimated_line_count: functionLength,
        has_jsdoc: checkForJSDoc(content, startIndex),
        purpose: purpose,
        module: filename,
        start_index: startIndex
    };
}

/**
 * Estimate function length in lines
 * @param {string} content - File content
 * @param {number} startIndex - Function start position
 * @returns {number} Estimated line count
 */
function estimateFunctionLength(content, startIndex) {
    try {
        const fromStart = content.substring(startIndex);
        let braceCount = 0;
        let endIndex = -1;
        
        for (let i = 0; i < fromStart.length; i++) {
            if (fromStart[i] === '{') {
                braceCount++;
            } else if (fromStart[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
        
        if (endIndex > -1) {
            const functionContent = fromStart.substring(0, endIndex + 1);
            return functionContent.split('\n').length;
        }
        
        return 0;
    } catch (error) {
        return 0;
    }
}

/**
 * Check for JSDoc comments before function
 * @param {string} content - File content
 * @param {number} functionStart - Function start position
 * @returns {boolean} True if JSDoc found
 */
function checkForJSDoc(content, functionStart) {
    const beforeFunction = content.substring(0, functionStart);
    const lines = beforeFunction.split('\n');
    
    // Look for /** */ pattern in recent lines
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
        if (lines[i].includes('/**') || lines[i].includes('*/')) {
            return true;
        }
    }
    
    return false;
}

/**
 * Calculate average parameters across all functions
 * @param {Object} functions - Functions object
 * @returns {number} Average parameter count
 */
function calculateAverageParameters(functions) {
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    if (allFunctions.length === 0) return 0;
    
    const totalParams = allFunctions.reduce((sum, func) => sum + func.parameter_count, 0);
    return Math.round((totalParams / allFunctions.length) * 10) / 10;
}

/**
 * Find longest function
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Longest function info
 */
function findLongestFunction(content, functions) {
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    
    if (allFunctions.length === 0) {
        return { name: 'none', line_count: 0 };
    }
    
    const longest = allFunctions.reduce((max, func) => 
        func.estimated_line_count > max.estimated_line_count ? func : max
    );
    
    return {
        name: longest.name,
        line_count: longest.estimated_line_count
    };
}

/**
 * Count functions with parameters
 * @param {Object} functions - Functions object
 * @returns {number} Count of functions with parameters
 */
function countFunctionsWithParameters(functions) {
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    return allFunctions.filter(func => func.parameter_count > 0).length;
}

/**
 * Count functions with try-catch blocks
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {number} Count of functions with error handling
 */
function countFunctionsWithTryCatch(content, functions) {
    // Simplified heuristic - count try/catch near function declarations
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    let count = 0;
    
    allFunctions.forEach(func => {
        const functionIndex = content.indexOf(`function ${func.name}`);
        if (functionIndex > -1) {
            // Look for try/catch in next 500 characters (rough heuristic)
            const after = content.substring(functionIndex, functionIndex + 500);
            if (after.includes('try {') && after.includes('catch (')) {
                count++;
            }
        }
    });
    
    return count;
}

// ============================================================================
// REGISTRATION COMPLIANCE CHECKING
// ============================================================================

/**
 * Check registration compliance
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Registration compliance analysis
 */
function checkRegistrationCompliance(content, functions) {
    const compliance = {
        registerModule_found: false,
        module_name: null,
        version: null,
        registered_functions: [],
        compliance_issues: {
            functions_not_registered: [],
            registered_but_not_found: [],
            accuracy_percentage: 0
        }
    };
    
    try {
        // Find registerModule call
        const registerMatch = content.match(/registerModule\s*\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*\[(.*?)\]/s);
        
        if (registerMatch) {
            compliance.registerModule_found = true;
            compliance.module_name = registerMatch[1];
            compliance.version = registerMatch[2];
            
            // Extract registered function names
            const functionsString = registerMatch[3];
            const functionMatches = functionsString.match(/'([^']+)'/g);
            
            if (functionMatches) {
                compliance.registered_functions = functionMatches.map(match => match.slice(1, -1));
            }
            
            // Check compliance
            const allFunctionNames = functions.global_functions.map(f => f.name);
            
            // Functions in code but not registered
            compliance.compliance_issues.functions_not_registered = 
                allFunctionNames.filter(name => !compliance.registered_functions.includes(name));
            
            // Functions registered but not in code
            compliance.compliance_issues.registered_but_not_found = 
                compliance.registered_functions.filter(name => !allFunctionNames.includes(name));
            
            // Calculate accuracy percentage
            const totalFunctions = allFunctionNames.length;
            const correctlyRegistered = totalFunctions - compliance.compliance_issues.functions_not_registered.length;
            const falseRegistrations = compliance.compliance_issues.registered_but_not_found.length;
            
            if (totalFunctions > 0) {
                compliance.compliance_issues.accuracy_percentage = 
                    Math.round(((correctlyRegistered - falseRegistrations) / totalFunctions) * 100);
            }
        }
        
    } catch (error) {
        console.error(`Error checking registration compliance: ${error.message}`);
    }
    
    return compliance;
}

// ============================================================================
// QUALITY RULES APPLICATION
// ============================================================================

/**
 * Apply architecture-specific quality rules
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @param {Object} metadata - Module metadata
 * @returns {Object} Quality analysis results
 */
function applyQualityRules(content, functions, metadata) {
    const analysis = {
        es3_compliance: checkES3Compliance(content),
        reserved_word_safety: checkReservedWordSafety(content),
        dependency_compliance: checkDependencyCompliance(content, metadata),
        logging_compliance: checkLoggingCompliance(content),
        memory_management: checkMemoryManagement(content, functions),
        function_architecture: checkFunctionArchitecture(content, functions),
        api_safety: checkAPISafety(content),
        overall_score: 0,
        critical_violations: []
    };
    
    // Add new analysis categories with error handling
    try {
        analysis.code_organization = checkCodeOrganization(content, metadata);
    } catch (error) {
        analysis.code_organization = { score: 0, patterns: [], issues: ['Analysis failed: ' + error.message] };
    }
    
    try {
        analysis.performance_patterns = checkPerformancePatterns(content, functions);
    } catch (error) {
        analysis.performance_patterns = { score: 0, warnings: [], critical_issues: [] };
    }
    
    try {
        analysis.documentation_quality = checkDocumentationQuality(content, functions);
    } catch (error) {
        analysis.documentation_quality = { score: 0, jsdoc_coverage_percentage: 0, patterns: [], issues: [] };
    }
    
    try {
        analysis.configuration_validation = checkConfigurationValidation(content);
    } catch (error) {
        analysis.configuration_validation = { score: 0, patterns: [], issues: [] };
    }
    
    try {
        analysis.security_patterns = checkSecurityPatterns(content);
    } catch (error) {
        analysis.security_patterns = { score: 0, security_issues: [], warnings: [], risk_level: 'UNKNOWN' };
    }
    
    // NEW: Intra-module function similarity check
    try {
        analysis.function_similarity = checkIntraModuleSimilarity(functions);
    } catch (error) {
        analysis.function_similarity = { score: 0, similar_functions: [], duplicates: [] };
    }
    
    // Collect critical violations
    Object.keys(analysis).forEach(category => {
        if (analysis[category] && analysis[category].critical_violations) {
            analysis.critical_violations.push(...analysis[category].critical_violations);
        }
    });
    
    return analysis;
}

/**
 * Check ES3 compliance
 * @param {string} content - File content
 * @returns {Object} ES3 compliance analysis
 */
function checkES3Compliance(content) {
    const violations = [];
    const rules = QUALITY_RULES.es3_compliance;
    
    // Check for forbidden keywords
    rules.forbidden_keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
            violations.push({
                type: 'forbidden_keyword',
                keyword: keyword,
                count: matches.length,
                penalty: matches.length * rules.penalty_per_violation
            });
        }
    });
    
    // Check for arrow functions
    const arrowFunctions = content.match(/=>\s*[{(]/g);
    if (arrowFunctions) {
        violations.push({
            type: 'arrow_function',
            count: arrowFunctions.length,
            penalty: arrowFunctions.length * rules.penalty_per_violation
        });
    }
    
    // Check for template literals
    const templateLiterals = content.match(/`[^`]*`/g);
    if (templateLiterals) {
        violations.push({
            type: 'template_literal',
            count: templateLiterals.length,
            penalty: templateLiterals.length * rules.penalty_per_violation
        });
    }
    
    const totalPenalty = violations.reduce((sum, v) => sum + v.penalty, 0);
    
    return {
        compliant: violations.length === 0,
        violations: violations,
        total_penalty: totalPenalty,
        critical_violations: rules.critical ? violations : []
    };
}

/**
 * Check reserved word safety
 * @param {string} content - File content
 * @returns {Object} Reserved word safety analysis
 */
function checkReservedWordSafety(content) {
    const violations = [];
    const rules = QUALITY_RULES.reserved_word_safety;
    
    // Check for dangerous property names
    rules.dangerous_property_names.forEach(word => {
        // Look for property usage: obj.export, obj['export'], {export: value}
        const patterns = [
            new RegExp(`\\b\\w+\\.${word}\\b`, 'g'),
            new RegExp(`\\['${word}'\\]`, 'g'),
            new RegExp(`\\{"?${word}"?\\s*:`, 'g'),
            new RegExp(`${word}\\s*:`, 'g')
        ];
        
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'dangerous_property',
                    word: word,
                    usage_type: pattern.source,
                    count: matches.length,
                    penalty: matches.length * rules.penalty_per_violation,
                    critical: rules.extendscript_crashers.includes(word)
                });
            }
        });
    });
    
    const totalPenalty = violations.reduce((sum, v) => sum + v.penalty, 0);
    
    return {
        safe: violations.length === 0,
        violations: violations,
        total_penalty: totalPenalty,
        critical_violations: violations.filter(v => v.critical)
    };
}

/**
 * Check dependency compliance
 * @param {string} content - File content
 * @param {Object} metadata - Module metadata
 * @returns {Object} Dependency compliance analysis
 */
function checkDependencyCompliance(content, metadata) {
    const analysis = {
        has_dependency_validation: false,
        declared_dependencies: metadata.dependencies || [],
        load_order_compliant: true,
        issues: [],
        total_penalty: 0
    };
    
    // Check for dependency validation
    if (content.includes('validateDependencies')) {
        analysis.has_dependency_validation = true;
    } else if (metadata.dependencies && metadata.dependencies.length > 0) {
        analysis.issues.push({
            type: 'missing_validation',
            message: 'Dependencies declared but no validation found',
            penalty: QUALITY_RULES.dependency_compliance.missing_validations
        });
    }
    
    // Check load order (simplified - based on version numbers)
    if (metadata.version_from_filename) {
        const currentVersion = metadata.version_from_filename.split('.').map(Number);
        
        metadata.dependencies.forEach(dep => {
            const depVersionMatch = dep.match(/(\d+\.\d+)/);
            if (depVersionMatch) {
                const depVersion = depVersionMatch[1].split('.').map(Number);
                
                // Check if dependency version is greater than current
                if (compareVersions(depVersion, currentVersion) >= 0) {
                    analysis.load_order_compliant = false;
                    analysis.issues.push({
                        type: 'load_order_violation',
                        dependency: dep,
                        message: `Dependency ${dep} has version >= current module`,
                        penalty: QUALITY_RULES.dependency_compliance.load_order_violations
                    });
                }
            }
        });
    }
    
    analysis.total_penalty = analysis.issues.reduce((sum, issue) => sum + issue.penalty, 0);
    
    return analysis;
}

/**
 * Check logging compliance
 * @param {string} content - File content
 * @returns {Object} Logging compliance analysis
 */
function checkLoggingCompliance(content) {
    const modernCalls = [];
    const legacyCalls = [];
    const invalidCategories = [];
    
    // Modern logging calls
    const modernPatterns = ['logDebug(', 'logInfo(', 'logWarn(', 'logError('];
    modernPatterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern.replace('(', '\\('), 'g'));
        if (matches) {
            modernCalls.push(...matches);
        }
    });
    
    // Legacy logging calls
    const legacyPatterns = ['$.writeln('];
    legacyPatterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern.replace('(', '\\(').replace('$', '\\$'), 'g'));
        if (matches) {
            legacyCalls.push(...matches);
        }
    });
    
    // Check for invalid categories (like 'export')
    const exportCategoryMatches = content.match(/logDebug\([^,]+,\s*['"]export['"]/g);
    if (exportCategoryMatches) {
        invalidCategories.push(...exportCategoryMatches);
    }
    
    const totalCalls = modernCalls.length + legacyCalls.length;
    const modernPercentage = totalCalls > 0 ? Math.round((modernCalls.length / totalCalls) * 100) : 0;
    
    const rules = QUALITY_RULES.logging_compliance;
    const score = (modernCalls.length * rules.modern_call_bonus) - 
                  (legacyCalls.length * rules.legacy_call_penalty) -
                  (invalidCategories.length * rules.invalid_category_penalty);
    
    return {
        modern_calls: modernCalls.length,
        legacy_calls: legacyCalls.length,
        invalid_categories: invalidCategories.length,
        modern_percentage: modernPercentage,
        compliance_target: rules.target_modern_percentage,
        meets_target: modernPercentage >= rules.target_modern_percentage,
        score: score
    };
}

/**
 * Check memory management patterns
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Memory management analysis
 */
function checkMemoryManagement(content, functions) {
    const rules = QUALITY_RULES.memory_management;
    let totalPenalty = 0;
    const issues = [];
    
    // Check function lengths
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    allFunctions.forEach(func => {
        if (func.estimated_line_count > rules.function_length_critical) {
            const penalty = (func.estimated_line_count - rules.function_length_critical) * rules.penalty_per_line_over_critical;
            totalPenalty += penalty;
            issues.push({
                type: 'function_too_long_critical',
                function: func.name,
                lines: func.estimated_line_count,
                penalty: penalty
            });
        } else if (func.estimated_line_count > rules.function_length_warning) {
            const penalty = (func.estimated_line_count - rules.function_length_warning) * rules.penalty_per_line_over_warning;
            totalPenalty += penalty;
            issues.push({
                type: 'function_too_long_warning',
                function: func.name,
                lines: func.estimated_line_count,
                penalty: penalty
            });
        }
    });
    
    // Check for cleanup patterns
    const hasCleanupPatterns = content.includes('memoryCleanup') || content.includes('= null');
    const cleanupBonus = hasCleanupPatterns ? rules.cleanup_bonus : 0;
    
    return {
        function_length_violations: issues.length,
        longest_function: functions.statistics.longest_function,
        has_cleanup_patterns: hasCleanupPatterns,
        cleanup_bonus: cleanupBonus,
        total_penalty: totalPenalty,
        net_score: cleanupBonus - totalPenalty,
        issues: issues
    };
}

/**
 * Check function architecture patterns
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Function architecture analysis
 */
function checkFunctionArchitecture(content, functions) {
    const rules = QUALITY_RULES.function_architecture;
    
    // Calculate try-catch coverage
    const functionsWithTryCatch = functions.statistics.functions_with_try_catch;
    const totalFunctions = functions.statistics.global_count;
    const tryCatchPercentage = totalFunctions > 0 ? Math.round((functionsWithTryCatch / totalFunctions) * 100) : 0;
    
    // Check nesting depth (simplified)
    const nestedFunctions = functions.nested_functions.length;
    const excessiveNesting = nestedFunctions > rules.nesting_depth_warning ? 
        nestedFunctions - rules.nesting_depth_warning : 0;
    
    const score = (functionsWithTryCatch * rules.try_catch_bonus) -
                  (excessiveNesting * rules.nesting_depth_penalty);
    
    return {
        try_catch_coverage: tryCatchPercentage,
        functions_with_error_handling: functionsWithTryCatch,
        total_global_functions: totalFunctions,
        nested_function_count: nestedFunctions,
        excessive_nesting_penalty: excessiveNesting * rules.nesting_depth_penalty,
        score: score
    };
}

/**
 * Check document analysis API safety patterns (generic)
 * @param {string} content - File content
 * @returns {Object} API safety analysis
 */
function checkAPISafety(content) {
    const rules = QUALITY_RULES.api_safety;
    let score = 0;
    const patterns = [];
    
    // Check for dangerous property access
    const dangerousPatterns = ['prototype', 'constructor', '__proto__'];
    dangerousPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
            score -= rules.dangerous_access_penalty;
            patterns.push(`Dangerous property access: ${pattern}`);
        }
    });
    
    // Check for validation patterns
    if (content.includes('isDangerousProperty')) {
        score += rules.validation_bonus;
        patterns.push('Uses isDangerousProperty validation');
    }
    
    // Check for environment validation (generic)
    if (content.includes('validateEnvironment') || content.includes('validateDocumentState')) {
        score += rules.environment_check_bonus;
        patterns.push('Uses environment validation');
    }
    
    return {
        safety_patterns: patterns,
        score: score,
        uses_property_validation: content.includes('isDangerousProperty'),
        uses_environment_validation: content.includes('validateEnvironment') || content.includes('validateDocumentState')
    };
}

/**
 * Check code organization patterns
 * @param {string} content - File content
 * @param {Object} metadata - Module metadata
 * @returns {Object} Code organization analysis
 */
function checkCodeOrganization(content, metadata) {
    const rules = QUALITY_RULES.code_organization;
    let score = 0;
    const issues = [];
    const patterns = [];
    
    // Check for consistent section headers
    const sectionHeaders = content.match(/\/\/ =+/g);
    if (sectionHeaders && sectionHeaders.length >= 3) {
        score += rules.section_organization_bonus;
        patterns.push('Good section organization');
    } else {
        issues.push('Missing section headers for organization');
    }
    
    // Check for proper module header
    if (content.includes('// PURPOSE:') && content.includes('// DEPENDENCIES:')) {
        score += rules.header_structure_bonus;
        patterns.push('Complete module header structure');
    } else {
        issues.push('Incomplete module header structure');
    }
    
    // Check naming conventions (camelCase for functions, UPPER for constants)
    const functionNames = extractFunctionNames(content);
    const goodNaming = functionNames.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name));
    const namingPercentage = functionNames.length > 0 ? (goodNaming.length / functionNames.length) * 100 : 0;
    
    if (namingPercentage >= 90) {
        score += rules.naming_convention_bonus;
        patterns.push('Consistent naming conventions');
    } else if (namingPercentage < 70) {
        issues.push('Inconsistent function naming conventions');
    }
    
    // Check for consistent indentation (simplified)
    const lines = content.split('\n');
    const indentedLines = lines.filter(line => line.match(/^    \w/) || line.match(/^\t\w/));
    const indentationConsistency = lines.length > 0 ? (indentedLines.length / lines.length) * 100 : 0;
    
    if (indentationConsistency >= 70) {
        score += rules.consistent_formatting_bonus;
        patterns.push('Consistent indentation');
    }
    
    return {
        score: score,
        patterns: patterns,
        issues: issues,
        naming_convention_percentage: Math.round(namingPercentage),
        indentation_consistency: Math.round(indentationConsistency),
        has_section_organization: (sectionHeaders && sectionHeaders.length >= 3),
        has_complete_header: content.includes('// PURPOSE:') && content.includes('// DEPENDENCIES:')
    };
}

/**
 * Extract function names from content
 * @param {string} content - File content
 * @returns {Array} Array of function names
 */
function extractFunctionNames(content) {
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const names = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
        names.push(match[1]);
    }
    
    return names;
}

/**
 * Check performance patterns
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Performance patterns analysis
 */
function checkPerformancePatterns(content, functions) {
    const rules = QUALITY_RULES.performance_patterns;
    let score = 0;
    const warnings = [];
    const criticalIssues = [];
    
    // Check for eval usage (critical security/performance issue)
    const evalUsage = content.match(/\beval\s*\(/g);
    if (evalUsage) {
        score -= evalUsage.length * rules.eval_usage_penalty;
        criticalIssues.push({
            type: 'eval_usage',
            count: evalUsage.length,
            severity: 'critical'
        });
    }
    
    // Check for dynamic code generation patterns
    const dynamicPatterns = [
        'new Function(',
        'document.write(',
        'innerHTML =',
        'outerHTML ='
    ];
    
    dynamicPatterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern.replace('(', '\\('), 'g'));
        if (matches) {
            score -= matches.length * rules.dynamic_code_penalty;
            warnings.push({
                type: 'dynamic_code',
                pattern: pattern,
                count: matches.length
            });
        }
    });
    
    // Check for nested loops (simplified detection)
    const nestedLoopPattern = /for\s*\([^}]*for\s*\(/g;
    const nestedLoops = content.match(nestedLoopPattern);
    if (nestedLoops && nestedLoops.length > rules.loop_complexity_warning) {
        warnings.push({
            type: 'nested_loops',
            count: nestedLoops.length,
            warning: 'Multiple nested loops detected'
        });
    }
    
    // Check for potential recursion
    const allFunctions = [...functions.global_functions, ...functions.nested_functions];
    const recursiveFunctions = allFunctions.filter(func => {
        const funcStart = content.indexOf(`function ${func.name}`);
        if (funcStart > -1) {
            const funcEnd = findFunctionEnd(content, funcStart);
            const funcContent = content.substring(funcStart, funcEnd);
            return funcContent.includes(func.name + '(');
        }
        return false;
    });
    
    if (recursiveFunctions.length > rules.recursion_depth_warning) {
        warnings.push({
            type: 'recursive_functions',
            count: recursiveFunctions.length,
            functions: recursiveFunctions.map(f => f.name)
        });
    }
    
    return {
        score: score,
        warnings: warnings,
        critical_issues: criticalIssues,
        has_eval_usage: evalUsage && evalUsage.length > 0,
        has_dynamic_code: dynamicPatterns.some(pattern => content.includes(pattern)),
        nested_loop_count: nestedLoops ? nestedLoops.length : 0,
        recursive_function_count: recursiveFunctions.length
    };
}

/**
 * Find end of function (simplified)
 * @param {string} content - File content
 * @param {number} startIndex - Function start index
 * @returns {number} Function end index
 */
function findFunctionEnd(content, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') {
            inFunction = true;
            braceCount++;
        } else if (content[i] === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                return i + 1;
            }
        }
    }
    
    return content.length;
}

/**
 * Check documentation quality
 * @param {string} content - File content
 * @param {Object} functions - Functions object
 * @returns {Object} Documentation quality analysis
 */
function checkDocumentationQuality(content, functions) {
    const rules = QUALITY_RULES.documentation_quality;
    let score = 0;
    const patterns = [];
    const issues = [];
    
    // Check for JSDoc comments
    const jsdocComments = content.match(/\/\*\*[\s\S]*?\*\//g);
    const jsdocCount = jsdocComments ? jsdocComments.length : 0;
    const totalFunctions = functions.total_count;
    
    const jsdocCoverage = totalFunctions > 0 ? (jsdocCount / totalFunctions) * 100 : 0;
    
    if (jsdocCoverage >= 80) {
        score += rules.jsdoc_coverage_bonus * jsdocCount;
        patterns.push('Excellent JSDoc coverage');
    } else if (jsdocCoverage >= 50) {
        score += (rules.jsdoc_coverage_bonus * jsdocCount) / 2;
        patterns.push('Good JSDoc coverage');
    } else if (jsdocCount === 0) {
        issues.push('No JSDoc comments found');
    }
    
    // Check for inline comments quality
    const lines = content.split('\n');
    const commentLines = lines.filter(line => line.trim().startsWith('//') && line.length > 10);
    const commentDensity = lines.length > 0 ? (commentLines.length / lines.length) * 100 : 0;
    
    if (commentDensity >= 15) {
        score += rules.comment_quality_bonus;
        patterns.push('Good comment density');
    } else if (commentDensity < 5) {
        issues.push('Very low comment density');
    }
    
    // Check for usage examples in comments
    const hasExamples = content.includes('@example') || 
                       content.includes('// Example:') || 
                       content.includes('// Usage:');
    
    if (hasExamples) {
        score += rules.example_code_bonus;
        patterns.push('Contains usage examples');
    }
    
    // Check for references to external documentation
    const hasReferences = content.includes('@see') || 
                         content.includes('README') || 
                         content.includes('documentation');
    
    if (hasReferences) {
        score += rules.readme_references_bonus;
        patterns.push('References external documentation');
    }
    
    return {
        score: score,
        patterns: patterns,
        issues: issues,
        jsdoc_coverage_percentage: Math.round(jsdocCoverage),
        comment_density_percentage: Math.round(commentDensity),
        has_usage_examples: hasExamples,
        has_external_references: hasReferences,
        total_jsdoc_comments: jsdocCount,
        total_inline_comments: commentLines.length
    };
}

/**
 * Check configuration validation patterns
 * @param {string} content - File content
 * @returns {Object} Configuration validation analysis
 */
function checkConfigurationValidation(content) {
    const rules = QUALITY_RULES.configuration_validation;
    let score = 0;
    const patterns = [];
    const issues = [];
    
    // Check for configuration objects
    const configObjects = content.match(/\w+_CONFIG\s*=/g);
    const configCount = configObjects ? configObjects.length : 0;
    
    if (configCount > 0) {
        patterns.push(`Found ${configCount} configuration object(s)`);
        
        // Check for default value handling
        if (content.includes('|| DEFAULT_') || content.includes('defaultValue')) {
            score += rules.default_value_handling_bonus;
            patterns.push('Uses default value patterns');
        }
        
        // Check for validation functions
        if (content.includes('validate') && content.includes('Config')) {
            score += rules.validation_function_bonus;
            patterns.push('Has configuration validation');
        } else {
            issues.push('No configuration validation found');
        }
        
        // Check for proper structure
        if (content.includes('{') && content.includes('}') && configCount > 0) {
            score += rules.config_object_structure_bonus;
            patterns.push('Proper configuration object structure');
        }
    } else {
        patterns.push('No configuration objects detected');
    }
    
    return {
        score: score,
        patterns: patterns,
        issues: issues,
        configuration_object_count: configCount,
        has_default_handling: content.includes('|| DEFAULT_') || content.includes('defaultValue'),
        has_validation: content.includes('validate') && content.includes('Config')
    };
}

/**
 * Check security patterns
 * @param {string} content - File content
 * @returns {Object} Security patterns analysis
 */
function checkSecurityPatterns(content) {
    const securityIssues = [];
    const warnings = [];
    let score = 0;
    
    // Check for eval usage (already checked in performance, but security-focused)
    if (content.includes('eval(')) {
        securityIssues.push({
            type: 'eval_usage',
            severity: 'critical',
            description: 'eval() can execute arbitrary code'
        });
        score -= 100;
    }
    
    // Check for Function constructor
    if (content.includes('new Function(')) {
        securityIssues.push({
            type: 'function_constructor',
            severity: 'high',
            description: 'Function constructor can execute arbitrary code'
        });
        score -= 50;
    }
    
    // Check for document.write (if in web context)
    if (content.includes('document.write')) {
        warnings.push({
            type: 'document_write',
            severity: 'medium',
            description: 'document.write can be vulnerable to XSS'
        });
        score -= 25;
    }
    
    // Check for innerHTML usage
    if (content.includes('innerHTML')) {
        warnings.push({
            type: 'innerHTML_usage',
            severity: 'medium',
            description: 'innerHTML can be vulnerable to XSS if not sanitized'
        });
        score -= 10;
    }
    
    // Positive patterns - input validation
    if (content.includes('validate') || content.includes('sanitize')) {
        score += 15;
    }
    
    // Positive patterns - error handling
    if (content.includes('try') && content.includes('catch')) {
        score += 10;
    }
    
    return {
        score: score,
        security_issues: securityIssues,
        warnings: warnings,
        has_eval_usage: content.includes('eval('),
        has_function_constructor: content.includes('new Function('),
        has_input_validation: content.includes('validate') || content.includes('sanitize'),
        risk_level: securityIssues.length > 0 ? 'HIGH' : warnings.length > 0 ? 'MEDIUM' : 'LOW'
    };
}

/**
 * Compare version arrays
 * @param {Array} a - First version
 * @param {Array} b - Second version
 * @returns {number} Comparison result
 */
function compareVersions(a, b) {
    const maxLength = Math.max(a.length, b.length);
    
    for (let i = 0; i < maxLength; i++) {
        const aVal = a[i] || 0;
        const bVal = b[i] || 0;
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
    }
    
    return 0;
}

// ============================================================================
// HEALTH SCORE CALCULATION
// ============================================================================

/**
 * Calculate overall health score
 * @param {Object} qualityAnalysis - Quality analysis results
 * @returns {Object} Health score analysis
 */
function calculateHealthScore(qualityAnalysis) {
    let totalScore = 1000; // Start with perfect score
    const penalties = [];
    const bonuses = [];
    
    // Apply penalties and bonuses from each category
    Object.keys(qualityAnalysis).forEach(category => {
        const analysis = qualityAnalysis[category];
        
        if (analysis && typeof analysis === 'object') {
            if (analysis.total_penalty) {
                totalScore -= analysis.total_penalty;
                penalties.push({
                    category: category,
                    penalty: analysis.total_penalty,
                    reason: `${category} violations`
                });
            }
            
            if (analysis.score && analysis.score > 0) {
                totalScore += analysis.score;
                bonuses.push({
                    category: category,
                    bonus: analysis.score,
                    reason: `${category} compliance`
                });
            } else if (analysis.score && analysis.score < 0) {
                totalScore += analysis.score; // score is negative, so this subtracts
                penalties.push({
                    category: category,
                    penalty: Math.abs(analysis.score),
                    reason: `${category} issues`
                });
            }
            
            if (analysis.net_score) {
                totalScore += analysis.net_score;
                if (analysis.net_score > 0) {
                    bonuses.push({
                        category: category,
                        bonus: analysis.net_score,
                        reason: `${category} net positive`
                    });
                } else {
                    penalties.push({
                        category: category,
                        penalty: Math.abs(analysis.net_score),
                        reason: `${category} net negative`
                    });
                }
            }
        }
    });
    
    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);
    
    // Determine grade
    let grade = 'F';
    for (const [gradeLevel, threshold] of Object.entries(HEALTH_THRESHOLDS)) {
        if (totalScore >= threshold) {
            grade = gradeLevel;
            break;
        }
    }
    
    // Check for critical failures
    const criticalViolations = qualityAnalysis.critical_violations || [];
    if (criticalViolations.length > 0) {
        grade = 'F';
        totalScore = Math.min(totalScore, 300); // Cap at very low score for critical issues
    }
    
    return {
        total_score: Math.round(totalScore),
        grade: grade,
        critical_violations: criticalViolations,
        penalties: penalties,
        bonuses: bonuses,
        max_possible_score: 1000,
        percentage: Math.round((totalScore / 1000) * 100)
    };
}

// ============================================================================
// FOLDER STATISTICS AND COMPARISON
// ============================================================================

/**
 * Generate folder-level statistics with cross-module analysis
 * @param {Array} moduleAnalyses - Array of module analyses
 * @param {Object} folderInfo - Folder information
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {Object} Folder statistics
 */
function generateFolderStatistics(moduleAnalyses, folderInfo, crossModuleAnalysis) {
    const successful = moduleAnalyses.filter(m => m.success);
    
    if (successful.length === 0) {
        return {
            total_modules: moduleAnalyses.length,
            successful_analyses: 0,
            failed_analyses: moduleAnalyses.length,
            overall_health: 'F',
            cross_module_issues: {
                function_duplicates: 0,
                dependency_violations: 0,
                consolidation_opportunities: 0
            }
        };
    }
    
    // Calculate aggregate statistics
    const totalFunctions = successful.reduce((sum, m) => sum + m.functions.total_count, 0);
    const totalLines = successful.reduce((sum, m) => sum + m.metadata.line_count, 0);
    const averageHealth = Math.round(successful.reduce((sum, m) => sum + m.health.total_score, 0) / successful.length);
    
    // Determine overall folder grade
    let folderGrade = 'F';
    for (const [grade, threshold] of Object.entries(HEALTH_THRESHOLDS)) {
        if (averageHealth >= threshold) {
            folderGrade = grade;
            break;
        }
    }
    
    return {
        folder_name: folderInfo.name,
        total_modules: moduleAnalyses.length,
        successful_analyses: successful.length,
        failed_analyses: moduleAnalyses.length - successful.length,
        
        aggregate_metrics: {
            total_functions: totalFunctions,
            total_lines_of_code: totalLines,
            average_module_size: Math.round(totalLines / successful.length),
            average_functions_per_module: Math.round(totalFunctions / successful.length)
        },
        
        health_summary: {
            average_health_score: averageHealth,
            overall_grade: folderGrade,
            modules_with_critical_issues: successful.filter(m => m.health.critical_violations.length > 0).length,
            grade_distribution: calculateGradeDistribution(successful)
        },
        
        compliance_summary: {
            modules_with_perfect_registration: successful.filter(m => 
                m.registration.compliance_issues.accuracy_percentage === 100).length,
            average_registration_accuracy: Math.round(
                successful.reduce((sum, m) => sum + (m.registration.compliance_issues.accuracy_percentage || 0), 0) / successful.length
            ),
            es3_compliant_modules: successful.filter(m => m.quality.es3_compliance.compliant).length
        },
        
        // NEW: Cross-module analysis summary
        cross_module_analysis: {
            total_function_similarities: crossModuleAnalysis.function_similarities.length,
            high_similarity_matches: crossModuleAnalysis.function_similarities.filter(s => s.similarity_percentage >= 85).length,
            exact_duplicates: crossModuleAnalysis.duplicate_functions.length,
            dependency_violations: crossModuleAnalysis.dependency_violations.length,
            consolidation_opportunities: crossModuleAnalysis.consolidation_opportunities.length,
            
            // Categorize violations by severity
            critical_violations: crossModuleAnalysis.dependency_violations.filter(v => v.violation_type === 'reverse_dependency').length,
            function_duplication_score: calculateDuplicationScore(crossModuleAnalysis),
            dependency_health_score: calculateDependencyHealthScore(crossModuleAnalysis, successful.length)
        },
        
        analysis_timestamp: new Date().toISOString()
    };
}

/**
 * Calculate function duplication score
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {number} Duplication score (0-100, higher is better)
 */
function calculateDuplicationScore(crossModuleAnalysis) {
    const exactDuplicates = crossModuleAnalysis.duplicate_functions.length;
    const highSimilarities = crossModuleAnalysis.function_similarities.filter(s => s.similarity_percentage >= 85).length;
    
    // Penalize duplicates more heavily
    const totalIssues = (exactDuplicates * 3) + highSimilarities;
    
    // Score decreases with more issues (simplified scoring)
    return Math.max(0, 100 - (totalIssues * 10));
}

/**
 * Calculate dependency health score
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @param {number} moduleCount - Number of modules
 * @returns {number} Dependency health score (0-100, higher is better)
 */
function calculateDependencyHealthScore(crossModuleAnalysis, moduleCount) {
    const violations = crossModuleAnalysis.dependency_violations.length;
    
    if (moduleCount <= 1) return 100; // Single module - no dependency issues
    
    // Each violation reduces score
    const maxViolations = moduleCount * 2; // Rough estimate of max possible violations
    const violationPenalty = (violations / maxViolations) * 100;
    
    return Math.max(0, 100 - violationPenalty);
}

/**
 * Calculate grade distribution
 * @param {Array} modules - Module analyses
 * @returns {Object} Grade distribution
 */
function calculateGradeDistribution(modules) {
    const distribution = {};
    
    // Initialize all grades to 0
    Object.keys(HEALTH_THRESHOLDS).forEach(grade => {
        distribution[grade] = 0;
    });
    distribution['F'] = 0;
    
    // Count each module's grade
    modules.forEach(module => {
        const grade = module.health.grade;
        distribution[grade] = (distribution[grade] || 0) + 1;
    });
    
    return distribution;
}

/**
 * Detect comparison opportunities (same decimal prefix)
 * @param {Array} moduleAnalyses - Array of module analyses
 * @returns {Array} Array of comparison groups
 */
function detectComparisonOpportunities(moduleAnalyses) {
    const groups = {};
    
    // Group modules by decimal prefix
    moduleAnalyses.forEach(module => {
        if (module.success && module.metadata.version_from_filename) {
            const prefix = module.metadata.version_from_filename;
            
            if (!groups[prefix]) {
                groups[prefix] = [];
            }
            groups[prefix].push(module);
        }
    });
    
    // Return only groups with multiple modules
    return Object.keys(groups)
        .filter(prefix => groups[prefix].length > 1)
        .map(prefix => ({
            decimal_prefix: prefix,
            modules: groups[prefix],
            comparison_available: true
        }));
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate YAML reports with cross-module analysis
 * @param {Object} folderStats - Folder statistics
 * @param {Array} moduleAnalyses - Module analyses
 * @param {Array} comparisonGroups - Comparison groups
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {Object} Report generation results
 */
function generateReports(folderStats, moduleAnalyses, comparisonGroups, folderInfo, timestamp, crossModuleAnalysis) {
    console.log(`📝 Generating enhanced YAML reports...`);
    
    const reports = [];
    
    try {
        // Generate main folder report
        const folderReport = generateFolderReport(folderStats, moduleAnalyses, folderInfo, timestamp, crossModuleAnalysis);
        reports.push(folderReport);
        
        // Generate comparison reports if applicable
        comparisonGroups.forEach(group => {
            const comparisonReport = generateComparisonReport(group, folderInfo, timestamp);
            reports.push(comparisonReport);
        });
        
        // Generate dedicated duplication report if duplicates found
        if (crossModuleAnalysis.function_similarities.length > 0 || crossModuleAnalysis.duplicate_functions.length > 0) {
            const duplicationReport = generateDuplicationReport(crossModuleAnalysis, folderInfo, timestamp);
            reports.push(duplicationReport);
        }
        
        console.log(`✅ Generated ${reports.length} report(s)`);
        return reports;
        
    } catch (error) {
        console.error(`❌ Error generating reports: ${error.message}`);
        return [];
    }
}

/**
 * Generate main folder report with cross-module analysis
 * @param {Object} folderStats - Folder statistics
 * @param {Array} moduleAnalyses - Module analyses
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {string} Report filename
 */
function generateFolderReport(folderStats, moduleAnalyses, folderInfo, timestamp, crossModuleAnalysis) {
    const reportFilename = `~analysis-${timestamp}-folder.yaml`;
    const reportPath = path.join(folderInfo.path, reportFilename);
    
    const reportContent = generateFolderReportYAML(folderStats, moduleAnalyses, crossModuleAnalysis);
    
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`   📄 Folder report: ${reportFilename}`);
    
    return reportFilename;
}

/**
 * Generate comparison report
 * @param {Object} comparisonGroup - Comparison group
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Report filename
 */
function generateComparisonReport(comparisonGroup, folderInfo, timestamp) {
    const reportFilename = `~analysis-${timestamp}-compare-${comparisonGroup.decimal_prefix}.yaml`;
    const reportPath = path.join(folderInfo.path, reportFilename);
    
    const reportContent = generateComparisonReportYAML(comparisonGroup);
    
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`   📊 Comparison report: ${reportFilename}`);
    
    return reportFilename;
}

/**
 * Generate folder report YAML content with cross-module analysis
 * @param {Object} folderStats - Folder statistics
 * @param {Array} moduleAnalyses - Module analyses
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {string} YAML content
 */
function generateFolderReportYAML(folderStats, moduleAnalyses, crossModuleAnalysis) {
    const yaml = [];
    
    // Header
    yaml.push('# MODULE ANALYSIS REPORT');
    yaml.push('# Generated by DocDom Module Analyzer - Document Analysis System');
    yaml.push(`# Timestamp: ${new Date().toISOString()}`);
    yaml.push('# ========================================');
    yaml.push('');
    
    // Folder summary
    yaml.push('folder_summary:');
    yaml.push(`  name: "${folderStats.folder_name}"`);
    yaml.push(`  total_modules: ${folderStats.total_modules}`);
    yaml.push(`  successful_analyses: ${folderStats.successful_analyses}`);
    yaml.push(`  failed_analyses: ${folderStats.failed_analyses}`);
    yaml.push(`  overall_grade: "${folderStats.health_summary.overall_grade}"`);
    yaml.push(`  average_health_score: ${folderStats.health_summary.average_health_score}`);
    yaml.push('');
    
    // Aggregate metrics
    yaml.push('aggregate_metrics:');
    Object.keys(folderStats.aggregate_metrics).forEach(key => {
        yaml.push(`  ${key}: ${folderStats.aggregate_metrics[key]}`);
    });
    yaml.push('');
    
    // NEW: Cross-module analysis summary
    yaml.push('cross_module_analysis:');
    yaml.push(`  function_similarities_found: ${crossModuleAnalysis.function_similarities ? crossModuleAnalysis.function_similarities.length : 0}`);
    yaml.push(`  high_similarity_matches: ${crossModuleAnalysis.function_similarities ? crossModuleAnalysis.function_similarities.filter(s => s.similarity_percentage >= 85).length : 0}`);
    yaml.push(`  exact_duplicates: ${crossModuleAnalysis.duplicate_functions ? crossModuleAnalysis.duplicate_functions.length : 0}`);
    yaml.push(`  dependency_violations: ${crossModuleAnalysis.dependency_violations ? crossModuleAnalysis.dependency_violations.length : 0}`);
    yaml.push(`  consolidation_opportunities: ${crossModuleAnalysis.consolidation_opportunities ? crossModuleAnalysis.consolidation_opportunities.length : 0}`);
    yaml.push(`  function_duplication_score: ${folderStats.cross_module_analysis ? folderStats.cross_module_analysis.function_duplication_score : 100}`);
    yaml.push(`  dependency_health_score: ${folderStats.cross_module_analysis ? folderStats.cross_module_analysis.dependency_health_score : 100}`);
    yaml.push('');
    
    // TOP DUPLICATION ISSUES (if any)
    if (crossModuleAnalysis.function_similarities && crossModuleAnalysis.function_similarities.length > 0) {
        yaml.push('top_similarity_issues:');
        const topSimilarities = crossModuleAnalysis.function_similarities
            .slice(0, 5)  // Top 5 issues
            .sort((a, b) => b.similarity_percentage - a.similarity_percentage);
        
        topSimilarities.forEach((sim, index) => {
            yaml.push(`  issue_${index + 1}:`);
            yaml.push(`    function_a: "${sim.function_a.name}" (${sim.function_a.module})`);
            yaml.push(`    function_b: "${sim.function_b.name}" (${sim.function_b.module})`);
            yaml.push(`    similarity: ${sim.similarity_percentage}%`);
            yaml.push(`    type: "${sim.similarity_type}"`);
            yaml.push(`    recommendation: "${sim.recommendation}"`);
        });
        yaml.push('');
    }
    
    // DEPENDENCY VIOLATIONS (if any)
    if (crossModuleAnalysis.dependency_violations && crossModuleAnalysis.dependency_violations.length > 0) {
        yaml.push('dependency_violations:');
        crossModuleAnalysis.dependency_violations.forEach((violation, index) => {
            yaml.push(`  violation_${index + 1}:`);
            yaml.push(`    type: "${violation.violation_type}"`);
            yaml.push(`    caller_module: "${violation.caller_module}"`);
            yaml.push(`    target_module: "${violation.target_module}"`);
            yaml.push(`    function: "${violation.called_function}"`);
            yaml.push(`    description: "${violation.description}"`);
        });
        yaml.push('');
    }
    
    // Grade distribution
    yaml.push('grade_distribution:');
    Object.keys(folderStats.health_summary.grade_distribution).forEach(grade => {
        const count = folderStats.health_summary.grade_distribution[grade];
        yaml.push(`  ${grade}: ${count}`);
    });
    yaml.push('');
    
    // Individual modules
    yaml.push('individual_modules:');
    moduleAnalyses.filter(m => m.success).forEach(module => {
        yaml.push(`  - filename: "${module.filename}"`);
        yaml.push(`    version: "${module.metadata.version_from_filename || 'unknown'}"`);
        yaml.push(`    line_count: ${module.metadata.line_count}`);
        yaml.push(`    function_count: ${module.functions.total_count}`);
        yaml.push(`    health_score: ${module.health.total_score}`);
        yaml.push(`    grade: "${module.health.grade}"`);
        yaml.push(`    registration_accuracy: ${module.registration.compliance_issues.accuracy_percentage}%`);
        yaml.push(`    es3_compliant: ${module.quality.es3_compliance.compliant}`);
        yaml.push(`    critical_violations: ${module.health.critical_violations.length}`);
        yaml.push(`    code_organization_score: ${(module.quality.code_organization && module.quality.code_organization.score) || 0}`);
        yaml.push(`    documentation_quality: ${(module.quality.documentation_quality && module.quality.documentation_quality.jsdoc_coverage_percentage) || 0}%`);
        yaml.push(`    security_risk_level: "${(module.quality.security_patterns && module.quality.security_patterns.risk_level) || 'UNKNOWN'}"`);
        yaml.push(`    performance_warnings: ${(module.quality.performance_patterns && module.quality.performance_patterns.warnings.length) || 0}`);
        yaml.push(`    intra_module_duplicates: ${(module.quality.function_similarity && module.quality.function_similarity.duplicates.length) || 0}`);
        yaml.push('');
    });
    
    // Failed analyses
    const failed = moduleAnalyses.filter(m => !m.success);
    if (failed.length > 0) {
        yaml.push('failed_analyses:');
        failed.forEach(module => {
            yaml.push(`  - filename: "${module.filename}"`);
            yaml.push(`    error: "${module.error}"`);
        });
        yaml.push('');
    }
    
    // Compliance summary
    yaml.push('compliance_summary:');
    Object.keys(folderStats.compliance_summary).forEach(key => {
        yaml.push(`  ${key}: ${folderStats.compliance_summary[key]}`);
    });
    yaml.push('');
    
    // Enhanced analysis summary
    yaml.push('quality_analysis_summary:');
    const successfulModules = moduleAnalyses.filter(m => m.success);
    if (successfulModules.length > 0) {
        // Calculate averages for new categories with safe access
        const avgCodeOrg = Math.round(successfulModules.reduce((sum, m) => 
            sum + ((m.quality.code_organization && m.quality.code_organization.score) || 0), 0) / successfulModules.length);
        const avgDocQuality = Math.round(successfulModules.reduce((sum, m) => 
            sum + ((m.quality.documentation_quality && m.quality.documentation_quality.jsdoc_coverage_percentage) || 0), 0) / successfulModules.length);
        const securityIssues = successfulModules.reduce((sum, m) => 
            sum + ((m.quality.security_patterns && m.quality.security_patterns.security_issues.length) || 0), 0);
        const performanceWarnings = successfulModules.reduce((sum, m) => 
            sum + ((m.quality.performance_patterns && m.quality.performance_patterns.warnings.length) || 0), 0);
        const intraModuleDuplicates = successfulModules.reduce((sum, m) => 
            sum + ((m.quality.function_similarity && m.quality.function_similarity.duplicates.length) || 0), 0);
        
        yaml.push(`  average_code_organization_score: ${avgCodeOrg}`);
        yaml.push(`  average_documentation_coverage: ${avgDocQuality}%`);
        yaml.push(`  total_security_issues: ${securityIssues}`);
        yaml.push(`  total_performance_warnings: ${performanceWarnings}`);
        yaml.push(`  total_intra_module_duplicates: ${intraModuleDuplicates}`);
        yaml.push(`  modules_with_security_issues: ${successfulModules.filter(m => 
            m.quality.security_patterns && m.quality.security_patterns.security_issues && m.quality.security_patterns.security_issues.length > 0).length}`);
        yaml.push(`  modules_with_performance_warnings: ${successfulModules.filter(m => 
            m.quality.performance_patterns && m.quality.performance_patterns.warnings && m.quality.performance_patterns.warnings.length > 0).length}`);
        yaml.push(`  modules_with_intra_duplicates: ${successfulModules.filter(m => 
            m.quality.function_similarity && m.quality.function_similarity.duplicates && m.quality.function_similarity.duplicates.length > 0).length}`);
    }
    yaml.push('');
    
/**
 * Generate dedicated duplication report
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Report filename
 */
function generateDuplicationReport(crossModuleAnalysis, folderInfo, timestamp) {
    const reportFilename = `~analysis-${timestamp}-duplicates.yaml`;
    const reportPath = path.join(folderInfo.path, reportFilename);
    
    const reportContent = generateDuplicationReportYAML(crossModuleAnalysis);
    
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`   🔄 Duplication report: ${reportFilename}`);
    
    return reportFilename;
}

/**
 * Generate duplication report YAML content
 * @param {Object} crossModuleAnalysis - Cross-module analysis results
 * @returns {string} YAML content
 */
function generateDuplicationReportYAML(crossModuleAnalysis) {
    const yaml = [];
    
    // Header
    yaml.push('# FUNCTION DUPLICATION & SIMILARITY REPORT');
    yaml.push('# Generated by DocDom Module Analyzer - Document Analysis System');
    yaml.push(`# Timestamp: ${new Date().toISOString()}`);
    yaml.push('# ========================================');
    yaml.push('');
    
    // Summary
    yaml.push('duplication_summary:');
    yaml.push(`  total_similarities_found: ${crossModuleAnalysis.function_similarities.length}`);
    yaml.push(`  exact_duplicates: ${crossModuleAnalysis.duplicate_functions.length}`);
    yaml.push(`  high_similarity_matches: ${crossModuleAnalysis.function_similarities.filter(s => s.similarity_percentage >= 85).length}`);
    yaml.push(`  consolidation_opportunities: ${crossModuleAnalysis.consolidation_opportunities.length}`);
    yaml.push('');
    
    // EXACT DUPLICATES (Critical - requires immediate action)
    if (crossModuleAnalysis.duplicate_functions.length > 0) {
        yaml.push('exact_duplicates:');
        yaml.push('  # CRITICAL: These functions appear to be identical and should be consolidated');
        crossModuleAnalysis.duplicate_functions.forEach((dup, index) => {
            yaml.push(`  duplicate_${index + 1}:`);
            yaml.push(`    original_function: "${dup.original.name}"`);
            yaml.push(`    original_module: "${dup.original.module}"`);
            yaml.push(`    duplicate_function: "${dup.duplicate.name}"`);
            yaml.push(`    duplicate_module: "${dup.duplicate.module}"`);
            yaml.push(`    action_required: "CONSOLIDATE IMMEDIATELY"`);
            yaml.push(`    recommendation: "${dup.recommendation}"`);
        });
        yaml.push('');
    }
    
    // HIGH SIMILARITY FUNCTIONS (requires review)
    const highSimilarity = crossModuleAnalysis.function_similarities.filter(s => s.similarity_percentage >= 85);
    if (highSimilarity.length > 0) {
        yaml.push('high_similarity_functions:');
        yaml.push('  # HIGH PRIORITY: These functions are very similar and likely candidates for consolidation');
        highSimilarity.forEach((sim, index) => {
            yaml.push(`  similarity_${index + 1}:`);
            yaml.push(`    function_a:`);
            yaml.push(`      name: "${sim.function_a.name}"`);
            yaml.push(`      module: "${sim.function_a.module}"`);
            yaml.push(`      purpose: "${sim.function_a.purpose}"`);
            yaml.push(`    function_b:`);
            yaml.push(`      name: "${sim.function_b.name}"`);
            yaml.push(`      module: "${sim.function_b.module}"`);
            yaml.push(`      purpose: "${sim.function_b.purpose}"`);
            yaml.push(`    similarity_percentage: ${sim.similarity_percentage}%`);
            yaml.push(`    similarity_type: "${sim.similarity_type}"`);
            yaml.push(`    same_module: ${sim.same_module}`);
            yaml.push(`    priority: "HIGH"`);
            yaml.push(`    recommendation: "${sim.recommendation}"`);
        });
        yaml.push('');
    }
    
    // MODERATE SIMILARITY FUNCTIONS (should be investigated)
    const moderateSimilarity = crossModuleAnalysis.function_similarities.filter(s => 
        s.similarity_percentage >= 75 && s.similarity_percentage < 85);
    if (moderateSimilarity.length > 0) {
        yaml.push('moderate_similarity_functions:');
        yaml.push('  # MEDIUM PRIORITY: These functions have similar patterns - investigate for potential consolidation');
        moderateSimilarity.forEach((sim, index) => {
            yaml.push(`  similarity_${index + 1}:`);
            yaml.push(`    function_a: "${sim.function_a.name}" (${sim.function_a.module})`);
            yaml.push(`    function_b: "${sim.function_b.name}" (${sim.function_b.module})`);
            yaml.push(`    similarity_percentage: ${sim.similarity_percentage}%`);
            yaml.push(`    same_module: ${sim.same_module}`);
            yaml.push(`    priority: "MEDIUM"`);
            yaml.push(`    recommendation: "${sim.recommendation}"`);
        });
        yaml.push('');
    }
    
    // CONSOLIDATION OPPORTUNITIES (actionable recommendations)
    if (crossModuleAnalysis.consolidation_opportunities.length > 0) {
        yaml.push('consolidation_opportunities:');
        yaml.push('  # ACTIONABLE: Specific consolidation recommendations with effort estimates');
        crossModuleAnalysis.consolidation_opportunities.forEach((opp, index) => {
            yaml.push(`  opportunity_${index + 1}:`);
            yaml.push(`    type: "${opp.opportunity_type}"`);
            yaml.push(`    estimated_effort: "${opp.estimated_effort}"`);
            yaml.push(`    similarity: ${opp.similarity}%`);
            yaml.push(`    functions:`);
            opp.functions.forEach(func => {
                yaml.push(`      - "${func.name}" (${func.module})`);
            });
            yaml.push(`    recommendation: "${opp.recommendation}"`);
        });
        yaml.push('');
    }
    
    // DEPENDENCY VIOLATIONS (architectural issues)
    if (crossModuleAnalysis.dependency_violations.length > 0) {
        yaml.push('dependency_violations:');
        yaml.push('  # ARCHITECTURAL ISSUES: Violations of module dependency order');
        crossModuleAnalysis.dependency_violations.forEach((violation, index) => {
            yaml.push(`  violation_${index + 1}:`);
            yaml.push(`    type: "${violation.violation_type}"`);
            yaml.push(`    severity: "CRITICAL"`);
            yaml.push(`    caller_module: "${violation.caller_module}"`);
            yaml.push(`    caller_function: "${violation.caller_function}"`);
            yaml.push(`    target_module: "${violation.target_module}"`);
            yaml.push(`    target_function: "${violation.called_function}"`);
            yaml.push(`    issue: "Lower-numbered module calling higher-numbered module"`);
            yaml.push(`    fix_required: "Move function to lower module or restructure dependencies"`);
            yaml.push(`    description: "${violation.description}"`);
        });
        yaml.push('');
    }
    
    // ACTION PLAN
    yaml.push('recommended_action_plan:');
    yaml.push('  # PRIORITIZED ACTION PLAN for resolving duplication issues');
    
    let actionStep = 1;
    
    if (crossModuleAnalysis.duplicate_functions.length > 0) {
        yaml.push(`  step_${actionStep}:`);
        yaml.push(`    priority: "IMMEDIATE"`);
        yaml.push(`    action: "Remove exact duplicate functions"`);
        yaml.push(`    count: ${crossModuleAnalysis.duplicate_functions.length}`);
        yaml.push(`    effort: "LOW"`);
        yaml.push(`    description: "These are exact duplicates and can be safely removed"`);
        actionStep++;
    }
    
    if (crossModuleAnalysis.dependency_violations.length > 0) {
        yaml.push(`  step_${actionStep}:`);
        yaml.push(`    priority: "CRITICAL"`);
        yaml.push(`    action: "Fix dependency violations"`);
        yaml.push(`    count: ${crossModuleAnalysis.dependency_violations.length}`);
        yaml.push(`    effort: "MEDIUM"`);
        yaml.push(`    description: "Architectural violations that break module dependency order"`);
        actionStep++;
    }
    
    if (highSimilarity.length > 0) {
        yaml.push(`  step_${actionStep}:`);
        yaml.push(`    priority: "HIGH"`);
        yaml.push(`    action: "Review and consolidate highly similar functions"`);
        yaml.push(`    count: ${highSimilarity.length}`);
        yaml.push(`    effort: "MEDIUM"`);
        yaml.push(`    description: "Functions with >85% similarity likely serve the same purpose"`);
        actionStep++;
    }
    
    if (moderateSimilarity.length > 0) {
        yaml.push(`  step_${actionStep}:`);
        yaml.push(`    priority: "MEDIUM"`);
        yaml.push(`    action: "Investigate moderately similar functions"`);
        yaml.push(`    count: ${moderateSimilarity.length}`);
        yaml.push(`    effort: "LOW"`);
        yaml.push(`    description: "Review for potential overlap in functionality"`);
    }
    
    return yaml.join('\n');
}

/**
 * Extract information from header comments
 * @param {string} content - File content
 * @param {RegExp} pattern - Regex pattern to match
 * @returns {string|null} Extracted value
 */
function extractFromHeader(content, pattern) {
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

/**
 * Generate comparison report YAML content
 * @param {Object} comparisonGroup - Comparison group
 * @returns {string} YAML content
 */
function generateComparisonReportYAML(comparisonGroup) {
    const yaml = [];
    
    // Header
    yaml.push('# MODULE COMPARISON REPORT');
    yaml.push(`# Decimal Prefix: ${comparisonGroup.decimal_prefix}`);
    yaml.push(`# Modules Found: ${comparisonGroup.modules.length}`);
    yaml.push(`# Timestamp: ${new Date().toISOString()}`);
    yaml.push('# ========================================');
    yaml.push('');
    
    // Comparison summary
    yaml.push('comparison_summary:');
    yaml.push(`  decimal_prefix: "${comparisonGroup.decimal_prefix}"`);
    yaml.push(`  module_count: ${comparisonGroup.modules.length}`);
    yaml.push('  modules:');
    comparisonGroup.modules.forEach(module => {
        yaml.push(`    - "${module.filename}"`);
    });
    yaml.push('');
    
    // Side-by-side metrics
    yaml.push('side_by_side_comparison:');
    comparisonGroup.modules.forEach(module => {
        yaml.push(`  "${module.filename}":`);
        yaml.push(`    health_score: ${module.health.total_score}`);
        yaml.push(`    grade: "${module.health.grade}"`);
        yaml.push(`    line_count: ${module.metadata.line_count}`);
        yaml.push(`    function_count: ${module.functions.total_count}`);
        yaml.push(`    registration_accuracy: ${module.registration.compliance_issues.accuracy_percentage}%`);
        yaml.push(`    es3_compliant: ${module.quality.es3_compliance.compliant}`);
        yaml.push(`    critical_violations: ${module.health.critical_violations.length}`);
    });
    yaml.push('');
    
    // Change analysis (if more than one module)
    if (comparisonGroup.modules.length === 2) {
        const [moduleA, moduleB] = comparisonGroup.modules;
        yaml.push('change_analysis:');
        yaml.push(`  health_score_change: ${moduleB.health.total_score - moduleA.health.total_score}`);
        yaml.push(`  line_count_change: ${moduleB.metadata.line_count - moduleA.metadata.line_count}`);
        yaml.push(`  function_count_change: ${moduleB.functions.total_count - moduleA.functions.total_count}`);
        yaml.push(`  grade_change: "${moduleA.health.grade}" -> "${moduleB.health.grade}"`);
    }
    
    return yaml.join('\n');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate timestamp for file naming
 * @returns {string} Timestamp string in format YYYYMMDD-HHMMSS
 */
function generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

// ============================================================================
// REPORTING AND SUMMARY
// ============================================================================

/**
 * Show analysis summary for all processed folders
 * @param {Array} results - Array of analysis results
 */
function showAnalysisSummary(results) {
    console.log('\n🎉 Module Analysis Complete!');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 Analysis Statistics:');
    console.log(`• Folders analyzed: ${results.length}`);
    console.log(`• Successful analyses: ${successful.length}`);
    console.log(`• Failed analyses: ${failed.length}`);
    console.log(`• Total modules analyzed: ${successful.reduce((sum, r) => sum + r.moduleCount, 0)}`);
    console.log(`• Comparison reports generated: ${successful.reduce((sum, r) => sum + r.comparisonGroups.length, 0)}`);
    
    if (successful.length > 0) {
        console.log('\n✅ Successful Analyses:');
        successful.forEach(result => {
            const avgGrade = result.folderStats.health_summary.overall_grade;
            const avgScore = result.folderStats.health_summary.average_health_score;
            const duplicates = result.crossModuleAnalysis.duplicate_functions.length;
            const similarities = result.crossModuleAnalysis.function_similarities.length;
            const depViolations = result.crossModuleAnalysis.dependency_violations.length;
            
            console.log(`   📁 ${result.folderName}: ${result.moduleCount} modules (Grade: ${avgGrade}, Score: ${avgScore})`);
            
            if (duplicates > 0 || similarities > 0 || depViolations > 0) {
                console.log(`      🔄 Duplication analysis: ${duplicates} exact duplicates, ${similarities} similarities, ${depViolations} dependency violations`);
            } else {
                console.log(`      ✨ No function duplication or dependency issues detected`);
            }
            
            result.reports.forEach(report => {
                console.log(`      📄 ${report}`);
            });
            
            if (result.comparisonGroups.length > 0) {
                console.log(`      📊 ${result.comparisonGroups.length} comparison group(s) detected`);
            }
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed Analyses:');
        failed.forEach(result => {
            console.log(`   📁 ${result.folderName}: ${result.error}`);
        });
    }
    
    console.log('\n📝 Generated Reports:');
    console.log('Each folder now contains comprehensive YAML analysis reports:');
    console.log('• ~analysis-{timestamp}-folder.yaml       (comprehensive folder analysis)');
    console.log('• ~analysis-{timestamp}-compare-{ver}.yaml (comparison when applicable)');
    console.log('• ~analysis-{timestamp}-duplicates.yaml   (function duplication analysis)');
    
    console.log('\n🔍 Analysis Categories:');
    console.log('• ✅ ES3 Compatibility & Reserved Word Safety');
    console.log('• ✅ Function Architecture & Registration Compliance');
    console.log('• ✅ Dependency Order & Circular Reference Detection');
    console.log('• ✅ Logging System Modernization Compliance');
    console.log('• ✅ Memory Management & Performance Patterns');
    console.log('• ✅ Code Organization & Documentation Quality');
    console.log('• ✅ Security Pattern Analysis & Risk Assessment');
    console.log('• ✅ Configuration Validation & API Usage Analysis');
    console.log('• 🆕 Function Similarity & Duplication Detection (NEW!)');
    console.log('• 🆕 Cross-Module Dependency Flow Validation (NEW!)');
    console.log('• 🆕 Consolidation Opportunity Identification (NEW!)');
    
    console.log('\n🔄 Duplication Detection Features:');
    console.log('• 📊 Similarity scoring with configurable thresholds (default: 75%)');
    console.log('• 🎯 Multi-factor analysis: signature, content, API calls, purpose');
    console.log('• 🔍 Exact duplicate detection across modules');
    console.log('• ⚠️  Dependency direction violation detection');
    console.log('• 💡 Actionable consolidation recommendations');
    console.log('• 📈 Effort estimation for consolidation tasks');
    
    console.log('\n🎯 Health Score Guide:');
    console.log('• A+ (950-1000): Exemplary architecture compliance');
    console.log('• A  (900-949):  Excellent with minor issues');
    console.log('• B+ (850-899):  Good compliance, some improvements needed');
    console.log('• B  (800-849):  Acceptable with notable issues');
    console.log('• C+ (750-799):  Below standard, requires attention');
    console.log('• C  (700-749):  Poor compliance, needs refactoring');
    console.log('• D  (600-699):  Critical issues present');
    console.log('• F  (<600):     Unacceptable, major problems');
    
    console.log('\n📂 GitIgnore Recommendations:');
    console.log('Add this pattern to .gitignore:');
    console.log('~analysis-*.yaml');
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        folder: null,
        help: false,
        compareMode: false
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--folder' || arg === '-f') {
            options.folder = args[i + 1];
            i++; // Skip next argument
        } else if (arg === '--compare-mode' || arg === '-c') {
            options.compareMode = true;
        }
    }
    
    return options;
}

/**
 * Show help information
 */
function showHelp() {
    console.log('🔬 DocDom Module Analyzer - Document Analysis System');
    console.log('='.repeat(55));
    console.log('');
    console.log('USAGE:');
    console.log('  node module-analyzer.js [options]');
    console.log('');
    console.log('OPTIONS:');
    console.log('  --folder, -f <path>     Analyze only the specified folder');
    console.log('  --compare-mode, -c      Focus on comparison reports only');
    console.log('  --help, -h              Show this help message');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  node module-analyzer.js                     # Analyze all project folders');
    console.log('  node module-analyzer.js -f ../DocDomV3.1    # Analyze specific folder');
    console.log('  node module-analyzer.js -c                  # Generate comparison reports only');
    console.log('');
    console.log('OUTPUT:');
    console.log('  Each folder containing modules will get:');
    console.log('  • ~analysis-{timestamp}-folder.yaml          (comprehensive analysis)');
    console.log('  • ~analysis-{timestamp}-compare-{ver}.yaml   (when same decimal prefix found)');
    console.log('  • ~analysis-{timestamp}-duplicates.yaml     (function duplication analysis)');
    console.log('');
    console.log('ANALYSIS FEATURES:');
    console.log('  • Function extraction and registration verification');
    console.log('  • ES3 compatibility checking');
    console.log('  • Architecture-specific quality rules');
    console.log('  • Health scoring (A+ to F grades)');
    console.log('  • Context-driven comparison reports');
    console.log('  • Memory management pattern analysis');
    console.log('  • Logging system compliance checking');
    console.log('  • Code organization and documentation quality');
    console.log('  • Performance and security pattern detection');
    console.log('  • Configuration validation analysis');
    console.log('  • 🆕 Function similarity detection with configurable thresholds');
    console.log('  • 🆕 Cross-module dependency direction validation');
    console.log('  • 🆕 Exact duplicate detection and consolidation recommendations');
    console.log('  • 🆕 Multi-factor similarity scoring (signature, content, calls, purpose)');
    console.log('');
    console.log('DUPLICATION DETECTION:');
    console.log('  • Configurable similarity threshold (default: 75%)');
    console.log('  • Exact duplicate identification across modules');
    console.log('  • Dependency flow violation detection');
    console.log('  • Actionable consolidation recommendations with effort estimates');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main execution function
 */
function main() {
    console.log('🔬 DocDom Module Analyzer - Document Analysis System');
    console.log('===================================================');
    
    // Parse command line arguments
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        return;
    }
    
    try {
        let foldersToProcess;
        
        if (options.folder) {
            // Process specific folder
            const targetPath = path.resolve(options.folder);
            if (!fs.existsSync(targetPath)) {
                throw new Error(`Folder does not exist: ${options.folder}`);
            }
            
            console.log(`📁 Analyzing specific folder: ${options.folder}`);
            
            // Create folder info for single folder
            const files = fs.readdirSync(targetPath)
                .filter(file => ANALYZER_CONFIG.FILE_PATTERN.test(file))
                .filter(file => !isFileExcluded(file));
            
            if (files.length === 0) {
                throw new Error(`No matching module files found in: ${options.folder}`);
            }
            
            foldersToProcess = [{
                name: path.basename(targetPath),
                path: targetPath,
                relativePath: path.relative(path.resolve(__dirname, '..'), targetPath),
                moduleFiles: files,
                moduleCount: files.length
            }];
            
        } else {
            // Discover all project folders
            foldersToProcess = discoverProjectFolders();
        }
        
        if (foldersToProcess.length === 0) {
            console.log('⚠️  No folders with module files found.');
            console.log('💡 Create folders with files matching pattern: 1.2_*.jsx, 1.2.1_*.jsx, etc.');
            return;
        }
        
        // Process each folder
        const results = [];
        
        foldersToProcess.forEach(folderInfo => {
            const result = analyzeModulesInFolder(folderInfo);
            results.push(result);
        });
        
        // Show summary
        showAnalysisSummary(results);
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error('\n🔧 Check your configuration and try again');
        process.exit(1);
    }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
    main();
}