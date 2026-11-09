import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { CampanaNotificaciones } from '../../../core/services/campana-notificaciones';

/**
 * Menú del celular, fijo abajo: portada, publicar (el botón ámbar), mapa y
 * avisos con cuántos hay sin leer. La consulta de la campana la arranca el menú lateral.
 */
@Component({
  selector: 'app-barra-inferior',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-inferior.html',
  styleUrl: './barra-inferior.css',
})
export class BarraInferior {
  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;
  protected readonly noLeidas = inject(CampanaNotificaciones).noLeidas;
}
