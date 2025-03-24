import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../../core/interfaces/register-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private API_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  // Registar un nuevo usuario
  registerUser(user: RegisterRequest): Observable<RegisterRequest> {
    return this.http.post<RegisterRequest>(`${this.API_URL}/register`, user);
  }
}
