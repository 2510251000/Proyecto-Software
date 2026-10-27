import { Rol } from '../constants/roles.constants';

export interface RespuestaRegistro {
  id: number;
  correo: string;
  rol: Rol;
}
