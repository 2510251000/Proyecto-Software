import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { AuthService } from '../../../core/services/auth.service';
import { iniciales } from '../../../core/utils/texto';

/**
 * Quién tiene la sesión abierta, su nivel y municipio, y «Salir». Va en el menú de la cuenta
 * de la barra superior y, en tableta y celular, al final de «Mi perfil».
 */
@Component({
  selector: 'app-usuario-marco',
  templateUrl: './usuario-marco.html',
  styleUrl: './usuario-marco.css',
})
export class UsuarioMarco {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** null mientras llega el perfil o si no se pudo cargar. */
  readonly perfil = input<Perfil | null>(null);

  protected readonly textos = TEXTOS_NAVEGACION;

  protected readonly nombre = computed(() => {
    const perfil = this.perfil();
    return perfil ? (perfil.nombre?.trim() || perfil.correo) : '';
  });

  protected readonly iniciales = computed(() => iniciales(this.nombre()));

  /** «Nivel 2 · Fusagasugá», o solo el nivel si no tiene municipio. */
  protected readonly detalle = computed(() => {
    const perfil = this.perfil();
    if (!perfil) {
      return '';
    }
    const nivel = `${TEXTOS_NAVEGACION.nivel} ${perfil.nivelNumero}`;
    return perfil.ciudad ? `${nivel} · ${perfil.ciudad.nombre}` : nivel;
  });

  protected salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigate([RUTAS.login]);
  }
}
