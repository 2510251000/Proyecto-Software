import { Component, input, output, signal } from '@angular/core';
import { ETIQUETAS_TIPO, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { TipoNoticias } from '../../../core/models/noticia.model';

const TIPOS: readonly TipoNoticias[] = ['TODAS', 'OFICIALES', 'COMUNITARIAS'];

/**
 * Búsqueda por palabra (la hace el backend) y filtro por tipo de noticia (oficial o de
 * la comunidad). La búsqueda solo se envía al presionar «Buscar» o Enter.
 */
@Component({
  selector: 'app-barra-busqueda',
  templateUrl: './barra-busqueda.html',
  styleUrl: './barra-busqueda.css',
})
export class BarraBusqueda {
  /** Texto con el que se cargó el listado actual ('' = sin búsqueda). */
  readonly textoActivo = input('');
  readonly tipoActivo = input<TipoNoticias>('TODAS');
  readonly buscar = output<string>();
  readonly tipo = output<TipoNoticias>();

  protected readonly textos = TEXTOS_BUSQUEDA;
  protected readonly etiquetas = ETIQUETAS_TIPO;
  protected readonly tipos = TIPOS;
  protected readonly escrito = signal('');

  protected escribir(evento: Event): void {
    if (evento.target instanceof HTMLInputElement) {
      this.escrito.set(evento.target.value);
    }
  }

  protected enviar(evento: SubmitEvent): void {
    evento.preventDefault();
    this.buscar.emit(this.escrito().trim());
  }

  protected limpiar(): void {
    this.escrito.set('');
    this.buscar.emit('');
  }
}
