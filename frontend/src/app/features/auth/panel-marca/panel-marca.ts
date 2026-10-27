import { Component, input } from '@angular/core';
import { TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';
import { Logo } from '../../../shared/logo/logo';

/** Panel azul de login y registro: logo, titular, bajada y el sol saliendo. */
@Component({
  selector: 'app-panel-marca',
  imports: [Logo],
  templateUrl: './panel-marca.html',
  styleUrl: './panel-marca.css',
})
export class PanelMarca {
  readonly titular = input.required<string>();

  protected readonly bajada = TEXTOS_PANEL_MARCA.bajada;
}
