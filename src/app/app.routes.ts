import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { AuthenticatedGuard } from './core/guard/authenticated.guard';

export const routes: Routes = [
    { path: 'iniciar-sesion', loadComponent: () => import('./views/login/login.component') },
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout.component'),
        canActivate: [AuthGuard],
        children: [
            {
                path: 'v1/admin/principal',
                loadComponent: () => import('./views/admin/admin.component'),
            }
        ]
    },
    { path: '**', redirectTo: 'iniciar-sesion' },
];
