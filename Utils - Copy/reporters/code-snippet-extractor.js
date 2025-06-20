// ============================================================================
// CODE SNIPPET EXTRACTOR
// Extract and format code snippets for inclusion in reports
// ============================================================================

import fs from 'fs';
import chalk from 'chalk';

/**
 * Format code snippet for YAML inclusion
 * @param {string} code - Raw code to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted code snippet
 */
export const formatCodeSnippet = (code, options = {}) => {
    const {
        maxLength = 120,
        maxLines = 10,
        stripComments = false,
        addLineNumbers = false,
        indentLevel = 0
    } = options;

    if (!code || typeof code !== 'string') {
        return 'No code available';
    }

    let lines = code.split('\n');

    // Strip comments if requested
    if (stripComments) {
        lines = lines.filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
        });
    }

    // Limit number of lines
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines.push('... (truncated)');
    }

    // Truncate long lines
    lines = lines.map(line => {
        if (line.length > maxLength) {
            return line.substring(0, maxLength - 3) + '...';
        }
        return line;
    });

    // Add line numbers if requested
    if (addLineNumbers) {
        const digits = String(lines.length).length;
        lines = lines.map((line, index) => {
            const lineNum = String(index + 1).padStart(digits, ' ');
            return `${lineNum}: ${line}`;
        });
    }

    // Add indentation
    if (indentLevel > 0) {
        const indent = '  '.repeat(indentLevel);
        lines = lines.map(line => line ? indent + line : '');
    }

    return lines.join('\n');
};

/**
 * Extract function code from file content
 * @param {string} filePath - Path to source file
 * @param {string} functionName - Name of function to extract
 * @param {Object} options - Extraction options
 * @returns {Object} Extraction result
 */
export const extractFunctionCode = (filePath, functionName, options = {}) => {
    try {
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'File not found',
                functionName
            };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Find function definition
        const functionPattern = new RegExp(`function\\s+${functionName}\\s*\\(`);
        let startLine = -1;

        for (let i = 0; i < lines.length; i++) {
            if (functionPattern.test(lines[i])) {
                startLine = i;
                break;
            }
        }

        if (startLine === -1) {
            return {
                success: false,
                error: 'Function not found',
                functionName
            };
        }

        // Find function end by tracking braces
        let braceCount = 0;
        let endLine = startLine;
        let inFunction = false;

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            for (let char of line) {
                if (char === '{') {
                    inFunction = true;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (inFunction && braceCount === 0) {
                        endLine = i;
                        break;
                    }
                }
            }

            if (inFunction && braceCount === 0) {
                break;
            }
        }

        // Extract function lines
        const functionLines = lines.slice(startLine, endLine + 1);
        const rawCode = functionLines.join('\n');

        // Extract function signature
        const signature = lines[startLine].trim();

        // Get function comment (look backwards for JSDoc or comments)
        let comment = '';
        for (let i = startLine - 1; i >= Math.max(0, startLine - 10); i--) {
            const line = lines[i].trim();
            if (line.includes('/**') || line.includes('*/')) {
                // Extract JSDoc block
                let jsdocStart = i;
                for (let j = i; j >= Math.max(0, startLine - 15); j--) {
                    if (lines[j].includes('/**')) {
                        jsdocStart = j;
                        break;
                    }
                }
                comment = lines.slice(jsdocStart, startLine).join('\n');
                break;
            } else if (line.startsWith('//') && line.length > 5) {
                comment = line;
                break;
            }
        }

        return {
            success: true,
            functionName,
            signature,
            comment,
            rawCode,
            formattedCode: formatCodeSnippet(rawCode, options),
            lineCount: functionLines.length,
            startLine: startLine + 1, // 1-based for display
            endLine: endLine + 1
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            functionName
        };
    }
};

/**
 * Extract multiple function codes for comparison
 * @param {Array} functionSpecs - Array of {filePath, functionName} objects
 * @param {Object} options - Extraction options
 * @returns {Object} Comparison extraction result
 */
export const extractFunctionsForComparison = (functionSpecs, options = {}) => {
    const results = {
        success: true,
        functions: [],
        errors: []
    };

    functionSpecs.forEach(spec => {
        const extraction = extractFunctionCode(spec.filePath, spec.functionName, options);

        if (extraction.success) {
            results.functions.push({
                ...extraction,
                source: spec.source || spec.filePath,
                module: spec.module || 'unknown'
            });
        } else {
            results.errors.push(extraction);
            results.success = false;
        }
    });

    return results;
};

