import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectType } from './generators/types';
import { TerminalManager } from './dependancyInstall';

// Interface for project runners with entry point detection
export interface ProjectRunner {
  runProject(projectPath: string, projectName: string, mode?: 'dev' | 'prod' | 'debug'): Promise<void>;
  stopProject?(projectPath: string, projectName: string): Promise<void>;
  getRunCommands(mode?: 'dev' | 'prod' | 'debug'): string[];
  findEntryPoint?(projectPath: string): Promise<string | null>;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  isEmulator: boolean;
  isConnected: boolean;
}

export interface EnhancedProjectRunner extends ProjectRunner {
  getAvailableDevices?(): Promise<DeviceInfo[]>;
  runProjectOnDevice?(projectPath: string, projectName: string, deviceId: string, mode?: 'dev' | 'prod' | 'debug'): Promise<void>;
}

// Entry point detection configuration
interface EntryPointRule {
  projectType: ProjectType;
  possiblePaths: string[]; // Ordered by priority
  primaryFile?: string; // Primary entry file name
  fallbackPaths?: string[]; // Fallback locations
}

// Entry point detection rules for different project types
const ENTRY_POINT_RULES: EntryPointRule[] = [
  {
    projectType: 'Flutter',
    possiblePaths: [
      'lib/main.dart'
    ],
    primaryFile: 'main.dart'
  },
  {
    projectType: 'Go',
    possiblePaths: [
      './cmd/{projectName}/main.go',
      './cmd/main.go',
      './main.go',
      './cmd/{projectName}/app.go',
      './cmd/app.go'
    ],
    primaryFile: 'main.go',
    fallbackPaths: ['./...', '.']
  },
  {
    projectType: 'Rust',
    possiblePaths: [
      'src/main.rs',
      'src/bin/{projectName}.rs',
      'src/bin/main.rs'
    ],
    primaryFile: 'main.rs'
  },
  {
    projectType: 'Django',
    possiblePaths: [
      'manage.py',
      '{projectName}/manage.py'
    ],
    primaryFile: 'manage.py'
  },
  {
    projectType: 'FastAPI',
    possiblePaths: [
      'main.py',
      'app/main.py',
      'src/main.py',
      '{projectName}/main.py',
      'app.py'
    ],
    primaryFile: 'main.py'
  },
  {
    projectType: 'SpringBoot',
    possiblePaths: [
      'src/main/java/{packagePath}/Application.java',
      'src/main/java/{packagePath}/{ProjectName}Application.java',
      'src/main/java/{packagePath}/Main.java',
      'src/main/java/**/Application.java',
      'src/main/java/**/*Application.java'
    ],
    primaryFile: 'Application.java'
  },
  {
    projectType: 'Node.js',
    possiblePaths: [
      'index.js',
      'app.js',
      'server.js',
      'src/index.js',
      'src/app.js',
      'src/server.js'
    ],
    primaryFile: 'index.js'
  },
  {
    projectType: 'React',
    possiblePaths: [
      'src/index.js',
      'src/index.tsx',
      'src/App.js',
      'src/App.tsx',
      'public/index.html'
    ],
    primaryFile: 'index.js'
  },
  {
    projectType: 'ReactNative',
    possiblePaths: [
      'index.js',
      'index.tsx',
      'App.js',
      'App.tsx',
      'src/index.js',
      'src/index.tsx'
    ],
    primaryFile: 'index.js'
  },
  {
    projectType: 'NextJS',
    possiblePaths: [
      'pages/index.js',
      'pages/index.tsx',
      'app/page.js',
      'app/page.tsx',
      'src/pages/index.js',
      'src/pages/index.tsx'
    ],
    primaryFile: 'index.js'
  },
  {
    projectType: 'Angular',
    possiblePaths: [
      'src/main.ts',
      'src/app/app.module.ts'
    ],
    primaryFile: 'main.ts'
  },
  {
    projectType: 'Vue',
    possiblePaths: [
      'src/main.js',
      'src/main.ts',
      'src/App.vue'
    ],
    primaryFile: 'main.js'
  },
  {
    projectType: 'CMake',
    possiblePaths: [
      'src/main.cpp',
      'src/main.c',
      'main.cpp',
      'main.c',
      'src/{projectName}.cpp'
    ],
    primaryFile: 'main.cpp'
  },
  {
    projectType: 'Kotlin',
    possiblePaths: [
      'src/main/kotlin/Main.kt',
      'src/main/kotlin/{packagePath}/Main.kt',
      'src/main/kotlin/{packagePath}/Application.kt'
    ],
    primaryFile: 'Main.kt'
  }
];

