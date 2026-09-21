import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ERRORES_CONTRASENA,
  ERRORES_CORREO,
  MENSAJES_SESION,
} from '../../../core/constants/mensajes.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { LONGITUD_MINIMA_CONTRASENA } from '../../../core/constants/validacion.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuthService } from '../../../core/services/auth.service';
import { Boton } from '../../../shared/boton/boton';
import { Campo } from '../../../shared/campo/campo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Campo, Boton],
  templateUrl: './login.html',
  styleUrl: '../auth.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly formulario = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(LONGITUD_MINIMA_CONTRASENA)]],
  });

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso =
    inject(ActivatedRoute).snapshot.queryParamMap.get(PARAMETROS_URL.motivo) ===
    MOTIVOS_LOGIN.sesionExpirada
      ? MENSAJES_SESION.expirada
      : null;

  protected readonly rutas = RUTAS;
  protected readonly erroresCorreo = ERRORES_CORREO;
  protected readonly erroresContrasena = ERRORES_CONTRASENA;

  protected enviar(): void {
    if (this.cargando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.auth.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: () => void this.router.navigate([RUTAS.noticias]),
      error: (error: ErrorApi) => {
        this.error.set(error.mensaje);
        this.cargando.set(false);
      },
    });
  }
}
