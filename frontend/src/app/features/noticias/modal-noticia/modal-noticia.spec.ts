import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TEXTOS_NOTICIA } from '../../../core/constants/portada.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { simularDialogoNativo } from './dialogo-de-prueba';
import { ModalNoticia } from './modal-noticia';

const NOTICIA: Noticia = {
  id: 7,
  titulo: 'Arreglan la vía principal',
  resumen: 'La alcaldía terminó las obras.',
  contenido: 'Primer párrafo.\nSegundo párrafo.',
  fechaPublicacion: '2026-09-21T10:00:00',
  oficial: true,
  ciudad: 'Fusagasugá',
};

describe('ModalNoticia', () => {
  let fixture: ComponentFixture<ModalNoticia>;
  let cierres: number;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const dialogo = () => raiz().querySelector('dialog') as HTMLDialogElement;

  async function mostrar(noticia: Noticia | null): Promise<void> {
    fixture.componentRef.setInput('noticia', noticia);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    simularDialogoNativo();
    await TestBed.configureTestingModule({
      imports: [ModalNoticia],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ModalNoticia);
    cierres = 0;
    fixture.componentInstance.cerrada.subscribe(() => cierres++);
    await mostrar(null);
  });

  it('sin noticia está cerrado y vacío', () => {
    expect(dialogo().hasAttribute('open')).toBe(false);
    expect(dialogo().textContent?.trim()).toBe('');
  });

  it('con una noticia se abre, la muestra y toma su titular como nombre', async () => {
    await mostrar(NOTICIA);
    expect(dialogo().hasAttribute('open')).toBe(true);
    expect(dialogo().textContent).toContain('Arreglan la vía principal');
    expect(dialogo().textContent).toContain('Segundo párrafo.');
    const idTitulo = dialogo().getAttribute('aria-labelledby') ?? '';
    expect(raiz().querySelector(`#${idTitulo}`)?.textContent).toContain('Arreglan la vía principal');
  });

  it('enlaza a la página completa de la noticia', async () => {
    await mostrar(NOTICIA);
    const enlace = raiz().querySelector('a.pagina');
    expect(enlace?.textContent).toContain(TEXTOS_NOTICIA.abrirPagina);
    expect(enlace?.getAttribute('href')).toBe('/noticias/7');
  });

  it('el botón de cerrar tiene nombre, cierra el diálogo y avisa', async () => {
    await mostrar(NOTICIA);
    const boton = raiz().querySelector('button.cerrar') as HTMLButtonElement;
    expect(boton.getAttribute('aria-label')).toBe(TEXTOS_NOTICIA.cerrar);
    boton.click();
    expect(dialogo().hasAttribute('open')).toBe(false);
    expect(cierres).toBe(1);
  });

  it('un clic fuera de la hoja también cierra', async () => {
    await mostrar(NOTICIA);
    (raiz().querySelector('button.fondo') as HTMLButtonElement).click();
    expect(cierres).toBe(1);
  });

  it('se cierra cuando le quitan la noticia', async () => {
    await mostrar(NOTICIA);
    await mostrar(null);
    expect(dialogo().hasAttribute('open')).toBe(false);
  });
});