// Enhanced entry point detector
export class EntryPointDetector {
  static async findEntryPoint(projectPath: string, projectType: ProjectType, projectName?: string): Promise<string | null> {
    const rule = ENTRY_POINT_RULES.find(r => r.projectType === projectType);
    if (!rule) {
      return null;
    }

    // Try each possible path in order of priority
    for (let possiblePath of rule.possiblePaths) {
      // Replace placeholders
      possiblePath = await this.replacePlaceholders(possiblePath, projectName || '', projectPath);
      
      const fullPath = path.join(projectPath, possiblePath);
      
      // Handle wildcard patterns
      if (possiblePath.includes('*')) {
        const foundPath = await this.findWildcardPath(projectPath, possiblePath);
        if (foundPath) {
          return foundPath;
        }
      } else if (await this.fileExists(fullPath)) {
        return possiblePath;
      }
    }

    // Try fallback paths if specified
    if (rule.fallbackPaths) {
      for (const fallbackPath of rule.fallbackPaths) {
        const fullPath = path.join(projectPath, fallbackPath);
        if (await this.pathExists(fullPath)) {
          return fallbackPath;
        }
      }
    }

    return null;
  }

  private static async replacePlaceholders(pathTemplate: string, projectName: string, projectPath: string): Promise<string> {
    let result = pathTemplate;
    
    // Replace {projectName}
    result = result.replace(/{projectName}/g, projectName);
    result = result.replace(/{ProjectName}/g, this.capitalizeFirstLetter(projectName));
    
    // Replace {packagePath} for Java/Kotlin projects
    if (result.includes('{packagePath}')) {
      const packagePath = await this.detectPackagePath(projectPath, projectName);
      result = result.replace(/{packagePath}/g, packagePath);
    }
    
    return result;
  }

  private static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static async detectPackagePath(projectPath: string, projectName: string): Promise<string> {
    // Try to detect package path from common locations
    const possiblePackageFiles = [
      'src/main/java',
      'src/main/kotlin'
    ];

    for (const basePath of possiblePackageFiles) {
      const fullBasePath = path.join(projectPath, basePath);
      if (await this.pathExists(fullBasePath)) {
        const packagePath = await this.findJavaPackagePath(fullBasePath);
        if (packagePath) {
          return packagePath;
        }
      }
    }

    // Fallback to common package naming
    return `com/example/${projectName.toLowerCase()}`;
  }

