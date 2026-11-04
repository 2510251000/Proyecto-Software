import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ETIQUETAS_MOTIVO,
  TEXTOS_CALIFICACION,
  TEXTOS_COMENTARIOS,
  TEXTOS_REPORTE,
} from '../../../core/constants/interaccion.constants';
import { Rol, ROLES } from '../../../core/constants/roles.constants';
import { Comentario, Reporte, ResultadoCalificacion } from '../../../core/models/interaccion.model';
import { AuthService } from '../../../core/services/auth.service';
import { InteraccionService } from '../../../core/services/interaccion.service';
import { noticiaFalsa } from '../../../../testing/noticia-falsa';
import { simularDialogoNativo } from '../modal-noticia/dialogo-de-prueba';
import { CalificacionNoticia } from './calificacion-noticia/calificacion-noticia';
import { ComentariosNoticia } from './comentarios-noticia/comentarios-noticia';
import { ReportarNoticia } from './reportar-noticia/reportar-noticia';

const YO = 7;

function sesion(id = YO, rol: Rol = ROLES.usuarioComun) {
  return { provide: AuthService, useValue: { obtenerContenidoToken: () => ({ id, rol, sub: 'yo@x.com' }) } };
}

function comentario(id: number, autorId: number): Comentario {
  return { id, contenido: `Comentario ${id}`, fecha: '2026-11-04T09:00:00', autorId, autor: `Autor ${autorId}`, autorNivel: 1 };
}

