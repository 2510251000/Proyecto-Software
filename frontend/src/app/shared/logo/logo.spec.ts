import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOMBRE_PORTAL } from '../../core/constants/marca.constants';
import { Logo } from './logo';

describe('Logo', () => {
  let fixture: ComponentFixture<Logo>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const svg = () => raiz().querySelector('svg') as SVGSVGElement;
  const filetes = () => raiz().querySelectorAll('svg rect').length - 1;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Logo] }).compileComponents();
    fixture = TestBed.createComponent(Logo);
    await fixture.whenStable();
  });

  it('se anuncia como imagen con el nombre del portal', () => {
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe(NOMBRE_PORTAL);
  });

  it('mide 40 px por defecto y respeta el tamaño pedido', async () => {
    expect(svg().getAttribute('width')).toBe('40');
    fixture.componentRef.setInput('tamano', 64);
    await fixture.whenStable();
    expect(svg().getAttribute('width')).toBe('64');
    expect(svg().getAttribute('height')).toBe('64');
  });

  it('usa la versión completa, con tres filetes', () => {
    expect(filetes()).toBe(3);
  });

  it('usa la versión reducida, con un filete, si se pide', async () => {
    fixture.componentRef.setInput('variante', 'reducido');
    await fixture.whenStable();
    expect(filetes()).toBe(1);
  });

  it('pasa sola a la versión reducida por debajo de 24 px', async () => {
    fixture.componentRef.setInput('tamano', 24);
    await fixture.whenStable();
    expect(filetes()).toBe(3);
    fixture.componentRef.setInput('tamano', 23);
    await fixture.whenStable();
    expect(filetes()).toBe(1);
  });

  it('con la palabra al lado, el dibujo se oculta a los lectores de pantalla', async () => {
    fixture.componentRef.setInput('conNombre', true);
    await fixture.whenStable();
    expect(raiz().textContent).toContain(NOMBRE_PORTAL);
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().hasAttribute('role')).toBe(false);
  });
});
