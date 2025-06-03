import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Group } from '../../../core/interfaces/groups';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  private apiUrl = `${environment.apiUrl}/groups`;
  constructor(private http: HttpClient) { }


  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(classroom: Group): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, classroom);
  }

  updateGroup(id: number, classroom: Group): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, classroom);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
