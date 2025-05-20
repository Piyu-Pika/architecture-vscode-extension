import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig, RustFramework } from './types';

export class RustGenerator {
    constructor(
        private projectPath: string, 
        private projectName: string,
        private framework: RustFramework = 'None/Add later'
    ) {}

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

        // Create main.rs based on the framework
        const mainPath = path.join(this.projectPath, 'src/main.rs');
        await this.backupIfExists(mainPath);
        
        if (this.framework === 'None/Add later') {
            await fs.writeFile(
                mainPath,
                `fn main() {
    println!("Hello, ${this.projectName}!");
}
`
            );
        } else {
            await fs.writeFile(
                mainPath,
                this.getFrameworkMainCode()
            );
        }

        // Create lib.rs
        const libPath = path.join(this.projectPath, 'src/lib.rs');
        await this.backupIfExists(libPath);
        await fs.writeFile(
            libPath,
            `pub mod utils;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
`
        );

        // Create utils.rs
        const utilsPath = path.join(this.projectPath, 'src/utils.rs');
        await this.backupIfExists(utilsPath);
        await fs.writeFile(
            utilsPath,
            `pub fn example() -> &'static str {
    "Example utility"
}
`
        );

        // Create framework-specific files
        await this.createFrameworkFiles();

        // Create Cargo.toml with framework dependencies
        const cargoPath = path.join(this.projectPath, 'Cargo.toml');
        await this.backupIfExists(cargoPath);
        await fs.writeFile(
            cargoPath,
            this.getCargoToml()
        );

        // Create README
        await this.createReadme();

        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `# Rust
/target/
/Cargo.lock

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

    private async createFrameworkFiles() {
        switch (this.framework) {
            case 'Actix':
                await this.createActixFiles();
                break;
            case 'Axum':
                await this.createAxumFiles();
                break;
            case 'Warp':
                await this.createWarpFiles();
                break;
            default:
                // No additional files for basic project
                break;
        }
    }

    private async createActixFiles() {
        // Create routes directory and files
        const routesDir = path.join(this.projectPath, 'src/routes');
        await fs.mkdir(routesDir, { recursive: true });

        const routesModPath = path.join(routesDir, 'mod.rs');
        await this.backupIfExists(routesModPath);
        await fs.writeFile(
            routesModPath,
            `pub mod health;
pub mod hello;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(health::configure)
            .configure(hello::configure),
    );
}
`
        );

        const healthRoutePath = path.join(routesDir, 'health.rs');
        await this.backupIfExists(healthRoutePath);
        await fs.writeFile(
            healthRoutePath,
            `use actix_web::{web, HttpResponse, Responder};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
}

async fn health_check() -> impl Responder {
    let response = HealthResponse {
        status: "ok".to_string(),
    };
    HttpResponse::Ok().json(response)
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/health", web::get().to(health_check));
}
`
        );

        const helloRoutePath = path.join(routesDir, 'hello.rs');
        await this.backupIfExists(helloRoutePath);
        await fs.writeFile(
            helloRoutePath,
            `use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct HelloRequest {
    name: Option<String>,
}

#[derive(Serialize)]
struct HelloResponse {
    message: String,
}

async fn hello(query: web::Query<HelloRequest>) -> impl Responder {
    let name = query.name.clone().unwrap_or_else(|| "World".to_string());
    let response = HelloResponse {
        message: format!("Hello, {}!", name),
    };
    HttpResponse::Ok().json(response)
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/hello", web::get().to(hello));
}
`
        );
    }

    private async createAxumFiles() {
        // Create handlers directory and files
        const handlersDir = path.join(this.projectPath, 'src/handlers');
        await fs.mkdir(handlersDir, { recursive: true });

        const handlersModPath = path.join(handlersDir, 'mod.rs');
        await this.backupIfExists(handlersModPath);
        await fs.writeFile(
            handlersModPath,
            `pub mod health;
pub mod hello;
`
        );

        const healthHandlerPath = path.join(handlersDir, 'health.rs');
        await this.backupIfExists(healthHandlerPath);
        await fs.writeFile(
            healthHandlerPath,
            `use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct HealthResponse {
    status: String,
}

pub async fn health_check() -> Json<HealthResponse> {
    let response = HealthResponse {
        status: "ok".to_string(),
    };
    Json(response)
}
`
        );

        const helloHandlerPath = path.join(handlersDir, 'hello.rs');
        await this.backupIfExists(helloHandlerPath);
        await fs.writeFile(
            helloHandlerPath,
            `use axum::{
    extract::Query,
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct HelloParams {
    name: Option<String>,
}

#[derive(Serialize)]
pub struct HelloResponse {
    message: String,
}

pub async fn hello(Query(params): Query<HelloParams>) -> Json<HelloResponse> {
    let name = params.name.as_deref().unwrap_or("World");
    let response = HelloResponse {
        message: format!("Hello, {}!", name),
    };
    Json(response)
}
`
        );
    }

    private async createWarpFiles() {
        // Create routes directory and files
        const routesDir = path.join(this.projectPath, 'src/routes');
        await fs.mkdir(routesDir, { recursive: true });

        const routesModPath = path.join(routesDir, 'mod.rs');
        await this.backupIfExists(routesModPath);
        await fs.writeFile(
            routesModPath,
            `pub mod health;
pub mod hello;

use warp::Filter;

pub fn api_routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    health::health_route()
        .or(hello::hello_route())
}
`
        );

        const healthRoutePath = path.join(routesDir, 'health.rs');
        await this.backupIfExists(healthRoutePath);
        await fs.writeFile(
            healthRoutePath,
            `use serde::Serialize;
