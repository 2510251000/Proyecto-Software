import { CANCELACIONES_GOOGLE, codigoFirebase, dominioDeInicio, esNavegadorDeApp } from './proveedor-google';

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

describe('dominioDeInicio', () => {
  const config = { apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: 'a' };

  it('en el dominio de Hosting del proyecto usa ese mismo dominio', () => {
    expect(dominioDeInicio(config, 'p.web.app')).toBe('p.web.app');
  });

  it('en cualquier otro dominio usa el de Firebase', () => {
    expect(dominioDeInicio(config, 'localhost:4200')).toBe('p.firebaseapp.com');
    expect(dominioDeInicio(config, 'otro.web.app')).toBe('p.firebaseapp.com');
  });
});

describe('esNavegadorDeApp', () => {
  it('reconoce los navegadores internos de WhatsApp, Instagram, Facebook y Android', () => {
    expect(esNavegadorDeApp('Mozilla/5.0 (Linux; Android 14) WhatsApp/2.24')).toBe(true);
    expect(esNavegadorDeApp('Mozilla/5.0 (iPhone) Instagram 300.0')).toBe(true);
    expect(esNavegadorDeApp('Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/450]')).toBe(true);
    expect(esNavegadorDeApp('Mozilla/5.0 (Linux; Android 14; SM-A145M; wv) AppleWebKit/537.36')).toBe(true);
  });

  it('Chrome y Safari normales no lo son', () => {
    expect(esNavegadorDeApp('Mozilla/5.0 (Linux; Android 14; SM-A145M) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36')).toBe(false);
    expect(esNavegadorDeApp('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1')).toBe(false);
  });
});
