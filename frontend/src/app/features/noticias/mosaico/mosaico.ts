import { Component, computed, input, output } from '@angular/core';
import { TEXTOS_MOSAICO, textoDemasDelDia } from '../../../core/constants/dia-en-vivo.constants';
import { ETIQUETAS_PESTANA, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia, PestanaPortada } from '../../../core/models/noticia.model';
import { fechaLegible } from '../../../core/utils/dia-en-vivo';
import { Boton } from '../../../shared/boton/boton';
import { FichaNoticia } from '../ficha-noticia/ficha-noticia';

const PESTANAS: readonly PestanaPortada[] = ['RECOMENDADAS', 'RECIENTES', 'OFICIALES', 'COMUNITARIAS'];

/** Noticias de la segunda fila: una de color y dos con foto. */
const EN_FILA_2 = 3;

/**
 * El mosaico de la portada: lo demás del día en fichas de distintos tamaños y, debajo, los
 * días anteriores. Fila 1: una noticia en grande y los huecos del mapa y del nivel. Fila 2:
 * una de color, dos con foto y el hueco de los avisos. Quien lo usa llena los huecos con
 * los atributos `fichaMapa`, `fichaNivel` y `fichaAvisos`.
 */
@Component({
  selector: 'app-mosaico',
  imports: [Boton, FichaNoticia],
  templateUrl: './mosaico.html',
  styleUrl: './mosaico.css',
})
export class Mosaico {
  /** Las noticias de las fichas, en orden: primero las del día mostrado. */
  readonly delDia = input<readonly Noticia[]>([]);
  /** Las de «Días anteriores» que ya se ven. */
  readonly anteriores = input<readonly Noticia[]>([]);
  /** true si quedan más noticias anteriores por mostrar. */
  readonly hayMas = input(false);
  /** El día que muestra la portada, como «2026-11-09». */
  readonly dia = input.required<string>();
  readonly esHoy = input(true);
  /** true si entre las fichas hay al menos una noticia del día mostrado. */
  readonly conNoticiasDelDia = input(true);
  readonly pestanaActiva = input<PestanaPortada>('RECOMENDADAS');
  /** Mensaje cuando la pestaña y el municipio no dejan ninguna noticia; null si hay. */
  readonly aviso = input<string | null>(null);

  readonly abrir = output<Noticia>();
  readonly pestana = output<PestanaPortada>();
  readonly verMas = output<void>();

  protected readonly textos = TEXTOS_MOSAICO;
  protected readonly textosPortada = TEXTOS_PORTADA;
  protected readonly nombrePestanas = TEXTOS_BUSQUEDA.pestanas;
  protected readonly etiquetas = ETIQUETAS_PESTANA;
  protected readonly pestanas = PESTANAS;

  /** «Lo demás de hoy», «Lo demás del lunes 9 de noviembre» o «Lo más reciente». */
  protected readonly titulo = computed(() => {
    if (!this.conNoticiasDelDia()) {
      return TEXTOS_MOSAICO.reciente;
    }
    if (this.esHoy()) {
      return TEXTOS_MOSAICO.hoy;
    }
    const fecha = fechaLegible(this.dia());
    return textoDemasDelDia(fecha.charAt(0).toLowerCase() + fecha.slice(1));
  });

  protected readonly grande = computed(() => this.delDia().at(0) ?? null);
  protected readonly deColor = computed(() => this.delDia().at(1) ?? null);
  protected readonly conFoto = computed(() => this.delDia().slice(2, 1 + EN_FILA_2));
  /** Si quedan más del día, van en filas de cuatro fichas con foto. */
  protected readonly masDelDia = computed(() => this.delDia().slice(1 + EN_FILA_2));
}