  private static async findJavaPackagePath(basePath: string): Promise<string | null> {
    try {
      const items = await fs.promises.readdir(basePath, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const subPath = path.join(basePath, item.name);
          const javaFiles = await this.findJavaFiles(subPath);
          if (javaFiles.length > 0) {
            return this.extractPackageFromPath(subPath, basePath);
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }

  private static async findJavaFiles(dirPath: string): Promise<string[]> {
    try {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const javaFiles: string[] = [];
      
      for (const item of items) {
        if (item.isFile() && (item.name.endsWith('.java') || item.name.endsWith('.kt'))) {
          javaFiles.push(item.name);
        } else if (item.isDirectory()) {
          const subFiles = await this.findJavaFiles(path.join(dirPath, item.name));
          javaFiles.push(...subFiles);
        }
      }
      
      return javaFiles;
    } catch (error) {
      return [];
    }
  }

  private static extractPackageFromPath(fullPath: string, basePath: string): string {
    const relativePath = path.relative(basePath, fullPath);
    return relativePath.replace(/[\\\/]/g, '/');
  }

  private static async findWildcardPath(projectPath: string, pattern: string): Promise<string | null> {
    const parts = pattern.split('*');
    if (parts.length !== 3) return null; // Only support one ** pattern

    const beforeWildcard = parts[0];
    const afterWildcard = parts[2];
    
    const searchPath = path.join(projectPath, beforeWildcard);
    const foundPath = await this.searchRecursively(searchPath, afterWildcard);
    
    if (foundPath) {
      return path.relative(projectPath, foundPath);
    }
    
    return null;
  }

  private static async searchRecursively(basePath: string, targetPattern: string): Promise<string | null> {
    try {
      const items = await fs.promises.readdir(basePath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(basePath, item.name);
        
        if (item.isFile() && item.name.includes(targetPattern.replace('*', ''))) {
          return fullPath;
        } else if (item.isDirectory()) {
          const found = await this.searchRecursively(fullPath, targetPattern);
          if (found) return found;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return null;
  }

  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  private static async pathExists(pathToCheck: string): Promise<boolean> {
    try {
      await fs.promises.access(pathToCheck);
      return true;
    } catch {
      return false;
    }
  }
}

// Project detection configuration (same as before but with enhanced detection)
interface ProjectDetectionRule {
  projectType: ProjectType;
  priority: number;
  files: string[];
  optionalFiles?: string[];
  directories?: string[];
  packageJsonScripts?: string[];
  fileContent?: { file: string; contains: string }[];
}

// Detection rules (keeping the existing ones)
const DETECTION_RULES: ProjectDetectionRule[] = [
  {
    projectType: 'Flutter',
    priority: 10,
    files: ['pubspec.yaml'],
    directories: ['lib'],
    optionalFiles: ['android/app/build.gradle', 'ios/Runner.xcodeproj']
  },
  {
    projectType: 'NextJS',
    priority: 9,
    files: ['package.json', 'next.config.js'],
    packageJsonScripts: ['dev', 'build'],
    optionalFiles: ['pages', 'app']
  },
  {
    projectType: 'NextJS',
    priority: 8,
    files: ['package.json'],
    packageJsonScripts: ['dev', 'build'],
    fileContent: [{ file: 'package.json', contains: '"next"' }]
  },
  {
    projectType: 'React',
    priority: 7,
    files: ['package.json'],
    packageJsonScripts: ['start'],
    fileContent: [{ file: 'package.json', contains: '"react"' }],
    optionalFiles: ['src/App.js', 'src/App.tsx', 'public/index.html']
  },
  {
    projectType: 'ReactNative',
    priority: 9,
    files: ['package.json'],
    packageJsonScripts: ['start', 'android', 'ios'],
    fileContent: [{ file: 'package.json', contains: '"react-native"' }],
    optionalFiles: ['index.js', 'App.js']
  },
  {
    projectType: 'Angular',
    priority: 8,
    files: ['package.json', 'angular.json'],
    packageJsonScripts: ['ng', 'start'],
    optionalFiles: ['src/app/app.module.ts']
  },
  {
    projectType: 'Vue',
    priority: 7,
    files: ['package.json'],
    packageJsonScripts: ['serve'],
    fileContent: [{ file: 'package.json', contains: '"vue"' }]
  },
  {
    projectType: 'SpringBoot',
    priority: 9,
    files: ['build.gradle', 'src/main/java'],
    fileContent: [{ file: 'build.gradle', contains: 'spring-boot' }],
    optionalFiles: ['gradlew']
  },
  {
    projectType: 'SpringBoot',
    priority: 8,
    files: ['pom.xml', 'src/main/java'],
    fileContent: [{ file: 'pom.xml', contains: 'spring-boot' }]
  },
  {
    projectType: 'Django',
    priority: 9,
    files: ['manage.py', 'requirements.txt'],
    fileContent: [{ file: 'requirements.txt', contains: 'Django' }]
  },
  {
    projectType: 'FastAPI',
    priority: 8,
    files: ['requirements.txt'],
    fileContent: [{ file: 'requirements.txt', contains: 'fastapi' }]
  },
  {
    projectType: 'Node.js',
    priority: 5,
    files: ['package.json'],
    optionalFiles: ['server.js', 'index.js', 'app.js']
  },
  {
    projectType: 'Go',
    priority: 8,
    files: ['go.mod'],
    optionalFiles: ['main.go']
  },
  {
    projectType: 'Rust',
    priority: 8,
    files: ['Cargo.toml'],
    directories: ['src'],
    optionalFiles: ['src/main.rs']
  },
  {
    projectType: 'CMake',
    priority: 7,
    files: ['CMakeLists.txt'],
    optionalFiles: ['src', 'include']
  },
  {
    projectType: 'Kotlin',
    priority: 7,
    files: ['build.gradle.kts'],
    optionalFiles: ['src/main/kotlin']
  },
  {
    projectType: 'Kotlin',
    priority: 6,
    files: ['build.gradle'],
    fileContent: [{ file: 'build.gradle', contains: 'kotlin' }]
  }
];

// Enhanced Project detector class (keeping existing implementation)
export class ProjectDetector {
  static async detectProjectType(projectPath: string): Promise<ProjectType | null> {
    const detectionResults: { projectType: ProjectType; score: number }[] = [];

    for (const rule of DETECTION_RULES) {
      const score = await this.calculateRuleScore(projectPath, rule);
      if (score > 0) {
        detectionResults.push({ projectType: rule.projectType, score });
      }
    }

    if (detectionResults.length === 0) {
      return null;
    }

    detectionResults.sort((a, b) => b.score - a.score);
    return detectionResults[0].projectType;
  }

  private static async calculateRuleScore(projectPath: string, rule: ProjectDetectionRule): Promise<number> {
    let score = 0;

    for (const file of rule.files) {
      const filePath = path.join(projectPath, file);
      if (await this.fileExists(filePath)) {
        score += rule.priority;
      } else {
        return 0;
      }
    }

    if (rule.directories) {
      for (const dir of rule.directories) {
        const dirPath = path.join(projectPath, dir);
        if (await this.directoryExists(dirPath)) {
          score += rule.priority * 0.5;
        } else {
          return 0;
        }
      }
    }

    if (rule.optionalFiles) {
      for (const file of rule.optionalFiles) {
        const filePath = path.join(projectPath, file);
        if (await this.fileExists(filePath)) {
          score += rule.priority * 0.3;
        }
      }
    }

    if (rule.packageJsonScripts) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await this.fileExists(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
          const scripts = packageJson.scripts || {};
          
          for (const scriptName of rule.packageJsonScripts) {
            if (scripts[scriptName]) {
              score += rule.priority * 0.4;
            }
          }
        } catch (error) {
          // Ignore JSON parsing errors
        }
      }
    }

    if (rule.fileContent) {
      for (const contentRule of rule.fileContent) {
        const filePath = path.join(projectPath, contentRule.file);
        if (await this.fileExists(filePath)) {
          try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            if (content.includes(contentRule.contains)) {
              score += rule.priority * 0.6;
            }
          } catch (error) {
            // Ignore file reading errors
          }
        }
      }
    }

    return score;
  }

  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  private static async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.promises.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  static async getAllProjectInfo(projectPath: string): Promise<{
    detectedType: ProjectType | null;
    availableTypes: ProjectType[];
    confidence: string;
    entryPoint?: string | null;
  }> {
    const detectedType = await this.detectProjectType(projectPath);
    
    const availableTypes: ProjectType[] = [];
    for (const rule of DETECTION_RULES) {
      const score = await this.calculateRuleScore(projectPath, rule);
      if (score > 0 && !availableTypes.includes(rule.projectType)) {
        availableTypes.push(rule.projectType);
      }
    }

    const confidence = detectedType ? 'High' : availableTypes.length > 0 ? 'Medium' : 'Low';
    
    // Detect entry point if project type is known
    let entryPoint = null;
    if (detectedType) {
      const projectName = path.basename(projectPath);
      entryPoint = await EntryPointDetector.findEntryPoint(projectPath, detectedType, projectName);
    }

    return { detectedType, availableTypes, confidence, entryPoint };
  }
}
export class DeviceManager {
  static async getFlutterDevices(): Promise<DeviceInfo[]> {
    try {
      const result = await TerminalManager.executeCommandWithOutput('flutter devices --machine');
      const devices = JSON.parse(result);
      return devices.map((device: any) => ({
        id: device.id,
        name: device.name,
        platform: device.platform,
        isEmulator: device.emulator,
        isConnected: device.isConnected
      }));
    } catch (error) {
      console.error('Failed to get Flutter devices:', error);
      return [];
    }
  }

  static async getAndroidDevices(): Promise<DeviceInfo[]> {
    try {
      const result = await TerminalManager.executeCommandWithOutput('adb devices');
      const lines = result.split('\n').slice(1);
      const devices: DeviceInfo[] = [];
      
      for (const line of lines) {
        if (line.trim() && line.includes('\tdevice')) {
          const deviceId = line.split('\t')[0];
          devices.push({
            id: deviceId,
            name: `Android Device (${deviceId})`,
            platform: 'android',
            isEmulator: deviceId.includes('emulator'),
            isConnected: true
          });
        }
      }
      return devices;
    } catch (error) {
      console.error('Failed to get Android devices:', error);
      return [];
    }
  }

  static async getIOSDevices(): Promise<DeviceInfo[]> {
    try {
      const result = await TerminalManager.executeCommandWithOutput('xcrun simctl list devices --json');
      const data = JSON.parse(result);
      const devices: DeviceInfo[] = [];
      
      for (const runtime in data.devices) {
        if (data.devices[runtime]) {
          for (const device of data.devices[runtime]) {
            if (device.state === 'Booted' || device.state === 'Shutdown') {
              devices.push({
                id: device.udid,
                name: device.name,
                platform: 'ios',
                isEmulator: true,
                isConnected: device.state === 'Booted'
              });
            }
          }
        }
      }
      return devices;
    } catch (error) {
      console.error('Failed to get iOS devices:', error);
      return [];
    }
  }

  static async selectDevice(devices: DeviceInfo[]): Promise<DeviceInfo | undefined> {
    if (devices.length === 0) {
      vscode.window.showErrorMessage('No devices available');
      return undefined;
    }

    const deviceItems = devices.map(device => ({
      label: `${device.name} ${device.isConnected ? '🟢' : '🔴'}`,
      description: `${device.platform} • ${device.isEmulator ? 'Emulator' : 'Physical'} • ${device.id}`,
      device: device
    }));

    const selected = await vscode.window.showQuickPick(deviceItems, {
      placeHolder: 'Select a device to run on',
      title: 'Device Selection'
    });

    return selected?.device;
  }
}

// Enhanced implementations for different project runners
export class FlutterProjectRunner implements EnhancedProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Flutter');
  }

  async getAvailableDevices(): Promise<DeviceInfo[]> {
    return await DeviceManager.getFlutterDevices();
  }

  async runProjectOnDevice(projectPath: string, projectName: string, deviceId: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommandsForDevice(deviceId, mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Flutter app from: ${entryPoint} on device: ${deviceId}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    // Check if user wants to select device
    const useDeviceSelection = await vscode.window.showQuickPick(
      [
        { label: 'Auto-select device', value: false },
        { label: 'Choose specific device', value: true }
      ],
      { placeHolder: 'Device selection preference' }
    );

    if (useDeviceSelection?.value) {
      const devices = await this.getAvailableDevices();
      const selectedDevice = await DeviceManager.selectDevice(devices);
      
      if (selectedDevice) {
        await this.runProjectOnDevice(projectPath, projectName, selectedDevice.id, mode);
        return;
      }
    }

    // Default behavior - auto-select device
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Flutter app from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  private getRunCommandsForDevice(deviceId: string, mode: 'dev' | 'prod' | 'debug'): string[] {
    const baseCommand = `flutter run -d ${deviceId}`;
    
    switch (mode) {
      case 'debug':
        return [`${baseCommand} --debug`];
      case 'prod':
        return [`${baseCommand} --release`];
      case 'dev':
      default:
        return [baseCommand];
    }
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['flutter run --debug'];
      case 'prod':
        return ['flutter run --release'];
      case 'dev':
      default:
        return ['flutter run'];
    }
  }
}
// ReactProjectRunner
export class ReactProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'React');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running React project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['npm run start'];
      case 'prod':
        return ['npm run build', 'npm run start'];
      case 'dev':
      default:
        return ['npm run start'];
    }
  }
}
// NextJSProjectRunner

