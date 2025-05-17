"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const flutterGenerator_1 = require("./generators/flutterGenerator");
const goGenerator_1 = require("./generators/goGenerator");
const nodejsGenerator_1 = require("./generators/nodejsGenerator");
const fastapiGenerator_1 = require("./generators/fastapiGenerator");
const rustGenerator_1 = require("./generators/rustGenerator");
const reactGenerator_1 = require("./generators/reactGenerator");
const types_1 = require("./generators/types");
const djangoGenerator_1 = require("./generators/djangoGenerator");
const nextjsGenerator_1 = require("./generators/nextjsGenerator");
const cmakeGenerator_1 = require("./generators/cmakeGenerator");
function activate(context) {
    let disposable = vscode.commands.registerCommand('codearchitect.generate', async () => {
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        const projectPath = workspaceFolders[0].uri.fsPath;
        // Select project type
        const projectType = await vscode.window.showQuickPick(['Flutter(Dart)', 'Go', 'Node.js(JavaScript)', 'FastAPI(Python)', 'Django(Python)', 'Rust', 'Next.js(JavaScript)', 'React(JavaScript)', 'CMake(C++)'], { placeHolder: 'Select project type' });
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
                    const architecture = await vscode.window.showQuickPick(['Clean Architecture', 'MVVM'], { placeHolder: 'Select architecture type' });
                    if (!architecture) {
                        return;
                    }
                    // Select state management
                    const stateManagement = await vscode.window.showQuickPick(['BLoC', 'Riverpod', 'GetX', 'Provider', 'None/Add later'], { placeHolder: 'Select state management solution' });
                    if (!stateManagement) {
                        return;
                    }
                    // Map string to FlutterStateManagement enum
                    const stateManagementEnum = stateManagement === 'BLoC' ? types_1.FlutterStateManagement.Bloc :
                        stateManagement === 'Riverpod' ? types_1.FlutterStateManagement.Riverpod :
                            stateManagement === 'GetX' ? types_1.FlutterStateManagement.GetX :
                                stateManagement === 'Provider' ? types_1.FlutterStateManagement.Provider :
                                    types_1.FlutterStateManagement.None;
                    const flutterGenerator = new flutterGenerator_1.FlutterGenerator(projectPath, projectName, orgIdentifier, architecture, stateManagementEnum);
                    await flutterGenerator.generate();
                    break;
                case 'Go':
                    const goGenerator = new goGenerator_1.GoGenerator(projectPath, projectName);
                    await goGenerator.generate();
                    break;
                case 'Node.js':
                    const nodejsGenerator = new nodejsGenerator_1.NodejsGenerator(projectPath, projectName);
                    await nodejsGenerator.generate();
                    break;
                case 'FastAPI':
                    const fastapiGenerator = new fastapiGenerator_1.FastapiGenerator(projectPath, projectName);
                    await fastapiGenerator.generate();
                    break;
                case 'Django':
                    const djangoGenerator = new djangoGenerator_1.DjangoGenerator(projectPath, projectName);
                    await djangoGenerator.generate();
                    break;
                case 'Rust':
                    const rustGenerator = new rustGenerator_1.RustGenerator(projectPath, projectName);
                    await rustGenerator.generate();
                    break;
                case 'Next.js':
                    const nextjsGenerator = new nextjsGenerator_1.NextjsGenerator(projectPath, projectName);
                    await nextjsGenerator.generate();
                    break;
                case 'React':
                    const reactGenerator = new reactGenerator_1.ReactGenerator(projectPath, projectName);
                    await reactGenerator.generate();
                    break;
                case 'CMake':
                    const cmakeGenerator = new cmakeGenerator_1.CMakeGenerator(projectPath, projectName);
                    await cmakeGenerator.generate();
                    break;
            }
            vscode.window.showInformationMessage(`Project structure for ${projectName} created successfully in workspace root!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create project structure: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map