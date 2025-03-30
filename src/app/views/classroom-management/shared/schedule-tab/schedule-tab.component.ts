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
        console.log('Schedules with professor data:', this.schedules);
        this.organizeScheduleGrid();
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
      }
    });
  }

  organizeScheduleGrid() {
    const allTimeSlots = new Set<string>();
    this.schedules.forEach(schedule => {
      const timeSlot = `${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)}`;
      allTimeSlots.add(timeSlot);
    });
    this.timeSlots = Array.from(allTimeSlots).sort();

    this.scheduleGrid = this.timeSlots.map(timeSlot => {
      return this.daysOfWeek.map(day => {
        return this.schedules.find(s =>
          this.translateDay(s.day) === day &&
          `${this.formatTime(s.startTime)} - ${this.formatTime(s.endTime)}` === timeSlot
        );
      });
    });
  }

  getProfessorName(professor: Professor): string {
    return professor ? `Prof. ${professor.name}` : 'Sin asignar';
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  }

  translateDay(englishDay: string): string {
    const daysMap: { [key: string]: string } = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes'
    };
    return daysMap[englishDay] || englishDay;
  }
}