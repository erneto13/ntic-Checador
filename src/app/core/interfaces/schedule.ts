import { User, UserResponse } from "./user";

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
export interface Supervisor{
    id: number;
    name: string;
    username: string;
    email: string;
    password: string;
    roleName: string;
}
export interface Checker extends User{

}