import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTOS_PUBLICAR, textoCupo } from '../../../core/constants/pantallas.constants';
import {
  preguntaPublicar,
  TEXTOS_BIENVENIDA,
  TEXTOS_PORTADA,
  titularBienvenida,
} from '../../../core/constants/portada.constants';
import { IDIOMA } from '../../../core/constants/regional.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { iniciales } from '../../../core/utils/texto';

const FORMATO_DIA = new Intl.DateTimeFormat(IDIOMA, { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Bloque azul de arriba de la portada: municipio y fecha, el titular de la página, un
 * campo que lleva a Publicar y cuántas publicaciones le quedan hoy al usuario.
 */
@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {
  /** Municipio elegido en la barra; null cuando se ven todos. */
  readonly ciudadActiva = input<string | null>(null);

  protected readonly textos = TEXTOS_BIENVENIDA;
  protected readonly rutaPublicar = ['/', RUTAS.publicar];

  /** null mientras llega o si no se pudo cargar: el bloque se muestra igual, sin el cupo. */
  readonly perfil = input<Perfil | null>(null);

  protected readonly antetitulo = computed(() => {
    const lugar = this.ciudadActiva() ?? TEXTOS_PORTADA.tuRegion;
    return `${lugar} · ${FORMATO_DIA.format(new Date())}`;
  });

  protected readonly titular = computed(() => titularBienvenida(this.ciudadActiva()));

  /** Se publica en el municipio del usuario, no en el que se está mirando. */
  protected readonly pregunta = computed(() => preguntaPublicar(this.perfil()?.ciudad?.nombre ?? null));

  protected readonly iniciales = computed(() => {
    const perfil = this.perfil();
    return perfil ? iniciales(perfil.nombre?.trim() || perfil.correo) : '';
  });

  /** «Te quedan 9 de 10 publicaciones hoy · nivel 2», o sin límite para administradores. */
  protected readonly cupo = computed(() => {
    const perfil = this.perfil();
    if (!perfil) {
      return '';
    }
    const { cupo } = perfil;
    if (cupo.ilimitado || cupo.restantes === null) {
      return TEXTOS_PUBLICAR.cupoIlimitado;
    }
    const restantes = textoCupo(cupo.restantes, cupo.limite).replace(/\.$/, '');
    return `${restantes} · ${TEXTOS_BIENVENIDA.nivel} ${perfil.nivelNumero}`;
  });
}
