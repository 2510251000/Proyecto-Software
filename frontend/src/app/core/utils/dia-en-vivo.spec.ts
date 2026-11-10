import { ARCO, HORAS_DEL_DIA, MAPA_MOSAICO, MARCAS_MAXIMAS } from '../constants/dia-en-vivo.constants';
import { Noticia } from '../models/noticia.model';
import {
  diaAnterior,
  diaDe,
  diaInicial,
  diaSiguiente,
  diasConNoticias,
  fechaLegible,
  horaDecimal,
  horaEnArco,
  horaInicial,
  horaLegible,
  marcasDelDia,
  momentoDe,
  noticiaDeLaHora,
  noticiasDelDia,
  posicionEnArco,
  puntosDelMapa,
  temaDe,
} from './dia-en-vivo';

const HOY = '2026-11-09';
const AYER = '2026-11-08';

let siguienteId = 1;

/** Una noticia publicada ese día a esa hora de Colombia («16:20»). */
function noticia(dia: string, hora: string, cambios: Partial<Noticia> = {}): Noticia {
  return {
    id: siguienteId++,
    titulo: `Noticia de las ${hora}`,
    resumen: 'Resumen',
    contenido: 'Contenido',
    fechaPublicacion: `${dia}T${hora}:00-05:00`,
    oficial: true,
    ciudad: 'Fusagasugá',
    ...cambios,
  };
}

function titulos(noticias: readonly { titulo: string }[]): string[] {
  return noticias.map((n) => n.titulo);
}

describe('horaDecimal', () => {
  it('lee la hora de Colombia como número decimal', () => {
    expect(horaDecimal('2026-11-09T17:40:00-05:00')).toBeCloseTo(17.667, 3);
    expect(horaDecimal('2026-11-09T06:00:00-05:00')).toBe(6);
  });

  it('convierte desde otra zona horaria: las 22:40 UTC son las 5:40 p. m. en Colombia', () => {
    expect(horaDecimal('2026-11-09T22:40:00Z')).toBeCloseTo(17.667, 3);
  });

  it('la medianoche es la hora 0, no la 24', () => {
    expect(horaDecimal('2026-11-09T00:05:00-05:00')).toBeCloseTo(0.083, 3);
  });

  it('ignora los segundos', () => {
    expect(horaDecimal('2026-11-09T10:30:59-05:00')).toBe(10.5);
  });

  it('acepta milisegundos y Date', () => {
    const fecha = new Date('2026-11-09T10:30:00-05:00');
    expect(horaDecimal(fecha)).toBe(10.5);
    expect(horaDecimal(fecha.getTime())).toBe(10.5);
  });

  it('devuelve null si la fecha no es válida', () => {
    expect(horaDecimal('no es una fecha')).toBeNull();
  });
});

describe('diaDe', () => {
  it('da el día de Colombia', () => {
    expect(diaDe('2026-11-09T10:30:00-05:00')).toBe(HOY);
  });

  it('las 2:00 UTC del 10 todavía son el 9 en Colombia', () => {
    expect(diaDe('2026-11-10T02:00:00Z')).toBe(HOY);
  });

  it('devuelve null si la fecha no es válida', () => {
    expect(diaDe('')).toBeNull();
  });
});

describe('momentoDe y temaDe', () => {
  it('reparte el día en amanecer, día, atardecer y noche', () => {
    expect(momentoDe(6)).toBe('amanecer');
    expect(momentoDe(7.49)).toBe('amanecer');
    expect(momentoDe(7.5)).toBe('dia');
    expect(momentoDe(15.99)).toBe('dia');
    expect(momentoDe(16)).toBe('atardecer');
    expect(momentoDe(17.49)).toBe('atardecer');
    expect(momentoDe(17.5)).toBe('noche');
    expect(momentoDe(23)).toBe('noche');
  });

  it('la madrugada también es noche', () => {
    expect(momentoDe(0)).toBe('noche');
    expect(momentoDe(5.99)).toBe('noche');
  });

  it('solo la noche lleva tema de noche', () => {
    expect(temaDe('amanecer')).toBe('dia');
    expect(temaDe('dia')).toBe('dia');
    expect(temaDe('atardecer')).toBe('dia');
    expect(temaDe('noche')).toBe('noche');
  });
});

