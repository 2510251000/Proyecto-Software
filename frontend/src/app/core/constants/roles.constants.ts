export const ROLES = {
  usuarioComun: 'USUARIO_COMUN',
  administrador: 'ADMINISTRADOR',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];
