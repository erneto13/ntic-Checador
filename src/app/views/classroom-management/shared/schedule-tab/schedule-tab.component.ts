import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ClassroomResponse } from '../../../../core/interfaces/classroom';
import { Professor, Schedule } from '../../../../core/interfaces/schedule';
import { ScheduleService } from '../../../admin/service/schedules.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-schedule-tab',
  imports: [ConfirmDialogModule],
  templateUrl: './schedule-tab.component.html',
  providers: [ConfirmationService],
})
export class ScheduleTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() classroom?: ClassroomResponse;
  schedules: Schedule[] = [];
  daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  timeSlots: string[] = [];
  scheduleGrid: any[][] = [];

  constructor(private scheduleService: ScheduleService,
    private toastService: ToastService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.loadSchedules();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classroom'] && !changes['classroom'].firstChange) {
      this.clearScheduleData();
      this.loadSchedules();
    }
  }

  ngOnDestroy(): void {
    this.clearScheduleData();
  }

  private clearScheduleData(): void {
    this.schedules = [];
    this.timeSlots = [];
    this.scheduleGrid = [];
  }

  private loadSchedules(): void {
    if (this.classroom?.id) {
      this.scheduleService.getSchedulesByCourse(this.classroom.id).subscribe({
        next: (schedules) => {
          this.schedules = schedules;
          this.generateScheduleGrid();
        },
        error: (err) => {
          console.error('Error loading schedules:', err);
        }
      });
    }
  }

  generateScheduleGrid() {
    const uniqueTimeSlots = new Set<string>();

    this.schedules.forEach(schedule => {
      const timeSlot = this.createTimeSlotKey(schedule.startTime, schedule.endTime);
      uniqueTimeSlots.add(timeSlot);
    });

    this.timeSlots = Array.from(uniqueTimeSlots).sort((a, b) => {
      return a.localeCompare(b);
    });

    this.scheduleGrid = this.timeSlots.map(timeSlot => {
      return this.daysOfWeek.map(day => {
        return this.schedules.find(schedule => {
          return schedule.day.toLowerCase() === day.toLowerCase() &&
            this.createTimeSlotKey(schedule.startTime, schedule.endTime) === timeSlot;
        });
      });
    });
  }

  deleteSchedule(id: number) {
    this.scheduleService.deleteSchedule(id).subscribe({
      next: () => {
        this.toastService.showToast(
          'Horario eliminado',
          'El horario fue eliminado correctamente',
          'success'
        );
        this.loadSchedules();
      },
      error: (err) => {
        this.toastService.showToast(
          'Ocurrio un error',
          'No se pudo eliminar el horario',
          'error'
        );
      }
    })
  }

  createTimeSlotKey(startTime: string, endTime: string): string {
    return `${this.formatTime(startTime)} ${this.formatTime(endTime)}`;
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