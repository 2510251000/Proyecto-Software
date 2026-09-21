import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ERROR_CONTRASENAS_DISTINTAS } from '../../core/constants/validacion.constants';

/** Validador de grupo: los controles "contrasena" y "confirmacion" deben tener el mismo valor. */
export const contrasenasIguales: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const contrasena = grupo.get('contrasena')?.value as string | undefined;
  const confirmacion = grupo.get('confirmacion')?.value as string | undefined;
  return contrasena === confirmacion ? null : { [ERROR_CONTRASENAS_DISTINTAS]: true };
};
