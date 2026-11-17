import { TestBed } from '@angular/core/testing';
import { SIRENA, VIBRACION_ALERTA } from '../constants/alertas.constants';
import { Sirena } from './sirena';

/** Lo poco de la Web Audio API que usa la sirena. */
class OsciladorFalso {
  type = '';
  readonly frequency = { value: 0 };
  readonly connect = vi.fn();
  readonly start = vi.fn();
  readonly stop = vi.fn();
}

class ContextoFalso {
  static creados: ContextoFalso[] = [];
  readonly currentTime = 0;
  readonly destination = {};
  readonly osciladores: OsciladorFalso[] = [];
  readonly volumen = { gain: { value: 1, setValueAtTime: vi.fn() }, connect: vi.fn() };
  constructor() {
    ContextoFalso.creados.push(this);
  }
  resume(): Promise<void> {
    return Promise.resolve();
  }
  createGain() {
    return this.volumen;
  }
  createOscillator() {
    const oscilador = new OsciladorFalso();
    this.osciladores.push(oscilador);
    return oscilador;
  }
}

describe('Sirena', () => {
  let vibrar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ContextoFalso.creados = [];
    vibrar = vi.fn(() => true);
    vi.stubGlobal('AudioContext', ContextoFalso);
    Object.defineProperty(navigator, 'vibrate', { value: vibrar, configurable: true });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('suena los dos tonos con la cadencia de las alertas y vibra', () => {
    const sirena = TestBed.inject(Sirena);
    sirena.sonar();

    const contexto = ContextoFalso.creados[0];
    expect(contexto.osciladores.map((o) => o.frequency.value)).toEqual([...SIRENA.frecuencias]);
    expect(contexto.osciladores.every((o) => o.start.mock.calls.length === 1)).toBe(true);
    // Encendido y apagado por cada pulso de la cadencia, en cada repetición.
    expect(contexto.volumen.gain.setValueAtTime).toHaveBeenCalledTimes(
      SIRENA.cadencia.length * SIRENA.repeticiones * 2,
    );
    expect(vibrar).toHaveBeenCalledWith([...VIBRACION_ALERTA]);
  });

  it('al detenerla corta el sonido y la vibración, y reutiliza el audio', () => {
    const sirena = TestBed.inject(Sirena);
    sirena.sonar();
    const [primero] = ContextoFalso.creados[0].osciladores;

    sirena.detener();
    sirena.sonar();

    expect(primero.stop).toHaveBeenCalledTimes(2);
    expect(vibrar).toHaveBeenCalledWith([]);
    expect(ContextoFalso.creados).toHaveLength(1);
  });

  it('sin audio en el navegador solo vibra', () => {
    vi.stubGlobal('AudioContext', undefined);
    TestBed.inject(Sirena).sonar();
    expect(vibrar).toHaveBeenCalled();
  });

  it('avisa al sistema solo si el usuario dio permiso', async () => {
    const creados: { titulo: string; opciones: NotificationOptions }[] = [];
    class NotificacionFalsa {
      static permission: NotificationPermission = 'default';
      static requestPermission = vi.fn(() => Promise.resolve('granted' as NotificationPermission));
      constructor(titulo: string, opciones: NotificationOptions) {
        creados.push({ titulo, opciones });
      }
    }
    vi.stubGlobal('Notification', NotificacionFalsa);
    const sirena = TestBed.inject(Sirena);
    const aviso = { titulo: 'Alerta', cuerpo: 'Se busca a Ana', etiqueta: 'alerta-50' };

    sirena.avisarAlSistema(aviso);
    expect(creados).toEqual([]);
    expect(sirena.permisoSistema()).toBe('default');
    expect(await sirena.pedirPermisoSistema()).toBe('granted');

    NotificacionFalsa.permission = 'granted';
    sirena.avisarAlSistema(aviso);
    expect(creados).toEqual([
      {
        titulo: 'Alerta',
        opciones: { body: 'Se busca a Ana', tag: 'alerta-50', requireInteraction: true },
      },
    ]);
  });

  it('sin avisos del sistema en el navegador no pide nada', async () => {
    vi.stubGlobal('Notification', undefined);
    const sirena = TestBed.inject(Sirena);
    expect(sirena.permisoSistema()).toBeNull();
    expect(await sirena.pedirPermisoSistema()).toBeNull();
  });
});
