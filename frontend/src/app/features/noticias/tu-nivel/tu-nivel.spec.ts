import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ANILLO_NIVEL, TEXTOS_FICHA_NIVEL } from '../../../core/constants/dia-en-vivo.constants';
import { TEXTOS_COLUMNA } from '../../../core/constants/portada.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { TuNivel } from './tu-nivel';

const PERFIL: Perfil = {
  id: 7,
  correo: 'carlos@aldia.test',
  nombre: 'Carlos Activo',
  rol: ROLES.usuarioComun,
  nivel: 'Activo',
  nivelNumero: 2,
  puntaje: 60,
  siguienteNivel: {
    numero: 3,
    nombre: 'Corresponsal Certificado',
    puntajeMinimo: 150,
    limiteNoticiasDiarias: 30,
  },
  ciudad: null,
  cupo: { limite: 10, publicadasHoy: 1, restantes: 9, ilimitado: false },
  fechaRegistro: '2026-10-01T10:00:00',
};

const CIRCUNFERENCIA = (2 * Math.PI * ANILLO_NIVEL.radio).toFixed(1);

describe('TuNivel', () => {
  let fixture: ComponentFixture<TuNivel>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) =>
    raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const avance = () => raiz().querySelector('circle.avance')?.getAttribute('stroke-dasharray');

  async function crear(perfil: Perfil = PERFIL): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [TuNivel],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(TuNivel);
    fixture.componentRef.setInput('perfil', perfil);
    await fixture.whenStable();
  }

  it('muestra el nivel en el centro del anillo, los puntos sobre la meta y cuánto falta', async () => {
    await crear();
    expect(texto('.etiqueta')).toBe(TEXTOS_FICHA_NIVEL.etiqueta);
    expect(texto('.centro h3')).toBe('Nivel 2');
    expect(texto('.puntos')).toBe('60 de 150 puntos');
    expect(texto('.faltan')).toBe('Te faltan 90 para el nivel 3.');
    expect(raiz().querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      raiz().querySelector('h3')?.id,
    );
  });

  it('el anillo mide 168 px, se anuncia con los puntos y llena el 40 %', async () => {
    await crear();
    const anillo = raiz().querySelector('.anillo > svg');
    expect(anillo?.getAttribute('width')).toBe(String(ANILLO_NIVEL.tamano));
    expect(anillo?.getAttribute('viewBox')).toBe('0 0 120 120');
    expect(anillo?.getAttribute('role')).toBe('img');
    expect(anillo?.getAttribute('aria-label')).toBe('60 de 150 puntos para el nivel 3');
    expect(avance()).toBe(`${(Number(CIRCUNFERENCIA) * 0.4).toFixed(1)} ${CIRCUNFERENCIA}`);
    expect(raiz().querySelector('circle.pista')?.getAttribute('r')).toBe(
      String(ANILLO_NIVEL.radio),
    );
  });

  it('el sol del centro es decorativo', async () => {
    await crear();
    expect(raiz().querySelector('svg.sol')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('dice cuántas publicaciones le quedan hoy, con el número en negrita', async () => {
    await crear();
    expect(texto('.cupo')).toBe('Hoy te quedan 9 de 10 publicaciones.');
    expect(texto('.cupo strong')).toBe('9 de 10');
  });

  it('«Publicar una noticia» lleva a Publicar', async () => {
    await crear();
    const enlace = raiz().querySelector('a.publicar');
    expect(enlace?.textContent?.trim()).toBe(TEXTOS_FICHA_NIVEL.publicar);
    expect(enlace?.getAttribute('href')).toBe(`/${RUTAS.publicar}`);
  });

  it('en el nivel más alto lo dice y el anillo queda lleno', async () => {
    await crear({ ...PERFIL, nivelNumero: 3, puntaje: 200, siguienteNivel: null });
    expect(texto('.faltan')).toBe(TEXTOS_FICHA_NIVEL.maximo);
    expect(texto('.puntos')).toBe('200 puntos');
    expect(raiz().querySelector('.anillo > svg')?.getAttribute('aria-label')).toBe(
      TEXTOS_FICHA_NIVEL.maximo,
    );
    expect(avance()).toBe(`${CIRCUNFERENCIA} ${CIRCUNFERENCIA}`);
  });

  it('a un administrador le dice que publica sin límite', async () => {
    await crear({
      ...PERFIL,
      cupo: { limite: 0, publicadasHoy: 0, restantes: null, ilimitado: true },
    });
    expect(texto('.cupo')).toBe(TEXTOS_COLUMNA.ilimitado);
    expect(raiz().querySelector('.cupo strong')).toBeNull();
  });
});
