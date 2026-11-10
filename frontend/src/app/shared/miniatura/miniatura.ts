import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { RUTA_IMAGENES_NOTICIAS } from '../../core/constants/categorias.constants';
import { CategoriaMiniatura } from '../../core/models/categoria-miniatura.model';
import { ImagenNoticia } from '../../core/models/noticia.model';
import { ImagenService } from '../../core/services/imagen.service';
import { urlImagen } from '../../core/utils/imagenes';

const TEXTO_ALTERNATIVO: Record<CategoriaMiniatura, string> = {
  bici: 'Personas en bicicleta por una ciclorruta arborizada',
  agua: 'Una mano llena una botella roja en un chorro de agua',
  deporte: 'Niños jugando un partido de fútbol en una cancha sintética',
  parque: 'Voluntarias empacando bolsas bajo una carpa',
  comida: 'Personas comiendo en mesas de una calle con puestos de comida',
  mercado: 'Puesto de mercado con tomates, berenjenas, calabacines y habichuelas',
  obra: 'Dos obreros con casco trabajando en una construcción',
  cultura: 'Pantalla gigante al aire libre al anochecer, frente a un parqueadero',
};

/**
 * Foto de una noticia: la foto real si la noticia tiene (`foto`); si no, o si no carga, la foto
 * de su categoría; y si tampoco carga, el dibujo de esa categoría.
 * Con `protegida`, la foto se pide con sesión (noticias ocultas en la moderación).
 */
@Component({
  selector: 'app-miniatura',
  templateUrl: './miniatura.html',
  styleUrl: './miniatura.css',
})
export class Miniatura {
  private readonly imagenes = inject(ImagenService);

  readonly categoria = input.required<CategoriaMiniatura>();
  readonly foto = input<ImagenNoticia | null>(null);
  readonly protegida = input(false);
  /** La foto es de fondo y el texto de al lado ya dice lo mismo: va sin texto alternativo. */
  readonly decorativa = input(false);
  /** Es la foto principal de la pantalla: se pide de primera, sin esperar a que se vea. */
  readonly prioridad = input(false);

  /** La foto real no cargó: se usa la de la categoría. */
  protected readonly falloFoto = signal(false);
  /** Tampoco cargó la de la categoría: se usa el dibujo. */
  protected readonly fallo = signal(false);
  private readonly urlProtegida = signal<string | null>(null);

  private readonly conFotoReal = computed(() => this.foto() !== null && !this.falloFoto());

  /** Mientras llega una foto protegida no se muestra nada (sin saltos de la foto de categoría a la real). */
  protected readonly esperando = computed(() => this.conFotoReal() && this.protegida() && this.urlProtegida() === null);

  protected readonly rutaFoto = computed(() => {
    const foto = this.foto();
    if (foto !== null && !this.falloFoto()) {
      return this.protegida() ? this.urlProtegida() : urlImagen(foto);
    }
    return this.fallo() ? null : `${RUTA_IMAGENES_NOTICIAS}/${this.categoria()}.webp`;
  });

  protected readonly textoAlternativo = computed(() =>
    this.conFotoReal() ? (this.foto()?.textoAlternativo ?? '') : TEXTO_ALTERNATIVO[this.categoria()],
  );

  constructor() {
    effect((alLimpiar) => {
      const foto = this.foto();
      if (foto === null || !this.protegida()) {
        return;
      }
      const suscripcion = this.imagenes.obtenerProtegida(urlImagen(foto)).subscribe({
        next: (blob) => this.urlProtegida.set(URL.createObjectURL(blob)),
        error: () => this.falloFoto.set(true),
      });
      alLimpiar(() => suscripcion.unsubscribe());
    });
    inject(DestroyRef).onDestroy(() => {
      const url = this.urlProtegida();
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
    });
  }

  protected alFallar(): void {
    if (this.conFotoReal()) {
      this.falloFoto.set(true);
    } else {
      this.fallo.set(true);
    }
  }
}
