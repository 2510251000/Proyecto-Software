/** Ciudad del catálogo (GET /api/ubicacion/ciudades). */
export interface Ciudad {
  id: number;
  nombre: string;
  departamento: string;
  latitud: number | null;
  longitud: number | null;
}

/** Un resultado de la API de mapas (GET /api/ubicacion/buscar). */
export interface LugarEncontrado {
  idLugar: string;
  ciudad: string;
  departamento: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  proveedor: string;
}

/** Ciudad ya registrada que devuelve POST /api/ubicacion/resolver. */
export interface CiudadResuelta {
  id: number;
  nombre: string;
  departamento: string;
  latitud: number | null;
  longitud: number | null;
  proveedor: string;
}

/** Cuerpo de POST /api/ubicacion/resolver: un idLugar, o latitud y longitud. */
export type SolicitudResolverUbicacion = { idLugar: string } | { latitud: number; longitud: number };

/** Punto que entrega el GPS del navegador. */
export interface Coordenadas {
  latitud: number;
  longitud: number;
}
