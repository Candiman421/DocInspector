// ============================================================================
// DOCDOM VALIDATION RUNNER
// Validates that fixes were applied correctly and system is working
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

export class ValidationRunner {
    constructor(options = {}) {
        this.options = options;
        this.verbose = options.verbose || false;
        this.targetFolder = options.targetFolder || '../DocDomV4.1';
    }

    /**
     * Validate all modules after fixes have been applied
     */
    async validateAllModules(moduleFiles) {
        console.log(chalk.blue('🔍 Validating all modules after fixes...'));

        const results = {
            totalModules: moduleFiles.length,
            passing: [],
            failing: [],
            validationTests: [],
            overallSuccess: false,
            summary: {}
        };

        // Test 1: Registration extraction validation
        console.log(chalk.yellow('   📋 Testing registration extraction...'));
        const registrationTest = await this.validateRegistrationExtraction(moduleFiles);
        results.validationTests.push(registrationTest);

        // Test 2: Version consistency validation
        console.log(chalk.yellow('   🔗 Testing version consistency...'));
        const versionTest = await this.validateVersionConsistency(moduleFiles);
        results.validationTests.push(versionTest);

        // Test 3: Function registration accuracy
        console.log(chalk.yellow('   ⚙️  Testing function registration accuracy...'));
        const accuracyTest = await this.validateRegistrationAccuracy(moduleFiles);
        results.validationTests.push(accuracyTest);

        // Test 4: System analysis integration
        console.log(chalk.yellow('   🔄 Testing system analysis integration...'));
        const integrationTest = await this.validateSystemIntegration();
        results.validationTests.push(integrationTest);

        // Test 5: Module loading simulation
        console.log(chalk.yellow('   📦 Testing module loading simulation...'));
        const loadingTest = await this.validateModuleLoading(moduleFiles);
        results.validationTests.push(loadingTest);

        // Compile results
        results.passing = results.validationTests.filter(test => test.passed).map(test => test.name);
        results.failing = results.validationTests.filter(test => !test.passed).map(test => ({
            module: test.name,
            reason: test.error || test.details
        }));

        results.overallSuccess = results.failing.length === 0;
        results.summary = this.generateValidationSummary(results);

        if (this.verbose) {
            this.reportValidationResults(results);
        }

        return results;
    }

    /**
     * Test that registration extraction is working correctly
     */
    async validateRegistrationExtraction(moduleFiles) {
        const test = {
            name: 'Registration Extraction',
            passed: false,
            details: '',
            moduleResults: []
        };

        try {
            let successCount = 0;
            let totalCount = 0;

            for (const moduleFile of moduleFiles) {
                totalCount++;
                
                const content = fs.readFileSync(moduleFile.fullPath, 'utf8');
                const hasRegisterModule = content.includes('registerModule');
                
                if (hasRegisterModule) {
                    // Test if our enhanced regex pattern works
                    const registrationMatch = this.testRegistrationExtraction(content);
                    
                    if (registrationMatch.found) {
                        successCount++;
                        test.moduleResults.push({
                            file: moduleFile.filename,
                            success: true,
                            moduleName: registrationMatch.moduleName,
                            functionCount: registrationMatch.functionCount
                        });
                    } else {
                        test.moduleResults.push({
                            file: moduleFile.filename,
                            success: false,
                            error: registrationMatch.error
                        });
                    }
                } else {
                    // Module doesn't have registration - skip
                    totalCount--;
                }
            }

            const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
            test.passed = successRate >= 95;
            test.details = `${successCount}/${totalCount} modules (${successRate.toFixed(1)}%)`;

        } catch (error) {
            test.error = error.message;
        }

        return test;
    }

