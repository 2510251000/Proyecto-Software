import { Noticia } from '../../../core/models/noticia.model';
import { aplicarPestana, filtrarNoticias, mismoFiltro } from './filtro-portada';

const AHORA = new Date('2026-09-25T12:00:00').getTime();
const HORA = 3_600_000;

function noticia(id: number, oficial: boolean, ciudad: string, horasAtras: number): Noticia {
  return {
    id,
    titulo: `Noticia ${id}`,
    resumen: '',
    contenido: '',
    fechaPublicacion: new Date(AHORA - horasAtras * HORA).toISOString(),
    oficial,
    ciudad,
  };
}

const NOTICIAS: Noticia[] = [
  noticia(1, true, 'Soacha', 1),
  noticia(2, false, 'Soacha', 2),
  noticia(3, true, 'Fusagasugá', 30),
  noticia(4, false, 'Zipaquirá', 50),
];

const ids = (lista: Noticia[]) => lista.map((n) => n.id);

describe('filtrarNoticias', () => {
  it('«Todas» deja la lista igual y en el mismo orden', () => {
    expect(ids(filtrarNoticias(NOTICIAS, { tipo: 'todas' }, AHORA))).toEqual([1, 2, 3, 4]);
  });

  it('«Última hora» deja solo las oficiales de menos de tres horas', () => {
    expect(ids(filtrarNoticias(NOTICIAS, { tipo: 'ultima-hora' }, AHORA))).toEqual([1]);
  });

  it('«Oficiales» y «Comunidad» se reparten la lista', () => {
    expect(ids(filtrarNoticias(NOTICIAS, { tipo: 'oficiales' }, AHORA))).toEqual([1, 3]);
    expect(ids(filtrarNoticias(NOTICIAS, { tipo: 'comunidad' }, AHORA))).toEqual([2, 4]);
  });

  it('una ciudad deja solo las de esa ciudad', () => {
    expect(ids(filtrarNoticias(NOTICIAS, { tipo: 'ciudad', ciudad: 'Soacha' }, AHORA))).toEqual([1, 2]);
    expect(filtrarNoticias(NOTICIAS, { tipo: 'ciudad', ciudad: 'Girardot' }, AHORA)).toEqual([]);
  });
});

describe('mismoFiltro', () => {
  it('compara el tipo y, si es ciudad, también el nombre', () => {
    expect(mismoFiltro({ tipo: 'oficiales' }, { tipo: 'oficiales' })).toBe(true);
    expect(mismoFiltro({ tipo: 'oficiales' }, { tipo: 'comunidad' })).toBe(false);
    expect(mismoFiltro({ tipo: 'ciudad', ciudad: 'Soacha' }, { tipo: 'ciudad', ciudad: 'Soacha' })).toBe(true);
    expect(mismoFiltro({ tipo: 'ciudad', ciudad: 'Soacha' }, { tipo: 'ciudad', ciudad: 'Chía' })).toBe(false);
  });
});

describe('aplicarPestana', () => {
  // Llegan en el orden de la API (recomendadas), que no es el de la fecha.
  const EN_ORDEN_API = [noticia(1, true, 'Soacha', 5), noticia(2, false, 'Soacha', 1), noticia(3, false, 'Chía', 3)];
  const ids = (lista: Noticia[]) => lista.map((n) => n.id);

  it('«Recomendadas» conserva el orden de la API', () => {
    expect(ids(aplicarPestana(EN_ORDEN_API, 'RECOMENDADAS'))).toEqual([1, 2, 3]);
  });

  it('«Recientes» ordena de la más nueva a la más vieja sin cambiar la lista original', () => {
    expect(ids(aplicarPestana(EN_ORDEN_API, 'RECIENTES'))).toEqual([2, 3, 1]);
    expect(ids(EN_ORDEN_API)).toEqual([1, 2, 3]);
  });

  it('«Oficiales» y «Comunidad» separan por quién publica', () => {
    expect(ids(aplicarPestana(EN_ORDEN_API, 'OFICIALES'))).toEqual([1]);
    expect(ids(aplicarPestana(EN_ORDEN_API, 'COMUNITARIAS'))).toEqual([2, 3]);
  });
});
