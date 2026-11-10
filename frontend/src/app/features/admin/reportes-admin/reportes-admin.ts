import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ESTADOS_REPORTE,
  ETIQUETAS_ESTADO_REPORTE,
  ETIQUETAS_MOTIVO,
  TEXTOS_REPORTES_ADMIN,
} from '../../../core/constants/interaccion.constants';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { EstadoReporte, Reporte } from '../../../core/models/interaccion.model';
import { AdminService } from '../../../core/services/admin.service';
import { tiempoRelativo } from '../../../core/utils/noticia';

/**
 * Reportes de los usuarios (HU MF03_003). El administrador los marca como revisados o
 * descartados y, si hace falta, oculta la noticia con la misma moderación de siempre.
 */
@Component({
  selector: 'app-reportes-admin',
  imports: [RouterLink],
  templateUrl: './reportes-admin.html',
  styleUrl: '../moderacion-noticias/moderacion-noticias.css',
})
export class ReportesAdmin implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly textos = TEXTOS_REPORTES_ADMIN;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly estados = ESTADOS_REPORTE;
  protected readonly etiquetasEstado = ETIQUETAS_ESTADO_REPORTE;
  protected readonly etiquetasMotivo = ETIQUETAS_MOTIVO;
  protected readonly rutas = RUTAS;

  readonly estado = signal<EstadoReporte | null>('PENDIENTE');
  readonly reportes = signal<Reporte[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly ocupado = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  protected cuando(fecha: string): string {
    return tiempoRelativo(fecha);
  }

  protected cambiarFiltro(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.estado.set(valor === '' ? null : (valor as EstadoReporte));
    this.cargar();
  }

  marcar(reporte: Reporte, estado: EstadoReporte): void {
    this.ocupado.set(reporte.id);
    this.admin.cambiarEstadoReporte(reporte.id, estado).subscribe({
      next: (actualizado) => {
        this.reportes.update((lista) =>
          (lista ?? [])
            .map((r) => (r.id === actualizado.id ? actualizado : r))
            .filter((r) => this.estado() === null || r.estado === this.estado()),
        );
        this.ocupado.set(null);
      },
      error: (error: ErrorApi) => this.fallar(error),
    });
  }

  /** Oculta la noticia reportada (la moderación de siempre) y marca el reporte como revisado. */
  ocultarNoticia(reporte: Reporte): void {
    this.ocupado.set(reporte.id);
    this.admin.cambiarEstado(reporte.noticiaId, 'OCULTA').subscribe({
      next: () => {
        this.reportes.update((lista) =>
          (lista ?? []).map((r) => (r.noticiaId === reporte.noticiaId ? { ...r, noticiaEstado: 'OCULTA' } : r)),
        );
        this.marcar(reporte, 'REVISADO');
      },
      error: (error: ErrorApi) => this.fallar(error),
    });
  }

  private cargar(): void {
    this.reportes.set(null);
    this.error.set(null);
    this.admin.reportes(this.estado() ?? undefined).subscribe({
      next: (lista) => this.reportes.set(lista),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  private fallar(error: ErrorApi): void {
    this.error.set(error.mensaje);
    this.ocupado.set(null);
  }
}
