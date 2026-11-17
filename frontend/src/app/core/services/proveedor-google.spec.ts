import { CANCELACIONES_GOOGLE, codigoFirebase } from './proveedor-google';

describe('codigoFirebase', () => {
  it('saca el código de un error de Firebase', () => {
    expect(codigoFirebase({ code: 'auth/popup-closed-by-user' })).toBe('auth/popup-closed-by-user');
    expect(CANCELACIONES_GOOGLE).toContain('auth/popup-closed-by-user');
  });

  it('devuelve null si no es un error de Firebase', () => {
    expect(codigoFirebase(new Error('otro'))).toBeNull();
    expect(codigoFirebase({ code: 404 })).toBeNull();
    expect(codigoFirebase(null)).toBeNull();
    expect(codigoFirebase('texto')).toBeNull();
  });
});
