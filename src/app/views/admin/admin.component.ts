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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    UserCreationFormComponent,
    UsertableComponent,
    DialogModule,
    UserPaginationComponent,
    UserSearchbarComponent,
    ToastComponent
  ],
  templateUrl: './admin.component.html',
})
export default class AdminComponent implements OnInit {
  allUsers: UserResponse[] = [];
  displayedUsers: UserResponse[] = [];
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  searchTerm = '';
  visible: boolean = false;

  userToEdit: UserResponse | null = null;

  editModalVisible: boolean = false;
  isLoadingUsers: boolean = true;

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.filterAndPaginateUsers();
        this.visible = false;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        this.toastService.showToast(
          'Se ha producido un error.',
          'No se lograron obtener los usuarios.',
          'error'
        );
        this.isLoadingUsers = false;
      }
    });
  }

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

  openDialog(): void {
    this.visible = true;
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.toastService.showToast(
          'Usuario eliminado correctamente.',
          'El usuario ha sido eliminado.',
          'success'
        );
      },
      error: (error) => {
        this.toastService.showToast(
          'Se ha producido un error.',
          'No se logró eliminar el usuario.',
          'error'
        );
      }
    });
  }

  onEditUser(user: UserResponse): void {
    this.userToEdit = { ...user };
    this.editModalVisible = true;
  }

  onUserUpdated(updatedUser: UserResponse): void {
    const index = this.allUsers.findIndex(d => d.id === updatedUser.id);
    if (index !== -1) {
      this.allUsers[index] = updatedUser;
      this.filterAndPaginateUsers();
    }
    this.editModalVisible = false;
  }

}