/**
 * Create side-by-side code comparison
 * @param {Array} functionCodes - Array of function code objects
 * @param {Object} options - Comparison options
 * @returns {Object} Side-by-side comparison
 */
export const createSideBySideComparison = (functionCodes, options = {}) => {
    if (functionCodes.length < 2) {
        return {
            success: false,
            error: 'Need at least 2 functions for comparison'
        };
    }

    const comparison = {
        success: true,
        function_count: functionCodes.length,
        comparisons: []
    };

    // Compare first function against all others
    const baseFunction = functionCodes[0];

    for (let i = 1; i < functionCodes.length; i++) {
        const compareFunction = functionCodes[i];

        comparison.comparisons.push({
            base_function: {
                name: baseFunction.functionName,
                source: baseFunction.source,
                signature: baseFunction.signature,
                line_count: baseFunction.lineCount,
                code: baseFunction.formattedCode
            },

            compare_function: {
                name: compareFunction.functionName,
                source: compareFunction.source,
                signature: compareFunction.signature,
                line_count: compareFunction.lineCount,
                code: compareFunction.formattedCode
            },

            differences: analyzeFunctionDifferences(baseFunction, compareFunction),

            similarity_notes: generateSimilarityNotes(baseFunction, compareFunction)
        });
    }

    return comparison;
};

/**
 * Analyze differences between two functions
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function
 * @returns {Object} Differences analysis
 */
