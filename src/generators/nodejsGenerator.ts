import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig } from './types';

export class NodejsGenerator {
    constructor(private projectPath: string, private projectName: string) {}

    async generate() {
        // Create directory structure
        const folders = [
            'src/api/controllers',
            'src/api/middlewares',
            'src/api/routes',
            'src/api/services',
            'src/api/validators',
            'src/config',
            'src/db/models',
            'src/db/migrations',
            'src/db/seeders',
            'src/utils',
            'src/helpers',
            'public/assets/images',
            'public/assets/css',
            'public/assets/js',
            'views',
            'tests/unit',
            'tests/integration',
            'scripts',
            'logs'
        ];

        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(
            packageJsonPath,
            JSON.stringify({
                name: this.projectName,
                version: '1.0.0',
                description: 'A Node.js application',
                main: 'src/index.js',
                scripts: {
                    start: 'node src/index.js',
                    dev: 'nodemon src/index.js',
                    test: 'jest',
                    lint: 'eslint src/',
                    'lint:fix': 'eslint src/ --fix'
                },
                dependencies: {
                    express: '^4.18.2',
                    dotenv: '^16.3.1',
                    winston: '^3.10.0'
                },
                devDependencies: {
                    eslint: '^8.47.0',
                    jest: '^29.6.2',
                    nodemon: '^3.0.1'
                }
            }, null, 2)
        );

        // Create basic index.js
        const indexPath = path.join(this.projectPath, 'src/index.js');
        await this.backupIfExists(indexPath);
        await fs.writeFile(
            indexPath,
            `const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/', (req, res) => {\n    res.send('Welcome to ${this.projectName}');\n});\n\napp.listen(PORT, () => {\n    console.log(\`Server running on port \${PORT}\`);\n});\n`
        );

        // Create README
        await this.createReadme();

        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `node_modules/\n.env\nlogs/\ncoverage/\n.DS_Store\n.idea/\n.vscode/\n`
        );
    }

    private async backupIfExists(filePath: string) {
        try {
            await fs.access(filePath);
            const backupPath = `${filePath}.backup`;
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(filePath, `${filePath}.backup-${timestamp}`);
            } catch {
                await fs.rename(filePath, backupPath);
            }
        } catch {
            // File/folder doesn't exist, no need to backup
        }
    }

    private async createReadme() {
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);

        const content = `# ${this.projectName}

A Node.js application with organized structure.

## Project Structure

\`\`\`
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   ├── config/
│   ├── db/
│   ├── utils/
│   ├── helpers/
├── public/
├── views/
├── tests/
├── scripts/
├── logs/
\`\`\`

## Installation

\`\`\`bash
npm install
npm start
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}