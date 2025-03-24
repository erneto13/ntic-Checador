export interface UserResponse {
    id: number,
    username: string,
    email: string,
    password: string,
    name: string, 
    roles: string[],
}

export interface User {
    username: string,
    email: string,
    password: string,
    name: string,
    roles: Role[],
}

export enum Role {
    ADMIN = 'Admin',
    DEPARTMENT_HEAD = 'Jefe de Carrera',
    PROFESSOR = 'Profesor',
    STUDENT = 'Estudiante',
    SUPERVISOR = 'Checador',
}