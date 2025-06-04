import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastComponent } from "../../shared/toast/toast.component";
import { ClassSession } from '../../core/interfaces/groups';
import { ClassSessionService } from './services/class-session.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateDayPipe } from '../../core/pipes/translate-day.pipe';
import { FormatTimePipe } from '../../core/pipes/format-time.pipe';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  endTime?: string;
}

interface ScheduleSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
}

@Component({
  selector: 'app-class-session',
  standalone: true,
  imports: [],
  templateUrl: './class-session.component.html',
})
export default class ClassSessionComponent implements OnInit {
  @Input() set refresh(value: boolean) {
    if (value) {
      this.loadClassSessions();
    }
  }
  classSessions!: ClassSession[]

  constructor(
    private classService: ClassSessionService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadClassSessions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['groupId'] && !changes['groupId'].firstChange) {
      this.resetComponent();
      this.loadClassSessions();
    }
  }

  private resetComponent(): void {
    this.classSessions = [];
    this.scheduleSlots = [];
    this.subjectColors = {};
  }

  loadClassSessions(): void {
    this.classService.getAllClassSession().subscribe({
      next: (data: any) => {
        this.classSessions = data;
        this.generateOptimizedTimeSlots();
        this.assignColorsToSubjects();
      },
      error: (error: any) => {
        this.toastService.showToast(
          'Error al cargar las clases',
          'No se pudieron cargar las sesiones de clase. Por favor, inténtalo de nuevo más tarde.',
          'error'
        );
      }
    });
  }

  deleteClassSession(classSession: ClassSession): void {
    if (!classSession.id) {
      this.toastService.showToast(
        'Error',
        'No se puede eliminar la clase: ID no válido.',
        'error'
      );
      return;
    }

    this.classService.deleteClassSession(classSession.id).subscribe({
      next: () => {
        this.toastService.showToast(
          'Clase eliminada',
          'La sesión de clase se ha eliminado correctamente.',
          'success'
        );
        this.loadClassSessions();
      },
      error: (error: any) => {
        this.toastService.showToast(
          'Error al eliminar',
          'No se pudo eliminar la clase. Por favor, inténtalo de nuevo.',
          'error'
        );
      }
    });
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  scheduleSlots: ScheduleSlot[] = [];

  subjectColors: { [key: string]: string } = {};
  availableColors = [
    'bg-blue-50 border-blue-200 hover:bg-blue-100',
    'bg-green-50 border-green-200 hover:bg-green-100',
    'bg-purple-50 border-purple-200 hover:bg-purple-100',
    'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    'bg-pink-50 border-pink-200 hover:bg-pink-100',
    'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    'bg-red-50 border-red-200 hover:bg-red-100',
    'bg-orange-50 border-orange-200 hover:bg-orange-100'
  ];

  generateOptimizedTimeSlots(): void {
    const allTimes = new Set<string>();

    this.classSessions.forEach(classSession => {
      if (classSession.startTime && classSession.endTime) {
        allTimes.add(classSession.startTime);
        allTimes.add(classSession.endTime);
      }
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) =>
      this.timeToMinutes(a) - this.timeToMinutes(b)
    );

    this.scheduleSlots = [];
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const startTime = sortedTimes[i];
      const endTime = sortedTimes[i + 1];

      if (this.hasClassInTimeRange(startTime, endTime)) {
        this.scheduleSlots.push({
          startTime: startTime,
          endTime: endTime,
          displayTime: `${startTime} - ${endTime}`
        });
      }
    }
  }

  hasClassInTimeRange(startTime: string, endTime: string): boolean {
    return this.classSessions.some(classSession => {
      if (!classSession.startTime || !classSession.endTime) return false;

      const classStart = this.timeToMinutes(classSession.startTime);
      const classEnd = this.timeToMinutes(classSession.endTime);
      const rangeStart = this.timeToMinutes(startTime);
      const rangeEnd = this.timeToMinutes(endTime);

      return classStart < rangeEnd && classEnd > rangeStart;
    });
  }

  assignColorsToSubjects(): void {
    const uniqueSubjects = [...new Set(this.classSessions.map(cs => cs.subject?.name).filter(Boolean))];

    uniqueSubjects.forEach((subject, index) => {
      if (subject) {
        this.subjectColors[subject] = this.availableColors[index % this.availableColors.length];
      }
    });
  }

  getClassColor(subjectName?: string): string {
    if (!subjectName) return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    return this.subjectColors[subjectName] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }

  getClassForDayAndTimeSlot(day: string, slot: ScheduleSlot): ClassSession[] {
    return this.classSessions.filter(classSession => {
      if (classSession.dayOfWeek !== day) return false;
      if (!classSession.startTime || !classSession.endTime) return false;

      const classStart = this.timeToMinutes(classSession.startTime);
      const classEnd = this.timeToMinutes(classSession.endTime);
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);

      return classStart < slotEnd && classEnd > slotStart;
    });
  }

  getClassesForDay(day: string): ClassSession[] {
    return this.classSessions
      .filter(classSession => classSession.dayOfWeek === day && classSession.startTime && classSession.endTime)
      .sort((a, b) => this.timeToMinutes(a.startTime!) - this.timeToMinutes(b.startTime!));
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getClassDuration(classSession: ClassSession): number {
    if (!classSession.startTime || !classSession.endTime) {
      return 0;
    }
    const startMinutes = this.timeToMinutes(classSession.startTime);
    const endMinutes = this.timeToMinutes(classSession.endTime);
    return Math.ceil((endMinutes - startMinutes) / 60);
  }

  getPrimaryClassForSlot(day: string, slot: ScheduleSlot): ClassSession | null {
    const classes = this.getClassForDayAndTimeSlot(day, slot);
    if (classes.length === 0) return null;

    return classes.reduce((primary, current) => {
      const primaryOverlap = this.calculateOverlap(primary, slot);
      const currentOverlap = this.calculateOverlap(current, slot);
      return currentOverlap > primaryOverlap ? current : primary;
    });
  }

  private calculateOverlap(classSession: ClassSession, slot: ScheduleSlot): number {
    if (!classSession.startTime || !classSession.endTime) return 0;

    const classStart = this.timeToMinutes(classSession.startTime);
    const classEnd = this.timeToMinutes(classSession.endTime);
    const slotStart = this.timeToMinutes(slot.startTime);
    const slotEnd = this.timeToMinutes(slot.endTime);

    const overlapStart = Math.max(classStart, slotStart);
    const overlapEnd = Math.min(classEnd, slotEnd);

    return Math.max(0, overlapEnd - overlapStart);
  }

  formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}