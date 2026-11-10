import { Component, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DESPLAZAMIENTO_BARRA_SOLIDA, TEXTOS_NAVEGACION } from '../../core/constants/pantallas.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { PerfilService } from '../../core/services/perfil.service';
import { Logo } from '../logo/logo';
import { Navegacion } from '../navegacion/navegacion';
import { BarraInferior } from './barra-inferior/barra-inferior';
import { BarraMovil } from './barra-movil/barra-movil';
import { MenuCuenta } from './menu-cuenta/menu-cuenta';

/**
 * Marco común de las pantallas con sesión. En computador: una barra arriba (logo, destinos,
 * «Publicar» y la cuenta) y, debajo, el contenido. En tableta y celular: una barra arriba
 * con el logo y las iniciales, y el menú fijo abajo.
 *
 * La pantalla puede agregar controles a la barra marcándolos con el atributo
 * `marcoHerramientas` (la portada pone ahí la búsqueda y el municipio).
 */
@Component({
  selector: 'app-marco',
  imports: [BarraInferior, BarraMovil, Logo, MenuCuenta, Navegacion, RouterLink],
  templateUrl: './marco.html',
  styleUrl: './marco.css',
  host: { '(window:scroll)': 'alDesplazar()' },
})
export class Marco {
  /**
   * La pantalla empieza con una foto a todo el ancho (la portada): la barra va transparente
   * sobre ella, se queda pegada arriba y toma su fondo azul al bajar un poco.
   */
  readonly sobreFoto = input(false);

  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;
  protected readonly desplazada = signal(false);

  protected alDesplazar(): void {
    this.desplazada.set(window.scrollY > DESPLAZAMIENTO_BARRA_SOLIDA);
  }

  /** Si el perfil no llega, el menú sigue funcionando; solo se omite el nombre. */
  protected readonly perfil = toSignal(
    inject(PerfilService)
      .obtener()
      .pipe(catchError(() => of(null))),
    { initialValue: null },
  );
}
