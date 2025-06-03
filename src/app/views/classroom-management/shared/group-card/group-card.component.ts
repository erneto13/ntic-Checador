import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Group } from '../../../../core/interfaces/groups';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [],
  templateUrl: './group-card.component.html',
})
export class GroupCardComponent {
  @Input() group!: Group;
  @Output() onClick = new EventEmitter<Group>();
  @Output() onDelete = new EventEmitter<Group>();
  @Output() onEdit = new EventEmitter<Group>();

  handleClick() {
    this.onClick.emit(this.group);
  }

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
      const [hours] = session.startTime!.split(':').map(Number);
      return sum + hours;
    }, 0) / validSessions.length;

    return `${Math.round(avgHour)}:00 aprox`;
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
