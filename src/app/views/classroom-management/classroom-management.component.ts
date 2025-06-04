import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ClassroomResponse } from '../../core/interfaces/classroom';
import { Group, GroupResponse } from '../../core/interfaces/groups';
import { ClassroomService } from './service/classroom-service.service';
import { GroupsService } from './service/groups.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ClassroomFormComponent } from './shared/classroom-form/classroom-form.component';
import { ClassroomCardComponent } from './shared/classroom-card/classroom-card.component';
import { GroupCardComponent } from './shared/group-card/group-card.component';
import { GroupFormComponent } from "./shared/group-form/group-form.component";
import { GroupDetailsComponent } from "./shared/group-details/group-details.component";

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastComponent,
    ClassroomFormComponent,
    ClassroomCardComponent,
    GroupCardComponent,
    GroupFormComponent,
    GroupDetailsComponent
  ],
  templateUrl: './classroom-management.component.html',
})
export default class ClassroomManagement implements OnInit {
  classrooms: ClassroomResponse[] = [];
  groups: GroupResponse[] = [];

  // Selected items for edit/create
  selectedItem?: ClassroomResponse | Group;

  // Selected items for details (específicos para cada tipo)
  selectedGroupDetails?: GroupResponse;
  selectedClassroomDetails?: ClassroomResponse;

  // UI State properties
  activeTab: 'groups' | 'classrooms' = 'groups';
  showGroupCreateModal = false;
  showGroupEditModal = false;
  showGroupDetailsModal = false; // Nuevo modal para detalles de grupo
  showClassroomCreateModal = false;
  showClassroomEditModal = false;
  showClassroomDetailsModal = false; // Nuevo modal para detalles de aula

  constructor(
    private classroomService: ClassroomService,
    private groupService: GroupsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ========================
  // DATA LOADING METHODS
  // ========================
  private loadInitialData(): void {
    this.loadGroups();
    this.loadClassrooms();
  }

  loadGroups(): void {
    this.groupService.getAllGroups().subscribe({
      next: (data) => this.groups = data,
      error: () => this.showErrorToast('Error', 'No se pudieron cargar los grupos')
    });
  }

  loadClassrooms(): void {
    this.classroomService.getAllClassRooms().subscribe({
      next: (data) => this.classrooms = data,
      error: () => this.showErrorToast('Error', 'No se pudieron cargar las aulas')
    });
  }

  // ========================
  // MODAL MANAGEMENT
  // ========================
  openCreateModal(): void {
    if (this.activeTab === 'groups') {
      this.showGroupCreateModal = true;
    } else {
      this.showClassroomCreateModal = true;
    }
    this.selectedItem = undefined;
  }

  // Nuevos métodos para abrir modales de detalles
  openGroupDetailsModal(group: GroupResponse): void {
    this.selectedGroupDetails = group;
    this.showGroupDetailsModal = true;
  }

  openClassroomDetailsModal(classroom: ClassroomResponse): void {
    this.selectedClassroomDetails = classroom;
    this.showClassroomDetailsModal = true;
  }

  closeModal(): void {
    this.showGroupCreateModal = false;
    this.showGroupEditModal = false;
    this.showGroupDetailsModal = false;
    this.showClassroomCreateModal = false;
    this.showClassroomEditModal = false;
    this.showClassroomDetailsModal = false;

    // Limpiar selecciones
    this.selectedItem = undefined;
    this.selectedGroupDetails = undefined;
    this.selectedClassroomDetails = undefined;
  }

  // ========================
  // CRUD OPERATIONS
  // ========================
  onFormSubmit(): void {
    this.closeModal();
    if (this.activeTab === 'groups') {
      this.loadGroups();
    } else {
      this.loadClassrooms();
    }
  }

  deleteGroup(group: GroupResponse): void {
    if (!group.id) {
      this.showErrorToast('Error', 'El grupo no tiene un ID válido');
      return;
    }

    this.groupService.deleteGroup(group.id).subscribe({
      next: () => {
        this.groups = this.groups.filter(c => c.id !== group.id);
        this.showSuccessToast('Éxito', 'Grupo eliminado correctamente');
      },
      error: () => {
        this.showErrorToast('Error', 'No se pudo eliminar el grupo');
      }
    });
  }

  deleteClassroom(classroom: ClassroomResponse): void {
    if (!classroom.id) {
      this.showErrorToast('Error', 'El aula no tiene un ID válido');
      return;
    }

    this.classroomService.deleteClassRoom(classroom.id).subscribe({
      next: () => {
        this.classrooms = this.classrooms.filter(c => c.id !== classroom.id);
        this.showSuccessToast('Éxito', 'Aula eliminada correctamente');
      },
      error: () => {
        this.showErrorToast('Error', 'No se pudo eliminar el aula');
      }
    });
  }

  // ========================
  // UTILITY METHODS
  // ========================
  private showSuccessToast(title: string, message: string): void {
    this.toastService.showToast(title, message, 'success');
  }

  private showErrorToast(title: string, message: string): void {
    this.toastService.showToast(title, message, 'error');
  }
}