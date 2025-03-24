import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserResponse } from '../../../../core/interfaces/user';

@Component({
  selector: 'app-usertable',
  standalone: true,
  imports: [],
  templateUrl: './user-table.component.html',
})
export class UsertableComponent {
  @Input() users: UserResponse[] = [];
  columnas: any[] = ["Nombre completo", "No. de cuenta", "Rol", "Acciones"];
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<UserResponse>();


  deleteUser(id: number): void {
    this.delete.emit(id);
  }

  editUser(contact: UserResponse): void {
    this.edit.emit(contact);
  }
}
