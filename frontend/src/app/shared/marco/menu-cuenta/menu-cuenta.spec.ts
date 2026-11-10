import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { etiquetaCuenta, TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { AuthService } from '../../../core/services/auth.service';
import { MenuCuenta } from './menu-cuenta';

const PERFIL: Perfil = {
  id: 7,
  correo: 'carlos@aldia.test',
  nombre: 'Carlos Activo',
  rol: ROLES.usuarioComun,
  nivel: 'Activo',
  nivelNumero: 2,
  puntaje: 60,
  siguienteNivel: null,
  ciudad: { id: 3, nombre: 'Fusagasugá', departamento: 'Cundinamarca', latitud: null, longitud: null },
  cupo: { limite: 10, publicadasHoy: 1, restantes: 9, ilimitado: false },
  fechaRegistro: '2026-10-01T10:00:00',
};

describe('MenuCuenta', () => {
  const cerrarSesion = vi.fn();

  async function crear(perfil: Perfil | null = PERFIL) {
    await TestBed.configureTestingModule({
      imports: [MenuCuenta],
      providers: [provideRouter([]), { provide: AuthService, useValue: { cerrarSesion } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(MenuCuenta);
    fixture.componentRef.setInput('perfil', perfil);
    // En el documento, para que el foco y los clics de afuera se comporten como en el navegador.
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;
    const boton = raiz.querySelector<HTMLButtonElement>('.circulo')!;
    const panel = raiz.querySelector<HTMLElement>('.panel')!;
    const abrir = async () => {
      boton.click();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const estable = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, raiz, boton, panel, abrir, estable };
  }

  afterEach(() => {
    document.body.querySelectorAll('[ng-version]').forEach((nodo) => nodo.remove());
    cerrarSesion.mockClear();
  });

  it('empieza cerrado y el botón dice qué controla', async () => {
    const { boton, panel } = await crear();
    expect(panel.hidden).toBe(true);
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(boton.getAttribute('aria-controls')).toBe(panel.id);
    expect(boton.getAttribute('aria-label')).toBe(etiquetaCuenta('Carlos Activo', 2));
    expect(boton.textContent?.trim()).toBe('CA');
  });

  it('al tocar el círculo abre el menú con el nombre, el nivel, «Mi perfil» y «Salir»', async () => {
    const { boton, panel, abrir } = await crear();
    await abrir();
    expect(panel.hidden).toBe(false);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(panel.querySelector('.usuario-nombre')?.textContent?.trim()).toBe('Carlos Activo');
    expect(panel.querySelector('.usuario-detalle')?.textContent?.trim()).toBe(`${TEXTOS_NAVEGACION.nivel} 2 · Fusagasugá`);
    const perfil = panel.querySelector('a.ir-al-perfil');
    expect(perfil?.getAttribute('href')).toBe(`/${RUTAS.perfil}`);
    expect(perfil?.textContent?.trim()).toBe(TEXTOS_NAVEGACION.perfil);
    expect(panel.querySelector('.salir')?.textContent).toContain(TEXTOS_NAVEGACION.salir);
  });

  it('otro toque en el círculo lo cierra', async () => {
    const { panel, abrir } = await crear();
    await abrir();
    await abrir();
    expect(panel.hidden).toBe(true);
  });

  it('con Escape se cierra y el foco vuelve al círculo', async () => {
    const { boton, panel, abrir, estable } = await crear();
    await abrir();
    const salir = panel.querySelector<HTMLButtonElement>('.salir')!;
    salir.focus();
    salir.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await estable();
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(boton);
  });

  it('Escape con el menú cerrado no mueve el foco', async () => {
    const { boton, raiz, estable } = await crear();
    raiz.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await estable();
    expect(document.activeElement).not.toBe(boton);
  });

  it('un clic afuera lo cierra; un clic adentro no', async () => {
    const { panel, abrir, estable } = await crear();
    await abrir();
    panel.click();
    await estable();
    expect(panel.hidden).toBe(false);

    document.body.click();
    await estable();
    expect(panel.hidden).toBe(true);
  });

  it('al ir a «Mi perfil» el menú se cierra', async () => {
    const { panel, abrir, estable } = await crear();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await abrir();
    panel.querySelector<HTMLAnchorElement>('a.ir-al-perfil')?.click();
    await estable();
    expect(panel.hidden).toBe(true);
  });

  it('«Salir» cierra la sesión y lleva al login', async () => {
    const { panel, abrir } = await crear();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await abrir();
    panel.querySelector<HTMLButtonElement>('.salir')?.click();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login]);
  });

  it('sin perfil muestra un ícono y se anuncia solo como «Tu cuenta»', async () => {
    const { boton } = await crear(null);
    expect(boton.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(boton.getAttribute('aria-label')).toBe(TEXTOS_NAVEGACION.usuario);
  });

  it('sin nombre usa el correo', async () => {
    const { boton } = await crear({ ...PERFIL, nombre: null });
    expect(boton.getAttribute('aria-label')).toBe(etiquetaCuenta(PERFIL.correo, 2));
  });
});