describe('CalificacionNoticia', () => {
  let calificar: ReturnType<typeof vi.fn>;
  let respuesta: Subject<ResultadoCalificacion>;

  async function crear(cambios = {}) {
    respuesta = new Subject<ResultadoCalificacion>();
    calificar = vi.fn(() => respuesta);
    await TestBed.configureTestingModule({
      imports: [CalificacionNoticia],
      providers: [sesion(), { provide: InteraccionService, useValue: { calificar } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CalificacionNoticia);
    fixture.componentRef.setInput('noticia', noticiaFalsa({ id: 3, autorId: 1, ...cambios }));
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  it('es un grupo de cinco radios con nombre accesible y muestra el promedio', async () => {
    const { raiz } = await crear({ promedio: 4.25, cantidadCalificaciones: 3, miCalificacion: 4 });
    const radios = raiz.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios).toHaveLength(5);
    expect(radios[3].checked).toBe(true);
    expect(raiz.querySelector('legend')?.textContent).toContain(TEXTOS_CALIFICACION.titulo);
    expect(raiz.querySelectorAll('.estrella.llena')).toHaveLength(4);
    expect(raiz.querySelector('.resumen')?.textContent).toContain('4.3 · 3 calificaciones');
    expect(raiz.textContent).toContain('1 estrella');
  });

  it('sin calificaciones lo dice', async () => {
    const { raiz } = await crear();
    expect(raiz.querySelector('.resumen')?.textContent).toContain(TEXTOS_CALIFICACION.sinCalificaciones);
  });

  it('al elegir una estrella la guarda y actualiza el promedio', async () => {
    const { fixture, raiz } = await crear();
    raiz.querySelectorAll<HTMLInputElement>('input[type="radio"]')[4].dispatchEvent(new Event('change'));
    expect(calificar).toHaveBeenCalledWith(3, 5);
    respuesta.next({ promedio: 5, cantidadCalificaciones: 1, miCalificacion: 5 });
    await fixture.whenStable();
    expect(raiz.querySelector('.resumen')?.textContent).toContain('5.0 · 1 calificación');
    expect(raiz.querySelector('[role="status"]')?.textContent).toContain(TEXTOS_CALIFICACION.gracias);
  });

  it('si falla, vuelve a la calificación anterior y muestra el error', async () => {
    const { fixture, raiz } = await crear({ miCalificacion: 2 });
    fixture.componentInstance.calificar(4);
    respuesta.error({ estado: 500, mensaje: 'Algo falló' });
    await fixture.whenStable();
    expect(fixture.componentInstance.mia()).toBe(2);
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Algo falló');
  });

  it('el autor no puede calificar su propia noticia', async () => {
    const { fixture, raiz } = await crear({ autorId: YO });
    expect(raiz.querySelector<HTMLFieldSetElement>('fieldset')?.disabled).toBe(true);
    expect(raiz.textContent).toContain(TEXTOS_CALIFICACION.propia);
    fixture.componentInstance.calificar(5);
    expect(calificar).not.toHaveBeenCalled();
  });
});

describe('ComentariosNoticia', () => {
  let comentar: ReturnType<typeof vi.fn>;
  let borrarComentario: ReturnType<typeof vi.fn>;

  async function crear(lista: Comentario[], rol: Rol = ROLES.usuarioComun) {
    comentar = vi.fn((_: number, contenido: string) => of({ ...comentario(99, YO), contenido }));
    borrarComentario = vi.fn(() => of(undefined));
    await TestBed.configureTestingModule({
      imports: [ComentariosNoticia],
      providers: [
        sesion(YO, rol),
        { provide: InteraccionService, useValue: { comentarios: () => of(lista), comentar, borrarComentario } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ComentariosNoticia);
    fixture.componentRef.setInput('noticiaId', 3);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  async function escribir(fixture: { whenStable: () => Promise<unknown> }, raiz: HTMLElement, texto: string) {
    const campo = raiz.querySelector<HTMLTextAreaElement>('#nuevo-comentario') as HTMLTextAreaElement;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('lista los comentarios y deja borrar solo los propios', async () => {
    const { raiz } = await crear([comentario(1, YO), comentario(2, 8)]);
    expect(raiz.querySelectorAll('.comentario')).toHaveLength(2);
    expect(raiz.querySelector('.cantidad')?.textContent).toContain('(2)');
    expect(raiz.querySelectorAll('.borrar')).toHaveLength(1);
  });

  it('el administrador puede borrar cualquiera', async () => {
    vi.stubGlobal('confirm', () => true);
    const { fixture, raiz } = await crear([comentario(2, 8)], ROLES.administrador);
    raiz.querySelector<HTMLButtonElement>('.borrar')?.click();
    await fixture.whenStable();
    expect(borrarComentario).toHaveBeenCalledWith(3, 2);
    expect(raiz.querySelector('.vacio')?.textContent).toContain(TEXTOS_COMENTARIOS.vacio);
    vi.unstubAllGlobals();
  });

  it('si no confirma, no borra', async () => {
    vi.stubGlobal('confirm', () => false);
    const { raiz } = await crear([comentario(1, YO)]);
    raiz.querySelector<HTMLButtonElement>('.borrar')?.click();
    expect(borrarComentario).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('comenta y agrega el comentario a la lista', async () => {
    const { fixture, raiz } = await crear([]);
    await escribir(fixture, raiz, '  Qué buena noticia  ');
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(comentar).toHaveBeenCalledWith(3, 'Qué buena noticia');
    expect(raiz.querySelectorAll('.comentario')).toHaveLength(1);
  });

  it('un comentario vacío no se envía y muestra el error', async () => {
    const { fixture, raiz } = await crear([]);
    await escribir(fixture, raiz, '   ');
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(comentar).not.toHaveBeenCalled();
    expect(raiz.textContent).toContain(TEXTOS_COMENTARIOS.obligatorio);
  });

  it('muestra el error del servidor', async () => {
    const { fixture, raiz } = await crear([]);
    comentar.mockReturnValue(throwError(() => ({ estado: 400, mensaje: 'Muy largo' })));
    await escribir(fixture, raiz, 'hola');
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Muy largo');
  });
});

describe('ReportarNoticia', () => {
  let reportar: ReturnType<typeof vi.fn>;

  beforeEach(() => simularDialogoNativo());

  async function crear() {
    reportar = vi.fn(() => of({} as Reporte));
    await TestBed.configureTestingModule({
      imports: [ReportarNoticia],
      providers: [{ provide: InteraccionService, useValue: { reportar } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReportarNoticia);
    fixture.componentRef.setInput('noticiaId', 3);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  it('abre el diálogo con los cuatro motivos', async () => {
    const { raiz } = await crear();
    raiz.querySelector<HTMLButtonElement>('.boton-reportar')?.click();
    expect(raiz.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    const motivos = [...raiz.querySelectorAll('.opcion')].map((o) => o.textContent?.trim());
    expect(motivos).toEqual(Object.values(ETIQUETAS_MOTIVO));
  });

  it('sin motivo no envía', async () => {
    const { fixture, raiz } = await crear();
    fixture.componentInstance.enviar();
    await fixture.whenStable();
    expect(reportar).not.toHaveBeenCalled();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain(TEXTOS_REPORTE.eligeMotivo);
  });

  it('envía el motivo y la descripción y agradece', async () => {
    const { fixture, raiz } = await crear();
    fixture.componentInstance.abrir();
    raiz.querySelectorAll<HTMLInputElement>('input[type="radio"]')[0].dispatchEvent(new Event('change'));
    const texto = raiz.querySelector('textarea') as HTMLTextAreaElement;
    texto.value = ' No es cierto ';
    texto.dispatchEvent(new Event('input'));
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(reportar).toHaveBeenCalledWith(3, { motivo: 'NOTICIA_FALSA', descripcion: 'No es cierto' });
    expect(raiz.querySelector('.aviso')?.textContent).toContain(TEXTOS_REPORTE.gracias);
    expect(raiz.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('si ya la había reportado lo dice; otros errores quedan en el diálogo', async () => {
    const { fixture, raiz } = await crear();
    fixture.componentInstance.abrir();
    raiz.querySelectorAll<HTMLInputElement>('input[type="radio"]')[2].dispatchEvent(new Event('change'));
    reportar.mockReturnValueOnce(throwError(() => ({ estado: 500, mensaje: 'Sin servicio' })));
    fixture.componentInstance.enviar();
    await fixture.whenStable();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('Sin servicio');

    reportar.mockReturnValueOnce(throwError(() => ({ estado: 409, mensaje: 'Ya reportaste esta noticia' })));
    fixture.componentInstance.enviar();
    await fixture.whenStable();
    expect(raiz.querySelector('.aviso')?.textContent).toContain('Ya reportaste esta noticia');
  });
});

describe('InteraccionService', () => {
  it('usa las rutas de comentarios, calificación y reportes', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(InteraccionService);
    const http = TestBed.inject(HttpTestingController);
    const base = `${environment.apiUrl}/api/noticias/3`;

    const lista = firstValueFrom(servicio.comentarios(3));
    http.expectOne(`${base}/comentarios`).flush([]);
    expect(await lista).toEqual([]);

    servicio.comentar(3, 'hola').subscribe();
    expect(http.expectOne(`${base}/comentarios`).request.body).toEqual({ contenido: 'hola' });

    servicio.borrarComentario(3, 5).subscribe();
    expect(http.expectOne(`${base}/comentarios/5`).request.method).toBe('DELETE');

    servicio.calificar(3, 4).subscribe();
    const calificacion = http.expectOne(`${base}/calificacion`);
    expect(calificacion.request.method).toBe('PUT');
    expect(calificacion.request.body).toEqual({ valor: 4 });

    servicio.reportar(3, { motivo: 'SPAM' }).subscribe();
    expect(http.expectOne(`${base}/reportes`).request.body).toEqual({ motivo: 'SPAM' });
    http.verify();
  });
});
