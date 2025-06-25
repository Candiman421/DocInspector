#!/usr/bin/env node

// ============================================================================
// PATH DIAGNOSTICS
// Check project structure and paths before running fixes
// Location: root/Utils/AdHoc/path-diagnostics.js
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from Utils/AdHoc/
const PROJECT_ROOT = path.resolve(__dirname, '../../');

async function runDiagnostics() {
    console.log(chalk.cyan('🔍 DocDom Path Diagnostics\n'));
    
    console.log(chalk.blue('📁 Directory Information:'));
    console.log(chalk.gray(`   Script location: ${__filename}`));
    console.log(chalk.gray(`   Script directory: ${__dirname}`));
    console.log(chalk.gray(`   Working directory: ${process.cwd()}`));
    console.log(chalk.gray(`   Calculated project root: ${PROJECT_ROOT}`));
    
    console.log(chalk.blue('\n🗂️  Project Structure Check:'));
    
    // Check key directories
    const keyDirectories = [
        'Utils',
        'Utils/AdHoc',
        'Utils/config',
        'Utils/core',
        'DocDomV4.1'
    ];
    
    let allDirsExist = true;
    keyDirectories.forEach(dir => {
        const fullPath = path.join(PROJECT_ROOT, dir);
        const exists = fs.existsSync(fullPath);
        const status = exists ? chalk.green('✅') : chalk.red('❌');
        console.log(`   ${status} ${dir}`);
        if (!exists) allDirsExist = false;
    });
    
    console.log(chalk.blue('\n📄 Key Files Check:'));
    
    // Check key files
    const keyFiles = [
        'Utils/config/patterns.js',
        'Utils/core/module-parser.js'
    ];
    
    let allFilesExist = true;
    keyFiles.forEach(file => {
        const fullPath = path.join(PROJECT_ROOT, file);
        const exists = fs.existsSync(fullPath);
        const status = exists ? chalk.green('✅') : chalk.red('❌');
        console.log(`   ${status} ${file}`);
        if (!exists) allFilesExist = false;
    });
    
    console.log(chalk.blue('\n🧩 DocDom Modules Check:'));
    
    // Check DocDom modules
    const moduleFiles = [
        '1.20.0.0_safety-utilities.jsx',
        '2.1.0.0_dom-enumerator.jsx',
        '2.2.0.0_collection-sampler.jsx',
        '3.1.0.0_property-sampler.jsx',
        '3.2.0.0_dom-exporter.jsx',
        '4.1.0.0_json-analyzer.jsx',
        '4.2.0.0_dom-comparator.jsx',
        '5.1.0.0_deep-mapper.jsx',
        '5.2.0.0_dom-visualizer.jsx',
        '6.1.0.0_advanced-ui.jsx'
    ];
    
    let moduleCount = 0;
    moduleFiles.forEach(file => {
        const fullPath = path.join(PROJECT_ROOT, 'DocDomV4.1', file);
        const exists = fs.existsSync(fullPath);
        const status = exists ? chalk.green('✅') : chalk.red('❌');
        console.log(`   ${status} DocDomV4.1/${file}`);
        if (exists) moduleCount++;
    });
    
    console.log(chalk.blue('\n📊 Configuration Files Check:'));
    
    // Check AdHoc configuration files
    const adHocFiles = [
        'claude-merger.js',
        'docdom-current-fixes.js',
        'quick-fix.js'
    ];
    
    adHocFiles.forEach(file => {
        const fullPath = path.join(__dirname, file);
        const exists = fs.existsSync(fullPath);
        const status = exists ? chalk.green('✅') : chalk.red('❌');
        console.log(`   ${status} Utils/AdHoc/${file}`);
    });
    
    console.log(chalk.blue('\n🎯 Summary:'));
    
    if (allDirsExist && allFilesExist && moduleCount === moduleFiles.length) {
        console.log(chalk.green('✅ All paths verified - ready to run fixes!'));
        console.log(chalk.white('\n🚀 Next steps:'));
        console.log(chalk.white('   1. Run the quick fix: node quick-fix.js'));
        console.log(chalk.white('   2. Or test first: node claude-merger.js docdom-current-fixes.js --dry-run'));
    } else {
        console.log(chalk.red('❌ Some paths are missing!'));
        
        if (!allDirsExist) {
            console.log(chalk.yellow('\n⚠️  Missing directories detected.'));
            console.log(chalk.white('Check that you\'re in the right project and the Utils structure exists.'));
        }
        
        if (!allFilesExist) {
            console.log(chalk.yellow('\n⚠️  Missing core files detected.'));
            console.log(chalk.white('Ensure Utils/config/patterns.js and Utils/core/module-parser.js exist.'));
        }
        
        if (moduleCount < moduleFiles.length) {
            console.log(chalk.yellow(`\n⚠️  Only ${moduleCount}/${moduleFiles.length} DocDom modules found.`));
            console.log(chalk.white('Some module files may be missing from DocDomV4.1/ directory.'));
        }
    }
    
    console.log(chalk.blue('\n💡 Troubleshooting Tips:'));
    console.log(chalk.white('   • Ensure you\'re running from Utils/AdHoc/ directory'));
    console.log(chalk.white('   • Check project structure matches expected layout'));
    console.log(chalk.white('   • Verify Utils/ and DocDomV4.1/ directories exist at project root'));
    console.log(chalk.white('   • Run "ls ../../" to see project root contents'));
}

// Test path resolution manually
function testPathResolution() {
    console.log(chalk.blue('\n🧪 Path Resolution Test:'));
    
    const testFiles = [
        'Utils/config/patterns.js',
        'DocDomV4.1/1.20.0.0_safety-utilities.jsx'
    ];
    
    testFiles.forEach(testFile => {
        const resolved = path.resolve(PROJECT_ROOT, testFile);
        const exists = fs.existsSync(resolved);
        const status = exists ? chalk.green('FOUND') : chalk.red('NOT FOUND');
        console.log(chalk.gray(`   ${testFile}`));
        console.log(chalk.gray(`   → ${resolved}`));
        console.log(`   → ${status}\n`);
    });
}

// CLI execution
if (process.argv[1] === __filename) {
    await runDiagnostics();
    
    if (process.argv.includes('--test-paths')) {
        testPathResolution();
    }
    
    if (process.argv.includes('--help')) {
        console.log(chalk.cyan('\nPath Diagnostics Options:'));
        console.log(chalk.white('  --test-paths    Show detailed path resolution'));
        console.log(chalk.white('  --help          Show this help'));
    }
}

export { runDiagnostics, testPathResolution };