import * as fs from 'fs/promises';
import * as path from 'path';

export type FlutterArchitecture = 'Clean Architecture' | 'MVVM' | 'Basic' | 'Feature-First'|'BLoC Architecture';
export type FlutterStateManagement = 'BLoC' | 'Riverpod' | 'Provider' | 'GetX' | 'Cubit' | 'MobX' | 'None/Add later';

export interface ProjectConfig {
    projectPath: string;
    projectName: string;
    orgIdentifier: string;
    architecture: FlutterArchitecture;
    stateManagement: FlutterStateManagement;
    createSampleScreens: boolean;
}

export class FlutterGenerator {
    constructor(private config: ProjectConfig) {
        if (this.config.architecture === 'BLoC Architecture') {
            this.config.stateManagement = 'BLoC';
        }
    }

    async generate() {
        // Create basic Flutter project structure
        await this.createFlutterProject();
        
        // Create architecture-specific structure
        switch (this.config.architecture) {
            case 'Clean Architecture':
                await this.createCleanArchitectureStructure();
                break;
            case 'MVVM':
                await this.createMVVMStructure();
                break;
            case 'Feature-First':
                await this.createFeatureFirstStructure();
                break;
            case 'Basic':
                await this.createBasicStructure();
                break;
            case 'BLoC Architecture':
                await this.createBlocArchitectureStructure();
                break;
            default:
                await this.createBasicStructure();
                break;
        }

        // Update pubspec.yaml with minimal dependencies
        await this.updatePubspec();

        // Create main.dart with basic app structure
        await this.createMainFile();

        // Create README
        await this.createReadme();
    }

