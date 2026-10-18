import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { TEXTOS_NOTICIA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { PARAMETRO_ID_NOTICIA, RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { NoticiaService } from '../../../core/services/noticia.service';
import { Boton } from '../../../shared/boton/boton';
import { Encabezado } from '../../../shared/encabezado/encabezado';
import { AlmacenNoticias } from '../almacen-noticias';
import { ContenidoNoticia } from '../contenido-noticia/contenido-noticia';

/**
 * Página de una noticia (noticias/:id), para poder compartir su enlace. Primero la busca
 * en el listado (el que ya está en memoria o el que pide al entrar directo a la URL); si
 * no está allí, por ejemplo porque se llegó desde una notificación, la pide sola al backend.
 */
@Component({
  selector: 'app-detalle',
  imports: [Encabezado, Boton, ContenidoNoticia, RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit {
  private readonly almacen = inject(AlmacenNoticias);
  private readonly noticiaServicio = inject(NoticiaService);

  protected readonly textos = TEXTOS_NOTICIA;
  protected readonly textosPortada = TEXTOS_PORTADA;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly rutas = RUTAS;
  protected readonly idTitulo = 'noticia-titulo';

  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((parametros) => Number(parametros.get(PARAMETRO_ID_NOTICIA)))),
    { initialValue: Number.NaN },
  );

  /** La noticia pedida sola al backend, cuando no estaba en el listado. */
  private readonly sola = signal<Noticia | null>(null);
  /** Ids ya pedidos uno a uno (para no repetir la petición). */
  private readonly pedidas = new Set<number>();
  private readonly pidiendo = signal(false);

  protected readonly error = this.almacen.error;
  protected readonly noticia = computed(() => {
    const id = this.id();
    const unica = this.sola();
    return this.almacen.buscar(id) ?? (unica?.id === id ? unica : null);
  });
  /** Mientras el listado (o la noticia sola) no haya llegado no se puede saber si existe. */
  protected readonly cargando = computed(
    () => (!this.almacen.cargada() && this.error() === null) || this.pidiendo(),
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.almacen.cargada() && this.noticia() === null && Number.isInteger(id) && !this.pedidas.has(id)) {
        this.pedirSola(id);
      }
    });
  }

  ngOnInit(): void {
    this.almacen.cargarSiFalta();
  }

  protected reintentar(): void {
    this.almacen.cargar();
  }

  private pedirSola(id: number): void {
    this.pedidas.add(id);
    this.pidiendo.set(true);
    this.noticiaServicio.obtener(id).subscribe({
      next: (noticia) => {
        this.sola.set(noticia);
        this.pidiendo.set(false);
      },
      // 404 u otro error: se muestra «No encontramos esta noticia».
      error: () => this.pidiendo.set(false),
    });
  }
}
