import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTOS_CINE } from '../../../core/constants/dia-en-vivo.constants';
import { ETIQUETAS_NOTICIA } from '../../../core/constants/portada.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { categoriaDeNoticia } from '../../../core/utils/categoria-noticia';
import { horaDecimal, horaLegible } from '../../../core/utils/dia-en-vivo';
import { portadaDe } from '../../../core/utils/imagenes';
import { esUltimaHora, minutosDeLectura, nombreAutor, tieneUbicacion } from '../../../core/utils/noticia';
import { iniciales } from '../../../core/utils/texto';
import { EnlaceNoticia } from '../../../shared/enlace-noticia/enlace-noticia';
import { Miniatura } from '../../../shared/miniatura/miniatura';

/**
 * Portada de cine: la noticia del momento a pantalla completa, con su foto de fondo, un velo
 * azul para que el texto se lea y el titular enorme (el único h1 de la pantalla).
 */
@Component({
  selector: 'app-portada-cine',
  imports: [EnlaceNoticia, Miniatura, RouterLink],
  templateUrl: './portada-cine.html',
  styleUrl: './portada-cine.css',
})
export class PortadaCine {
  readonly noticia = input.required<Noticia>();
  /** Clic en «Leer la noticia»: quien la usa decide cómo mostrarla. */
  readonly abrir = output<Noticia>();

  protected readonly textos = TEXTOS_CINE;
  protected readonly etiquetas = ETIQUETAS_NOTICIA;
  protected readonly rutaMapa = ['/', RUTAS.mapa];

  protected readonly categoria = computed(() => categoriaDeNoticia(this.noticia().titulo));
  protected readonly foto = computed(() => portadaDe(this.noticia()));

  /** «Oficial», «Comunidad · Nivel 2» o solo «Comunidad» si la API no trae el nivel. */
  protected readonly etiqueta = computed(() => {
    const { oficial, autorNivel } = this.noticia();
    if (oficial) {
      return ETIQUETAS_NOTICIA.oficial;
    }
    return autorNivel
      ? `${ETIQUETAS_NOTICIA.comunidad} · ${ETIQUETAS_NOTICIA.etiquetaNivel} ${autorNivel}`
      : ETIQUETAS_NOTICIA.comunidad;
  });

  protected readonly ultimaHora = computed(() => esUltimaHora(this.noticia()));

  /** «4:20 p. m.»; vacío si la fecha no es válida. */
  protected readonly hora = computed(() => {
    const hora = horaDecimal(this.noticia().fechaPublicacion);
    return hora === null ? '' : horaLegible(hora);
  });

  protected readonly autor = computed(() => nombreAutor(this.noticia()));
  protected readonly iniciales = computed(() => iniciales(this.autor()));
  protected readonly minutos = computed(() => minutosDeLectura(this.noticia().contenido));
  protected readonly conUbicacion = computed(() => tieneUbicacion(this.noticia()));
}
