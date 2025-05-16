"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextjsGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class NextjsGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'app/api',
            'app/components',
            'app/hooks',
            'app/lib',
            'app/styles',
            'public/images',
            'public/fonts',
            'tests/unit',
            'tests/e2e'
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
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint",
                test: "jest"
            },
            dependencies: {
                next: "^14.2.0",
                react: "^18.2.0",
                "react-dom": "^18.2.0",
                typescript: "^5.5.3",
                "@types/node": "^20.14.10",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0"
            },
            devDependencies: {
                jest: "^29.6.2",
                "@testing-library/react": "^14.0.0",
                "@testing-library/jest-dom": "^5.16.5",
                eslint: "^8.47.0",
                "eslint-config-next": "^14.2.0"
            }
        }, null, 2));
        // Create tsconfig.json
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(tsconfigPath, JSON.stringify({
            compilerOptions: {
                target: "es5",
                lib: ["dom", "dom.iterable", "esnext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "node",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                baseUrl: ".",
                paths: {
                    "@/*": ["./app/*"]
                }
            },
            include: ["app/**/*", "tests/**/*"],
            exclude: ["node_modules"]
        }, null, 2));
        // Create next.config.js
        const nextConfigPath = path.join(this.projectPath, 'next.config.js');
        await this.backupIfExists(nextConfigPath);
        await fs.writeFile(nextConfigPath, `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`);
        // Create app/page.tsx
        const pagePath = path.join(this.projectPath, 'app/page.tsx');
        await this.backupIfExists(pagePath);
        await fs.writeFile(pagePath, `export default function Home() {
  return (
    <main>
      <h1>Welcome to ${this.projectName}</h1>
    </main>
  );
}
`);
        // Create app/layout.tsx
        const layoutPath = path.join(this.projectPath, 'app/layout.tsx');
        await this.backupIfExists(layoutPath);
        await fs.writeFile(layoutPath, `'use client';

import './styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`);
        // Create globals.css
        const cssPath = path.join(this.projectPath, 'app/styles/globals.css');
        await this.backupIfExists(cssPath);
        await fs.writeFile(cssPath, `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `node_modules/\n.next/\n.env\n.env.local\ncoverage/\n.DS_Store\n.idea/\n.vscode/\n`);
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

A Next.js project with TypeScript and App Router.

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── layout.tsx
│   ├── page.tsx
├── public/
├── tests/
├── next.config.js
├── package.json
├── tsconfig.json
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
exports.NextjsGenerator = NextjsGenerator;
//# sourceMappingURL=nextjsGenerator.js.map