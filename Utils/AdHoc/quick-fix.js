#!/usr/bin/env node

// ============================================================================
// QUICK START - Fix DocDom Issues Now
// One command to fix all registration issues
// Location: root/Utils/AdHoc/quick-fix.js
// ============================================================================

import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import ClaudeResponseMerger from './claude-merger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from Utils/AdHoc/
const PROJECT_ROOT = path.resolve(__dirname, '../../');

async function runQuickFix() {
    console.log(chalk.cyan('🚀 DocDom Quick Fix - Starting...\n'));
    
    try {
        // Import the fixes configuration
        const { default: config } = await import('./docdom-current-fixes.js');
        
        // Create merger with verbose output and correct project root
        const merger = new ClaudeResponseMerger({ 
            verbose: true,
            dryRun: false,
            projectRoot: PROJECT_ROOT // FIXED: explicitly pass project root
        });
        
        console.log(chalk.blue(`📁 Using project root: ${PROJECT_ROOT}`));
        console.log(chalk.blue(`📝 Processing ${config.operations.length} operations...\n`));
        
        // Execute all fixes
        const results = await merger.processClaudeResponse(config);
        
        if (results.failed === 0) {
            console.log(chalk.green('\n🎉 SUCCESS! All fixes applied.'));
            console.log(chalk.blue('\n📋 Next steps:'));
            console.log(chalk.white('1. Run: cd ../../ && node Utils/main-system-analyzer.js --verbose'));
            console.log(chalk.white('2. Look for: Registration accuracy 95-100%'));
            console.log(chalk.white('3. Verify: Health grades A or B+'));
            console.log(chalk.gray('\n💡 From Utils/AdHoc/ run: cd ../../ && node Utils/main-system-analyzer.js --verbose'));
        } else {
            console.log(chalk.yellow('\n⚠️  Some fixes failed. Check output above.'));
            
            // Show failed operations details
            const failedOps = results.operations.filter(op => !op.success);
            if (failedOps.length > 0) {
                console.log(chalk.red('\n❌ Failed operations:'));
                failedOps.forEach((op, i) => {
                    console.log(chalk.red(`   ${i + 1}. ${op.action}: ${op.error || 'Unknown error'}`));
                });
            }
        }
        
    } catch (error) {
        console.error(chalk.red(`\n💥 Error: ${error.message}`));
        
        // Enhanced error diagnostics
        console.log(chalk.blue('\n🔍 Diagnostics:'));
        console.log(chalk.gray(`   Current directory: ${process.cwd()}`));
        console.log(chalk.gray(`   Script directory: ${__dirname}`));
        console.log(chalk.gray(`   Project root: ${PROJECT_ROOT}`));
        
        // Check if key directories exist
        const keyPaths = [
            path.join(PROJECT_ROOT, 'Utils/config'),
            path.join(PROJECT_ROOT, 'Utils/core'),
            path.join(PROJECT_ROOT, 'DocDomV4.1')
        ];
        
        console.log(chalk.blue('\n📁 Directory checks:'));
        keyPaths.forEach(dirPath => {
            const exists = require('fs').existsSync(dirPath);
            const status = exists ? chalk.green('✅') : chalk.red('❌');
            console.log(`   ${status} ${dirPath}`);
        });
        
        console.log(chalk.blue('\n💡 Try:'));
        console.log(chalk.white('1. Ensure you\'re in the Utils/AdHoc/ directory'));
        console.log(chalk.white('2. Verify project structure matches expected layout'));
        console.log(chalk.white('3. Run with --dry-run first: node claude-merger.js docdom-current-fixes.js --dry-run'));
        console.log(chalk.white('4. Check if files exist: ls ../../DocDomV4.1/ && ls ../config/ && ls ../core/'));
        
        process.exit(1);
    }
}

// Verify we're in the right location before running
function verifyLocation() {
    const expectedLocation = path.basename(path.resolve(__dirname, '..'));
    if (expectedLocation !== 'Utils') {
        console.log(chalk.yellow('⚠️  Warning: Expected to be in Utils/AdHoc/ directory'));
        console.log(chalk.gray(`   Current location appears to be: ${__dirname}`));
        console.log(chalk.gray(`   Parent directory: ${expectedLocation}`));
    }
}

// Run verification and fix
verifyLocation();
runQuickFix();