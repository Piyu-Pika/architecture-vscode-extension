# Architecture

A VS Code extension to generate project folder structures for various frameworks and languages, including Flutter, Go, Node.js, FastAPI, Django, Rust, React, and Next.js.

## Features

- Generate project structures for:
     - Flutter (Clean Architecture or MVVM with various state management options)
     - Go
     - Node.js
     - FastAPI
     - Django
     - Rust
     - React
     - Next.js
- Interactive UI through VS Code command palette
- Customizable project name and organization identifier (for Flutter)
- Automatic backup of existing conflicting files or folders

## Usage

Follow these steps to use the extension effectively:

1. **Open the Root Directory of Your Project**  
      Ensure that the root directory of your project is open in VS Code. This is where the generated project structure will be created.

2. **Run the Extension**  
      Open the Command Palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).  
      Search for and select the command `Architecture: Generate Project Structure`.

3. **Choose the Options**  
      - Select the type of project you want to generate (e.g., Flutter, Go, Node.js, FastAPI, Django, Rust, React, or Next.js).  
      - Enter the project name when prompted.  
      - For Flutter projects, you will be asked to:
           - Enter an organization identifier (e.g., `com.example`).  
           - Choose the architecture type (e.g., Clean Architecture or MVVM).  
           - Select a state management solution (e.g., BLoC, Riverpod, GetX, Provider, or None/Add later).

4. **Backup Existing Folders**  
      If any existing folders or files in the root directory conflict with the new structure, they will be automatically backed up. The backups will have the extension `.backup` appended to their names, ensuring that no data is lost.

5. **View the Generated Structure**  
      Once the process is complete, the new project structure will be created in the root directory. You can now start working on your project with the organized layout.

## Installation

1. Install from VS Code Marketplace (TBD).
2. Or, package locally:
      ```bash
      npm install
      vsce package
      ```

## License
This extension is licensed under the [MIT License](LICENSE.txt).