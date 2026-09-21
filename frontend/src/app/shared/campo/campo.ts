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

  protected readonly idError = computed(() => `${this.idCampo()}-error`);

  protected mensajeError(): string | null {
    const control = this.control();
    if (!control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    const clave = Object.keys(this.errores()).find((k) => control.hasError(k));
    return clave === undefined ? null : this.errores()[clave];
  }
}
