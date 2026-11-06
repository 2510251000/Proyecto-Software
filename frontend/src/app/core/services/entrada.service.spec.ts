import { TestBed } from '@angular/core/testing';
import { CLAVE_ENTRADA_VISTA } from '../constants/almacenamiento.constants';
import { CONSULTA_REDUCIR_MOVIMIENTO } from '../constants/animaciones.constants';
import { crearAlmacenamientoFalso } from '../../../testing/almacenamiento-falso';
import { EntradaService } from './entrada.service';
import { MovimientoService } from './movimiento.service';

describe('EntradaService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('recuerda en sessionStorage que la entrada ya se vio', () => {
    const almacenamiento = crearAlmacenamientoFalso();
    vi.stubGlobal('sessionStorage', almacenamiento);
    const servicio = TestBed.inject(EntradaService);
    expect(servicio.yaSeVio()).toBe(false);
    servicio.marcarVista();
    expect(almacenamiento.getItem(CLAVE_ENTRADA_VISTA)).not.toBeNull();
    expect(servicio.yaSeVio()).toBe(true);
  });

  it('sin almacenamiento disponible, muestra la entrada y no falla', () => {
    const fallar = (): never => {
      throw new Error('bloqueado');
    };
    vi.stubGlobal('sessionStorage', { getItem: fallar, setItem: fallar });
    const servicio = TestBed.inject(EntradaService);
    expect(servicio.yaSeVio()).toBe(false);
    expect(() => servicio.marcarVista()).not.toThrow();
  });
});

describe('MovimientoService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lee la preferencia «reducir movimiento» del sistema', () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.stubGlobal('matchMedia', matchMedia);
    expect(TestBed.inject(MovimientoService).reducirMovimiento()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(CONSULTA_REDUCIR_MOVIMIENTO);
  });

  it('si el navegador no sabe consultar, asume que sí hay movimiento', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(TestBed.inject(MovimientoService).reducirMovimiento()).toBe(false);
  });
});