const analyzeFunctionDifferences = (funcA, funcB) => {
    const differences = {
        signature_different: funcA.signature !== funcB.signature,
        line_count_difference: funcB.lineCount - funcA.lineCount,
        has_structural_differences: false,
        key_differences: []
    };

    // Signature analysis
    if (differences.signature_different) {
        differences.key_differences.push('Function signatures differ');
    }

    // Line count analysis
    if (Math.abs(differences.line_count_difference) > 5) {
        differences.key_differences.push(
            `Significant size difference: ${differences.line_count_difference > 0 ? '+' : ''}${differences.line_count_difference} lines`
        );
    }

    // Basic structural analysis
    const linesA = funcA.rawCode.split('\n');
    const linesB = funcB.rawCode.split('\n');

    const braceCountA = (funcA.rawCode.match(/{/g) || []).length;
    const braceCountB = (funcB.rawCode.match(/{/g) || []).length;

    if (Math.abs(braceCountA - braceCountB) > 2) {
        differences.has_structural_differences = true;
        differences.key_differences.push('Different structural complexity (brace count differs significantly)');
    }

    // Check for error handling differences
    const hasErrorHandlingA = funcA.rawCode.includes('try {') && funcA.rawCode.includes('catch (');
    const hasErrorHandlingB = funcB.rawCode.includes('try {') && funcB.rawCode.includes('catch (');

    if (hasErrorHandlingA !== hasErrorHandlingB) {
        differences.key_differences.push(
            hasErrorHandlingB ? 'Error handling added' : 'Error handling removed'
        );
    }

    // Check for logging differences
    const hasLoggingA = funcA.rawCode.includes('log') || funcA.rawCode.includes('$.writeln');
    const hasLoggingB = funcB.rawCode.includes('log') || funcB.rawCode.includes('$.writeln');

    if (hasLoggingA !== hasLoggingB) {
        differences.key_differences.push(
            hasLoggingB ? 'Logging added' : 'Logging removed'
        );
    }

    return differences;
};

/**
 * Generate similarity notes for two functions
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function
 * @returns {Array} Array of similarity notes
 */
const generateSimilarityNotes = (funcA, funcB) => {
    const notes = [];

    // Same name analysis
    if (funcA.functionName === funcB.functionName) {
        notes.push('Same function name - likely different versions');
    }

    // Size similarity
    const sizeDiff = Math.abs(funcA.lineCount - funcB.lineCount);
    const avgSize = (funcA.lineCount + funcB.lineCount) / 2;
    const sizeChangePercent = Math.round((sizeDiff / avgSize) * 100);

    if (sizeChangePercent < 10) {
        notes.push('Similar size - likely minor changes');
    } else if (sizeChangePercent > 50) {
        notes.push('Significant size difference - major changes likely');
    }

    // Structural similarity (basic)
    const braceCountA = (funcA.rawCode.match(/{/g) || []).length;
    const braceCountB = (funcB.rawCode.match(/{/g) || []).length;

    if (braceCountA === braceCountB) {
        notes.push('Same structural complexity');
    }

    return notes;
};

/**
 * Extract code violation examples
 * @param {string} filePath - Path to source file
 * @param {Array} violations - Array of violation objects with locations
 * @param {Object} options - Extraction options
 * @returns {Object} Violation examples
 */
export const extractViolationExamples = (filePath, violations, options = {}) => {
    const examples = {
        success: true,
        violation_examples: [],
        errors: []
    };

    try {
        if (!fs.existsSync(filePath)) {
            examples.success = false;
            examples.errors.push('Source file not found');
            return examples;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        violations.forEach(violation => {
            if (violation.locations && violation.locations.length > 0) {
                const violationExamples = [];

                violation.locations.slice(0, 3).forEach(lineNum => { // Limit to 3 examples
                    if (lineNum > 0 && lineNum <= lines.length) {
                        const line = lines[lineNum - 1]; // Convert to 0-based index

                        // Get context (line before and after)
                        const context = [];
                        if (lineNum > 1) context.push(`${lineNum - 1}: ${lines[lineNum - 2]}`);
                        context.push(`${lineNum}: ${line} // <-- VIOLATION`);
                        if (lineNum < lines.length) context.push(`${lineNum + 1}: ${lines[lineNum]}`);

                        violationExamples.push({
                            line_number: lineNum,
                            code: line.trim(),
                            context: formatCodeSnippet(context.join('\n'), {
                                maxLength: 100,
                                addLineNumbers: false
                            })
                        });
                    }
                });

                if (violationExamples.length > 0) {
                    examples.violation_examples.push({
                        violation_type: violation.type,
                        description: violation.description,
                        examples: violationExamples
                    });
                }
            }
        });

    } catch (error) {
        examples.success = false;
        examples.errors.push(error.message);
    }

    return examples;
};

/**
 * Create code diff representation (simplified)
 * @param {string} codeA - Original code
 * @param {string} codeB - Modified code
 * @param {Object} options - Diff options
 * @returns {Object} Diff representation
 */
export const createCodeDiff = (codeA, codeB, options = {}) => {
    const diff = {
        has_changes: codeA !== codeB,
        changes: [],
        summary: {
            lines_added: 0,
            lines_removed: 0,
            lines_modified: 0
        }
    };

    if (!diff.has_changes) {
        return diff;
    }

    const linesA = codeA.split('\n');
    const linesB = codeB.split('\n');

    // Simple line-by-line comparison (could be enhanced with proper diff algorithm)
    const maxLines = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLines; i++) {
        const lineA = linesA[i] || '';
        const lineB = linesB[i] || '';

        if (lineA !== lineB) {
            if (!lineA) {
                diff.changes.push({
                    type: 'added',
                    line_number: i + 1,
                    content: lineB
                });
                diff.summary.lines_added++;
            } else if (!lineB) {
                diff.changes.push({
                    type: 'removed',
                    line_number: i + 1,
                    content: lineA
                });
                diff.summary.lines_removed++;
            } else {
                diff.changes.push({
                    type: 'modified',
                    line_number: i + 1,
                    old_content: lineA,
                    new_content: lineB
                });
                diff.summary.lines_modified++;
            }
        }
    }

    return diff;
};

/**
 * Format diff for YAML output
 * @param {Object} diff - Diff object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted diff
 */
export const formatDiffForYAML = (diff, options = {}) => {
    if (!diff.has_changes) {
        return 'No changes detected';
    }

    const lines = [];
    lines.push(`Changes summary: +${diff.summary.lines_added} -${diff.summary.lines_removed} ~${diff.summary.lines_modified}`);
    lines.push('');

    // Limit changes shown
    const maxChanges = options.maxChanges || 10;
    const changes = diff.changes.slice(0, maxChanges);

    changes.forEach(change => {
        switch (change.type) {
            case 'added':
                lines.push(`+ ${change.line_number}: ${change.content}`);
                break;
            case 'removed':
                lines.push(`- ${change.line_number}: ${change.content}`);
                break;
            case 'modified':
                lines.push(`~ ${change.line_number}: ${change.old_content}`);
                lines.push(`  ${' '.repeat(String(change.line_number).length)}: ${change.new_content}`);
                break;
        }
    });

    if (diff.changes.length > maxChanges) {
        lines.push(`... (${diff.changes.length - maxChanges} more changes)`);
    }

    return lines.join('\n');
};

export default {
    formatCodeSnippet,
    extractFunctionCode,
    extractFunctionsForComparison,
    createSideBySideComparison,
    extractViolationExamples,
    createCodeDiff,
    formatDiffForYAML
};