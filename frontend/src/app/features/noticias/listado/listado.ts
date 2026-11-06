import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NOTICIAS_DESTACADAS, NOTICIAS_POR_TANDA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia, PestanaPortada } from '../../../core/models/noticia.model';
import { Boton } from '../../../shared/boton/boton';
import { AlmacenNoticias } from '../almacen-noticias';
import { Marco } from '../../../shared/marco/marco';
import { BarraPortada } from '../barra-portada/barra-portada';
import { Bienvenida } from '../bienvenida/bienvenida';
import { TarjetaNoticia } from '../../../shared/tarjeta-noticia/tarjeta-noticia';
import { EsqueletoPortada } from '../esqueleto-portada/esqueleto-portada';
import { ModalNoticia } from '../modal-noticia/modal-noticia';
import { aplicarPestana, ConteoCiudad, FILTRO_INICIAL, FiltroPortada, filtrarNoticias } from './filtro-portada';

@Component({
  selector: 'app-listado',
  imports: [
    Boton,
    Marco,
    BarraPortada,
    Bienvenida,
    TarjetaNoticia,
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

  /** Palabra buscada (la búsqueda la hace el backend) y pestaña elegida en la barra. */
  protected readonly textoBuscado = signal('');
  protected readonly pestana = signal<PestanaPortada>('RECOMENDADAS');

  // Todo lo que muestra la portada sale de la misma lista, sin peticiones nuevas.
  // Cada noticia aparece una sola vez: las destacadas no se repiten abajo.
  protected readonly filtro = signal<FiltroPortada>(FILTRO_INICIAL);
  protected readonly ciudadActiva = computed(() => {
    const filtro = this.filtro();
    return filtro.tipo === 'ciudad' ? filtro.ciudad : null;
  });
  private readonly filtradas = computed(() =>
    aplicarPestana(filtrarNoticias(this.noticias(), this.filtro()), this.pestana()),
  );
  /** Las dos primeras van como publicación grande en «Nuevas y recomendadas». */
  protected readonly destacadas = computed(() => this.filtradas().slice(0, NOTICIAS_DESTACADAS));
  private readonly resto = computed(() => this.filtradas().slice(NOTICIAS_DESTACADAS));

  /** El resto va en tarjetas compactas en «Más de tu región», por tandas. */
  protected readonly visibles = signal(NOTICIAS_POR_TANDA);
  protected readonly masDeTuRegion = computed(() => this.resto().slice(0, this.visibles()));
  protected readonly hayMas = computed(() => this.resto().length > this.visibles());

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

  protected elegirPestana(pestana: PestanaPortada): void {
    this.pestana.set(pestana);
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
