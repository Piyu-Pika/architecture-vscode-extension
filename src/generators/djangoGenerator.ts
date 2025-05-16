import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectConfig } from './types';

export class DjangoGenerator {
    constructor(private projectPath: string, private projectName: string) {}

    async generate() {
        // Create directory structure
        const folders = [
            `${this.projectName}/apps/core`,
            `${this.projectName}/templates`,
            `${this.projectName}/static/css`,
            `${this.projectName}/static/js`,
            `${this.projectName}/static/images`,
            `${this.projectName}/config`,
            `${this.projectName}/utils`,
            'tests/core',
            'scripts'
        ];

        for (const folder of folders) {
            const fullPath = path.join(this.projectPath, folder);
            await this.backupIfExists(fullPath);
            await fs.mkdir(fullPath, { recursive: true });
        }

        // Create __init__.py files
        const initFiles = [
            `${this.projectName}/__init__.py`,
            `${this.projectName}/apps/__init__.py`,
            `${this.projectName}/apps/core/__init__.py`,
            `tests/__init__.py`,
            `tests/core/__init__.py`
        ];

        for (const file of initFiles) {
            const fullPath = path.join(this.projectPath, file);
            await this.backupIfExists(fullPath);
            await fs.writeFile(fullPath, '');
        }

        // Create settings.py
        const settingsPath = path.join(this.projectPath, `${this.projectName}/config/settings.py`);
        await this.backupIfExists(settingsPath);
        await fs.writeFile(
            settingsPath,
            `"""
Django settings for ${this.projectName} project.
"""
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'apps.core',
]
`
        );

        // Create urls.py
        const urlsPath = path.join(this.projectPath, `${this.projectName}/config/urls.py`);
        await this.backupIfExists(urlsPath);
        await fs.writeFile(
            urlsPath,
            `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls')),
]
`
        );

        // Create core app urls.py
        const coreUrlsPath = path.join(this.projectPath, `${this.projectName}/apps/core/urls.py`);
        await this.backupIfExists(coreUrlsPath);
        await fs.writeFile(
            coreUrlsPath,
            `from django.urls import path
from . import views

app_name = 'core'
urlpatterns = [
    path('', views.home, name='home'),
]
`
        );

        // Create core app views.py
        const viewsPath = path.join(this.projectPath, `${this.projectName}/apps/core/views.py`);
        await this.backupIfExists(viewsPath);
        await fs.writeFile(
            viewsPath,
            `from django.shortcuts import render

def home(request):
    return render(request, 'home.html', {})
`
        );

        // Create home.html template
        const homeTemplatePath = path.join(this.projectPath, `${this.projectName}/templates/home.html`);
        await this.backupIfExists(homeTemplatePath);
        await fs.writeFile(
            homeTemplatePath,
            `<!DOCTYPE html>
<html>
<head>
    <title>${this.projectName}</title>
</head>
<body>
    <h1>Welcome to ${this.projectName}</h1>
</body>
</html>
`
        );

        // Create requirements.txt
        const requirementsPath = path.join(this.projectPath, 'requirements.txt');
        await this.backupIfExists(requirementsPath);
        await fs.writeFile(
            requirementsPath,
            `django>=4.2.0\npython-dotenv>=1.0.0\npytest>=7.3.0\npytest-django>=4.5.2\n`
        );

        // Create manage.py
        const managePath = path.join(this.projectPath, 'manage.py');
        await this.backupIfExists(managePath);
        await fs.writeFile(
            managePath,
            `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${this.projectName}.config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`
        );

        // Create README
        await this.createReadme();

        // Create .gitignore
        const gitignorePath = path.join(this.projectPath, '.gitignore');
        await this.backupIfExists(gitignorePath);
        await fs.writeFile(
            gitignorePath,
            `__pycache__/\n*.pyc\n.env\n*.sqlite3\n.idea/\n.vscode/\n.DS_Store\nvenv/\n`
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

A Django project with structured layout.

## Project Structure

\`\`\`
├── ${this.projectName}/
│   ├── apps/
│   │   └── core/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   ├── templates/
│   ├── static/
│   ├── utils/
├── tests/
├── manage.py
├── requirements.txt
\`\`\`

## Getting Started

\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
\`\`\`
`;
        await fs.writeFile(readmePath, content);
    }
}