// Modificaciones en attendance-details.component.ts

import { interval } from "rxjs/internal/observable/interval";
import { AttendanceRecord, AttendanceResponse } from "../../../../core/interfaces/attendance";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ClassSession } from "../../../../core/interfaces/groups";
import { Subscription } from "rxjs";
import { AttendanceService } from "../../services/attendance.service";
import { AuthService } from "../../../../auth/service/auth.service";
import { ToastService } from "../../../../core/services/toast.service";
import { jwtDecode } from "jwt-decode";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-attendance-details',
  imports: [CommonModule],
  templateUrl: './attendance-details.component.html',
})

export class AttendanceDetailsComponent implements OnInit {
  @Input() isVisible = false;
  @Input() classSession: ClassSession | null = null;
  @Output() closed = new EventEmitter<void>();

  attendances: AttendanceResponse[] = [];
  isLoading = false;
  hasChanges = false;
  timeStatus = '';

  // determinar quien es el que pone la asistencia
  // y condicionar botones y otros cosos
  currentUserRole: string | null = null;
  currentUserId: number | null = null;

  hasRegisteredToday = false;

  private timeSubscription?: Subscription;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRoleFromToken();
    this.loadAttendances();

    const token = this.authService.getAccessToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.userId || decoded.id;
    }
  }

  private checkIfAlreadyRegisteredToday(): void {
    if (!this.currentUserId || !this.classSession?.id) {
      this.hasRegisteredToday = false;
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const todaysAttendance = this.attendances.find(attendance => {
      const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
      return attendanceDate === today;
    });

    if (!todaysAttendance) {
      this.hasRegisteredToday = false;
      return;
    }

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        this.hasRegisteredToday = todaysAttendance.professorVerified === true;
        break;
      case 'SUPERVISOR':
        this.hasRegisteredToday = todaysAttendance.checkerVerified === true &&
          todaysAttendance.checkerId === this.currentUserId;
        break;
      case 'STUDENT':
        this.hasRegisteredToday = todaysAttendance.headStudentVerified === true;
        break;
      default:
        this.hasRegisteredToday = false;
    }
  }

  canTakeAttendance(): boolean {
    if (!this.classSession?.startTime || !this.classSession?.endTime) {
      return false;
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      return false;
    }

    if (!this.currentUserRole) return false;

    if (!['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole)) {
      return false;
    }

    if (this.hasRegisteredToday) {
      return false;
    }

    return true;
  }

  getCannotRegisterReason(): string {
    if (!this.classSession?.startTime || !this.classSession?.endTime) {
      return 'Horario de asistencia no definido';
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      return 'Fuera del horario permitido (±15 minutos)';
    }

    if (!this.currentUserRole || !['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole)) {
      return 'No tienes permisos para registrar asistencia';
    }

    if (this.hasRegisteredToday) {
      return 'Ya registraste la asistencia hoy';
    }

    return '';
  }

  loadAttendances(): void {
    if (!this.classSession?.id) return;

    this.isLoading = true;
    this.attendanceService.getAllAttendances().subscribe({
      next: (attendances: any) => {
        this.attendances = attendances.filter((attendance: any) =>
          attendance.classSessionId === this.classSession?.id ||
          attendance.class_session_id === this.classSession?.id
        );

        this.checkIfAlreadyRegisteredToday();

        this.isLoading = false;

        this.updateTimeStatus();
        if (this.timeSubscription) {
          this.timeSubscription.unsubscribe();
        }
        this.timeSubscription = interval(60000).subscribe(() => this.updateTimeStatus());
      },
      error: (error: any) => {
        console.error('Error loading attendances:', error);
        this.toastService.showToast('Error', 'No se pudieron cargar las asistencias', 'error');
        this.isLoading = false;
      }
    });
  }

  initializeAttendance(): void {
    if (!this.classSession?.id || !this.currentUserId) {
      this.toastService.showToast('Error', 'Información de sesión no válida', 'error');
      return;
    }

    if (!this.classSession.startTime || !this.classSession.endTime) {
      this.toastService.showToast('Error', 'Horario de sesión no definido', 'error');
      return;
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      this.toastService.showToast('Advertencia', 'Fuera del horario permitido (±15 minutos)', 'info');
      return;
    }

    if (!['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole || '')) {
      this.toastService.showToast('Error', 'No tienes permisos para registrar asistencia', 'error');
      return;
    }

    this.loadAttendances();

    setTimeout(() => {
      if (this.hasRegisteredToday) {
        this.toastService.showToast('Advertencia', 'Ya registraste la asistencia para esta clase hoy', 'info');
        return;
      }

      this.createAttendanceRecord();
    }, 100);
  }

  private createAttendanceRecord(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.classSession?.id) {
      this.toastService.showToast('Error', 'ID de sesión no disponible', 'error');
      return;
    }

    const rawAttendance: AttendanceRecord = {
      classSessionId: this.classSession.id,
      date: today,
      attended: true,
      professorVerified: this.currentUserRole === 'PROFESSOR',
      professorVerificationTime: this.currentUserRole === 'PROFESSOR' ? new Date().toISOString() : undefined,
      headStudentVerified: this.currentUserRole === 'STUDENT',
      headStudentVerificationTime: this.currentUserRole === 'STUDENT' ? new Date().toISOString() : undefined,
      checkerVerified: this.currentUserRole === 'SUPERVISOR',
      checkerVerificationTime: this.currentUserRole === 'SUPERVISOR' ? new Date().toISOString() : undefined,
      checkerId: this.currentUserRole === 'SUPERVISOR' ? (this.currentUserId ?? undefined) : undefined,
    };

    this.isLoading = true;
    this.attendanceService.createAttendance(rawAttendance).subscribe({
      next: (response: any) => {
        this.loadAttendances();
        this.toastService.showToast('Éxito', 'Asistencia registrada correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error creating attendance:', error);

        if (error.status === 409 ||
          error.error?.message?.includes('duplicate') ||
          error.error?.message?.includes('already exists') ||
          error.error?.message?.includes('ya existe')) {
          this.toastService.showToast('Advertencia', 'Ya existe un registro de asistencia para hoy', 'info');
          this.loadAttendances();
        } else {
          this.toastService.showToast('Error', 'No se pudo registrar la asistencia', 'error');
        }

        this.isLoading = false;
      }
    });
  }

  private updateTimeStatus(): void {
    if (!this.classSession) return;

    if (!this.classSession.startTime || !this.classSession.endTime) {
      this.timeStatus = 'Horario de asistencia no definido';
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.classSession.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const WINDOW_MINUTES = 15;

    if (currentTime < startTime - WINDOW_MINUTES) {
      const minutesUntilStart = (startTime - WINDOW_MINUTES) - currentTime;
      this.timeStatus = `Asistencia disponible en ${minutesUntilStart} minutos`;
    } else if (currentTime >= startTime - WINDOW_MINUTES && currentTime <= endTime + WINDOW_MINUTES) {
      const minutesRemaining = (endTime + WINDOW_MINUTES) - currentTime;
      this.timeStatus = `Asistencia activa - ${minutesRemaining} minutos restantes`;
    } else {
      this.timeStatus = 'Periodo de asistencia cerrado';
    }

    if (this.hasRegisteredToday) {
      this.timeStatus += ' (Ya registrado hoy)';
    }
  }

  getTimeStatusClass(): string {
    if (this.hasRegisteredToday) {
      return 'text-blue-300';
    }
    if (this.canTakeAttendance()) {
      return 'text-green-300';
    }
    return 'text-yellow-300';
  }

  toggleAttendance(attendance: AttendanceResponse): void {
    if (!this.canTakeAttendance()) return;

    attendance.attended = !attendance.attended;
    this.hasChanges = true;
  }

  isCurrentUserAttendance(attendance: AttendanceResponse): boolean {
    if (!this.currentUserId || !this.currentUserRole) return false;

    const today = new Date().toISOString().split('T')[0];
    const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];

    if (attendanceDate !== today) return false;

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        return attendance.professorVerified;
      case 'SUPERVISOR':
        return attendance.checkerVerified && attendance.checkerId === this.currentUserId;
      case 'STUDENT':
        return attendance.headStudentVerified;
      default:
        return false;
    }
  }

  closeModal(): void {
    this.closed.emit();
  }
}