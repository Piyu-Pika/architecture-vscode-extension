import * as vscode from 'vscode';
import { FlutterGenerator } from './generators/flutterGenerator';
import { GoGenerator } from './generators/goGenerator';
import { NodejsGenerator } from './generators/nodejsGenerator';
import { FastapiGenerator } from './generators/fastapiGenerator';
import { RustGenerator } from './generators/rustGenerator';
import { ReactGenerator } from './generators/reactGenerator';
import { FlutterStateManagement, GoFramework, NodejsFramework, ProjectType } from './generators/types';
import { FlutterArchitecture } from './generators/flutterGenerator';
import { DjangoGenerator } from './generators/djangoGenerator';
import { NextjsGenerator } from './generators/nextjsGenerator';
import { CMakeGenerator } from './generators/cmakeGenerator';
import { AngularGenerator } from './generators/angularGenerator';
import { VueGenerator } from './generators/vueGenerator';
import { SpringBootGenerator } from './generators/springbootGenerator';
import { KotlinGenerator } from './generators/kotlinGenerator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('codearchitect.generate', async () => {
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const projectPath = workspaceFolders[0].uri.fsPath;

        // Select project type
        const projectType = await vscode.window.showQuickPick(
            ['Flutter(Dart)', 'Go', 'Node.js(JavaScript)', 'FastAPI(Python)', 'Django(Python)', 'Rust', 'Next.js(JavaScript)', 'React(JavaScript)', 'CMake(C++)','Angular', 'Vue', 'Spring Boot'],
            { placeHolder: 'Select project type' }
        );

        if (!projectType) {
            return;
        }

        // Get project name (used for naming in files, not folder creation)
        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            validateInput: (value) => value.trim() ? null : 'Project name cannot be empty'
        });

        if (!projectName) {
            return;
        }

        // For Flutter, get organization identifier
        let orgIdentifier = 'com.example';
        if (projectType === 'Flutter(Dart)') {
            const inputOrg = await vscode.window.showInputBox({
                prompt: 'Enter organization identifier (e.g., com.example)',
                value: orgIdentifier
            });

            if (inputOrg) {
                orgIdentifier = inputOrg;
            }
        }
        
        // For Go, get GitHub username or full module path
        let githubUsername = '';
        if (projectType === 'Go') {
            const userInput = await vscode.window.showInputBox({
                prompt: 'Enter GitHub username or full module path (e.g., username or github.com/username)',
                placeHolder: 'username or github.com/username',
                validateInput: (value) => value.trim() ? null : 'Input cannot be empty'
            }) || '';
            
            if (!userInput) {
                return;
            }
            
            // Process the input - extract username from full path if needed
            if (userInput.includes('github.com/')) {
                // Extract username from full path (github.com/username/projectname or github.com/username)
                const parts = userInput.split('/');
                if (parts.length >= 2) {
                    // Get the part after github.com
                    const usernameIndex = parts.findIndex(part => 
                        part === 'github.com' || part === 'github.com:') + 1;
                    
                    if (usernameIndex > 0 && usernameIndex < parts.length) {
                        githubUsername = parts[usernameIndex];
                    }
                }
            } else {
                // User just entered the username
                githubUsername = userInput.trim();
            }
            
            // Validate we have a username
            if (!githubUsername) {
                vscode.window.showErrorMessage('Could not extract a valid GitHub username from input');
                return;
            }
        }

        try {
            switch (projectType) {
            case 'Flutter(Dart)':
                // For Flutter, select architecture with new options
                const architecture = await vscode.window.showQuickPick(
                    ['Clean Architecture', 'MVVM', 'Feature-First', 'Basic'],
                    { placeHolder: 'Select architecture type' }
                );

                if (!architecture) {
                    return;
                }

                // Select state management with new options
                const stateManagement = await vscode.window.showQuickPick(
                    ['BLoC', 'Cubit', 'Riverpod', 'GetX', 'Provider', 'MobX', 'None/Add later'],
                    { placeHolder: 'Select state management solution' }
                );

                if (!stateManagement) {
                    return;
                }

                // Ask about creating sample screens
                const createSamplesResponse = await vscode.window.showQuickPick(
                    ['Yes', 'No'],
                    { placeHolder: 'Create sample screen scaffolds?' }
                );

                if (!createSamplesResponse) {
                    return;
                }

                const createSampleScreens = createSamplesResponse === 'Yes';

                // Create project configuration object
                const config = {
                    projectPath,
                    projectName,
                    orgIdentifier,
                    architecture: architecture as FlutterArchitecture,
                    stateManagement: stateManagement as FlutterStateManagement,
                    createSampleScreens
                };

                // Initialize and run the generator with the new configuration
                const flutterGenerator = new FlutterGenerator(config);
                await flutterGenerator.generate();

                vscode.window.showInformationMessage(`Flutter project created with ${architecture} architecture and ${stateManagement} state management.`);
                break;

                case 'Go':
                const goFramework = await vscode.window.showQuickPick(
                    ['Gin', 'Echo', 'Fiber', 'Chi', 'None'],
                    { placeHolder: 'Select Go framework' }
                );      

                if (!goFramework) {
                    return;
                }   

                 const goGenerator = new GoGenerator({
                      projectPath,
                      projectName,
                      goFramework: goFramework as GoFramework,
                      githubUsername
                  });
                    await goGenerator.generate();
                    break;

                case 'Node.js(JavaScript)':
                    const nodeFramework = await vscode.window.showQuickPick(
                        ['Express', 'Koa', 'NestJS', 'Fastify', 'Hapi', 'None/Add later'],
                        { placeHolder: 'Select Node.js framework' }
                    );

                    if (!nodeFramework) {
                        return;
                    }

                    const nodejsGenerator = new NodejsGenerator({
                        projectPath,
                        projectName,
                        nodeFramework: nodeFramework as NodejsFramework
                    });
                    await nodejsGenerator.generate();
                    break;

                case 'FastAPI(Python)':
                    const fastapiGenerator = new FastapiGenerator(projectPath, projectName);
                    await fastapiGenerator.generate();
                    break;

                case 'Django(Python)':
                    const djangoGenerator = new DjangoGenerator(projectPath, projectName);
                    await djangoGenerator.generate();
                    break;

                case 'Rust':
                    const rustGenerator = new RustGenerator(projectPath, projectName);
                    await rustGenerator.generate();
                    break;

                case 'Next.js(JavaScript)':
                    const nextjsGenerator = new NextjsGenerator(projectPath, projectName);
                    await nextjsGenerator.generate();
                    break;

                case 'React(JavaScript)':
                    const reactGenerator = new ReactGenerator(projectPath, projectName);
                    await reactGenerator.generate();
                    break;
                case 'CMake(C++)':
                    const cmakeGenerator = new CMakeGenerator(projectPath, projectName);
                    await cmakeGenerator.generate();
                    break;
                case 'Angular':
                    const angularGenerator = new AngularGenerator(projectPath, projectName);
                    await angularGenerator.generate();
                    break;
    
                case 'Vue':
                    const vueGenerator = new VueGenerator(projectPath, projectName);
                    await vueGenerator.generate();
                    break;
                case 'Spring Boot':
                    const springBootGenerator = new SpringBootGenerator(projectPath, projectName);
                    await springBootGenerator.generate();
                    break;
                case 'Kotlin':
                    const kotlinGenerator = new KotlinGenerator(projectPath, projectName);
                    await kotlinGenerator.generate();
                    break;
            }

            vscode.window.showInformationMessage(`Project structure for ${projectName} created successfully in workspace root!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create project structure: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}