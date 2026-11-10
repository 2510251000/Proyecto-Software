import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { etiquetaCuenta, TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { Perfil } from '../../core/models/perfil.model';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { Marco } from './marco';

@Component({
  imports: [Marco],
  template: `<app-marco><main id="pantalla">Contenido</main></app-marco>`,
})
class PantallaDePrueba {}

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

describe('Marco', () => {
  const cerrarSesion = vi.fn();

  async function crear(perfil$: Observable<Perfil>): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PantallaDePrueba],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { cerrarSesion, obtenerContenidoToken: () => null } },
        { provide: PerfilService, useValue: { obtener: () => perfil$ } },
        campanaFalsa(),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PantallaDePrueba);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra el contenido de la pantalla debajo de la barra superior', async () => {
    const raiz = await crear(of(PERFIL));
    expect(raiz.querySelector('header.barra-superior nav')).not.toBeNull();
    expect(raiz.querySelector('aside')).toBeNull();
    expect(raiz.querySelector('.contenido #pantalla')?.textContent).toContain('Contenido');
  });

  it('tiene el botón «Publicar» y el logo lleva a la portada', async () => {
    const raiz = await crear(of(PERFIL));
    expect(raiz.querySelector('.publicar')?.getAttribute('href')).toBe(`/${RUTAS.publicar}`);
    expect(raiz.querySelector('.marca')?.getAttribute('href')).toBe(`/${RUTAS.noticias}`);
  });

  it('el círculo de la cuenta lleva las iniciales y se anuncia con el nombre y el nivel', async () => {
    const raiz = await crear(of(PERFIL));
    const circulo = raiz.querySelector('.barra-superior .circulo');
    expect(circulo?.textContent?.trim()).toBe('CA');
    expect(circulo?.getAttribute('aria-label')).toBe(etiquetaCuenta('Carlos Activo', 2));
  });

  it('el menú de la cuenta muestra las iniciales, el nombre, el nivel y el municipio', async () => {
    const raiz = await crear(of(PERFIL));
    expect(raiz.querySelector('.panel .iniciales')?.textContent?.trim()).toBe('CA');
    expect(raiz.querySelector('.usuario-nombre')?.textContent?.trim()).toBe('Carlos Activo');
    expect(raiz.querySelector('.usuario-detalle')?.textContent?.trim()).toBe(`${TEXTOS_NAVEGACION.nivel} 2 · Fusagasugá`);
  });

  it('sin nombre usa el correo', async () => {
    const raiz = await crear(of({ ...PERFIL, nombre: null, ciudad: null }));
    expect(raiz.querySelector('.usuario-nombre')?.textContent?.trim()).toBe(PERFIL.correo);
    expect(raiz.querySelector('.usuario-detalle')?.textContent?.trim()).toBe(`${TEXTOS_NAVEGACION.nivel} 2`);
  });

  it('si el perfil no carga, el menú y «Salir» siguen ahí', async () => {
    const raiz = await crear(throwError(() => new Error('sin red')));
    expect(raiz.querySelector('.circulo')?.getAttribute('aria-label')).toBe(TEXTOS_NAVEGACION.usuario);
    expect(raiz.querySelector('.usuario-nombre')).toBeNull();
    expect(raiz.querySelector('.salir')?.textContent).toContain(TEXTOS_NAVEGACION.salir);
  });

  it('«Salir» cierra la sesión y lleva al login', async () => {
    const raiz = await crear(of(PERFIL));
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    raiz.querySelector<HTMLButtonElement>('.salir')?.click();
    expect(cerrarSesion).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login]);
  });
});
