"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyInstallerFactory = exports.KotlinDependencyInstaller = exports.SpringBootDependencyInstaller = exports.VueDependencyInstaller = exports.AngularDependencyInstaller = exports.CMakeDependencyInstaller = exports.ReactDependencyInstaller = exports.RustDependencyInstaller = exports.GoDependencyInstaller = exports.PythonDependencyInstaller = exports.NodejsDependencyInstaller = exports.FlutterDependencyInstaller = exports.TerminalManager = void 0;
const vscode = require("vscode");
// Helper class to handle terminal operations
class TerminalManager {
    // Get or create terminal
    static getTerminal(name = 'Code Architect') {
        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal(name);
        }
        return this.terminal;
    }
    // Add this method to your existing TerminalManager class
    static async executeCommandWithOutput(command, workingDirectory) {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            const options = workingDirectory ? { cwd: workingDirectory } : {};
            exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command failed: ${error.message}`));
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }
    // Execute a command in the terminal
    static async executeCommand(command, cwd) {
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
        return new Promise((resolve) => {
            // We can't reliably detect when a command finishes in the terminal
            // So we just resolve immediately and let the terminal run in the background
            resolve();
        });
    }
    // Execute multiple commands in sequence
    static async executeCommands(commands, cwd) {
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
        return new Promise((resolve) => {
            resolve();
        });
    }
}
exports.TerminalManager = TerminalManager;
// Implementation for Flutter dependency installer
class FlutterDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'flutter pub get'
        ], `${projectPath}/${projectName}`);
    }
}
exports.FlutterDependencyInstaller = FlutterDependencyInstaller;
// Implementation for Node.js dependency installer
class NodejsDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'npm install'
        ], `${projectPath}/${projectName}`);
    }
}
exports.NodejsDependencyInstaller = NodejsDependencyInstaller;
// Implementation for Python dependency installer
class PythonDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        // Create virtual environment and install dependencies
        const commands = [
            'python -m venv venv',
            process.platform === 'win32' ? '.\\venv\\Scripts\\activate' : 'source venv/bin/activate',
            'pip install -r requirements.txt'
        ];
        await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
    }
}
exports.PythonDependencyInstaller = PythonDependencyInstaller;
// Implementation for Go dependency installer
class GoDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'go mod tidy'
        ], `${projectPath}/${projectName}`);
    }
}
exports.GoDependencyInstaller = GoDependencyInstaller;
// Implementation for Rust dependency installer
class RustDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'cargo build'
        ], `${projectPath}/${projectName}`);
    }
}
exports.RustDependencyInstaller = RustDependencyInstaller;
// Implementation for React/Next.js dependency installer
class ReactDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'npm install'
        ], `${projectPath}/${projectName}`);
    }
}
exports.ReactDependencyInstaller = ReactDependencyInstaller;
// Implementation for C++ with CMake dependency installer
class CMakeDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        const commands = [
            'mkdir -p build',
            'cd build',
            'cmake ..',
            'cmake --build .'
        ];
        await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
    }
}
exports.CMakeDependencyInstaller = CMakeDependencyInstaller;
// Implementation for Angular dependency installer
class AngularDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'npm install'
        ], `${projectPath}/${projectName}`);
    }
}
exports.AngularDependencyInstaller = AngularDependencyInstaller;
// Implementation for Vue dependency installer
class VueDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        await TerminalManager.executeCommands([
            'npm install'
        ], `${projectPath}/${projectName}`);
    }
}
exports.VueDependencyInstaller = VueDependencyInstaller;
// Implementation for Spring Boot dependency installer
class SpringBootDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        const command = process.platform === 'win32'
            ? '.\\gradlew build'
            : './gradlew build';
        await TerminalManager.executeCommands([
            command
        ], `${projectPath}/${projectName}`);
    }
}
exports.SpringBootDependencyInstaller = SpringBootDependencyInstaller;
// Implementation for Kotlin dependency installer
class KotlinDependencyInstaller {
    async installDependencies(projectPath, projectName) {
        const command = process.platform === 'win32'
            ? '.\\gradlew build'
            : './gradlew build';
        await TerminalManager.executeCommands([
            command
        ], `${projectPath}/${projectName}`);
    }
}
exports.KotlinDependencyInstaller = KotlinDependencyInstaller;
// Factory to get the appropriate dependency installer
class DependencyInstallerFactory {
    static getInstaller(projectType) {
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
            case 'ReactNative':
                return new ReactDependencyInstaller(); // Assuming React Native uses similar commands
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
exports.DependencyInstallerFactory = DependencyInstallerFactory;
//# sourceMappingURL=dependancyInstall.js.map