export class NextJSProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'NextJS');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running NextJS project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['npm run dev'];
      case 'prod':
        return ['npm run build', 'npm run start'];
      case 'dev':
      default:
        return ['npm run dev'];
    }
  }
}

export class AngularProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Angular');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Angular project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['npm run start'];
      case 'prod':
        return ['npm run build', 'npm run start'];
      case 'dev':
      default:
        return ['npm run start'];
    }
  }
}

// VueProjectRunner
export class VueProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Vue');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Vue project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['npm run serve'];
      case 'prod':
        return ['npm run build', 'npm run serve'];
      case 'dev':
      default:
        return ['npm run serve'];
    }
  }
}
// SpringBootProjectRunner
export class SpringBootProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'SpringBoot');
  }
  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running SpringBoot project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  } 
  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['./gradlew bootRun'];
      case 'prod':
        return ['./gradlew bootJar', 'java -jar build/libs/spring-boot-demo-0.0.1-SNAPSHOT.jar'];
      case 'dev':
      default:
        return ['./gradlew bootRun'];
    }
  }
}

export class NodeProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Node.js');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Node.js project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['node --inspect index.js'];
      case 'prod':
        return ['node index.js'];
      case 'dev':
      default:
        return ['npm run dev'];
    }
  }
}

