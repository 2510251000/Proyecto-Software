import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TEXTOS_FICHA_AVISOS } from '../../../core/constants/dia-en-vivo.constants';
import { AVISOS_EN_COLUMNA, TEXTOS_COLUMNA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Notificacion } from '../../../core/models/notificacion.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { tiempoRelativo } from '../../../core/utils/noticia';

/**
 * Ficha «Avisos cerca de ti» del mosaico: las notificaciones de cercanía sin leer (hasta dos) con cuántas hay.
 * Cada una lleva a la noticia de la que avisa, o a la bandeja si no tiene noticia.
 */
@Component({
  selector: 'app-avisos-cerca',
  imports: [RouterLink],
  templateUrl: './avisos-cerca.html',
  styleUrl: './avisos-cerca.css',
})
export class AvisosCerca {
  protected readonly textos = TEXTOS_COLUMNA;
  protected readonly textosFicha = TEXTOS_FICHA_AVISOS;
  protected readonly rutaAvisos = ['/', RUTAS.notificaciones];

  /** Si la bandeja no carga, la tarjeta dice que no hay avisos nuevos. */
  private readonly avisos = toSignal(
    inject(NotificacionService)
      .listar()
      .pipe(catchError(() => of<Notificacion[]>([]))),
    { initialValue: [] },
  );

  private readonly cercanos = computed(() => this.avisos().filter((a) => a.tipo === 'CERCANIA' && !a.leida));
  protected readonly cantidad = computed(() => this.cercanos().length);
  protected readonly visibles = computed(() => this.cercanos().slice(0, AVISOS_EN_COLUMNA));

  protected enlace(aviso: Notificacion): string[] {
    return aviso.noticiaId === null ? ['/', RUTAS.notificaciones] : ['/', RUTAS.noticias, String(aviso.noticiaId)];
  }

  protected cuando(aviso: Notificacion): string {
    return tiempoRelativo(aviso.fecha);
  }
}
