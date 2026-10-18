/** Letras mínimas para buscar un municipio (el backend pide lo mismo). */
export const LETRAS_MINIMAS_BUSQUEDA = 3;

export const MENSAJES_UBICACION = {
  gpsNoDisponible: 'Este navegador no puede compartir tu ubicación. Busca tu municipio por nombre.',
  permisoDenegado:
    'El navegador tiene bloqueado el permiso de ubicación para esta página. Actívalo en el candado de la barra de direcciones, o busca tu municipio por nombre.',
  posicionNoDisponible:
    'El navegador no pudo calcular tu ubicación. Revisa que la ubicación esté activada en Windows (Configuración › Privacidad › Ubicación), o busca tu municipio por nombre.',
  sinRespuesta:
    'El navegador no respondió con tu ubicación. Si apareció un aviso de permiso, elige «Permitir»; si no, busca tu municipio por nombre.',
  sitioNoSeguro:
    'El navegador solo comparte la ubicación en páginas seguras (https o localhost). Busca tu municipio por nombre.',
  sinResultados: 'No encontramos municipios con ese nombre.',
  busquedaCorta: `Escribe al menos ${LETRAS_MINIMAS_BUSQUEDA} letras.`,
  ciudadObligatoria: 'Elige tu municipio.',
} as const;

export const TEXTOS_UBICACION = {
  etiqueta: 'Municipio',
  usarMiUbicacion: 'Usar mi ubicación',
  buscarEtiqueta: 'Buscar municipio por nombre',
  buscar: 'Buscar',
  cambiar: 'Cambiar',
  elegida: 'Municipio elegido',
  catalogo: 'O elige uno de los municipios ya registrados',
  catalogoVacio: 'Elegir…',
  fuente: 'Ubicación obtenida con',
  proveedores: { google: 'Google Maps', nominatim: 'OpenStreetMap (Nominatim)' } as Readonly<
    Record<string, string>
  >,
  ayuda:
    'Usamos tu ubicación solo para saber tu municipio y avisarte de lo que se publica allí.',
} as const;
