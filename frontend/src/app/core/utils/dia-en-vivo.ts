import {
  ARCO,
  HORAS_DEL_DIA,
  MAPA_MOSAICO,
  MARCAS_MAXIMAS,
  MINUTOS_POR_HORA,
  SEPARACION_MINIMA_MARCAS,
  SUFIJOS_HORA,
  TOLERANCIA_HORA,
} from '../constants/dia-en-vivo.constants';
import { IDIOMA, ZONA_HORARIA } from '../constants/regional.constants';
import { Noticia } from '../models/noticia.model';

/*
  Lógica de la portada «El día en vivo». Son funciones puras: reciben datos y devuelven
  datos, sin tocar la pantalla ni pedir nada. Por eso se pueden probar una por una.
*/

/** Momento del día: decide el tinte de la foto y el tema. */
export type Momento = 'amanecer' | 'dia' | 'atardecer' | 'noche';
export type Tema = 'dia' | 'noche';

/** Una fecha como texto ISO, como milisegundos o como Date. */
export type Instante = string | number | Date;

/** Un punto de la línea del sol: x en % del ancho de la franja; y en px desde arriba. */
export interface PuntoArco {
  x: number;
  y: number;
}

/** Una noticia colgada del arco a la hora en que se publicó. */
export interface MarcaArco extends PuntoArco {
  noticia: Noticia;
  hora: number;
}

/** Un municipio con cuántas noticias tiene (lo que ya calcula la portada). */
export interface ConteoMunicipio {
  ciudad: string;
  cantidad: number;
}

/** Un municipio dibujado como punto en «Dónde está pasando»: x e y en % del área. */
export interface PuntoMapa extends ConteoMunicipio {
  x: number;
  y: number;
  /** Diámetro del punto en px. */
  tamano: number;
  /** true si el nombre va a la izquierda del punto para no salirse de la ficha. */
  nombreALaIzquierda: boolean;
}

export interface MapaMosaico {
  puntos: PuntoMapa[];
  /** Municipios sin coordenadas: van como píldoras debajo. */
  sinCoordenadas: ConteoMunicipio[];
}

