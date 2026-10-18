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
  /** true para un texto largo (textarea). */
  readonly multilinea = input(false);
  readonly filas = input(6);
  /** Largo máximo que deja escribir el navegador; null = sin tope. */
  readonly maximo = input<number | null>(null);
  /** Texto de ayuda debajo del campo. */
  readonly ayuda = input<string | null>(null);
  /** Mensaje a mostrar por cada error de validación. Se muestra el primero que aplique, en el orden dado. */
  readonly errores = input<Readonly<Record<string, string>>>({});
  /** Error que no es del campo mismo sino del grupo (p. ej. contraseñas distintas). Se muestra si el campo no tiene errores propios. */
  readonly errorExtra = input<string | null>(null);

  protected readonly idError = computed(() => `${this.idCampo()}-error`);
  protected readonly idAyuda = computed(() => `${this.idCampo()}-ayuda`);

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

  /** Ids que describen el campo: la ayuda y el error, si los hay. */
  protected descripcion(mensaje: string | null): string | null {
    const ids = [this.ayuda() !== null ? this.idAyuda() : null, mensaje !== null ? this.idError() : null];
    const unidos = ids.filter((id) => id !== null).join(' ');
    return unidos === '' ? null : unidos;
  }
}
