import { iniciales, trozosConEnlaces } from './texto';

describe('trozosConEnlaces', () => {
  it('separa el texto de la dirección y deja el punto final fuera del enlace', () => {
    expect(trozosConEnlaces('Nota original: https://medio.co/nota-1. Foto: Medio.')).toEqual([
      { texto: 'Nota original: ', enlace: false },
      { texto: 'https://medio.co/nota-1', enlace: true },
      { texto: '. Foto: Medio.', enlace: false },
    ]);
  });

  it('reconoce varias direcciones y una al final del párrafo', () => {
    const trozos = trozosConEnlaces('http://a.co y https://b.co/x?y=1');
    expect(trozos.filter((t) => t.enlace).map((t) => t.texto)).toEqual(['http://a.co', 'https://b.co/x?y=1']);
    expect(trozos.at(-1)).toEqual({ texto: 'https://b.co/x?y=1', enlace: true });
  });

  it('un párrafo sin direcciones queda igual, y «javascript:» nunca es enlace', () => {
    expect(trozosConEnlaces('Sin enlaces aquí')).toEqual([{ texto: 'Sin enlaces aquí', enlace: false }]);
    expect(trozosConEnlaces('javascript:alert(1)').some((t) => t.enlace)).toBe(false);
  });
});

describe('iniciales', () => {
  it('toma la primera letra de las dos primeras palabras', () => {
    expect(iniciales('  laura   méndez  ruiz ')).toBe('LM');
    expect(iniciales('Ana')).toBe('A');
    expect(iniciales('')).toBe('');
  });
});
