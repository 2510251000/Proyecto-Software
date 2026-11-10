import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  siguienteNivel: { numero: 3, nombre: 'Corresponsal Certificado', puntajeMinimo: 150, limiteNoticiasDiarias: 30 },
  ciudad: null,
  cupo: { limite: 10, publicadasHoy: 1, restantes: 9, ilimitado: false },
  fechaRegistro: '2026-10-01T10:00:00',
};

// Estas pruebas vienen de la columna derecha de la portada, donde vivía «Tu nivel».
describe('TuNivel', () => {
  let fixture: ComponentFixture<TuNivel>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  async function crear(perfil: Perfil = PERFIL): Promise<void> {
    await TestBed.configureTestingModule({ imports: [TuNivel], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(TuNivel);
    fixture.componentRef.setInput('perfil', perfil);
    await fixture.whenStable();
  }

  it('muestra el nivel, los puntos sobre la meta y cuánto falta', async () => {
    await crear();
    expect(texto('#columna-nivel')).toBe('Nivel 2');
    expect(texto('.puntos')).toBe('60 / 150 puntos');
    expect(texto('.faltan')).toBe('Faltan 90 puntos para el nivel 3.');
    expect(texto('.limite')).toBe('Publicas hasta 10 noticias al día.');
    expect(raiz().querySelector('.ver-perfil')?.getAttribute('href')).toBe(`/${RUTAS.perfil}`);
  });

  it('la barra anuncia el avance a los lectores de pantalla y llena el 40 %', async () => {
    await crear();
    const barra = raiz().querySelector('.barra');
    expect(barra?.getAttribute('role')).toBe('img');
    expect(barra?.getAttribute('aria-label')).toBe('60 de 150 puntos para el nivel 3');
    expect(raiz().querySelector<HTMLElement>('.relleno')?.style.width).toBe('40%');
  });

  it('en el nivel más alto lo dice y la barra queda llena', async () => {
    await crear({ ...PERFIL, nivelNumero: 3, puntaje: 200, siguienteNivel: null });
    expect(texto('.faltan')).toBe(TEXTOS_COLUMNA.maximo);
    expect(texto('.puntos')).toBe('200 puntos');
    expect(raiz().querySelector<HTMLElement>('.relleno')?.style.width).toBe('100%');
  });

  it('a un administrador le dice que publica sin límite', async () => {
    await crear({ ...PERFIL, cupo: { limite: 0, publicadasHoy: 0, restantes: null, ilimitado: true } });
    expect(texto('.limite')).toBe(TEXTOS_COLUMNA.ilimitado);
  });
});
