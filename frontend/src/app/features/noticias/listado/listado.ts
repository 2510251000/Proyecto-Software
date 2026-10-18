import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NOTICIAS_POR_TANDA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia, TipoNoticias } from '../../../core/models/noticia.model';
import { esUltimaHora } from '../../../core/utils/noticia';
import { Boton } from '../../../shared/boton/boton';
import { AlmacenNoticias } from '../almacen-noticias';
import { Apertura } from '../apertura/apertura';
import { BarraBusqueda } from '../barra-busqueda/barra-busqueda';
import { CabeceraPortada, ConteoCiudad } from '../cabecera-portada/cabecera-portada';
import { Cintillo } from '../cintillo/cintillo';
import { ColumnaNoticias } from '../columna-noticias/columna-noticias';
import { EsqueletoPortada } from '../esqueleto-portada/esqueleto-portada';
import { ModalNoticia } from '../modal-noticia/modal-noticia';
import { FILTRO_INICIAL, FiltroPortada, filtrarNoticias } from './filtro-portada';

@Component({
  selector: 'app-listado',
  imports: [
    Boton,
    Apertura,
    BarraBusqueda,
    CabeceraPortada,
    Cintillo,
    ColumnaNoticias,
    EsqueletoPortada,
    ModalNoticia,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado implements OnInit {
  private readonly almacen = inject(AlmacenNoticias);

  // El listado vive en el almacén: la página de una noticia usa el mismo.
  protected readonly cargando = this.almacen.cargando;
  protected readonly error = this.almacen.error;
  protected readonly noticias = this.almacen.noticias;
  /** Noticia que se está viendo en la vista rápida; null si está cerrada. */
  protected readonly noticiaAbierta = signal<Noticia | null>(null);
  protected readonly textosPortada = TEXTOS_PORTADA;

  /** Palabra buscada (la búsqueda la hace el backend) y tipo elegido (oficial o comunidad). */
  protected readonly textoBuscado = signal('');
  protected readonly tipo = signal<TipoNoticias>('TODAS');

  // Todo lo que muestra la portada sale de la misma lista, sin peticiones nuevas.
  // Cada noticia aparece una sola vez: la principal no se repite en las columnas.
  protected readonly filtro = signal<FiltroPortada>(FILTRO_INICIAL);
  protected readonly ciudadActiva = computed(() => {
    const filtro = this.filtro();
    return filtro.tipo === 'ciudad' ? filtro.ciudad : null;
  });
  private readonly filtradas = computed(() => {
    const porCiudad = filtrarNoticias(this.noticias(), this.filtro());
    switch (this.tipo()) {
      case 'OFICIALES':
        return porCiudad.filter((n) => n.oficial);
      case 'COMUNITARIAS':
        return porCiudad.filter((n) => !n.oficial);
      default:
        return porCiudad;
    }
  });
  protected readonly principal = computed(() => this.filtradas()[0] ?? null);
  private readonly resto = computed(() => this.filtradas().slice(1));
  private readonly todasOficiales = computed(() => this.resto().filter((n) => n.oficial));
  private readonly todasComunidad = computed(() => this.resto().filter((n) => !n.oficial));

  protected readonly visibles = signal(NOTICIAS_POR_TANDA);
  protected readonly oficiales = computed(() => this.todasOficiales().slice(0, this.visibles()));
  protected readonly comunidad = computed(() => this.todasComunidad().slice(0, this.visibles()));
  protected readonly hayMas = computed(
    () =>
      this.todasOficiales().length > this.visibles() ||
      this.todasComunidad().length > this.visibles(),
  );

  protected readonly ultimaHora = computed(() => this.noticias().find((n) => esUltimaHora(n)) ?? null);

  /** Municipios en orden alfabético, con cuántas noticias tiene cada uno. */
  protected readonly conteo = computed<ConteoCiudad[]>(() => {
    const cantidades = new Map<string, number>();
    for (const noticia of this.noticias()) {
      cantidades.set(noticia.ciudad, (cantidades.get(noticia.ciudad) ?? 0) + 1);
    }
    return [...cantidades]
      .map(([ciudad, cantidad]) => ({ ciudad, cantidad }))
      .sort((a, b) => a.ciudad.localeCompare(b.ciudad));
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.almacen.cargar(this.textoBuscado() || undefined);
  }

  protected buscar(texto: string): void {
    this.textoBuscado.set(texto);
    this.visibles.set(NOTICIAS_POR_TANDA);
    this.cargar();
  }

  protected elegirTipo(tipo: TipoNoticias): void {
    this.tipo.set(tipo);
    this.visibles.set(NOTICIAS_POR_TANDA);
  }

  protected abrirNoticia(noticia: Noticia): void {
    this.noticiaAbierta.set(noticia);
  }

  protected elegirCiudad(ciudad: string | null): void {
    this.filtro.set(ciudad === null ? FILTRO_INICIAL : { tipo: 'ciudad', ciudad });
    this.visibles.set(NOTICIAS_POR_TANDA);
  }

  protected verMas(): void {
    this.visibles.update((cantidad) => cantidad + NOTICIAS_POR_TANDA);
  }
}
