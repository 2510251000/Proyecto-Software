import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AYUDAS_ALERTA,
  NOMBRES_ALERTA,
  TEXTOS_ALERTA,
  TIPOS_ALERTA,
} from '../../../core/constants/alertas.constants';
import { TipoAlerta } from '../../../core/models/alerta.model';

/**
 * ¿La publicación es una alerta de emergencia? «No» por defecto. Al elegir un tipo se
 * explica qué escribir y se advierte que la recibirá todo el municipio con sonido.
 */
@Component({
  selector: 'app-tipo-alerta',
  imports: [ReactiveFormsModule],
  templateUrl: './tipo-alerta.html',
  styleUrl: './tipo-alerta.css',
})
export class TipoAlertaPublicar {
  readonly control = input.required<FormControl<TipoAlerta | null>>();

  protected readonly textos = TEXTOS_ALERTA;
  protected readonly tipos = TIPOS_ALERTA;
  protected readonly nombres = NOMBRES_ALERTA;
  protected readonly ayudas = AYUDAS_ALERTA;
  protected readonly nombreGrupo = 'publicar-alerta';
}
