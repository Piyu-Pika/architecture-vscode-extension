"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMakeGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class CMakeGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'src',
            `include/${this.projectName}`,
            'tests',
            'build',
            'docs'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create main.cpp
        const mainPath = path.join(this.projectPath, 'src/main.cpp');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `#include <${this.projectName}/example.h>
#include <iostream>

int main() {
    std::cout << "Hello, ${this.projectName}!\\n";
    std::cout << getExampleMessage() << "\\n";
    return 0;
}
`);
        // Create example.h
        const headerPath = path.join(this.projectPath, `include/${this.projectName}/example.h`);
        await this.backupIfExists(headerPath);
        await fs.writeFile(headerPath, `#ifndef ${this.projectName.toUpperCase()}_EXAMPLE_H
#define ${this.projectName.toUpperCase()}_EXAMPLE_H

const char* getExampleMessage();

#endif // ${this.projectName.toUpperCase()}_EXAMPLE_H
`);
        // Create example.cpp
        const sourcePath = path.join(this.projectPath, 'src/example.cpp');
        await this.backupIfExists(sourcePath);
        await fs.writeFile(sourcePath, `#include <${this.projectName}/example.h>

const char* getExampleMessage() {
    return "This is an example message from ${this.projectName}";
}
`);
        // Create test file
        const testPath = path.join(this.projectPath, 'tests/test_example.cpp');
        await this.backupIfExists(testPath);
        await fs.writeFile(testPath, `#include <${this.projectName}/example.h>
#include <cassert>

int main() {
    assert(strcmp(getExampleMessage(), "This is an example message from ${this.projectName}") == 0);
    return 0;
}
`);
        // Create CMakeLists.txt
        const cmakePath = path.join(this.projectPath, 'CMakeLists.txt');
        await this.backupIfExists(cmakePath);
        await fs.writeFile(cmakePath, `cmake_minimum_required(VERSION 3.10)
project(${this.projectName})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/main.cpp
    src/example.cpp
)

# Create the executable
add_executable(${this.projectName} \${SOURCES})

# Enable testing
enable_testing()

# Add test executable
add_executable(test_${this.projectName} tests/test_example.cpp src/example.cpp)
add_test(NAME Test${this.projectName} COMMAND test_${this.projectName})
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `# CMake
build/
CMakeFiles/
CMakeCache.txt
cmake_install.cmake
Makefile

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
`);
    }
    async backupIfExists(filePath) {
        try {
            await fs.access(filePath);
            const backupPath = `${filePath}.backup`;
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(filePath, `${filePath}.backup-${timestamp}`);
            }
            catch {
                await fs.rename(filePath, backupPath);
            }
        }
        catch {
            // File/folder doesn't exist, no need to backup
        }
    }
    async createReadme() {
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);
        const content = `# ${this.projectName}

A CMake-based C++ project with a clean structure.

## Project Structure

\`\`\`
├── src/
│   ├── main.cpp
│   ├── example.cpp
├── include/
│   └── ${this.projectName}/
│       └── example.h
├── tests/
│   └── test_example.cpp
├── build/
├── docs/
├── CMakeLists.txt
\`\`\`

## Getting Started

\`\`\`bash
mkdir build && cd build
cmake ..
make
./${this.projectName}
\`\`\`

## Running Tests

\`\`\`bash
cd build
make
ctest
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.CMakeGenerator = CMakeGenerator;
//# sourceMappingURL=cmakeGenerator.js.map