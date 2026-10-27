import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Noticia } from '../../core/models/noticia.model';
import { EnlaceNoticia } from './enlace-noticia';

const NOTICIA: Noticia = {
  id: 7,
  titulo: 'Arreglan la vía principal',
  resumen: 'Resumen',
  contenido: 'Contenido',
  fechaPublicacion: '2026-09-21T10:00:00',
  oficial: false,
  ciudad: 'Fusagasugá',
};

@Component({
  imports: [EnlaceNoticia],
  template: `<a [appEnlaceNoticia]="noticia" (abrirNoticia)="abierta = $event">Leer</a>`,
})
class Anfitrion {
  readonly noticia = NOTICIA;
  abierta: Noticia | null = null;
}

describe('EnlaceNoticia', () => {
  let fixture: ComponentFixture<Anfitrion>;
  const enlace = () => (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;

  function clic(opciones: MouseEventInit = {}): MouseEvent {
    const evento = new MouseEvent('click', { bubbles: true, cancelable: true, ...opciones });
    enlace().dispatchEvent(evento);
    return evento;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
  });

  it('es un enlace de verdad a la página de la noticia', () => {
    expect(enlace().getAttribute('href')).toBe('/noticias/7');
  });

  it('el clic normal avisa en vez de navegar', () => {
    const evento = clic();
    expect(evento.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.abierta).toBe(NOTICIA);
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey'] as const)(
    'con %s deja que el navegador abra el enlace',
    (tecla) => {
      const evento = clic({ [tecla]: true });
      expect(evento.defaultPrevented).toBe(false);
      expect(fixture.componentInstance.abierta).toBeNull();
    },
  );
});
