const fs = require('fs-extra');

async function build() {
    try {
    // 1. Clean output directory
    await fs.emptyDir('./.dist');
    
    await fs.copy('extension/', './.dist/');
    // 2. Copy/process files
    await copyFiles();
    
    // 3. Optional: minify, compile, etc.
    // await processFiles();
    
    console.log('✅ Build complete!');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function copyFiles() {
    const filesToCopy = [
    'manifest.json',
    'src/factLoader.js',
    ];

    for (const pattern of filesToCopy) {
        await fs.copy(pattern, `./.dist/${pattern}`);
    }
}

// Run the build
build();