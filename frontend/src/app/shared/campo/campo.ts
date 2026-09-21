import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-campo',
  imports: [ReactiveFormsModule],
  templateUrl: './campo.html',
  styleUrl: './campo.css',
})
export class Campo {
  readonly idCampo = input.required<string>();
  readonly etiqueta = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly tipo = input<'text' | 'email' | 'password'>('text');
  readonly autocompletar = input('off');
  /** Mensaje a mostrar por cada error de validación. Se muestra el primero que aplique, en el orden dado. */
  readonly errores = input<Readonly<Record<string, string>>>({});
  /** Error que no es del campo mismo sino del grupo (p. ej. contraseñas distintas). Se muestra si el campo no tiene errores propios. */
  readonly errorExtra = input<string | null>(null);

  protected readonly idError = computed(() => `${this.idCampo()}-error`);

  protected mensajeError(): string | null {
    const control = this.control();
    if (!(control.touched || control.dirty)) {
      return null;
    }
    const clave = control.invalid
      ? Object.keys(this.errores()).find((k) => control.hasError(k))
      : undefined;
    return clave === undefined ? this.errorExtra() : this.errores()[clave];
  }
}
