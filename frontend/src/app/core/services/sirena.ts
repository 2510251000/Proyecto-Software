import { Injectable } from '@angular/core';
import { SIRENA, VIBRACION_ALERTA } from '../constants/alertas.constants';

/** Lo mínimo del aviso del sistema operativo que se usa (para poder probarlo sin navegador). */
export interface AvisoSistema {
  titulo: string;
  cuerpo: string;
  etiqueta: string;
}

/**
 * Sonido, vibración y aviso del sistema de una alerta de emergencia, como los avisos de
 * sismo de los celulares. Si el navegador no deja (sin audio, sin vibración o sin permiso),
 * simplemente no suena: el aviso a pantalla completa se muestra igual.
 */
@Injectable({ providedIn: 'root' })
export class Sirena {
  private contexto: AudioContext | null = null;
  private osciladores: OscillatorNode[] = [];

  /** Suena la sirena y vibra el celular. */
  sonar(): void {
    this.detener();
    this.vibrar(VIBRACION_ALERTA);
    const contexto = this.crearContexto();
    if (contexto === null) {
      return;
    }
    void contexto.resume().catch(() => undefined);
    const volumen = contexto.createGain();
    volumen.gain.value = 0;
    volumen.connect(contexto.destination);

    // La cadencia se programa de una vez sobre el volumen: encendido, apagado, encendido…
    let momento = contexto.currentTime;
    for (let vez = 0; vez < SIRENA.repeticiones; vez++) {
      for (const [encendida, apagada] of SIRENA.cadencia) {
        volumen.gain.setValueAtTime(SIRENA.volumen, momento);
        volumen.gain.setValueAtTime(0, momento + encendida);
        momento += encendida + apagada;
      }
    }
    this.osciladores = SIRENA.frecuencias.map((frecuencia) => {
      const oscilador = contexto.createOscillator();
      oscilador.type = 'sine';
      oscilador.frequency.value = frecuencia;
      oscilador.connect(volumen);
      oscilador.start();
      oscilador.stop(momento);
      return oscilador;
    });
  }

  detener(): void {
    for (const oscilador of this.osciladores) {
      try {
        oscilador.stop();
      } catch {
        // Ya se había detenido solo.
      }
    }
    this.osciladores = [];
    this.vibrar([]);
  }

  /** Si el usuario dio permiso, también avisa el sistema operativo (aunque la pestaña no esté a la vista). */
  avisarAlSistema(aviso: AvisoSistema): void {
    if (this.permisoSistema() !== 'granted') {
      return;
    }
    try {
      new Notification(aviso.titulo, {
        body: aviso.cuerpo,
        tag: aviso.etiqueta,
        requireInteraction: true,
      });
    } catch {
      // Algunos celulares solo permiten avisos desde un service worker: queda el aviso en pantalla.
    }
  }

  /** «granted», «denied», «default» o null si el navegador no tiene avisos del sistema. */
  permisoSistema(): NotificationPermission | null {
    return typeof Notification === 'undefined' ? null : Notification.permission;
  }

  pedirPermisoSistema(): Promise<NotificationPermission | null> {
    return typeof Notification === 'undefined'
      ? Promise.resolve(null)
      : Notification.requestPermission().catch(() => null);
  }

  private crearContexto(): AudioContext | null {
    if (this.contexto === null && typeof AudioContext !== 'undefined') {
      try {
        this.contexto = new AudioContext();
      } catch {
        return null;
      }
    }
    return this.contexto;
  }

  private vibrar(patron: readonly number[]): void {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([...patron]);
    }
  }
}
