import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ID_BUSQUEDA_NOTICIAS, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { HerramientasPortada } from './herramientas-portada';

const CIUDADES = [
  { ciudad: 'Fusagasugá', cantidad: 3 },
  { ciudad: 'Soacha', cantidad: 2 },
];

describe('HerramientasPortada', () => {
  let fixture: ComponentFixture<HerramientasPortada>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const entrada = () => raiz().querySelector<HTMLInputElement>(`#${ID_BUSQUEDA_NOTICIAS}`) as HTMLInputElement;
  const selector = () => raiz().querySelector<HTMLSelectElement>('select') as HTMLSelectElement;

  async function escribir(texto: string): Promise<void> {
    entrada().value = texto;
    entrada().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HerramientasPortada] }).compileComponents();
    fixture = TestBed.createComponent(HerramientasPortada);
    fixture.componentRef.setInput('ciudades', CIUDADES);
    fixture.componentRef.setInput('total', 5);
    await fixture.whenStable();
  });

  it('el campo de búsqueda y el municipio tienen su etiqueta', () => {
    expect(raiz().querySelector(`label[for="${ID_BUSQUEDA_NOTICIAS}"]`)?.textContent).toContain(TEXTOS_BUSQUEDA.etiqueta);
    expect(raiz().querySelector(`label[for="${selector().id}"]`)?.textContent).toContain(TEXTOS_BUSQUEDA.municipio);
    expect(raiz().querySelector('form')?.getAttribute('role')).toBe('search');
  });

  it('al enviar avisa con la palabra escrita, sin espacios de sobra', async () => {
    const buscadas: string[] = [];
    fixture.componentInstance.buscar.subscribe((texto) => buscadas.push(texto));
    await escribir('  feria  ');
    raiz().querySelector('form')?.dispatchEvent(new Event('submit'));
    expect(buscadas).toEqual(['feria']);
  });

  it('enviar no recarga la página', () => {
    const envio = new Event('submit', { cancelable: true });
    raiz().querySelector('form')?.dispatchEvent(envio);
    expect(envio.defaultPrevented).toBe(true);
  });

  it('si la búsqueda se quita desde afuera, el campo se vacía', async () => {
    fixture.componentRef.setInput('textoActivo', 'feria');
    await fixture.whenStable();
    expect(entrada().value).toBe('feria');

    fixture.componentRef.setInput('textoActivo', '');
    await fixture.whenStable();
    expect(entrada().value).toBe('');
  });

  it('lista «Todos los municipios» con el total y cada municipio con su cantidad', () => {
    const opciones = [...selector().options].map((o) => o.textContent?.replace(/\s+/g, ' ').trim());
    expect(opciones).toEqual([`${TEXTOS_BUSQUEDA.todosMunicipios} (5)`, 'Fusagasugá (3)', 'Soacha (2)']);
    expect(selector().value).toBe('');
  });

  it('marca el municipio activo', async () => {
    fixture.componentRef.setInput('ciudadActiva', 'Soacha');
    await fixture.whenStable();
    expect(selector().value).toBe('Soacha');
  });

  it('al elegir avisa con el municipio, y con null al volver a todos', () => {
    const elegidas: (string | null)[] = [];
    fixture.componentInstance.ciudad.subscribe((ciudad) => elegidas.push(ciudad));
    selector().value = 'Soacha';
    selector().dispatchEvent(new Event('change'));
    selector().value = '';
    selector().dispatchEvent(new Event('change'));
    expect(elegidas).toEqual(['Soacha', null]);
  });

  it('los íconos son decorativos', () => {
    const iconos = [...raiz().querySelectorAll('svg')];
    expect(iconos).toHaveLength(2);
    expect(iconos.every((icono) => icono.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
