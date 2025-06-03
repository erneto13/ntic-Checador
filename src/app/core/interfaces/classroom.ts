import { Attendance } from "./attendance";
import { Group } from "./groups";
import { SubjectResponse } from "./subject";

export interface Professor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    department: string;
    roleName: string;
}

export interface ClassroomResponse {
    id: number;
    name: string;
    description: string;
    classSession: ClassSession[];
}

export interface ClassSession {
    id: number;
    group: Group;
    subject: SubjectResponse;
    professor: Professor;
    classroom: ClassroomResponse;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    attendance: Attendance[];
}

