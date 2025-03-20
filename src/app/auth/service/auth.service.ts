import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { AuthRequest } from '../../core/interfaces/auth-request';
import { map, Observable, tap } from 'rxjs';
import { TokenResponse } from '../../core/interfaces/token-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private LOGIN_URL = `${environment.apiUrl}/auth/login`;
  private REGISTER_URL = `${environment.apiUrl}/auth/register`;
  private REFRESH_URL = `${environment.apiUrl}/auth/refresh-token`;

  constructor(private http: HttpClient, private router: Router) { }

  login(request: AuthRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.LOGIN_URL, request)
      .pipe(
        tap(response => {
          this.saveTokens(response);
        })
      );
  }

  register(request: any): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.REGISTER_URL, request)
      .pipe(
        tap(response => {
          this.saveTokens(response);
        })
      );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${refreshToken}`);
    
    return this.http.post<TokenResponse>(this.REFRESH_URL, {}, { headers })
      .pipe(
        tap(response => {
          this.saveTokens(response);
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('roles');
    }
    this.router.navigate(['/iniciar-sesion']);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getUserRoles(): string[] {
    if (typeof window !== 'undefined') {
      const roles = localStorage.getItem('roles');
      return roles ? JSON.parse(roles) : [];
    }
    return [];
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private saveTokens(tokens: TokenResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      if (tokens.roles) {
        localStorage.setItem('roles', JSON.stringify(tokens.roles));
      }
    }
  }
}