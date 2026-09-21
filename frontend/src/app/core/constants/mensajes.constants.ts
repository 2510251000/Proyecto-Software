import { LONGITUD_MINIMA_CONTRASENA } from './validacion.constants';

export const MENSAJES_ERROR_HTTP = {
  validacion: 'Revisa los datos ingresados: alguno no es válido.',
  credencialesInvalidas: 'El correo o la contraseña son incorrectos.',
  correoRepetido: 'Ese correo ya está registrado.',
  generico: 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.',
} as const;

export const MENSAJES_VALIDACION = {
  correoObligatorio: 'El correo es obligatorio.',
  correoInvalido: 'Ingresa un correo con formato válido.',
  contrasenaObligatoria: 'La contraseña es obligatoria.',
  contrasenaCorta: `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
  confirmacionObligatoria: 'Confirma tu contraseña.',
  contrasenasDistintas: 'Las contraseñas no coinciden.',
} as const;

export const MENSAJES_EXITO = {
  registro: 'Cuenta creada correctamente. Ya puedes iniciar sesión.',
} as const;

export const TEXTOS_COMUNES = {
  cargando: 'Cargando…',
} as const;

export const MENSAJES_SESION = {
  expirada: 'Tu sesión expiró. Inicia sesión de nuevo.',
} as const;
