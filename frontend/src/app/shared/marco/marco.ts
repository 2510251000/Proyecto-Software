import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { PerfilService } from '../../core/services/perfil.service';
import { Logo } from '../logo/logo';
import { Navegacion } from '../navegacion/navegacion';
import { BarraInferior } from './barra-inferior/barra-inferior';
import { BarraMovil } from './barra-movil/barra-movil';
import { UsuarioMarco } from './usuario-marco/usuario-marco';

/**
 * Marco común de las pantallas con sesión. Desde tableta: el menú lateral (logo, destinos,
 * «Publicar» y la cuenta) y, a la derecha, el contenido. En el celular: una barra arriba
 * con el logo y las iniciales, y el menú fijo abajo.
 */
@Component({
  selector: 'app-marco',
  imports: [BarraInferior, BarraMovil, Logo, Navegacion, RouterLink, UsuarioMarco],
  templateUrl: './marco.html',
  styleUrl: './marco.css',
})
export class Marco {
  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;

  /** Si el perfil no llega, el menú sigue funcionando; solo se omite el nombre. */
  protected readonly perfil = toSignal(
    inject(PerfilService)
      .obtener()
      .pipe(catchError(() => of(null))),
    { initialValue: null },
  );
}
