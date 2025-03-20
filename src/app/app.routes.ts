import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';

export const routes: Routes = [
    { path: 'iniciar-sesion', loadComponent: () => import('./views/login/login.component') },
    { path: 'v1/principal', loadComponent: () => import('./views/dashboard/dashboard.component'), canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'iniciar-sesion' },
];
