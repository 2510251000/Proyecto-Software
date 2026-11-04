/**
 * Tiempos de las animaciones de la entrada (login) y de «Hoy», en milisegundos.
 * Los componentes los pasan al CSS como variables (--duracion-…), así que cambiarlos aquí
 * cambia también la animación.
 */
export const TIEMPOS_ENTRADA = {
  /** Toda la entrada del login: el sol sale, se oculta y aparece el formulario. */
  total: 4800,
  /** Momento en que la tarjeta del formulario empieza a aparecer. */
  tarjeta: 3900,
  /** Transición «amanece» después de iniciar sesión, antes de ir a «Hoy». */
  amanecer: 1600,
} as const;

export const TIEMPOS_HOY = {
  /** Saludo y nombre del municipio antes de la primera historia. */
  intro: 3400,
  /** Lo que dura cada historia en pantalla. */
  historia: 5000,
  /** Mantener presionado más de esto (en celular) pausa la historia. */
  presionLarga: 250,
  /** Nombre del municipio letra por letra: cuándo empieza y cuánto espera cada letra. */
  inicioLetras: 350,
  pasoLetra: 60,
  /** Titular de la historia palabra por palabra. */
  inicioPalabras: 250,
  pasoPalabra: 70,
  /** «Cerca de ti»: cada noticia entra un poco después de la anterior. */
  pasoCercaDeTi: 150,
} as const;

/** Consulta de medios del sistema operativo «reducir movimiento». */
export const CONSULTA_REDUCIR_MOVIMIENTO = '(prefers-reduced-motion: reduce)';
