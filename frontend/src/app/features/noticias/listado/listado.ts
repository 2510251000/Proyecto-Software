import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TEXTOS_COMUNES } from '../../../core/constants/mensajes.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Noticia } from '../../../core/models/noticia.model';
import { AuthService } from '../../../core/services/auth.service';
import { NoticiaService } from '../../../core/services/noticia.service';
import { Boton } from '../../../shared/boton/boton';
import { Encabezado } from '../../../shared/encabezado/encabezado';
import { TarjetaNoticia } from '../../../shared/tarjeta-noticia/tarjeta-noticia';

@Component({
  selector: 'app-listado',
  imports: [Encabezado, Boton, TarjetaNoticia],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado implements OnInit {
  private readonly noticiaServicio = inject(NoticiaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly noticias = signal<Noticia[]>([]);
  protected readonly textos = TEXTOS_COMUNES;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noticiaServicio
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (noticias) => {
          this.noticias.set(noticias);
          this.cargando.set(false);
        },
        error: (error: ErrorApi) => {
          this.error.set(error.mensaje);
          this.cargando.set(false);
        },
      });
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate([RUTAS.login]);
  }
}
