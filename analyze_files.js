const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

/**
 * Configuration: Define what we consider "programming files" and "text files".
 * You can add or remove extensions here as needed.
 */
const PROGRAMMING_EXTENSIONS = new Set([
    '.js', '.ts', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rb', '.php', '.html', '.css', '.sql', '.sh', '.lua', '.swift', '.kt'
]);

const TEXT_EXTENSIONS = new Set([
    ...PROGRAMMING_EXTENSIONS,
    '.txt', '.md', '.csv', '.log', '.yml', '.yaml', '.xml'
]);


/**
 * Counts the number of lines in a file.
 * 
 * @param {string} filePath - Path to the file.
 * @returns {number} - Number of lines.
 */
function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.length === 0) return 0;
    
    const lines = content.split(/\r?\n/);
    
    // If the last element is empty (meaning the file ends with a newline),
    // we don't count it as an extra line, matching standard 'wc -l' behavior.
    if (lines[lines.length - 1] === '') {
        lines.pop();
    }
    
    return lines.length;
}

/**
 * Recursively scans a directory for files matching the criteria.
 * 
 * @param {string} dir - The directory to scan.
 * @param {Array} results - Accumulator for found files.
 * @param {Object} ig - An ignore object from the 'ignore' package.
 * @param {string} rootDir - The root directory for calculating relative paths.
 * @returns {Array} - List of objects containing path and line count.
 */
function scanDirectory(dir, results = [], ig = null, rootDir = '') {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        console.error(`Error reading directory ${dir}: ${err.message}`);
        return results;
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        
        try {
            stat = fs.statSync(fullPath);
        } catch (err) {
            console.error(`Error stating file ${fullPath}: ${err.message}`);
            continue;
        }

        const relativePath = path.relative(rootDir, fullPath);

        if (ig && ig.ignores(relativePath)) {
            continue;
        }

        if (stat.isDirectory()) {
            scanDirectory(fullPath, results, ig, rootDir);
        } else {
            const ext = path.extname(fullPath).toLowerCase();
            
            // Only process files that are considered "text"
            if (TEXT_EXTENSIONS.has(ext)) {
                try {
                    const lineCount = countLines(fullPath);
                    
                    // Check if it is a programming file AND has more than 100 lines
                    if (PROGRAMMING_EXTENSIONS.has(ext) && lineCount > 100) {
                        results.push({
                            path: fullPath,
                            lines: lineCount
                        });
                    }
                } catch (err) {
                    // If we can't read the file (e.g., encoding error), skip it.
                }
            }
        }
    }
    return results;
}

/**
 * Main execution function.
 */
function main() {
    const targetDir = process.argv[2] || '.';
    
    if (!fs.existsSync(targetDir)) {
        console.error(`Error: The directory "${targetDir}" does not exist.`);
        process.exit(1);
    }

    const absoluteTargetDir = path.resolve(targetDir);
    console.log(`Scanning directory: ${absoluteTargetDir}`);
    console.log('-------------------------------------------');

    let ig = ignore();
    const gitignorePath = path.join(absoluteTargetDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        try {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            ig.add(gitignoreContent.split(/\r?\n/));
        } catch (err) {
            console.error(`Error reading .gitignore: ${err.message}`);
        }
    }

    const largeProgrammingFiles = scanDirectory(absoluteTargetDir, [], ig, absoluteTargetDir);

    if (largeProgrammingFiles.length > 0) {
        console.log(`Found ${largeProgrammingFiles.length} programming file(s) with > 100 lines:\n`);
        largeProgrammingFiles.forEach(f => {
            console.log(`[${f.lines} lines] ${f.path}`);
        });
    } else {
        console.log('No programming files with more than 100 lines were found.');
    }
}

main();
