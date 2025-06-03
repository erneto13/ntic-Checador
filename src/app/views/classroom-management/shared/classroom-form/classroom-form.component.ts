import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ClassroomResponse, Professor } from '../../../../core/interfaces/classroom';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassroomService } from '../../service/classroom-service.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../../../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-classroom-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule,
    DropdownComponent],
  templateUrl: './classroom-form.component.html',
})
export class ClassroomFormComponent implements OnInit {
  @Input() classroom!: ClassroomResponse;
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
      description: this.classroom.description,
    });
  }

  onSubmit(): void {

  }

  addClassroom(classroom: ClassroomResponse): void {

  }

  updateClassroom(id: number, classroom: ClassroomResponse): void {

  }

  onProfessorSelected(professor: any) {
    this.classroomForm.get('professor_id')?.setValue(professor?.id || null);
  }

  cancelForm(): void {
    this.onCancel.emit();
    this.classroomForm.reset();
  }
}