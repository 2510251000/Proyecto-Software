import { TestBed } from '@angular/core/testing';
import type { Auth, AuthProvider, UserCredential } from 'firebase/auth';
import {
  CANCELACIONES_GOOGLE,
  CARGADOR_FIREBASE,
  CLAVE_REDIRECCION_GOOGLE,
  codigoFirebase,
  destinoEnDominioDeInicio,
  esNavegadorDeApp,
  FirebaseListo,
  ProveedorGoogle,
} from './proveedor-google';

describe('ProveedorGoogle', () => {
  const CONFIG = { apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: 'a' };
  const credencial = (token: string) => ({ user: { getIdToken: () => Promise.resolve(token) } }) as unknown as UserCredential;

  let listo: FirebaseListo;
  let conVentana: ReturnType<typeof vi.fn>;
  let conRedireccion: ReturnType<typeof vi.fn>;
  let resultadoRedireccion: ReturnType<typeof vi.fn>;
  let cargar: ReturnType<typeof vi.fn>;

  function crear(): ProveedorGoogle {
    TestBed.configureTestingModule({ providers: [{ provide: CARGADOR_FIREBASE, useValue: cargar }] });
    return TestBed.inject(ProveedorGoogle);
  }

  beforeEach(() => {
    sessionStorage.clear();
    conVentana = vi.fn(() => Promise.resolve(credencial('token-ventana')));
    conRedireccion = vi.fn(() => new Promise<never>(() => undefined)); // la página se va a Google
    resultadoRedireccion = vi.fn(() => Promise.resolve(credencial('token-redireccion')));
    listo = {
      auth: {} as Auth,
      proveedor: {} as AuthProvider,
      conVentana,
      conRedireccion,
      resultadoRedireccion,
    } as unknown as FirebaseListo;
    cargar = vi.fn(() => Promise.resolve(listo));
  });

  it('prepara Firebase una sola vez aunque se pida varias', async () => {
    const proveedor = crear();
    await Promise.all([proveedor.preparar(CONFIG), proveedor.preparar(CONFIG)]);
    expect(cargar).toHaveBeenCalledTimes(1);
    expect(cargar).toHaveBeenCalledWith(CONFIG);
  });

  it('ya preparado, abre la ventana en el mismo instante del toque (Safari) y entrega el token', async () => {
    const proveedor = crear();
    await proveedor.preparar(CONFIG);
    const token = proveedor.obtenerToken(CONFIG);
    expect(conVentana).toHaveBeenCalledTimes(1); // sin ningún await de por medio
    expect(await token).toBe('token-ventana');
  });

  it('sin preparar, primero descarga Firebase y después abre la ventana', async () => {
    const proveedor = crear();
    const token = proveedor.obtenerToken(CONFIG);
    expect(conVentana).not.toHaveBeenCalled();
    expect(await token).toBe('token-ventana');
    expect(cargar).toHaveBeenCalledTimes(1);
  });

  it('si el navegador bloquea la ventana, se va a Google por redirección y lo deja anotado', async () => {
    conVentana.mockReturnValueOnce(Promise.reject({ code: 'auth/popup-blocked' }));
    const proveedor = crear();
    await proveedor.preparar(CONFIG);
    void proveedor.obtenerToken(CONFIG);
    await vi.waitFor(() => expect(conRedireccion).toHaveBeenCalledWith(listo.auth, listo.proveedor));
    expect(sessionStorage.getItem(CLAVE_REDIRECCION_GOOGLE)).toBe('1');
  });

  it('otros errores de la ventana (por ejemplo, cerrarla) llegan tal cual', async () => {
    conVentana.mockReturnValueOnce(Promise.reject({ code: 'auth/popup-closed-by-user' }));
    const proveedor = crear();
    await expect(proveedor.obtenerToken(CONFIG)).rejects.toEqual({ code: 'auth/popup-closed-by-user' });
    expect(conRedireccion).not.toHaveBeenCalled();
  });

  it('si descargar Firebase falla, el siguiente intento lo vuelve a descargar', async () => {
    cargar.mockReturnValueOnce(Promise.reject(new Error('sin red')));
    const proveedor = crear();
    await expect(proveedor.preparar(CONFIG)).rejects.toThrow('sin red');
    await proveedor.preparar(CONFIG);
    expect(cargar).toHaveBeenCalledTimes(2);
  });

  it('al volver de Google por redirección entrega su token una sola vez', async () => {
    sessionStorage.setItem(CLAVE_REDIRECCION_GOOGLE, '1');
    const proveedor = crear();
    expect(await proveedor.tokenDeRedireccion(CONFIG)).toBe('token-redireccion');
    expect(sessionStorage.getItem(CLAVE_REDIRECCION_GOOGLE)).toBeNull();
    expect(await proveedor.tokenDeRedireccion(CONFIG)).toBeNull();
    expect(resultadoRedireccion).toHaveBeenCalledTimes(1);
  });

  it('sin redirección pendiente no descarga nada; si Google no devolvió resultado, entrega null', async () => {
    const proveedor = crear();
    expect(await proveedor.tokenDeRedireccion(CONFIG)).toBeNull();
    expect(cargar).not.toHaveBeenCalled();

    sessionStorage.setItem(CLAVE_REDIRECCION_GOOGLE, '1');
    resultadoRedireccion.mockReturnValueOnce(Promise.resolve(null));
    expect(await proveedor.tokenDeRedireccion(CONFIG)).toBeNull();
  });
});

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
