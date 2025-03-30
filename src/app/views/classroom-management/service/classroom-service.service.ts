import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Classroom, ClassroomResponse, Professor } from '../../../core/interfaces/classroom';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {

  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  getAllCourse(): Observable<ClassroomResponse[]> {
    return this.http.get<ClassroomResponse[]>(this.apiUrl);
  }

  getCourseById(id: number): Observable<ClassroomResponse> {
    return this.http.get<ClassroomResponse>(`${this.apiUrl}/${id}`);
  }

  createCourse(ClassroomResponse: Classroom): Observable<Classroom> {
    return this.http.post<Classroom>(this.apiUrl, ClassroomResponse);
  }

  updateCourse(id: number, ClassroomResponse: ClassroomResponse): Observable<ClassroomResponse> {
    return this.http.put<ClassroomResponse>(`${this.apiUrl}/${id}`, ClassroomResponse);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCourseByProfessor(professorId: number): Observable<ClassroomResponse[]> {
    return this.http.get<ClassroomResponse[]>(`${this.apiUrl}/professor/${professorId}`);
  }

  getCourseByGroupCode(groupCode: string): Observable<ClassroomResponse[]> {
    return this.http.get<ClassroomResponse[]>(`${this.apiUrl}/group/${groupCode}`);
  }

  // Servicio compartido para profesores
  getAllProfessors(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${environment.apiUrl}/professors`);
  }

}
