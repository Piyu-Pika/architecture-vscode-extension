"use strict";
// Fix #1: Correct the import path in extension.ts
// Change this line:
// import { CustomStructureGenerator } from './generators/custormStructureGenerator';
// To this:
// Fix #2: Move the CustomStructureGenerator.ts file to the correct location
// Ensure it's in the 'generators' folder and named correctly as 'customStructureGenerator.ts'
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomStructureGenerator = void 0;
// Fix #3: Fix potential path issues in CustomStructureGenerator.ts
const fs = require("fs/promises");
const path = require("path");
const vscode = require("vscode");
class CustomStructureGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Ask user for custom structure input
        const inputMethod = await vscode.window.showQuickPick(['Tree Format', 'Array Format'], {
            placeHolder: 'Select input format for custom structure',
            title: 'Custom Structure Format'
        });
        if (!inputMethod) {
            return false;
        }
        // Display different placeholders based on the selected format
        const formatPlaceholder = inputMethod === 'Tree Format'
            ? `├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
├── public/
├── tests/
├── index.html
├── package.json
├── tsconfig.json`
            : `src/components,
src/hooks,
src/pages,
src/styles,
src/utils,
public/assets,
tests/components,
tests`;
        // Show warning message first
        await vscode.window.showWarningMessage('We recommend using predefined project structures for better consistency. ' +
            'Custom structures may not include necessary files for certain frameworks.', { modal: true }, 'Continue Anyway');
        // Get the custom structure from the user
        const structureInput = await vscode.window.showInputBox({
            prompt: 'Enter your custom project structure',
            placeHolder: formatPlaceholder,
            validateInput: (value) => {
                if (!value.trim()) {
                    return 'Structure cannot be empty';
                }
                return null;
            }
        });
        if (!structureInput) {
            return false;
        }
        // Parse the structure based on input method
        const folderPaths = this.parseStructureInput(structureInput, inputMethod);
        if (!folderPaths || (folderPaths.folders.length === 0 && folderPaths.files.length === 0)) {
            vscode.window.showErrorMessage('Could not parse the structure input properly.');
            return false;
        }
        // Create the directories
        try {
            // Create folder structure
            for (const folderPath of folderPaths.folders) {
                const fullPath = path.join(this.projectPath, folderPath);
                await this.createDirectoryIfNotExists(fullPath);
            }
            // Create files
            for (const filePath of folderPaths.files) {
                const fullPath = path.join(this.projectPath, filePath);
                // Ensure the parent directory exists
                const dirPath = path.dirname(fullPath);
                await this.createDirectoryIfNotExists(dirPath);
                // Create empty file if it doesn't exist
                try {
                    await fs.access(fullPath);
                }
                catch {
                    await fs.writeFile(fullPath, '');
                }
            }
            // Create README with structure
            await this.createReadme(folderPaths);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create project structure: ${error}`);
            return false;
        }
    }
    parseStructureInput(input, format) {
        const folders = [];
        const files = [];
        try {
            if (format === 'Tree Format') {
                // Handle tree format parsing
                const lines = input.split('\n').map(line => line.trim());
                for (const line of lines) {
                    // Skip empty lines
                    if (!line)
                        continue;
                    // Extract path by removing leading ├──, │  , etc.
                    const cleanedLine = line.replace(/^[├│]──\s*|^[│]\s+├──\s*|^[│]\s+└──\s*|^[│]\s+|^└──\s*/g, '').trim();
                    if (!cleanedLine)
                        continue;
                    // If the path ends with a slash, it's a directory
                    if (cleanedLine.endsWith('/')) {
                        folders.push(cleanedLine.slice(0, -1)); // Remove trailing slash
                    }
                    else {
                        files.push(cleanedLine);
                    }
                }
            }
            else {
                // Handle array format parsing
                const items = input.split(',').map(item => item.trim());
                for (const item of items) {
                    if (!item)
                        continue;
                    // Check if item has a file extension
                    const hasExtension = item.includes('.');
                    const isSpecificFile = path.basename(item).includes('.');
                    if (isSpecificFile) {
                        files.push(item);
                    }
                    else {
                        folders.push(item);
                    }
                }
            }
            return { folders, files };
        }
        catch (error) {
            console.error('Error parsing structure:', error);
            return null;
        }
    }
    async createDirectoryIfNotExists(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    async createReadme(structure) {
        const readmePath = path.join(this.projectPath, 'README.md');
        // Create a structure representation for the README
        let structureText = '```\n';
        // Add folders first
        for (const folder of structure.folders.sort()) {
            structureText += `├── ${folder}/\n`;
        }
        // Add files
        for (const file of structure.files.sort()) {
            structureText += `├── ${file}\n`;
        }
        structureText += '```';
        const content = `# ${this.projectName}

A custom project structure created with CodeArchitect.

## Project Structure

${structureText}

## Getting Started

This project was created with a custom structure. Review the structure to understand the organization of the project.
`;
        try {
            await fs.writeFile(readmePath, content);
        }
        catch (error) {
            console.error('Error creating README:', error);
        }
    }
}
exports.CustomStructureGenerator = CustomStructureGenerator;
//# sourceMappingURL=custormStructureGenerator.js.map