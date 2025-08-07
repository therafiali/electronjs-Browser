const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Electron Browser...');

// Build main process
console.log('Building main process...');
execSync('npm run build:main', { stdio: 'inherit' });

// Build renderer process
console.log('Building renderer process...');
execSync('npm run build:renderer', { stdio: 'inherit' });

console.log('Build completed successfully!');
console.log('You can now run: npm start');
