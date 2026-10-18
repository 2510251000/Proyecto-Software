import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ROLES } from '../constants/roles.constants';
import { RUTAS } from '../constants/rutas.constants';
import { ContenidoToken } from '../models/contenido-token.model';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  function ejecutar(contenido: ContenidoToken | null): boolean | UrlTree {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { obtenerContenidoToken: () => contenido } }],
    });
    const resultado = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    if (typeof resultado === 'boolean' || resultado instanceof UrlTree) {
      return resultado;
    }
    throw new Error('El guard debe responder de inmediato');
  }

  const token = (rol: ContenidoToken['rol']): ContenidoToken => ({ sub: 'a@b.co', rol, id: 1, iat: 0, exp: 0 });

  it('deja pasar a un administrador', () => {
    expect(ejecutar(token(ROLES.administrador))).toBe(true);
  });

  it('manda al listado a un usuario común', () => {
    const resultado = ejecutar(token(ROLES.usuarioComun));
    expect(resultado instanceof UrlTree && resultado.toString()).toBe(`/${RUTAS.noticias}`);
  });
});
