import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { routes } from './app.routes';
import { AdminService } from './core/services/admin.service';
import { AuthService } from './core/services/auth.service';
import { NoticiaService } from './core/services/noticia.service';
import { Rol, ROLES } from './core/constants/roles.constants';
import { campanaFalsa } from '../testing/menu-falso';

describe('rutas de la aplicación', () => {
  let sesionVigente: boolean;
  let rolActual: Rol;

  beforeEach(() => {
    sesionVigente = false;
    rolActual = ROLES.usuarioComun;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: AuthService,
          useValue: {
            obtenerToken: () => (sesionVigente ? 'token' : null),
            haySesionVigente: () => sesionVigente,
            cerrarSesion: () => undefined,
            obtenerContenidoToken: () => (sesionVigente ? { rol: rolActual } : null),
          },
        },
        campanaFalsa(),
        {
          provide: NoticiaService,
          useValue: { listar: () => of([]), obtener: () => throwError(() => ({ estado: 404, mensaje: '' })) },
        },
        { provide: AdminService, useValue: { noticias: () => of([]), usuarios: () => of([]) } },
      ],
    });
  });

  async function ir(url: string): Promise<string> {
    const arnes = await RouterTestingHarness.create();
    await arnes.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  describe('sin sesión', () => {
    it.each(['/', '/noticias', '/ruta-que-no-existe'])('%s termina en el login', async (url) => {
      expect(await ir(url)).toBe('/login');
    });

    it.each(['/publicar', '/perfil', '/notificaciones', '/admin'])('%s pide sesión', async (url) => {
      expect(await ir(url)).toBe('/login');
    });

    it('la página de una noticia también pide sesión', async () => {
      expect(await ir('/noticias/5')).toBe('/login');
    });

    it.each(['/login', '/registro'])('%s es de acceso libre', async (url) => {
      expect(await ir(url)).toBe(url);
    });
  });

  describe('con sesión', () => {
    beforeEach(() => (sesionVigente = true));

    it.each(['/', '/noticias', '/ruta-que-no-existe'])('%s termina en el listado', async (url) => {
      expect(await ir(url)).toBe('/noticias');
    });

    it('/noticias/5 abre la página de esa noticia', async () => {
      expect(await ir('/noticias/5')).toBe('/noticias/5');
    });

    it('un usuario común que entra a /admin vuelve al listado', async () => {
      expect(await ir('/admin')).toBe('/noticias');
    });

    it('un administrador entra al panel', async () => {
      rolActual = ROLES.administrador;
      expect(await ir('/admin')).toBe('/admin');
    });
  });
});
