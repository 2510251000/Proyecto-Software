import { Rol } from '../constants/roles.constants';

/** Una cuenta en el panel de administración (GET /api/admin/usuarios). */
export interface UsuarioAdmin {
  id: number;
  correo: string;
  nombre: string | null;
  rol: Rol;
  activo: boolean;
  nivel: number;
  nivelNombre: string;
  puntaje: number;
  ciudad: string | null;
  fechaRegistro: string;
}

/** Cuerpo de PUT /api/admin/usuarios/{id}. Lo que no se manda no cambia. */
export interface CambiosUsuario {
  activo?: boolean;
  rol?: Rol;
  nivel?: number;
}
