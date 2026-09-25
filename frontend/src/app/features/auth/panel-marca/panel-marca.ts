import { Component, input } from '@angular/core';
import { DATOS_PORTAL, TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';
import { Logo } from '../../../shared/logo/logo';

/** Panel azul de login y registro: logo, titular, bajada y tres datos del portal. */
@Component({
  selector: 'app-panel-marca',
  imports: [Logo],
  templateUrl: './panel-marca.html',
  styleUrl: './panel-marca.css',
})
export class PanelMarca {
  readonly titular = input.required<string>();

  protected readonly bajada = TEXTOS_PANEL_MARCA.bajada;
  protected readonly datos = DATOS_PORTAL;
}
