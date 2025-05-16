"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class ReactGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'src/components',
            'src/hooks',
            'src/pages',
            'src/styles',
            'src/utils',
            'public/assets',
            'tests/components',
            'tests/hooks'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: "vite",
                build: "tsc && vite build",
                preview: "vite preview",
                test: "jest",
                lint: "eslint src/"
            },
            dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0",
                typescript: "^5.5.3",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0"
            },
            devDependencies: {
                vite: "^4.4.0",
                "@vitejs/plugin-react": "^4.0.0",
                jest: "^29.6.2",
                "@testing-library/react": "^14.0.0",
                "@testing-library/jest-dom": "^5.16.5",
                eslint: "^8.47.0",
                "@typescript-eslint/eslint-plugin": "^5.62.0",
                "@typescript-eslint/parser": "^5.62.0"
            }
        }, null, 2));
        // Create tsconfig.json
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(tsconfigPath, JSON.stringify({
            compilerOptions: {
                target: "ESNext",
                useDefineForClassFields: true,
                lib: ["DOM", "DOM.Iterable", "ESNext"],
                allowJs: false,
                skipLibCheck: true,
                esModuleInterop: false,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                module: "ESNext",
                moduleResolution: "Node",
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-jsx"
            },
            include: ["src"],
            references: [{ path: "./tsconfig.node.json" }]
        }, null, 2));
        // Create tsconfig.node.json
        const tsconfigNodePath = path.join(this.projectPath, 'tsconfig.node.json');
        await this.backupIfExists(tsconfigNodePath);
        await fs.writeFile(tsconfigNodePath, JSON.stringify({
            compilerOptions: {
                composite: true,
                module: "ESNext",
                moduleResolution: "Node",
                allowSyntheticDefaultImports: true
            },
            include: ["vite.config.ts"]
        }, null, 2));
        // Create vite.config.ts
        const viteConfigPath = path.join(this.projectPath, 'vite.config.ts');
        await this.backupIfExists(viteConfigPath);
        await fs.writeFile(viteConfigPath, `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`);
        // Create src/main.tsx
        const mainPath = path.join(this.projectPath, 'src/main.tsx');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);
        // Create src/App.tsx
        const appPath = path.join(this.projectPath, 'src/App.tsx');
        await this.backupIfExists(appPath);
        await fs.writeFile(appPath, `function App() {
  return (
    <div>
      <h1>Welcome to ${this.projectName}</h1>
    </div>
  );
}

export default App;
`);
        // Create src/styles/global.css
        const cssPath = path.join(this.projectPath, 'src/styles/global.css');
        await this.backupIfExists(cssPath);
        await fs.writeFile(cssPath, `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`);
        // Create index.html
        const indexPath = path.join(this.projectPath, 'index.html');
        await this.backupIfExists(indexPath);
        await fs.writeFile(indexPath, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `node_modules/\ndist/\n.env\ncoverage/\n.DS_Store\n.idea/\n.vscode/\n`);
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

A React project with TypeScript and Vite.

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
├── public/
├── tests/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
\`\`\`

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.ReactGenerator = ReactGenerator;
//# sourceMappingURL=reactGenerator.js.map