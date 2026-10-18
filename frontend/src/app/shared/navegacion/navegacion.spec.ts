import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { Rol, ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { AuthService } from '../../core/services/auth.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { Navegacion } from './navegacion';

describe('Navegacion', () => {
  const cerrarSesion = vi.fn();

  async function crear(rol: Rol, noLeidas = 0): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [Navegacion],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { cerrarSesion, obtenerContenidoToken: () => ({ rol }) } },
        campanaFalsa(noLeidas),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Navegacion);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('un usuario común ve portada, publicar, notificaciones y perfil, pero no el panel', async () => {
    const menu = await crear(ROLES.usuarioComun);
    const enlaces = [...menu.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(enlaces).toEqual([
      `/${RUTAS.noticias}`,
      `/${RUTAS.publicar}`,
      `/${RUTAS.notificaciones}`,
      `/${RUTAS.perfil}`,
    ]);
  });

  it('un administrador también ve el panel de administración', async () => {
    const menu = await crear(ROLES.administrador);
    expect(menu.querySelector(`a[href="/${RUTAS.admin}"]`)?.textContent).toContain(TEXTOS_NAVEGACION.admin);
  });

  it('muestra cuántas notificaciones hay sin leer', async () => {
    const menu = await crear(ROLES.usuarioComun, 3);
    expect(menu.querySelector('.contador')?.textContent).toContain('3');
  });

  it('«Salir» cierra la sesión y lleva al login', async () => {
    const menu = await crear(ROLES.usuarioComun);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    menu.querySelector<HTMLButtonElement>('button')?.click();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login]);
  });
});
