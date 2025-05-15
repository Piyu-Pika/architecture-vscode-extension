"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastapiGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class FastapiGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'app/api/endpoints',
            'app/api/dependencies',
            'app/core',
            'app/db',
            'app/models',
            'app/schemas',
            'app/services',
            'app/utils',
            'tests/api',
            'tests/services',
            'tests/utils'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create __init__.py files
        const initFiles = [
            'app/__init__.py',
            'app/api/__init__.py',
            'app/api/endpoints/__init__.py',
            'app/api/dependencies/__init__.py',
            'app/core/__init__.py',
            'app/db/__init__.py',
            'app/models/__init__.py',
            'app/schemas/__init__.py',
            'app/services/__init__.py',
            'app/utils/__init__.py',
            'tests/__init__.py'
        ];
        for (const file of initFiles) {
            const fullPath = path.join(this.projectPath, file);
            await this.backupIfExists(fullPath);
            await fs.writeFile(fullPath, '');
        }
        // Create main.py
        const mainPath = path.join(this.projectPath, 'app/main.py');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `from fastapi import FastAPI\n\napp = FastAPI(title="${this.projectName}")\n\n@app.get("/")\ndef root():\n    return {"message": "Welcome to ${this.projectName} API"}\n`);
        // Create requirements.txt
        const requirementsPath = path.join(this.projectPath, 'requirements.txt');
        await this.backupIfExists(requirementsPath);
        await fs.writeFile(requirementsPath, `fastapi>=0.100.0\nuvicorn>=0.22.0\npydantic>=2.0.0\nsqlalchemy>=2.0.0\nalembic>=1.11.0\npython-dotenv>=1.0.0\nhttpx>=0.24.0\npytest>=7.3.0\n`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `__pycache__/\n*.pyc\n.env\n.idea/\n.vscode/\n.DS_Store\nvenv/\n`);
    }
    async backupIfExists(filePath) {
        try {
            await fs.access(filePath);
            const backupPath = `${filePath}.backup`;
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(filePath, `${filePath}.backup-${timestamp}`);
            }
            catch {
                await fs.rename(filePath, backupPath);
            }
        }
        catch {
            // File/folder doesn't exist, no need to backup
        }
    }
    async createReadme() {
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);
        const content = `# ${this.projectName}

A FastAPI project with structured layout.

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   ├── dependencies/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
├── tests/
├── requirements.txt
\`\`\`

## Getting Started

\`\`\`bash
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.FastapiGenerator = FastapiGenerator;
//# sourceMappingURL=fastapiGenerator.js.map