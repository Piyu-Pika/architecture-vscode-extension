"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class RustGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Create directory structure
        const folders = [
            'src/bin',
            'src/lib',
            'tests',
            'benches',
            'examples',
            'docs'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create main.rs
        const mainPath = path.join(this.projectPath, 'src/main.rs');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `fn main() {
    println!("Hello, ${this.projectName}!");
}
`);
        // Create lib.rs
        const libPath = path.join(this.projectPath, 'src/lib.rs');
        await this.backupIfExists(libPath);
        await fs.writeFile(libPath, `pub mod utils;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
`);
        // Create utils.rs
        const utilsPath = path.join(this.projectPath, 'src/utils.rs');
        await this.backupIfExists(utilsPath);
        await fs.writeFile(utilsPath, `pub fn example() -> &'static str {
    "Example utility"
}
`);
        // Create Cargo.toml
        const cargoPath = path.join(this.projectPath, 'Cargo.toml');
        await this.backupIfExists(cargoPath);
        await fs.writeFile(cargoPath, `[package]
name = "${this.projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `# Rust
/target/
/Cargo.lock

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

A Rust project with a clean structure.

## Project Structure

\`\`\`
├── src/
│   ├── bin/
│   ├── lib/
│   ├── main.rs
│   ├── utils.rs
├── tests/
├── benches/
├── examples/
├── docs/
├── Cargo.toml
\`\`\`

## Getting Started

\`\`\`bash
cargo build
cargo run
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.RustGenerator = RustGenerator;
//# sourceMappingURL=rustGenerator.js.map