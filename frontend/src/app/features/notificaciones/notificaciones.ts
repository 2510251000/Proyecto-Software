import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TEXTOS_COMUNES } from '../../core/constants/mensajes.constants';
import {
  ETIQUETAS_NOTIFICACION,
  TEXTOS_NOTIFICACIONES,
} from '../../core/constants/pantallas.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { Notificacion } from '../../core/models/notificacion.model';
import { CampanaNotificaciones } from '../../core/services/campana-notificaciones';
import { NotificacionService } from '../../core/services/notificacion.service';
import { tiempoRelativo } from '../../core/utils/noticia';
import { Encabezado } from '../../shared/encabezado/encabezado';

/** Bandeja de notificaciones: noticias nuevas en el municipio, cambios de nivel y moderación. */
@Component({
  selector: 'app-notificaciones',
  imports: [Encabezado],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones implements OnInit {
  private readonly servicio = inject(NotificacionService);
  private readonly campana = inject(CampanaNotificaciones);
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_NOTIFICACIONES;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly etiquetas = ETIQUETAS_NOTIFICACION;

  protected readonly lista = signal<Notificacion[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly hayNoLeidas = computed(() => (this.lista() ?? []).some((n) => !n.leida));

  ngOnInit(): void {
    this.servicio.listar().subscribe({
      next: (lista) => this.lista.set(lista),
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected cuando(fecha: string): string {
    return tiempoRelativo(fecha);
  }

  /** Abre la noticia del aviso (si tiene) y lo marca como leído. */
  protected abrir(notificacion: Notificacion): void {
    if (!notificacion.leida) {
      this.marcar(notificacion);
    }
    if (notificacion.noticiaId !== null) {
      void this.router.navigate(['/', RUTAS.noticias, notificacion.noticiaId]);
    }
  }

  protected marcar(notificacion: Notificacion): void {
    this.servicio.marcarLeida(notificacion.id).subscribe({
      next: () => {
        this.lista.update((lista) =>
          (lista ?? []).map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n)),
        );
        this.campana.actualizar();
      },
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }

  protected marcarTodas(): void {
    this.servicio.marcarTodasLeidas().subscribe({
      next: () => {
        this.lista.update((lista) => (lista ?? []).map((n) => ({ ...n, leida: true })));
        this.campana.actualizar();
      },
      error: (error: ErrorApi) => this.error.set(error.mensaje),
    });
  }
}
