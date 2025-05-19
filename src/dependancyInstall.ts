import * as vscode from 'vscode';
import { ProjectType } from './generators/types';

// Add this interface to your types.ts file or in this same file
export interface DependencyInstaller {
  installDependencies(projectPath: string, projectName: string): Promise<void>;
}

// Helper class to handle terminal operations
export class TerminalManager {
  private static terminal: vscode.Terminal | undefined;
  
  // Get or create terminal
  public static getTerminal(name: string = 'Code Architect'): vscode.Terminal {
    if (!this.terminal || this.terminal.exitStatus !== undefined) {
      this.terminal = vscode.window.createTerminal(name);
    }
    return this.terminal;
  }
  
  // Execute a command in the terminal
  public static async executeCommand(command: string, cwd?: string): Promise<void> {
    const terminal = this.getTerminal();
    
    // Change directory if specified
    if (cwd) {
      // Handle paths with spaces
      const cdCommand = process.platform === 'win32' 
        ? `cd "${cwd.replace(/\\/g, '/')}"` 
        : `cd "${cwd}"`;
      
      terminal.sendText(cdCommand);
    }
    
    terminal.show();
    terminal.sendText(command);
    
    // Return a promise that can be awaited
    return new Promise<void>((resolve) => {
      // We can't reliably detect when a command finishes in the terminal
      // So we just resolve immediately and let the terminal run in the background
      resolve();
    });
  }
  
  // Execute multiple commands in sequence
  public static async executeCommands(commands: string[], cwd?: string): Promise<void> {
    const terminal = this.getTerminal();
    
    // Change directory if specified
    if (cwd) {
      const cdCommand = process.platform === 'win32' 
        ? `cd "${cwd.replace(/\\/g, '/')}"` 
        : `cd "${cwd}"`;
      
      terminal.sendText(cdCommand);
    }
    
    terminal.show();
    
    // Send all commands at once with && between them
    const combinedCommand = commands.join(' && ');
    terminal.sendText(combinedCommand);
    
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}

// Implementation for Flutter dependency installer
export class FlutterDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'flutter pub get'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Node.js dependency installer
export class NodejsDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'npm install'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Python dependency installer
export class PythonDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    // Create virtual environment and install dependencies
    const commands = [
      'python -m venv venv',
      process.platform === 'win32' ? '.\\venv\\Scripts\\activate' : 'source venv/bin/activate',
      'pip install -r requirements.txt'
    ];
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }
}

// Implementation for Go dependency installer
export class GoDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'go mod tidy'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Rust dependency installer
export class RustDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'cargo build'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for React/Next.js dependency installer
export class ReactDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'npm install'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for C++ with CMake dependency installer
export class CMakeDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    const commands = [
      'mkdir -p build',
      'cd build',
      'cmake ..',
      'cmake --build .'
    ];
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }
}

// Implementation for Angular dependency installer
export class AngularDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'npm install'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Vue dependency installer
export class VueDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    await TerminalManager.executeCommands([
      'npm install'
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Spring Boot dependency installer
export class SpringBootDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    const command = process.platform === 'win32' 
      ? '.\\gradlew build' 
      : './gradlew build';
    
    await TerminalManager.executeCommands([
      command
    ], `${projectPath}/${projectName}`);
  }
}

// Implementation for Kotlin dependency installer
export class KotlinDependencyInstaller implements DependencyInstaller {
  async installDependencies(projectPath: string, projectName: string): Promise<void> {
    const command = process.platform === 'win32' 
      ? '.\\gradlew build' 
      : './gradlew build';
    
    await TerminalManager.executeCommands([
      command
    ], `${projectPath}/${projectName}`);
  }
}

// Factory to get the appropriate dependency installer
export class DependencyInstallerFactory {
  static getInstaller(projectType: ProjectType): DependencyInstaller {
    switch (projectType) {
      case 'Flutter':
        return new FlutterDependencyInstaller();
      case 'Go':
        return new GoDependencyInstaller();
      case 'Node.js':
        return new NodejsDependencyInstaller();
      case 'FastAPI':
      case 'Django':
        return new PythonDependencyInstaller();
      case 'Rust':
        return new RustDependencyInstaller();
      case 'NextJS':
      case 'React':
        return new ReactDependencyInstaller();
      case 'CMake':
        return new CMakeDependencyInstaller();
      case 'Angular':
        return new AngularDependencyInstaller();
      case 'Vue':
        return new VueDependencyInstaller();
      case 'SpringBoot':
        return new SpringBootDependencyInstaller();
      case 'Kotlin':
        return new KotlinDependencyInstaller();
      default:
        throw new Error(`Dependency installation not implemented for project type: ${projectType}`);
    }
  }
}