    private async backupIfExists(folderPath: string) {
        try {
            await fs.access(folderPath);
            const backupPath = `${folderPath}.backup`;
            // Check if backup already exists, append timestamp if it does
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(folderPath, `${folderPath}.backup-${timestamp}`);
            } catch {
                await fs.rename(folderPath, backupPath);
            }
        } catch {
            // Folder doesn't exist, no need to backup
        }
    }

    private async createFlutterProject() {
        // Backup existing lib folder
        await this.backupIfExists(path.join(this.config.projectPath, 'lib'));
        
        // Create basic folders
        await fs.mkdir(path.join(this.config.projectPath, 'lib'), { recursive: true });
        await fs.mkdir(path.join(this.config.projectPath, 'test'), { recursive: true });
        await fs.mkdir(path.join(this.config.projectPath, 'assets'), { recursive: true });
        await fs.mkdir(path.join(this.config.projectPath, 'assets/images'), { recursive: true });
        await fs.mkdir(path.join(this.config.projectPath, 'assets/fonts'), { recursive: true });
        
        // Create or update pubspec.yaml if it doesn't exist
        const pubspecPath = path.join(this.config.projectPath, 'pubspec.yaml');
        try {
            await fs.access(pubspecPath);
            // Pubspec exists, skip creation
        } catch {
            await fs.writeFile(
                pubspecPath,
                `name: ${this.config.projectName.toLowerCase().replace(/ /g, '_')}
description: A new Flutter project.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.2

flutter:
  uses-material-design: true
  
  # assets:
  #   - assets/images/
  
  # fonts:
  #   - family: Schyler
  #     fonts:
  #       - asset: assets/fonts/Schyler-Regular.ttf
  #       - asset: assets/fonts/Schyler-Italic.ttf
  #         style: italic
`
            );
        }
    }

    private async createBasicStructure() {
        const libPath = path.join(this.config.projectPath, 'lib');
        
        // Create folder structure
        const folders = [
            'screens',
            'widgets',
            'utils',
            'models',
            'services'
        ];

        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create sample home screen scaffold
        if (this.config.createSampleScreens) {
            await this.createSampleHomeScreen('screens');
        }
    }

    private async createCleanArchitectureStructure() {
        const libPath = path.join(this.config.projectPath, 'lib');
        
        // Create folder structure
        const folders = [
            'core/constants',
            'core/errors',
            'core/network',
            'core/utils',
            'core/widgets',
            'features/home/data/datasources',
            'features/home/data/repositories',
            'features/home/domain/entities',
            'features/home/domain/repositories',
            'features/home/domain/usecases',
            'features/home/presentation/pages',
            'features/home/presentation/widgets',
            'config/routes',
            'config/themes',
            'di'
        ];

        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create state management folders if needed
        if (this.config.stateManagement !== 'None/Add later') {
            const stateDir = this.getStateManagementDir();
            await fs.mkdir(path.join(libPath, `core/${stateDir}`), { recursive: true });
            await fs.mkdir(path.join(libPath, `features/home/presentation/${stateDir}`), { recursive: true });
        }

        // Create sample home screen scaffold
        if (this.config.createSampleScreens) {
            await this.createSampleHomeScreen('features/home/presentation/pages');
        }
    }

    private async createMVVMStructure() {
        const libPath = path.join(this.config.projectPath, 'lib');
        
        // Create folder structure
        const folders = [
            'models',
            'view_models',
            'views',
            'utils',
            'widgets',
            'config/themes',
            'config/routes',
            'services'
        ];

        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create state management folders
        if (this.config.stateManagement !== 'None/Add later') {
            const stateDir = this.getStateManagementDir();
            await fs.mkdir(path.join(libPath, `view_models/${stateDir}`), { recursive: true });
        }

        // Create sample home screen scaffold
        if (this.config.createSampleScreens) {
            await this.createSampleHomeScreen('views');
        }
    }

    private async createFeatureFirstStructure() {
        const libPath = path.join(this.config.projectPath, 'lib');
        
        // Create folder structure
        const folders = [
            'core/utils',
            'core/widgets',
            'core/constants',
            'core/services',
            'core/theme',
            'features/home/models',
            'features/home/screens',
            'features/home/widgets',
            'features/home/services',
            'routes'
        ];

        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create state management folders
        if (this.config.stateManagement !== 'None/Add later') {
            const stateDir = this.getStateManagementDir();
            await fs.mkdir(path.join(libPath, `core/${stateDir}`), { recursive: true });
            await fs.mkdir(path.join(libPath, `features/home/${stateDir}`), { recursive: true });
        }

        // Create sample home screen scaffold
        if (this.config.createSampleScreens) {
            await this.createSampleHomeScreen('features/home/screens');
        }
    }
    private async createBlocArchitectureStructure() {
        const libPath = path.join(this.config.projectPath, 'lib');
        
        // Create folder structure for BLoC Architecture
        const folders = [
            'data/models',
            'data/repositories',
            'data/datasources',
            'domain/entities',
            'domain/repositories',
            'domain/usecases',
            'presentation/bloc',
            'presentation/screens',
            'presentation/widgets',
            'core/utils',
            'core/constants',
            'core/network',
            'core/theme',
            'core/bloc',
            'di'
        ];

        for (const folder of folders) {
            const fullPath = path.join(libPath, folder);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create sample bloc files
        await this.createSampleBlocFiles();

        // Create sample home screen scaffold
        if (this.config.createSampleScreens) {
            await this.createSampleHomeScreen('presentation/screens');
        }
    }
    private async createSampleBlocFiles() {
        const blocPath = path.join(this.config.projectPath, 'lib', 'presentation', 'bloc');
        
        // Create sample counter bloc
        await fs.writeFile(
            path.join(blocPath, 'counter_event.dart'),
            `part of 'counter_bloc.dart';

@immutable
abstract class CounterEvent {}

class IncrementEvent extends CounterEvent {}

class DecrementEvent extends CounterEvent {}
`
        );

        await fs.writeFile(
            path.join(blocPath, 'counter_state.dart'),
            `part of 'counter_bloc.dart';

@immutable
class CounterState {
  final int count;
  
  const CounterState({this.count = 0});
  
  CounterState copyWith({int? count}) {
    return CounterState(
      count: count ?? this.count,
    );
  }
}
`
        );

        await fs.writeFile(
            path.join(blocPath, 'counter_bloc.dart'),
            `import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

part 'counter_event.dart';
part 'counter_state.dart';

class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState()) {
    on<IncrementEvent>(_onIncrement);
    on<DecrementEvent>(_onDecrement);
  }

  void _onIncrement(IncrementEvent event, Emitter<CounterState> emit) {
    emit(state.copyWith(count: state.count + 1));
  }

  void _onDecrement(DecrementEvent event, Emitter<CounterState> emit) {
    emit(state.copyWith(count: state.count - 1));
  }
}
`
        );
    }


    private async createMainFile() {
        const mainPath = path.join(this.config.projectPath, 'lib', 'main.dart');
        await fs.writeFile(
            mainPath,
            `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${this.config.projectName}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${this.config.projectName}'),
      ),
      body: const Center(
        child: Text('Welcome to ${this.config.projectName}'),
      ),
    );
  }
}
`
        );
    }

    private async createSampleHomeScreen(baseDir: string) {
        const screenPath = path.join(this.config.projectPath, 'lib', baseDir, 'home_screen.dart');
        await fs.writeFile(
            screenPath,
            `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
      ),
      body: const Center(
        child: Text('Home Screen'),
      ),
    );
  }
}
`
        );
    }

    private async updatePubspec() {
        const stateManagementDeps = this.getStateManagementDependencies();
        if (stateManagementDeps.length === 0) {
            return; // No need to update if no additional dependencies
        }
        
        const pubspecPath = path.join(this.config.projectPath, 'pubspec.yaml');
        let pubspecContent;
        try {
            pubspecContent = await fs.readFile(pubspecPath, 'utf8');
        } catch {
            return; // Can't read pubspec, skip updating
        }

        // Add only state management dependencies
        const dependencyLines = stateManagementDeps.map(dep => `  ${dep}`).join('\n');
        
        if (!pubspecContent.includes('dependencies:')) {
            pubspecContent += `\ndependencies:\n${dependencyLines}\n`;
        } else {
            // Append dependencies to existing section
            const lines = pubspecContent.split('\n');
            let inDep = false;
            let depIndex = -1;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === 'dependencies:') {
                    inDep = true;
                    depIndex = i;
                    continue;
                }
                
                if (inDep && lines[i].match(/^\S/)) {
                    // Found end of dependencies section
                    lines.splice(i, 0, dependencyLines);
                    pubspecContent = lines.join('\n');
                    await fs.writeFile(pubspecPath, pubspecContent);
                    return;
                }
            }
            
            // If we get here, append to end of dependencies section
            if (depIndex !== -1) {
                lines.splice(depIndex + 1, 0, dependencyLines);
                pubspecContent = lines.join('\n');
            }
        }

        await fs.writeFile(pubspecPath, pubspecContent);
    }

    private async createReadme() {
        const readmePath = path.join(this.config.projectPath, 'README.md');
        const architectureDesc = this.getArchitectureDescription();
        
        const readmeContent = `# ${this.config.projectName}

A Flutter project using ${this.config.architecture} architecture.

## Project Structure

${architectureDesc}

${this.config.stateManagement !== 'None/Add later' ? 
`State management: ${this.config.stateManagement}` : 
'No state management library selected yet.'}

## Getting Started

1. Run \`flutter pub get\` to install dependencies
2. Start the app with \`flutter run\`
`;

        await fs.writeFile(readmePath, readmeContent);
    }

    private getArchitectureDescription(): string {
        switch (this.config.architecture) {
            case 'Clean Architecture':
                return `The project follows Clean Architecture principles:
- \`lib/core/\`: Core utilities and shared components
- \`lib/features/\`: Feature-specific code organized in layers
  - \`data/\`: Data sources and repositories implementations
  - \`domain/\`: Business logic, entities and repository interfaces
  - \`presentation/\`: UI components and state management
- \`lib/config/\`: App configuration and routing
- \`lib/di/\`: Dependency injection`;
            
            case 'MVVM':
                return `The project follows MVVM architecture:
- \`lib/models/\`: Data models
- \`lib/view_models/\`: Business logic and state management
- \`lib/views/\`: UI screens and components
- \`lib/utils/\`: Utility functions and helpers
- \`lib/services/\`: Services for external data sources
- \`lib/config/\`: App configuration and routing`;
            
            case 'Feature-First':
                return `The project is organized by features:
- \`lib/core/\`: Shared utilities and components
- \`lib/features/\`: Feature modules
  - Each feature contains its own models, screens, widgets and services
- \`lib/routes/\`: App routing`;
            
            case 'Basic':
            default:
                return `The project has a simple, straightforward structure:
- \`lib/screens/\`: UI screens
- \`lib/widgets/\`: Reusable UI components
- \`lib/models/\`: Data models
- \`lib/services/\`: Services for business logic
- \`lib/utils/\`: Utility functions and helpers`;
        }
    }

    private getStateManagementDir(): string {
        switch (this.config.stateManagement) {
            case 'BLoC':
            case 'Cubit':
                return 'bloc';
            case 'Riverpod':
            case 'Provider':
                return 'providers';
            case 'GetX':
                return 'controllers';
            case 'MobX':
                return 'stores';
            case 'None/Add later':
                return 'none';
            default:
                return 'state';
        }
    }

    private getStateManagementDependencies(): string[] {
        switch (this.config.stateManagement) {
            case 'BLoC':
                return ['bloc: ^8.1.0', 'flutter_bloc: ^8.1.0'];
            case 'Cubit':
                return ['bloc: ^8.1.0', 'flutter_bloc: ^8.1.0'];  
            case 'Riverpod':
                return ['flutter_riverpod: ^2.3.0'];
            case 'GetX':
                return ['get: ^4.6.5'];
            case 'Provider':
                return ['provider: ^6.1.1'];
            case 'MobX':
                return ['mobx: ^2.2.0', 'flutter_mobx: ^2.0.6+5', 'mobx_codegen: ^2.3.0'];
            default:
                return [];
        }
    }
}