describe('posicionEnArco', () => {
  it('las 6 a. m. y las 6 p. m. quedan en el horizonte, en los extremos', () => {
    expect(posicionEnArco(6)).toEqual({ x: ARCO.xInicio, y: ARCO.tope + ARCO.alto });
    expect(posicionEnArco(18)).toEqual({ x: ARCO.xInicio + ARCO.ancho, y: ARCO.tope + ARCO.alto });
  });

  it('el mediodía queda en el centro y en lo más alto', () => {
    expect(posicionEnArco(12)).toEqual({ x: 50, y: ARCO.tope });
  });

  it('las horas de guía quedan en 29 % y 71 %', () => {
    expect(posicionEnArco(9).x).toBeCloseTo(29);
    expect(posicionEnArco(15).x).toBeCloseTo(71);
    expect(posicionEnArco(9).y).toBeCloseTo(posicionEnArco(15).y);
  });

  it('fuera del arco el sol se queda en el extremo', () => {
    expect(horaEnArco(3)).toBe(HORAS_DEL_DIA.amanecer);
    expect(horaEnArco(21.5)).toBe(HORAS_DEL_DIA.ocaso);
    expect(posicionEnArco(21.5)).toEqual(posicionEnArco(18));
    expect(posicionEnArco(2)).toEqual(posicionEnArco(6));
  });
});

describe('horaLegible', () => {
  it('escribe la hora en formato de 12 horas', () => {
    expect(horaLegible(16 + 20 / 60)).toBe('4:20 p. m.');
    expect(horaLegible(6.5)).toBe('6:30 a. m.');
    expect(horaLegible(10.5)).toBe('10:30 a. m.');
  });

  it('el mediodía y la medianoche son las 12', () => {
    expect(horaLegible(12)).toBe('12:00 p. m.');
    expect(horaLegible(0.083)).toBe('12:05 a. m.');
  });

  it('redondea al minuto', () => {
    expect(horaLegible(17.667)).toBe('5:40 p. m.');
  });
});

describe('fechaLegible', () => {
  it('escribe el día de la semana y la fecha, con mayúscula', () => {
    expect(fechaLegible(HOY)).toBe('Lunes 9 de noviembre');
  });

  it('devuelve vacío si el día no es válido', () => {
    expect(fechaLegible('no')).toBe('');
  });
});

describe('noticiasDelDia y diasConNoticias', () => {
  const lista = [
    noticia(HOY, '16:20'),
    noticia(AYER, '09:00'),
    noticia(HOY, '06:40'),
    noticia(HOY, '10:30'),
    noticia(HOY, '12:00', { fechaPublicacion: 'rota' }),
  ];

  it('deja solo las de ese día, de la más temprana a la más tardía', () => {
    expect(titulos(noticiasDelDia(lista, HOY))).toEqual([
      'Noticia de las 06:40',
      'Noticia de las 10:30',
      'Noticia de las 16:20',
    ]);
  });

  it('no cambia la lista que recibe', () => {
    const copia = [...lista];
    noticiasDelDia(lista, HOY);
    expect(lista).toEqual(copia);
  });

  it('lista los días con noticias, del más reciente al más viejo, sin fechas rotas', () => {
    expect(diasConNoticias(lista)).toEqual([HOY, AYER]);
  });
});

describe('diaInicial, diaAnterior y diaSiguiente', () => {
  const lista = [noticia('2026-11-05', '08:00'), noticia('2026-11-07', '08:00'), noticia(AYER, '08:00')];

  it('es hoy si hoy tiene noticias', () => {
    expect(diaInicial([...lista, noticia(HOY, '07:00')], HOY)).toBe(HOY);
  });

  it('si hoy no tiene noticias, es el día más reciente que sí tenga', () => {
    expect(diaInicial(lista, HOY)).toBe(AYER);
  });

  it('sin noticias, es hoy', () => {
    expect(diaInicial([], HOY)).toBe(HOY);
  });

  it('el día anterior es el más cercano con noticias; null si no hay más viejos', () => {
    expect(diaAnterior(lista, HOY)).toBe(AYER);
    expect(diaAnterior(lista, '2026-11-07')).toBe('2026-11-05');
    expect(diaAnterior(lista, '2026-11-05')).toBeNull();
  });

  it('el día siguiente es el más cercano con noticias y nunca pasa de hoy', () => {
    expect(diaSiguiente(lista, '2026-11-05', HOY)).toBe('2026-11-07');
    expect(diaSiguiente(lista, AYER, HOY)).toBe(HOY);
    expect(diaSiguiente(lista, HOY, HOY)).toBeNull();
  });
});

