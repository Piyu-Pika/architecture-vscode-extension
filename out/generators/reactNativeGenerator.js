"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeGenerator = void 0;
const fs = require("fs/promises");
const path = require("path");
class ReactNativeGenerator {
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }
    async generate() {
        // Define directory structure for React Native
        const folders = [
            'src/components/Button',
            'src/components/Modal',
            'src/layouts',
            'src/screens',
            'src/features/components/ProductList',
            'src/features/hooks',
            'src/features/services',
            'src/features/types',
            'src/users/components/UserProfile',
            'src/users/hooks',
            'src/users/services',
            'src/users/types',
            'src/hooks',
            'src/navigation',
            'src/services',
            'src/store/slices',
            'src/utils',
            'src/styles',
            'src/assets/images',
            'src/assets/icons',
            'src/types',
            '__tests__/components',
            '__tests__/hooks',
            '__tests__/utils'
        ];
        // Create directories
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
            version: "0.1.0",
            private: true,
            scripts: {
                start: "react-native start",
                ios: "react-native run-ios",
                android: "react-native run-android",
                test: "jest",
                lint: "eslint src/"
            },
            dependencies: {
                "react": "18.2.0",
                "react-native": "0.74.5",
                "@react-navigation/native": "^6.1.18",
                "@react-navigation/stack": "^6.4.1",
                "react-native-safe-area-context": "^4.11.0",
                "react-native-screens": "^3.34.0",
                "react-native-gesture-handler": "^2.18.1"
            },
            devDependencies: {
                "@babel/core": "^7.20.0",
                "@babel/preset-env": "^7.20.0",
                "@babel/preset-react": "^7.22.0",
                "@babel/preset-typescript": "^7.22.0",
                "@types/react": "^18.2.0",
                "@types/react-native": "^0.73.0",
                "@types/jest": "^29.5.12",
                "babel-jest": "^29.6.2",
                "jest": "^29.6.2",
                "typescript": "^5.5.3",
                "eslint": "^8.47.0",
                "@typescript-eslint/eslint-plugin": "^5.62.0",
                "@typescript-eslint/parser": "^5.62.0",
                "@testing-library/react-native": "^12.7.2",
                "@testing-library/jest-native": "^5.4.3"
            },
            jest: {
                preset: "react-native",
                setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"]
            }
        }, null, 2));
        // Create tsconfig.json
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        await this.backupIfExists(tsconfigPath);
        await fs.writeFile(tsconfigPath, JSON.stringify({
            compilerOptions: {
                target: "esnext",
                module: "esnext",
                lib: ["esnext", "dom"],
                allowJs: true,
                skipLibCheck: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                moduleResolution: "node",
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-native",
                baseUrl: ".",
                paths: {
                    "@/*": ["src/*"]
                }
            },
            include: ["src", "__tests__"],
            exclude: ["node_modules", "babel.config.js", "metro.config.js"]
        }, null, 2));
        // Create metro.config.js
        const metroConfigPath = path.join(this.projectPath, 'metro.config.js');
        await this.backupIfExists(metroConfigPath);
        await fs.writeFile(metroConfigPath, `const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();
`);
        // Create babel.config.js
        const babelConfigPath = path.join(this.projectPath, 'babel.config.js');
        await this.backupIfExists(babelConfigPath);
        await fs.writeFile(babelConfigPath, `module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-typescript'],
  plugins: ['react-native-reanimated/plugin'],
};
`);
        // Create App.tsx
        const appPath = path.join(this.projectPath, 'src/App.tsx');
        await this.backupIfExists(appPath);
        await fs.writeFile(appPath, `import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
`);
        // Create index.js
        const indexPath = path.join(this.projectPath, 'index.js');
        await this.backupIfExists(indexPath);
        await fs.writeFile(indexPath, `import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);
`);
        // Create Component: Button
        await fs.writeFile(path.join(this.projectPath, 'src/components/Button/Button.tsx'), `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 4,
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
});

export default Button;
`);
        await fs.writeFile(path.join(this.projectPath, 'src/components/Button/index.ts'), `export { default } from './Button';
`);
        // Create Component: Modal
        await fs.writeFile(path.join(this.projectPath, 'src/components/Modal/Modal.tsx'), `import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  return (
    <RNModal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {children}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  closeText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default Modal;
`);
        await fs.writeFile(path.join(this.projectPath, 'src/components/Modal/index.ts'), `export { default } from './Modal';
`);
        // Create Layout: MainLayout
        await fs.writeFile(path.join(this.projectPath, 'src/layouts/MainLayout.tsx'), `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Header content */}
      </View>
      <View style={styles.main}>{children}</View>
      <View style={styles.footer}>
        {/* Footer content */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: '#f8f8f8',
  },
  main: {
    flex: 1,
  },
  footer: {
    height: 60,
    backgroundColor: '#f8f8f8',
  },
});

export default MainLayout;
`);
        // Create Screen: HomeScreen
        await fs.writeFile(path.join(this.projectPath, 'src/screens/HomeScreen.tsx'), `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from '@/layouts/MainLayout';

const HomeScreen: React.FC = () => {
  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to ${this.projectName}</Text>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
`);
        // Create Screen: LoginScreen
        await fs.writeFile(path.join(this.projectPath, 'src/screens/LoginScreen.tsx'), `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoginScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
`);
        // Create Feature: ProductList
        await fs.writeFile(path.join(this.projectPath, 'src/features/components/ProductList/ProductList.tsx'), `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProductList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product List</Text>
      {/* Add product list logic */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ProductList;
`);
        await fs.writeFile(path.join(this.projectPath, 'src/features/components/ProductList/index.ts'), `export { default } from './ProductList';
`);
        // Create Feature: hooks index
        await fs.writeFile(path.join(this.projectPath, 'src/features/hooks/index.ts'), `// Export feature-specific hooks
`);
        // Create Feature: productService
        await fs.writeFile(path.join(this.projectPath, 'src/features/services/productService.ts'), `export const fetchProducts = async () => {
  // Add product fetching logic
  return [];
};
`);
        // Create Feature: product type
        await fs.writeFile(path.join(this.projectPath, 'src/features/types/product.ts'), `export interface Product {
  id: string;
  name: string;
  price: number;
}
`);
        // Create User: UserProfile
        await fs.writeFile(path.join(this.projectPath, 'src/users/components/UserProfile/UserProfile.tsx'), `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserProfile: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {/* Add user profile logic */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserProfile;
`);
        await fs.writeFile(path.join(this.projectPath, 'src/users/components/UserProfile/index.ts'), `export { default } from './UserProfile';
`);
        // Create User: hooks index
        await fs.writeFile(path.join(this.projectPath, 'src/users/hooks/index.ts'), `// Export user-specific hooks
`);
        // Create User: userService
        await fs.writeFile(path.join(this.projectPath, 'src/users/services/userService.ts'), `export const fetchUser = async (id: string) => {
  // Add user fetching logic
  return { id, name: 'John Doe' };
};
`);
        // Create User: user type
        await fs.writeFile(path.join(this.projectPath, 'src/users/types/user.ts'), `export interface User {
  id: string;
  name: string;
  email: string;
}
`);
        // Create Hooks
        await fs.writeFile(path.join(this.projectPath, 'src/hooks/useAuth.ts'), `import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return { isAuthenticated, setIsAuthenticated };
};
`);
        await fs.writeFile(path.join(this.projectPath, 'src/hooks/useDebounce.ts'), `import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
`);
        await fs.writeFile(path.join(this.projectPath, 'src/hooks/index.ts'), `export * from './useAuth';
export * from './useDebounce';
`);
        // Create Navigation
        await fs.writeFile(path.join(this.projectPath, 'src/navigation/index.tsx'), `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';

const Stack = createStackNavigator();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
`);
        // Create Services
        await fs.writeFile(path.join(this.projectPath, 'src/services/apiClient.ts'), `export const apiClient = {
  get: async (url: string) => {
    // Add API call logic
    return {};
  },
};
`);
        await fs.writeFile(path.join(this.projectPath, 'src/services/errorHandler.ts'), `export const handleError = (error: unknown) => {
  console.error(error);
  // Add error handling logic
};
`);
        // Create Store
        await fs.writeFile(path.join(this.projectPath, 'src/store/slices/authSlice.ts'), `// Add Redux Toolkit slice for auth
export const authSlice = {};
`);
        await fs.writeFile(path.join(this.projectPath, 'src/store/hooks.ts'), `// Add typed hooks for Redux store
`);
        await fs.writeFile(path.join(this.projectPath, 'src/store/store.ts'), `// Add Redux store setup
`);
        // Create Utils
        await fs.writeFile(path.join(this.projectPath, 'src/utils/constants.ts'), `export const API_BASE_URL = 'https://api.example.com';
`);
        await fs.writeFile(path.join(this.projectPath, 'src/utils/formatters.ts'), `export const formatDate = (date: Date) => date.toISOString();
`);
        await fs.writeFile(path.join(this.projectPath, 'src/utils/helpers.ts'), `export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
`);
        // Create Styles
        await fs.writeFile(path.join(this.projectPath, 'src/styles/global.ts'), `import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
`);
        await fs.writeFile(path.join(this.projectPath, 'src/styles/colors.ts'), `export const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#f8f8f8',
};
`);
        // Create Types
        await fs.writeFile(path.join(this.projectPath, 'src/types/navigation.ts'), `export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};
`);
        // Create README
        await this.createReadme();
        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(gitignorePath, `node_modules/
ios/Pods/
ios/build/
android/app/build/
android/.gradle/
.env
coverage/
.DS_Store
.idea/
.vscode/
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

A React Native project with TypeScript.

## Project Structure

\`\`\`
├── src/
│   ├── components/
│   │   ├── Button/
│   │   └── Modal/
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── screens/
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
│   ├── navigation/
│   ├── services/
│   ├── store/
│   │   ├── slices/
│   │   └── hooks.ts
│   ├── utils/
│   ├── styles/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── types/
│   ├── App.tsx
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── index.js
├── package.json
├── tsconfig.json
├── metro.config.js
├── babel.config.js
\`\`\`

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. For iOS, install Pods:
\`\`\`bash
cd ios && pod install && cd ..
\`\`\`

3. Start the Metro bundler:
\`\`\`bash
npm start
\`\`\`

4. Run the app:
\`\`\`bash
npm run ios
# or
npm run android
\`\`\`

## Prerequisites

- Node.js
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)
`;
        await fs.writeFile(readmePath, content);
    }
}
exports.ReactNativeGenerator = ReactNativeGenerator;
//# sourceMappingURL=reactNativeGenerator.js.map