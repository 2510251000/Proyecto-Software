import { TipoNotificacion } from '../models/notificacion.model';
import { EstadoNoticia, PestanaPortada, TipoNoticias } from '../models/noticia.model';

/** Menú principal que se ve en todas las pantallas con sesión. */
export const TEXTOS_NAVEGACION = {
  menu: 'Menú principal',
  portada: 'Portada',
  mapa: 'Mapa',
  publicar: 'Publicar',
  notificaciones: 'Avisos',
  sinLeer: 'sin leer',
  perfil: 'Mi perfil',
  admin: 'Administración',
  salir: 'Salir',
  /** Nombre de la barra inferior (tableta y celular). */
  lateral: 'Menú',
  usuario: 'Tu cuenta',
  nivel: 'Nivel',
  buscar: 'Buscar noticias',
} as const;

/** Nombre accesible del círculo de la cuenta: «Tu cuenta: Carlos Activo, nivel 2». */
export function etiquetaCuenta(nombre: string, nivel: number): string {
  return `${TEXTOS_NAVEGACION.usuario}: ${nombre}, ${TEXTOS_NAVEGACION.nivel.toLowerCase()} ${nivel}`;
}

/** Id del campo de búsqueda de la portada: la lupa del celular lleva el foco ahí. */
export const ID_BUSQUEDA_NOTICIAS = 'busqueda-noticias';

export const TEXTOS_BUSQUEDA = {
  etiqueta: 'Buscar noticias',
  marcador: 'Buscar noticias',
  limpiar: 'Quitar búsqueda',
  resultadosPara: 'Resultados para',
  pestanas: 'Qué noticias ver',
  municipio: 'Municipio',
  todosMunicipios: 'Todos los municipios',
} as const;

/** Pestañas de la barra superior de la portada, en el orden en que se muestran. */
export const ETIQUETAS_PESTANA: Readonly<Record<PestanaPortada, string>> = {
  RECOMENDADAS: 'Recomendadas',
  RECIENTES: 'Recientes',
  OFICIALES: 'Oficiales',
  COMUNITARIAS: 'Comunidad',
};

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
  aprobacion: 'Lo que opinan los lectores',
  sinVotos: 'Todavía nadie ha votado por lo que publicas.',
  regla:
    'Cada noticia que publicas suma puntos. Si un administrador oculta o borra una de tus noticias, pierdes puntos. Los niveles altos publican más noticias al día y sus noticias se recomiendan más.',
  guardar: 'Guardar cambios',
  guardado: 'Tus datos quedaron guardados.',
  rolAdmin: 'Administrador',
} as const;

export const TEXTOS_NOTIFICACIONES = {
  titulo: 'Avisos',
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
  CALIFICACION: 'Voto a tu noticia',
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
