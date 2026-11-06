import { DestroyRef } from '@angular/core';
import { Temporizadores } from './temporizadores';

function destruccionFalsa(): { ref: DestroyRef; destruir: () => void } {
  const acciones: (() => void)[] = [];
  const ref = {
    onDestroy: (accion: () => void) => {
      acciones.push(accion);
      return () => undefined;
    },
    destroyed: false,
  } as DestroyRef;
  return { ref, destruir: () => acciones.forEach((accion) => accion()) };
}

describe('Temporizadores', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ejecuta lo programado y permite cancelarlo', () => {
    const { ref } = destruccionFalsa();
    const temporizadores = new Temporizadores(ref);
    const hecho = vi.fn();
    const cancelado = vi.fn();
    temporizadores.programar(hecho, 100);
    const id = temporizadores.programar(cancelado, 100);
    temporizadores.cancelar(id);
    temporizadores.cancelar(null);
    vi.advanceTimersByTime(100);
    expect(hecho).toHaveBeenCalledTimes(1);
    expect(cancelado).not.toHaveBeenCalled();
  });

  it('cancela todo al destruir el componente', () => {
    const { ref, destruir } = destruccionFalsa();
    const accion = vi.fn();
    new Temporizadores(ref).programar(accion, 100);
    destruir();
    vi.advanceTimersByTime(100);
    expect(accion).not.toHaveBeenCalled();
  });
});
