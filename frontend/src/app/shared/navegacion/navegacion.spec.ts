import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { Rol, ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { AuthService } from '../../core/services/auth.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { Navegacion } from './navegacion';

describe('Navegacion', () => {
  async function crear(rol: Rol, noLeidas = 0): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [Navegacion],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { obtenerContenidoToken: () => ({ rol }) } },
        campanaFalsa(noLeidas),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Navegacion);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('un usuario común ve portada, mapa, avisos y perfil, pero no el panel', async () => {
    const menu = await crear(ROLES.usuarioComun);
    const enlaces = [...menu.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(enlaces).toEqual([
      `/${RUTAS.noticias}`,
      `/${RUTAS.mapa}`,
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

  it('sin avisos por leer no muestra el contador', async () => {
    const menu = await crear(ROLES.usuarioComun);
    expect(menu.querySelector('.contador')).toBeNull();
  });

  it('los destinos van con su nombre, sin íconos, dentro de un menú con nombre', async () => {
    const menu = await crear(ROLES.usuarioComun);
    expect(menu.querySelector('nav')?.getAttribute('aria-label')).toBe(TEXTOS_NAVEGACION.menu);
    expect(menu.querySelectorAll('svg')).toHaveLength(0);
    expect([...menu.querySelectorAll('a')].map((a) => a.textContent?.trim())).toEqual([
      TEXTOS_NAVEGACION.portada,
      TEXTOS_NAVEGACION.mapa,
      TEXTOS_NAVEGACION.notificaciones,
      TEXTOS_NAVEGACION.perfil,
    ]);
  });

  it('marca el destino de la pantalla actual con aria-current', async () => {
    @Component({ template: '' })
    class PantallaVacia {}

    await TestBed.configureTestingModule({
      imports: [Navegacion],
      providers: [
        provideRouter([{ path: RUTAS.mapa, component: PantallaVacia }]),
        { provide: AuthService, useValue: { obtenerContenidoToken: () => ({ rol: ROLES.usuarioComun }) } },
        campanaFalsa(),
      ],
    }).compileComponents();
    await TestBed.inject(Router).navigate(['/', RUTAS.mapa]);
    const fixture = TestBed.createComponent(Navegacion);
    await fixture.whenStable();
    fixture.detectChanges();
    const menu = fixture.nativeElement as HTMLElement;

    const actual = menu.querySelector('a[aria-current="page"]');
    expect(actual?.getAttribute('href')).toBe(`/${RUTAS.mapa}`);
    expect(actual?.classList).toContain('activo');
    expect(menu.querySelectorAll('a[aria-current]')).toHaveLength(1);
  });
});
