import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Role, User } from '../../../../core/interfaces/user';
import { UserService } from '../../service/user.service';
import { RegisterRequest } from '../../../../core/interfaces/register-request';
import { ToastService } from '../../../../core/services/toast.service';
import { ToastComponent } from "../../../../shared/toast/toast.component";

@Component({
  selector: 'app-user-creation-form',
  standalone: true,
  imports: [FormsModule, CommonModule,
    ReactiveFormsModule, ToastComponent],
  templateUrl: './user-creation-form.component.html',
})
export class UserCreationFormComponent implements OnInit {
  @Output() userCreated = new EventEmitter<void>();
  @Input() user: User | null = null;
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;
  roles = Object.values(Role);
  selectedRole: Role | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      roles: ['', [Validators.required]]
    });
  }

  ngOnInit(): void { }

  selectRole(role: Role): void {
    this.selectedRole = role;
    this.userForm.patchValue({ roles: role });
  }

  generatePassword(): void {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const length = Math.floor(Math.random() * 5) + 8;
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.userForm.patchValue({ password: result });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      alert('rellena todo');
      return;
    }

    const register: RegisterRequest = this.userForm.value;
    this.registerUser(register);
  }

  registerUser(register: RegisterRequest): void {
    this.userService.registerUser(register).subscribe({
      next: () => {
        this.userCreated.emit();
        this.userForm.reset();
      },
      error: () => {
        alert('algo paso');
      }
    });
  }
}
