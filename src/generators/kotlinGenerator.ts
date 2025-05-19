import * as fs from 'fs/promises';
import * as path from 'path';

export class KotlinGenerator {
    constructor(private projectPath: string, private projectName: string) {}

    async generate() {
        try {
            // Create standardized directory structure
            const basePath = path.join(this.projectPath);
            const kotlinPackage = this.projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const packagePath = `com/example/${kotlinPackage}`;
            
            // Modern Kotlin project structure with proper separation of concerns
            const folders = [
                // Main source directories
                `src/main/kotlin/${packagePath}`,
                `src/main/kotlin/${packagePath}/api`,
                `src/main/kotlin/${packagePath}/config`,
                `src/main/kotlin/${packagePath}/domain/model`,
                `src/main/kotlin/${packagePath}/domain/repository`,
                `src/main/kotlin/${packagePath}/domain/service`,
                `src/main/kotlin/${packagePath}/infrastructure/persistence`,
                `src/main/kotlin/${packagePath}/util`,
                
                // Resource directories
                `src/main/resources`,
                `src/main/resources/config`,
                `src/main/resources/static`,
                `src/main/resources/templates`,
                
                // Test directories with matching structure
                `src/test/kotlin/${packagePath}`,
                `src/test/kotlin/${packagePath}/api`,
                `src/test/kotlin/${packagePath}/domain/service`,
                `src/test/kotlin/${packagePath}/infrastructure`,
                `src/test/resources`,
                
                // Integration tests
                `src/integrationTest/kotlin/${packagePath}`,
                `src/integrationTest/resources`,
            ];

            // Create all directories
            for (const folder of folders) {
                const fullPath = path.join(basePath, folder);
                await this.backupIfExists(fullPath);
                await fs.mkdir(fullPath, { recursive: true });
            }

            // Helper to ensure parent directories exist before writing a file
            const ensureDirForFile = async (filePath: string) => {
                const dir = path.dirname(filePath);
                await this.backupIfExists(dir);
                await fs.mkdir(dir, { recursive: true });
            };

            // Create build.gradle.kts with modern configuration
            const buildGradlePath = path.join(basePath, 'build.gradle.kts');
            await ensureDirForFile(buildGradlePath);
            await fs.writeFile(
                buildGradlePath,
                this.createBuildGradle(kotlinPackage)
            );

            // Create settings.gradle.kts
            const settingsGradlePath = path.join(basePath, 'settings.gradle.kts');
            await ensureDirForFile(settingsGradlePath);
            await fs.writeFile(
                settingsGradlePath,
                this.createSettingsGradle(kotlinPackage)
            );

            // Create ApplicationMain.kt - main application entry point
            const mainPath = path.join(basePath, `src/main/kotlin/${packagePath}/ApplicationMain.kt`);
            await ensureDirForFile(mainPath);
            await fs.writeFile(
                mainPath,
                this.createApplicationMain(kotlinPackage)
            );

            // Create example domain model
            const modelPath = path.join(basePath, `src/main/kotlin/${packagePath}/domain/model/ExampleModel.kt`);
            await ensureDirForFile(modelPath);
            await fs.writeFile(
                modelPath,
                this.createExampleModel(kotlinPackage)
            );

            // Create example service interface
            const serviceInterfacePath = path.join(basePath, `src/main/kotlin/${packagePath}/domain/service/ExampleService.kt`);
            await ensureDirForFile(serviceInterfacePath);
            await fs.writeFile(
                serviceInterfacePath,
                this.createExampleServiceInterface(kotlinPackage)
            );

            // Create example service implementation
            const serviceImplPath = path.join(basePath, `src/main/kotlin/${packagePath}/domain/service/ExampleServiceImpl.kt`);
            await ensureDirForFile(serviceImplPath);
            await fs.writeFile(
                serviceImplPath,
                this.createExampleServiceImpl(kotlinPackage)
            );

            // Create example repository interface
            const repoPath = path.join(basePath, `src/main/kotlin/${packagePath}/domain/repository/ExampleRepository.kt`);
            await ensureDirForFile(repoPath);
            await fs.writeFile(
                repoPath,
                this.createExampleRepository(kotlinPackage)
            );

            // Create example controller
            const controllerPath = path.join(basePath, `src/main/kotlin/${packagePath}/api/ExampleController.kt`);
            await ensureDirForFile(controllerPath);
            await fs.writeFile(
                controllerPath,
                this.createExampleController(kotlinPackage)
            );

            // Create example configuration class
            const configPath = path.join(basePath, `src/main/kotlin/${packagePath}/config/AppConfig.kt`);
            await ensureDirForFile(configPath);
            await fs.writeFile(
                configPath,
                this.createAppConfig(kotlinPackage)
            );

            // Create example test
            const testPath = path.join(basePath, `src/test/kotlin/${packagePath}/domain/service/ExampleServiceImplTest.kt`);
            await ensureDirForFile(testPath);
            await fs.writeFile(
                testPath,
                this.createExampleServiceTest(kotlinPackage)
            );

            // Create application.yml config
            const appConfigPath = path.join(basePath, `src/main/resources/application.yml`);
            await ensureDirForFile(appConfigPath);
            await fs.writeFile(
                appConfigPath,
                this.createApplicationYaml()
            );

            // Create README.md
            await this.createReadme(basePath, kotlinPackage);

            // Create .gitignore
            const gitignorePath = path.join(basePath, '.gitignore');
            await ensureDirForFile(gitignorePath);
            await fs.writeFile(
                gitignorePath,
                this.createGitignore()
            );

            console.log(`Kotlin project structure generated successfully at ${basePath}`);

        } catch (error) {
            throw new Error(`Failed to generate Kotlin project: ${error}`);
        }
    }

