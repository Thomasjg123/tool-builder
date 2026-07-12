const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PROGRAMMING_EXTENSIONS = new Set([
    '.js', '.ts', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rb', '.php', '.html', '.css', '.sql', '.sh', '.lua', '.swift', '.kt'
]);
const TEXT_EXTENSIONS = new Set([
    ...PROGRAMMING_EXTENSIONS,
    '.txt', '.md', '.csv', '.log', '.yml', '.yaml', '.xml'
]);
function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.length === 0) return 0;
    const lines = content.split(/\r?\n/);
    if (lines[lines.length - 1] === '') {
        lines.pop();
    }
    return lines.length;
}
function main() {
    const targetDir = process.argv[2] || '.';
    if (!fs.existsSync(targetDir)) {
        console.error(`Error: The directory "${targetDir}" does not exist.`);
        process.exit(1);
    }
    const absoluteTargetDir = path.resolve(targetDir);
    console.log(`Scanning directory: ${absoluteTargetDir}`);
    console.log('-------------------------------------------');
    let fileList = [];
    try {
        const cmd = `git -C "${absoluteTargetDir}" ls-files --cached --others --exclude-standard`;
        const output = execSync(cmd, { encoding: 'utf8' });
        fileList = output.split(/\r?\n/).filter(line => line.trim() !== '');
    } catch (err) {
        console.error(`Error: Failed to run 'git ls-files'. Ensure you are in a git repository and git is installed.`);
        console.error(`Details: ${err.message}`);
        process.exit(1);
    }
    const results = [];
    for (const relativePath of fileList) {
        const fullPath = path.join(absoluteTargetDir, relativePath);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                const ext = path.extname(fullPath).toLowerCase();
                if (TEXT_EXTENSIONS.has(ext)) {
                    const lineCount = countLines(fullPath);
                    if (PROGRAMMING_EXTENSIONS.has(ext) && lineCount > 100) {
                        results.push({
                            path: fullPath,
                            lines: lineCount
                        });
                    }
                }
            }
        } catch (err) {}
    }
    if (results.length > 0) {
        console.log(`Found ${results.length} programming file(s) with > 100 lines:\n`);
        results.forEach(f => {
            console.log(`[${f.lines} lines] ${f.path}`);
        });
    } else {
        console.log('No programming files with more than 100 lines were found.');
    }
}
main();
