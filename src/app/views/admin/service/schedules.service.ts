import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Schedule } from '../../../core/interfaces/schedule';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    private apiUrl = `${environment.apiUrl}/schedules`;

    constructor(private http: HttpClient) { }

    // Get all schedules
    getAllSchedules(): Observable<Schedule[]> {
        return this.http.get<Schedule[]>(this.apiUrl);
    }

    // Get schedule by ID
    getScheduleById(id: number): Observable<Schedule> {
        return this.http.get<Schedule>(`${this.apiUrl}/${id}`);
    }

    // Create new schedule
    createSchedule(schedule: Schedule): Observable<Schedule> {
        return this.http.post<Schedule>(this.apiUrl, schedule);
    }

    // Update existing schedule
    updateSchedule(id: number, schedule: Schedule): Observable<Schedule> {
        return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule);
    }

    // Delete schedule
    deleteSchedule(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Get schedules by course
    getSchedulesByCourse(courseId: number): Observable<Schedule[]> {
        return this.http.get<Schedule[]>(`${this.apiUrl}/course/${courseId}`);
    }

    // Get schedules by day of week
    getSchedulesByDay(day: string): Observable<Schedule[]> {
        return this.http.get<Schedule[]>(`${this.apiUrl}/day/${day}`);
    }

    // Get schedules by time range
    getSchedulesByTimeRange(startTime: string, endTime: string): Observable<Schedule[]> {
        const params = new HttpParams()
            .set('startTime', startTime)
            .set('endTime', endTime);

        return this.http.get<Schedule[]>(`${this.apiUrl}/time-range`, { params });
    }
}