describe('horaInicial', () => {
  const lista = [noticia(AYER, '09:00'), noticia(AYER, '14:45'), noticia(HOY, '08:00')];

  it('hoy se abre en la hora actual', () => {
    expect(horaInicial(lista, HOY, HOY, 11.25)).toBe(11.25);
  });

  it('un día pasado se abre en la hora de su última noticia', () => {
    expect(horaInicial(lista, AYER, HOY, 11.25)).toBe(14.75);
  });

  it('un día pasado sin noticias se abre a la puesta del sol', () => {
    expect(horaInicial(lista, '2026-11-01', HOY, 11.25)).toBe(HORAS_DEL_DIA.ocaso);
  });
});

describe('noticiaDeLaHora', () => {
  const lista = [noticia(HOY, '16:20'), noticia(HOY, '06:40'), noticia(HOY, '10:30'), noticia(AYER, '20:00')];

  it('es la última publicada a esa hora o antes', () => {
    expect(noticiaDeLaHora(lista, HOY, 12)?.titulo).toBe('Noticia de las 10:30');
    expect(noticiaDeLaHora(lista, HOY, 17.67)?.titulo).toBe('Noticia de las 16:20');
  });

  it('a la hora exacta de una noticia, es esa noticia', () => {
    expect(noticiaDeLaHora(lista, HOY, 10.5)?.titulo).toBe('Noticia de las 10:30');
    expect(noticiaDeLaHora(lista, HOY, (16 * 60 + 20) / 60)?.titulo).toBe('Noticia de las 16:20');
  });

  it('si no hay ninguna antes, es la primera del día', () => {
    expect(noticiaDeLaHora(lista, HOY, 6)?.titulo).toBe('Noticia de las 06:40');
  });

  it('las de la noche también cuentan', () => {
    expect(noticiaDeLaHora(lista, AYER, 21)?.titulo).toBe('Noticia de las 20:00');
  });

  it('si el día no tiene noticias, es la primera de la lista', () => {
    expect(noticiaDeLaHora(lista, '2026-11-01', 12)?.titulo).toBe('Noticia de las 16:20');
  });

  it('sin noticias no hay nada que mostrar', () => {
    expect(noticiaDeLaHora([], HOY, 12)).toBeNull();
  });
});

describe('marcasDelDia', () => {
  it('cuelga cada noticia en su hora, de la más temprana a la más tardía', () => {
    const marcas = marcasDelDia([noticia(HOY, '12:00'), noticia(HOY, '09:00'), noticia(AYER, '10:00')], HOY);
    expect(marcas.map((m) => m.hora)).toEqual([9, 12]);
    expect(marcas[1].x).toBe(50);
    expect(marcas[1].y).toBe(ARCO.tope);
    expect(marcas[0].noticia.titulo).toBe('Noticia de las 09:00');
  });

  it('deja sin marca las de la madrugada y las de la noche', () => {
    const lista = [noticia(HOY, '05:59'), noticia(HOY, '06:00'), noticia(HOY, '18:00'), noticia(HOY, '18:01')];
    expect(marcasDelDia(lista, HOY).map((m) => m.hora)).toEqual([6, 18]);
  });

  it('si dos quedan muy juntas, muestra solo la más reciente', () => {
    // 10 minutos son 1.2 % del ancho: menos del 3 % mínimo.
    const lista = [noticia(HOY, '10:00'), noticia(HOY, '10:10'), noticia(HOY, '14:00')];
    expect(titulos(marcasDelDia(lista, HOY).map((m) => m.noticia))).toEqual([
      'Noticia de las 10:10',
      'Noticia de las 14:00',
    ]);
  });

  it('muestra como mucho ocho: las más recientes', () => {
    const horas = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16'];
    const marcas = marcasDelDia(
      horas.map((hora) => noticia(HOY, `${hora}:00`)),
      HOY,
    );
    expect(marcas).toHaveLength(MARCAS_MAXIMAS);
    expect(marcas[0].hora).toBe(9);
    expect(marcas.at(-1)?.hora).toBe(16);
  });

  it('un día sin noticias no tiene marcas', () => {
    expect(marcasDelDia([], HOY)).toEqual([]);
  });
});