//kotlinProjectRunner
export class KotlinProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Kotlin');
  }
  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Kotlin project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['./gradlew run'];
      case 'prod':
        return ['./gradlew build', './gradlew run'];
      case 'dev':
      default:
        return ['./gradlew run'];
    }
  }
}

//cmakeProjectRunner
export class CMakeProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'CMake');
  }
  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = this.getRunCommands(mode);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running CMake project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['cmake --build .'];
      case 'prod':
        return ['cmake --build . --target install'];
      case 'dev':
      default:
        return ['cmake --build .'];
    }
  }
}

export class ReactNativeProjectRunner implements EnhancedProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    const possibleEntries = ['index.js', 'index.tsx', 'App.js', 'App.tsx'];
    for (const entry of possibleEntries) {
      const fullPath = path.join(projectPath, entry);
      if (await this.fileExists(fullPath)) {
        return entry;
      }
    }
    return null;
  }

  async getAvailableDevices(): Promise<DeviceInfo[]> {
    const androidDevices = await DeviceManager.getAndroidDevices();
    const iosDevices = process.platform === 'darwin' ? await DeviceManager.getIOSDevices() : [];
    return [...androidDevices, ...iosDevices];
  }

  async runProjectOnDevice(projectPath: string, projectName: string, deviceId: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const devices = await this.getAvailableDevices();
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      vscode.window.showErrorMessage(`Device ${deviceId} not found`);
      return;
    }

    const commands = this.getRunCommandsForDevice(device.platform, deviceId, mode);
    vscode.window.showInformationMessage(`Running React Native on ${device.name}`);
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const useDeviceSelection = await vscode.window.showQuickPick(
      [
        { label: 'Run on Android', value: 'android' },
        { label: 'Run on iOS', value: 'ios' },
        { label: 'Choose specific device', value: 'select' }
      ],
      { placeHolder: 'Select platform or device' }
    );

    if (useDeviceSelection?.value === 'select') {
      const devices = await this.getAvailableDevices();
      const selectedDevice = await DeviceManager.selectDevice(devices);
      
      if (selectedDevice) {
        await this.runProjectOnDevice(projectPath, projectName, selectedDevice.id, mode);
        return;
      }
    } else if (useDeviceSelection?.value) {
      const commands = this.getRunCommands(mode, useDeviceSelection.value);
      await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
      return;
    }

    // Default to Android
    const commands = this.getRunCommands(mode, 'android');
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  private getRunCommandsForDevice(platform: string, deviceId: string, mode: 'dev' | 'prod' | 'debug'): string[] {
    if (platform === 'android') {
      return [`npx react-native run-android --deviceId=${deviceId}`];
    } else if (platform === 'ios') {
      return [`npx react-native run-ios --simulator="${deviceId}"`];
    }
    return [];
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev', platform: string = 'android'): string[] {
    const variant = mode === 'prod' ? '--variant=release' : '';
    
    if (platform === 'android') {
      return [`npx react-native run-android ${variant}`.trim()];
    } else if (platform === 'ios') {
      const configuration = mode === 'prod' ? '--configuration Release' : '';
      return [`npx react-native run-ios ${configuration}`.trim()];
    }
    
    return ['npx react-native start'];
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }
}


