import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOMBRE_PORTAL, TEXTOS_PANEL_MARCA } from '../../../core/constants/marca.constants';
import { PanelMarca } from './panel-marca';

describe('PanelMarca', () => {
  let fixture: ComponentFixture<PanelMarca>;
  const raiz = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanelMarca] }).compileComponents();
    fixture = TestBed.createComponent(PanelMarca);
    fixture.componentRef.setInput('titular', TEXTOS_PANEL_MARCA.titularLogin);
    await fixture.whenStable();
  });

  it('muestra el nombre, el titular y la bajada', () => {
    const texto = raiz().textContent ?? '';
    expect(texto).toContain(NOMBRE_PORTAL);
    expect(texto).toContain(TEXTOS_PANEL_MARCA.titularLogin);
    expect(texto).toContain(TEXTOS_PANEL_MARCA.bajada);
  });

  it('el sol de fondo es solo decoración', () => {
    expect(raiz().querySelector('.decoracion')?.getAttribute('aria-hidden')).toBe('true');
  });
});
