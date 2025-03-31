export interface Professor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    department: string;
    roleName: string;
}

export interface ClassroomBase {
    classroom: string;
    description: string;
    groupCode: string;
    name: string;
    professor_id?: number;
}

export interface Classroom extends ClassroomBase {
    id?: number;
    professor?: { id: number };
}

export interface ClassroomResponse extends ClassroomBase {
    id: number;
    professor?: Professor;
}

export interface LocalTime {
    hour: number;
    minute: number;
}