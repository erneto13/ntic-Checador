import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';

export const PreventGuard: CanActivateFn = (route, state) =>{
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return router.navigate(['/v1/principal']);
  } else {
    return true;
  }
}