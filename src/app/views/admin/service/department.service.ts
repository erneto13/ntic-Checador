import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { DepartmentResponse } from '../../../core/interfaces/department';
import { Observable } from 'rxjs';
import { Professor } from '../../../core/interfaces/classroom';
import { CareerResponse } from '../../../core/interfaces/career';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private API_URL = `${environment.apiUrl}/departments`;


  constructor(private http: HttpClient) { }

  getAllDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(this.API_URL);
  }

  // Obtener departamento por ID
  getDepartmentById(id: number): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.API_URL}/${id}`);
  }

  // Obtener departamento por nombre
  getDepartmentByName(name: string): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.API_URL}/name/${name}`);
  }

  // Crear nuevo departamento
  createDepartment(department: DepartmentResponse): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.API_URL, department);
  }

  // Actualizar departamento
  updateDepartment(id: number, department: DepartmentResponse): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.API_URL}/${id}`, department);
  }

  // Eliminar departamento
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Obtener carreras de un departamento
  getDepartmentCareers(id: number): Observable<CareerResponse[]> {
    return this.http.get<CareerResponse[]>(`${this.API_URL}/${id}/careers`);
  }

  // Obtener profesores de un departamento
  getDepartmentProfessors(id: number): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.API_URL}/${id}/professors`);
  }
}
