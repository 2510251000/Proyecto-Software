import { categoriaDeNoticia } from './categoria-noticia';

describe('categoriaDeNoticia', () => {
  it.each([
    ['Fusagasugá inaugura la nueva ciclorruta del centro', 'bici'],
    ['Préstamo de bicicletas en la plaza', 'bici'],
    ['Cortes de agua programados para este jueves', 'agua'],
    ['El acueducto anuncia mantenimiento', 'agua'],
    ['Abren las inscripciones para las escuelas deportivas', 'deporte'],
    ['Torneo de fútbol en el coliseo', 'deporte'],
    ['Clases gratuitas de natación', 'deporte'],
    ['Vecinos de La Esperanza reparan el parque por su cuenta', 'parque'],
    ['Siembran cien árboles en la vereda', 'parque'],
    ['La feria gastronómica reunirá a cuarenta emprendedores', 'comida'],
    ['Festival de comida típica', 'comida'],
    ['Mercado campesino este domingo', 'mercado'],
    ['Productores campesinos venden sin intermediarios', 'mercado'],
    ['Avanza la obra del puente', 'obra'],
    ['Nuevo colegio para el barrio', 'obra'],
    ['Inicia la construcción del hospital', 'obra'],
  ] as const)('«%s» → %s', (titulo, categoria) => {
    expect(categoriaDeNoticia(titulo)).toBe(categoria);
  });

  it('usa cultura cuando no reconoce ninguna palabra', () => {
    expect(categoriaDeNoticia('Concierto de la banda sinfónica')).toBe('cultura');
    expect(categoriaDeNoticia('')).toBe('cultura');
  });

  it('no se confunde con palabras que solo contienen la raíz', () => {
    expect(categoriaDeNoticia('Lo que sobra del presupuesto')).toBe('cultura');
  });

  it('ignora mayúsculas y tildes', () => {
    expect(categoriaDeNoticia('CONSTRUCCIÓN DEL ESTADIO')).toBe('obra');
  });

  it('si hay varias, gana la primera categoría de la lista', () => {
    expect(categoriaDeNoticia('Ciclorruta junto al parque')).toBe('bici');
  });
});
