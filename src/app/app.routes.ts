import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { AuthenticatedGuard } from './core/guard/authenticated.guard';
import { PreventGuard } from './core/guard/prevent.guard';

export const routes: Routes = [
    { path: 'iniciar-sesion', loadComponent: () => import('./views/login/login.component'), canActivate: [PreventGuard] },
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout.component'),
        canActivate: [AuthGuard],
        children: [
            {
                path: 'v1/admin/principal',
                loadComponent: () => import('./views/admin/admin.component'),
            },
            {
                path: 'v1/grupos',
                loadComponent: () => import('./views/groups/groups.component'),
            },
            {
                path: 'v1/asistencia',
                loadComponent: () => import('./views/attendance/attendance.component'),
            },
            {
                path: 'v1/evaluaciones',
                loadComponent: () => import('./views/evaluation/evaluation.component'),
            },
            {
                path: '', redirectTo: 'v1/principal', pathMatch: 'full'
            }
        ]
    },
    { path: '**', redirectTo: 'v1/principal' },
];
