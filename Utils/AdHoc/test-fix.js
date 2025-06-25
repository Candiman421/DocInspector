#!/usr/bin/env node

// ============================================================================
// TEST FIX - Simple One-Command Test and Fix
// Test paths, then apply fixes if everything looks good
// Location: root/Utils/AdHoc/test-fix.js
// ============================================================================

import chalk from 'chalk';
import { runDiagnostics } from './path-diagnostics.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testAndFix() {
    console.log(chalk.cyan('🧪 DocDom Test & Fix\n'));
    
    try {
        // Run diagnostics first
        console.log(chalk.blue('Step 1: Running diagnostics...'));
        await runDiagnostics();
        
        console.log(chalk.blue('\nStep 2: Testing with dry run...'));
        
        // Test with dry run
        const { stdout: dryRunOutput, stderr: dryRunError } = await execAsync('node claude-merger.js docdom-current-fixes.js --dry-run');
        
        if (dryRunError) {
            console.log(chalk.red('❌ Dry run failed:'));
            console.log(dryRunError);
            return;
        }
        
        console.log(chalk.green('✅ Dry run successful!'));
        console.log(chalk.gray('Output preview:'));
        console.log(chalk.gray(dryRunOutput.split('\n').slice(0, 10).join('\n') + '...'));
        
        // Ask user if they want to proceed
        console.log(chalk.yellow('\n⚠️  Ready to apply fixes. This will modify your files.'));
        console.log(chalk.white('Press Ctrl+C to cancel, or any key to continue...'));
        
        process.stdin.setRawMode(true);
        process.stdin.resume();
        
        await new Promise((resolve) => {
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        });
        
        console.log(chalk.blue('\nStep 3: Applying fixes...'));
        
        // Apply actual fixes
        const { stdout: fixOutput, stderr: fixError } = await execAsync('node quick-fix.js');
        
        if (fixError) {
            console.log(chalk.red('❌ Fix failed:'));
            console.log(fixError);
            return;
        }
        
        console.log(fixOutput);
        console.log(chalk.green('\n🎉 All done! Check the output above for results.'));
        
    } catch (error) {
        console.error(chalk.red(`💥 Error: ${error.message}`));
        
        console.log(chalk.blue('\n💡 Try running components individually:'));
        console.log(chalk.white('   1. node path-diagnostics.js'));
        console.log(chalk.white('   2. node claude-merger.js docdom-current-fixes.js --dry-run'));
        console.log(chalk.white('   3. node quick-fix.js'));
    }
}

// CLI execution
if (process.argv[1] === process.argv[1]) {
    testAndFix();
}