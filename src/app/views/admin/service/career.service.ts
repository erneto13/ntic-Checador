import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CareerResponse } from '../../../core/interfaces/career';

@Injectable({
  providedIn: 'root'
})
export class CareerService {

  private API_URL = `${environment.apiUrl}/careers`;

  constructor(private http: HttpClient) { }

  // Obtener todas las carreras
  getAllCareers(): Observable<CareerResponse[]> {
    return this.http.get<CareerResponse[]>(this.API_URL);
  }

  // Obtener carrera por ID
  getCareerById(id: number): Observable<CareerResponse> {
    return this.http.get<CareerResponse>(`${this.API_URL}/${id}`);
  }

  // Obtener carrera por nombre
  getCareerByName(name: string): Observable<CareerResponse> {
    return this.http.get<CareerResponse>(`${this.API_URL}/name/${name}`);
  }

  // Crear nueva carrera
  createCareer(career: CareerResponse): Observable<CareerResponse> {
    return this.http.post<CareerResponse>(this.API_URL, career);
  }

  // Actualizar carrera
  updateCareer(id: number, career: CareerResponse): Observable<CareerResponse> {
    return this.http.put<CareerResponse>(`${this.API_URL}/${id}`, career);
  }

  // Eliminar carrera
  deleteCareer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Asignar carrera a departamento
  assignCareerToDepartment(careerId: number, departmentId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${careerId}/departments/${departmentId}`, null);
  }
}