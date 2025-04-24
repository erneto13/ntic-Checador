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

  allCareers: CareerResponse[] = [];
  displayedCareers: CareerResponse[] = [];

  careerToEdit: CareerResponse | null = null;
  careerModalVisible: boolean = false;
  careerEditModalVisible: boolean = false;

  currentUsersPage = 0;
  usersPageSize = 5;
  usersTotalPages = 0;
  usersSearchTerm = '';

  // Paginación y búsqueda para carreras
  currentCareersPage = 0;
  careersPageSize = 5;
  careersTotalPages = 0;
  careersSearchTerm = '';

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
    private careerService: CareerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
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

  // Métodos para carreras
  loadCareers(): void {
    if (this.loadingStates.careers) return;

    this.loadingStates.careers = true;
    this.loadingStates.error.careers = false;

    this.careerService.getAllCareers().subscribe({
      next: (data) => {
        this.allCareers = data;
        this.filterAndPaginateCareers();
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
  onUsersSearch(searchTerm: string): void {
    this.usersSearchTerm = searchTerm;
    this.currentUsersPage = 0;
    this.filterAndPaginateUsers();
  }

  onUsersPageChange(page: number): void {
    this.currentUsersPage = page;
    this.filterAndPaginateUsers();
  }

  filterAndPaginateUsers(): void {
    let filtered = this.allUsers;
    if (this.usersSearchTerm) {
      const search = this.usersSearchTerm.toLowerCase();
      filtered = this.allUsers.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    this.usersTotalPages = Math.ceil(filtered.length / this.usersPageSize);
    const startIndex = this.currentUsersPage * this.usersPageSize;
    this.displayedUsers = filtered.slice(startIndex, startIndex + this.usersPageSize);
  }

  // Funcionalidades de búsqueda y paginación para carreras
  onCareersSearch(searchTerm: string): void {
    this.careersSearchTerm = searchTerm;
    this.currentCareersPage = 0;
    this.filterAndPaginateCareers();
  }

  onCareersPageChange(page: number): void {
    this.currentCareersPage = page;
    this.filterAndPaginateCareers();
  }

  filterAndPaginateCareers(): void {
    let filtered = this.allCareers;
    if (this.careersSearchTerm) {
      const search = this.careersSearchTerm.toLowerCase();
      filtered = this.allCareers.filter(career =>
        career.name.toLowerCase().includes(search)
      );
    }

    this.careersTotalPages = Math.ceil(filtered.length / this.careersPageSize);
    const startIndex = this.currentCareersPage * this.careersPageSize;
    this.displayedCareers = filtered.slice(startIndex, startIndex + this.careersPageSize);
  }

  // Métodos para modales
  openUserModal(): void {
    this.userModalVisible = true;
  }

  openCareerModal(): void {
    this.careerModalVisible = true;
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

  onCareerCreated(): void {
    this.loadCareers();
    this.careerModalVisible = false;
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
      this.filterAndPaginateCareers();
    }
    this.careerEditModalVisible = false;
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

}