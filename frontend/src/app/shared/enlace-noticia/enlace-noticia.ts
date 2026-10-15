import { Directive, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { RUTAS } from '../../core/constants/rutas.constants';
import { Noticia } from '../../core/models/noticia.model';

/**
 * Convierte un <a> en el enlace de una noticia. El href lleva a su página, así que se
 * puede copiar o abrir en otra pestaña; el clic normal avisa con (abrirNoticia) para que
 * la portada muestre la vista rápida sin salir de ella.
 */
@Directive({
  selector: 'a[appEnlaceNoticia]',
  host: {
    '[attr.href]': 'href()',
    '(click)': 'alHacerClic($event)',
  },
})
export class EnlaceNoticia {
  private readonly router = inject(Router);

  readonly noticia = input.required<Noticia>({ alias: 'appEnlaceNoticia' });
  readonly abrirNoticia = output<Noticia>();

  protected readonly href = computed(() =>
    this.router.serializeUrl(this.router.createUrlTree(['/', RUTAS.noticias, this.noticia().id])),
  );

  protected alHacerClic(evento: MouseEvent): void {
    // Ctrl, Cmd, Mayús o Alt + clic: el navegador abre la página de la noticia como cualquier enlace.
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) {
      return;
    }
    evento.preventDefault();
    this.abrirNoticia.emit(this.noticia());
  }
}
