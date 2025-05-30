import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { FlutterGenerator } from './generators/flutterGenerator';
import { GoGenerator } from './generators/goGenerator';
import { NodejsGenerator } from './generators/nodejsGenerator';
import { FastapiGenerator } from './generators/fastapiGenerator';
import { RustGenerator } from './generators/rustGenerator';
import { ReactGenerator } from './generators/reactGenerator';
import { FlutterStateManagement, GoFramework, NodejsFramework, ProjectType, RustFramework } from './generators/types';
import { FlutterArchitecture } from './generators/flutterGenerator';
import { DjangoGenerator } from './generators/djangoGenerator';
import { NextjsGenerator } from './generators/nextjsGenerator';
import { CMakeGenerator } from './generators/cmakeGenerator';
import { AngularGenerator } from './generators/angularGenerator';
import { VueGenerator } from './generators/vueGenerator';
import { SpringBootGenerator } from './generators/springbootGenerator';
import { KotlinGenerator } from './generators/kotlinGenerator';
import { DependencyInstallerFactory } from './dependancyInstall';
import path = require('path');
import { AutoProjectManager } from './projectRunner';

// import { CustomStructureGenerator } from './generators/custormStructureGenerator';

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
            ['Flutter(Dart)', 'Go', 'Node.js(JavaScript)', 'FastAPI(Python)', 'Django(Python)', 'Rust', 'Next.js(JavaScript)', 'React(JavaScript)', 'CMake(C++)', 'Angular', 'Vue', 'Spring Boot', 'Kotlin'],
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

        // Ask if user wants to install dependencies after generation
        const installDeps = await vscode.window.showQuickPick(
            ['Yes', 'No'],
            { placeHolder: 'Install dependencies after generating project?' }
        );

        const shouldInstallDependencies = installDeps === 'Yes';

        try {
            let projectGenerated = false;

            switch (projectType) {
            case 'Flutter(Dart)':
                // For Flutter, select architecture with new options
                const architecture = await vscode.window.showQuickPick(
                    ['Clean Architecture', 'MVVM', 'Feature-First', 'BLoC Architecture','Basic'],
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
                projectGenerated = true;

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
                    projectGenerated = true;
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
                    projectGenerated = true;
                    break;

                case 'FastAPI(Python)':
                    const fastapiGenerator = new FastapiGenerator(projectPath, projectName);
                    await fastapiGenerator.generate();
                    projectGenerated = true;
                    break;

                case 'Django(Python)':
                    const djangoGenerator = new DjangoGenerator(projectPath, projectName);
                    await djangoGenerator.generate();
                    projectGenerated = true;
                    break;

                case 'Rust':
                    const rustFramework = await vscode.window.showQuickPick(
                        ['Actix', 'Axum', 'Warp', 'None/Add later'],
                        { placeHolder: 'Select Rust framework' }
                    );

                    if (!rustFramework) {
                        return;
                    }

                    const rustGenerator = new RustGenerator(projectPath, projectName, rustFramework as RustFramework);
                    await rustGenerator.generate();
                    projectGenerated = true;
                    break;

                case 'Next.js(JavaScript)':
                    const nextjsGenerator = new NextjsGenerator(projectPath, projectName);
                    await nextjsGenerator.generate();
                    projectGenerated = true;
                    break;

                case 'React(JavaScript)':
                    const reactGenerator = new ReactGenerator(projectPath, projectName);
                    await reactGenerator.generate();
                    projectGenerated = true;
                    break;
                    
                case 'CMake(C++)':
                    const cmakeGenerator = new CMakeGenerator(projectPath, projectName);
                    await cmakeGenerator.generate();
                    projectGenerated = true;
                    break;
                    
                case 'Angular':
                    const angularGenerator = new AngularGenerator(projectPath, projectName);
                    await angularGenerator.generate();
                    projectGenerated = true;
                    break;
    
                case 'Vue':
                    const vueGenerator = new VueGenerator(projectPath, projectName);
                    await vueGenerator.generate();
                    projectGenerated = true;
                    break;
                    
                case 'Spring Boot':
                    const springBootGenerator = new SpringBootGenerator(projectPath, projectName);
                    await springBootGenerator.generate();
                    projectGenerated = true;
                    break;
                    
                case 'Kotlin':
                    const kotlinGenerator = new KotlinGenerator(projectPath, projectName);
                    await kotlinGenerator.generate();
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
                        const installer = DependencyInstallerFactory.getInstaller(projectType as ProjectType);
                        await installer.installDependencies(projectPath, projectName);
                        
                        vscode.window.showInformationMessage(`Dependencies installed successfully for ${projectName}!`);
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to install dependencies: ${error}`);
                    }
                }
            }
        } catch (error) {
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
          const backupItems: string[] = [];
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
          const userChoice = await vscode.window.showWarningMessage(
            confirmationMessage,
            { modal: true },
            'Yes, Delete',
            'No, Cancel'
          );
    
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
        } catch (error) {
          // Handle any errors during the process
          vscode.window.showErrorMessage(`Failed to clean up backups: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

    // Command to run the Project Runner
    const projectRunnerCommand = vscode.commands.registerCommand('codearchitect.projectRunner', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      const mode = await vscode.window.showQuickPick(['dev', 'prod', 'debug'], { placeHolder: 'Select the mode' });

      if (!mode) {
        vscode.window.showErrorMessage('No mode selected.');
        return;
      }

      try {
        await AutoProjectManager.runFromWorkspace(mode as 'dev' | 'prod' | 'debug');
        vscode.window.showInformationMessage(`Project is running in ${mode} mode.`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to run project: ${error}`);
      }
    });

    context.subscriptions.push(projectRunnerCommand);

    
      // Add the command to the extension context
      context.subscriptions.push(cleanupBackups);

}

export function deactivate() {}