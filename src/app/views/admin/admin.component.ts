import { Component, OnInit } from '@angular/core';
import { UserCreationFormComponent } from "./shared/user-creation-form/user-creation-form.component";
import { UsertableComponent } from "./shared/user-table/user-table.component";
import { UserService } from './service/user.service';
import { UserResponse } from '../../core/interfaces/user';
import { DialogModule } from 'primeng/dialog';
import { UserPaginationComponent } from './shared/user-pagination/user-pagination.component';
import { UserSearchbarComponent } from './shared/user-searchbar/user-searchbar.component';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { DepartmentsTableComponent } from "./shared/departments-table/departments-table.component";
import { DepartmentResponse } from '../../core/interfaces/department';
import { DepartmentService } from './service/department.service';
import { CareerTableComponent } from "./shared/career-table/career-table.component";
import { CareerResponse } from '../../core/interfaces/career';
import { CareerService } from './service/career.service';
import { CareerFormComponent } from "./shared/career-form/career-form.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    UserCreationFormComponent,
    UsertableComponent,
    DialogModule,
    UserPaginationComponent,
    UserSearchbarComponent,
    ToastComponent,
    DepartmentsTableComponent,
    CareerTableComponent,
    CareerFormComponent
  ],
  templateUrl: './admin.component.html',
})
export default class AdminComponent implements OnInit {
  // Datos y estado para usuarios
  allUsers: UserResponse[] = [];
  displayedUsers: UserResponse[] = [];
  userToEdit: UserResponse | null = null;
  userModalVisible: boolean = false;
  userEditModalVisible: boolean = false;

  // Datos y estado para departamentos
  allDepartments: DepartmentResponse[] = [];
  departmentToEdit: DepartmentResponse | null = null;
  departmentModalVisible: boolean = false;
  departmentEditModalVisible: boolean = false;

  // Datos y estado para carreras
  allCareers: CareerResponse[] = [];
  careerToEdit: CareerResponse | null = null;
  careerModalVisible: boolean = false;
  careerEditModalVisible: boolean = false;

  // Paginación y búsqueda
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  searchTerm = '';

  // Estados de carga
  loadingStates = {
    users: false,
    departments: false,
    careers: false,
    error: {
      users: false,
      departments: false,
      careers: false
    }
  };

  // Tabs
  tabs = [
    { id: 'users', label: 'Usuarios', icon: 'pi pi-users' },
    { id: 'careers', label: 'Carreras', icon: 'pi pi-book' },
    { id: 'departments', label: 'Departamentos', icon: 'pi pi-building' },
    { id: 'subjects', label: 'Materias', icon: 'pi pi-list' },
  ];
  activeTab: string = 'users';

