import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorApi } from '../../core/models/error-api.model';
import { CriteriosNoticias, Noticia } from '../../core/models/noticia.model';
import { NoticiaService } from '../../core/services/noticia.service';

/** La portada pide las recomendadas: los autores de nivel alto y lo oficial suben. */
const CRITERIOS_PORTADA: CriteriosNoticias = { orden: 'RECOMENDADAS' };

/**
 * Guarda en memoria el listado de noticias para que la portada y la página de una noticia
 * usen la misma lista. La página de una noticia que no esté aquí la pide aparte.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenNoticias {
  private readonly noticiaServicio = inject(NoticiaService);
  private peticion: Subscription | null = null;

  private readonly _noticias = signal<Noticia[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _cargada = signal(false);

  readonly noticias = this._noticias.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  /** true cuando el listado ya llegó al menos una vez. */
  readonly cargada = this._cargada.asReadonly();

  /** Pide el listado al backend, con la búsqueda si la hay. Si había una petición en curso, la reemplaza. */
  cargar(texto?: string): void {
    this.peticion?.unsubscribe();
    this._cargando.set(true);
    this._error.set(null);
    this.peticion = this.noticiaServicio.listar({ ...CRITERIOS_PORTADA, texto }).subscribe({
      next: (noticias) => {
        this._noticias.set(noticias);
        this._cargada.set(true);
        this._cargando.set(false);
      },
      error: (error: ErrorApi) => {
        this._error.set(error.mensaje);
        this._cargando.set(false);
      },
    });
  }

  /** Pide el listado solo si todavía no está en memoria ni viene en camino. */
  cargarSiFalta(): void {
    if (!this._cargada() && !this._cargando()) {
      this.cargar();
    }
  }

  buscar(id: number): Noticia | null {
    return this._noticias().find((noticia) => noticia.id === id) ?? null;
  }
}
