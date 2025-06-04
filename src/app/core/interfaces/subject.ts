import { CareerResponse } from "./career";

export interface SubjectResponse {
    id: number;
    name: string;
    careerId: number;
    careerName: string;
    professorIds: number[];
}

export interface Subject {
    name: string;
    careerId: number;
}

export interface CareerForDropdown {
    id: number;
    name: string;
}

export interface SubjectWithCareerObject {
    id: number;
    name: string;
    career: {
        id: number;
        name: string;
    };
}