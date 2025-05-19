"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class VueGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'src/components',
            'src/views',
            'src/stores',
            'src/assets/images',
            'src/assets/styles',
            'src/router',
            'src/composables',
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
                dev: "vite",
                build: "vue-tsc && vite build",
                preview: "vite preview",
                test: "vitest",
                lint: "eslint src/"
            },
            dependencies: {
                vue: "^3.4.0",
                "vue-router": "^4.2.0",
                pinia: "^2.1.0",
                "@vueuse/core": "^10.7.0"
            },
            devDependencies: {
                vite: "^5.0.0",
                "@vitejs/plugin-vue": "^5.0.0",
                "vue-tsc": "^2.0.0",
                typescript: "^5.5.3",
                "@types/node": "^20.14.10",
                vitest: "^1.0.0",
                "@vue/test-utils": "^2.4.0",
                "jsdom": "^24.0.0",
                eslint: "^8.47.0",
                "@typescript-eslint/eslint-plugin": "^7.0.0",
                "@typescript-eslint/parser": "^7.0.0",
                "eslint-plugin-vue": "^9.20.0"
            }
        }, null, 2));
        // Create vite.config.ts
        const viteConfigPath = path.join(this.projectPath, 'vite.config.ts');
        await this.backupIfExists(viteConfigPath);
        await fs.writeFile(viteConfigPath, `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
`);
        // Create tsconfig.json
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(tsconfigPath, JSON.stringify({
            compilerOptions: {
                target: "ESNext",
                useDefineForClassFields: true,
                module: "ESNext",
                moduleResolution: "Node",
                strict: true,
                jsx: "preserve",
                sourceMap: true,
                resolveJsonModule: true,
                esModuleInterop: true,
                lib: ["ESNext", "DOM"],
                baseUrl: ".",
                paths: {
                    "@/*": ["src/*"]
                }
            },
            include: ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
            exclude: ["node_modules"]
        }, null, 2));
        // Create src/main.ts
        const mainPath = path.join(this.projectPath, 'src/main.ts');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
`);
        // Create src/App.vue
        const appPath = path.join(this.projectPath, 'src/App.vue');
        await this.backupIfExists(appPath);
        await fs.writeFile(appPath, `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
`);
        // Create src/router/index.ts
        const routerPath = path.join(this.projectPath, 'src/router/index.ts');
        await this.backupIfExists(routerPath);
        await fs.writeFile(routerPath, `import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
`);
        // Create src/views/HomeView.vue
        const homeViewPath = path.join(this.projectPath, 'src/views/HomeView.vue');
        await this.backupIfExists(homeViewPath);
        await fs.writeFile(homeViewPath, `<template>
  <div class="home">
    <h1>Welcome to ${this.projectName}</h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 60px;
}
</style>
`);
        // Create src/assets/styles/main.css
        const cssPath = path.join(this.projectPath, 'src/assets/styles/main.css');
        await this.backupIfExists(cssPath);
        await fs.writeFile(cssPath, `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`);
        // Create src/index.html
        const indexPath = path.join(this.projectPath, 'index.html');
        await this.backupIfExists(indexPath);
        await fs.writeFile(indexPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.projectName}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `node_modules/
dist/
coverage/
.env
.DS_Store
.idea/
.vscode/
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

A Vue 3 project with TypeScript and Vite.

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   ├── views/
│   ├── stores/
│   ├── assets/
│   │   ├── images/
│   │   ├── styles/
│   ├── router/
│   ├── composables/
│   ├── App.vue
│   ├── main.ts
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
exports.VueGenerator = VueGenerator;
//# sourceMappingURL=vueGenerator.js.map