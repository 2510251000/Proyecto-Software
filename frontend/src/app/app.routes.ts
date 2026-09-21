import { Routes } from '@angular/router';
import { RUTAS } from './core/constants/rutas.constants';

export const routes: Routes = [
  {
    path: RUTAS.login,
    title: 'Iniciar sesión | Al Día',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
];
