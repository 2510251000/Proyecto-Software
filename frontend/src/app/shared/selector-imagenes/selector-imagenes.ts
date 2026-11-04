import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import {
  LARGO_MAXIMO_DESCRIPCION,
  MAXIMO_FOTOS,
  MENSAJES_FOTOS,
  TEXTOS_FOTOS,
  TIPOS_ACEPTADOS,
  TIPOS_CAMARA,
} from '../../core/constants/imagenes.constants';
import { FotoSeleccionada } from '../../core/models/imagen.model';
import { ImagenService } from '../../core/services/imagen.service';

/** HEIC/HEIF a veces llega sin tipo MIME (Windows no lo conoce): se reconoce por la extensión. */
const EXTENSION_HEIC = /\.(heic|heif)$/i;

/**
 * Elegir hasta MAXIMO_FOTOS fotos: con la cámara del celular, desde la galería o los archivos,
 * arrastrándolas o pegándolas (Ctrl+V). Cada una se reduce en el navegador antes de subirla.
 * Se pueden quitar, reordenar (la primera es la portada) y describir.
 */
@Component({
  selector: 'app-selector-imagenes',
  templateUrl: './selector-imagenes.html',
  styleUrl: './selector-imagenes.css',
  host: { '(document:paste)': 'alPegar($event)' },
})
export class SelectorImagenes {
  private readonly imagenes = inject(ImagenService);

  readonly deshabilitado = input(false);
  /** Las fotos cambiaron (se agregaron, quitaron, movieron o describieron). */
  readonly cambio = output<FotoSeleccionada[]>();

  protected readonly textos = TEXTOS_FOTOS;
  protected readonly maximo = MAXIMO_FOTOS;
  protected readonly largoDescripcion = LARGO_MAXIMO_DESCRIPCION;
  protected readonly tiposAceptados = TIPOS_ACEPTADOS;
  protected readonly tiposCamara = TIPOS_CAMARA;

  readonly fotos = signal<FotoSeleccionada[]>([]);
  readonly errores = signal<string[]>([]);
  readonly procesando = signal(false);
  protected readonly arrastrando = signal(false);
  private siguienteId = 1;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.fotos().forEach((foto) => URL.revokeObjectURL(foto.vistaPrevia)));
  }

  protected alElegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    void this.agregar([...(entrada.files ?? [])]);
    // Así se puede volver a elegir el mismo archivo después de quitarlo.
    entrada.value = '';
  }

  protected alArrastrar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  protected alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    void this.agregar([...(evento.dataTransfer?.files ?? [])]);
  }

  /** Pegar con Ctrl+V: solo actúa si lo pegado trae archivos; el texto sigue su camino normal. */
  protected alPegar(evento: ClipboardEvent): void {
    const archivos = [...(evento.clipboardData?.files ?? [])];
    if (archivos.length === 0 || this.deshabilitado()) {
      return;
    }
    evento.preventDefault();
    void this.agregar(archivos);
  }

  async agregar(archivos: File[]): Promise<void> {
    const errores: string[] = [];
    const espacio = this.maximo - this.fotos().length;
    if (archivos.length > espacio) {
      errores.push(MENSAJES_FOTOS.demasiadas);
    }
    this.procesando.set(true);
    for (const archivo of archivos.slice(0, Math.max(0, espacio))) {
      if (!archivo.type.startsWith('image/') && !EXTENSION_HEIC.test(archivo.name)) {
        errores.push(MENSAJES_FOTOS.noEsImagen(archivo.name));
        continue;
      }
      try {
        const reducida = await this.imagenes.reducir(archivo);
        const foto: FotoSeleccionada = {
          id: this.siguienteId++,
          archivo: reducida,
          nombre: archivo.name,
          vistaPrevia: URL.createObjectURL(reducida),
          descripcion: '',
        };
        this.fotos.update((lista) => [...lista, foto]);
      } catch {
        errores.push(MENSAJES_FOTOS.noSePudoLeer(archivo.name));
      }
    }
    this.procesando.set(false);
    this.errores.set(errores);
    this.avisar();
  }

  protected quitar(foto: FotoSeleccionada): void {
    URL.revokeObjectURL(foto.vistaPrevia);
    this.fotos.update((lista) => lista.filter((f) => f.id !== foto.id));
    this.errores.set([]);
    this.avisar();
  }

  /** Cambia la foto de lugar: -1 la adelanta (hacia la portada) y +1 la atrasa. */
  protected mover(posicion: number, paso: -1 | 1): void {
    const destino = posicion + paso;
    this.fotos.update((lista) => {
      if (destino < 0 || destino >= lista.length) {
        return lista;
      }
      const nueva = [...lista];
      [nueva[posicion], nueva[destino]] = [nueva[destino], nueva[posicion]];
      return nueva;
    });
    this.avisar();
  }

  protected describir(foto: FotoSeleccionada, evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value;
    this.fotos.update((lista) => lista.map((f) => (f.id === foto.id ? { ...f, descripcion: texto } : f)));
    this.avisar();
  }

  private avisar(): void {
    this.cambio.emit(this.fotos());
  }
}
