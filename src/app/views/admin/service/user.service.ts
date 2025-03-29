import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../../core/interfaces/register-request';
import { Observable } from 'rxjs';
import { UserResponse } from '../../../core/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Registar un nuevo usuario
  registerUser(user: RegisterRequest): Observable<RegisterRequest> {
    return this.http.post<RegisterRequest>(`${this.API_URL}/auth/register`, user);
  }

  updateUser(id: number, user: UserResponse): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/users/${user.id}`, user);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${userId}`);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/users`);
  }
}