  // Cache control
  dataLoaded = {
    users: false,
    departments: false,
    careers: false
  };

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private careerService: CareerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Cargar datos iniciales según necesidad
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Puedes cargar datos iniciales si es necesario
    // Por ejemplo, si siempre se muestra primero el tab de usuarios:
    this.loadUsers();
  }

  selectTab(tabId: string): void {
    this.activeTab = tabId;

    // Cargar datos solo cuando se selecciona el tab y no están cargados
    switch (tabId) {
      case 'users':
        if (!this.dataLoaded.users) this.loadUsers();
        break;
      case 'careers':
        if (!this.dataLoaded.careers) this.loadCareers();
        break;
      case 'departments':
        if (!this.dataLoaded.departments) this.loadDepartments();
        break;
    }
  }

  // Métodos para usuarios
  loadUsers(): void {
    if (this.loadingStates.users) return;

    this.loadingStates.users = true;
    this.loadingStates.error.users = false;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.filterAndPaginateUsers();
        this.dataLoaded.users = true;
        this.loadingStates.users = false;
      },
      error: (error) => {
        this.loadingStates.error.users = true;
        this.loadingStates.users = false;
        this.toastService.showToast(
          'Error',
          'No se lograron obtener los usuarios.',
          'error'
        );
      }
    });
  }

  // Métodos para departamentos
  loadDepartments(): void {
    if (this.loadingStates.departments) return;

    this.loadingStates.departments = true;
    this.loadingStates.error.departments = false;

    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.allDepartments = data;
        this.dataLoaded.departments = true;
        this.loadingStates.departments = false;
      },
      error: (error) => {
        this.loadingStates.error.departments = true;
        this.loadingStates.departments = false;
        this.toastService.showToast(
          'Error',
          'No se lograron obtener los departamentos.',
          'error'
        );
      }
    });
  }

  // Métodos para carreras
  loadCareers(): void {
    if (this.loadingStates.careers) return;

    this.loadingStates.careers = true;
    this.loadingStates.error.careers = false;

    this.careerService.getAllCareers().subscribe({
      next: (data) => {
        this.allCareers = data;
        this.dataLoaded.careers = true;
        this.loadingStates.careers = false;
      },
      error: (error) => {
        this.loadingStates.error.careers = true;
        this.loadingStates.careers = false;
        this.toastService.showToast(
          'Error',
          'No se lograron obtener las carreras.',
          'error'
        );
      }
    });
  }

  // Funcionalidades comunes
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 0;
    this.filterAndPaginateUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filterAndPaginateUsers();
  }

  filterAndPaginateUsers(): void {
    let filtered = this.allUsers;
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = this.allUsers.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const startIndex = this.currentPage * this.pageSize;
    this.displayedUsers = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  // Métodos para modales
  openUserModal(): void {
    this.userModalVisible = true;
  }

  openCareerModal(): void {
    this.careerModalVisible = true;
  }

  openDepartmentModal(): void {
    this.departmentModalVisible = true;
  }

  // Métodos para edición
  onEditUser(user: UserResponse): void {
    this.userToEdit = { ...user };
    this.userEditModalVisible = true;
  }

  onEditCareer(career: CareerResponse): void {
    this.careerToEdit = { ...career };
    this.careerEditModalVisible = true;
  }

  onEditDepartment(department: DepartmentResponse): void {
    this.departmentToEdit = { ...department };
    this.departmentEditModalVisible = true;
  }

  // Métodos para actualización de datos
  onUserUpdated(updatedUser: UserResponse): void {
    const index = this.allUsers.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.allUsers[index] = updatedUser;
      this.filterAndPaginateUsers();
    }
    this.userEditModalVisible = false;
  }

  onCareerUpdated(updatedCareer: CareerResponse): void {
    const index = this.allCareers.findIndex(c => c.id === updatedCareer.id);
    if (index !== -1) {
      this.allCareers[index] = updatedCareer;
    }
    this.careerEditModalVisible = false;
  }

  onDepartmentUpdated(updatedDepartment: DepartmentResponse): void {
    const index = this.allDepartments.findIndex(d => d.id === updatedDepartment.id);
    if (index !== -1) {
      this.allDepartments[index] = updatedDepartment;
    }
    this.departmentEditModalVisible = false;
  }

  // Métodos para eliminación
  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.toastService.showToast(
          'Éxito',
          'Usuario eliminado correctamente.',
          'success'
        );
      },
      error: (error) => {
        this.toastService.showToast(
          'Error',
          'No se logró eliminar el usuario.',
          'error'
        );
      }
    });
  }

  deleteCareer(id: number): void {
    this.careerService.deleteCareer(id).subscribe({
      next: () => {
        this.loadCareers();
        this.toastService.showToast(
          'Éxito',
          'Carrera eliminada correctamente.',
          'success'
        );
      },
      error: (error) => {
        this.toastService.showToast(
          'Error',
          'No se logró eliminar la carrera.',
          'error'
        );
      }
    });
  }

  deleteDepartment(id: number): void {
    this.departmentService.deleteDepartment(id).subscribe({
      next: () => {
        this.loadDepartments();
        this.toastService.showToast(
          'Éxito',
          'Departamento eliminado correctamente.',
          'success'
        );
      },
      error: (error) => {
        this.toastService.showToast(
          'Error',
          'No se logró eliminar el departamento.',
          'error'
        );
      }
    });
  }
}