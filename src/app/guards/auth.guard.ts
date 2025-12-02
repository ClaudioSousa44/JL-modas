import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se tem token diretamente também (fallback)
  const hasToken = !!authService.getToken();
  
  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      // Se tem token OU está autenticado, permite acesso
      if (isAuthenticated || hasToken) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};



