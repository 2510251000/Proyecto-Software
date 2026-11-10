import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CALIDAD_JPEG, LADO_MAXIMO_PX, PARTES_PUBLICAR, TIPO_SALIDA } from '../constants/imagenes.constants';
import { FotoSeleccionada, ProgresoPublicacion } from '../models/imagen.model';
import { Noticia } from '../models/noticia.model';
import { noticiaFalsa } from '../../../testing/noticia-falsa';
import { portadaDe, urlImagen } from '../utils/imagenes';
import { ImagenService } from './imagen.service';
import { NoticiaService } from './noticia.service';

describe('ImagenService', () => {
  let servicio: ImagenService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(ImagenService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mapaDeBits(ancho: number, alto: number): { width: number; height: number; close: () => void } {
    return { width: ancho, height: alto, close: vi.fn() };
  }

  it('reduce la foto al lado máximo, respeta la rotación y la exporta como JPEG', async () => {
    const mapa = mapaDeBits(4000, 3000);
    const crear = vi.fn(() => Promise.resolve(mapa));
    vi.stubGlobal('createImageBitmap', crear);
    const dibujar = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      drawImage: dibujar,
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D);
    const exportar = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((listo: BlobCallback) => listo(new Blob(['x'], { type: TIPO_SALIDA })));

    const resultado = await servicio.reducir(new Blob(['original']));

    expect(crear).toHaveBeenCalledWith(expect.any(Blob), { imageOrientation: 'from-image' });
    expect(dibujar).toHaveBeenCalledWith(mapa, 0, 0, LADO_MAXIMO_PX, 1200);
    expect(exportar).toHaveBeenCalledWith(expect.any(Function), TIPO_SALIDA, CALIDAD_JPEG);
    expect(resultado.type).toBe(TIPO_SALIDA);
    expect(mapa.close).toHaveBeenCalled();
  });

  it('una foto pequeña no se agranda', async () => {
    vi.stubGlobal('createImageBitmap', () => Promise.resolve(mapaDeBits(300, 200)));
    const dibujar = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      drawImage: dibujar,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((listo: BlobCallback) => listo(null));

    await expect(servicio.reducir(new Blob(['x']))).rejects.toThrow();
    expect(dibujar).toHaveBeenCalledWith(expect.anything(), 0, 0, 300, 200);
  });

  it('falla si el navegador no deja dibujar o no sabe leer la foto', async () => {
    vi.stubGlobal('createImageBitmap', () => Promise.resolve(mapaDeBits(10, 10)));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await expect(servicio.reducir(new Blob(['x']))).rejects.toThrow();

    vi.stubGlobal('createImageBitmap', () => Promise.reject(new Error('HEIC')));
    await expect(servicio.reducir(new Blob(['x']))).rejects.toThrow('HEIC');
  });

  it('trae con sesión las fotos protegidas', async () => {
    const promesa = firstValueFrom(servicio.obtenerProtegida('http://api/foto'));
    const peticion = http.expectOne('http://api/foto');
    expect(peticion.request.responseType).toBe('blob');
    peticion.flush(new Blob(['x']));
    expect(await promesa).toBeInstanceOf(Blob);
  });

  it('arma la URL completa de una foto y encuentra la portada', () => {
    const foto = { url: '/api/noticias/1/imagenes/1', orden: 1, textoAlternativo: null };
    expect(urlImagen(foto)).toBe(`${environment.apiUrl}/api/noticias/1/imagenes/1`);
    expect(portadaDe(noticiaFalsa({ imagenes: [foto] }))).toBe(foto);
    expect(portadaDe(noticiaFalsa())).toBeNull();
  });
});

describe('NoticiaService.publicarConImagenes', () => {
  it('manda datos e imágenes por multipart y avisa el progreso', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(NoticiaService);
    const http = TestBed.inject(HttpTestingController);
    const fotos: FotoSeleccionada[] = [
      { id: 1, archivo: new Blob(['a']), nombre: 'IMG_1.HEIC', vistaPrevia: '', descripcion: ' Parque ' },
      { id: 2, archivo: new Blob(['b']), nombre: '', vistaPrevia: '', descripcion: '' },
    ];
    const pasos: ProgresoPublicacion[] = [];
    servicio
      .publicarConImagenes({ titulo: 't', resumen: '', contenido: 'c', ciudadId: 1 }, fotos)
      .subscribe((paso) => pasos.push(paso));

    const peticion = http.expectOne(`${environment.apiUrl}/api/noticias`);
    const cuerpo = peticion.request.body as FormData;
    expect(peticion.request.reportProgress).toBe(true);
    const imagenes = cuerpo.getAll(PARTES_PUBLICAR.imagenes) as File[];
    expect(imagenes.map((f) => f.name)).toEqual(['IMG_1.jpg', 'foto-2.jpg']);
    const datos = JSON.parse(await (cuerpo.get(PARTES_PUBLICAR.datos) as Blob).text()) as Record<string, unknown>;
    expect(datos['descripcionesImagenes']).toEqual(['Parque', '']);

    peticion.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
    peticion.event({ type: HttpEventType.UploadProgress, loaded: 10 });
    const publicada: Noticia = noticiaFalsa({ id: 9 });
    peticion.flush(publicada);

    expect(pasos).toEqual([
      { tipo: 'progreso', porcentaje: 50 },
      { tipo: 'progreso', porcentaje: 0 },
      { tipo: 'listo', noticia: publicada },
    ]);
    http.verify();
  });
});
