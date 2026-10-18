import { TipoNotificacion } from '../models/notificacion.model';
import { EstadoNoticia, TipoNoticias } from '../models/noticia.model';

/** Menú principal que se ve en todas las pantallas con sesión. */
export const TEXTOS_NAVEGACION = {
  menu: 'Menú principal',
  portada: 'Portada',
  publicar: 'Publicar',
  notificaciones: 'Notificaciones',
  sinLeer: 'sin leer',
  perfil: 'Mi perfil',
  admin: 'Administración',
  salir: 'Salir',
} as const;

export const TEXTOS_BUSQUEDA = {
  etiqueta: 'Buscar noticias',
  marcador: 'Buscar por palabra: agua, vía, feria…',
  buscar: 'Buscar',
  limpiar: 'Quitar búsqueda',
  resultadosPara: 'Resultados para',
  tipos: 'Tipo de noticia',
} as const;

export const ETIQUETAS_TIPO: Readonly<Record<TipoNoticias, string>> = {
  TODAS: 'Todas',
  OFICIALES: 'Oficiales',
  COMUNITARIAS: 'Comunidad',
};

export const TEXTOS_PUBLICAR = {
  titulo: 'Publicar una noticia',
  bajadaComun: 'Cuenta lo que pasa en tu municipio. Avisaremos a quienes viven allí.',
  bajadaAdmin: 'Como administrador, tu publicación sale como información oficial.',
  campoTitulo: 'Titular',
  campoResumen: 'Resumen (opcional)',
  campoContenido: 'Noticia completa',
  ayudaContenido: 'Separa los párrafos con un salto de línea.',
  publicar: 'Publicar noticia',
  cupoIlimitado: 'Publicas sin límite diario.',
  cupoAgotado: 'Ya usaste todas tus publicaciones de hoy. Mañana podrás publicar de nuevo.',
  sube: 'Sube de nivel para publicar más cada día.',
} as const;

/** «Te quedan 2 de 3 publicaciones hoy». */
export function textoCupo(restantes: number, limite: number): string {
  const palabra = limite === 1 ? 'publicación' : 'publicaciones';
  return `Te ${restantes === 1 ? 'queda' : 'quedan'} ${restantes} de ${limite} ${palabra} hoy.`;
}

export const MENSAJES_PUBLICAR = {
  tituloObligatorio: 'Escribe un titular.',
  tituloLargo: 'El titular es muy largo.',
  resumenLargo: 'El resumen es muy largo.',
  contenidoObligatorio: 'Escribe la noticia.',
} as const;

export const TEXTOS_PERFIL = {
  titulo: 'Mi perfil',
  nombre: 'Nombre',
  correo: 'Correo',
  nivel: 'Nivel',
  puntos: 'puntos',
  siguiente: 'Te faltan',
  para: 'para el nivel',
  maximo: 'Estás en el nivel más alto.',
  hoy: 'Hoy',
  publicadas: 'publicadas',
  limiteDiario: 'por día',
  sinLimite: 'Sin límite diario',
  regla:
    'Cada noticia que publicas suma puntos. Si un administrador oculta o borra una de tus noticias, pierdes puntos. Los niveles altos publican más noticias al día y sus noticias se recomiendan más.',
  guardar: 'Guardar cambios',
  guardado: 'Tus datos quedaron guardados.',
  rolAdmin: 'Administrador',
} as const;

export const TEXTOS_NOTIFICACIONES = {
  titulo: 'Notificaciones',
  vacio: 'No tienes notificaciones todavía.',
  marcarTodas: 'Marcar todas como leídas',
  verNoticia: 'Ver la noticia',
  nueva: 'Nueva',
} as const;

export const ETIQUETAS_NOTIFICACION: Readonly<Record<TipoNotificacion, string>> = {
  CERCANIA: 'En tu municipio',
  ASCENSO_NIVEL: 'Tu nivel',
  MODERACION: 'Moderación',
  COMENTARIO: 'Comentario',
  CALIFICACION: 'Calificación',
};

export const TEXTOS_ADMIN = {
  titulo: 'Administración',
  pestanas: 'Secciones del panel',
  noticias: 'Noticias',
  usuarios: 'Usuarios',
  filtroEstado: 'Estado',
  filtroTipo: 'Tipo',
  todos: 'Todos',
  ocultar: 'Ocultar',
  publicar: 'Volver a publicar',
  borrar: 'Borrar',
  confirmarBorrado: '¿Borrar esta noticia? No se puede deshacer.',
  sinNoticias: 'No hay noticias con esos filtros.',
  sinUsuarios: 'No hay usuarios registrados.',
  activar: 'Activar',
  desactivar: 'Desactivar',
  inactivo: 'Desactivada',
  nivel: 'Nivel',
  puntos: 'pts',
  admin: 'Administrador',
  comun: 'Usuario',
  oficial: 'Oficial',
  comunidad: 'Comunidad',
  por: 'por',
} as const;

export const ETIQUETAS_ESTADO: Readonly<Record<EstadoNoticia, string>> = {
  PUBLICADA: 'Publicada',
  OCULTA: 'Oculta',
  ELIMINADA: 'Borrada',
};

/** Niveles que el administrador puede asignar (los mismos de la tabla nivel). */
export const NIVELES_ASIGNABLES: readonly number[] = [1, 2, 3];
