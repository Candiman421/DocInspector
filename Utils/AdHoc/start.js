#!/usr/bin/env node

// ============================================================================
// ADHOC CODE UPDATER - STARTUP SCRIPT
// One command to start the entire system
// Location: Utils/AdHoc/start.js
// ============================================================================

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class AdHocStarter {
    constructor() {
        this.serverProcess = null;
        this.port = 3000;
    }

    async start() {
        console.log(chalk.cyan('🚀 Starting AdHoc Code Updater...\n'));

        try {
            // Check dependencies
            await this.checkDependencies();
            
            // Check project structure
            this.checkProjectStructure();
            
            // Start server
            await this.startServer();
            
            // Open browser
            await this.openBrowser();
            
            console.log(chalk.green('\n✅ AdHoc Code Updater is ready!'));
            console.log(chalk.blue(`🌐 Open: http://localhost:${this.port}`));
            console.log(chalk.gray('Press Ctrl+C to stop\n'));
            
            // Keep process alive
            this.setupGracefulShutdown();
            
        } catch (error) {
            console.error(chalk.red(`❌ Startup failed: ${error.message}`));
            process.exit(1);
        }
    }

    async checkDependencies() {
        console.log(chalk.blue('📦 Checking dependencies...'));
        
        const packagePath = path.join(__dirname, 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            console.log(chalk.yellow('Creating package.json...'));
            await this.createPackageJson();
        }

        try {
            await execAsync('npm list express', { cwd: __dirname });
            console.log(chalk.green('✅ Dependencies OK'));
        } catch (error) {
            console.log(chalk.yellow('📥 Installing dependencies...'));
            await this.installDependencies();
        }
    }

    async createPackageJson() {
        const packageJson = {
            "name": "adhoc-code-updater",
            "version": "1.0.0",
            "description": "Template-driven code updates from Claude responses",
            "type": "module",
            "main": "server.js",
            "scripts": {
                "start": "node start.js",
                "server": "node server.js",
                "dev": "node server.js --dev"
            },
            "dependencies": {
                "express": "^4.18.2",
                "cors": "^2.8.5",
                "chokidar": "^3.5.3",
                "chalk": "^5.2.0"
            },
            "engines": {
                "node": ">=14.0.0"
            },
            "keywords": ["code-updater", "template", "claude", "automation"],
            "author": "AdHoc Utils",
            "license": "MIT"
        };

        fs.writeFileSync(
            path.join(__dirname, 'package.json'), 
            JSON.stringify(packageJson, null, 2)
        );
    }

    async installDependencies() {
        const { stdout, stderr } = await execAsync('npm install', { 
            cwd: __dirname,
            stdio: 'pipe' 
        });
        
        if (stderr && !stderr.includes('WARN')) {
            throw new Error(`Dependency installation failed: ${stderr}`);
        }
        
        console.log(chalk.green('✅ Dependencies installed'));
    }

    checkProjectStructure() {
        console.log(chalk.blue('📁 Checking project structure...'));
        
        const projectRoot = path.resolve(__dirname, '../../');
        const requiredFiles = [
            'server.js',
            'index.html'
        ];
        
        const missingFiles = requiredFiles.filter(file => 
            !fs.existsSync(path.join(__dirname, file))
        );
        
        if (missingFiles.length > 0) {
            console.log(chalk.yellow(`⚠️  Missing files: ${missingFiles.join(', ')}`));
            console.log(chalk.gray('Creating missing files...'));
            this.createMissingFiles(missingFiles);
        }
        
        console.log(chalk.green('✅ Project structure OK'));
        console.log(chalk.gray(`   Project root: ${projectRoot}`));
    }

    createMissingFiles(missingFiles) {
        // Create minimal index.html if missing
        if (missingFiles.includes('index.html')) {
            const htmlContent = `<!DOCTYPE html>
<html><head><title>AdHoc Code Updater</title></head>
<body><h1>AdHoc Code Updater</h1><p>Server starting...</p></body></html>`;
            fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
        }
        
        // Create minimal server.js if missing
        if (missingFiles.includes('server.js')) {
            const serverContent = `import express from 'express';
const app = express();
const PORT = 3000;
app.use(express.static('.'));
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`;
            fs.writeFileSync(path.join(__dirname, 'server.js'), serverContent);
        }
    }

    async startServer() {
        console.log(chalk.blue('🖥️  Starting server...'));
        
        return new Promise((resolve, reject) => {
            this.serverProcess = spawn('node', ['server.js'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            
            this.serverProcess.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('running') || output.includes('listening')) {
                    console.log(chalk.green('✅ Server started'));
                    resolve();
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error(chalk.red(`Server error: ${data}`));
            });

            this.serverProcess.on('error', (error) => {
                reject(new Error(`Failed to start server: ${error.message}`));
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (output && !output.includes('running')) {
                    console.log(chalk.green('✅ Server appears to be running'));
                    resolve();
                }
            }, 2000);
        });
    }

    async openBrowser() {
        const url = `http://localhost:${this.port}`;
        
        console.log(chalk.blue('🌐 Opening browser...'));
        
        try {
            const platform = process.platform;
            let command;
            
            switch (platform) {
                case 'darwin':
                    command = `open "${url}"`;
                    break;
                case 'win32':
                    command = `start "${url}"`;
                    break;
                default:
                    command = `xdg-open "${url}"`;
            }
            
            await execAsync(command);
            console.log(chalk.green('✅ Browser opened'));
            
        } catch (error) {
            console.log(chalk.yellow(`⚠️  Couldn't open browser automatically`));
            console.log(chalk.white(`   Please open: ${url}`));
        }
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            console.log(chalk.yellow('\n🛑 Shutting down...'));
            
            if (this.serverProcess) {
                this.serverProcess.kill('SIGTERM');
                console.log(chalk.gray('Server stopped'));
            }
            
            console.log(chalk.green('👋 Goodbye!'));
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
        // Keep alive
        setInterval(() => {}, 1000);
    }

    // Quick setup for new installations
    static async quickSetup() {
        console.log(chalk.cyan('⚡ AdHoc Quick Setup\n'));
        
        const starter = new AdHocStarter();
        
        try {
            await starter.checkDependencies();
            console.log(chalk.green('\n✅ Setup complete!'));
            console.log(chalk.white('Run: npm start'));
        } catch (error) {
            console.error(chalk.red(`Setup failed: ${error.message}`));
        }
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    
    if (command === 'setup') {
        AdHocStarter.quickSetup();
    } else {
        const starter = new AdHocStarter();
        starter.start();
    }
}

export default AdHocStarter;

// package.json content for reference
export const PACKAGE_JSON = {
    "name": "adhoc-code-updater",
    "version": "1.0.0",
    "description": "Template-driven code updates from Claude responses",
    "type": "module",
    "main": "server.js", 
    "scripts": {
        "start": "node start.js",
        "setup": "node start.js setup",
        "server": "node server.js",
        "dev": "node server.js --dev"
    },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5", 
        "chokidar": "^3.5.3",
        "chalk": "^5.2.0"
    },
    "engines": {
        "node": ">=14.0.0"
    },
    "keywords": ["code-updater", "template", "claude", "automation"],
    "author": "AdHoc Utils",
    "license": "MIT"
};