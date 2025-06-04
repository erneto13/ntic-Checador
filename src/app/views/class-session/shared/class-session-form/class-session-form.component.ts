import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClassSession, GroupResponse } from '../../../../core/interfaces/groups';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ClassSessionService } from '../../services/class-session.service';
import { DropdownComponent } from "../../../../shared/dropdown/dropdown.component";
import { SubjectService } from '../../../admin/service/subjects.service';
import { UserService } from '../../../admin/service/user.service';
import { ClassroomService } from '../../../classroom-management/service/classroom-service.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-class-session-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './class-session-form.component.html',
})
export class ClassSessionFormComponent implements OnInit {
  @Input() group!: GroupResponse;

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  groupId!: any;
  loading = false;
  classSessionForm!: FormGroup;

  selectedDays: string[] = [];
  isAllDaysSelected: boolean = false;

  subjects: any[] = [];
  professors: any[] = [];
  classRooms: any[] = [];
  daysOfWeek: any = [
    { name: 'Lunes', value: 'Lunes' },
    { name: 'Martes', value: 'Martes' },
    { name: 'Miércoles', value: 'Miércoles' },
    { name: 'Jueves', value: 'Jueves' },
    { name: 'Viernes', value: 'Viernes' },
  ];

  constructor(
    private subjectService: SubjectService,
    private userService: UserService,
    private classRoomService: ClassroomService,
    private classSessionService: ClassSessionService,
    private toastService: ToastService,
    private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.groupId = this.group.id || 0;

    this.subjectService.getAllSubject().subscribe(subjects => {
      this.subjects = subjects.filter(subject =>
        subject.careerId === this.group.career?.id
      );
    });

    this.userService.getUsersByRole("PROFESSOR").subscribe(professors => {
      this.professors = professors;
    });

    this.classRoomService.getAllClassRooms().subscribe(classRooms => {
      this.classRooms = classRooms;
    });
  }

  initializeForm(): void {
    this.classSessionForm = this.fb.group({
      group: [this.group],
      subject: ['', [Validators.required]],
      professor: ['', [Validators.required]],
      classroom: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
    }, { validators: [this.timeRangeValidator(), this.minDurationValidator(30)] });

    this.classSessionForm.get('startTime')?.valueChanges.subscribe(() => {
      this.classSessionForm.updateValueAndValidity();
    });

    this.classSessionForm.get('endTime')?.valueChanges.subscribe(() => {
      this.classSessionForm.updateValueAndValidity();
    });
  }

  onAllDaysChange(event: any): void {
    this.isAllDaysSelected = event.target.checked;

    if (this.isAllDaysSelected) {
      this.selectedDays = this.daysOfWeek.map((day: { value: any; }) => day.value);
    } else {
      this.selectedDays = [];
    }
  }

  onDayCheckboxChange(event: any, day: string): void {
    if (event.target.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
      this.isAllDaysSelected = false;
    }

    if (this.selectedDays.length === this.daysOfWeek.length) {
      this.isAllDaysSelected = true;
    }
  }

  isFormValid(): boolean {
    const formValid = this.classSessionForm.valid;
    return formValid && this.selectedDays.length > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastService.showToast('Error', 'Por favor complete todos los campos requeridos y seleccione al menos un día', 'error');
      return;
    }

    this.loading = true;
    this.createMultipleClassSessions();
  }

  private createMultipleClassSessions(): void {
    const requests = this.selectedDays.map(day => {
      const classSessionData: ClassSession = {
        group: this.groupId,
        subject: this.classSessionForm.value.subject,
        professor: this.classSessionForm.value.professor,
        classRoom: this.classSessionForm.value.classroom,
        dayOfWeek: day,
        startTime: this.classSessionForm.value.startTime,
        endTime: this.classSessionForm.value.endTime,
      };
      return this.classSessionService.createClassSession(classSessionData);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showToast('Éxito', `${this.selectedDays.length} sesión${this.selectedDays.length > 1 ? 'es' : ''} de clase creada${this.selectedDays.length > 1 ? 's' : ''} exitosamente`, 'success');
        this.submit.emit();
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showToast('Error', `Error al crear algunas sesiones de clase: ${error.message}`, 'error');
      }
    });
  }

  cancelForm(): void {
    this.cancel.emit();
    this.classSessionForm.reset();
    this.selectedDays = [];
    this.isAllDaysSelected = false;
  }

  /*
  Custom validator to ensure that the start time is before the end time
  and that the duration is at least 30 minutes.
  */

  timeRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;

      if (!startTime || !endTime) {
        return null;
      }

      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);

      if (start >= end) {
        return { timeRangeInvalid: true };
      }

      return null;
    };
  }

  minDurationValidator(minutes: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;

      if (!startTime || !endTime) {
        return null;
      }

      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const duration = end.getTime() - start.getTime();
      const minDuration = minutes * 60 * 1000;

      if (duration < minDuration) {
        return { minDurationInvalid: true };
      }

      return null;
    };
  }
}