describe('puntosDelMapa', () => {
  const fusa = { ciudad: 'Fusagasugá', latitud: 4.34, longitud: -74.36 };
  const soacha = { ciudad: 'Soacha', latitud: 4.58, longitud: -74.22 };
  const zipa = { ciudad: 'Zipaquirá', latitud: 5.02, longitud: -74.0 };

  const lista = [
    noticia(HOY, '08:00', fusa),
    noticia(HOY, '09:00', fusa),
    noticia(HOY, '10:00', fusa),
    noticia(HOY, '11:00', soacha),
    noticia(HOY, '12:00', zipa),
    noticia(HOY, '13:00', zipa),
    noticia(HOY, '14:00', { ciudad: 'Chía' }),
  ];
  const conteo = [
    { ciudad: 'Chía', cantidad: 1 },
    { ciudad: 'Fusagasugá', cantidad: 3 },
    { ciudad: 'Soacha', cantidad: 1 },
    { ciudad: 'Zipaquirá', cantidad: 2 },
  ];

  it('pone el oeste a la izquierda y el norte arriba, dentro del margen', () => {
    const { puntos } = puntosDelMapa(lista, conteo);
    const de = (ciudad: string) => puntos.find((p) => p.ciudad === ciudad);

    expect(de('Fusagasugá')).toMatchObject({ x: MAPA_MOSAICO.margen, y: 100 - MAPA_MOSAICO.margen });
    expect(de('Zipaquirá')).toMatchObject({ x: 100 - MAPA_MOSAICO.margen, y: MAPA_MOSAICO.margen });
    const medio = de('Soacha');
    expect(medio?.x).toBeGreaterThan(MAPA_MOSAICO.margen);
    expect(medio?.x).toBeLessThan(100 - MAPA_MOSAICO.margen);
  });

  it('el punto crece con las noticias: 10, 14 y 20 px', () => {
    const { puntos } = puntosDelMapa(lista, conteo);
    expect(puntos.map((p) => [p.ciudad, p.tamano])).toEqual([
      ['Fusagasugá', 20],
      ['Zipaquirá', 14],
      ['Soacha', 10],
    ]);
  });

  it('el nombre va a la izquierda cuando el punto pasa del 60 % del ancho', () => {
    const { puntos } = puntosDelMapa(lista, conteo);
    expect(puntos.find((p) => p.ciudad === 'Zipaquirá')?.nombreALaIzquierda).toBe(true);
    expect(puntos.find((p) => p.ciudad === 'Fusagasugá')?.nombreALaIzquierda).toBe(false);
  });

  it('los municipios sin coordenadas van aparte', () => {
    expect(puntosDelMapa(lista, conteo).sinCoordenadas).toEqual([{ ciudad: 'Chía', cantidad: 1 }]);
  });

  it('usa el promedio de las coordenadas de las noticias del municipio', () => {
    const dos = [
      noticia(HOY, '08:00', { ciudad: 'A', latitud: 4, longitud: -75 }),
      noticia(HOY, '09:00', { ciudad: 'A', latitud: 6, longitud: -73 }),
      noticia(HOY, '10:00', { ciudad: 'B', latitud: 5, longitud: -74 }),
      noticia(HOY, '11:00', { ciudad: 'C', latitud: 4, longitud: -75 }),
      noticia(HOY, '12:00', { ciudad: 'D', latitud: 6, longitud: -73 }),
    ];
    const { puntos } = puntosDelMapa(dos, [
      { ciudad: 'A', cantidad: 2 },
      { ciudad: 'B', cantidad: 1 },
      { ciudad: 'C', cantidad: 1 },
      { ciudad: 'D', cantidad: 1 },
    ]);
    // A (promedio 5, -74) cae en el mismo sitio que B: el centro.
    expect(puntos[0]).toMatchObject({ ciudad: 'A', x: 50, y: 50 });
    expect(puntos[1]).toMatchObject({ ciudad: 'B', x: 50, y: 50 });
  });

  it('con un solo municipio, va en el centro', () => {
    const { puntos } = puntosDelMapa([noticia(HOY, '08:00', fusa)], [{ ciudad: 'Fusagasugá', cantidad: 1 }]);
    expect(puntos).toEqual([
      { ciudad: 'Fusagasugá', cantidad: 1, x: 50, y: 50, tamano: 10, nombreALaIzquierda: false },
    ]);
  });

  it('dibuja como mucho seis municipios: los que tienen más noticias', () => {
    const muchos = Array.from({ length: 8 }, (_, i) => ({ ciudad: `Municipio ${i}`, cantidad: i + 1 }));
    const noticias = muchos.map((m, i) => noticia(HOY, '08:00', { ciudad: m.ciudad, latitud: 4 + i, longitud: -74 + i }));
    const { puntos } = puntosDelMapa(noticias, muchos);
    expect(puntos).toHaveLength(MAPA_MOSAICO.municipios);
    expect(puntos[0].ciudad).toBe('Municipio 7');
    expect(puntos.some((p) => p.ciudad === 'Municipio 0')).toBe(false);
  });

  it('sin municipios no hay puntos', () => {
    expect(puntosDelMapa([], [])).toEqual({ puntos: [], sinCoordenadas: [] });
  });
});
