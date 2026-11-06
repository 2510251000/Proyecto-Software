import {
  HISTORIAS_DE_RESPALDO,
  MAXIMO_HISTORIAS,
  NOTICIAS_CERCA_DE_TI,
  SALUDOS,
} from '../../core/constants/hoy.constants';
import { noticiaFalsa } from '../../../testing/noticia-falsa';
import {
  cercaDeTi,
  iniciales,
  mismoDiaLocal,
  saludoCompleto,
  saludoSegunHora,
  seleccionarHistorias,
} from './seleccion-historias';

const AHORA = new Date(2026, 10, 4, 15, 0, 0);

function conHora(hora: number, minuto = 0): Date {
  return new Date(2026, 10, 4, hora, minuto);
}

describe('selección de historias de «Hoy»', () => {
  it('compara fechas por el día local', () => {
    expect(mismoDiaLocal(new Date(2026, 10, 4, 0, 1), new Date(2026, 10, 4, 23, 59))).toBe(true);
    expect(mismoDiaLocal(new Date(2026, 10, 3, 23, 59), new Date(2026, 10, 4, 0, 0))).toBe(false);
  });

  it('se queda con las de hoy, de la más reciente a la más antigua', () => {
    const lista = [
      noticiaFalsa({ id: 1, fechaPublicacion: new Date(2026, 10, 4, 8).toISOString() }),
      noticiaFalsa({ id: 2, fechaPublicacion: new Date(2026, 10, 3, 20).toISOString() }),
      noticiaFalsa({ id: 3, fechaPublicacion: new Date(2026, 10, 4, 12).toISOString() }),
    ];
    const { historias, sonDeHoy } = seleccionarHistorias(lista, AHORA);
    expect(sonDeHoy).toBe(true);
    expect(historias.map((n) => n.id)).toEqual([3, 1]);
  });

  it('muestra como máximo el número de historias de la constante', () => {
    const lista = Array.from({ length: MAXIMO_HISTORIAS + 4 }, (_, i) =>
      noticiaFalsa({ id: i + 1, fechaPublicacion: new Date(2026, 10, 4, 1, i).toISOString() }),
    );
    expect(seleccionarHistorias(lista, AHORA).historias).toHaveLength(MAXIMO_HISTORIAS);
  });

  it('si hoy no hay ninguna, usa las más recientes como respaldo', () => {
    const lista = Array.from({ length: 8 }, (_, i) =>
      noticiaFalsa({ id: i + 1, fechaPublicacion: new Date(2026, 10, 1, i).toISOString() }),
    );
    const { historias, sonDeHoy } = seleccionarHistorias(lista, AHORA);
    expect(sonDeHoy).toBe(false);
    expect(historias).toHaveLength(HISTORIAS_DE_RESPALDO);
    expect(historias.map((n) => n.id)).toEqual([8, 7, 6, 5, 4]);
  });

  it('sin noticias devuelve una lista vacía', () => {
    expect(seleccionarHistorias([], AHORA)).toEqual({ historias: [], sonDeHoy: false });
  });

  it('«Cerca de ti» toma las más recientes de otros municipios', () => {
    const propias = [noticiaFalsa({ id: 1, ciudadId: 1 })];
    const todas = [
      ...propias,
      noticiaFalsa({ id: 2, ciudadId: 2, fechaPublicacion: '2026-11-01T10:00:00' }),
      noticiaFalsa({ id: 3, ciudadId: 3, fechaPublicacion: '2026-11-03T10:00:00' }),
      noticiaFalsa({ id: 4, ciudadId: 1, fechaPublicacion: '2026-11-04T10:00:00' }),
      noticiaFalsa({ id: 5, ciudadId: 2, fechaPublicacion: '2026-11-02T10:00:00' }),
      noticiaFalsa({ id: 6, ciudadId: 4, fechaPublicacion: '2026-10-30T10:00:00' }),
    ];
    const resultado = cercaDeTi(todas, 1, propias);
    expect(resultado).toHaveLength(NOTICIAS_CERCA_DE_TI);
    expect(resultado.map((n) => n.id)).toEqual([3, 5, 2]);
  });

  it('sin ciudad, «Cerca de ti» toma las que no salieron en las historias', () => {
    const mostradas = [noticiaFalsa({ id: 1 })];
    const todas = [...mostradas, noticiaFalsa({ id: 2, ciudadId: 1 })];
    expect(cercaDeTi(todas, null, mostradas).map((n) => n.id)).toEqual([2]);
  });
});

describe('saludo según la hora', () => {
  it.each([
    [5, 0, SALUDOS.manana],
    [11, 59, SALUDOS.manana],
    [12, 0, SALUDOS.tarde],
    [18, 59, SALUDOS.tarde],
    [19, 0, SALUDOS.noche],
    [23, 30, SALUDOS.noche],
    [0, 0, SALUDOS.noche],
    [4, 59, SALUDOS.noche],
  ])('a las %i:%i dice «%s»', (hora, minuto, esperado) => {
    expect(saludoSegunHora(conHora(hora, minuto))).toBe(esperado);
  });

  it('agrega el primer nombre si lo hay', () => {
    expect(saludoCompleto(conHora(8), 'Laura Méndez')).toBe(`${SALUDOS.manana}, Laura`);
    expect(saludoCompleto(conHora(8), null)).toBe(SALUDOS.manana);
    expect(saludoCompleto(conHora(8), '   ')).toBe(SALUDOS.manana);
  });

  it('saca las iniciales del autor', () => {
    expect(iniciales('Laura Méndez Rojas')).toBe('LM');
    expect(iniciales('al día')).toBe('AD');
    expect(iniciales('Vecina')).toBe('V');
  });
});
