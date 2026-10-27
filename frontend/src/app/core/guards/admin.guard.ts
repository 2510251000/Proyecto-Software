import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROLES } from '../constants/roles.constants';
import { RUTAS } from '../constants/rutas.constants';
import { AuthService } from '../services/auth.service';

/**
 * Deja pasar solo a los administradores. Va después de authGuard, que ya revisó la sesión.
 * Esto solo ordena la navegación: quien protege los datos es el backend (rol en el token).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.obtenerContenidoToken()?.rol === ROLES.administrador
    ? true
    : router.createUrlTree([RUTAS.noticias]);
};
