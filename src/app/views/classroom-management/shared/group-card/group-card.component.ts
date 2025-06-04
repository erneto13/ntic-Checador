import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GroupResponse } from '../../../../core/interfaces/groups';

@Component({
  selector: 'app-group-card',
  standalone: true,
  templateUrl: './group-card.component.html',
})
export class GroupCardComponent {
  @Input() group!: GroupResponse;
  @Output() onDelete = new EventEmitter<GroupResponse>();
  @Output() onEdit = new EventEmitter<GroupResponse>();

  handleEdit() {
    this.onEdit.emit(this.group);
  }

  handleDelete() {
    this.onDelete.emit(this.group);
  }

  getMostCommonDay(): string {
    if (!this.group.classSessions || this.group.classSessions.length === 0) {
      return 'Sin horario';
    }

    const daysCount: Record<string, number> = {};
    this.group.classSessions.forEach(session => {
      if (session.dayOfWeek) {
        daysCount[session.dayOfWeek] = (daysCount[session.dayOfWeek] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(daysCount).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    return this.translateDay(mostCommon[0]);
  }

  getAverageSchedule(): string {
    if (!this.group.classSessions || this.group.classSessions.length === 0) {
      return '--:--';
    }

    const validSessions = this.group.classSessions.filter(s => s.startTime);
    if (validSessions.length === 0) return '--:--';

    const avgHour = validSessions.reduce((sum, session) => {
      // Manejo del formato de startTime que viene como array [hours, minutes]
      const hours = Array.isArray(session.startTime) ? session.startTime[0] : 0;
      return sum + hours;
    }, 0) / validSessions.length;

    return `${Math.round(avgHour)}:00 aprox`;
  }

  formatTime(time: any): string {
    if (!time) return '--:--';

    // Si es un array [hours, minutes]
    if (Array.isArray(time)) {
      const [hours, minutes] = time;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Si es string (formato HH:MM)
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }

    return '--:--';
  }

  private translateDay(day: string): string {
    const daysMap: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return daysMap[day] || day;
  }
}