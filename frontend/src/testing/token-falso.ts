import { ROLES } from '../app/core/constants/roles.constants';

export function ahoraEnSegundos(): number {
  return Math.floor(Date.now() / 1000);
}

export function crearToken(exp: number): string {
  const contenido = { sub: 'a@b.co', rol: ROLES.usuarioComun, id: 1, iat: 0, exp };
  const cuerpo = btoa(JSON.stringify(contenido))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `cabecera.${cuerpo}.firma`;
}
