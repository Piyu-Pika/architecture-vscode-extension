"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs/promises");
const flutterGenerator_1 = require("./generators/flutterGenerator");
const goGenerator_1 = require("./generators/goGenerator");
const nodejsGenerator_1 = require("./generators/nodejsGenerator");
const fastapiGenerator_1 = require("./generators/fastapiGenerator");
const rustGenerator_1 = require("./generators/rustGenerator");
const reactGenerator_1 = require("./generators/reactGenerator");
const djangoGenerator_1 = require("./generators/djangoGenerator");
const nextjsGenerator_1 = require("./generators/nextjsGenerator");
const cmakeGenerator_1 = require("./generators/cmakeGenerator");
const angularGenerator_1 = require("./generators/angularGenerator");
const vueGenerator_1 = require("./generators/vueGenerator");
const springbootGenerator_1 = require("./generators/springbootGenerator");
const kotlinGenerator_1 = require("./generators/kotlinGenerator");
const dependancyInstall_1 = require("./dependancyInstall");
const path = require("path");
const projectRunner_1 = require("./projectRunner");
const reactNativeGenerator_1 = require("./generators/reactNativeGenerator");
// import { CustomStructureGenerator } from './generators/custormStructureGenerator';
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
        const projectType = await vscode.window.showQuickPick(['Flutter(Dart)', 'Go', 'Node.js(JavaScript)', 'FastAPI(Python)', 'Django(Python)', 'Rust', 'Next.js(JavaScript)', 'React(JavaScript)', 'CMake(C++)', 'Angular', 'Vue', 'Spring Boot', 'Kotlin', 'React Native'], { placeHolder: 'Select project type' });
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
                    const usernameIndex = parts.findIndex(part => part === 'github.com' || part === 'github.com:') + 1;
                    if (usernameIndex > 0 && usernameIndex < parts.length) {
                        githubUsername = parts[usernameIndex];
                    }
                }
            }
            else {
                // User just entered the username
                githubUsername = userInput.trim();
            }
            // Validate we have a username
            if (!githubUsername) {
                vscode.window.showErrorMessage('Could not extract a valid GitHub username from input');
                return;
            }
        }
        // Ask if user wants to install dependencies after generation
        const installDeps = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Install dependencies after generating project?' });
        const shouldInstallDependencies = installDeps === 'Yes';
        try {
            let projectGenerated = false;
            switch (projectType) {
                case 'Flutter(Dart)':
                    // For Flutter, select architecture with new options
                    const architecture = await vscode.window.showQuickPick(['Clean Architecture', 'MVVM', 'Feature-First', 'BLoC Architecture', 'Basic'], { placeHolder: 'Select architecture type' });
                    if (!architecture) {
                        return;
                    }
                    // Select state management with new options
                    const stateManagement = await vscode.window.showQuickPick(['BLoC', 'Cubit', 'Riverpod', 'GetX', 'Provider', 'MobX', 'None/Add later'], { placeHolder: 'Select state management solution' });
                    if (!stateManagement) {
                        return;
                    }
                    // Ask about creating sample screens
                    const createSamplesResponse = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Create sample screen scaffolds?' });
                    if (!createSamplesResponse) {
                        return;
                    }
                    const createSampleScreens = createSamplesResponse === 'Yes';
                    // Create project configuration object
                    const config = {
                        projectPath,
                        projectName,
                        orgIdentifier,
                        architecture: architecture,
                        stateManagement: stateManagement,
                        createSampleScreens
                    };
                    // Initialize and run the generator with the new configuration
                    const flutterGenerator = new flutterGenerator_1.FlutterGenerator(config);
                    await flutterGenerator.generate();
                    projectGenerated = true;
                    vscode.window.showInformationMessage(`Flutter project created with ${architecture} architecture and ${stateManagement} state management.`);
                    break;
                case 'Go':
                    const goFramework = await vscode.window.showQuickPick(['Gin', 'Echo', 'Fiber', 'Chi', 'None'], { placeHolder: 'Select Go framework' });
                    if (!goFramework) {
                        return;
                    }
                    const goGenerator = new goGenerator_1.GoGenerator({
                        projectPath,
                        projectName,
                        goFramework: goFramework,
                        githubUsername
                    });
                    await goGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Node.js(JavaScript)':
                    const nodeFramework = await vscode.window.showQuickPick(['Express', 'Koa', 'NestJS', 'Fastify', 'Hapi', 'None/Add later'], { placeHolder: 'Select Node.js framework' });
                    if (!nodeFramework) {
                        return;
                    }
                    const nodejsGenerator = new nodejsGenerator_1.NodejsGenerator({
                        projectPath,
                        projectName,
                        nodeFramework: nodeFramework
                    });
                    await nodejsGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'FastAPI(Python)':
                    const fastapiGenerator = new fastapiGenerator_1.FastapiGenerator(projectPath, projectName);
                    await fastapiGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Django(Python)':
                    const djangoGenerator = new djangoGenerator_1.DjangoGenerator(projectPath, projectName);
                    await djangoGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Rust':
                    const rustFramework = await vscode.window.showQuickPick(['Actix', 'Axum', 'Warp', 'None/Add later'], { placeHolder: 'Select Rust framework' });
                    if (!rustFramework) {
                        return;
                    }
                    const rustGenerator = new rustGenerator_1.RustGenerator(projectPath, projectName, rustFramework);
                    await rustGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Next.js(JavaScript)':
                    const nextjsGenerator = new nextjsGenerator_1.NextjsGenerator(projectPath, projectName);
                    await nextjsGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'React(JavaScript)':
                    const reactGenerator = new reactGenerator_1.ReactGenerator(projectPath, projectName);
                    await reactGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'CMake(C++)':
                    const cmakeGenerator = new cmakeGenerator_1.CMakeGenerator(projectPath, projectName);
                    await cmakeGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Angular':
                    const angularGenerator = new angularGenerator_1.AngularGenerator(projectPath, projectName);
                    await angularGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Vue':
                    const vueGenerator = new vueGenerator_1.VueGenerator(projectPath, projectName);
                    await vueGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Spring Boot':
                    const springBootGenerator = new springbootGenerator_1.SpringBootGenerator(projectPath, projectName);
                    await springBootGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'Kotlin':
                    const kotlinGenerator = new kotlinGenerator_1.KotlinGenerator(projectPath, projectName);
                    await kotlinGenerator.generate();
                    projectGenerated = true;
                    break;
                case 'React Native':
                    const reactNativeGenerator = new reactNativeGenerator_1.ReactNativeGenerator(projectPath, projectName);
                    await reactNativeGenerator.generate();
                    projectGenerated = true;
                    break;
            }
            if (projectGenerated) {
                vscode.window.showInformationMessage(`Project structure for ${projectName} created successfully in workspace root!`);
                // Install dependencies if requested
                if (shouldInstallDependencies) {
                    try {
                        // Show a status message
                        vscode.window.showInformationMessage(`Installing dependencies for ${projectName}...`);
                        // Get the appropriate installer and run it
                        const installer = dependancyInstall_1.DependencyInstallerFactory.getInstaller(projectType);
                        await installer.installDependencies(projectPath, projectName);
                        vscode.window.showInformationMessage(`Dependencies installed successfully for ${projectName}!`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to install dependencies: ${error}`);
                    }
                }
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create project structure: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
    // Add more commands as needed (e.g., cleanup backups)
    let cleanupBackups = vscode.commands.registerCommand('codearchitect.cleanupBackups', async () => {
        // Ensure a workspace is open
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open. Please open a project to clean up backups.');
            return;
        }
        // Get the root path of the first workspace folder
        const rootPath = workspaceFolders[0].uri.fsPath;
        try {
            // Find all files and folders with .backup extension
            const backupItems = [];
            const items = await fs.readdir(rootPath, { withFileTypes: true });
            for (const item of items) {
                if (item.name.endsWith('.backup')) {
                    backupItems.push(item.name);
                }
            }
            // If no backup files/folders are found, inform the user
            if (backupItems.length === 0) {
                vscode.window.showInformationMessage('No .backup files or folders found in the workspace.');
                return;
            }
            // Show the list of backup items to the user
            const backupList = backupItems.join(', ');
            const confirmationMessage = `The following .backup items will be deleted: ${backupList}\n\nThis is an irreversible change. Are you sure you want to proceed?`;
            // Prompt for confirmation
            const userChoice = await vscode.window.showWarningMessage(confirmationMessage, { modal: true }, 'Yes, Delete', 'No, Cancel');
            // If the user cancels, exit
            if (userChoice !== 'Yes, Delete') {
                vscode.window.showInformationMessage('Cleanup cancelled.');
                return;
            }
            // Delete the backup items
            for (const item of backupItems) {
                const itemPath = path.join(rootPath, item);
                await fs.rm(itemPath, { recursive: true, force: true });
            }
            // Notify the user of success
            vscode.window.showInformationMessage(`Successfully deleted ${backupItems.length} .backup items.`);
        }
        catch (error) {
            // Handle any errors during the process
            vscode.window.showErrorMessage(`Failed to clean up backups: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    // Command to run the Project Runner
    const projectRunnerCommand = vscode.commands.registerCommand('codearchitect.projectRunner', async () => {
        // Check if workspace is available
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        // Show mode selection
        const mode = await vscode.window.showQuickPick([
            { label: 'Development', value: 'dev', description: 'Run in development mode with hot reload' },
            { label: 'Production', value: 'prod', description: 'Run in production mode' },
            { label: 'Debug', value: 'debug', description: 'Run in debug mode with debugging enabled' }
        ], {
            placeHolder: 'Select the mode to run your project',
            title: 'Project Run Mode'
        });
        if (!mode) {
            return; // User cancelled selection
        }
        try {
            // Show initial message
            vscode.window.showInformationMessage(`Starting project in ${mode.label.toLowerCase()} mode...`);
            // Run the project using AutoProjectManager
            await projectRunner_1.AutoProjectManager.runFromWorkspace(mode.value);
            // Success message will be handled by the AutoProjectManager internally
            // No need to show another success message here to avoid duplication
        }
        catch (error) {
            // This catch block provides an additional safety net
            // The AutoProjectManager.runFromWorkspace already handles most errors
            console.error('Project runner command error:', error);
            vscode.window.showErrorMessage(`Unexpected error while running project: ${error}`);
        }
    });
    context.subscriptions.push(projectRunnerCommand);
    // Enhanced project runner with device selection
    const enhancedProjectRunnerCommand = vscode.commands.registerCommand('codearchitect.runProjectWithDevices', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        // Mode selection
        const mode = await vscode.window.showQuickPick([
            { label: 'Development', value: 'dev' },
            { label: 'Production', value: 'prod' },
            { label: 'Debug', value: 'debug' }
        ], { placeHolder: 'Select the mode to run your project' });
        if (!mode)
            return;
        try {
            vscode.window.showInformationMessage(`Starting project with device selection in ${mode.label.toLowerCase()} mode...`);
            // Use the enhanced version with device selection
            await projectRunner_1.EnhancedAutoProjectManager.autoRunProjectWithDeviceSelection(workspacePath, undefined, mode.value);
        }
        catch (error) {
            console.error('Enhanced project runner error:', error);
            vscode.window.showErrorMessage(`Failed to run project with device selection: ${error}`);
        }
    });
    // Command to show project info
    const showProjectInfoCommand = vscode.commands.registerCommand('codearchitect.showProjectInfo', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        await projectRunner_1.AutoProjectManager.showProjectInfo(workspacePath);
    });
    context.subscriptions.push(projectRunnerCommand, enhancedProjectRunnerCommand, showProjectInfoCommand);
    // Add the command to the extension context
    context.subscriptions.push(cleanupBackups);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map