export class GoProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    const projectName = path.basename(projectPath);
    return await EntryPointDetector.findEntryPoint(projectPath, 'Go', projectName);
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const fullPath = `${projectPath}/${projectName}`;
    const entryPoint = await this.findEntryPoint(fullPath);
    const commands = await this.getRunCommandsWithEntryPoint(mode, entryPoint, fullPath);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Go project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, fullPath);
  }

  private async getRunCommandsWithEntryPoint(mode: 'dev' | 'prod' | 'debug', entryPoint: string | null, projectPath: string): Promise<string[]> {
    if (entryPoint && entryPoint.includes('cmd/')) {
      // If using cmd structure, run from the specific cmd directory
      const cmdDir = path.dirname(entryPoint);
      switch (mode) {
        case 'debug':
          return [`cd ${cmdDir}`, 'dlv debug .'];
        case 'prod':
          return [`cd ${cmdDir}`, 'go build main.go', './main.go'];
        case 'dev':
        default:
          return [`cd ${cmdDir}`, 'go run main.go'];
      }
    } else {
      // Standard go commands
      return this.getRunCommands(mode);
    }
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['go run main.go'];
      case 'prod':
        return ['go build -o main .', './main.go'];
      case 'dev':
      default:
        return ['go run main.go'];
    }
  }
}

export class RustProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Rust');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const entryPoint = await this.findEntryPoint(`${projectPath}/${projectName}`);
    const commands = await this.getRunCommandsWithEntryPoint(mode, entryPoint);
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Rust project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(commands, `${projectPath}/${projectName}`);
  }

  private async getRunCommandsWithEntryPoint(mode: 'dev' | 'prod' | 'debug', entryPoint: string | null): Promise<string[]> {
    if (entryPoint && entryPoint.includes('src/bin/')) {
      // If using binary target, specify it
      const binName = path.basename(entryPoint, '.rs');
      switch (mode) {
        case 'debug':
          return [`cargo run --bin ${binName}`];
        case 'prod':
          return [`cargo run --release --bin ${binName}`];
        case 'dev':
        default:
          return [`cargo run --bin ${binName}`];
      }
    } else {
      return this.getRunCommands(mode);
    }
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['cargo run'];
      case 'prod':
        return ['cargo run --release'];
      case 'dev':
      default:
        return ['cargo run'];
    }
  }
}

// Continue with other project runners (Django, FastAPI, etc.) following the same pattern...
export class DjangoProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'Django');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const fullPath = `${projectPath}/${projectName}`;
    const entryPoint = await this.findEntryPoint(fullPath);
    const commands = await this.getRunCommandsWithEntryPoint(mode, entryPoint);
    
    const activateCommand = process.platform === 'win32' 
      ? '.\\venv\\Scripts\\activate' 
      : 'source venv/bin/activate';
    
    const fullCommands = [activateCommand, ...commands];
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running Django project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(fullCommands, fullPath);
  }

  private async getRunCommandsWithEntryPoint(mode: 'dev' | 'prod' | 'debug', entryPoint: string | null): Promise<string[]> {
    const manageScript = entryPoint || 'python manage.py';
    const baseCommand = entryPoint ? `python ${entryPoint}` : 'python manage.py';
    
    switch (mode) {
      case 'debug':
        return [`${baseCommand} runserver --settings=settings.debug`];
      case 'prod':
        return [`${baseCommand} runserver 0.0.0.0:8000 --settings=settings.production`];
      case 'dev':
      default:
        return [`${baseCommand} runserver`];
    }
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['python manage.py runserver --settings=settings.debug'];
      case 'prod':
        return ['python manage.py runserver 0.0.0.0:8000 --settings=settings.production'];
      case 'dev':
      default:
        return ['python manage.py runserver'];
    }
  }
}

export class FastAPIProjectRunner implements ProjectRunner {
  async findEntryPoint(projectPath: string): Promise<string | null> {
    return await EntryPointDetector.findEntryPoint(projectPath, 'FastAPI');
  }