const FORMATO_HORA = new Intl.DateTimeFormat(IDIOMA, {
  timeZone: ZONA_HORARIA,
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

const FORMATO_DIA = new Intl.DateTimeFormat(IDIOMA, {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** El día ya viene resuelto (AAAA-MM-DD): se formatea en UTC para que no se corra. */
const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat(IDIOMA, {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const HORAS_MEDIO_DIA = 12;

function aFecha(instante: Instante): Date | null {
  const fecha = new Date(instante);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function parte(partes: Intl.DateTimeFormatPart[], tipo: Intl.DateTimeFormatPartTypes): string {
  return partes.find((p) => p.type === tipo)?.value ?? '';
}

/** Hora de Colombia como decimal: 5:40 p. m. → 17.67. null si la fecha no es válida. */
export function horaDecimal(instante: Instante): number | null {
  const fecha = aFecha(instante);
  if (!fecha) {
    return null;
  }
  const partes = FORMATO_HORA.formatToParts(fecha);
  const horas = Number(parte(partes, 'hour'));
  const minutos = Number(parte(partes, 'minute'));
  return (horas * MINUTOS_POR_HORA + minutos) / MINUTOS_POR_HORA;
}

/** Día de Colombia como «2026-11-09». null si la fecha no es válida. */
export function diaDe(instante: Instante): string | null {
  const fecha = aFecha(instante);
  if (!fecha) {
    return null;
  }
  const partes = FORMATO_DIA.formatToParts(fecha);
  return `${parte(partes, 'year')}-${parte(partes, 'month')}-${parte(partes, 'day')}`;
}

/** Amanecer de 6:00 a 7:30, día hasta las 4:00 p. m., atardecer hasta las 5:30 p. m.; el resto, noche. */
export function momentoDe(hora: number): Momento {
  if (hora < HORAS_DEL_DIA.amanecer || hora >= HORAS_DEL_DIA.noche) {
    return 'noche';
  }
  if (hora < HORAS_DEL_DIA.dia) {
    return 'amanecer';
  }
  return hora < HORAS_DEL_DIA.atardecer ? 'dia' : 'atardecer';
}

/** Solo el momento «noche» lleva el tema de noche. */
export function temaDe(momento: Momento): Tema {
  return momento === 'noche' ? 'noche' : 'dia';
}

/** Deja la hora dentro del arco: antes de las 6 a. m. cuenta como las 6; después de las 6 p. m., como las 6 p. m. */
export function horaEnArco(hora: number): number {
  return Math.min(HORAS_DEL_DIA.ocaso, Math.max(HORAS_DEL_DIA.amanecer, hora));
}

/** Dónde va una hora en la línea del sol. La curva es una parábola: sube hasta el mediodía y baja. */
export function posicionEnArco(hora: number): PuntoArco {
  const u = (horaEnArco(hora) - HORAS_DEL_DIA.amanecer) / (HORAS_DEL_DIA.ocaso - HORAS_DEL_DIA.amanecer);
  return {
    x: ARCO.xInicio + ARCO.ancho * u,
    y: ARCO.tope + ARCO.alto * (1 - 4 * u * (1 - u)),
  };
}

/** «4:20 p. m.», «12:00 p. m.», «12:05 a. m.». */
export function horaLegible(hora: number): string {
  const total = Math.round(hora * MINUTOS_POR_HORA);
  const horas = Math.floor(total / MINUTOS_POR_HORA) % (HORAS_MEDIO_DIA * 2);
  const minutos = total % MINUTOS_POR_HORA;
  const enReloj = ((horas + HORAS_MEDIO_DIA - 1) % HORAS_MEDIO_DIA) + 1;
  const sufijo = horas < HORAS_MEDIO_DIA ? SUFIJOS_HORA.manana : SUFIJOS_HORA.tarde;
  return `${enReloj}:${String(minutos).padStart(2, '0')} ${sufijo}`;
}

/** «Lunes 9 de noviembre» a partir de «2026-11-09». Cadena vacía si el día no es válido. */
export function fechaLegible(dia: string): string {
  const fecha = aFecha(`${dia}T12:00:00Z`);
  if (!fecha) {
    return '';
  }
  const texto = FORMATO_FECHA_LARGA.format(fecha).replace(',', '');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Las noticias publicadas ese día (hora de Colombia), de la más temprana a la más tardía. */
export function noticiasDelDia(noticias: readonly Noticia[], dia: string): Noticia[] {
  return noticias
    .filter((noticia) => diaDe(noticia.fechaPublicacion) === dia)
    .sort((a, b) => Date.parse(a.fechaPublicacion) - Date.parse(b.fechaPublicacion));
}

/** Los días que tienen al menos una noticia, del más reciente al más viejo. */
export function diasConNoticias(noticias: readonly Noticia[]): string[] {
  const dias = new Set<string>();
  for (const noticia of noticias) {
    const dia = diaDe(noticia.fechaPublicacion);
    if (dia) {
      dias.add(dia);
    }
  }
  return [...dias].sort((a, b) => b.localeCompare(a));
}

/** Hoy; si hoy no tiene noticias, el día más reciente que sí tenga, para que el arco no arranque vacío. */
export function diaInicial(noticias: readonly Noticia[], hoy: string): string {
  const dias = diasConNoticias(noticias).filter((dia) => dia <= hoy);
  return dias.includes(hoy) ? hoy : (dias[0] ?? hoy);
}

/** El día con noticias inmediatamente anterior a `dia`; null si no hay ninguno más viejo. */
export function diaAnterior(noticias: readonly Noticia[], dia: string): string | null {
  return diasConNoticias(noticias).find((otro) => otro < dia) ?? null;
}

/**
 * El día con noticias inmediatamente posterior a `dia`, sin pasar de hoy. Si no hay ninguno
 * entre los dos, es hoy; null si `dia` ya es hoy.
 */
export function diaSiguiente(noticias: readonly Noticia[], dia: string, hoy: string): string | null {
  if (dia >= hoy) {
    return null;
  }
  const posteriores = diasConNoticias(noticias).filter((otro) => otro > dia && otro <= hoy);
  return posteriores.at(-1) ?? hoy;
}

/**
 * Con qué hora se abre un día. Hoy, la hora actual. Un día pasado, la de su última noticia
 * (así el sol queda sobre esa marca); si no tiene noticias, la puesta del sol.
 */
export function horaInicial(noticias: readonly Noticia[], dia: string, hoy: string, ahora: number): number {
  if (dia === hoy) {
    return ahora;
  }
  const ultima = noticiasDelDia(noticias, dia).at(-1);
  return (ultima && horaDecimal(ultima.fechaPublicacion)) ?? HORAS_DEL_DIA.ocaso;
}

/**
 * La noticia de la portada de cine: la última del día publicada a esa hora o antes. Si no hay
 * ninguna antes, la primera del día. Si el día no tiene noticias, la primera de la lista.
 */
export function noticiaDeLaHora(noticias: readonly Noticia[], dia: string, hora: number): Noticia | null {
  const delDia = noticiasDelDia(noticias, dia);
  if (delDia.length === 0) {
    return noticias[0] ?? null;
  }
  const publicadas = delDia.filter(
    (noticia) => (horaDecimal(noticia.fechaPublicacion) ?? 0) <= hora + TOLERANCIA_HORA,
  );
  return publicadas.at(-1) ?? delDia[0];
}

/**
 * Las marcas del arco: noticias del día entre las 6 a. m. y las 6 p. m. Como mucho ocho (las
 * más recientes) y, si dos quedan muy juntas, solo la más reciente. Van de la más temprana a
 * la más tardía.
 */
export function marcasDelDia(noticias: readonly Noticia[], dia: string): MarcaArco[] {
  const marcas: MarcaArco[] = [];
  // Se recorre de la más reciente a la más vieja: la reciente siempre gana el sitio.
  for (const noticia of noticiasDelDia(noticias, dia).reverse()) {
    const hora = horaDecimal(noticia.fechaPublicacion);
    if (hora === null || hora < HORAS_DEL_DIA.amanecer || hora > HORAS_DEL_DIA.ocaso) {
      continue;
    }
    const punto = posicionEnArco(hora);
    const pisaOtra = marcas.some((marca) => Math.abs(marca.x - punto.x) < SEPARACION_MINIMA_MARCAS);
    if (!pisaOtra) {
      marcas.push({ noticia, hora, ...punto });
    }
    if (marcas.length === MARCAS_MAXIMAS) {
      break;
    }
  }
  return marcas.reverse();
}

function promedio(valores: readonly number[]): number {
  return valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
}

/** Reparte un valor entre el margen y (100 − margen); si todos son iguales, va al centro. */
function repartir(valor: number, minimo: number, maximo: number): number {
  if (maximo === minimo) {
    return MAPA_MOSAICO.centro;
  }
  const { margen } = MAPA_MOSAICO;
  return margen + ((100 - 2 * margen) * (valor - minimo)) / (maximo - minimo);
}

function tamanoPunto(cantidad: number): number {
  const tamanos = MAPA_MOSAICO.tamanoPunto;
  return tamanos[Math.min(Math.max(cantidad, 1), tamanos.length) - 1];
}

/**
 * Los puntos de «Dónde está pasando»: los municipios con más noticias, cada uno en el promedio
 * de las coordenadas de sus noticias. El oeste queda a la izquierda y el norte arriba.
 */
export function puntosDelMapa(noticias: readonly Noticia[], conteo: readonly ConteoMunicipio[]): MapaMosaico {
  const elegidos = [...conteo].sort((a, b) => b.cantidad - a.cantidad).slice(0, MAPA_MOSAICO.municipios);

  const ubicados: (ConteoMunicipio & { latitud: number; longitud: number })[] = [];
  const sinCoordenadas: ConteoMunicipio[] = [];
  for (const municipio of elegidos) {
    const latitudes: number[] = [];
    const longitudes: number[] = [];
    for (const noticia of noticias) {
      if (noticia.ciudad === municipio.ciudad && typeof noticia.latitud === 'number' && typeof noticia.longitud === 'number') {
        latitudes.push(noticia.latitud);
        longitudes.push(noticia.longitud);
      }
    }
    if (latitudes.length === 0) {
      sinCoordenadas.push(municipio);
    } else {
      ubicados.push({ ...municipio, latitud: promedio(latitudes), longitud: promedio(longitudes) });
    }
  }

  const latitudes = ubicados.map((m) => m.latitud);
  const longitudes = ubicados.map((m) => m.longitud);
  const [sur, norte] = [Math.min(...latitudes), Math.max(...latitudes)];
  const [oeste, este] = [Math.min(...longitudes), Math.max(...longitudes)];

  const puntos = ubicados.map(({ ciudad, cantidad, latitud, longitud }) => {
    const x = repartir(longitud, oeste, este);
    return {
      ciudad,
      cantidad,
      x,
      // La latitud crece hacia el norte y la pantalla hacia abajo: se invierte.
      y: 100 - repartir(latitud, sur, norte),
      tamano: tamanoPunto(cantidad),
      nombreALaIzquierda: x > MAPA_MOSAICO.nombreALaIzquierdaDesde,
    };
  });

  return { puntos, sinCoordenadas };
}
