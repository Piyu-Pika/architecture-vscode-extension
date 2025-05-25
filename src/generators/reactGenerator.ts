import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig } from './types';

export class ReactGenerator {
    constructor(private projectPath: string, private projectName: string) {}

    async generate() {
        // Updated directory structure based on the image
        const folders = [
            'src/components/Button',
            'src/components/Modal',
            'src/layouts/MainLayout',
            'src/layouts/AuthLayout',
            'src/features/components/ProductList',
            'src/features/hooks',
            'src/features/services',
            'src/features/types',
            'src/users/components/UserProfile',
            'src/users/hooks',
            'src/users/services',
            'src/users/types',
            'src/hooks',
            'src/routes',
            'src/services',
            'src/store/slices',
            'src/utils',
            'src/styles',
            'src/assets/images',
            'src/assets/icons',
            'src/pages',
            'public',
            'tests/components',
            'tests/hooks',
            'tests/utils'
        ];

        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create package.json (unchanged)
        const packageJsonPath = path.join(this.projectPath, 'package.json');
        await this.backupIfExists(packageJsonPath);
        await fs.writeFile(
            packageJsonPath,
            JSON.stringify({
                name: this.projectName,
                version: "0.1.0",
                private: true,
                scripts: {
                    dev: "vite",
                    build: "tsc && vite build",
                    preview: "vite preview",
                    test: "jest",
                    lint: "eslint src/"
                },
                dependencies: {
                    react: "^18.2.0",
                    "react-dom": "^18.2.0",
                    typescript: "^5.5.3",
                    "@types/react": "^18.2.0",
                    "@types/react-dom": "^18.2.0"
                },
                devDependencies: {
                    vite: "^4.4.0",
                    "@vitejs/plugin-react": "^4.0.0",
                    jest: "^29.6.2",
                    "@testing-library/react": "^14.0.0",
                    "@testing-library/jest-dom": "^5.16.5",
                    eslint: "^8.47.0",
                    "@typescript-eslint/eslint-plugin": "^5.62.0",
                    "@typescript-eslint/parser": "^5.62.0"
                }
            }, null, 2)
        );

        // Create tsconfig.json (unchanged)
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(
            tsconfigPath,
            JSON.stringify({
                compilerOptions: {
                    target: "ESNext",
                    useDefineForClassFields: true,
                    lib: ["DOM", "DOM.Iterable", "ESNext"],
                    allowJs: false,
                    skipLibCheck: true,
                    esModuleInterop: false,
                    allowSyntheticDefaultImports: true,
                    strict: true,
                    forceConsistentCasingInFileNames: true,
                    module: "ESNext",
                    moduleResolution: "Node",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: "react-jsx"
                },
                include: ["src"],
                references: [{ path: "./tsconfig.node.json" }]
            }, null, 2)
        );

        // Create tsconfig.node.json (unchanged)
        const tsconfigNodePath = path.join(this.projectPath, 'tsconfig.node.json');
        await this.backupIfExists(tsconfigNodePath);
        await fs.writeFile(
            tsconfigNodePath,
            JSON.stringify({
                compilerOptions: {
                    composite: true,
                    module: "ESNext",
                    moduleResolution: "Node",
                    allowSyntheticDefaultImports: true
                },
                include: ["vite.config.ts"]
            }, null, 2)
        );

        // Create vite.config.ts (unchanged)
        const viteConfigPath = path.join(this.projectPath, 'vite.config.ts');
        await this.backupIfExists(viteConfigPath);
        await fs.writeFile(
            viteConfigPath,
            `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`
        );

        // Create src/main.tsx (unchanged)
        const mainPath = path.join(this.projectPath, 'src/main.tsx');
        await this.backupIfExists(mainPath);
        await fs.writeFile(
            mainPath,
            `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
        );

        // Create src/App.tsx (unchanged)
        const appPath = path.join(this.projectPath, 'src/App.tsx');
        await this.backupIfExists(appPath);
        await fs.writeFile(
            appPath,
            `function App() {
  return (
    <div>
      <h1>Welcome to ${this.projectName}</h1>
    </div>
  );
}

export default App;
`
        );

        // Create Component: Button
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Button/Button.tsx'),
            `import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Button/Button.module.scss'),
            `.button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Button/index.ts'),
            `export { default } from './Button';
`
        );

        // Create Component: Modal
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Modal/Modal.tsx'),
            `import React from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Modal/Modal.module.scss'),
            `.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/components/Modal/index.ts'),
            `export { default } from './Modal';
`
        );

        // Create Layout: MainLayout
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/MainLayout/MainLayout.tsx'),
            `import React from 'react';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.mainLayout}>
      <header>Main Header</header>
      <main>{children}</main>
      <footer>Main Footer</footer>
    </div>
  );
};

export default MainLayout;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/MainLayout/MainLayout.module.scss'),
            `.mainLayout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/MainLayout/index.ts'),
            `export { default } from './MainLayout';
`
        );

        // Create Layout: AuthLayout
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/AuthLayout/AuthLayout.tsx'),
            `import React from 'react';
import styles from './AuthLayout.module.scss';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.authLayout}>
      <main>{children}</main>
    </div>
  );
};

export default AuthLayout;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/AuthLayout/AuthLayout.module.scss'),
            `.authLayout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/layouts/AuthLayout/index.ts'),
            `export { default } from './AuthLayout';
`
        );

        // Create Feature: ProductList
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/components/ProductList/ProductList.tsx'),
            `import React from 'react';
import styles from './ProductList.module.scss';

