import { Component, OnInit } from '@angular/core';
import { Classroom, ClassroomResponse } from '../../core/interfaces/classroom';
import { ClassroomFormComponent } from './shared/classroom-form/classroom-form.component';
import { ClassroomCardComponent } from './shared/classroom-card/classroom-card.component';
import { CommonModule } from '@angular/common';
import { ClassroomService } from './service/classroom-service.service';
import { DialogModule } from 'primeng/dialog';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ToastService } from '../../core/services/toast.service';
import { AssignTabComponent } from './shared/assign-tab/assign-tab.component';
import { ScheduleTabComponent } from './shared/schedule-tab/schedule-tab.component';
import { ClassroomDetailsComponent } from './shared/classroom-details/classroom-details.component';

@Component({
  selector: 'app-classroom-management',
  standalone: true,
  imports: [
    ClassroomFormComponent,
    ClassroomCardComponent,
    CommonModule,
    DialogModule,
    ToastComponent,
    ClassroomDetailsComponent
  ],
  templateUrl: './classroom-management.component.html',
})
export default class ClassroomManagementComponent implements OnInit {
  classrooms: ClassroomResponse[] = [];
  selectedClassroom?: Classroom;
  selectedClassroomDetails?: ClassroomResponse;

  showPanel = false;
  showModal = false;
  showEditModal = false;
  showDetailsModal = false;

  constructor(
    private courseService: ClassroomService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadClassrooms();
  }

  openClassroomMenu(classroom: ClassroomResponse) {
    this.selectedClassroom = this.toClassroom(classroom);
    this.showEditModal = true;
  }

  openModal() {
    this.showModal = true;
  }

  closePanel() {
    this.showPanel = false;
  }

  assignClass(event: any) {
    console.log('Asignando clase:', event);
  }

  toClassroom(response: ClassroomResponse): Classroom {
    return {
      id: response.id,
      name: response.name,
      groupCode: response.groupCode,
      description: response.description,
      classroom: response.classroom,
      professor: response.professor ? { id: response.professor.id } : undefined,
      professor_id: response.professor_id
    };
  }

  onAssignment(classroom: ClassroomResponse) {
    this.selectedClassroomDetails = classroom;
    this.showDetailsModal = true;
  }

  openEditFromDetails() {
    if (this.selectedClassroomDetails) {
      this.selectedClassroom = this.toClassroom(this.selectedClassroomDetails);
      this.showDetailsModal = false;
      this.showEditModal = true;
    }
  }

  loadClassrooms() {
    this.courseService.getAllCourse().subscribe({
      next: (data) => {
        this.classrooms = data;
        this.showModal = false;
        console.log('Salones cargados:', this.classrooms);
      },
      error: (error) => {
        this.showModal = false;
        console.error('Error al cargar los salones:', error);
      }
    });
  }

  deleteClassroom(classroom: ClassroomResponse) {
    this.courseService.deleteCourse(classroom.id).subscribe({
      next: () => {
        this.classrooms = this.classrooms.filter(c => c.id !== classroom.id);
        this.toastService.showToast(
          'Grupo eliminado',
          `El grupo ${classroom.name} ha sido eliminada correctamente.`,
          'success',
        );
      },
      error: (error) => {
        this.toastService.showToast(
          'Error al eliminar el grupo',
          `No se pudo eliminar el grupo ${classroom.name}.`,
          'error',
        );
      }
    });
  }

  onClassroomCreated() {
    this.loadClassrooms();
    this.showModal = false;
  }

  onClassroomUpdated() {
    this.loadClassrooms();
    this.showEditModal = false;
  }

  onEditCancel() {
    this.showModal = false;
    this.showEditModal = false;
  }
}