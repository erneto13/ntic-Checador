import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ClassroomResponse } from '../../core/interfaces/classroom';
import { Group } from '../../core/interfaces/groups';
import { ClassroomService } from './service/classroom-service.service';
import { GroupsService } from './service/groups.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ClassroomFormComponent } from './shared/classroom-form/classroom-form.component';
import { ClassroomCardComponent } from './shared/classroom-card/classroom-card.component';
import { ClassroomDetailsComponent } from './shared/classroom-details/classroom-details.component';
import { GroupCardComponent } from './shared/group-card/group-card.component';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastComponent,
    ClassroomFormComponent,
    ClassroomCardComponent,
    ClassroomDetailsComponent,
    GroupCardComponent
  ],
  templateUrl: './classroom-management.component.html',
})
export default class ClassroomManagement implements OnInit {
  // Data properties
  classrooms: ClassroomResponse[] = [];
  groups: Group[] = [];

  // Selected items
  selectedItem?: ClassroomResponse | Group;
  selectedItemDetails?: ClassroomResponse | Group;

  // UI State properties
  activeTab: 'groups' | 'classrooms' = 'groups';
  showFormModal = false;
  showDetailsModal = false;
  isEditMode = false;
  formType: 'classroom' | 'group' = 'classroom';

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

  private loadGroups(): void {
    this.groupService.getAllGroups().subscribe({
      next: (data) => this.groups = data,
      error: () => this.showErrorToast('Error', 'No se pudieron cargar los grupos')
    });
  }

  private loadClassrooms(): void {
    this.classroomService.getAllClassRooms().subscribe({
      next: (data) => this.classrooms = data,
      error: () => this.showErrorToast('Error', 'No se pudieron cargar las aulas')
    });
  }

  // ========================
  // MODAL MANAGEMENT
  // ========================
  openCreateModal(type: 'classroom' | 'group'): void {
    this.formType = type;
    this.isEditMode = false;
    this.selectedItem = undefined;
    this.showFormModal = true;
  }

  openEditModal(item: ClassroomResponse | Group): void {
    this.selectedItem = item;
    this.formType = item.hasOwnProperty('capacity') ? 'classroom' : 'group';
    this.isEditMode = true;
    this.showFormModal = true;
  }

  openDetailsModal(item: ClassroomResponse | Group): void {
    this.selectedItemDetails = item;
    this.showDetailsModal = true;
  }

  closeModal(): void {
    this.showFormModal = false;
    this.showDetailsModal = false;
  }

  // ========================
  // CRUD OPERATIONS
  // ========================
  onFormSubmit(): void {
    this.closeModal();
    if (this.formType === 'classroom') {
      this.loadClassrooms();
    } else {
      this.loadGroups();
    }
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