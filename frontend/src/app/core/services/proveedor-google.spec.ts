import { CANCELACIONES_GOOGLE, codigoFirebase, destinoEnDominioDeInicio, esNavegadorDeApp } from './proveedor-google';

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

describe('destinoEnDominioDeInicio', () => {
  const config = { apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: 'a' };
  const en = (host: string) => ({ host });

  it('desde PROYECTO.web.app manda al inicio fijo de firebaseapp.com', () => {
    expect(destinoEnDominioDeInicio(config, en('p.web.app'))).toBe('https://p.firebaseapp.com/');
  });

  it('en firebaseapp.com, en local o en otro dominio no cambia nada', () => {
    expect(destinoEnDominioDeInicio(config, en('p.firebaseapp.com'))).toBeNull();
    expect(destinoEnDominioDeInicio(config, en('localhost:4200'))).toBeNull();
    expect(destinoEnDominioDeInicio(config, en('otro.web.app'))).toBeNull();
    expect(destinoEnDominioDeInicio({ ...config, authDomain: 'p.web.app' }, en('p.web.app'))).toBeNull();
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
