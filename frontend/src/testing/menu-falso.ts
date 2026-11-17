import { computed, Provider, signal } from '@angular/core';
import { NEVER, of } from 'rxjs';
import { AlertaPendiente } from '../app/core/models/alerta.model';
import { Notificacion } from '../app/core/models/notificacion.model';
import { CampanaNotificaciones } from '../app/core/services/campana-notificaciones';
import { NotificacionService } from '../app/core/services/notificacion.service';
import { PerfilService } from '../app/core/services/perfil.service';
import { VigiaAlertas } from '../app/core/services/vigia-alertas';

/**
 * El menú principal pregunta cada cierto tiempo cuántas notificaciones hay sin leer.
 * En las pruebas de las pantallas esa campana no sale a la red.
 */
export function campanaFalsa(noLeidas = 0): Provider {
  return [
    {
      provide: CampanaNotificaciones,
      useValue: {
        noLeidas: signal(noLeidas).asReadonly(),
        vigilar: () => undefined,
        actualizar: () => undefined,
      },
    },
    // El marco también muestra las alertas de emergencia: sin alertas y sin preguntar al backend.
    alertasFalsas(),
  ];
}

/** Vigía de alertas de emergencia que no pregunta nada y no tiene ninguna pendiente. */
export function alertasFalsas(pendientes: AlertaPendiente[] = []): Provider {
  const fila = signal(pendientes);
  return {
    provide: VigiaAlertas,
    useValue: {
      pendientes: fila.asReadonly(),
      actual: computed(() => fila()[0] ?? null),
      vigilar: () => undefined,
      cerrar: (p: AlertaPendiente) => fila.update((lista) => lista.filter((x) => x !== p)),
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

/** La columna derecha de la portada pide la bandeja de avisos; aquí responde con la lista dada. */
export function avisosFalsos(avisos: Notificacion[] = []): Provider {
  return { provide: NotificacionService, useValue: { listar: () => of(avisos) } };
}
