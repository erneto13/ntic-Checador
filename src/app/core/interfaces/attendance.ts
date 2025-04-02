import { Professor } from "./classroom";
import { Course, Supervisor, Checker } from "./schedule";
import { User } from "./user";

export interface Attendance {
    id?: number;
    professor: Professor;
    course:Course;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    present: boolean;
    weeklyTopic: string;
    checker:User;
    checker_type: string;
}
export interface AttendanceCheckDto{
    professor:Professor;
    course:Course;
}