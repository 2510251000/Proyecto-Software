import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NOMBRES_ALERTA, TEXTOS_ALERTA } from '../../core/constants/alertas.constants';
import { RUTAS } from '../../core/constants/rutas.constants';
import { AlertaPendiente } from '../../core/models/alerta.model';
import { NoticiaService } from '../../core/services/noticia.service';
import { Sirena } from '../../core/services/sirena';
import { VigiaAlertas } from '../../core/services/vigia-alertas';
import { portadaDe, urlImagen } from '../../core/utils/imagenes';
import { tiempoRelativo } from '../../core/utils/noticia';

/**
 * Aviso a pantalla completa de una alerta de emergencia (desaparición, robo, emergencia),
 * como los avisos de sismo de los celulares: suena, vibra y no se va hasta que el usuario
 * lo cierra. Vive en el marco, así que aparece en cualquier pantalla con sesión.
 */
@Component({
  selector: 'app-alerta-emergencia',
  templateUrl: './alerta-emergencia.html',
  styleUrl: './alerta-emergencia.css',
})
export class AlertaEmergencia {
  private readonly vigia = inject(VigiaAlertas);
  private readonly sirena = inject(Sirena);
  private readonly noticias = inject(NoticiaService);
  private readonly router = inject(Router);

  protected readonly textos = TEXTOS_ALERTA;
  protected readonly nombres = NOMBRES_ALERTA;
  protected readonly hace = tiempoRelativo;
  protected readonly actual = this.vigia.actual;
  /** La foto de la noticia de la alerta, cuando llega; null si no tiene. */
  protected readonly foto = signal<string | null>(null);
  protected readonly pedirPermiso = signal(this.sirena.permisoSistema() === 'default');

  private readonly entendido = viewChild<ElementRef<HTMLButtonElement>>('entendido');
  private sonando: number | null = null;

  constructor() {
    this.vigia.vigilar(inject(DestroyRef));
    inject(DestroyRef).onDestroy(() => this.sirena.detener());

    effect(() => {
      const pendiente = this.actual();
      untracked(() => this.mostrar(pendiente));
    });
    effect(() => this.entendido()?.nativeElement.focus());
  }

  protected cerrar(pendiente: AlertaPendiente): void {
    this.sirena.detener();
    this.sonando = null;
    this.vigia.cerrar(pendiente);
  }

  protected verDetalles(pendiente: AlertaPendiente): void {
    this.cerrar(pendiente);
    void this.router.navigate(['/', RUTAS.noticias, pendiente.alerta.noticiaId]);
  }

  protected activarAvisos(): void {
    void this.sirena.pedirPermisoSistema().then(() => this.pedirPermiso.set(false));
  }

  private mostrar(pendiente: AlertaPendiente | null): void {
    if (pendiente === null || pendiente.notificacionId === this.sonando) {
      return;
    }
    this.sonando = pendiente.notificacionId;
    const { alerta } = pendiente;
    this.foto.set(null);
    this.sirena.sonar();
    this.sirena.avisarAlSistema({
      titulo: `${TEXTOS_ALERTA.etiqueta} · ${NOMBRES_ALERTA[alerta.tipo]} ${TEXTOS_ALERTA.enCiudad} ${alerta.ciudad}`,
      cuerpo: alerta.titulo,
      etiqueta: `alerta-${alerta.noticiaId}`,
    });
    this.noticias.obtener(alerta.noticiaId).subscribe({
      next: (noticia) => {
        const portada = portadaDe(noticia);
        if (this.sonando === pendiente.notificacionId && portada !== null) {
          this.foto.set(urlImagen(portada));
        }
      },
      error: () => undefined,
    });
  }
}
