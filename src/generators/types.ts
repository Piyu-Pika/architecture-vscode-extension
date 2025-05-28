export type ProjectType = 'Flutter' | 'Go' | 'Node.js' | 'FastAPI' | 'Django' | 'Rust' | 'NextJS' | 'React'| 'CMake'| 'Angular' | 'Vue'|'SpringBoot'| 'Kotlin';
export type FlutterArchitecture = 'Clean Architecture' | 'MVVM'| 'Basic' | 'Feature-First'| 'None/Add later';
export enum FlutterStateManagement {
    Bloc = 'BLoC',
    Riverpod = 'Riverpod',
    GetX = 'GetX',
    Provider = 'Provider',
    MobX = 'MobX',
    Cubit = 'Cubit',
    None = 'None/Add later'
}
export type GoFramework = 'Gin' | 'Echo' | 'Fiber' | 'Chi' | 'None';
export type NodejsFramework = 'Express' | 'Koa' | 'NestJS' | 'Fastify' | 'Hapi' | 'None/Add later';
export type RustFramework = 'Actix' | 'Axum' | 'Warp' | 'None/Add later';


export interface ProjectConfig {
    projectPath: string;
    projectName: string;
    // folders: string[]; 
    goFramework?: GoFramework;
    nodeFramework?: NodejsFramework;
    githubUsername?: string;
}

// export const DEFAULT_FOLDERS: ProjectFolders = {
//     'Flutter': ['lib', 'test', 'assets', 'integration_test'],
//     'Go': ['cmd', 'internal', 'pkg', 'api', 'configs', 'scripts'],
//     'Node.js': ['src', 'config', 'routes', 'controllers', 'models', 'middlewares'],
//     'FastAPI': ['app', 'tests', 'migrations', 'core', 'utils'],
//     'Django': ['apps', 'static', 'templates', 'utils', 'config'],
//     'Rust': ['src', 'tests', 'examples', 'benches'],
//     'NextJS': ['src/app', 'src/components', 'src/lib', 'public'],
//     'React': ['src/components', 'src/hooks', 'src/utils', 'public'],
//     'CMake': ['include', 'src', 'tests', 'cmake'],
//     'Angular': ['src/app', 'src/assets', 'src/environments'],
//     'Vue': ['src/components', 'src/router', 'src/store', 'public'],
//     'SpringBoot': ['src/main/java', 'src/test/java', 'src/main/resources'],
//     'Kotlin': ['src/main/kotlin', 'src/test/kotlin', 'src/main/resources'],
//     'None/Add later': [],
//     'MVVM': [],
//     'Basic': [],
//     'Feature-First': [],
//     'None': []
//   };
  