export type ProjectType = 'Flutter' | 'Go' | 'Node.js' | 'FastAPI' | 'Django' | 'Rust' | 'NextJS' | 'React'| 'CMake'| 'Angular' | 'Vue'|'SpringBoot'| 'Kotlin';
export type FlutterArchitecture = 'Clean Architecture' | 'MVVM'| 'Basic' | 'Feature-First'|'BLoC Architecture' |'None/Add later';
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

  