import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { NoticiaService } from './core/services/noticia.service';

describe('rutas de la aplicación', () => {
  let sesionVigente: boolean;

  beforeEach(() => {
    sesionVigente = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: AuthService,
          useValue: {
            obtenerToken: () => (sesionVigente ? 'token' : null),
            haySesionVigente: () => sesionVigente,
            cerrarSesion: () => undefined,
          },
        },
        { provide: NoticiaService, useValue: { listar: () => of([]) } },
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

    it.each(['/login', '/registro'])('%s es de acceso libre', async (url) => {
      expect(await ir(url)).toBe(url);
    });
  });

  describe('con sesión', () => {
    beforeEach(() => (sesionVigente = true));

    it.each(['/', '/noticias', '/ruta-que-no-existe'])('%s termina en el listado', async (url) => {
      expect(await ir(url)).toBe('/noticias');
    });
  });
});
