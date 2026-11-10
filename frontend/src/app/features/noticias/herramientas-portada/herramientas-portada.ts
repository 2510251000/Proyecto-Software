import { Component, input, linkedSignal, output } from '@angular/core';
import { ID_BUSQUEDA_NOTICIAS, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { ConteoCiudad } from '../listado/filtro-portada';

/**
 * Lo que la portada agrega a la barra superior: la búsqueda por palabra (la hace el backend
 * al presionar Enter) y el municipio con cuántas noticias tiene. En tableta y celular va
 * debajo de la barra del logo.
 */
@Component({
  selector: 'app-herramientas-portada',
  templateUrl: './herramientas-portada.html',
  styleUrl: './herramientas-portada.css',
})
export class HerramientasPortada {
  readonly ciudades = input<readonly ConteoCiudad[]>([]);
  /** Municipio elegido; null cuando se ven todos. */
  readonly ciudadActiva = input<string | null>(null);
  readonly total = input(0);
  /** Texto con el que se cargó el listado actual ('' = sin búsqueda). */
  readonly textoActivo = input('');

  readonly ciudad = output<string | null>();
  readonly buscar = output<string>();

  protected readonly textos = TEXTOS_BUSQUEDA;
  protected readonly idCampo = ID_BUSQUEDA_NOTICIAS;
  /** Lo que hay escrito. Si la búsqueda se quita desde afuera, el campo se vacía solo. */
  protected readonly escrito = linkedSignal(() => this.textoActivo());

  protected elegirCiudad(evento: Event): void {
    if (evento.target instanceof HTMLSelectElement) {
      this.ciudad.emit(evento.target.value === '' ? null : evento.target.value);
    }
  }

  protected escribir(evento: Event): void {
    if (evento.target instanceof HTMLInputElement) {
      this.escrito.set(evento.target.value);
    }
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.buscar.emit(this.escrito().trim());
  }
}
