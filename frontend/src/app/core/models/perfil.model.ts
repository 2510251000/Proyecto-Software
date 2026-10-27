import { Rol } from '../constants/roles.constants';
import { Ciudad } from './ubicacion.model';

export interface NivelUsuario {
  numero: number;
  nombre: string;
  puntajeMinimo: number;
  limiteNoticiasDiarias: number;
}

export interface CupoDiario {
  limite: number;
  publicadasHoy: number;
  /** null cuando el cupo es ilimitado (administradores). */
  restantes: number | null;
  ilimitado: boolean;
}

/** Respuesta de GET /api/usuarios/me. */
export interface Perfil {
  id: number;
  correo: string;
  nombre: string | null;
  rol: Rol;
  /** Nombre del nivel (Básico, Activo, Corresponsal Certificado). */
  nivel: string;
  nivelNumero: number;
  puntaje: number;
  siguienteNivel: NivelUsuario | null;
  ciudad: Ciudad | null;
  cupo: CupoDiario;
  fechaRegistro: string;
}

/** Cuerpo de PUT /api/usuarios/me. */
export interface CambiosPerfil {
  nombre?: string;
  ciudadId?: number;
}