const ProductList: React.FC = () => {
  return (
    <div className={styles.productList}>
      <h2>Product List</h2>
      {/* Add product list logic */}
    </div>
  );
};

export default ProductList;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/components/ProductList/ProductList.module.scss'),
            `.productList {
  padding: 20px;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/components/ProductList/index.ts'),
            `export { default } from './ProductList';
`
        );

        // Create Feature: hooks index
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/hooks/index.ts'),
            `// Export feature-specific hooks here
`
        );

        // Create Feature: productService
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/services/productService.ts'),
            `export const fetchProducts = async () => {
  // Add product fetching logic
  return [];
};
`
        );

        // Create Feature: product type
        await fs.writeFile(
            path.join(this.projectPath, 'src/features/types/product.ts'),
            `export interface Product {
  id: string;
  name: string;
  price: number;
}
`
        );

        // Create User: UserProfile
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/components/UserProfile/UserProfile.tsx'),
            `import React from 'react';
import styles from './UserProfile.module.scss';

const UserProfile: React.FC = () => {
  return (
    <div className={styles.userProfile}>
      <h2>User Profile</h2>
      {/* Add user profile logic */}
    </div>
  );
};

export default UserProfile;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/components/UserProfile/UserProfile.module.scss'),
            `.userProfile {
  padding: 20px;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/components/UserProfile/index.ts'),
            `export { default } from './UserProfile';
`
        );

        // Create User: hooks index
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/hooks/index.ts'),
            `// Export user-specific hooks here
`
        );

        // Create User: userService
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/services/userService.ts'),
            `export const fetchUser = async (id: string) => {
  // Add user fetching logic
  return { id, name: 'John Doe' };
};
`
        );

        // Create User: user type
        await fs.writeFile(
            path.join(this.projectPath, 'src/users/types/user.ts'),
            `export interface User {
  id: string;
  name: string;
  email: string;
}
`
        );

        // Create Hooks
        await fs.writeFile(
            path.join(this.projectPath, 'src/hooks/useAuth.ts'),
            `import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return { isAuthenticated, setIsAuthenticated };
};
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/hooks/useDebounce.ts'),
            `import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/hooks/index.ts'),
            `export * from './useAuth';
export * from './useDebounce';
`
        );

        // Create Routes
        await fs.writeFile(
            path.join(this.projectPath, 'src/routes/AppRoutes.tsx'),
            `import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Define routes here */}
    </Routes>
  );
};

export default AppRoutes;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/routes/ProtectedRoute.tsx'),
            `import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = false; // Replace with actual auth logic
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/routes/index.ts'),
            `export { default as AppRoutes } from './AppRoutes';
export { default as ProtectedRoute } from './ProtectedRoute';
`
        );

        // Create Services
        await fs.writeFile(
            path.join(this.projectPath, 'src/services/apiClient.ts'),
            `export const apiClient = {
  get: async (url: string) => {
    // Add API call logic
    return {};
  },
};
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/services/errorHandler.ts'),
            `export const handleError = (error: unknown) => {
  console.error(error);
  // Add error handling logic
};
`
        );

        // Create Store
        await fs.writeFile(
            path.join(this.projectPath, 'src/store/slices/authSlice.ts'),
            `// Add Redux Toolkit slice for auth
export const authSlice = {};
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/store/hooks.ts'),
            `// Add typed hooks for Redux store
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/store/store.ts'),
            `// Add Redux store setup
`
        );

        // Create Utils
        await fs.writeFile(
            path.join(this.projectPath, 'src/utils/constants.ts'),
            `export const API_BASE_URL = 'https://api.example.com';
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/utils/formatters.ts'),
            `export const formatDate = (date: Date) => date.toISOString();
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/utils/helpers.ts'),
            `export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
`
        );

        // Create Styles
        await fs.writeFile(
            path.join(this.projectPath, 'src/styles/variables.scss'),
            `$primary-color: #007bff;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/styles/global.scss'),
            `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/styles/mixins.scss'),
            `@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
`
        );

        // Create Pages
        await fs.writeFile(
            path.join(this.projectPath, 'src/pages/HomePage.tsx'),
            `import React from 'react';

const HomePage: React.FC = () => {
  return <div>Home Page</div>;
};

export default HomePage;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/pages/LoginPage.tsx'),
            `import React from 'react';

const LoginPage: React.FC = () => {
  return <div>Login Page</div>;
};

export default LoginPage;
`
        );
        await fs.writeFile(
            path.join(this.projectPath, 'src/pages/ProductPage.tsx'),
            `import React from 'react';

const ProductPage: React.FC = () => {
  return <div>Product Page</div>;
};

export default ProductPage;
`
        );

        // Create index.html (unchanged)
        const indexPath = path.join(this.projectPath, 'index.html');
        await this.backupIfExists(indexPath);
        await fs.writeFile(
            indexPath,
            `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
        );

        // Create README (updated to reflect new structure)
        await this.createReadme();

        // Create .gitignore (unchanged)
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `node_modules/\ndist/\n.env\ncoverage/\n.DS_Store\n.idea/\n.vscode/\n`
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

A React project with TypeScript and Vite.

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   │   ├── Button/
│   │   └── Modal/
│   ├── layouts/
│   │   ├── MainLayout/
│   │   └── AuthLayout/
│   ├── features/
│   │   ├── components/
│   │   │   └── ProductList/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── users/
│   │   ├── components/
│   │   │   └── UserProfile/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── hooks/
│   ├── routes/
│   ├── services/
│   ├── store/
│   │   ├── slices/
│   │   └── hooks.ts
│   ├── utils/
│   ├── styles/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
├── public/
├── tests/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
\`\`\`

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}