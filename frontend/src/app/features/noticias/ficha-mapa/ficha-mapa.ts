import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DESFASE_LATIDO_S,
  resumenMapa,
  TEXTOS_FICHA_MAPA,
} from '../../../core/constants/dia-en-vivo.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { ConteoMunicipio, puntosDelMapa } from '../../../core/utils/dia-en-vivo';

/** Cada ficha necesita un id propio para enlazar la sección con su título. */
let fichasCreadas = 0;

/**
 * Ficha «Dónde está pasando»: los municipios con más noticias como puntos que laten, puestos
 * según dónde quedan (el oeste a la izquierda y el norte arriba). Tocar un municipio filtra
 * la portada; tocar el que ya está activo quita el filtro.
 */
@Component({
  selector: 'app-ficha-mapa',
  imports: [RouterLink],
  templateUrl: './ficha-mapa.html',
  styleUrl: './ficha-mapa.css',
})
export class FichaMapa {
  /** Todas las noticias de la portada: de sus coordenadas sale dónde va cada municipio. */
  readonly noticias = input<readonly Noticia[]>([]);
  /** Los municipios con cuántas noticias tiene cada uno. */
  readonly conteo = input<readonly ConteoMunicipio[]>([]);
  /** Municipio con el que está filtrada la portada; null cuando se ven todos. */
  readonly ciudadActiva = input<string | null>(null);
  /** El municipio del usuario de la sesión: va resaltado. null si no se sabe. */
  readonly municipioUsuario = input<string | null>(null);

  readonly ciudad = output<string | null>();

  protected readonly textos = TEXTOS_FICHA_MAPA;
  protected readonly rutaMapa = ['/', RUTAS.mapa];
  protected readonly idTitulo = `ficha-mapa-${++fichasCreadas}`;
  protected readonly desfase = DESFASE_LATIDO_S;

  protected readonly resumen = computed(() =>
    resumenMapa(this.noticias().length, this.conteo().length),
  );
  protected readonly mapa = computed(() => puntosDelMapa(this.noticias(), this.conteo()));

  /** Tocar el municipio activo lo quita y vuelve a mostrar todos. */
  protected elegir(nombre: string): void {
    this.ciudad.emit(nombre === this.ciudadActiva() ? null : nombre);
  }
}