  async runProject(projectPath: string, projectName: string, mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const fullPath = `${projectPath}/${projectName}`;
    const entryPoint = await this.findEntryPoint(fullPath);
    const commands = await this.getRunCommandsWithEntryPoint(mode, entryPoint);
    
    const activateCommand = process.platform === 'win32' 
      ? '.\\venv\\Scripts\\activate' 
      : 'source venv/bin/activate';
    
    const fullCommands = [activateCommand, ...commands];
    
    if (entryPoint) {
      vscode.window.showInformationMessage(`Running FastAPI project from: ${entryPoint}`);
    }
    
    await TerminalManager.executeCommands(fullCommands, fullPath);
  }

  private async getRunCommandsWithEntryPoint(mode: 'dev' | 'prod' | 'debug', entryPoint: string | null): Promise<string[]> {
    const mainModule = entryPoint ? entryPoint.replace('.py', '').replace(/[\/\\]/g, '.') : 'main';
    
    switch (mode) {
      case 'debug':
        return [`uvicorn ${mainModule}:app --reload --log-level debug`];
      case 'prod':
        return [`uvicorn ${mainModule}:app --host 0.0.0.0 --port 8000`];
      case 'dev':
      default:
        return [`uvicorn ${mainModule}:app --reload`];
    }
  }

  getRunCommands(mode: 'dev' | 'prod' | 'debug' = 'dev'): string[] {
    switch (mode) {
      case 'debug':
        return ['uvicorn main:app --reload --log-level debug'];
      case 'prod':
        return ['uvicorn main:app --host 0.0.0.0 --port 8000'];
      case 'dev':
      default:
        return ['uvicorn main:app --reload'];
    }
  }
}

// Add similar implementations for other project types...
// (NodejsProjectRunner, ReactProjectRunner, NextJSProjectRunner, etc.)
// Following the same pattern with entry point detection

// Factory remains the same
export class EnhancedProjectRunnerFactory {
  static getRunner(projectType: ProjectType): EnhancedProjectRunner {
    switch (projectType) {
      case 'Flutter':
        return new FlutterProjectRunner();
      case 'Go':
        return new GoProjectRunner() as EnhancedProjectRunner;
      case 'Django':
        return new DjangoProjectRunner() as EnhancedProjectRunner;
      case 'FastAPI':
        return new FastAPIProjectRunner() as EnhancedProjectRunner;
      case 'Rust':
        return new RustProjectRunner() as EnhancedProjectRunner;
      case 'ReactNative':
        return new ReactNativeProjectRunner() as EnhancedProjectRunner;
      case 'React':
        return new ReactProjectRunner() as EnhancedProjectRunner;
      case 'NextJS':
        return new NextJSProjectRunner() as EnhancedProjectRunner;
      case 'Angular':
        return new AngularProjectRunner() as EnhancedProjectRunner;
      case 'Vue':
        return new VueProjectRunner() as EnhancedProjectRunner;
      case 'SpringBoot':
        return new SpringBootProjectRunner() as EnhancedProjectRunner;
      case 'Node.js':
        return new NodeProjectRunner() as EnhancedProjectRunner;
      case 'CMake':
        return new CMakeProjectRunner() as EnhancedProjectRunner;
      case 'Kotlin':
        return new KotlinProjectRunner() as EnhancedProjectRunner;
      
      default:
        throw new Error(`Project runner not implemented for project type: ${projectType}`);
    }
  }
}


