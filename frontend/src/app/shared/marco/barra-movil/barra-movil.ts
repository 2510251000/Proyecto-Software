import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ID_BUSQUEDA_NOTICIAS, TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { AuthService } from '../../../core/services/auth.service';
import { iniciales } from '../../../core/utils/texto';
import { Logo } from '../../logo/logo';

/**
 * Barra de arriba en el celular: el logo, la lupa (lleva al campo de búsqueda de la
 * portada), administración si es administrador y el cuadro con las iniciales (Mi perfil).
 */
@Component({
  selector: 'app-barra-movil',
  imports: [Logo, RouterLink],
  templateUrl: './barra-movil.html',
  styleUrl: './barra-movil.css',
})
export class BarraMovil {
  private readonly router = inject(Router);

  readonly perfil = input<Perfil | null>(null);

  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutas = RUTAS;
  protected readonly esAdministrador = inject(AuthService).obtenerContenidoToken()?.rol === ROLES.administrador;

  protected readonly iniciales = computed(() => {
    const perfil = this.perfil();
    return perfil ? iniciales(perfil.nombre?.trim() || perfil.correo) : '';
  });

  /** Va a la portada (si no estaba ahí) y pone el cursor en la búsqueda. */
  protected async buscar(): Promise<void> {
    await this.router.navigate(['/', RUTAS.noticias]);
    // La portada puede tardar un ciclo en dibujar el campo después de navegar.
    setTimeout(() => document.getElementById(ID_BUSQUEDA_NOTICIAS)?.focus());
  }
}
