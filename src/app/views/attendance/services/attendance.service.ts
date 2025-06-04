import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AttendanceRecord, AttendanceResponse } from '../../../core/interfaces/attendance';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private apiUrl = `${environment.apiUrl}/attendances`;

  constructor(private http: HttpClient) { }

  getAllAttendances(): Observable<AttendanceResponse[]> {
    return this.http.get<AttendanceResponse[]>(this.apiUrl);
  }

  getAttendanceById(id: number): Observable<AttendanceResponse> {
    return this.http.get<AttendanceResponse>(`${this.apiUrl}/${id}`);
  }

  createAttendance(attendance: AttendanceRecord): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(this.apiUrl, attendance);
  }

  updateAttendance(id: number, attendance: AttendanceResponse): Observable<AttendanceResponse> {
    return this.http.put<AttendanceResponse>(`${this.apiUrl}/${id}`, attendance);
  }

  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /*
  * VALIDATION METHODS
  */
  verifyAttendanceByProfessor(attendanceId: number): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.apiUrl}/${attendanceId}/verify/professor`, {});
  }

  verifyAttendanceByHeadStudent(attendanceId: number): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.apiUrl}/${attendanceId}/verify/head-student`, {});
  }

  verifyAttendanceByChecker(attendanceId: number, checkerId: number): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.apiUrl}/${attendanceId}/verify/checker?checkerId=${checkerId}`, {});
  }


  /*
    UTILITY METHODS
  */

  /**
  * Verifica si se puede tomar asistencia en el horario actual
  */
  canTakeAttendance(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    // Ventana de 15 minutos antes y después
    const WINDOW_MINUTES = 15;

    return currentTime >= (start - WINDOW_MINUTES) && currentTime <= (end + WINDOW_MINUTES);
  }

  /**
   * Obtiene el tiempo restante para tomar asistencia
   */
  getTimeUntilAttendance(startTime: string): number {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const start = startHour * 60 + startMinute;

    const WINDOW_MINUTES = 15;
    const attendanceStartTime = start - WINDOW_MINUTES;

    return Math.max(0, attendanceStartTime - currentTime);
  }
}
