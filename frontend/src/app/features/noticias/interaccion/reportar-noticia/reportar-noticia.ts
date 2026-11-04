import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import {
  ETIQUETAS_MOTIVO,
  LARGO_MAXIMO_DESCRIPCION_REPORTE,
  MOTIVOS_REPORTE,
  TEXTOS_REPORTE,
} from '../../../../core/constants/interaccion.constants';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { MotivoReporte } from '../../../../core/models/interaccion.model';
import { InteraccionService } from '../../../../core/services/interaccion.service';

/** Botón «Reportar» que abre un diálogo con los motivos (HU MF03_003). */
@Component({
  selector: 'app-reportar-noticia',
  templateUrl: './reportar-noticia.html',
  styleUrl: './reportar-noticia.css',
})
export class ReportarNoticia {
  private readonly interaccion = inject(InteraccionService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  readonly noticiaId = input.required<number>();

  protected readonly textos = TEXTOS_REPORTE;
  protected readonly motivos = MOTIVOS_REPORTE;
  protected readonly etiquetas = ETIQUETAS_MOTIVO;
  protected readonly largoMaximo = LARGO_MAXIMO_DESCRIPCION_REPORTE;

  protected readonly motivo = signal<MotivoReporte | null>(null);
  protected readonly descripcion = signal('');
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Ya se reportó (o el backend dijo que ya estaba reportada): el botón queda con el aviso. */
  readonly enviado = signal<string | null>(null);

  abrir(): void {
    this.error.set(null);
    this.dialogo().nativeElement.showModal();
  }

  cerrar(): void {
    this.dialogo().nativeElement.close();
  }

  protected escribir(evento: Event): void {
    this.descripcion.set((evento.target as HTMLTextAreaElement).value);
  }

  enviar(): void {
    const motivo = this.motivo();
    if (motivo === null) {
      this.error.set(this.textos.eligeMotivo);
      return;
    }
    if (this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const descripcion = this.descripcion().trim();
    this.interaccion
      .reportar(this.noticiaId(), { motivo, ...(descripcion ? { descripcion } : {}) })
      .subscribe({
        next: () => {
          this.enviado.set(this.textos.gracias);
          this.enviando.set(false);
          this.cerrar();
        },
        error: (error: ErrorApi) => {
          this.enviando.set(false);
          if (error.estado === 409) {
            this.enviado.set(error.mensaje);
            this.cerrar();
          } else {
            this.error.set(error.mensaje);
          }
        },
      });
  }
}
