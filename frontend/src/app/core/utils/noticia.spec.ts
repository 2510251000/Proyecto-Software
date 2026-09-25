import { Noticia } from '../models/noticia.model';
import { esUltimaHora, minutosDeLectura, tiempoRelativo } from './noticia';

const AHORA = new Date('2026-09-25T12:00:00').getTime();
const HORA = 3_600_000;

function palabras(cantidad: number): string {
  return Array.from({ length: cantidad }, () => 'palabra').join(' ');
}

function noticia(cambios: Partial<Noticia>): Noticia {
  return {
    id: 1,
    titulo: 'Título',
    resumen: 'Resumen',
    contenido: 'Contenido',
    fechaPublicacion: new Date(AHORA - HORA).toISOString(),
    oficial: true,
    ciudad: 'Soacha',
    ...cambios,
  };
}

describe('minutosDeLectura', () => {
  it('divide las palabras entre 200 y redondea hacia arriba', () => {
    expect(minutosDeLectura(palabras(200))).toBe(1);
    expect(minutosDeLectura(palabras(201))).toBe(2);
    expect(minutosDeLectura(palabras(600))).toBe(3);
  });

  it('nunca baja de 1 minuto', () => {
    expect(minutosDeLectura('')).toBe(1);
    expect(minutosDeLectura('   ')).toBe(1);
    expect(minutosDeLectura('Una')).toBe(1);
  });

  it('no cuenta los espacios de más ni los saltos de línea', () => {
    expect(minutosDeLectura(`  ${palabras(150)}\n\n  ${palabras(100)}  `)).toBe(2);
  });
});

describe('tiempoRelativo', () => {
  it('usa minutos, horas o días según la distancia', () => {
    expect(tiempoRelativo(new Date(AHORA - 5 * 60_000).toISOString(), AHORA)).toBe('hace 5 minutos');
    expect(tiempoRelativo(new Date(AHORA - 2 * HORA).toISOString(), AHORA)).toBe('hace 2 horas');
    expect(tiempoRelativo(new Date(AHORA - 24 * HORA).toISOString(), AHORA)).toBe('ayer');
    expect(tiempoRelativo(new Date(AHORA - 72 * HORA).toISOString(), AHORA)).toBe('hace 3 días');
  });

  it('devuelve vacío si la fecha no es válida', () => {
    expect(tiempoRelativo('no-es-fecha', AHORA)).toBe('');
  });
});

describe('esUltimaHora', () => {
  it('es última hora si es oficial y tiene menos de tres horas', () => {
    expect(esUltimaHora(noticia({}), AHORA)).toBe(true);
  });

  it('no lo es a partir de las tres horas', () => {
    const vieja = noticia({ fechaPublicacion: new Date(AHORA - 3 * HORA).toISOString() });
    expect(esUltimaHora(vieja, AHORA)).toBe(false);
  });

  it('no lo es si viene de la comunidad o la fecha no es válida', () => {
    expect(esUltimaHora(noticia({ oficial: false }), AHORA)).toBe(false);
    expect(esUltimaHora(noticia({ fechaPublicacion: 'no-es-fecha' }), AHORA)).toBe(false);
  });
});
