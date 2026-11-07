import { Component, input, output, signal } from '@angular/core';
import {
  ETIQUETAS_PESTANA,
  ID_BUSQUEDA_NOTICIAS,
  TEXTOS_BUSQUEDA,
} from '../../../core/constants/pantallas.constants';
import { PestanaPortada } from '../../../core/models/noticia.model';
import { ConteoCiudad } from '../listado/filtro-portada';

const PESTANAS: readonly PestanaPortada[] = ['RECOMENDADAS', 'RECIENTES', 'OFICIALES', 'COMUNITARIAS'];

/**
 * Barra superior de la portada: las cuatro pestañas (una sola activa), el municipio con
 * cuántas noticias tiene y la búsqueda por palabra (la hace el backend al presionar Enter).
 */
@Component({
  selector: 'app-barra-portada',
  templateUrl: './barra-portada.html',
  styleUrl: './barra-portada.css',
})
export class BarraPortada {
  readonly pestanaActiva = input<PestanaPortada>('RECOMENDADAS');
  readonly ciudades = input<readonly ConteoCiudad[]>([]);
  /** Municipio elegido; null cuando se ven todos. */
  readonly ciudadActiva = input<string | null>(null);
  readonly total = input(0);
  /** Texto con el que se cargó el listado actual ('' = sin búsqueda). */
  readonly textoActivo = input('');

  readonly pestana = output<PestanaPortada>();
  readonly ciudad = output<string | null>();
  readonly buscar = output<string>();

  protected readonly textos = TEXTOS_BUSQUEDA;
  protected readonly etiquetas = ETIQUETAS_PESTANA;
  protected readonly pestanas = PESTANAS;
  protected readonly idCampo = ID_BUSQUEDA_NOTICIAS;
  protected readonly escrito = signal('');

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

  protected limpiar(): void {
    this.escrito.set('');
    this.buscar.emit('');
  }
}
