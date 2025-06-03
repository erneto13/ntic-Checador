import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Professor, Schedule } from '../../../../../../core/interfaces/schedule';
import { ScheduleService } from '../../../../../admin/service/schedules.service';
import { ClassroomService } from '../../../../service/classroom-service.service';
import { CommonModule } from '@angular/common';
import { ClassroomResponse } from '../../../../../../core/interfaces/classroom';
import { ToastService } from '../../../../../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './schedule-form.component.html',
})
export class ScheduleFormComponent {
  @Output() scheduleCreated = new EventEmitter<void>();
  @Input() classroom?: ClassroomResponse;

  scheduleForm: FormGroup;
  professors: Professor[] = [];
  scheduleId: number | null = null;
  selectedDays: string[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private toastService: ToastService,
  ) {
    this.scheduleForm = this.fb.group({
      professor: [null, Validators.required],
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { validators: this.timeValidator });
  }

  ngOnInit(): void {
  }

  private timeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (start && end) {
      return start >= end ? { 'timeConflict': true } : null;
    }
    return null;
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid || this.isSubmitting || !this.classroom?.id) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.scheduleForm.value;
    const baseScheduleData = {
      professor: formValue.professor,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      course: { id: this.classroom.id, name: this.classroom.name }
    };

    this.createMultipleSchedules(baseScheduleData);
  }

  private createMultipleSchedules(baseData: any): void {
    const requests = this.selectedDays.map(day => {
      const scheduleData: Schedule = {
        ...baseData,
        day: day
      };
      return this.scheduleService.createSchedule(scheduleData);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.toastService.showToast(
          'Horarios creados',
          `Se crearon ${this.selectedDays.length} horarios correctamente`,
          'success'
        );
        this.scheduleForm.reset();
        this.scheduleCreated.emit();
        this.isSubmitting = false;
      },
      error: () => {
        this.scheduleForm.reset();
        this.isSubmitting = false;
        this.toastService.showToast(
          'Error',
          'Ocurrió un error al crear algunos horarios',
          'error'
        );
        this.isSubmitting = false;
      }
    });
  }

  // puede que lo use o no
  private updateSchedule(id: number, scheduleData: Schedule): void {
    this.scheduleService.updateSchedule(id, scheduleData).subscribe({
      next: () => {
        this.toastService.showToast(
          'Horario actualizado',
          'El horario se actualizó correctamente',
          'success'
        );
        this.scheduleCreated.emit();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.showToast(
          'Error',
          'No se pudo actualizar el horario',
          'error'
        );
        this.isSubmitting = false;
      }
    });
  }

  toggleDay(day: string): void {
    if (this.isDaySelected(day)) {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    } else {
      this.selectedDays.push(day);
    }
    this.scheduleForm.get('day')?.setValue(this.selectedDays.join(','));
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }
}