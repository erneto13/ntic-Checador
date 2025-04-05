import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CareerResponse } from '../../../../core/interfaces/career';
import { ToastService } from '../../../../core/services/toast.service';
import { CareerService } from '../../service/career.service';

@Component({
  selector: 'app-career-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './career-form.component.html',
})
export class CareerFormComponent {
  @Output() careerCreated = new EventEmitter<void>()
  @Output() careerUpdated = new EventEmitter<CareerResponse>()
  @Input() career: CareerResponse | null = null;

  careerForm!: FormGroup

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private careerService: CareerService
  ) {
    this.initForm()
  }

  initForm(): void {
    this.careerForm = this.fb.group({
      name: ['', [Validators.required]],
    })
  }

  patchCareer(): void {
    this.careerForm.patchValue({
      name: this.career?.name,
    })
  }

  onSubmit(): void {
    if (this.careerForm.invalid) {
      this.toastService.showToast(
        'Campos incompletos',
        'Debes completar todos los campos',
        'info'
      );
      return
    }

    const formValues = this.careerForm.value

    if (this.career) {
      const careerUpdate: any = {
        id: this.career.id,
        name: this.career.name,
        department_id: 1
      }

      this.updateCareer(this.career?.id, this.careerUpdated)

    } else {
      const newCareer: any = {
        name: formValues.name,
        department_id: formValues.department_id
      }

      this.registerCareer(newCareer)
    }
  }

  registerCareer(register: any): void {
    this.careerService.createCareer(register).subscribe({
      next: () => {
        this.toastService.showToast(
          'Carrera registrada',
          'La carrera ha sido registrada correctamente',
          'success'
        );
        this.careerCreated.emit()
        this.careerForm.reset()
        this.initForm()
      },
      error: (e) => {
        this.toastService.showToast(
          'Ocurrio un error',
          'No se ha logrado crear el usuario',
          'error'
        );
      }
    })
  }

  updateCareer(id: number, updateCareer: any): void {
    const payload = {
      id: updateCareer.id,
      name: updateCareer.name,
      department_id: updateCareer.department_id
    };

    this.careerService.updateCareer(id, payload).subscribe({
      next: (res) => {
        this.toastService.showToast(
          'Carrera actualizada',
          'La carrera ha sido actualizada exitosamente',
          'success'
        );
        this.careerUpdated.emit()
        this.careerForm.reset()
        this.initForm()
      },
      error: (e) => {
        this.toastService.showToast(
          'Ocurrio un error',
          'No se logro actualizar la carrera',
          'error'
        )
      }
    })
  }

}
