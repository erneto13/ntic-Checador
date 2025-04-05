import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Attendance } from '../../../core/interfaces/attendance';
import { ResponseDto } from '../../../core/interfaces/responses';
import { Course, Professor } from '../../../core/interfaces/schedule';
@Injectable({
    providedIn: 'root'
})
export class AttendanceService{
    private apiUrl = `${environment.apiUrl}/attendance`;
    constructor(private http: HttpClient) { }
    getAllAttendance(): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(this.apiUrl);
    }
    getAttendanceById(id: number): Observable<Attendance>{
        return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
    }
    createAttendance(attendance: Attendance): Observable<Attendance>{
        return this.http.post<Attendance>(`${this.apiUrl}/create`, attendance);
    }
    updateAttendance(id: number, attendance: Attendance): Observable<Attendance>{
        return this.http.put<Attendance>(`${this.apiUrl}/${id}`, attendance);
    }
    deleteAttendance(id: number): Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
    getAttendanceByProfessor(professorId: number): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(`${this.apiUrl}/professor/${professorId}`);
    }
    getAttendanceByCourse(courseId: number): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(`${this.apiUrl}/course/${courseId}`);
    }
    getAttendanceByDate(date: string): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(`${this.apiUrl}/date/${date}`);
    }
    getAttendanceByDateRange(startDate: string, endDate: string): Observable<Attendance[]>{
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<Attendance[]>(`${this.apiUrl}/date-range`, { params });
    }
    getAttendanceBySupervisor(supervisorId: number): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(`${this.apiUrl}/supervisor/${supervisorId}`);
    }
    getAttendanceByWeeklyTopic(weeklyTopic: string): Observable<Attendance[]>{
        return this.http.get<Attendance[]>(`${this.apiUrl}/weekly-topic/${weeklyTopic}`);
    }
    calculateAttendancePercentage(professorId: number, startDate:string, endDate:string): Observable<any>{
        const params = new HttpParams()
            .set('professorId', professorId.toString())
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<any>(`${this.apiUrl}/attendance-percentage`, { params });
    }
    attendanceToday(professor:number, crourse:number): Observable<ResponseDto>{
        return this.http.get<ResponseDto>(`${this.apiUrl}/today/${professor}/${crourse}`);
    }
}