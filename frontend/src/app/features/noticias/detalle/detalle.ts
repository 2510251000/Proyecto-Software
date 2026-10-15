import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { TEXTOS_NOTICIA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { PARAMETRO_ID_NOTICIA, RUTAS } from '../../../core/constants/rutas.constants';
import { Boton } from '../../../shared/boton/boton';
import { Encabezado } from '../../../shared/encabezado/encabezado';
import { AlmacenNoticias } from '../almacen-noticias';
import { ContenidoNoticia } from '../contenido-noticia/contenido-noticia';

/**
 * Página de una noticia (noticias/:id), para poder compartir su enlace. Como no hay
 * endpoint de noticia individual, la busca en el listado: el que ya está en memoria o,
 * si se entra directo a la URL, el que pide en ese momento.
 */
@Component({
  selector: 'app-detalle',
  imports: [Encabezado, Boton, ContenidoNoticia, RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit {
  private readonly almacen = inject(AlmacenNoticias);

  protected readonly textos = TEXTOS_NOTICIA;
  protected readonly textosPortada = TEXTOS_PORTADA;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly rutas = RUTAS;
  protected readonly idTitulo = 'noticia-titulo';

  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((parametros) => Number(parametros.get(PARAMETRO_ID_NOTICIA)))),
    { initialValue: Number.NaN },
  );

  protected readonly error = this.almacen.error;
  /** Mientras el listado no haya llegado no se puede saber si la noticia existe. */
  protected readonly cargando = computed(() => !this.almacen.cargada() && this.error() === null);
  protected readonly noticia = computed(() => this.almacen.buscar(this.id()));

  ngOnInit(): void {
    this.almacen.cargarSiFalta();
  }

  protected reintentar(): void {
    this.almacen.cargar();
  }
}