    private createBuildGradle(packageName: string): string {
        return `import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.spring") version "2.0.0"
    kotlin("plugin.jpa") version "2.0.0"
    id("org.jetbrains.kotlin.plugin.allopen") version "2.0.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.1"
    jacoco
}

group = "com.example"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories {
    mavenCentral()
}

sourceSets {
    create("integrationTest") {
        kotlin {
            compileClasspath += main.get().output + test.get().output
            runtimeClasspath += main.get().output + test.get().output
            srcDir("src/integrationTest/kotlin")
        }
        resources.srcDir("src/integrationTest/resources")
    }
}

val integrationTestImplementation: Configuration by configurations.getting {
    extendsFrom(configurations.testImplementation.get())
}

val integrationTestRuntimeOnly: Configuration by configurations.getting {
    extendsFrom(configurations.testRuntimeOnly.get())
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
    
    runtimeOnly("com.h2database:h2")
    runtimeOnly("org.springframework.boot:spring-boot-devtools")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    
    integrationTestImplementation("org.springframework.boot:spring-boot-starter-test")
    integrationTestImplementation("org.testcontainers:junit-jupiter:1.19.1")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "17"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.register<Test>("integrationTest") {
    description = "Runs integration tests."
    group = "verification"
    
    testClassesDirs = sourceSets["integrationTest"].output.classesDirs
    classpath = sourceSets["integrationTest"].runtimeClasspath
    
    useJUnitPlatform()
    
    shouldRunAfter("test")
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.jacocoTestReport {
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

application {
    mainClass.set("com.example.${packageName}.ApplicationMainKt")
}
`;
    }

    private createSettingsGradle(packageName: string): string {
        return `rootProject.name = "${packageName}"

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
`;
    }

    private createApplicationMain(packageName: string): string {
        return `package com.example.${packageName}

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ApplicationMain

fun main(args: Array<String>) {
    runApplication<ApplicationMain>(*args)
}
`;
    }

    private createExampleModel(packageName: string): string {
        return `package com.example.${packageName}.domain.model

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.LocalDateTime

@Entity
data class Example(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
`;
    }

