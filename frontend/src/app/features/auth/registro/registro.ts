import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';
import {
  ERRORES_CONFIRMACION,
  ERRORES_CONTRASENA,
  ERRORES_CORREO,
  ERRORES_NOMBRE,
  MENSAJES_VALIDACION,
  TEXTOS_AUTH,
} from '../../../core/constants/mensajes.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import {
  ERROR_CONTRASENAS_DISTINTAS,
  LONGITUD_MAXIMA_NOMBRE,
  LONGITUD_MINIMA_CONTRASENA,
} from '../../../core/constants/validacion.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Ciudad } from '../../../core/models/ubicacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { Boton } from '../../../shared/boton/boton';
import { Campo } from '../../../shared/campo/campo';
import { PanelMarca } from '../panel-marca/panel-marca';
import { SelectorCiudad } from '../../../shared/selector-ciudad/selector-ciudad';
import { contrasenasIguales } from '../../../shared/validadores/contrasenas-iguales';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Campo, Boton, PanelMarca, SelectorCiudad],
  templateUrl: './registro.html',
  styleUrl: '../auth.css',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly formulario = this.fb.group(
    {
      nombre: ['', [Validators.maxLength(LONGITUD_MAXIMA_NOMBRE)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(LONGITUD_MINIMA_CONTRASENA)]],
      confirmacion: ['', [Validators.required]],
      // La ciudad la pone el selector, que la obtiene con la API de mapas.
      ciudadId: this.fb.control<number | null>(null, Validators.required),
    },
    { validators: contrasenasIguales },
  );

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly titular = TEXTOS_PANEL_MARCA.titularRegistro;
  protected readonly textos = TEXTOS_AUTH;
  protected readonly rutas = RUTAS;
  protected readonly erroresCorreo = ERRORES_CORREO;
  protected readonly erroresContrasena = ERRORES_CONTRASENA;
  protected readonly erroresConfirmacion = ERRORES_CONFIRMACION;
  protected readonly erroresNombre = ERRORES_NOMBRE;
  protected readonly longitudNombre = LONGITUD_MAXIMA_NOMBRE;

  protected elegirCiudad(ciudad: Ciudad): void {
    this.formulario.controls.ciudadId.setValue(ciudad.id);
  }

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

    const { nombre, correo, contrasena, ciudadId } = this.formulario.getRawValue();
    if (ciudadId === null) {
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    const nombreLimpio = nombre.trim();
    this.auth
      .registrar({
        correo,
        contrasena,
        ciudadId,
        ...(nombreLimpio ? { nombre: nombreLimpio } : {}),
      })
      .subscribe({
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
