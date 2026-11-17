import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { CODIGOS_HTTP } from '../../core/constants/http.constants';
import { TEXTOS_AUTH } from '../../core/constants/mensajes.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { CANCELACIONES_GOOGLE, codigoFirebase } from '../../core/services/proveedor-google';

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
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected entrar(): void {
    if (this.cargando()) {
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.auth
      .iniciarSesionConGoogle()
      .pipe(
        switchMap(() =>
          this.perfiles.obtener().pipe(
            map((perfil) => (perfil.ciudad === null ? RUTAS.perfil : RUTAS.noticias)),
            // Si el perfil no llega, igual ya tiene sesión: a la portada.
            catchError(() => of(RUTAS.noticias)),
          ),
        ),
      )
      .subscribe({
        next: (destino) => {
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