    private createExampleServiceInterface(packageName: string): string {
        return `package com.example.${packageName}.domain.service

import com.example.${packageName}.domain.model.Example

interface ExampleService {
    fun findAll(): List<Example>
    fun findById(id: Long): Example?
    fun create(example: Example): Example
    fun update(id: Long, example: Example): Example?
    fun delete(id: Long): Boolean
}
`;
    }

    private createExampleServiceImpl(packageName: string): string {
        return `package com.example.${packageName}.domain.service

import com.example.${packageName}.domain.model.Example
import com.example.${packageName}.domain.repository.ExampleRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ExampleServiceImpl(private val repository: ExampleRepository) : ExampleService {
    
    override fun findAll(): List<Example> = repository.findAll()
    
    override fun findById(id: Long): Example? = repository.findById(id)
    
    @Transactional
    override fun create(example: Example): Example = repository.save(example)
    
    @Transactional
    override fun update(id: Long, example: Example): Example? {
        return repository.findById(id)?.let { existing ->
            val updated = example.copy(id = existing.id)
            repository.save(updated)
        }
    }
    
    @Transactional
    override fun delete(id: Long): Boolean {
        return repository.findById(id)?.let {
            repository.deleteById(id)
            true
        } ?: false
    }
}
`;
    }

    private createExampleRepository(packageName: string): string {
        return `package com.example.${packageName}.domain.repository

import com.example.${packageName}.domain.model.Example

interface ExampleRepository {
    fun findAll(): List<Example>
    fun findById(id: Long): Example?
    fun save(example: Example): Example
    fun deleteById(id: Long)
}
`;
    }

    private createExampleController(packageName: string): string {
        return `package com.example.${packageName}.api

import com.example.${packageName}.domain.model.Example
import com.example.${packageName}.domain.service.ExampleService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/examples")
class ExampleController(private val exampleService: ExampleService) {

    @GetMapping
    fun getAllExamples(): List<Example> = exampleService.findAll()

    @GetMapping("/{id}")
    fun getExampleById(@PathVariable id: Long): ResponseEntity<Example> {
        return exampleService.findById(id)?.let {
            ResponseEntity.ok(it)
        } ?: ResponseEntity.notFound().build()
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createExample(@RequestBody example: Example): Example = exampleService.create(example)

    @PutMapping("/{id}")
    fun updateExample(@PathVariable id: Long, @RequestBody example: Example): ResponseEntity<Example> {
        return exampleService.update(id, example)?.let {
            ResponseEntity.ok(it)
        } ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteExample(@PathVariable id: Long): ResponseEntity<Unit> {
        return if (exampleService.delete(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
`;
    }

    private createAppConfig(packageName: string): string {
        return `package com.example.${packageName}.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class AppConfig {

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:8080")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true)
            }
        }
    }
}
`;
    }

    private createExampleServiceTest(packageName: string): string {
        return `package com.example.${packageName}.domain.service

import com.example.${packageName}.domain.model.Example
import com.example.${packageName}.domain.repository.ExampleRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ExampleServiceImplTest {

    private lateinit var repository: ExampleRepository
    private lateinit var service: ExampleServiceImpl

    @BeforeEach
    fun setUp() {
        repository = mockk()
        service = ExampleServiceImpl(repository)
    }

    @Test
    fun shouldFindAllExamples() {
        // given
        val examples = listOf(
            Example(id = 1, name = "Test 1"),
            Example(id = 2, name = "Test 2")
        )
        every { repository.findAll() } returns examples

        // when
        val result = service.findAll()

        // then
        assertEquals(examples, result)
        verify { repository.findAll() }
    }

    @Test
    fun shouldFindExampleById() {
        // given
        val example = Example(id = 1, name = "Test")
        every { repository.findById(1) } returns example

        // when
        val result = service.findById(1)

        // then
        assertEquals(example, result)
        verify { repository.findById(1) }
    }

    @Test
    fun shouldReturnNullWhenExampleNotFound() {
        // given
        every { repository.findById(999) } returns null

        // when
        val result = service.findById(999)

        // then
        assertNull(result)
        verify { repository.findById(999) }
    }
}
`;
    }

