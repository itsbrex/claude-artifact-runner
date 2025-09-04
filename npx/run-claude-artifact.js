#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('yargs');

const artifactFile = argv._[0];
const keep = argv.keep;

if (!artifactFile) {
    console.error('Please specify an artifact file.');
    process.exit(1);
}

const tempDir = path.join(__dirname, 'temp-claude-artifact-runner');

// Step 1: Spin up a temporary project
execSync(`npx create-claude-artifact-runner ${tempDir}`, { stdio: 'inherit' });

// Step 2: Copy the user-specified file
fs.copyFileSync(artifactFile, path.join(tempDir, 'index.html'));

// Step 3: Run Vite in debug mode
const viteProcess = execSync(`cd ${tempDir} && npx vite`, { stdio: 'inherit' });

// Set a timer to stop Vite after a set duration
const duration = 60000; // 1 minute
setTimeout(() => {
    viteProcess.kill();
    if (!keep) {
        execSync(`rm -rf ${tempDir}`);
    }
}, duration);

if (keep) {
    const folderName = path.basename(artifactFile, path.extname(artifactFile));
    execSync(`cp -r ${tempDir} ./${folderName}`);
}
