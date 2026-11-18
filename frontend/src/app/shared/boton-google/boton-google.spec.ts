import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TEXTOS_AUTH } from '../../core/constants/mensajes.constants';
import { Perfil } from '../../core/models/perfil.model';
import { RespuestaAutenticacion } from '../../core/models/respuesta-autenticacion.model';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { BotonGoogle } from './boton-google';

describe('BotonGoogle', () => {
  let prepararGoogle: ReturnType<typeof vi.fn>;

  async function crear(
    disponible: boolean,
    entrar: () => Observable<RespuestaAutenticacion>,
    perfil: () => Observable<Partial<Perfil>> = () => of({ ciudad: null }),
    retomar: () => Observable<RespuestaAutenticacion | null> = () => of(null),
  ) {
    prepararGoogle = vi.fn();
    TestBed.configureTestingModule({
      imports: [BotonGoogle],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { googleDisponible: disponible, iniciarSesionConGoogle: entrar, prepararGoogle, retomarGoogle: retomar },
        },
        { provide: PerfilService, useValue: { obtener: perfil } },
      ],
    });
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(BotonGoogle);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const tocar = async () => {
      raiz.querySelector<HTMLButtonElement>('.boton')?.click();
      await fixture.whenStable();
    };
    return { raiz, navegar, tocar };
  }

  const token = () => of({ token: 'jwt' });

  it('sin Firebase en el ambiente no aparece ni descarga nada', async () => {
    const { raiz } = await crear(false, token);
    expect(raiz.querySelector('.boton')).toBeNull();
    expect(prepararGoogle).not.toHaveBeenCalled();
  });

  it('apenas aparece deja Firebase listo (Safari) y, si no viene de Google, queda esperando el toque', async () => {
    const { raiz, navegar } = await crear(true, token);
    expect(prepararGoogle).toHaveBeenCalledTimes(1);
    expect(navegar).not.toHaveBeenCalled();
    expect(raiz.querySelector<HTMLButtonElement>('.boton')?.disabled).toBe(false);
  });

  it('al volver de Google por redirección termina de entrar sin tocar nada', async () => {
    const { navegar } = await crear(true, token, () => of({ ciudad: null }), () => of({ token: 'jwt' }));
    expect(navegar).toHaveBeenCalledWith(['/', 'perfil']);
  });

  it('si la redirección de Google falla muestra el error', async () => {
    const { raiz } = await crear(true, token, undefined, () => throwError(() => new Error('sin red')));
    expect(raiz.querySelector('.error')?.textContent).toContain(TEXTOS_AUTH.errorGoogle);
  });

  it('quien entra por primera vez (sin municipio) va a su perfil', async () => {
    const { raiz, navegar, tocar } = await crear(true, token);
    expect(raiz.querySelector('.boton')?.textContent).toContain(TEXTOS_AUTH.continuarGoogle);
    await tocar();
    expect(navegar).toHaveBeenCalledWith(['/', 'perfil']);
  });

  it('quien ya tiene municipio va a la portada, y también si el perfil no llega', async () => {
    const conCiudad = await crear(true, token, () => of({ ciudad: { id: 1 } as Perfil['ciudad'] }));
    await conCiudad.tocar();
    expect(conCiudad.navegar).toHaveBeenCalledWith(['/', 'noticias']);

    TestBed.resetTestingModule();
    const sinPerfil = await crear(true, token, () => throwError(() => new Error('sin red')));
    await sinPerfil.tocar();
    expect(sinPerfil.navegar).toHaveBeenCalledWith(['/', 'noticias']);
  });

  it('si la persona cierra la ventana de Google no muestra error', async () => {
    const { raiz, navegar, tocar } = await crear(true, () =>
      throwError(() => ({ code: 'auth/popup-closed-by-user' })),
    );
    await tocar();
    expect(raiz.querySelector('.error')).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
    expect(raiz.querySelector<HTMLButtonElement>('.boton')?.disabled).toBe(false);
  });

  it('muestra el mensaje del servidor, salvo un 401 que se explica en lenguaje de Google', async () => {
    const desactivada = await crear(true, () =>
      throwError(() => ({ estado: 403, mensaje: 'Tu cuenta está desactivada' })),
    );
    await desactivada.tocar();
    expect(desactivada.raiz.querySelector('.error')?.textContent).toContain('Tu cuenta está desactivada');

    TestBed.resetTestingModule();
    const rechazado = await crear(true, () => throwError(() => ({ estado: 401, mensaje: 'x' })));
    await rechazado.tocar();
    expect(rechazado.raiz.querySelector('.error')?.textContent).toContain(TEXTOS_AUTH.errorGoogle);
  });

  it('un error desconocido muestra el mensaje general', async () => {
    const { raiz, tocar } = await crear(true, () => throwError(() => new Error('popup bloqueado')));
    await tocar();
    expect(raiz.querySelector('.error')?.textContent).toContain(TEXTOS_AUTH.errorGoogle);
  });
});
