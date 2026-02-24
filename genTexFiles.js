#!/usr/bin/env node

const fs = require('fs');
const pako = require('pako');
const spawnSync = require('child_process').spawnSync;
const os = require('os');
const path = require('path');

const inputFile = 'tex_files.json';

// Parse command line arguments
// Usage: node genTexFiles.js docker <container-name>
let dockerContainer = null;
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
    if (args[i] === 'docker' && i + 1 < args.length) {
        dockerContainer = args[i + 1];
        break;
    }
}

if (dockerContainer) {
    console.log(`Using Docker container: ${dockerContainer}`);
} else {
    console.log('Using local system');
}

fs.mkdirSync('./dist/tex_files', { recursive: true });

const processedFiles = [];

const files = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

for (const texFile of files) {
    if (!texFile || processedFiles.includes(texFile)) continue;
    console.log(`\tAttempting to locate ${texFile}.`);

    let sysFile;
    let fileContent;

    if (dockerContainer) {
        // Use docker exec to run kpsewhich in the container
        const result = spawnSync('docker', ['exec', dockerContainer, 'kpsewhich', texFile]);
        sysFile = result.stdout.toString().trim();
        
        if (sysFile == '') {
            console.log(`\t\x1b[31mUnable to locate ${texFile} in container.\x1b[0m`);
            continue;
        }

        console.log(`\tResolved ${texFile} to ${sysFile} in container`);

        // Copy file from container to temporary location
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tex-'));
        const tmpFile = path.join(tmpDir, texFile);
        
        const copyResult = spawnSync('docker', ['cp', `${dockerContainer}:${sysFile}`, tmpFile]);
        
        if (copyResult.status !== 0) {
            console.log(`\t\x1b[31mFailed to copy ${texFile} from container.\x1b[0m`);
            fs.rmSync(tmpDir, { recursive: true, force: true });
            continue;
        }

        fileContent = fs.readFileSync(tmpFile, 'utf8');
        fs.rmSync(tmpDir, { recursive: true, force: true });
    } else {
        // Use local kpsewhich
        sysFile = spawnSync('kpsewhich', [texFile]).stdout.toString().trim();
        
        if (sysFile == '') {
            console.log(`\t\x1b[31mUnable to locate ${texFile}.\x1b[0m`);
            continue;
        }

        console.log(`\tResolved ${texFile} to ${sysFile}`);
        fileContent = fs.readFileSync(sysFile, 'utf8');
    }

    processedFiles.push(texFile);
    fs.writeFileSync('dist/tex_files/' + texFile + '.gz', pako.gzip(fileContent));
}

// Copy additional tex files from additionalTexFiles directory
const additionalTexFilesDir = path.join(__dirname, 'additionalTexFiles');
if (fs.existsSync(additionalTexFilesDir)) {
    const additionalFiles = fs.readdirSync(additionalTexFilesDir).filter(f => f.endsWith('.gz'));
    for (const file of additionalFiles) {
        fs.copyFileSync(
            path.join(additionalTexFilesDir, file),
            path.join(__dirname, 'dist', 'tex_files', file)
        );
        console.log(`\tCopied additional file: ${file}`);
    }
}
