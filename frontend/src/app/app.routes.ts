import { Routes } from '@angular/router';
import { PARAMETRO_ID_NOTICIA, RUTAS } from './core/constants/rutas.constants';
import { adminGuard } from './core/guards/admin.guard';
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
  {
    path: RUTAS.publicar,
    title: 'Publicar | Al Día',
    canActivate: [authGuard],
    loadComponent: () => import('./features/publicar/publicar').then((m) => m.Publicar),
  },
  {
    path: RUTAS.perfil,
    title: 'Mi perfil | Al Día',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
  },
  {
    path: RUTAS.notificaciones,
    title: 'Notificaciones | Al Día',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notificaciones/notificaciones').then((m) => m.Notificaciones),
  },
  {
    path: RUTAS.admin,
    title: 'Administración | Al Día',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  // Cualquier ruta desconocida va al listado; si no hay sesión, el guard la manda al login.
  { path: '**', redirectTo: RUTAS.noticias },
];
