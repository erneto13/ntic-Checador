import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from "../../shared/dropdown/dropdown.component";
import { DayOfWeek, HourOfDay } from '../../core/interfaces/attendance';
import { ClassSessionService } from '../class-session/services/class-session.service';
import { ToastService } from '../../core/services/toast.service';
import { ClassSession } from '../../core/interfaces/groups';
import { AuthService } from '../../auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../../shared/toast/toast.component";
import { ClassSessionAttendanceComponent } from "./shared/class-session-attendance/class-session-attendance.component";
import { DialogModule } from 'primeng/dialog';
import { AttendanceDetailsComponent } from "./shared/attendance-details/attendance-details.component";

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    DropdownComponent,
    ToastComponent,
    ClassSessionAttendanceComponent,
    DialogModule,
    AttendanceDetailsComponent
],
  templateUrl: './attendance.component.html',
})
export default class AttendanceComponent implements OnInit {
  daysOfWeek: any[] = [];
  hoursOfDay: any[] = [];
  selectedDay: string = '';
  selectedHour: string = '';
  classSessions: ClassSession[] = [];
  isLoading = false;
  role: string = '';

  // Modal control
  showAttendanceModal = false;
  selectedClassSession: ClassSession | null = null;

  constructor(
    private classSessionService: ClassSessionService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeDropdowns();
    this.loadUserRole();
  }

  private loadUserRole(): void {
    const role = this.authService.getRoleFromToken();
    if (role) {
      this.role = role;
    } else {
      console.warn('No se pudo obtener el rol desde el token.');
      this.toastService.showToast(
        'Advertencia',
        'No se pudo verificar tu rol de usuario',
        'info'
      );
    }
  }

  initializeDropdowns(): void {
    this.daysOfWeek = Object.entries(DayOfWeek).map(([key, value]) => ({
      name: value,
      value
    }));

    this.hoursOfDay = Object.entries(HourOfDay).map(([key, value]) => ({
      name: value,
      value
    }));
  }

  onDaySelected(day: any): void {
    this.selectedDay = day.value;
    if (this.selectedDay && this.selectedHour) {
      this.loadClassSessions();
    }
  }

  onHourSelected(hour: any): void {
    this.selectedHour = hour.value;
    if (this.selectedDay && this.selectedHour) {
      this.loadClassSessions();
    }
  }

  loadClassSessions(): void {
    if (!this.selectedDay || !this.selectedHour) {
      this.toastService.showToast(
        'Filtros requeridos',
        'Por favor, selecciona un día y una hora para buscar clases.',
        'info'
      );
      return;
    }

    if (this.daysOfWeek.length === 0 || this.hoursOfDay.length === 0) {
      this.initializeDropdowns();
    }

    this.isLoading = true;
    this.classSessions = [];

    this.classSessionService.getClassSessionsByDayAndTime(this.selectedDay, this.selectedHour).subscribe({
      next: (sessions) => {
        this.classSessions = sessions;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading class sessions:', err);
        this.toastService.showToast(
          'Error al cargar sesiones',
          'No se pudieron cargar las sesiones de clase. Por favor, inténtalo de nuevo.',
          'error'
        );
        this.isLoading = false;
      },
      complete: () => {
        if (this.classSessions.length === 0) {
          this.toastService.showToast(
            'Sin resultados',
            'No se encontraron clases para el día y hora seleccionados.',
            'info'
          );
        } else {
          this.toastService.showToast(
            'Clases cargadas',
            `Se encontraron ${this.classSessions.length} clase(s).`,
            'success'
          );
        }
      }
    });
  }

  onStudentListClick(classSession: ClassSession): void {
    console.log('Ver lista de estudiantes para:', classSession);
    // TODO: Implementar modal de lista de estudiantes
    this.toastService.showToast(
      'Funcionalidad pendiente',
      'La lista de estudiantes estará disponible próximamente.',
      'info'
    );
  }

  onAttendanceClick(classSession: ClassSession): void {
    this.selectedClassSession = classSession;
    this.showAttendanceModal = true;
  }

  onQRClick(classSession: ClassSession): void {
    console.log('Generar QR para:', classSession);
    this.selectedClassSession = classSession;
    this.showAttendanceModal = true;

    // TODO: Trigger QR generation automatically
    setTimeout(() => {
      this.toastService.showToast(
        'QR Generado',
        'Código QR listo para tomar asistencia.',
        'success'
      );
    }, 500);
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedClassSession = null;
  }

  trackByClassSessionId(index: number, classSession: ClassSession): number {
    return classSession.id || index;
  }
}