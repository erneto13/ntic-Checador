import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject, SubjectResponse } from '../../../core/interfaces/subject';
import { environment } from '../../../../environments/environment.development';
import { Professor } from '../../../core/interfaces/schedule';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private apiUrl = `${environment.apiUrl}/subjects`;
  constructor(private http: HttpClient) { }

  // Obtener todas las materias
  getAllSubject(): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(this.apiUrl);
  }

  // Obtener una materia por ID
  getSubjectById(id: number): Observable<SubjectResponse> {
    return this.http.get<SubjectResponse>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva materia
  createSubject(subject: SubjectResponse): Observable<SubjectResponse> {
    return this.http.post<SubjectResponse>(this.apiUrl, subject);
  }

  // Crear una materia asociada a una carrera
  createSubjectWithCareer(subject: Subject, careerId: number): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/with-career/${careerId}`, subject);
  }

  // Actualizar una materia
  updateSubject(id: number, payload: { id: number; name: string; career_id: number }): Observable<SubjectResponse> {
    return this.http.put<SubjectResponse>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  // Eliminar una materia
  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Asignar materia a una carrera
  assignSubjectToCareer(subjectId: number, careerId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${subjectId}/careers/${careerId}`, null);
  }

  // Obtener profesores de una materia
  getSubjectProfessors(id: number): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.apiUrl}/${id}/professors`);
  }

  // Obtener materias por carrera
  getSubjectByCareer(careerId: number): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(`${this.apiUrl}/by-career/${careerId}`);
  }
}
