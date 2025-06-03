import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassroomResponse, Professor } from '../../../core/interfaces/classroom';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {

  private apiUrl = `${environment.apiUrl}/classrooms`;
  constructor(private http: HttpClient) { }

  getAllClassRooms(): Observable<ClassroomResponse[]> {
    return this.http.get<ClassroomResponse[]>(this.apiUrl);
  }

  getClassRoomById(id: number): Observable<ClassroomResponse> {
    return this.http.get<ClassroomResponse>(`${this.apiUrl}/${id}`);
  }

  createClassRoom(classroom: ClassroomResponse): Observable<ClassroomResponse> {
    return this.http.post<ClassroomResponse>(this.apiUrl, classroom);
  }

  updateClassRoom(id: number, classroom: ClassroomResponse): Observable<ClassroomResponse> {
    return this.http.put<ClassroomResponse>(`${this.apiUrl}/${id}`, classroom);
  }

  deleteClassRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
