import { Component, input, output } from '@angular/core';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';

/** Sección de la portada: filete ámbar arriba, título en mayúsculas y «Ver todo» a la derecha. */
@Component({
  selector: 'app-franja-seccion',
  templateUrl: './franja-seccion.html',
  styleUrl: './franja-seccion.css',
})
export class FranjaSeccion {
  readonly titulo = input.required<string>();
  /** id del título: nombra la sección y permite llevar el foco hasta ella. */
  readonly idTitulo = input.required<string>();
  readonly mostrarVerTodo = input(false);
  readonly verTodo = output();

  protected readonly textos = TEXTOS_PORTADA;
}
