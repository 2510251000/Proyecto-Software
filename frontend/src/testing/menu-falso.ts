import { Provider, signal } from '@angular/core';
import { CampanaNotificaciones } from '../app/core/services/campana-notificaciones';

/**
 * El menú principal pregunta cada cierto tiempo cuántas notificaciones hay sin leer.
 * En las pruebas de las pantallas esa campana no sale a la red.
 */
export function campanaFalsa(noLeidas = 0): Provider {
  return {
    provide: CampanaNotificaciones,
    useValue: {
      noLeidas: signal(noLeidas).asReadonly(),
      vigilar: () => undefined,
      actualizar: () => undefined,
    },
  };
}
