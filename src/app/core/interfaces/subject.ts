import { CareerResponse } from "./career";

export interface SubjectResponse {
    id: number;
    name: string;
    career: CareerResponse;
}

export interface Subject {
    name: string;
    career_id: number;
}