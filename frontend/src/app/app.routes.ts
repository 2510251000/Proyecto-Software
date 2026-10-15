import { Routes } from '@angular/router';
import { PARAMETRO_ID_NOTICIA, RUTAS } from './core/constants/rutas.constants';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: RUTAS.raiz, pathMatch: 'full', redirectTo: RUTAS.noticias },
  {
    path: RUTAS.login,
    title: 'Iniciar sesión | Al Día',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: RUTAS.registro,
    title: 'Crear cuenta | Al Día',
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: RUTAS.noticias,
    title: 'Noticias | Al Día',
    canActivate: [authGuard],
    loadComponent: () => import('./features/noticias/listado/listado').then((m) => m.Listado),
  },
  {
    path: `${RUTAS.noticias}/:${PARAMETRO_ID_NOTICIA}`,
    title: 'Noticia | Al Día',
    canActivate: [authGuard],
    loadComponent: () => import('./features/noticias/detalle/detalle').then((m) => m.Detalle),
  },
  // Cualquier ruta desconocida va al listado; si no hay sesión, el guard la manda al login.
  { path: '**', redirectTo: RUTAS.noticias },
];
