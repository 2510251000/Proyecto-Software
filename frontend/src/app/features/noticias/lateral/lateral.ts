import { Component, input } from '@angular/core';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { tiempoRelativo } from '../../../core/utils/noticia';

export interface ConteoCiudad {
  ciudad: string;
  cantidad: number;
}

/**
 * Columna lateral de la portada. No hay contador de vistas en el backend, así que
 * la lista es «lo más reciente» y no «lo más leído».
 */
@Component({
  selector: 'app-lateral',
  templateUrl: './lateral.html',
  styleUrl: './lateral.css',
})
export class Lateral {
  readonly recientes = input<readonly Noticia[]>([]);
  readonly conteo = input<readonly ConteoCiudad[]>([]);

  protected readonly textos = TEXTOS_PORTADA;
  protected readonly cuando = tiempoRelativo;
}
