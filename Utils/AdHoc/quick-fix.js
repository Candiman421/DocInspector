#!/usr/bin/env node

// ============================================================================
// QUICK START - Fix DocDom Issues Now
// One command to fix all registration issues
// Location: root/Utils/AdHoc/quick-fix.js
// ============================================================================

import chalk from 'chalk';
import ClaudeResponseMerger from './claude-merger.js';

async function runQuickFix() {
    console.log(chalk.cyan('🚀 DocDom Quick Fix - Starting...\n'));
    
    try {
        // Import the fixes configuration
        const { default: config } = await import('./docdom-current-fixes.js');
        
        // Create merger with verbose output
        const merger = new ClaudeResponseMerger({ 
            verbose: true,
            dryRun: false 
        });
        
        // Execute all fixes
        const results = await merger.processClaudeResponse(config);
        
        if (results.failed === 0) {
            console.log(chalk.green('\n🎉 SUCCESS! All fixes applied.'));
            console.log(chalk.blue('\n📋 Next steps:'));
            console.log(chalk.white('1. Run: cd .. && node main-system-analyzer.js --verbose'));
            console.log(chalk.white('2. Look for: Registration accuracy 95-100%'));
            console.log(chalk.white('3. Verify: Health grades A or B+'));
        } else {
            console.log(chalk.yellow('\n⚠️  Some fixes failed. Check output above.'));
        }
        
    } catch (error) {
        console.error(chalk.red(`\n💥 Error: ${error.message}`));
        console.log(chalk.blue('\n💡 Try:'));
        console.log(chalk.white('1. Check you\'re in Utils/AdHoc/ directory'));
        console.log(chalk.white('2. Verify files exist in DocDomV4.1/ folder'));
        console.log(chalk.white('3. Run with --dry-run first: node claude-merger.js docdom-current-fixes.js --dry-run'));
        process.exit(1);
    }
}

// Run the quick fix
runQuickFix();