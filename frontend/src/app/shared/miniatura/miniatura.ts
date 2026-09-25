import { Component, computed, input, signal } from '@angular/core';
import { RUTA_IMAGENES_NOTICIAS } from '../../core/constants/categorias.constants';
import { CategoriaMiniatura } from '../../core/models/categoria-miniatura.model';

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
 * Foto de la categoría de la noticia. Mientras no exista la tabla multimedia (RF8)
 * es una foto por categoría; si no carga, se muestra el dibujo de esa categoría.
 */
@Component({
  selector: 'app-miniatura',
  templateUrl: './miniatura.html',
  styleUrl: './miniatura.css',
})
export class Miniatura {
  readonly categoria = input.required<CategoriaMiniatura>();

  /** Se enciende si la foto no carga; entonces se usa el dibujo. */
  protected readonly fallo = signal(false);
  protected readonly rutaFoto = computed(() => `${RUTA_IMAGENES_NOTICIAS}/${this.categoria()}.webp`);
  protected readonly textoAlternativo = computed(() => TEXTO_ALTERNATIVO[this.categoria()]);
}
