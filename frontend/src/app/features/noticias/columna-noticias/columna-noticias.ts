import { Component, input, output } from '@angular/core';
import { Noticia } from '../../../core/models/noticia.model';
import { TarjetaNoticia } from '../../../shared/tarjeta-noticia/tarjeta-noticia';

/**
 * Una de las dos columnas de la portada. El filete de arriba dice de dónde viene la
 * información: azul para la oficial y ámbar para la de la comunidad.
 */
@Component({
  selector: 'app-columna-noticias',
  imports: [TarjetaNoticia],
  templateUrl: './columna-noticias.html',
  styleUrl: './columna-noticias.css',
  host: { '[class.comunidad]': "origen() === 'comunidad'" },
})
export class ColumnaNoticias {
  readonly titulo = input.required<string>();
  /** id del título: nombra la sección. */
  readonly idTitulo = input.required<string>();
  /** Quién escribe lo que hay en la columna. */
  readonly origen = input<'oficial' | 'comunidad'>('oficial');
  readonly descripcion = input('');
  readonly vacia = input('');
  readonly noticias = input<readonly Noticia[]>([]);
  readonly abrir = output<Noticia>();
}
