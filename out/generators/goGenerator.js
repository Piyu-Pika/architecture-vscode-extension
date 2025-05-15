"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class GoGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            `cmd/${this.projectName}`,
            'internal/config',
            'internal/handlers',
            'internal/models',
            'internal/services',
            'pkg/utils',
            'api',
            'web',
            'configs',
            'scripts',
            'test',
            'docs'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create main.go
        const mainPath = path.join(this.projectPath, `cmd/${this.projectName}/main.go`);
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `package main\n\nfunc main() {\n    // Application entry point\n}\n`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Coverage
*.out

# Go workspace
go.work

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
`);
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

A Go project with a clean structure.

## Project Structure

\`\`\`
├── cmd/
│   └── ${this.projectName}/    # Main entry point
├── configs/            # Configuration files
├── docs/               # Documentation
├── internal/           # Private code
│   ├── config/         # Configuration
│   ├── handlers/       # HTTP handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
├── pkg/                # Public code
│   └── utils/          # Utilities
├── scripts/            # Development scripts
├── test/               # Tests
├── web/                # Web assets
\`\`\`

## Getting Started

\`\`\`bash
go run cmd/${this.projectName}/main.go
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.GoGenerator = GoGenerator;
//# sourceMappingURL=goGenerator.js.map