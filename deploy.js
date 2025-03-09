const fs = require('fs-extra');
const path = require('path');

// Deployment configuration
const config = {
    sourceDir: '.',
    deployDir: 'dist',
    files: [
        'index.html',
        'src/js/game.js',
        'privacy.html',
        'terms.html'
    ]
};

// Create deployment directory
fs.ensureDirSync(config.deployDir);

// Copy files
config.files.forEach(file => {
    const sourcePath = path.join(config.sourceDir, file);
    const destPath = path.join(config.deployDir, file);
    
    // Ensure the destination directory exists
    fs.ensureDirSync(path.dirname(destPath));
    
    // Copy the file
    if (fs.existsSync(sourcePath)) {
        fs.copySync(sourcePath, destPath);
        console.log(`Copied ${sourcePath} to ${destPath}`);
    } else {
        console.error(`Warning: ${sourcePath} not found`);
    }
});

console.log('Deployment files prepared in dist/ directory'); 