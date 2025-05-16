import * as vscode from 'vscode';
import { FlutterGenerator } from './generators/flutterGenerator';
import { GoGenerator } from './generators/goGenerator';
import { NodejsGenerator } from './generators/nodejsGenerator';
import { FastapiGenerator } from './generators/fastapiGenerator';
import { RustGenerator } from './generators/rustGenerator';
import { ReactGenerator } from './generators/reactGenerator';
import { FlutterArchitecture, FlutterStateManagement, ProjectType } from './generators/types';
import { DjangoGenerator } from './generators/djangoGenerator';
import { NextjsGenerator } from './generators/nextjsGenerator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('architecture.generate', async () => {
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const projectPath = workspaceFolders[0].uri.fsPath;

        // Select project type
        const projectType = await vscode.window.showQuickPick(
            ['Flutter', 'Go', 'Node.js', 'FastAPI', 'Django', 'Rust', 'Next.js', 'React'],
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
                case 'Flutter':
                    // For Flutter, select architecture
                    const architecture = await vscode.window.showQuickPick(
                        ['Clean Architecture', 'MVVM'],
                        { placeHolder: 'Select architecture type' }
                    );

                    if (!architecture) {
                        return;
                    }

                    // Select state management
                    const stateManagement = await vscode.window.showQuickPick(
                        ['BLoC', 'Riverpod', 'GetX', 'Provider', 'None/Add later'],
                        { placeHolder: 'Select state management solution' }
                    );

                    if (!stateManagement) {
                        return;
                    }

                    // Map string to FlutterStateManagement enum
                    const stateManagementEnum = stateManagement === 'BLoC' ? FlutterStateManagement.Bloc :
                        stateManagement === 'Riverpod' ? FlutterStateManagement.Riverpod :
                        stateManagement === 'GetX' ? FlutterStateManagement.GetX :
                        stateManagement === 'Provider' ? FlutterStateManagement.Provider :
                        FlutterStateManagement.None;

                    const flutterGenerator = new FlutterGenerator(projectPath, projectName, orgIdentifier, architecture as FlutterArchitecture, stateManagementEnum);
                    await flutterGenerator.generate();
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
            }

            vscode.window.showInformationMessage(`Project structure for ${projectName} created successfully in workspace root!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create project structure: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}