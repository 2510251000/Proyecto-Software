import { Component, input, output } from '@angular/core';
import { ETIQUETAS_PESTANA, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { PestanaPortada } from '../../../core/models/noticia.model';

const PESTANAS: readonly PestanaPortada[] = ['RECOMENDADAS', 'RECIENTES', 'OFICIALES', 'COMUNITARIAS'];

/**
 * Las cuatro pestañas de la portada (una sola activa) y, si hay una búsqueda puesta, el
 * aviso con la palabra buscada y el botón para quitarla. La búsqueda y el municipio van en
 * la barra superior (herramientas-portada).
 */
@Component({
  selector: 'app-barra-portada',
  templateUrl: './barra-portada.html',
  styleUrl: './barra-portada.css',
})
export class BarraPortada {
  readonly pestanaActiva = input<PestanaPortada>('RECOMENDADAS');
  /** Texto con el que se cargó el listado actual ('' = sin búsqueda). */
  readonly textoActivo = input('');

  readonly pestana = output<PestanaPortada>();
  readonly buscar = output<string>();

  protected readonly textos = TEXTOS_BUSQUEDA;
  protected readonly etiquetas = ETIQUETAS_PESTANA;
  protected readonly pestanas = PESTANAS;
}
