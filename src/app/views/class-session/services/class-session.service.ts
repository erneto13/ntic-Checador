import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassSession } from '../../../core/interfaces/groups';

@Injectable({
  providedIn: 'root'
})
export class ClassSessionService {

  private apiUrl = `${environment.apiUrl}/class-sessions`;
  constructor(private http: HttpClient) { }

  getAllClassSession(): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(this.apiUrl);
  }

  createClassSession(classSession: ClassSession): Observable<ClassSession> {
    return this.http.post<ClassSession>(this.apiUrl, classSession);
  }

  deleteClassSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClassSessionsByDayAndTime(dayOfWeek: string, startTime: string): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.apiUrl}/search`, {
      params: {
        dayOfWeek,
        startTime
      }
    });
  }
}