    private createApplicationYaml(): string {
        return `spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password: password
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    root: INFO
    com.example: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

server:
  port: 8080
`;
    }

    private async createReadme(basePath: string, packageName: string) {
        const readmePath = path.join(basePath, 'README.md');
        await this.backupIfExists(readmePath);

        const content = `# ${this.projectName}

A modern Kotlin Spring Boot application with clean architecture principles.

## Project Structure

\`\`\`
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/example/${packageName}/
│   │   │       ├── ApplicationMain.kt             # Application entry point
│   │   │       ├── api/                           # REST controllers
│   │   │       │   └── ExampleController.kt
│   │   │       ├── config/                        # Application configuration
│   │   │       │   └── AppConfig.kt
│   │   │       ├── domain/                        # Core domain layer
│   │   │       │   ├── model/                     # Domain entities
│   │   │       │   │   └── Example.kt
│   │   │       │   ├── repository/                # Repository interfaces
│   │   │       │   │   └── ExampleRepository.kt
│   │   │       │   ├── service/                   # Business logic
│   │   │       │   │   ├── ExampleService.kt      # Service interface
│   │   │       │   │   └── ExampleServiceImpl.kt  # Service implementation
│   │   │       ├── infrastructure/                # External adapters
│   │   │       │   └── persistence/               # Database adapters
│   │   │       ├── util/                          # Utility classes
│   │   ├── resources/
│   │   │   ├── application.yml                    # Application configuration
│   │   │   ├── config/                            # Additional config files
│   │   │   ├── static/                            # Static resources
│   │   │   └── templates/                         # HTML templates
│   ├── test/
│   │   ├── kotlin/
│   │   │   └── com/example/${packageName}/
│   │   │       ├── domain/
│   │   │       │   └── service/
│   │   │       │       └── ExampleServiceImplTest.kt
│   │   └── resources/
│   ├── integrationTest/
│   │   ├── kotlin/
│   │   │   └── com/example/${packageName}/
│   │   └── resources/
├── build.gradle.kts                               # Build configuration
└── settings.gradle.kts                            # Gradle settings
\`\`\`

## Architecture

This project follows Clean Architecture principles with a domain-centric approach:

1. **Domain Layer**: Contains business logic, entities, and interfaces
2. **Application Layer**: Orchestrates the domain logic
3. **Infrastructure Layer**: Implements interfaces defined in the domain layer
4. **API Layer**: Handles HTTP requests and responses

## Getting Started

### Prerequisites

- JDK 17 or higher
- Gradle

### Building the Application

\`\`\`bash
./gradlew build
\`\`\`

### Running the Application

\`\`\`bash
./gradlew bootRun
\`\`\`

The application will be available at http://localhost:8080

### Running Tests

\`\`\`bash
# Unit tests
./gradlew test

# Integration tests
./gradlew integrationTest

# All tests with coverage report
./gradlew test integrationTest jacocoTestReport
\`\`\`

## Development Guidelines

- Follow the package structure for new code
- Add unit tests for all business logic
- Add integration tests for external interfaces
- Use repository interfaces for database operations
- Use service interfaces for business logic
`;
        await fs.writeFile(readmePath, content);
    }

    private createGitignore(): string {
        return `# Gradle
.gradle/
build/
gradle-app.setting
!gradle-wrapper.jar
.gradletasknamecache

# IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr
out/

# VS Code
.vscode/
.settings/
.classpath
.project
.factorypath

# Spring Boot
*.log
logs/
spring-shell.log

# OS-specific
.DS_Store
Thumbs.db

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Temporary files
*.tmp
*.swp
*~

# H2 Database
*.db
`;
    }

    private async backupIfExists(filePath: string) {
        try {
            await fs.access(filePath);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                return; // Skip backing up directories
            }
            
            const backupPath = `${filePath}.backup`;
            try {
                await fs.access(backupPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await fs.rename(filePath, `${filePath}.backup-${timestamp}`);
            } catch {
                await fs.rename(filePath, backupPath);
            }
        } catch {
            // File doesn't exist, no need to backup
        }
    }
}