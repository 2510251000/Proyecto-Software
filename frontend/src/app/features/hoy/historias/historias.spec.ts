import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TIEMPOS_HOY } from '../../../core/constants/animaciones.constants';
import { TEXTOS_HOY } from '../../../core/constants/hoy.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Noticia } from '../../../core/models/noticia.model';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { noticiaFalsa } from '../../../../testing/noticia-falsa';
import { Historias } from './historias';

const HISTORIAS: Noticia[] = [
  noticiaFalsa({ id: 1, titulo: 'Primera noticia del día', oficial: true }),
  noticiaFalsa({ id: 2, titulo: 'Segunda noticia', autor: undefined, autorNivel: undefined }),
  noticiaFalsa({ id: 3, titulo: 'Tercera noticia', resumen: '' }),
];

describe('Historias', () => {
  let fixture: ComponentFixture<Historias>;
  let componente: Historias;
  let terminar: ReturnType<typeof vi.fn<() => void>>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);
  const titulo = () => buscar('.titulo .solo-lectores-pantalla')?.textContent?.trim();

  async function crear(reducirMovimiento = false): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Historias],
      providers: [
        provideRouter([]),
        { provide: MovimientoService, useValue: { reducirMovimiento: () => reducirMovimiento } },
      ],
    }).compileComponents();
    vi.useFakeTimers();
    fixture = TestBed.createComponent(Historias);
    fixture.componentRef.setInput('historias', HISTORIAS);
    fixture.componentRef.setInput('municipio', 'Fusagasugá');
    fixture.componentRef.setInput('fecha', 'miércoles, 4 de noviembre');
    componente = fixture.componentInstance;
    terminar = vi.fn<() => void>();
    componente.terminar.subscribe(() => terminar());
    fixture.detectChanges();
  }

  function pasar(ms: number): void {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  function tecla(key: string, objetivo: EventTarget = document.body): void {
    objetivo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  afterEach(() => vi.useRealTimers());

  it('muestra la primera historia con su barra, su chip y el anuncio para lectores de pantalla', async () => {
    await crear();
    expect(titulo()).toBe('Primera noticia del día');
    expect(raiz().querySelectorAll('.barra')).toHaveLength(HISTORIAS.length);
    expect(buscar('.relleno.activa')).not.toBeNull();
    expect(buscar('.etiqueta')?.textContent).toContain(TEXTOS_HOY.oficial);
    expect(buscar('.iniciales')?.textContent).toBe('LM');
    expect(buscar('.chip')?.textContent).toContain(`${TEXTOS_HOY.nivel} 2`);
    expect(buscar('[aria-live="polite"]')?.textContent).toContain(
      `${TEXTOS_HOY.historia} 1 ${TEXTOS_HOY.de} 3: Primera noticia del día`,
    );
    expect(buscar('.leer')?.getAttribute('href')).toBe(`/${RUTAS.noticias}/1`);
    expect(buscar('.titular-lista.actual')?.getAttribute('aria-current')).toBe('true');
    expect(buscar('.titular-proximo')?.textContent).toContain('Segunda noticia');
  });

  it('avanza sola cuando pasa el tiempo de cada historia', async () => {
    await crear();
    pasar(TIEMPOS_HOY.historia - 1);
    expect(componente.indice()).toBe(0);
    pasar(1);
    expect(componente.indice()).toBe(1);
    expect(titulo()).toBe('Segunda noticia');
    expect(buscar('.etiqueta')?.textContent).toContain(TEXTOS_HOY.comunidad);
    expect(buscar('.autor')?.textContent).toBe(TEXTOS_HOY.autorDesconocido);
  });

  it('después de la última avisa que terminó', async () => {
    await crear();
    pasar(TIEMPOS_HOY.historia * HISTORIAS.length);
    expect(terminar).toHaveBeenCalledTimes(1);
  });

  it('tocar a la derecha va a la siguiente y a la izquierda a la anterior', async () => {
    await crear();
    buscar<HTMLButtonElement>('.zona-siguiente')?.click();
    fixture.detectChanges();
    expect(componente.indice()).toBe(1);
    buscar<HTMLButtonElement>('.zona-anterior')?.click();
    fixture.detectChanges();
    expect(componente.indice()).toBe(0);
    buscar<HTMLButtonElement>('.zona-anterior')?.click();
    expect(componente.indice()).toBe(0);
  });

  it('la zona de la anterior ocupa el 35 % izquierdo', async () => {
    await crear();
    expect(buscar<HTMLElement>('.zona-anterior')?.style.width).toBe('35%');
  });

  it('las flechas del teclado cambian de historia', async () => {
    await crear();
    tecla('ArrowRight');
    tecla('ArrowRight');
    expect(componente.indice()).toBe(2);
    tecla('ArrowLeft');
    expect(componente.indice()).toBe(1);
  });

  it('la barra espaciadora pausa y reanuda donde iba', async () => {
    await crear();
    pasar(2000);
    tecla(' ');
    expect(componente.pausado()).toBe(true);
    expect(buscar('.visor')?.classList).toContain('pausado');
    expect(buscar('.aviso-pausa')?.textContent).toContain(TEXTOS_HOY.enPausa);
    pasar(TIEMPOS_HOY.historia * 2);
    expect(componente.indice()).toBe(0);
    tecla(' ');
    expect(componente.pausado()).toBe(false);
    pasar(TIEMPOS_HOY.historia - 2000 - 1);
    expect(componente.indice()).toBe(0);
    pasar(1);
    expect(componente.indice()).toBe(1);
  });

  it('la barra espaciadora sobre un botón no pausa: activa el botón', async () => {
    await crear();
    tecla(' ', buscar('.cerrar') as HTMLElement);
    expect(componente.pausado()).toBe(false);
  });

  it('el botón de pausa también pausa y reanuda', async () => {
    await crear();
    const boton = () => buscar<HTMLButtonElement>('.controles .control') as HTMLButtonElement;
    expect(boton().getAttribute('aria-label')).toBe(TEXTOS_HOY.pausar);
    boton().click();
    fixture.detectChanges();
    expect(componente.pausado()).toBe(true);
    expect(boton().getAttribute('aria-label')).toBe(TEXTOS_HOY.reanudar);
    boton().click();
    fixture.detectChanges();
    expect(componente.pausado()).toBe(false);
  });

  it('mantener presionado pausa; al soltar sigue y el toque no cambia de historia', async () => {
    await crear();
    const zonas = buscar('.zonas') as HTMLElement;
    zonas.dispatchEvent(new Event('pointerdown'));
    pasar(TIEMPOS_HOY.presionLarga);
    expect(componente.pausado()).toBe(true);
    zonas.dispatchEvent(new Event('pointerup'));
    expect(componente.pausado()).toBe(false);
    buscar<HTMLButtonElement>('.zona-siguiente')?.click();
    expect(componente.indice()).toBe(0);
  });

  it('un toque corto no pausa', async () => {
    await crear();
    const zonas = buscar('.zonas') as HTMLElement;
    zonas.dispatchEvent(new Event('pointerdown'));
    pasar(TIEMPOS_HOY.presionLarga - 100);
    zonas.dispatchEvent(new Event('pointerup'));
    pasar(200);
    expect(componente.pausado()).toBe(false);
    buscar<HTMLButtonElement>('.zona-siguiente')?.click();
    expect(componente.indice()).toBe(1);
  });

  it('al ir a otra historia mientras está en pausa, la pausa se quita', async () => {
    await crear();
    componente.pausar();
    componente.pausar();
    componente.avanzar();
    expect(componente.pausado()).toBe(false);
    componente.reanudar();
    expect(componente.pausado()).toBe(false);
  });

  it('se puede saltar a un titular de la lista', async () => {
    await crear();
    raiz().querySelectorAll<HTMLButtonElement>('.titular-lista')[2].click();
    fixture.detectChanges();
    expect(componente.indice()).toBe(2);
    expect(buscar('.resumen')).toBeNull();
    expect(buscar('.titular-proximo')).toBeNull();
  });

  it('«Sigue» lleva a la próxima', async () => {
    await crear();
    buscar<HTMLButtonElement>('.titular-proximo')?.click();
    expect(componente.indice()).toBe(1);
  });

  it('«Cerrar» lleva a la portada', async () => {
    await crear();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    buscar<HTMLButtonElement>('.cerrar')?.click();
    expect(navegar).toHaveBeenCalledWith([RUTAS.noticias]);
  });

  it('con «reducir movimiento» no avanza sola', async () => {
    await crear(true);
    expect(buscar('.visor')?.classList).toContain('sin-movimiento');
    pasar(TIEMPOS_HOY.historia * 3);
    expect(componente.indice()).toBe(0);
    expect(terminar).not.toHaveBeenCalled();
    tecla('ArrowRight');
    expect(componente.indice()).toBe(1);
  });

  it('al destruirse no sigue avanzando', async () => {
    await crear();
    fixture.destroy();
    vi.advanceTimersByTime(TIEMPOS_HOY.historia * 5);
    expect(terminar).not.toHaveBeenCalled();
  });
});
