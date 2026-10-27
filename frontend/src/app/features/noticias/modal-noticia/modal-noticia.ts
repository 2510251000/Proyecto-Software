import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTOS_NOTICIA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { ContenidoNoticia } from '../contenido-noticia/contenido-noticia';

/**
 * Vista rápida de una noticia sobre la portada. Usa el <dialog> nativo abierto con
 * showModal(): el navegador encierra el foco dentro, lo cierra con Escape y, al cerrar,
 * devuelve el foco al enlace desde el que se abrió.
 */
@Component({
  selector: 'app-modal-noticia',
  imports: [ContenidoNoticia, RouterLink],
  templateUrl: './modal-noticia.html',
  styleUrl: './modal-noticia.css',
})
export class ModalNoticia {
  /** La noticia que se muestra; con null el diálogo está cerrado. */
  readonly noticia = input.required<Noticia | null>();
  /** Avisa que el diálogo se cerró (botón, Escape o clic fuera) para que se quite la noticia. */
  readonly cerrada = output();

  protected readonly textos = TEXTOS_NOTICIA;
  protected readonly rutas = RUTAS;
  protected readonly idTitulo = 'modal-noticia-titulo';

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // El diálogo sigue a la noticia: se abre cuando llega una y se cierra cuando la quitan.
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.noticia() !== null && !dialogo.open) {
        dialogo.showModal();
      } else if (this.noticia() === null && dialogo.open) {
        dialogo.close();
      }
    });
  }

  protected cerrar(): void {
    this.dialogo().nativeElement.close();
  }
}
