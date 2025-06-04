import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Classroom, ClassroomResponse } from '../../../../core/interfaces/classroom';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassroomService } from '../../service/classroom-service.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classroom-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './classroom-form.component.html',
})
export class ClassroomFormComponent implements OnInit {
  @Input() classroom: ClassroomResponse | null = null;
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  loading = false;
  classroomForm!: FormGroup;

  constructor(
    private classroomService: ClassroomService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.classroom) {
      this.patchFormWithClassroom();
    }
  }

  initializeForm(): void {
    this.classroomForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  patchFormWithClassroom(): void {
    this.classroomForm.patchValue({
      name: this.classroom?.name,
      description: this.classroom?.description
    });
  }

  onSubmit(): void {
    if (this.classroomForm.invalid) {
      this.toastService.showToast('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const classroomData: Classroom = {
      name: this.classroomForm.value.name,
      description: this.classroomForm.value.description
    };

    if (this.classroom) {
      this.classroomService.updateClassRoom(this.classroom.id, classroomData).subscribe({
        next: () => {
          this.submit.emit();
          this.toastService.showToast('Éxito', 'Aula actualizada correctamente', 'success');
        },
        error: () => {
          this.toastService.showToast('Error', 'No se pudo actualizar el aula', 'error');
        }
      });
    } else {
      this.classroomService.createClassRoom(classroomData).subscribe({
        next: () => {
          this.toastService.showToast('Éxito', 'Aula creada correctamente', 'success');
          this.submit.emit();
        },
        error: () => {
          this.toastService.showToast('Error', 'No se pudo crear el aula', 'error');
        }
      });
    }
  }

  cancelForm(): void {
    this.cancel.emit();
    this.classroomForm.reset();
  }
}