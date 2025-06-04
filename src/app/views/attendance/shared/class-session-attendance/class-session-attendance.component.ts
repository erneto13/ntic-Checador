import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassSession } from '../../../../core/interfaces/groups';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-class-session-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-session-attendance.component.html',
  styleUrl: './class-session-attendance.component.css'
})
export class ClassSessionAttendanceComponent {
  @Input() classSession!: ClassSession;
  @Input() userRole: string = '';

  @Output() studentListClicked = new EventEmitter<ClassSession>();
  @Output() attendanceClicked = new EventEmitter<ClassSession>();
  @Output() qrClicked = new EventEmitter<ClassSession>();

  private readonly ATTENDANCE_WINDOW_MINUTES = 15;

  getDayColorClass(): string {
    const dayColors: { [key: string]: string } = {
      'LUNES': 'bg-blue-600',
      'MARTES': 'bg-green-600',
      'MIÉRCOLES': 'bg-yellow-600',
      'JUEVES': 'bg-orange-600',
      'VIERNES': 'bg-purple-600'
    };

    if (!this.classSession || !this.classSession.dayOfWeek) {
      return 'bg-gray-600'; // Default color if dayOfWeek is not set
    }

    return dayColors[this.classSession.dayOfWeek] || 'bg-indigo-600';
  }

  isCurrentlyActive(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();


    if (!this.classSession.startTime || !this.classSession.endTime) {
      return false;
    }

    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.classSession.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return currentTime >= (startTime - this.ATTENDANCE_WINDOW_MINUTES) &&
      currentTime <= (endTime + this.ATTENDANCE_WINDOW_MINUTES);
  }

  canTakeAttendance(): boolean {
    return this.isCurrentlyActive();
  }

  getStatusText(): string {
    if (this.isCurrentlyActive()) {
      return 'En curso';
    }

    if (!this.classSession.startTime || !this.classSession.endTime) {
      return 'Sin horario definido';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;

    if (currentTime < startTime - this.ATTENDANCE_WINDOW_MINUTES) {
      return 'Próxima';
    } else {
      return 'Finalizada';
    }
  }

  getStatusBadgeClass(): string {
    if (this.isCurrentlyActive()) {
      return 'bg-green-100 text-green-800';
    }

    if (!this.classSession.startTime || !this.classSession.endTime) {
      return 'bg-gray-100 text-gray-800';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;

    if (currentTime < startTime - this.ATTENDANCE_WINDOW_MINUTES) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  getTimeStatus(): string {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (!this.classSession.startTime || !this.classSession.endTime) {
      return 'Horario no definido';
    }

    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.classSession.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (currentTime < startTime - this.ATTENDANCE_WINDOW_MINUTES) {
      const minutesUntilStart = (startTime - this.ATTENDANCE_WINDOW_MINUTES) - currentTime;
      if (minutesUntilStart > 60) {
        const hours = Math.floor(minutesUntilStart / 60);
        const minutes = minutesUntilStart % 60;
        return `Inicia en ${hours}h ${minutes}m`;
      } else {
        return `Inicia en ${minutesUntilStart}m`;
      }
    } else if (currentTime > endTime + this.ATTENDANCE_WINDOW_MINUTES) {
      return 'Clase finalizada';
    }

    return '';
  }

  getAttendanceButtonClass(): string {
    if (this.canTakeAttendance()) {
      return 'bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer';
    } else {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';
    }
  }

  getAttendanceTooltip(): string {
    if (this.canTakeAttendance()) {
      return 'Tomar asistencia';
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (!this.classSession.startTime || !this.classSession.endTime) {
      return 'Horario no definido';
    }

    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.classSession.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (currentTime < startTime - this.ATTENDANCE_WINDOW_MINUTES) {
      return `La asistencia se puede tomar ${this.ATTENDANCE_WINDOW_MINUTES} minutos antes del inicio de clase`;
    } else if (currentTime > endTime + this.ATTENDANCE_WINDOW_MINUTES) {
      return `La asistencia ya no está disponible. La ventana cerró ${this.ATTENDANCE_WINDOW_MINUTES} minutos después del fin de clase`;
    }

    return 'Asistencia no disponible';
  }

  onStudentListClick(): void {
    this.studentListClicked.emit(this.classSession);
  }

  onAttendanceClick(): void {
    if (this.canTakeAttendance()) {
      this.attendanceClicked.emit(this.classSession);
    }
  }
}
