import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TEXTOS_PUBLICAR } from '../../../core/constants/pantallas.constants';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { Bienvenida } from './bienvenida';

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

describe('Bienvenida', () => {
  async function crear(perfil$: Observable<Perfil>, ciudadActiva: string | null = null): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [Bienvenida],
      providers: [provideRouter([]), { provide: PerfilService, useValue: { obtener: () => perfil$ } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Bienvenida);
    fixture.componentRef.setInput('ciudadActiva', ciudadActiva);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const texto = (raiz: HTMLElement, selector: string) => raiz.querySelector(selector)?.textContent?.trim();

  it('sin municipio elegido el titular habla de «tu municipio»', async () => {
    const raiz = await crear(of(PERFIL));
    expect(texto(raiz, 'h1')).toBe('Lo que pasa en tu municipio, contado por sus vecinos.');
    expect(texto(raiz, '.antetitulo')).toContain(TEXTOS_PORTADA.tuRegion);
  });

  it('con un municipio elegido, el titular y el antetítulo lo nombran', async () => {
    const raiz = await crear(of(PERFIL), 'Soacha');
    expect(texto(raiz, 'h1')).toBe('Lo que pasa en Soacha, contado por sus vecinos.');
    expect(texto(raiz, '.antetitulo')).toMatch(/^Soacha · /);
  });

  it('el campo y el botón llevan a Publicar, con el municipio del usuario', async () => {
    const raiz = await crear(of(PERFIL), 'Soacha');
    const enlaces = [...raiz.querySelectorAll('a')];
    expect(enlaces.map((a) => a.getAttribute('href'))).toEqual([`/${RUTAS.publicar}`, `/${RUTAS.publicar}`]);
    expect(enlaces[0].textContent?.trim()).toBe('¿Qué está pasando en Fusagasugá?');
  });

  it('muestra el cupo del día y el nivel', async () => {
    const raiz = await crear(of(PERFIL));
    expect(texto(raiz, '.cupo')).toBe('Te quedan 9 de 10 publicaciones hoy · nivel 2');
    expect(texto(raiz, '.iniciales')).toBe('CA');
  });

  it('a un administrador le dice que publica sin límite', async () => {
    const raiz = await crear(of({ ...PERFIL, cupo: { limite: 0, publicadasHoy: 0, restantes: null, ilimitado: true } }));
    expect(texto(raiz, '.cupo')).toBe(TEXTOS_PUBLICAR.cupoIlimitado);
  });

  it('si el perfil no carga, se muestra sin cupo y con «tu municipio»', async () => {
    const raiz = await crear(throwError(() => new Error('sin red')));
    expect(raiz.querySelector('.cupo')).toBeNull();
    expect(texto(raiz, 'a')).toBe('¿Qué está pasando en tu municipio?');
  });
});
