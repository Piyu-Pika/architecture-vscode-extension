# CodeArchitect  
*Automate your project setup with instant, framework-ready starter files for VS Code* ✨

---

## 🚀 Key Features  
[![Demo Video](https://img.youtube.com/vi/dCJMxHjxc64/0.jpg)](https://youtu.be/dCJMxHjxc64?si=swGWpwyVEti5-rwW)  
*Watch a video demo of the extension in action*

### 🛠️ Core Capabilities  
- **30+ Project Templates**:  
  ![Flutter, Go, Rust, Node.js, React](https://img.shields.io/badge/frameworks-Flutter%20%7C%20Go%20%7C%20Rust%20%7C%20Node.js%20%7C%20etc.-black?style=flat)  
  *(Expandable list of supported frameworks for each language)*  
  - **Flutter**: Clean Architecture/MVVM, state management (BLoC/Riverpod/GetX/Provider)  
  - **Rust**: Actix/Axum/Warp or custom setups  
  - **Node.js**: Express/NestJS/Fastify & customization options  
  - **CMake/Kotlin**: Coming soon? Or currently supported? (Clarify based on implementation)  

- **Safeguards**:  
  ⚠️ Autobackup of existing files with `.backup` extensions (no overwrites!).  
  💾 Automatic rollbacks or cleanup tools via `Code Architect: Clean Up Backup Files`

- **User Experience**:  
  - CLI-driven wizard in VS Code  
  - Cross-platform compatibility  

---

## 🛠️ How to Use  

### 6-Step Quick Start  
1. **Open Project Root Folder**:  
   Ensure your project folder is your VS Code workspace.  

2. **Launch via Command Palette**:  
   Press `Cmd/Ctrl+Shift+P` → type `Code Architect: Generate Project Structure`.  

3. **Choose Frameworks**:  
   - **Project Type** (e.g., Flutter, Angular, Next.js, CMake, Kotlin)  
   - **Project Name**: Enter your project name.  
   - **Project-Specific Config**:  
     - *Flutter:* Org ID (e.g., `com.example`), architecture, state management  
     - *Rust:* Actix/Axum/Warp selection  
     - *Go:* Framework (e.g., Gin, Echo)  

4. **Backup Confirmed**  
   Existing files are saved to `<file_name>.backup` if conflicts occur.  

5. **Generate Structure**  
   Watch folders/files scaffold in your project!  

6. **Cleanup**  
   🗑️ Remove backups via `Code Architect: Clean Up Backup Files` from the palette.  

---

## 📦 Installation  
### Option 1: Install from Marketplace  
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/Piyu-Pika.code-architect-tool?color=blue)](https://marketplace.visualstudio.com/items?itemName=Piyu-Pika.code-architect-tool)  

### Option 2: Local Development  
```bash
# From root of this repository:
npm install && vsce package
```

---

## 📄 Licenses  
Licensed under [CC BY-NC v4.0](LICENSE.txt). .  


---
Questions? Report issues → [GitHub Repo Issues][issue-link]

[issue-link]: https://github.com/Piyu-Pika/architecture-vscode-extension/issues