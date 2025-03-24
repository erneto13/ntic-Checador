import { Component, OnInit } from '@angular/core';
import { UserCreationFormComponent } from "./shared/user-creation-form/user-creation-form.component";
import { UsertableComponent } from "./shared/user-table/user-table.component";
import { UserService } from './service/user.service';
import { UserResponse } from '../../core/interfaces/user';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [UserCreationFormComponent, UsertableComponent],
  templateUrl: './admin.component.html',
})
export default class AdminComponent implements OnInit {
  users: UserResponse[] = []

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }
}
