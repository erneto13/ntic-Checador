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
                path: 'v1/admin/inicio',
                loadComponent: () => import('./views/dashboard/dashboard.component'),
            },
            {
                path: 'v1/admin/principal',
                loadComponent: () => import('./views/admin/admin.component'),
            },
            {
                path: 'v1/grupos',
                loadComponent: () => import('./views/classroom-management/classroom-management.component'),
            },
            {
                path: 'v1/admin/reportes',
                loadComponent: () => import('./views/reports/reports.component'),
            },
            {
                path: 'v1/asistencia',
                loadComponent: () => import('./views/attendance/attendance.component'),
            },
            {
                path: '', redirectTo: 'v1/admin/principal', pathMatch: 'full'
            }
        ]
    },
    { path: '**', redirectTo: 'v1/admin/principal' },
];
