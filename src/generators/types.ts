export type ProjectType = 'Flutter' | 'Go' | 'Node.js' | 'FastAPI' | 'Django' | 'Rust' | 'NextJS' | 'React'| 'CMake';
export type FlutterArchitecture = 'Clean Architecture' | 'MVVM';
export enum FlutterStateManagement {
    Bloc = 'BLoC',
    Riverpod = 'Riverpod',
    GetX = 'GetX',
    Provider = 'Provider',
    None = 'None/Add later'
}

export interface ProjectConfig {
    projectPath: string;
    projectName: string;
}