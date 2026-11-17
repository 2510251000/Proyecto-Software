import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { TEXTOS_ALERTA } from '../../../core/constants/alertas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { Alerta } from '../../../core/models/alerta.model';
import { ContenidoToken } from '../../../core/models/contenido-token.model';
import { AlertaService } from '../../../core/services/alerta.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertaNoticia } from './alerta-noticia';

const ALERTA: Alerta = {
  noticiaId: 50,
  tipo: 'ROBO',
  titulo: 'Robaron una moto roja',
  resumen: null,
  ciudad: 'Fusagasugá',
  ciudadId: 7,
  autorId: 1,
  fecha: '2026-11-17T09:00:00',
  activa: true,
  fechaResuelta: null,
};

function token(id: number, rol: ContenidoToken['rol'] = ROLES.usuarioComun): ContenidoToken {
  return { sub: 'x@correo.com', id, rol, iat: 0, exp: 0 };
}

describe('AlertaNoticia', () => {
  async function crear(
    sesion: ContenidoToken | null,
    deNoticia = vi.fn(() => of(ALERTA)),
    resolver = vi.fn(),
  ) {
    TestBed.configureTestingModule({
      imports: [AlertaNoticia],
      providers: [
        { provide: AlertaService, useValue: { deNoticia, resolver } },
        { provide: AuthService, useValue: { obtenerContenidoToken: () => sesion } },
      ],
    });
    const fixture = TestBed.createComponent(AlertaNoticia);
    fixture.componentRef.setInput('noticiaId', 50);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => vi.restoreAllMocks());

  it('en una noticia normal no muestra nada', async () => {
    const { raiz } = await crear(
      token(1),
      vi.fn(() => throwError(() => new Error('404'))),
    );
    expect(raiz.querySelector('.franja-alerta')).toBeNull();
  });

  it('a un vecino le muestra la alerta activa pero no el botón de resolver', async () => {
    const { raiz } = await crear(token(3));
    expect(raiz.querySelector('.estado')?.textContent).toContain(TEXTOS_ALERTA.activa);
    expect(raiz.querySelector('.estado')?.textContent).toContain('Robo');
    expect(raiz.querySelector('.resolver')).toBeNull();
  });

  it('el administrador también puede resolverla', async () => {
    const { raiz } = await crear(token(99, ROLES.administrador));
    expect(raiz.querySelector('.resolver')).not.toBeNull();
  });

  it('el autor la resuelve tras confirmar', async () => {
    const respuesta = new Subject<Alerta>();
    const resolver = vi.fn(() => respuesta);
    vi.spyOn(globalThis, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { fixture, raiz } = await crear(token(1), undefined, resolver);

    raiz.querySelector<HTMLButtonElement>('.resolver')?.click();
    expect(resolver).not.toHaveBeenCalled();

    raiz.querySelector<HTMLButtonElement>('.resolver')?.click();
    expect(resolver).toHaveBeenCalledWith(50);
    respuesta.next({ ...ALERTA, activa: false, fechaResuelta: '2026-11-17T11:00:00' });
    await fixture.whenStable();

    expect(raiz.querySelector('.estado')?.textContent).toContain(TEXTOS_ALERTA.resuelta);
    expect(raiz.querySelector('.resolver')).toBeNull();
  });

  it('si no se puede resolver muestra el error', async () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const resolver = vi.fn(() => throwError(() => ({ estado: 403, mensaje: 'No puedes' })));
    const { fixture, raiz } = await crear(token(1), undefined, resolver);

    raiz.querySelector<HTMLButtonElement>('.resolver')?.click();
    await fixture.whenStable();

    expect(raiz.querySelector('.error')?.textContent).toContain('No puedes');
  });
});
