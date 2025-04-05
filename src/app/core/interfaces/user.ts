export interface UserResponse {
    id: number;
    username: string;
    email: string;
    name: string;
    role: Role | string;
}

export interface Role {
    name: string;
}

export interface User {
    id:number,
    username: string,
    email: string,
    password: string,
    name: string,
    role: Role,
}

export enum ERole {
    ADMIN = 'ADMIN',
    DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
    PROFESSOR = 'PROFESSOR',
    STUDENT = 'STUDENT',
    SUPERVISOR = 'SUPERVISOR',
    GROUP_LEADER = 'GROUP_LEADER',
}

export const RoleLabels: Record<ERole, string> = {
    [ERole.ADMIN]: 'Admin',
    [ERole.DEPARTMENT_HEAD]: 'Jefe de Carrera',
    [ERole.PROFESSOR]: 'Profesor',
    [ERole.STUDENT]: 'Estudiante',
    [ERole.SUPERVISOR]: 'Checador',
    [ERole.GROUP_LEADER]: 'Lider de Grupo',
};

export const getRoleKey = (label: string): ERole | null => {
    const entry = Object.entries(RoleLabels).find(([_, value]) => value === label);
    return entry ? entry[0] as ERole : null;
};

export const getRoleLabel = (key: ERole): string => {
    return RoleLabels[key] || key;
};