// Enhanced Project Manager with auto-detection
export class AutoProjectManager {
  // Auto-detect and run project
  static async autoRunProject(
    projectPath: string, 
    projectName?: string,
    mode: 'dev' | 'prod' | 'debug' = 'dev'
  ): Promise<void> {
    try {
      const fullPath = projectName ? `${projectPath}/${projectName}` : projectPath;
      const detectedType = await ProjectDetector.detectProjectType(fullPath);
      
      if (!detectedType) {
        const projectInfo = await ProjectDetector.getAllProjectInfo(fullPath);
        
        if (projectInfo.availableTypes.length > 0) {
          // Show selection dialog
          const selectedType = await vscode.window.showQuickPick(
            projectInfo.availableTypes.map(type => ({ label: type, value: type })),
            { 
              placeHolder: 'Multiple project types detected. Please select one:',
              title: 'Project Type Selection'
            }
          );
          
          if (selectedType) {
            await this.runDetectedProject(selectedType.value, fullPath, mode);
            return;
          }
        }
        
        vscode.window.showErrorMessage(
          'Could not detect project type. Please ensure you are in a valid project directory.'
        );
        return;
      }

      await this.runDetectedProject(detectedType, fullPath, mode);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to auto-run project: ${error}`);
    }
  }

  // Auto-detect, install dependencies, and run project
  static async autoInstallAndRun(
    projectPath: string, 
    projectName?: string,
    mode: 'dev' | 'prod' | 'debug' = 'dev'
  ): Promise<void> {
    try {
      const fullPath = projectName ? `${projectPath}/${projectName}` : projectPath;
      const detectedType = await ProjectDetector.detectProjectType(fullPath);
      
      if (!detectedType) {
        vscode.window.showErrorMessage(
          'Could not detect project type for dependency installation.'
        );
        return;
      }

      // Install dependencies first
      const { DependencyInstallerFactory } = await import('./dependancyInstall');
      const installer = DependencyInstallerFactory.getInstaller(detectedType);
      
      vscode.window.showInformationMessage(
        `Detected ${detectedType} project. Installing dependencies...`
      );
      await installer.installDependencies(projectPath, projectName || '.');
      
      // Then run the project
      await this.runDetectedProject(detectedType, fullPath, mode);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to auto-install and run project: ${error}`);
    }
  }

  // Run project with detected type
  private static async runDetectedProject(
    projectType: ProjectType, 
    fullPath: string, 
    mode: 'dev' | 'prod' | 'debug'
  ): Promise<void> {
    const runner = EnhancedProjectRunnerFactory.getRunner(projectType);
    vscode.window.showInformationMessage(
      `Detected ${projectType} project. Starting in ${mode} mode...`
    );
    await runner.runProject(path.dirname(fullPath), path.basename(fullPath), mode);
  }

  // Show project information
  static async showProjectInfo(projectPath: string): Promise<void> {
    try {
      const projectInfo = await ProjectDetector.getAllProjectInfo(projectPath);
      
      const infoMessage = [
        `Detected Type: ${projectInfo.detectedType || 'Unknown'}`,
        `Available Types: ${projectInfo.availableTypes.join(', ') || 'None'}`,
        `Confidence: ${projectInfo.confidence}`
      ].join('\n');
      
      vscode.window.showInformationMessage(infoMessage, { modal: true });
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to analyze project: ${error}`);
    }
  }

  // Run from current workspace
  static async runFromWorkspace(mode: 'dev' | 'prod' | 'debug' = 'dev'): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder is open.');
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    await this.autoRunProject(workspacePath, undefined, mode);
  }
}

// Enhanced AutoProjectManager with device selection
export class EnhancedAutoProjectManager extends AutoProjectManager {
  // Auto-detect and run project with device selection
  static async autoRunProjectWithDeviceSelection(
    projectPath: string, 
    projectName?: string,
    mode: 'dev' | 'prod' | 'debug' = 'dev'
  ): Promise<void> {
    try {
      const fullPath = projectName ? `${projectPath}/${projectName}` : projectPath;
      const detectedType = await ProjectDetector.detectProjectType(fullPath);
      
      if (!detectedType) {
        vscode.window.showErrorMessage(
          'Could not detect project type. Please ensure you are in a valid project directory.'
        );
        return;
      }

      const runner = EnhancedProjectRunnerFactory.getRunner(detectedType);
      
      // Check if runner supports device selection
      if (runner.getAvailableDevices && runner.runProjectOnDevice) {
        const devices = await runner.getAvailableDevices();
        
        if (devices.length > 0) {
          const useDeviceSelection = await vscode.window.showQuickPick(
            [
              { label: 'Run with default settings', value: false },
              { label: 'Choose specific device', value: true }
            ],
            { placeHolder: 'Device selection preference' }
          );

          if (useDeviceSelection?.value) {
            const selectedDevice = await DeviceManager.selectDevice(devices);
            if (selectedDevice) {
              await runner.runProjectOnDevice(path.dirname(fullPath), path.basename(fullPath), selectedDevice.id, mode);
              return;
            }
          }
        }
      }

      // Fallback to regular run
      await runner.runProject(path.dirname(fullPath), path.basename(fullPath), mode);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to auto-run project: ${error}`);
    }
  }

  // Show available devices for current project
  static async showAvailableDevices(projectPath: string): Promise<void> {
    try {
      const detectedType = await ProjectDetector.detectProjectType(projectPath);
      
      if (!detectedType) {
        vscode.window.showErrorMessage('Could not detect project type.');
        return;
      }

      const runner = EnhancedProjectRunnerFactory.getRunner(detectedType);
      
      if (!runner.getAvailableDevices) {
        vscode.window.showInformationMessage(`Device selection not supported for ${detectedType} projects.`);
        return;
      }

      const devices = await runner.getAvailableDevices();
      
      if (devices.length === 0) {
        vscode.window.showInformationMessage('No devices found.');
        return;
      }

      const deviceList = devices.map(device => 
        `${device.name} (${device.platform}) - ${device.isConnected ? 'Connected' : 'Disconnected'}`
      ).join('\n');

      vscode.window.showInformationMessage(
        `Available devices for ${detectedType}:\n\n${deviceList}`,
        { modal: true }
      );
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get devices: ${error}`);
    }
  }
}