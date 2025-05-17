import * as vscode from 'vscode';
import { FlutterGenerator } from './generators/flutterGenerator';
import { GoGenerator } from './generators/goGenerator';
import { NodejsGenerator } from './generators/nodejsGenerator';
import { FastapiGenerator } from './generators/fastapiGenerator';
import { RustGenerator } from './generators/rustGenerator';
import { ReactGenerator } from './generators/reactGenerator';
import { FlutterStateManagement, ProjectType } from './generators/types';
import { FlutterArchitecture } from './generators/flutterGenerator';
import { DjangoGenerator } from './generators/djangoGenerator';
import { NextjsGenerator } from './generators/nextjsGenerator';
import { CMakeGenerator } from './generators/cmakeGenerator';

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
            ['Flutter(Dart)', 'Go', 'Node.js(JavaScript)', 'FastAPI(Python)', 'Django(Python)', 'Rust', 'Next.js(JavaScript)', 'React(JavaScript)', 'CMake(C++)'],
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
        if (projectType === 'Flutter') {
            const inputOrg = await vscode.window.showInputBox({
                prompt: 'Enter organization identifier (e.g., com.example)',
                value: orgIdentifier
            });

            if (inputOrg) {
                orgIdentifier = inputOrg;
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
                    const goGenerator = new GoGenerator(projectPath, projectName);
                    await goGenerator.generate();
                    break;

                case 'Node.js':
                    const nodejsGenerator = new NodejsGenerator(projectPath, projectName);
                    await nodejsGenerator.generate();
                    break;

                case 'FastAPI':
                    const fastapiGenerator = new FastapiGenerator(projectPath, projectName);
                    await fastapiGenerator.generate();
                    break;

                case 'Django':
                    const djangoGenerator = new DjangoGenerator(projectPath, projectName);
                    await djangoGenerator.generate();
                    break;

                case 'Rust':
                    const rustGenerator = new RustGenerator(projectPath, projectName);
                    await rustGenerator.generate();
                    break;

                case 'Next.js':
                    const nextjsGenerator = new NextjsGenerator(projectPath, projectName);
                    await nextjsGenerator.generate();
                    break;

                case 'React':
                    const reactGenerator = new ReactGenerator(projectPath, projectName);
                    await reactGenerator.generate();
                    break;
                case 'CMake':
                    const cmakeGenerator = new CMakeGenerator(projectPath, projectName);
                    await cmakeGenerator.generate();
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