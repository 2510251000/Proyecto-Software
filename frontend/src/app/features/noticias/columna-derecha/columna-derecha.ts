import { Component, computed, input, output } from '@angular/core';
import { OFICIALES_EN_COLUMNA, TEXTOS_COLUMNA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { Perfil } from '../../../core/models/perfil.model';
import { tiempoRelativo } from '../../../core/utils/noticia';
import { EnlaceNoticia } from '../../../shared/enlace-noticia/enlace-noticia';
import { ConteoCiudad } from '../listado/filtro-portada';
import { AvisosCerca } from './avisos-cerca/avisos-cerca';
import { TuNivel } from './tu-nivel/tu-nivel';

/**
 * Columna derecha de la portada: «Tu nivel», «Avisos cerca de ti», «De la alcaldía» (las
 * últimas oficiales, que siguen también en el feed) y los municipios con su conteo.
 */
@Component({
  selector: 'app-columna-derecha',
  imports: [AvisosCerca, EnlaceNoticia, TuNivel],
  templateUrl: './columna-derecha.html',
  styleUrl: './columna-derecha.css',
})
export class ColumnaDerecha {
  /** null mientras llega o si no se pudo cargar: entonces no se muestra «Tu nivel». */
  readonly perfil = input<Perfil | null>(null);
  readonly noticias = input<readonly Noticia[]>([]);
  readonly ciudades = input<readonly ConteoCiudad[]>([]);
  readonly ciudadActiva = input<string | null>(null);

  readonly abrir = output<Noticia>();
  readonly ciudad = output<string | null>();

  protected readonly textos = TEXTOS_COLUMNA;

  protected readonly oficiales = computed(() =>
    this.noticias()
      .filter((n) => n.oficial)
      .slice(0, OFICIALES_EN_COLUMNA),
  );

  protected datos(noticia: Noticia): string {
    const cuando = tiempoRelativo(noticia.fechaPublicacion);
    return cuando ? `${noticia.ciudad} · ${cuando}` : noticia.ciudad;
  }

  /** Tocar el municipio activo lo quita y vuelve a mostrar todos. */
  protected elegir(nombre: string): void {
    this.ciudad.emit(nombre === this.ciudadActiva() ? null : nombre);
  }
}
