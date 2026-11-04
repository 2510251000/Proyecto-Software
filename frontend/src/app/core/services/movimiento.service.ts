import { Injectable } from '@angular/core';
import { CONSULTA_REDUCIR_MOVIMIENTO } from '../constants/animaciones.constants';

/** Dice si la persona pidió en su sistema «reducir movimiento». */
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  reducirMovimiento(): boolean {
    return typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(CONSULTA_REDUCIR_MOVIMIENTO).matches;
  }
}
