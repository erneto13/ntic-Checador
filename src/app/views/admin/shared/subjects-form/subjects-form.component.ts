import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, SubjectResponse } from '../../../../core/interfaces/subject';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { SubjectService } from '../../service/subjects.service';
import { CareerService } from '../../service/career.service';
import { CareerResponse } from '../../../../core/interfaces/career';
import { DropdownComponent } from "../../../../shared/dropdown/dropdown.component";

@Component({
  selector: 'app-subjects-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './subjects-form.component.html',
  styleUrl: './subjects-form.component.css'
})
export class SubjectsFormComponent implements OnInit {
  @Output() subjectCreated = new EventEmitter<void>()
  @Output() subjectUpdated = new EventEmitter<SubjectResponse>()
  @Input() subject: SubjectResponse | null = null;

  subjectForm!: FormGroup
  careers: CareerResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private subjectService: SubjectService,
    private careerService: CareerService
  ) {
    this.initForm()
  }

  ngOnInit(): void {
    this.loadCareers();
  }

  initForm(): void {
    this.subjectForm = this.fb.group({
      name: ['', [Validators.required]],
      careerId: ['', [Validators.required]],
    })
  }

  loadCareers(): void {
    this.careerService.getAllCareers().subscribe({
      next: (res) => {
        this.careers = res;
        if (this.subject) {
          this.patchSubject();
        }
      },
      error: (e) => {
        this.toastService.showToast(
          'Error al cargar carreras',
          'No se pudieron cargar las carreras disponibles',
          'error'
        );
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subject'] && this.subject) {
      this.patchSubject();
    }
  }

  patchSubject(): void {
    this.subjectForm.patchValue({
      name: this.subject?.name,
      careerId: this.subject?.careerId
    });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid) {
      this.toastService.showToast(
        'Campos incompletos',
        'Debes completar todos los campos',
        'info'
      );
      return;
    }

    const formValues = this.subjectForm.value;

    if (this.subject) {
      this.updateSubject(this.subject.id, formValues);
    } else {
      const newSubject = {
        name: formValues.name,
        careerId: formValues.careerId
      };
      this.registerSubject(newSubject);
    }
  }

  registerSubject(register: any): void {
    const careerId = this.subjectForm.value.careerId;

    const subjectData: Subject = {
      name: register.name,
      careerId: careerId,
    };

    this.subjectService.createSubjectWithCareer(subjectData, careerId).subscribe({
      next: () => {
        this.toastService.showToast(
          'Materia registrada',
          'La materia ha sido registrada correctamente',
          'success'
        );
        this.subjectCreated.emit();
        this.subjectForm.reset();
      },
      error: (e) => {
        this.toastService.showToast(
          'Ocurrió un error',
          'No se ha logrado crear la materia',
          'error'
        );
      }
    });
  }

  updateSubject(id: number, formValue: any): void {
    const payload = {
      id: id,
      name: formValue.name,
      careerId: formValue.careerId, 
      careerName: '', 
      professorIds: []
    };

    this.subjectService.updateSubject(payload).subscribe({
      next: (updatedSubject) => {
        this.toastService.showToast('Éxito', 'Materia actualizada', 'success');
        this.subjectUpdated.emit(updatedSubject);
      },
      error: () => {
        this.toastService.showToast('Error', 'Error al actualizar', 'error');
      }
    });
  }
}