import { Component, EventEmitter, Input, OnInit, OnChanges, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Role, UserResponse, ERole, RoleLabels, getRoleKey, getRoleLabel } from '../../../../core/interfaces/user';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-creation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-creation-form.component.html',
})
export class UserCreationFormComponent implements OnInit, OnChanges {
  @Output() userCreated = new EventEmitter<void>();
  @Input() user: UserResponse | null = null;
  @Output() userUpdated = new EventEmitter<UserResponse>();

  userForm!: FormGroup;
  roleLabels = Object.values(RoleLabels);
  selectedRoleLabel: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.patchFormWithUser();
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.patchFormWithUser();
    }
  }

  patchFormWithUser(): void {
    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      passwordControl.clearValidators();
      passwordControl.updateValueAndValidity();
    }

    let roleValue: any = this.user!.role;

    if (typeof roleValue === 'object' && roleValue !== null && 'name' in roleValue) {
      roleValue = roleValue.name;
    }

    this.selectedRoleLabel = getRoleLabel(roleValue as ERole);

    this.userForm.patchValue({
      username: this.user!.username,
      name: this.user!.name,
      email: this.user!.email,
      password: '',
      role: roleValue
    });

    this.cdr.detectChanges();
  }

  selectRole(roleLabel: string): void {
    this.selectedRoleLabel = roleLabel;
    const roleKey = getRoleKey(roleLabel);
    if (roleKey) {
      this.userForm.patchValue({ role: roleKey });
    }
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
      this.toastService.showToast(
        'Error en el formulario',
        'Por favor, completa todos los campos requeridos',
        'error'
      );
      return;
    }

    const formValues = this.userForm.value;

    if (this.user) {
      // Para actualización: mantener formato original con objeto role
      const updatedUser: any = {
        id: this.user.id,
        username: formValues.username,
        name: formValues.name,
        email: formValues.email,
        role: {
          name: formValues.role
        }
      };

      if (formValues.password && formValues.password.trim() !== '') {
        updatedUser.password = formValues.password;
      }

      this.updateUser(this.user.id, updatedUser);
    } else {
      // Para nuevo registro: enviar role como string
      const newUser: any = {
        username: formValues.username,
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        role: formValues.role // Enviar directamente el string (STUDENT, TEACHER, etc.)
      };

      this.registerUser(newUser);
    }
  }

  registerUser(register: any): void {
    this.userService.registerUser(register).subscribe({
      next: () => {
        this.toastService.showToast(
          'Usuario creado',
          'El usuario ha sido creado exitosamente',
          'success'
        );
        this.userCreated.emit();
        this.userForm.reset();
        this.initForm();
      },
      error: (err) => {
        this.toastService.showToast(
          'Error al crear usuario',
          err?.error?.message || 'No se ha logrado crear el usuario',
          'error'
        );
      }
    });
  }

  updateUser(id: number, updatedUser: any): void {
    const payload = {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role.name, 
      password: updatedUser.password
    };

    if (!payload.password) {
      delete payload.password;
    }

    this.userService.updateUser(id, payload).subscribe({
      next: (response) => {
        this.toastService.showToast(
          'Usuario actualizado',
          'El usuario ha sido actualizado exitosamente',
          'success'
        );
        this.userUpdated.emit(response);
        this.userForm.reset();
        this.initForm();
      },
      error: (err) => {
        this.toastService.showToast(
          'Error al actualizar usuario',
          err?.error?.message || 'No se ha logrado actualizar el usuario',
          'error'
        );
      }
    });
  }
}