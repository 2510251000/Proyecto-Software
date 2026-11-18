import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { CODIGOS_HTTP } from '../../core/constants/http.constants';
import { TEXTOS_AUTH } from '../../core/constants/mensajes.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { RespuestaAutenticacion } from '../../core/models/respuesta-autenticacion.model';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { CANCELACIONES_GOOGLE, codigoFirebase, esNavegadorDeApp } from '../../core/services/proveedor-google';

/**
 * «Continuar con Google» del login y del registro. Solo aparece si el ambiente tiene Firebase.
 * Quien entra por primera vez todavía no tiene municipio: va a su perfil a elegirlo; los demás,
 * a la portada.
 */
@Component({
  selector: 'app-boton-google',
  templateUrl: './boton-google.html',
  styleUrl: './boton-google.css',
})
export class BotonGoogle {
  private readonly auth = inject(AuthService);
  private readonly perfiles = inject(PerfilService);
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_AUTH;
  protected readonly disponible = this.auth.googleDisponible;
  /** Dentro de WhatsApp, Instagram… Google no deja entrar: se explica cómo abrir el navegador. */
  protected readonly dentroDeApp = esNavegadorDeApp();
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.disponible && !this.dentroDeApp) {
      // Safari solo abre la ventana de Google si al tocar no hay nada que descargar.
      this.auth.prepararGoogle();
      // Si Safari bloqueó la ventana, se fue a Google por redirección: al volver se termina aquí.
      this.continuar(this.auth.retomarGoogle());
    }
  }

  protected entrar(): void {
    if (this.cargando()) {
      return;
    }
    this.error.set(null);
    this.continuar(this.auth.iniciarSesionConGoogle());
  }

  /** Con la sesión iniciada, va al perfil (si aún no tiene municipio) o a la portada. */
  private continuar(inicio: Observable<RespuestaAutenticacion | null>): void {
    this.cargando.set(true);
    inicio
      .pipe(
        switchMap((respuesta) =>
          respuesta === null
            ? of(null)
            : this.perfiles.obtener().pipe(
                map((perfil) => (perfil.ciudad === null ? RUTAS.perfil : RUTAS.noticias)),
                // Si el perfil no llega, igual ya tiene sesión: a la portada.
                catchError(() => of(RUTAS.noticias)),
              ),
        ),
      )
      .subscribe({
        next: (destino) => {
          if (destino === null) {
            this.cargando.set(false); // no venía de Google: no hay nada que hacer
            return;
          }
          void this.router.navigate(['/', destino]).then(() => this.cargando.set(false));
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.error.set(mensajeDe(error));
        },
      });
  }
}

/** null si la persona solo cerró la ventana de Google; si no, el mensaje que se le muestra. */
function mensajeDe(error: unknown): string | null {
  const codigo = codigoFirebase(error);
  if (codigo !== null && CANCELACIONES_GOOGLE.includes(codigo)) {
    return null;
  }
  if (esErrorApi(error) && error.estado !== CODIGOS_HTTP.noAutorizado) {
    return error.mensaje;
  }
  return TEXTOS_AUTH.errorGoogle;
}

function esErrorApi(error: unknown): error is ErrorApi {
  return typeof error === 'object' && error !== null && 'estado' in error && 'mensaje' in error;
}
