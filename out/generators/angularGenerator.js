"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class AngularGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        try {
            // Create base directory first if it doesn't exist
            await fs.mkdir(this.projectPath, { recursive: true });
            // Create directory structure
            const folders = [
                'src/app/components',
                'src/app/services',
                'src/app/models',
                'src/app/shared',
                'src/app/pages/home',
                'src/app/guards',
                'src/assets/images',
                'src/assets/styles',
                'src/environments',
                'e2e',
                'tests/unit'
            ];
            for (const folder of folders) {
                const fullPath = path.join(this.projectPath, folder);
                await this.backupIfExists(fullPath);
                await fs.mkdir(fullPath, { recursive: true });
                console.log(`Created directory: ${fullPath}`);
            }
            // Create package.json
            const packageJsonPath = path.join(this.projectPath, 'package.json');
            await this.backupIfExists(packageJsonPath);
            await fs.writeFile(packageJsonPath, JSON.stringify({
                name: this.projectName,
                version: "0.0.1",
                private: true,
                scripts: {
                    start: "ng serve",
                    build: "ng build",
                    test: "ng test",
                    lint: "ng lint",
                    e2e: "ng e2e"
                },
                dependencies: {
                    "@angular/core": "^17.0.0",
                    "@angular/common": "^17.0.0",
                    "@angular/compiler": "^17.0.0",
                    "@angular/platform-browser": "^17.0.0",
                    "@angular/platform-browser-dynamic": "^17.0.0",
                    "@angular/router": "^17.0.0",
                    "rxjs": "^7.8.0",
                    "tslib": "^2.6.0",
                    "zone.js": "^0.14.0"
                },
                devDependencies: {
                    "@angular-devkit/build-angular": "^17.0.0",
                    "@angular/cli": "^17.0.0",
                    "@angular/compiler-cli": "^17.0.0",
                    "@types/jasmine": "^5.1.0",
                    "@types/node": "^20.14.10",
                    "jasmine-core": "^5.1.0",
                    "karma": "^6.4.0",
                    "karma-chrome-launcher": "^3.2.0",
                    "karma-coverage": "^2.2.0",
                    "karma-jasmine": "^5.1.0",
                    "karma-jasmine-html-reporter": "^2.1.0",
                    "typescript": "^5.5.3",
                    "protractor": "^7.0.0",
                    "eslint": "^8.47.0"
                }
            }, null, 2));
            console.log(`Created file: ${packageJsonPath}`);
            // Create angular.json
            const angularJsonPath = path.join(this.projectPath, 'angular.json');
            await this.backupIfExists(angularJsonPath);
            await fs.writeFile(angularJsonPath, JSON.stringify({
                $schema: "./node_modules/@angular/cli/lib/config/schema.json",
                version: 1,
                newProjectRoot: "projects",
                projects: {
                    [this.projectName]: {
                        projectType: "application",
                        schematics: {},
                        root: "",
                        sourceRoot: "src",
                        prefix: "app",
                        architect: {
                            build: {
                                builder: "@angular-devkit/build-angular:browser",
                                options: {
                                    outputPath: "dist/" + this.projectName,
                                    index: "src/index.html",
                                    main: "src/main.ts",
                                    polyfills: "src/polyfills.ts",
                                    tsConfig: "tsconfig.app.json",
                                    assets: ["src/favicon.ico", "src/assets"],
                                    styles: ["src/styles.css"],
                                    scripts: []
                                },
                                configurations: {
                                    production: {
                                        budgets: [
                                            { type: "initial", maximumWarning: "500kb", maximumError: "1mb" },
                                            { type: "anyComponentStyle", maximumWarning: "2kb", maximumError: "4kb" }
                                        ],
                                        fileReplacements: [
                                            { replace: "src/environments/environment.ts", with: "src/environments/environment.prod.ts" }
                                        ],
                                        outputHashing: "all"
                                    }
                                }
                            },
                            serve: {
                                builder: "@angular-devkit/build-angular:dev-server",
                                options: { browserTarget: this.projectName + ":build" },
                                configurations: { production: { browserTarget: this.projectName + ":build:production" } }
                            },
                            test: {
                                builder: "@angular-devkit/build-angular:karma",
                                options: {
                                    main: "src/test.ts",
                                    polyfills: "src/polyfills.ts",
                                    tsConfig: "tsconfig.spec.json",
                                    karmaConfig: "karma.conf.js",
                                    assets: ["src/favicon.ico", "src/assets"],
                                    styles: ["src/styles.css"],
                                    scripts: []
                                }
                            }
                        }
                    }
                }
            }, null, 2));
            console.log(`Created file: ${angularJsonPath}`);
            // Create tsconfig.json
            const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
            await this.backupIfExists(tsconfigPath);
            await fs.writeFile(tsconfigPath, JSON.stringify({
                compileOnSave: false,
                compilerOptions: {
                    baseUrl: "./",
                    outDir: "./dist/out-tsc",
                    sourceMap: true,
                    declaration: false,
                    downlevelIteration: true,
                    experimentalDecorators: true,
                    module: "esnext",
                    moduleResolution: "node",
                    importHelpers: true,
                    target: "es2020",
                    lib: ["es2020", "dom"],
                    paths: {
                        "@app/*": ["src/app/*"],
                        "@environments/*": ["src/environments/*"]
                    }
                },
                files: ["src/main.ts", "src/polyfills.ts"],
                include: ["src/**/*.d.ts"]
            }, null, 2));
            console.log(`Created file: ${tsconfigPath}`);
            // Create tsconfig.app.json
            const tsconfigAppPath = path.join(this.projectPath, 'tsconfig.app.json');
            await this.backupIfExists(tsconfigAppPath);
            await fs.writeFile(tsconfigAppPath, JSON.stringify({
                extends: "./tsconfig.json",
                compilerOptions: {
                    outDir: "./dist/out-tsc",
                    types: []
                },
                files: ["src/main.ts", "src/polyfills.ts"],
                include: ["src/**/*.d.ts"]
            }, null, 2));
            console.log(`Created file: ${tsconfigAppPath}`);
            // Create tsconfig.spec.json
            const tsconfigSpecPath = path.join(this.projectPath, 'tsconfig.spec.json');
            await this.backupIfExists(tsconfigSpecPath);
            await fs.writeFile(tsconfigSpecPath, JSON.stringify({
                extends: "./tsconfig.json",
                compilerOptions: {
                    outDir: "./dist/out-tsc/spec",
                    types: ["jasmine"]
                },
                files: ["src/test.ts", "src/polyfills.ts"],
                include: ["src/**/*.spec.ts", "src/**/*.d.ts"]
            }, null, 2));
            console.log(`Created file: ${tsconfigSpecPath}`);
            // Create src directory if it doesn't exist
            const srcDir = path.join(this.projectPath, 'src');
            await fs.mkdir(srcDir, { recursive: true });
            // Create src/main.ts
            const mainPath = path.join(this.projectPath, 'src/main.ts');
            await this.backupIfExists(mainPath);
            await fs.writeFile(mainPath, `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
`);
            console.log(`Created file: ${mainPath}`);
            // Create src/app/app.module.ts
            const appModulePath = path.join(this.projectPath, 'src/app/app.module.ts');
            await this.backupIfExists(appModulePath);
            await fs.writeFile(appModulePath, `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
`);
            console.log(`Created file: ${appModulePath}`);
            // Create src/app/app-routing.module.ts
            const appRoutingPath = path.join(this.projectPath, 'src/app/app-routing.module.ts');
            await this.backupIfExists(appRoutingPath);
            await fs.writeFile(appRoutingPath, `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
`);
            console.log(`Created file: ${appRoutingPath}`);
            // Create src/app/app.component.ts
            const appComponentPath = path.join(this.projectPath, 'src/app/app.component.ts');
            await this.backupIfExists(appComponentPath);
            await fs.writeFile(appComponentPath, `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '${this.projectName}';
}
`);
            console.log(`Created file: ${appComponentPath}`);
            // Create src/app/app.component.html
            const appHtmlPath = path.join(this.projectPath, 'src/app/app.component.html');
            await this.backupIfExists(appHtmlPath);
            await fs.writeFile(appHtmlPath, `<router-outlet></router-outlet>
`);
            console.log(`Created file: ${appHtmlPath}`);
            // Create src/app/app.component.css
            const appCssPath = path.join(this.projectPath, 'src/app/app.component.css');
            await this.backupIfExists(appCssPath);
            await fs.writeFile(appCssPath, '');
            console.log(`Created file: ${appCssPath}`);
            // Create src/app/pages/home/home.component.ts
            const homeComponentPath = path.join(this.projectPath, 'src/app/pages/home/home.component.ts');
            await this.backupIfExists(homeComponentPath);
            await fs.writeFile(homeComponentPath, `import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = '${this.projectName}';
}
`);
            console.log(`Created file: ${homeComponentPath}`);
            // Create src/app/pages/home/home.component.html
            const homeHtmlPath = path.join(this.projectPath, 'src/app/pages/home/home.component.html');
            await this.backupIfExists(homeHtmlPath);
            await fs.writeFile(homeHtmlPath, `<h1>Welcome to {{title}}</h1>
`);
            console.log(`Created file: ${homeHtmlPath}`);
            // Create src/app/pages/home/home.component.css
            const homeCssPath = path.join(this.projectPath, 'src/app/pages/home/home.component.css');
            await this.backupIfExists(homeCssPath);
            await fs.writeFile(homeCssPath, '');
            console.log(`Created file: ${homeCssPath}`);
            // Create src/index.html
            const indexPath = path.join(this.projectPath, 'src/index.html');
            await this.backupIfExists(indexPath);
            await fs.writeFile(indexPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${this.projectName}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`);
            console.log(`Created file: ${indexPath}`);
            // Create src/styles.css
            const stylesPath = path.join(this.projectPath, 'src/styles.css');
            await this.backupIfExists(stylesPath);
            await fs.writeFile(stylesPath, `body {
  margin: 0;
  font-family: Arial, sans-serif;
}
`);
            console.log(`Created file: ${stylesPath}`);
            // Create src/environments/environment.ts
            const envPath = path.join(this.projectPath, 'src/environments/environment.ts');
            await this.backupIfExists(envPath);
            await fs.writeFile(envPath, `export const environment = {
  production: false
};
`);
            console.log(`Created file: ${envPath}`);
            // Create src/environments/environment.prod.ts
            const envProdPath = path.join(this.projectPath, 'src/environments/environment.prod.ts');
            await this.backupIfExists(envProdPath);
            await fs.writeFile(envProdPath, `export const environment = {
  production: true
};
`);
            console.log(`Created file: ${envProdPath}`);
            // Create src/polyfills.ts
            const polyfillsPath = path.join(this.projectPath, 'src/polyfills.ts');
            await this.backupIfExists(polyfillsPath);
            await fs.writeFile(polyfillsPath, `import 'zone.js';
`);
            console.log(`Created file: ${polyfillsPath}`);
            // Create src/test.ts
            const testPath = path.join(this.projectPath, 'src/test.ts');
            await this.backupIfExists(testPath);
            await fs.writeFile(testPath, `import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: false } }
);
`);
            console.log(`Created file: ${testPath}`);
            // Create karma.conf.js
            const karmaPath = path.join(this.projectPath, 'karma.conf.js');
            await this.backupIfExists(karmaPath);
            await fs.writeFile(karmaPath, `module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/${this.projectName}'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
`);
            console.log(`Created file: ${karmaPath}`);
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
            console.log(`Created file: ${gitignorePath}`);
            console.log(`Angular project structure created successfully at: ${this.projectPath}`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error generating Angular project: ${error.message}`);
            }
            else {
                console.error('Error generating Angular project:', error);
            }
            throw error;
        }
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

An Angular project with TypeScript.

## Project Structure

\`\`\`
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   ├── shared/
│   │   ├── pages/
│   │   ├── guards/
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   ├── assets/
│   ├── environments/
│   ├── main.ts
│   ├── index.html
│   ├── styles.css
├── e2e/
├── tests/
├── angular.json
├── package.json
├── tsconfig.json
\`\`\`

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`
`;
        await fs.writeFile(readmePath, content);
        console.log(`Created file: ${readmePath}`);
    }
}
exports.AngularGenerator = AngularGenerator;
//# sourceMappingURL=angularGenerator.js.map