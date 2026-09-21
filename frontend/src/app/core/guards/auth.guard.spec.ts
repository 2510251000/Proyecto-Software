import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { crearAlmacenamientoFalso } from '../../../testing/almacenamiento-falso';
import { ahoraEnSegundos, crearToken } from '../../../testing/token-falso';
import { CLAVE_TOKEN } from '../constants/almacenamiento.constants';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  function ejecutar(): boolean | UrlTree {
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return resultado as boolean | UrlTree;
  }

  beforeEach(() => {
    vi.stubGlobal('localStorage', crearAlmacenamientoFalso());
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('deja pasar con un token vigente', () => {
    localStorage.setItem(CLAVE_TOKEN, crearToken(ahoraEnSegundos() + 3600));
    expect(ejecutar()).toBe(true);
  });

  it('sin token redirige al login sin mensaje', () => {
    const resultado = ejecutar() as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/login');
  });

  it('con token expirado redirige al login con el motivo y borra el token', () => {
    localStorage.setItem(CLAVE_TOKEN, crearToken(ahoraEnSegundos() - 10));
    const resultado = ejecutar() as UrlTree;
    expect(router.serializeUrl(resultado)).toBe('/login?motivo=sesion-expirada');
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });
});
