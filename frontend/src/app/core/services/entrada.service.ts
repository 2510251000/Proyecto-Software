import { Injectable } from '@angular/core';
import { CLAVE_ENTRADA_VISTA } from '../constants/almacenamiento.constants';

/**
 * Recuerda, solo durante la sesión del navegador, que ya se mostró la entrada del login.
 * Si el navegador no deja usar sessionStorage (modo privado estricto), la entrada se muestra
 * cada vez: es solo decoración.
 */
@Injectable({ providedIn: 'root' })
export class EntradaService {
  yaSeVio(): boolean {
    try {
      return sessionStorage.getItem(CLAVE_ENTRADA_VISTA) !== null;
    } catch {
      return false;
    }
  }

  marcarVista(): void {
    try {
      sessionStorage.setItem(CLAVE_ENTRADA_VISTA, '1');
    } catch {
      // Sin almacenamiento disponible no hay nada que recordar.
    }
  }
}
