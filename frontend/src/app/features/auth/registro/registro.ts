import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';
import {
  ERRORES_CONFIRMACION,
  ERRORES_CONTRASENA,
  ERRORES_CORREO,
  MENSAJES_VALIDACION,
} from '../../../core/constants/mensajes.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import {
  ERROR_CONTRASENAS_DISTINTAS,
  LONGITUD_MINIMA_CONTRASENA,
} from '../../../core/constants/validacion.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuthService } from '../../../core/services/auth.service';
import { Boton } from '../../../shared/boton/boton';
import { Campo } from '../../../shared/campo/campo';
import { PanelMarca } from '../panel-marca/panel-marca';
import { contrasenasIguales } from '../../../shared/validadores/contrasenas-iguales';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Campo, Boton, PanelMarca],
  templateUrl: './registro.html',
  styleUrl: '../auth.css',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly formulario = this.fb.group(
    {
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(LONGITUD_MINIMA_CONTRASENA)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: contrasenasIguales },
  );

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly titular = TEXTOS_PANEL_MARCA.titularRegistro;
  protected readonly rutas = RUTAS;
  protected readonly erroresCorreo = ERRORES_CORREO;
  protected readonly erroresContrasena = ERRORES_CONTRASENA;
  protected readonly erroresConfirmacion = ERRORES_CONFIRMACION;

  protected errorContrasenasDistintas(): string | null {
    return this.formulario.hasError(ERROR_CONTRASENAS_DISTINTAS)
      ? MENSAJES_VALIDACION.contrasenasDistintas
      : null;
  }

  protected enviar(): void {
    if (this.cargando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { correo, contrasena } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.auth.registrar({ correo, contrasena }).subscribe({
      next: () =>
        void this.router.navigate([RUTAS.login], {
          queryParams: { [PARAMETROS_URL.motivo]: MOTIVOS_LOGIN.registroExitoso },
        }),
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.cargando.set(false);
      },
    });
  }
}
