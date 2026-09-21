import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../constants/navegacion.constants';
import { RUTAS } from '../constants/rutas.constants';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const teniaToken = auth.obtenerToken() !== null;
  if (auth.haySesionVigente()) {
    return true;
  }

  // Con token guardado que ya no sirve, el usuario tenía una sesión que se venció.
  const queryParams = teniaToken ? { [PARAMETROS_URL.motivo]: MOTIVOS_LOGIN.sesionExpirada } : {};
  return router.createUrlTree([RUTAS.login], { queryParams });
};