    /**
     * Test that filename and registration versions are consistent
     */
    async validateVersionConsistency(moduleFiles) {
        const test = {
            name: 'Version Consistency',
            passed: false,
            details: '',
            inconsistencies: []
        };

        try {
            let consistentCount = 0;
            let totalChecked = 0;

            for (const moduleFile of moduleFiles) {
                const content = fs.readFileSync(moduleFile.fullPath, 'utf8');
                
                if (!content.includes('registerModule')) continue;
                
                totalChecked++;
                
                // Extract filename version
                const filenameMatch = moduleFile.filename.match(/^(\d+(?:\.\d+)*)_(.+)\.jsx?$/);
                const filenameVersion = filenameMatch ? filenameMatch[1] : null;

                // Extract registration version
                const regMatch = content.match(/registerModule\s*\(\s*['"]([^'"]+)['"]/);
                const registrationName = regMatch ? regMatch[1] : null;
                const registrationVersion = registrationName ? registrationName.split('_')[0] : null;

                if (filenameVersion && registrationVersion) {
                    if (filenameVersion === registrationVersion) {
                        consistentCount++;
                    } else {
                        test.inconsistencies.push({
                            file: moduleFile.filename,
                            filenameVersion,
                            registrationVersion,
                            issue: 'Version mismatch'
                        });
                    }
                } else {
                    test.inconsistencies.push({
                        file: moduleFile.filename,
                        filenameVersion,
                        registrationVersion,
                        issue: 'Could not extract version information'
                    });
                }
            }

            const consistencyRate = totalChecked > 0 ? (consistentCount / totalChecked) * 100 : 0;
            test.passed = consistencyRate >= 95;
            test.details = `${consistentCount}/${totalChecked} modules consistent (${consistencyRate.toFixed(1)}%)`;

        } catch (error) {
            test.error = error.message;
        }

        return test;
    }

    /**
     * Test registration accuracy (actual vs registered functions)
     */
    async validateRegistrationAccuracy(moduleFiles) {
        const test = {
            name: 'Registration Accuracy',
            passed: false,
            details: '',
            accuracyResults: []
        };

        try {
            let totalAccuracy = 0;
            let moduleCount = 0;

            for (const moduleFile of moduleFiles) {
                const content = fs.readFileSync(moduleFile.fullPath, 'utf8');
                
                if (!content.includes('registerModule')) continue;
                
                moduleCount++;
                
                // Extract actual functions
                const actualFunctions = this.extractActualFunctions(content);
                
                // Extract registered functions
                const registeredFunctions = this.extractRegisteredFunctions(content);
                
                // Calculate accuracy
                const accuracy = this.calculateRegistrationAccuracy(actualFunctions, registeredFunctions);
                totalAccuracy += accuracy;
                
                test.accuracyResults.push({
                    file: moduleFile.filename,
                    actualCount: actualFunctions.length,
                    registeredCount: registeredFunctions.length,
                    accuracy: accuracy
                });
            }

            const averageAccuracy = moduleCount > 0 ? totalAccuracy / moduleCount : 0;
            test.passed = averageAccuracy >= 95;
            test.details = `Average accuracy: ${averageAccuracy.toFixed(1)}%`;

        } catch (error) {
            test.error = error.message;
        }

        return test;
    }

    /**
     * Test system analysis integration
     */
    async validateSystemIntegration() {
        const test = {
            name: 'System Analysis Integration',
            passed: false,
            details: '',
            analysisOutput: null
        };

        try {
            // Try to run the system analyzer
            const analysisResult = await this.runSystemAnalyzer();
            
            if (analysisResult.success) {
                // Parse the analysis output
                const parsed = this.parseAnalysisOutput(analysisResult.output);
                
                test.passed = parsed.registrationAccuracy >= 95 && parsed.errors === 0;
                test.details = `Registration accuracy: ${parsed.registrationAccuracy}%, Errors: ${parsed.errors}`;
                test.analysisOutput = parsed;
            } else {
                test.error = analysisResult.error;
            }

        } catch (error) {
            test.error = error.message;
        }

        return test;
    }

    /**
     * Test module loading simulation
     */
    async validateModuleLoading(moduleFiles) {
        const test = {
            name: 'Module Loading Simulation',
            passed: false,
            details: '',
            loadingResults: []
        };

        try {
            let successfulLoads = 0;
            
            for (const moduleFile of moduleFiles) {
                const loadResult = await this.simulateModuleLoad(moduleFile);
                test.loadingResults.push(loadResult);
                
                if (loadResult.success) {
                    successfulLoads++;
                }
            }

            const successRate = (successfulLoads / moduleFiles.length) * 100;
            test.passed = successRate >= 90;
            test.details = `${successfulLoads}/${moduleFiles.length} modules loaded successfully (${successRate.toFixed(1)}%)`;

        } catch (error) {
            test.error = error.message;
        }

        return test;
    }

    /**
     * Helper methods for validation
     */

    testRegistrationExtraction(content) {
        try {
            // Simulate the fixed regex pattern
            const registerMatch = content.match(/registerModule\s*\(\s*(['"])([^'"]+)\1\s*,\s*(['"])([^'"]+)\3\s*,\s*\[([\s\S]*?)\]\s*\)\s*;?/);
            
            if (registerMatch) {
                const arrayContent = registerMatch[5];
                const functions = this.parseRegistrationArray(arrayContent);
                
                return {
                    found: true,
                    moduleName: registerMatch[2],
                    version: registerMatch[4],
                    functionCount: functions.length
                };
            } else {
                return {
                    found: false,
                    error: 'No registration match found'
                };
            }
        } catch (error) {
            return {
                found: false,
                error: error.message
            };
        }
    }

    parseRegistrationArray(arrayContent) {
        if (!arrayContent) return [];

        const functions = [];
        let cleaned = arrayContent
            .replace(/\/\/.*$/gm, '')  // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();

        // Extract quoted function names
        const matches = cleaned.match(/'([^']+)'/g) || [];
        matches.forEach(match => {
            const funcName = match.slice(1, -1).trim();
            if (funcName && !functions.includes(funcName)) {
                functions.push(funcName);
            }
        });

        return functions;
    }

    extractActualFunctions(content) {
        const functions = [];
        const functionPattern = /(?:function\s+|const\s+|var\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]?\s*(?:function\s*)?\(/g;
        
        let match;
        while ((match = functionPattern.exec(content)) !== null) {
            const functionName = match[1];
            if (!functions.includes(functionName) && !this.isExcludedFunction(functionName)) {
                functions.push(functionName);
            }
        }
        
        return functions;
    }

    extractRegisteredFunctions(content) {
        const registrationMatch = content.match(/registerModule\s*\([^[]*\[([\s\S]*?)\]/);
        if (!registrationMatch) return [];
        
        return this.parseRegistrationArray(registrationMatch[1]);
    }

    calculateRegistrationAccuracy(actualFunctions, registeredFunctions) {
        if (actualFunctions.length === 0 && registeredFunctions.length === 0) return 100;
        if (actualFunctions.length === 0) return 0;

        const matches = registeredFunctions.filter(func => actualFunctions.includes(func)).length;
        const total = Math.max(actualFunctions.length, registeredFunctions.length);
        
        return (matches / total) * 100;
    }

    async runSystemAnalyzer() {
        return new Promise((resolve) => {
            const analyzerPath = path.join(process.cwd(), 'main-system-analyzer.js');
            
            if (!fs.existsSync(analyzerPath)) {
                resolve({
                    success: false,
                    error: 'System analyzer not found'
                });
                return;
            }

            const child = spawn('node', [analyzerPath, '--folder', this.targetFolder], {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output: output,
                    error: errorOutput || (code !== 0 ? `Exit code: ${code}` : null)
                });
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    error: 'Analyzer timeout'
                });
            }, 30000);
        });
    }

    parseAnalysisOutput(output) {
        const parsed = {
            registrationAccuracy: 0,
            errors: 0,
            warnings: 0,
            healthGrade: 'F'
        };

        // Extract registration accuracy
        const accuracyMatch = output.match(/registration.*?accuracy.*?(\d+(?:\.\d+)?)%/i);
        if (accuracyMatch) {
            parsed.registrationAccuracy = parseFloat(accuracyMatch[1]);
        }

        // Count errors and warnings
        parsed.errors = (output.match(/❌|ERROR|Failed/g) || []).length;
        parsed.warnings = (output.match(/⚠️|WARNING|Warning/g) || []).length;

        // Extract health grade
        const gradeMatch = output.match(/health.*?grade.*?([A-F][+]?)/i);
        if (gradeMatch) {
            parsed.healthGrade = gradeMatch[1];
        }

        return parsed;
    }

    async simulateModuleLoad(moduleFile) {
        try {
            const content = fs.readFileSync(moduleFile.fullPath, 'utf8');
            
            // Basic syntax validation
            const syntaxErrors = this.checkSyntaxErrors(content);
            
            if (syntaxErrors.length > 0) {
                return {
                    file: moduleFile.filename,
                    success: false,
                    errors: syntaxErrors
                };
            }

            // Check for common issues
            const issues = this.checkCommonIssues(content);
            
            return {
                file: moduleFile.filename,
                success: issues.length === 0,
                issues: issues
            };

        } catch (error) {
            return {
                file: moduleFile.filename,
                success: false,
                error: error.message
            };
        }
    }

    checkSyntaxErrors(content) {
        const errors = [];
        
        // Check for unmatched braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push('Unmatched braces');
        }

        // Check for unmatched parentheses
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push('Unmatched parentheses');
        }

        return errors;
    }

    checkCommonIssues(content) {
        const issues = [];
        
        // Check for ES6+ features that might not work in ExtendScript
        if (content.includes('=>')) {
            issues.push('Arrow functions detected (ES6+ feature)');
        }
        
        if (content.includes('const ') || content.includes('let ')) {
            issues.push('const/let detected (ES6+ feature)');
        }
        
        if (content.includes('`')) {
            issues.push('Template literals detected (ES6+ feature)');
        }

        return issues;
    }

    generateValidationSummary(results) {
        const summary = {
            overallGrade: 'F',
            passRate: 0,
            criticalIssues: [],
            recommendations: []
        };

        // Calculate pass rate
        const totalTests = results.validationTests.length;
        const passedTests = results.validationTests.filter(test => test.passed).length;
        summary.passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

        // Determine overall grade
        if (summary.passRate >= 95) summary.overallGrade = 'A';
        else if (summary.passRate >= 85) summary.overallGrade = 'B';
        else if (summary.passRate >= 75) summary.overallGrade = 'C';
        else if (summary.passRate >= 65) summary.overallGrade = 'D';

        // Identify critical issues
        results.validationTests.forEach(test => {
            if (!test.passed) {
                summary.criticalIssues.push({
                    test: test.name,
                    issue: test.error || test.details
                });
            }
        });

        // Generate recommendations
        if (summary.criticalIssues.length > 0) {
            summary.recommendations.push('Address failing validation tests');
        }
        
        if (summary.passRate < 100) {
            summary.recommendations.push('Review individual module reports for specific issues');
        }

        return summary;
    }

    reportValidationResults(results) {
        console.log(chalk.cyan('\n📊 Validation Results Summary:'));
        console.log(chalk.white(`   🧪 Tests run: ${results.validationTests.length}`));
        console.log(chalk.green(`   ✅ Tests passed: ${results.passing.length}`));
        console.log(chalk.red(`   ❌ Tests failed: ${results.failing.length}`));
        console.log(chalk.blue(`   📈 Pass rate: ${results.summary.passRate.toFixed(1)}%`));
        console.log(chalk.yellow(`   🎯 Overall grade: ${results.summary.overallGrade}`));

        if (results.failing.length > 0) {
            console.log(chalk.red('\n❌ Failed Tests:'));
            results.failing.forEach(failure => {
                console.log(chalk.red(`   • ${failure.module}: ${failure.reason}`));
            });
        }

        if (results.summary.recommendations.length > 0) {
            console.log(chalk.yellow('\n💡 Recommendations:'));
            results.summary.recommendations.forEach(rec => {
                console.log(chalk.yellow(`   • ${rec}`));
            });
        }
    }

    isExcludedFunction(functionName) {
        const excluded = ['registerModule', 'validateDependencies', 'main', 'init'];
        return excluded.includes(functionName);
    }
}