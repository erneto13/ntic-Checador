import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Classroom, ClassroomResponse, Professor } from '../../../../core/interfaces/classroom';
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
  @Input() classroom!: Classroom;
  @Output() classroomCreated = new EventEmitter<ClassroomResponse>();
  @Output() classroomUpdated = new EventEmitter<ClassroomResponse>();
  @Output() onCancel = new EventEmitter<void>();

  professors: Professor[] = [];
  classroomForm!: FormGroup;

  constructor(private professorService: ClassroomService,
    private toastService: ToastService, private fb: FormBuilder) {
    this.classroomForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      classroom: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      professor_id: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadProfessors();
    if (this.classroom) {
      this.patchFormWithClassroom();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classroom'] && this.classroom) {
      this.patchFormWithClassroom();
    }
  }

  patchFormWithClassroom(): void {
    this.classroomForm.patchValue({
      name: this.classroom.name,
      classroom: this.classroom.classroom,
      description: this.classroom.description,
      professor_id: this.classroom.professor?.id || this.classroom.professor_id,
    });
  }

  loadProfessors(): void {
    this.professorService.getAllProfessors().subscribe({
      next: (professors) => {
        this.professors = professors;
      },
      error: (err) => {
        this.toastService.showToast(
          'Error al cargar los profesores',
          'No se pudieron cargar los profesores. Por favor, inténtelo de nuevo más tarde.',
          'error',
        );
      }
    });
  }

  onSubmit(): void {
    if (this.classroomForm.invalid) {
      this.toastService.showToast(
        'Error en el formulario',
        'Por favor completa los campos requeridos',
        'error'
      );
      return;
    }

    const formData = this.classroomForm.value;
    const classroomData: Classroom = {
      classroom: formData.classroom,
      description: formData.description,
      groupCode: '',
      name: formData.name,
      professor: { id: formData.professor_id }
    };

    if (this.classroom && this.classroom.id) {
      if (this.classroom.groupCode) {
        classroomData.groupCode = this.classroom.groupCode;
      }
      this.updateClassroom(this.classroom.id, classroomData as ClassroomResponse);
    } else {
      this.addClassroom(classroomData);
    }
  }

  addClassroom(classroom: Classroom): void {
    this.professorService.createCourse(classroom).subscribe({
      next: (response: Classroom) => {
        this.toastService.showToast(
          'Grupo creado',
          `El grupo ha sido creado exitosamente con código: ${response.groupCode}`,
          'success'
        );
        this.classroomCreated.emit(response as ClassroomResponse);
        this.classroomForm.reset();
      },
      error: (err) => {
        this.toastService.showToast(
          'Error al crear el grupo',
          'No se pudo crear el grupo. Por favor, inténtelo de nuevo más tarde.',
          'error'
        )
      }
    });
  }

  updateClassroom(id: number, classroom: ClassroomResponse): void {
    this.professorService.updateCourse(id, classroom).subscribe({
      next: (updatedClassroom) => {
        this.toastService.showToast(
          'Grupo actualizado',
          'El grupo ha sido actualizado exitosamente',
          'success'
        );
        this.classroomUpdated.emit(updatedClassroom);
        this.classroomForm.reset();
      },
      error: (err) => {
        this.toastService.showToast(
          'Ha ocurrido un problema',
          'No se ha logrado actualizar el grupo',
          'error'
        );
      }
    });
  }

  cancelForm(): void {
    this.onCancel.emit();
    this.classroomForm.reset();
  }
}