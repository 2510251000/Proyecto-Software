import { Rol } from '../constants/roles.constants';

export interface ContenidoToken {
  sub: string;
  rol: Rol;
  id: number;
  iat: number;
  exp: number;
}
