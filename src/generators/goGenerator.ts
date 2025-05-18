import * as fs from 'fs/promises';
import * as path from 'path';
import { GoFramework, ProjectConfig } from './types';

export class GoGenerator {
    constructor(private config: ProjectConfig) {}

    async generate() {
        const { projectPath, projectName, goFramework } = this.config;

        // Create directory structure
        const folders = [
            `cmd/${projectName}`,
            'internal/config',
            'internal/handlers',
            'internal/models',
            'internal/services',
            'pkg/utils',
            'api',
            'web',
            'configs',
            'scripts',
            'test',
            'docs'
        ];

        for (const folder of folders) {
            const fullPath = path.join(projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create main.go with framework-specific initialization
        const mainPath = path.join(projectPath, `cmd/${projectName}/main.go`);
        await this.backupIfExists(mainPath);
        const mainContent = this.generateMainContent(goFramework || 'None');
        await fs.writeFile(mainPath, mainContent);

        // Create go.mod
        await this.createGoMod();

        // Create README
        await this.createReadme();

        // Create .gitignore
        const gitignorePath = path.join(projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Coverage
*.out

# Go workspace
go.work

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
`
        );
    }

    private generateMainContent(framework: GoFramework): string {
        switch (framework) {
            case 'Gin':
                return `package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
        })
    })
    r.Run() // listen and serve on 0.0.0.0:8080
}
`;
            case 'Echo':
                return `package main

import (
    "github.com/labstack/echo/v4"
    "net/http"
)

func main() {
    e := echo.New()
    e.GET("/ping", func(c echo.Context) error {
        return c.JSON(http.StatusOK, map[string]string{
            "message": "pong",
        })
    })
    e.Logger.Fatal(e.Start(":8080"))
}
`;
            case 'Fiber':
                return `package main

import (
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()
    app.Get("/ping", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "message": "pong",
        })
    })
    app.Listen(":8080")
}
`;
            case 'Chi':
                return `package main

import (
    "github.com/go-chi/chi/v5"
    "net/http"
)

func main() {
    r := chi.NewRouter()
    r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(\`{"message":"pong"}\`))
    })
    http.ListenAndServe(":8080", r)
}
`;
            case 'None':
            default:
                return `package main\n\nfunc main() {\n    // Application entry point\n}\n`;
        }
    }

    private async createGoMod() {
        const { projectPath, projectName, goFramework, githubUsername } = this.config;
        const goModPath = path.join(projectPath, 'go.mod');
        await this.backupIfExists(goModPath);

        // Sanitize inputs for module path construction
        const sanitizedUsername = githubUsername?.trim().replace(/[^a-zA-Z0-9_-]/g, '') || '';
        const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Construct module name - ensure it's properly formatted
        const moduleName = sanitizedUsername 
            ? `github.com/${sanitizedUsername}/${sanitizedProjectName}`
            : sanitizedProjectName;

        let dependencies = '';
        switch (goFramework) {
            case 'Gin':
                dependencies = `    github.com/gin-gonic/gin v1.9.1\n`;
                break;
            case 'Echo':
                dependencies = `    github.com/labstack/echo/v4 v4.11.1\n`;
                break;
            case 'Fiber':
                dependencies = `    github.com/gofiber/fiber/v2 v2.52.0\n`;
                break;
            case 'Chi':
                dependencies = `    github.com/go-chi/chi/v5 v5.0.10\n`;
                break;
        }

        const content = `module ${moduleName}

go 1.21

require (
${dependencies})
`;
        await fs.writeFile(goModPath, content);
    }

    private async backupIfExists(filePath: string) {
        try {
            await fs.access(filePath);
            const backupPath = `${filePath}.backup`;
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(filePath, `${filePath}.backup-${timestamp}`);
            } catch {
                await fs.rename(filePath, backupPath);
            }
        } catch {
            // File/folder doesn't exist, no need to backup
        }
    }

    private async createReadme() {
        const { projectPath, projectName, goFramework, githubUsername } = this.config;
        const readmePath = path.join(projectPath, 'README.md');
        await this.backupIfExists(readmePath);

        // Sanitize inputs for module path construction
        const sanitizedUsername = githubUsername?.trim().replace(/[^a-zA-Z0-9_-]/g, '') || '';
        const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Construct module name - ensure it's properly formatted
        const moduleName = sanitizedUsername 
            ? `github.com/${sanitizedUsername}/${sanitizedProjectName}`
            : sanitizedProjectName;

        const frameworkNote = goFramework !== 'None' 
            ? `This project uses ${goFramework} as the web framework.`
            : 'No web framework is currently configured.';

        const content = `# ${projectName}

A Go project with a clean structure.

## Module
\`${moduleName}\`

## Framework
${frameworkNote}

## Project Structure

\`\`\`
├── cmd/
│   └── ${projectName}/    # Main entry point
├── configs/            # Configuration files
├── docs/               # Documentation
├── internal/           # Private code
│   ├── config/         # Configuration
│   ├── handlers/       # HTTP handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
├── pkg/                # Public code
│   └── utils/          # Utilities
├── scripts/            # Development scripts
├── test/               # Tests
├── web/                # Web assets
\`\`\`

## Getting Started

1. Install dependencies:
\`\`\`bash
go mod tidy
\`\`\`

2. Run the application:
\`\`\`bash
go run cmd/${projectName}/main.go
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}