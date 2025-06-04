import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Group } from '../../../../core/interfaces/groups';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { DropdownComponent } from "../../../../shared/dropdown/dropdown.component";
import { UserService } from '../../../admin/service/user.service';
import { UserResponse } from '../../../../core/interfaces/user';
import { CareerService } from '../../../admin/service/career.service';
import { CareerResponse } from '../../../../core/interfaces/career';
import { GroupsService } from '../../service/groups.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [DropdownComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './group-form.component.html',
})
export class GroupFormComponent {
  @Input() group!: Group;
  @Output() groupCreated = new EventEmitter<Group>();
  @Output() groupUpdated = new EventEmitter<Group>();
  @Output() onCancel = new EventEmitter<void>();

  groupForm!: FormGroup;
  headStudents: UserResponse[] = [];
  careers: CareerResponse[] = [];

  loading = false;

  constructor(
    private groupService: GroupsService,
    private careerService: CareerService,
    private toastService: ToastService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      career_id: ['', [Validators.required]],
      head_student_id: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.group) {
      this.patchFormWithGroup();
    }
    this.loadHeadStudents();
    this.loadCareers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['group'] && this.group) {
      this.patchFormWithGroup();
    }
  }

  patchFormWithGroup(): void {
    this.groupForm.patchValue({
      name: this.group.name,
      career_id: this.group.career?.id || '',
      head_student_id: this.group.headStudent?.id || '',
    });
  }

  loadHeadStudents(): void {
    this.userService.getUsersByRole("STUDENT").subscribe({
      next: (students) => {
        this.headStudents = students;
      },
      error: (_error) => {
        this.toastService.showToast(
          'Error',
          'Error al cargar los estudiantes',
          'error'
        )
      }
    });
  }

  loadCareers(): void {
    this.careerService.getAllCareers().subscribe({
      next: (careers) => {
        this.careers = careers;
      },
      error: (_error) => {
        this.toastService.showToast(
          'Error',
          'Error al cargar las carreras',
          'error'
        );
      }
    });
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.toastService.showToast(
        'Error',
        'Por favor, completa todos los campos requeridos.',
        'error'
      );
      return;
    }

    this.loading = true;

    const selectedCareer = this.careers.find(
      career => career.id === Number(this.groupForm.value.career_id)
    );

    const selectedHeadStudent = this.headStudents.find(
      student => student.id === Number(this.groupForm.value.head_student_id)
    );

    const groupData: Group = {
      ...this.group,
      name: this.groupForm.value.name,
      career: selectedCareer || null,
      headStudent: selectedHeadStudent || null
    };

    if (this.group?.id) {
      this.updateGroup(this.group.id, groupData);
    } else {
      this.addGroup(groupData);
    }
  }

  addGroup(group: Group): void {
    this.groupService.createGroup(group).subscribe({
      next: (createdGroup) => {
        this.loading = false;
        this.groupCreated.emit(createdGroup);
        this.toastService.showToast(
          'Éxito',
          'Grupo creado exitosamente',
          'success'
        );
        this.groupForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showToast(
          'Error',
          `Error al crear el grupo: ${error.message}`,
          'error'
        );
      }
    });
  }

  updateGroup(id: number, group: Group): void {
    this.groupService.updateGroup(id, group).subscribe({
      next: (updatedGroup) => {
        this.loading = false;
        this.groupUpdated.emit(updatedGroup);
        this.toastService.showToast(
          'Éxito',
          'Grupo actualizado exitosamente',
          'success'
        );
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showToast(
          'Error',
          `Error al actualizar el grupo: ${error.message}`,
          'error'
        );
      }
    });
  }

  cancelForm(): void {
    this.onCancel.emit();
    this.groupForm.reset();
  }
}