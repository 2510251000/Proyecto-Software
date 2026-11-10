import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAXIMO_FOTOS, MENSAJES_FOTOS, TEXTOS_FOTOS } from '../../core/constants/imagenes.constants';
import { FotoSeleccionada } from '../../core/models/imagen.model';
import { ImagenService } from '../../core/services/imagen.service';
import { SelectorImagenes } from './selector-imagenes';

function archivo(nombre: string, tipo = 'image/jpeg'): File {
  return new File([new Uint8Array([1, 2, 3])], nombre, { type: tipo });
}

describe('SelectorImagenes', () => {
  let fixture: ComponentFixture<SelectorImagenes>;
  let componente: SelectorImagenes;
  let reducir: ReturnType<typeof vi.fn>;
  let ultimoCambio: FotoSeleccionada[];

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);
  const todos = (selector: string) => [...raiz().querySelectorAll<HTMLElement>(selector)];

  beforeEach(async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:vista'), revokeObjectURL: vi.fn() }));
    reducir = vi.fn((entrada: Blob) =>
      (entrada as File).name.endsWith('.heic')
        ? Promise.reject(new Error('no se puede'))
        : Promise.resolve(new Blob(['reducida'], { type: 'image/jpeg' })),
    );
    await TestBed.configureTestingModule({
      imports: [SelectorImagenes],
      providers: [{ provide: ImagenService, useValue: { reducir } }],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorImagenes);
    componente = fixture.componentInstance;
    ultimoCambio = [];
    componente.cambio.subscribe((fotos) => (ultimoCambio = fotos));
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  async function agregar(...archivos: File[]): Promise<void> {
    await componente.agregar(archivos);
    await fixture.whenStable();
  }

  it('ofrece tomar foto con la cámara y elegir varias de la galería', () => {
    const [camara, galeria] = todos('input[type="file"]') as HTMLInputElement[];
    expect(camara.getAttribute('capture')).toBe('environment');
    expect(camara.accept).toBe('image/*');
    expect(galeria.multiple).toBe(true);
    expect(galeria.accept).toContain('image/heic');
    expect(todos('.boton-foto').map((b) => b.textContent?.trim())).toEqual([
      TEXTOS_FOTOS.tomarFoto,
      TEXTOS_FOTOS.elegirFotos,
    ]);
  });

  it('los botones abren el selector de archivos', () => {
    const [camara, galeria] = todos('input[type="file"]') as HTMLInputElement[];
    const clicCamara = vi.spyOn(camara, 'click');
    const clicGaleria = vi.spyOn(galeria, 'click');
    todos('.boton-foto')[0].click();
    todos('.boton-foto')[1].click();
    expect(clicCamara).toHaveBeenCalled();
    expect(clicGaleria).toHaveBeenCalled();
  });

  it('reduce cada foto, la muestra y marca la primera como portada', async () => {
    await agregar(archivo('a.jpg'), archivo('b.png', 'image/png'));
    expect(reducir).toHaveBeenCalledTimes(2);
    expect(todos('.foto')).toHaveLength(2);
    expect(todos('.portada')).toHaveLength(1);
    expect(buscar('.foto .portada')?.textContent).toContain(TEXTOS_FOTOS.portada);
    expect(ultimoCambio.map((f) => f.nombre)).toEqual(['a.jpg', 'b.png']);
    expect(ultimoCambio[0].archivo.type).toBe('image/jpeg');
  });

  it('un archivo que no es imagen se rechaza con un mensaje', async () => {
    await agregar(archivo('informe.pdf', 'application/pdf'));
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_FOTOS.noEsImagen('informe.pdf'));
    expect(todos('.foto')).toHaveLength(0);
  });

  it('si el navegador no puede leer una HEIC, explica cómo cambiarla', async () => {
    await agregar(archivo('IMG_0001.heic', ''));
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_FOTOS.noSePudoLeer('IMG_0001.heic'));
  });

  it(`no deja pasar de ${MAXIMO_FOTOS} fotos y entonces esconde los botones`, async () => {
    await agregar(...Array.from({ length: MAXIMO_FOTOS + 1 }, (_, i) => archivo(`f${i}.jpg`)));
    expect(todos('.foto')).toHaveLength(MAXIMO_FOTOS);
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_FOTOS.demasiadas);
    expect(buscar('.zona')).toBeNull();
  });

  it('se puede quitar, mover y describir cada foto', async () => {
    await agregar(archivo('a.jpg'), archivo('b.jpg'));
    todos('.foto')[1].querySelectorAll<HTMLButtonElement>('.accion')[0].click();
    await fixture.whenStable();
    expect(ultimoCambio.map((f) => f.nombre)).toEqual(['b.jpg', 'a.jpg']);

    const descripcion = buscar<HTMLInputElement>('.describir input') as HTMLInputElement;
    descripcion.value = 'Niños en el parque';
    descripcion.dispatchEvent(new Event('input'));
    expect(ultimoCambio[0].descripcion).toBe('Niños en el parque');

    buscar<HTMLButtonElement>('.quitar')?.click();
    await fixture.whenStable();
    expect(ultimoCambio.map((f) => f.nombre)).toEqual(['a.jpg']);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('las flechas no se salen de la lista', async () => {
    await agregar(archivo('a.jpg'));
    const [antes, despues] = todos('.accion') as HTMLButtonElement[];
    expect(antes.disabled).toBe(true);
    expect(despues.disabled).toBe(true);
  });

  it('acepta fotos arrastradas y soltadas', async () => {
    const zona = buscar('.zona') as HTMLElement;
    const sobre = new Event('dragover') as DragEvent;
    zona.dispatchEvent(sobre);
    await fixture.whenStable();
    expect(zona.classList).toContain('arrastrando');
    const soltar = Object.assign(new Event('drop'), { dataTransfer: { files: [archivo('soltada.jpg')] } });
    zona.dispatchEvent(soltar);
    await vi.waitFor(() => expect(ultimoCambio).toHaveLength(1));
  });

  it('acepta fotos pegadas con Ctrl+V, pero no se mete con el texto pegado', async () => {
    const conTexto = Object.assign(new Event('paste', { cancelable: true }), { clipboardData: { files: [] } });
    document.dispatchEvent(conTexto);
    expect(conTexto.defaultPrevented).toBe(false);

    const conFoto = Object.assign(new Event('paste', { cancelable: true }), {
      clipboardData: { files: [archivo('captura.png', 'image/png')] },
    });
    document.dispatchEvent(conFoto);
    expect(conFoto.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(ultimoCambio).toHaveLength(1));
  });

  it('al elegir archivos limpia el campo para poder repetir el mismo', async () => {
    const galeria = todos('input[type="file"]')[1] as HTMLInputElement;
    Object.defineProperty(galeria, 'files', { value: [archivo('a.jpg')], configurable: true });
    galeria.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(ultimoCambio).toHaveLength(1));
  });
});
