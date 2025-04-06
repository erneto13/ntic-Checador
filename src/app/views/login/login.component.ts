// Bodriular
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { AuthRequest } from '../../core/interfaces/auth-request';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent],
  templateUrl: './login.component.html',
})
export default class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const authRequest: AuthRequest = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };
    
    this.auth.login(authRequest).subscribe({
      next: () => {
        this.router.navigate(['/v1/admin/principal'])
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastService.showToast(
          'Ocurrio un error',
          'Error en la autenticación. Inténtalo de nuevo.',
          'error'
        )
      }
    });
  }
}