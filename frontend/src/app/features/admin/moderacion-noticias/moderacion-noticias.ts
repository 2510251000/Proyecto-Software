import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO,
  TEXTOS_ADMIN,
} from '../../../core/constants/pantallas.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { EstadoNoticia, Noticia, TipoNoticias } from '../../../core/models/noticia.model';
import { AdminService } from '../../../core/services/admin.service';
import { tiempoRelativo } from '../../../core/utils/noticia';

const ESTADOS_FILTRO: readonly EstadoNoticia[] = ['PUBLICADA', 'OCULTA'];
const TIPOS_FILTRO: readonly TipoNoticias[] = ['COMUNITARIAS', 'OFICIALES', 'TODAS'];

/**
 * Moderación: ocultar, volver a publicar o borrar noticias. Arranca mostrando las de la
 * comunidad, que son las que se moderan.
 */
@Component({
  selector: 'app-moderacion-noticias',
  imports: [RouterLink],
  templateUrl: './moderacion-noticias.html',
  styleUrl: './moderacion-noticias.css',
})
export class ModeracionNoticias implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly textos = TEXTOS_ADMIN;
  protected readonly textosComunes = TEXTOS_COMUNES;
  protected readonly etiquetasEstado = ETIQUETAS_ESTADO;
  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly estados = ESTADOS_FILTRO;
  protected readonly tipos = TIPOS_FILTRO;
  protected readonly rutas = RUTAS;

  protected readonly estado = signal<EstadoNoticia | null>(null);
  protected readonly tipo = signal<TipoNoticias>('COMUNITARIAS');
  protected readonly noticias = signal<Noticia[] | null>(null);
  protected readonly ocupada = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  protected cambiarEstadoFiltro(evento: Event): void {
    if (evento.target instanceof HTMLSelectElement) {
      const valor = evento.target.value;
      this.estado.set(this.estados.find((e) => e === valor) ?? null);
      this.cargar();
    }
  }

  protected cambiarTipoFiltro(evento: Event): void {
    if (evento.target instanceof HTMLSelectElement) {
      const valor = evento.target.value;
      this.tipo.set(this.tipos.find((t) => t === valor) ?? 'TODAS');
      this.cargar();
    }
  }

  protected cuando(fecha: string): string {
    return tiempoRelativo(fecha);
  }

  protected moderar(noticia: Noticia, estado: EstadoNoticia): void {
    this.ocupada.set(noticia.id);
    this.error.set(null);
    this.admin.cambiarEstado(noticia.id, estado).subscribe({
      next: (cambiada) => {
        this.noticias.update((lista) => (lista ?? []).map((n) => (n.id === cambiada.id ? cambiada : n)));
        this.ocupada.set(null);
      },
      error: (error: ErrorApi) => this.fallo(error),
    });
  }

  protected borrar(noticia: Noticia): void {
    if (!confirm(TEXTOS_ADMIN.confirmarBorrado)) {
      return;
    }
    this.ocupada.set(noticia.id);
    this.error.set(null);
    this.admin.borrar(noticia.id).subscribe({
      next: () => {
        this.noticias.update((lista) => (lista ?? []).filter((n) => n.id !== noticia.id));
        this.ocupada.set(null);
      },
      error: (error: ErrorApi) => this.fallo(error),
    });
  }

  private cargar(): void {
    this.noticias.set(null);
    this.admin.noticias(this.estado() ?? undefined, this.tipo()).subscribe({
      next: (noticias) => this.noticias.set(noticias),
      error: (error: ErrorApi) => this.fallo(error),
    });
  }

  private fallo(error: ErrorApi): void {
    this.error.set(error.mensaje);
    this.ocupada.set(null);
  }
}
