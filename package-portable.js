const fs = require('fs');
const path = require('path');

console.log('Creating portable package...');

// Create portable directory
const portableDir = path.join(__dirname, 'release', 'portable');
if (!fs.existsSync(portableDir)) {
  fs.mkdirSync(portableDir, { recursive: true });
}

// Copy all files from win-unpacked to portable
const sourceDir = path.join(__dirname, 'release', 'win-unpacked');
const files = fs.readdirSync(sourceDir);

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(portableDir, file);
  
  if (fs.statSync(sourcePath).isDirectory()) {
    // Copy directory recursively
    copyDirRecursive(sourcePath, destPath);
  } else {
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Create a simple launcher batch file
const launcherContent = `@echo off
cd /d "%~dp0"
start "" "Simple Browser.exe"
`;

fs.writeFileSync(path.join(portableDir, 'launch.bat'), launcherContent);

console.log('Portable package created successfully!');
console.log('Location:', portableDir);
console.log('Run launch.bat to start the application');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

