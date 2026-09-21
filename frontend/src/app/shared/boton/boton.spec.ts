import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEXTOS_COMUNES } from '../../core/constants/mensajes.constants';
import { Boton } from './boton';

describe('Boton', () => {
  let fixture: ComponentFixture<Boton>;

  function boton(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Boton] }).compileComponents();
    fixture = TestBed.createComponent(Boton);
    await fixture.whenStable();
  });

  it('es de tipo button por defecto y está habilitado', () => {
    expect(boton().type).toBe('button');
    expect(boton().disabled).toBe(false);
  });

  it('puede ser de tipo submit', async () => {
    fixture.componentRef.setInput('tipo', 'submit');
    await fixture.whenStable();
    expect(boton().type).toBe('submit');
  });

  it('se deshabilita y avisa que está ocupado mientras carga', async () => {
    fixture.componentRef.setInput('cargando', true);
    await fixture.whenStable();
    expect(boton().disabled).toBe(true);
    expect(boton().getAttribute('aria-busy')).toBe('true');
    expect(boton().textContent).toContain(TEXTOS_COMUNES.cargando);
  });

  it('se deshabilita cuando se le pide', async () => {
    fixture.componentRef.setInput('deshabilitado', true);
    await fixture.whenStable();
    expect(boton().disabled).toBe(true);
  });
});
