import { Component, Input, OnInit } from '@angular/core';
import { ClassroomResponse } from '../../../../core/interfaces/classroom';
import { Professor, Schedule } from '../../../../core/interfaces/schedule';
import { ScheduleService } from '../../../admin/service/schedules.service';

@Component({
  standalone: true,
  selector: 'app-schedule-tab',
  templateUrl: './schedule-tab.component.html',
})
export class ScheduleTabComponent implements OnInit {
  @Input() classroom?: ClassroomResponse;
  schedules: Schedule[] = [];
  daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  timeSlots: string[] = [];
  scheduleGrid: any[][] = [];

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    if (this.classroom?.id) {
      this.loadScheduleByCourseId(this.classroom.id);
    }
  }

  loadScheduleByCourseId(courseId: number) {
    this.scheduleService.getSchedulesByCourse(courseId).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.generateScheduleGrid();
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
      }
    });
  }

  generateScheduleGrid() {
    // Obtener todos los bloques horarios únicos
    const uniqueTimeSlots = new Set<string>();

    this.schedules.forEach(schedule => {
      const timeSlot = this.createTimeSlotKey(schedule.startTime, schedule.endTime);
      uniqueTimeSlots.add(timeSlot);
    });

    // Ordenar los bloques horarios
    this.timeSlots = Array.from(uniqueTimeSlots).sort((a, b) => {
      return a.localeCompare(b);
    });

    // Crear la cuadrícula
    this.scheduleGrid = this.timeSlots.map(timeSlot => {
      return this.daysOfWeek.map(day => {
        // Buscar el horario que coincida con el día y bloque horario
        return this.schedules.find(schedule => {
          return schedule.day.toLowerCase() === day.toLowerCase() &&
            this.createTimeSlotKey(schedule.startTime, schedule.endTime) === timeSlot;
        });
      });
    });
  }

  createTimeSlotKey(startTime: string, endTime: string): string {
    return `${this.formatTime(startTime)}_${this.formatTime(endTime)}`;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  getProfessorName(professor: Professor): string {
    return professor ? `Docente. ${professor.name}` : 'Sin asignar';
  }

  getCourseName(schedule: Schedule | undefined): string {
    return schedule?.course?.name || '';
  }
}