use warp::Filter;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
}

pub fn health_route() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    warp::path!("api" / "health")
        .and(warp::get())
        .map(|| {
            let response = HealthResponse {
                status: "ok".to_string(),
            };
            warp::reply::json(&response)
        })
}
`
        );

        const helloRoutePath = path.join(routesDir, 'hello.rs');
        await this.backupIfExists(helloRoutePath);
        await fs.writeFile(
            helloRoutePath,
            `use serde::{Deserialize, Serialize};
use warp::Filter;

#[derive(Deserialize)]
pub struct HelloParams {
    name: Option<String>,
}

#[derive(Serialize)]
struct HelloResponse {
    message: String,
}

pub fn hello_route() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    warp::path!("api" / "hello")
        .and(warp::get())
        .and(warp::query::<HelloParams>())
        .map(|params: HelloParams| {
            let name = params.name.unwrap_or_else(|| "World".to_string());
            let response = HelloResponse {
                message: format!("Hello, {}!", name),
            };
            warp::reply::json(&response)
        })
}
`
        );
    }

    private getFrameworkMainCode(): string {
        switch (this.framework) {
            case 'Actix':
                return `use actix_web::{App, HttpServer};
use ${this.projectName}::routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting ${this.projectName} server on http://127.0.0.1:8080");
    
    HttpServer::new(|| {
        App::new()
            .configure(routes::configure)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
`;
            case 'Axum':
                return `use axum::{
    routing::get,
    Router,
};
use std::net::SocketAddr;
use ${this.projectName}::handlers;

#[tokio::main]
async fn main() {
    // Build the application router
    let app = Router::new()
        .route("/api/health", get(handlers::health::health_check))
        .route("/api/hello", get(handlers::hello::hello));

    // Run the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Starting ${this.projectName} server on http://{}", addr);
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
`;
            case 'Warp':
                return `use ${this.projectName}::routes;

#[tokio::main]
async fn main() {
    let routes = routes::api_routes();

    println!("Starting ${this.projectName} server on http://127.0.0.1:8080");
    
    warp::serve(routes)
        .run(([127, 0, 0, 1], 8080))
        .await;
}
`;
            default:
                return `fn main() {
    println!("Hello, ${this.projectName}!");
}
`;
        }
    }

    private getCargoToml(): string {
        let dependencies = '';
        
        switch (this.framework) {
            case 'Actix':
                dependencies = `
[dependencies]
actix-web = "4.4"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
env_logger = "0.10"
log = "0.4"
`;
                break;
            case 'Axum':
                dependencies = `
[dependencies]
axum = "0.6"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tower = "0.4"
tower-http = { version = "0.4", features = ["trace"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
`;
                break;
            case 'Warp':
                dependencies = `
[dependencies]
warp = "0.3"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
log = "0.4"
env_logger = "0.10"
`;
                break;
            default:
                dependencies = `
[dependencies]
`;
                break;
        }

        return `[package]
name = "${this.projectName}"
version = "0.1.0"
edition = "2021"
${dependencies}`;
    }

    private async createReadme() {
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);

        let frameworkContent = '';
        
        switch (this.framework) {
            case 'Actix':
                frameworkContent = `
## Framework

This project uses Actix Web, a powerful, pragmatic, and extremely fast web framework for Rust.

### API Endpoints

- GET /api/health - Health check endpoint
- GET /api/hello?name=YourName - Hello endpoint with optional name parameter
`;
                break;
            case 'Axum':
                frameworkContent = `
## Framework

This project uses Axum, an ergonomic and modular web framework built with Tokio, Tower, and Hyper.

### API Endpoints

- GET /api/health - Health check endpoint
- GET /api/hello?name=YourName - Hello endpoint with optional name parameter
`;
                break;
            case 'Warp':
                frameworkContent = `
## Framework

This project uses Warp, a super-easy, composable, web server framework for warp speeds.

### API Endpoints

- GET /api/health - Health check endpoint
- GET /api/hello?name=YourName - Hello endpoint with optional name parameter
`;
                break;
            default:
                frameworkContent = '';
                break;
        }

        const content = `# ${this.projectName}

A Rust project with a clean structure.${frameworkContent}

## Project Structure

\`\`\`
├── src/
│   ├── bin/
│   ├── lib/
│   ├── main.rs
│   ├── utils.rs
${this.framework !== 'None/Add later' ? this.getFrameworkProjectStructure() : ''}├── tests/
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

    private getFrameworkProjectStructure(): string {
        switch (this.framework) {
            case 'Actix':
                return `│   ├── routes/
│   │   ├── mod.rs
│   │   ├── health.rs
│   │   ├── hello.rs
`;
            case 'Axum':
                return `│   ├── handlers/
│   │   ├── mod.rs
│   │   ├── health.rs
│   │   ├── hello.rs
`;
            case 'Warp':
                return `│   ├── routes/
│   │   ├── mod.rs
│   │   ├── health.rs
│   │   ├── hello.rs
`;
            default:
                return '';
        }
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
}