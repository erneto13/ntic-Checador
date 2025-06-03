import { Attendance } from "./attendance";
import { CareerResponse } from "./career";
import { ClassroomResponse } from "./classroom";
import { Professor } from "./schedule";
import { SubjectResponse } from "./subject";
import { UserResponse } from "./user";

export interface Group {
    id?: number;
    name: string;
    career?: CareerResponse;
    headStudent?: UserResponse;
    classSessions?: ClassSession[];
}

export interface ClassSession {
    id?: number;
    group?: Group;
    subject?: SubjectResponse;
    professor?: Professor;
    classRoom?: ClassroomResponse;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    attendances?: Attendance[];
}

