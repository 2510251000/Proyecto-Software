import { Provider, signal } from '@angular/core';
import { NEVER } from 'rxjs';
import { CampanaNotificaciones } from '../app/core/services/campana-notificaciones';
import { PerfilService } from '../app/core/services/perfil.service';

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

/**
 * El marco de las pantallas pide el perfil para mostrar el nombre y el nivel. En las
 * pruebas que no lo necesitan, la petición nunca responde y el pie queda solo con «Salir».
 */
export function perfilFalso(): Provider {
  return { provide: PerfilService, useValue: { obtener: () => NEVER } };
}
