import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { AuthService } from '../../core/services/auth.service';
import { CampanaNotificaciones } from '../../core/services/campana-notificaciones';

/**
 * Menú principal sobre la banda azul: portada, publicar, notificaciones (con cuántas
 * hay sin leer), perfil, administración (solo administradores) y salir.
 */
@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.css',
})
export class Navegacion implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly campana = inject(CampanaNotificaciones);
  private readonly destruccion = inject(DestroyRef);

  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;
  protected readonly noLeidas = this.campana.noLeidas;
  protected readonly esAdministrador = this.auth.obtenerContenidoToken()?.rol === ROLES.administrador;

  ngOnInit(): void {
    this.campana.vigilar(this.destruccion);
  }

  protected salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigate([RUTAS.login]);
  }
}
