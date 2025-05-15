"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class FlutterGenerator {
    constructor(projectPath, projectName, orgIdentifier, architecture, stateManagement) {
        this.projectPath = projectPath;
        this.projectName = projectName;
        this.orgIdentifier = orgIdentifier;
        this.architecture = architecture;
        this.stateManagement = stateManagement;
    }
    async generate() {
        // Create basic Flutter project structure
        await this.createFlutterProject();
        // Create architecture-specific structure
        if (this.architecture === 'Clean Architecture') {
            await this.createCleanArchitectureStructure();
        }
        else {
            await this.createMVVMStructure();
        }
        // Update pubspec.yaml
        await this.updatePubspec();
        // Create README
        await this.createReadme();
    }
    async backupIfExists(folderPath) {
        try {
            await fs.access(folderPath);
            const backupPath = `${folderPath}.backup`;
            // Check if backup already exists, append timestamp if it does
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(folderPath, `${folderPath}.backup-${timestamp}`);
            }
            catch {
                await fs.rename(folderPath, backupPath);
            }
        }
        catch {
            // Folder doesn't exist, no need to backup
        }
    }
    async createFlutterProject() {
        // Backup existing lib and test folders
        await this.backupIfExists(path.join(this.projectPath, 'lib'));
        await this.backupIfExists(path.join(this.projectPath, 'test'));
        // Create basic folders
        await fs.mkdir(path.join(this.projectPath, 'lib'), { recursive: true });
        await fs.mkdir(path.join(this.projectPath, 'test'), { recursive: true });
        // Create or update pubspec.yaml
        const pubspecPath = path.join(this.projectPath, 'pubspec.yaml');
        try {
            await fs.access(pubspecPath);
            // Pubspec exists, skip creation
        }
        catch {
            await fs.writeFile(pubspecPath, `name: ${this.projectName}
description: A new Flutter project.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
`);
        }
    }
    async createCleanArchitectureStructure() {
        const libPath = path.join(this.projectPath, 'lib');
        const testPath = path.join(this.projectPath, 'test');
        // Create folder structure
        const folders = [
            'core/constants',
            'core/errors',
            'core/network',
            'core/usecases',
            'core/utils',
            'core/widgets',
            'features/auth/data/datasources/local',
            'features/auth/data/datasources/remote',
            'features/auth/data/models',
            'features/auth/data/repositories',
            'features/auth/domain/entities',
            'features/auth/domain/repositories',
            'features/auth/domain/usecases',
            'features/auth/presentation/pages',
            'features/auth/presentation/widgets',
            'config/routes',
            'config/themes',
            'di'
        ];
        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create test folders
        const testFolders = [
            'features/auth/data',
            'features/auth/domain',
            'features/auth/presentation',
            'core'
        ];
        for (const folder of testFolders) {
            const fullPath = path.join(testPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create state management folders
        if (this.stateManagement !== 'None/Add later') {
            const stateDir = this.getStateManagementDir();
            const coreStatePath = path.join(libPath, `core/${stateDir}`);
            const featureStatePath = path.join(libPath, `features/auth/presentation/${stateDir}`);
            await this.backupIfExists(coreStatePath);
            await this.backupIfExists(featureStatePath);
            await fs.mkdir(coreStatePath, { recursive: true });
            await fs.mkdir(featureStatePath, { recursive: true });
        }
    }
    async createMVVMStructure() {
        const libPath = path.join(this.projectPath, 'lib');
        const testPath = path.join(this.projectPath, 'test');
        // Create folder structure
        const folders = [
            'models',
            'view_models',
            'views',
            'utils',
            'widgets',
            'config/themes',
            'config/routes'
        ];
        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create test folders
        const testFolders = ['models', 'view_models', 'views'];
        for (const folder of testFolders) {
            const fullPath = path.join(testPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create state management folders
        if (this.stateManagement !== 'None/Add later') {
            const stateDir = this.getStateManagementDir();
            const statePath = path.join(libPath, `view_models/${stateDir}`);
            await this.backupIfExists(statePath);
            await fs.mkdir(statePath, { recursive: true });
        }
    }
    async updatePubspec() {
        const dependencies = this.getDependencies();
        const pubspecPath = path.join(this.projectPath, 'pubspec.yaml');
        let pubspecContent;
        try {
            pubspecContent = await fs.readFile(pubspecPath, 'utf8');
        }
        catch {
            pubspecContent = '';
        }
        // Append dependencies if not already present
        const dependencyLines = dependencies.map(dep => `  ${dep}`).join('\n');
        if (!pubspecContent.includes('dependencies:')) {
            pubspecContent += `\ndependencies:\n${dependencyLines}\n`;
        }
        else {
            // Add new dependencies under existing dependencies section
            const lines = pubspecContent.split('\n');
            const depIndex = lines.findIndex(line => line.trim() === 'dependencies:');
            lines.splice(depIndex + 1, 0, ...dependencyLines.split('\n'));
            pubspecContent = lines.join('\n');
        }
        await fs.writeFile(pubspecPath, pubspecContent);
    }
    async createReadme() {
        const stateDir = this.getStateManagementDir();
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);
        const readmeContent = `# ${this.projectName}

A Flutter project using ${this.architecture} architecture.

## Project Structure

${this.architecture === 'Clean Architecture' ?
            `The project follows Clean Architecture:
- \`lib/core/\`: Core utilities
- \`lib/features/\`: Feature-specific code
- \`lib/config/\`: App configuration
- \`lib/di/\`: Dependency injection`
            :
                `The project follows MVVM architecture:
- \`lib/models/\`: Data models
- \`lib/view_models/\`: Business logic
- \`lib/views/\`: UI screens
- \`lib/utils/\`: Utilities
- \`lib/widgets/\`: Reusable widgets
- \`lib/config/\`: App configuration`}

State management: ${this.stateManagement}
Located in: ${this.architecture === 'Clean Architecture' ?
            `\`lib/features/**/presentation/${stateDir}\`` :
            `\`lib/view_models/${stateDir}\``}

## Getting Started

1. Run \`flutter pub get\` to install dependencies
2. Start the app with \`flutter run\`
`;
        await fs.writeFile(readmePath, readmeContent);
    }
    getStateManagementDir() {
        switch (this.stateManagement) {
            case 'BLoC':
                return 'bloc';
            case 'Riverpod':
            case 'Provider':
                return 'providers';
            case 'GetX':
                return 'controllers';
            default:
                return 'none';
        }
    }
    getDependencies() {
        const baseDependencies = this.architecture === 'Clean Architecture' ?
            ['dartz: ^0.10.1', 'equatable: ^2.0.5', 'http: ^0.13.5', 'shared_preferences: ^2.0.15'] :
            ['equatable: ^2.0.5', 'http: ^0.13.5', 'shared_preferences: ^2.0.15'];
        switch (this.stateManagement) {
            case 'BLoC':
                return [...baseDependencies, 'bloc: ^8.1.0', 'flutter_bloc: ^8.1.0'];
            case 'Riverpod':
                return [...baseDependencies, 'flutter_riverpod: ^2.3.0', 'riverpod_annotation: ^2.2.0'];
            case 'GetX':
                return [...baseDependencies, 'get: ^4.6.5'];
            case 'Provider':
                return [...baseDependencies, 'provider: ^6.1.1'];
            default:
                return baseDependencies;
        }
    }
}
exports.FlutterGenerator = FlutterGenerator;
//# sourceMappingURL=flutterGenerator.js.map