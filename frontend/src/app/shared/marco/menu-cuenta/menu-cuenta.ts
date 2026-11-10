import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { etiquetaCuenta, TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { iniciales } from '../../../core/utils/texto';
import { UsuarioMarco } from '../usuario-marco/usuario-marco';

/** Cada menú necesita un id propio para enlazar el botón con lo que abre. */
let menusCreados = 0;

/**
 * Círculo con las iniciales al final de la barra superior. Al tocarlo abre un menú pequeño
 * con el nombre, el nivel y el municipio, «Mi perfil» y «Salir». Se cierra con Escape y al
 * hacer clic afuera.
 */
@Component({
  selector: 'app-menu-cuenta',
  imports: [RouterLink, UsuarioMarco],
  templateUrl: './menu-cuenta.html',
  styleUrl: './menu-cuenta.css',
  host: {
    '(document:click)': 'alHacerClicEnLaPagina($event)',
    '(keydown.escape)': 'cerrarConEscape()',
  },
})
export class MenuCuenta {
  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');

  /** null mientras llega el perfil o si no se pudo cargar: el menú sigue teniendo «Salir». */
  readonly perfil = input<Perfil | null>(null);

  protected readonly textos = TEXTOS_NAVEGACION;
  protected readonly rutaPerfil = ['/', RUTAS.perfil];
  protected readonly idPanel = `menu-cuenta-${++menusCreados}`;
  protected readonly abierto = signal(false);

  private readonly nombre = computed(() => {
    const perfil = this.perfil();
    return perfil ? perfil.nombre?.trim() || perfil.correo : '';
  });

  protected readonly iniciales = computed(() => iniciales(this.nombre()));

  /** «Tu cuenta: Carlos Activo, nivel 2», o solo «Tu cuenta» sin perfil. */
  protected readonly etiqueta = computed(() => {
    const perfil = this.perfil();
    return perfil ? etiquetaCuenta(this.nombre(), perfil.nivelNumero) : TEXTOS_NAVEGACION.usuario;
  });

  protected alternar(): void {
    this.abierto.update((abierto) => !abierto);
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  /** Con Escape el foco vuelve al círculo, para no perder el sitio con el teclado. */
  protected cerrarConEscape(): void {
    if (this.abierto()) {
      this.cerrar();
      this.boton().nativeElement.focus();
    }
  }

  protected alHacerClicEnLaPagina(evento: Event): void {
    if (this.abierto() && evento.target instanceof Node && !this.anfitrion.nativeElement.contains(evento.target)) {
      this.cerrar();
    }
  }
}
