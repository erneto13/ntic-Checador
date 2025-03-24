import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {

        const userRole = this.auth.getUserRoles();
        if (userRole.includes('ADMIN')) {
            this.router.navigate(['/v1/admin/principal']);
            return false;
        } else if (userRole.includes('DEPARTMENT_HEAD')) {
            this.router.navigate(['/grupos']);
            return false;
        } else if (userRole.includes('PROFESSOR')) {
            this.router.navigate(['/asistencias']);
            return false;
        } else if (userRole.includes('STUDENT')) {
            this.router.navigate(['/asistencias']);
            return false;
        } else if (userRole.includes('SUPERVISOR')) {
            this.router.navigate(['/asistencias']);
            return false;
        }

        return true;
    }
}