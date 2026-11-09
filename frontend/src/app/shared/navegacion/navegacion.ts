import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { AuthService } from '../../core/services/auth.service';
import { CampanaNotificaciones } from '../../core/services/campana-notificaciones';

/**
 * Destinos del menú lateral: portada, mapa, avisos (con cuántos hay sin leer),
 * perfil y administración (solo administradores).
 */
@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.css',
})
export class Navegacion implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly campana = inject(CampanaNotificaciones);
  private readonly destruccion = inject(DestroyRef);

  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;
  protected readonly noLeidas = this.campana.noLeidas;
  protected readonly esAdministrador = this.auth.obtenerContenidoToken()?.rol === ROLES.administrador;

  ngOnInit(): void {
    this.campana.vigilar(this.destruccion);
  }
}
