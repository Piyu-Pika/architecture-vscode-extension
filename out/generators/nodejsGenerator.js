"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodejsGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class NodejsGenerator {
    constructor(config) {
        this.projectPath = config.projectPath;
        this.projectName = config.projectName;
        this.framework = config.nodeFramework || 'Express';
    }
    async generate() {
        // Create the base directory structure (common for all frameworks)
        await this.createBaseDirectories();
        // Create framework-specific structure
        switch (this.framework) {
            case 'Express':
                await this.generateExpressStructure();
                break;
            case 'NestJS':
                await this.generateNestJSStructure();
                break;
            case 'Fastify':
                await this.generateFastifyStructure();
                break;
            case 'Koa':
                await this.generateKoaStructure();
                break;
            case 'Hapi':
                await this.generateHapiStructure();
                break;
            default:
                await this.generateExpressStructure(); // Default to Express if framework is not specified
        }
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `node_modules/\n.env\nlogs/\ncoverage/\n.DS_Store\n.idea/\n.vscode/\ndist/\nbuild/\n`);
    }
    async createBaseDirectories() {
        // Base folders common to all frameworks
        const baseFolders = [
            'src',
            'config',
            'tests/unit',
            'tests/integration',
            'scripts',
            'logs'
        ];
        for (const folder of baseFolders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
    }
    async generateExpressStructure() {
        const folders = [
            'src/api/controllers',
            'src/api/middlewares',
            'src/api/routes',
            'src/api/services',
            'src/api/validators',
            'src/api/models',
            'src/config',
            'src/db/models',
            'src/db/migrations',
            'src/db/seeders',
            'src/utils',
            'src/helpers',
            'public/assets/images',
            'public/assets/css',
            'public/assets/js',
            'views'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: '1.0.0',
            description: 'An Express.js application',
            main: 'src/index.js',
            scripts: {
                start: 'node src/index.js',
                dev: 'nodemon src/index.js',
                test: 'jest',
                lint: 'eslint src/',
                'lint:fix': 'eslint src/ --fix'
            },
            dependencies: {
                express: '^4.18.2',
                'express-validator': '^7.0.1',
                'body-parser': '^1.20.2',
                cors: '^2.8.5',
                helmet: '^7.0.0',
                morgan: '^1.10.0',
                dotenv: '^16.3.1',
                winston: '^3.10.0'
            },
            devDependencies: {
                eslint: '^8.47.0',
                jest: '^29.6.2',
                nodemon: '^3.0.1',
                supertest: '^6.3.3'
            }
        }, null, 2));
        // Create basic index.js
        const indexPath = path.join(this.projectPath, 'src/index.js');
        await this.backupIfExists(indexPath);
        await fs.writeFile(indexPath, `const express = require('express');\nconst helmet = require('helmet');\nconst cors = require('cors');\nconst bodyParser = require('body-parser');\nconst morgan = require('morgan');\nconst dotenv = require('dotenv');\n\n// Load environment variables\ndotenv.config();\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n// Middleware\napp.use(helmet());\napp.use(cors());\napp.use(bodyParser.json());\napp.use(bodyParser.urlencoded({ extended: true }));\napp.use(morgan('dev'));\n\napp.get('/', (req, res) => {\n    res.send('Welcome to ${this.projectName} - Express.js API');\n});\n\n// Start server\napp.listen(PORT, () => {\n    console.log(\`Server running on port \${PORT}\`);\n});\n`);
        // Create a sample route
        const routesPath = path.join(this.projectPath, 'src/api/routes/index.js');
        await this.backupIfExists(routesPath);
        await fs.writeFile(routesPath, `const express = require('express');\nconst router = express.Router();\n\nrouter.get('/status', (req, res) => {\n    res.json({ status: 'ok' });\n});\n\nmodule.exports = router;\n`);
    }
    async generateNestJSStructure() {
        const folders = [
            'src/modules/users',
            'src/modules/auth',
            'src/common/decorators',
            'src/common/filters',
            'src/common/guards',
            'src/common/interceptors',
            'src/common/middleware',
            'src/common/pipes',
            'src/common/dto',
            'src/config',
            'src/interfaces'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: '1.0.0',
            description: 'A NestJS application',
            scripts: {
                build: 'nest build',
                start: 'nest start',
                'start:dev': 'nest start --watch',
                'start:debug': 'nest start --debug --watch',
                'start:prod': 'node dist/main',
                test: 'jest',
                'test:watch': 'jest --watch',
                'test:cov': 'jest --coverage'
            },
            dependencies: {
                '@nestjs/common': '^10.0.0',
                '@nestjs/core': '^10.0.0',
                '@nestjs/platform-express': '^10.0.0',
                '@nestjs/config': '^3.0.0',
                'reflect-metadata': '^0.1.13',
                'rxjs': '^7.8.1',
                'class-validator': '^0.14.0',
                'class-transformer': '^0.5.1'
            },
            devDependencies: {
                '@nestjs/cli': '^10.0.0',
                '@nestjs/testing': '^10.0.0',
                '@types/express': '^4.17.17',
                '@types/node': '^20.3.1',
                '@types/jest': '^29.5.2',
                'typescript': '^5.1.3',
                'ts-node': '^10.9.1',
                'ts-jest': '^29.1.0',
                'jest': '^29.5.0'
            }
        }, null, 2));
        // Create tsconfig.json
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(tsconfigPath, JSON.stringify({
            "compilerOptions": {
                "module": "commonjs",
                "declaration": true,
                "removeComments": true,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "allowSyntheticDefaultImports": true,
                "target": "ES2021",
                "sourceMap": true,
                "outDir": "./dist",
                "baseUrl": "./",
                "incremental": true,
                "skipLibCheck": true,
                "strictNullChecks": false,
                "noImplicitAny": false,
                "strictBindCallApply": false,
                "forceConsistentCasingInFileNames": false,
                "noFallthroughCasesInSwitch": false
            }
        }, null, 2));
        // Create a basic main.ts file
        const mainPath = path.join(this.projectPath, 'src/main.ts');
        await this.backupIfExists(mainPath);
        await fs.writeFile(mainPath, `import { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module';\nimport { ValidationPipe } from '@nestjs/common';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  app.useGlobalPipes(new ValidationPipe());\n  await app.listen(3000);\n  console.log(\`Application is running on: \${await app.getUrl()}\`);\n}\nbootstrap();\n`);
        // Create a basic app.module.ts
        const appModulePath = path.join(this.projectPath, 'src/app.module.ts');
        await this.backupIfExists(appModulePath);
        await fs.writeFile(appModulePath, `import { Module } from '@nestjs/common';\nimport { ConfigModule } from '@nestjs/config';\n\n@Module({\n  imports: [\n    ConfigModule.forRoot({\n      isGlobal: true,\n    }),\n  ],\n  controllers: [],\n  providers: [],\n})\nexport class AppModule {}\n`);
    }
    async generateFastifyStructure() {
        const folders = [
            'src/routes',
            'src/plugins',
            'src/services',
            'src/hooks',
            'src/config',
            'src/schemas',
            'src/utils'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: '1.0.0',
            description: 'A Fastify application',
            main: 'src/app.js',
            scripts: {
                start: 'node src/app.js',
                dev: 'nodemon src/app.js',
                test: 'tap tests/**/*.test.js',
                lint: 'standard | snazzy'
            },
            dependencies: {
                fastify: '^4.21.0',
                'fastify-plugin': '^4.5.1',
                'fastify-cors': '^6.0.3',
                '@fastify/helmet': '^11.0.0',
                '@fastify/env': '^4.2.0',
                '@fastify/sensible': '^5.2.0',
                dotenv: '^16.3.1',
                pino: '^8.15.0',
                'pino-pretty': '^10.2.0'
            },
            devDependencies: {
                nodemon: '^3.0.1',
                standard: '^17.1.0',
                snazzy: '^9.0.0',
                tap: '^16.3.8'
            }
        }, null, 2));
        // Create app.js file
        const appPath = path.join(this.projectPath, 'src/app.js');
        await this.backupIfExists(appPath);
        await fs.writeFile(appPath, `'use strict';\n\nconst path = require('path');\nconst AutoLoad = require('@fastify/autoload');\nconst fastify = require('fastify')({ logger: { prettyPrint: true } });\n\nfastify.register(require('@fastify/helmet'));\nfastify.register(require('@fastify/cors'));\n\n// Auto-load plugins\nfastify.register(AutoLoad, {\n  dir: path.join(__dirname, 'plugins'),\n  options: { }\n});\n\n// Auto-load routes\nfastify.register(AutoLoad, {\n  dir: path.join(__dirname, 'routes'),\n  options: { }\n});\n\n// Main route\nfastify.get('/', async (request, reply) => {\n  return { message: 'Welcome to ${this.projectName} - Fastify API' };\n});\n\n// Run the server\nconst start = async () => {\n  try {\n    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });\n  } catch (err) {\n    fastify.log.error(err);\n    process.exit(1);\n  }\n};\n\nstart();\n`);
        // Create a sample route
        const routePath = path.join(this.projectPath, 'src/routes/status.js');
        await this.backupIfExists(routePath);
        await fs.writeFile(routePath, `'use strict';\n\nmodule.exports = async function (fastify, opts) {\n  fastify.get('/status', async function (request, reply) {\n    return { status: 'ok' };\n  });\n};\n`);
    }
    async generateKoaStructure() {
        const folders = [
            'src/controllers',
            'src/middlewares',
            'src/routes',
            'src/services',
            'src/models',
            'src/config',
            'src/utils'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: '1.0.0',
            description: 'A Koa application',
            main: 'src/app.js',
            scripts: {
                start: 'node src/app.js',
                dev: 'nodemon src/app.js',
                test: 'jest',
                lint: 'eslint src/'
            },
            dependencies: {
                koa: '^2.14.2',
                'koa-router': '^12.0.0',
                'koa-bodyparser': '^4.4.1',
                'koa-helmet': '^7.0.2',
                'koa-logger': '^3.2.1',
                'koa-cors': '^0.0.16',
                dotenv: '^16.3.1'
            },
            devDependencies: {
                eslint: '^8.47.0',
                jest: '^29.6.2',
                nodemon: '^3.0.1',
                supertest: '^6.3.3'
            }
        }, null, 2));
        // Create app.js file
        const appPath = path.join(this.projectPath, 'src/app.js');
        await this.backupIfExists(appPath);
        await fs.writeFile(appPath, `const Koa = require('koa');\nconst Router = require('koa-router');\nconst bodyParser = require('koa-bodyparser');\nconst helmet = require('koa-helmet');\nconst logger = require('koa-logger');\nconst cors = require('koa-cors');\nconst dotenv = require('dotenv');\n\n// Load environment variables\ndotenv.config();\n\nconst app = new Koa();\nconst router = new Router();\nconst PORT = process.env.PORT || 3000;\n\n// Middleware\napp.use(helmet());\napp.use(cors());\napp.use(bodyParser());\napp.use(logger());\n\n// Routes\nrouter.get('/', ctx => {\n  ctx.body = { message: 'Welcome to ${this.projectName} - Koa API' };\n});\n\nrouter.get('/status', ctx => {\n  ctx.body = { status: 'ok' };\n});\n\n// Register routes\napp.use(router.routes());\napp.use(router.allowedMethods());\n\n// Start server\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});\n\nmodule.exports = app; // for testing\n`);
    }
    async generateHapiStructure() {
        const folders = [
            'src/handlers',
            'src/routes',
            'src/plugins',
            'src/services',
            'src/models',
            'src/config',
            'src/utils'
        ];
        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }
        // Create package.json
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(packageJsonPath, JSON.stringify({
            name: this.projectName,
            version: '1.0.0',
            description: 'A Hapi application',
            main: 'src/server.js',
            scripts: {
                start: 'node src/server.js',
                dev: 'nodemon src/server.js',
                test: 'lab -vcL tests',
                lint: 'eslint src/'
            },
            dependencies: {
                '@hapi/hapi': '^21.3.2',
                '@hapi/boom': '^10.0.1',
                '@hapi/inert': '^7.1.0',
                '@hapi/vision': '^7.0.1',
                '@hapi/joi': '^17.1.1',
                'hapi-pino': '^12.1.0',
                dotenv: '^16.3.1'
            },
            devDependencies: {
                '@hapi/lab': '^25.1.3',
                '@hapi/code': '^9.0.3',
                eslint: '^8.47.0',
                nodemon: '^3.0.1'
            }
        }, null, 2));
        // Create server.js file
        const serverPath = path.join(this.projectPath, 'src/server.js');
        await this.backupIfExists(serverPath);
        await fs.writeFile(serverPath, `'use strict';\n\nconst Hapi = require('@hapi/hapi');\nconst dotenv = require('dotenv');\n\n// Load environment variables\ndotenv.config();\n\nconst init = async () => {\n  const server = Hapi.server({\n    port: process.env.PORT || 3000,\n    host: '0.0.0.0',\n    routes: {\n      cors: true\n    }\n  });\n\n  // Register plugins\n  await server.register({\n    plugin: require('hapi-pino'),\n    options: {\n      prettyPrint: process.env.NODE_ENV !== 'production'\n    }\n  });\n\n  // Define routes\n  server.route({\n    method: 'GET',\n    path: '/',\n    handler: (request, h) => {\n      return { message: 'Welcome to ${this.projectName} - Hapi API' };\n    }\n  });\n\n  server.route({\n    method: 'GET',\n    path: '/status',\n    handler: (request, h) => {\n      return { status: 'ok' };\n    }\n  });\n\n  await server.start();\n  console.log('Server running on %s', server.info.uri);\n};\n\nprocess.on('unhandledRejection', (err) => {\n  console.log(err);\n  process.exit(1);\n});\n\ninit();\n`);
    }
    async createReadme() {
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);
        let content = `# ${this.projectName}\n\nA Node.js application built with ${this.framework}.\n\n`;
        // Add framework-specific information
        switch (this.framework) {
            case 'Express':
                content += `## Project Structure\n\n\`\`\`\n├── src/\n│   ├── api/\n│   │   ├── controllers/\n│   │   ├── middlewares/\n│   │   ├── models/\n│   │   ├── routes/\n│   │   ├── services/\n│   │   ├── validators/\n│   ├── config/\n│   ├── db/\n│   ├── utils/\n│   ├── helpers/\n├── public/\n├── views/\n├── tests/\n├── scripts/\n├── logs/\n\`\`\`\n`;
                break;
            case 'NestJS':
                content += `## Project Structure\n\n\`\`\`\n├── src/\n│   ├── modules/\n│   │   ├── users/\n│   │   ├── auth/\n│   ├── common/\n│   │   ├── decorators/\n│   │   ├── filters/\n│   │   ├── guards/\n│   │   ├── interceptors/\n│   │   ├── middleware/\n│   │   ├── pipes/\n│   │   ├── dto/\n│   ├── config/\n│   ├── interfaces/\n├── tests/\n├── dist/\n\`\`\`\n`;
                break;
            case 'Fastify':
                content += `## Project Structure\n\n\`\`\`\n├── src/\n│   ├── routes/\n│   ├── plugins/\n│   ├── services/\n│   ├── hooks/\n│   ├── config/\n│   ├── schemas/\n│   ├── utils/\n├── tests/\n├── logs/\n\`\`\`\n`;
                break;
            case 'Koa':
                content += `## Project Structure\n\n\`\`\`\n├── src/\n│   ├── controllers/\n│   ├── middlewares/\n│   ├── routes/\n│   ├── services/\n│   ├── models/\n│   ├── config/\n│   ├── utils/\n├── tests/\n├── logs/\n\`\`\`\n`;
                break;
            case 'Hapi':
                content += `## Project Structure\n\n\`\`\`\n├── src/\n│   ├── handlers/\n│   ├── routes/\n│   ├── plugins/\n│   ├── services/\n│   ├── models/\n│   ├── config/\n│   ├── utils/\n├── tests/\n├── logs/\n\`\`\`\n`;
                break;
        }
        content += `\n## Installation\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n`;
        // Add development instructions specific to each framework
        switch (this.framework) {
            case 'Express':
            case 'Fastify':
            case 'Koa':
            case 'Hapi':
                content += `\n## Development\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n`;
                break;
            case 'NestJS':
                content += `\n## Development\n\n\`\`\`bash\nnpm run start:dev\n\`\`\`\n`;
                break;
        }
        await fs.writeFile(readmePath, content);
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
}
exports.NodejsGenerator = NodejsGenerator;
//# sourceMappingURL=nodejsGenerator.js.map