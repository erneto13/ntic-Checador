import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../../core/interfaces/register-request';
import { Observable } from 'rxjs';
import { UserResponse } from '../../../core/interfaces/user';
import { Checker } from '../../../core/interfaces/schedule';

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

  getUserByUserName(userName: string): Observable<Checker> {
    return this.http.get<Checker>(`${this.API_URL}/users/user/${userName}`);
  }

  getUsersByRole(roleName: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/users/role/${roleName}`);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/users`);
  }

  getUserName(): string {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log(payload.name);
        return payload.name;
      }
    }
    return '';
  }

  getUserRole(): string {
    //get the user role from the roles array in LOCAL STORAGE
    const roles = localStorage.getItem('roles');
    if (roles) {
      //get the first role from the array
      const parsedRoles = JSON.parse(roles);
      return parsedRoles[0]; // Assuming roles is an array and you want the first role
    }

    return '';
  }
}
