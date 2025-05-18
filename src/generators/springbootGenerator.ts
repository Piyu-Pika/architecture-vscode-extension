import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig } from './types';

export class SpringBootGenerator {
    constructor(private projectPath: string, private projectName: string) {}

    async generate() {
        // Create directory structure
        const packagePath = `com/example/${this.projectName.toLowerCase()}`;
        const folders = [
            `src/main/java/${packagePath}/controller`,
            `src/main/java/${packagePath}/service`,
            `src/main/java/${packagePath}/repository`,
            `src/main/java/${packagePath}/model`,
            `src/main/java/${packagePath}/config`,
            `src/main/resources`,
            `src/test/java/${packagePath}/controller`,
            `src/test/java/${packagePath}/service`
        ];

        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create pom.xml
        const pomPath = path.join(this.projectPath, 'pom.xml');
        await this.backupIfExists(pomPath);
        await fs.writeFile(
            pomPath,
            `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${this.projectName.toLowerCase()}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${this.projectName}</name>
    <description>A Spring Boot project</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`
        );

        // Create Application class
        const appPath = path.join(this.projectPath, `src/main/java/${packagePath}/${this.projectName}Application.java`);
        await this.backupIfExists(appPath);
        await fs.writeFile(
            appPath,
            `package com.example.${this.projectName.toLowerCase()};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${this.projectName}Application {
    public static void main(String[] args) {
        SpringApplication.run(${this.projectName}Application.class, args);
    }
}
`
        );

        // Create Model - ExampleEntity
        const modelPath = path.join(this.projectPath, `src/main/java/${packagePath}/model/ExampleEntity.java`);
        await this.backupIfExists(modelPath);
        await fs.writeFile(
            modelPath,
            `package com.example.${this.projectName.toLowerCase()}.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ExampleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
`
        );

        // Create Repository - ExampleRepository
        const repoPath = path.join(this.projectPath, `src/main/java/${packagePath}/repository/ExampleRepository.java`);
        await this.backupIfExists(repoPath);
        await fs.writeFile(
            repoPath,
            `package com.example.${this.projectName.toLowerCase()}.repository;

import com.example.${this.projectName.toLowerCase()}.model.ExampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExampleRepository extends JpaRepository<ExampleEntity, Long> {
}
`
        );

        // Create Service - ExampleService
        const servicePath = path.join(this.projectPath, `src/main/java/${packagePath}/service/ExampleService.java`);
        await this.backupIfExists(servicePath);
        await fs.writeFile(
            servicePath,
            `package com.example.${this.projectName.toLowerCase()}.service;

import com.example.${this.projectName.toLowerCase()}.model.ExampleEntity;
import com.example.${this.projectName.toLowerCase()}.repository.ExampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExampleService {
    @Autowired
    private ExampleRepository exampleRepository;

    public List<ExampleEntity> findAll() {
        return exampleRepository.findAll();
    }

    public Optional<ExampleEntity> findById(Long id) {
        return exampleRepository.findById(id);
    }

    public ExampleEntity save(ExampleEntity entity) {
        return exampleRepository.save(entity);
    }
}
`
        );

        // Create Controller - ExampleController
        const controllerPath = path.join(this.projectPath, `src/main/java/${packagePath}/controller/ExampleController.java`);
        await this.backupIfExists(controllerPath);
        await fs.writeFile(
            controllerPath,
            `package com.example.${this.projectName.toLowerCase()}.controller;

import com.example.${this.projectName.toLowerCase()}.model.ExampleEntity;
import com.example.${this.projectName.toLowerCase()}.service.ExampleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/examples")
public class ExampleController {
    @Autowired
    private ExampleService exampleService;

    @GetMapping
    public List<ExampleEntity> getAllExamples() {
        return exampleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExampleEntity> getExampleById(@PathVariable Long id) {
        Optional<ExampleEntity> example = exampleService.findById(id);
        return example.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ExampleEntity createExample(@RequestBody ExampleEntity entity) {
        return exampleService.save(entity);
    }
}
`
        );

        // Create application.properties
        const appPropsPath = path.join(this.projectPath, 'src/main/resources/application.properties');
        await this.backupIfExists(appPropsPath);
        await fs.writeFile(
            appPropsPath,
            `spring.application.name=${this.projectName.toLowerCase()}
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
server.port=8080
`
        );

        // Create Test - ExampleControllerTest
        const controllerTestPath = path.join(this.projectPath, `src/test/java/${packagePath}/controller/ExampleControllerTest.java`);
        await this.backupIfExists(controllerTestPath);
        await fs.writeFile(
            controllerTestPath,
            `package com.example.${this.projectName.toLowerCase()}.controller;

import com.example.${this.projectName.toLowerCase()}.model.ExampleEntity;
import com.example.${this.projectName.toLowerCase()}.service.ExampleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(ExampleController.class)
public class ExampleControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExampleService exampleService;

    @Test
    public void testGetAllExamples() throws Exception {
        ExampleEntity entity = new ExampleEntity();
        entity.setId(1L);
        entity.setName("Test");

        when(exampleService.findAll()).thenReturn(Arrays.asList(entity));

        mockMvc.perform(get("/api/examples"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Test"));
    }

    @Test
    public void testGetExampleById() throws Exception {
        ExampleEntity entity = new ExampleEntity();
        entity.setId(1L);
        entity.setName("Test");

        when(exampleService.findById(1L)).thenReturn(Optional.of(entity));

        mockMvc.perform(get("/api/examples/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test"));
    }
}
`
        );

        // Create README
        await this.createReadme();

        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `# Maven
target/
*.log

# IDE
.idea/
*.iml
.vscode/

# OS
.DS_Store
`
        );
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
        const readmePath = path.join(this.projectPath, 'README.md');
        await this.backupIfExists(readmePath);

        const content = `# ${this.projectName}

A Spring Boot project with Java and Maven.

## Project Structure

\`\`\`
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/${this.projectName.toLowerCase()}/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       ├── config/
│   │   │       ├── ${this.projectName}Application.java
│   │   ├── resources/
│   │   │   ├── application.properties
│   ├── test/
│   │   ├── java/
│   │   │   └── com/example/${this.projectName.toLowerCase()}/
│   │   │       ├── controller/
│   │   │       ├── service/
├── pom.xml
\`\`\`

## Getting Started

\`\`\`bash
mvn clean install
mvn spring-boot:run
\`\`\`

## Testing

\`\`\`bash
mvn test
\`\`\`

## API Endpoints

- GET /api/examples - Retrieve all examples
- GET /api/examples/{id} - Retrieve an example by ID
- POST /api/examples - Create a new example
`;
        await fs.writeFile(readmePath, content);
    }
}