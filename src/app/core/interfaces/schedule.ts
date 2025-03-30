export interface Schedule {
    id: number;
    course: Course;
    professor: Professor;
    day: string;
    startTime: string;
    endTime: string;
}

export interface Course {
    id: number;
    name: string;
    description: string;
    groupCode: string;
    classroom: string;
    professor?: Professor;
}

export interface Professor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    department: string;
    roleName: string;
}