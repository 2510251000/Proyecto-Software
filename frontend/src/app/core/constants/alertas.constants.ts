import { TipoAlerta } from '../models/alerta.model';

/** Cada cuánto se pregunta si llegó una alerta de emergencia (más seguido que la campana). */
export const INTERVALO_ALERTAS_MS = 15000;

/** Las tres clases de alerta, en el orden en que se ofrecen al publicar. */
export const TIPOS_ALERTA: readonly TipoAlerta[] = ['DESAPARICION', 'ROBO', 'EMERGENCIA'];

export const NOMBRES_ALERTA: Readonly<Record<TipoAlerta, string>> = {
  DESAPARICION: 'Desaparición',
  ROBO: 'Robo',
  EMERGENCIA: 'Emergencia',
};

export const AYUDAS_ALERTA: Readonly<Record<TipoAlerta, string>> = {
  DESAPARICION:
    'Se busca a una persona. Di cómo es, qué ropa llevaba y dónde la vieron por última vez.',
  ROBO: 'Un robo que acaba de pasar. Describe el vehículo, el objeto o a los responsables y hacia dónde fueron.',
  EMERGENCIA: 'Incendio, inundación, vía cerrada o un peligro inmediato para los vecinos.',
};

/**
 * Sirena al estilo de las alertas de emergencia de los celulares: dos tonos a la vez
 * (853 Hz y 960 Hz) con cadencia larga, corta, corta.
 */
export const SIRENA = {
  frecuencias: [853, 960],
  volumen: 0.18,
  /** Segundos encendida y apagada de cada pulso, en orden. */
  cadencia: [
    [2, 0.5],
    [1, 0.5],
    [1, 0.5],
  ],
  repeticiones: 2,
} as const;

/** Mismo ritmo para la vibración (milisegundos: vibra, pausa, vibra…). */
export const VIBRACION_ALERTA: readonly number[] = [
  2000, 500, 1000, 500, 1000, 500, 2000, 500, 1000, 500, 1000,
];

export const TEXTOS_ALERTA = {
  etiqueta: 'Alerta',
  enCiudad: 'en',
  verDetalles: 'Ver la alerta',
  entendido: 'Entendido',
  activarAvisos: 'Avisarme aunque la app esté en segundo plano',
  ayudaCompartir: 'Si tienes información, comenta en la noticia o llama a la línea 123.',
  // Publicar
  pregunta: '¿Es una alerta de emergencia?',
  ninguna: 'No, es una noticia',
  advertencia:
    'Todos los vecinos del municipio la recibirán al instante, a pantalla completa y con sonido. Úsala solo para emergencias reales: las alertas falsas se moderan.',
  publicarAlerta: 'Enviar alerta',
  // Detalle
  activa: 'Alerta activa',
  resuelta: 'Alerta resuelta',
  resolver: 'Marcar como resuelta',
  confirmarResolver: '¿Dar la alerta por resuelta? Se avisará a los vecinos.',
  // Portada
  vigentes: 'Alertas activas en tu municipio',
} as const;
