import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TEXTOS_COLUMNA } from '../../../core/constants/portada.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { Notificacion } from '../../../core/models/notificacion.model';
import { Perfil } from '../../../core/models/perfil.model';
import { avisosFalsos } from '../../../../testing/menu-falso';
import { ColumnaDerecha } from './columna-derecha';

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

function noticia(id: number, oficial: boolean, ciudad = 'Soacha'): Noticia {
  return {
    id,
    titulo: `Noticia ${id}`,
    resumen: '',
    contenido: '',
    fechaPublicacion: new Date().toISOString(),
    oficial,
    ciudad,
  };
}

function aviso(id: number, tipo: Notificacion['tipo'], leida = false, noticiaId: number | null = id): Notificacion {
  return { id, tipo, mensaje: `Aviso ${id}`, noticiaId, leida, fecha: new Date().toISOString() };
}

describe('ColumnaDerecha', () => {
  let fixture: ComponentFixture<ColumnaDerecha>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  async function crear(avisos: Notificacion[] = [], perfil: Perfil | null = PERFIL): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ColumnaDerecha],
      providers: [provideRouter([]), avisosFalsos(avisos)],
    }).compileComponents();
    fixture = TestBed.createComponent(ColumnaDerecha);
    fixture.componentRef.setInput('perfil', perfil);
    fixture.componentRef.setInput('noticias', [noticia(1, false), noticia(2, true), noticia(3, true), noticia(4, true), noticia(5, true)]);
    fixture.componentRef.setInput('ciudades', [
      { ciudad: 'Fusagasugá', cantidad: 3 },
      { ciudad: 'Soacha', cantidad: 2 },
    ]);
    await fixture.whenStable();
  }

  describe('Tu nivel', () => {
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

    it('en el nivel más alto lo dice, y sin perfil no se muestra', async () => {
      await crear([], { ...PERFIL, nivelNumero: 3, puntaje: 200, siguienteNivel: null });
      expect(texto('.faltan')).toBe(TEXTOS_COLUMNA.maximo);
      TestBed.resetTestingModule();
      await crear([], null);
      expect(raiz().querySelector('app-tu-nivel')).toBeNull();
    });
  });

  describe('Avisos cerca de ti', () => {
    it('muestra hasta dos avisos de cercanía sin leer y cuenta todos', async () => {
      await crear([
        aviso(1, 'CERCANIA'),
        aviso(2, 'COMENTARIO'),
        aviso(3, 'CERCANIA', true),
        aviso(4, 'CERCANIA'),
        aviso(5, 'CERCANIA', false, null),
      ]);
      const enlaces = [...raiz().querySelectorAll<HTMLAnchorElement>('app-avisos-cerca a')];
      expect(enlaces.map((a) => a.querySelector('.renglon-titulo')?.textContent)).toEqual(['Aviso 1', 'Aviso 4']);
      expect(enlaces[0].getAttribute('href')).toBe(`/${RUTAS.noticias}/1`);
      expect(texto('app-avisos-cerca .contador')).toBe(`3 ${TEXTOS_COLUMNA.sinLeer}`);
    });

    it('sin avisos nuevos lo dice y no muestra contador', async () => {
      await crear([aviso(1, 'CERCANIA', true)]);
      expect(texto('app-avisos-cerca .vacio')).toBe(TEXTOS_COLUMNA.sinAvisos);
      expect(raiz().querySelector('app-avisos-cerca .contador')).toBeNull();
    });
  });

  it('«De la alcaldía» muestra las tres primeras oficiales y abre la vista rápida', async () => {
    await crear();
    const abiertas: Noticia[] = [];
    fixture.componentInstance.abrir.subscribe((n) => abiertas.push(n));
    const enlaces = [...raiz().querySelectorAll<HTMLAnchorElement>('[aria-labelledby="columna-alcaldia"] a')];
    expect(enlaces.map((a) => a.querySelector('.renglon-titulo')?.textContent)).toEqual(['Noticia 2', 'Noticia 3', 'Noticia 4']);
    enlaces[0].click();
    expect(abiertas.map((n) => n.id)).toEqual([2]);
  });

  it('los municipios se eligen con un toque y el activo se puede quitar', async () => {
    await crear();
    const elegidos: (string | null)[] = [];
    fixture.componentInstance.ciudad.subscribe((c) => elegidos.push(c));
    const chips = () => [...raiz().querySelectorAll<HTMLButtonElement>('.chip')];
    expect(chips().map((c) => c.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      `Fusagasugá 3 ${TEXTOS_COLUMNA.noticias}`,
      `Soacha 2 ${TEXTOS_COLUMNA.noticias}`,
    ]);
    chips()[1].click();
    fixture.componentRef.setInput('ciudadActiva', 'Soacha');
    await fixture.whenStable();
    expect(chips()[1].getAttribute('aria-pressed')).toBe('true');
    chips()[1].click();
    expect(elegidos).toEqual(['Soacha', null]);
  });
});
