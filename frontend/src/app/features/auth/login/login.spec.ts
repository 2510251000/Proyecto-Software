import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  MENSAJES_ERROR_HTTP,
  MENSAJES_EXITO,
  MENSAJES_SESION,
  MENSAJES_VALIDACION,
} from '../../../core/constants/mensajes.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { RespuestaAutenticacion } from '../../../core/models/respuesta-autenticacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let respuesta: Subject<RespuestaAutenticacion>;
  let iniciarSesion: ReturnType<typeof vi.fn>;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);

  async function crear(motivo: string | null = null): Promise<void> {
    respuesta = new Subject<RespuestaAutenticacion>();
    iniciarSesion = vi.fn(() => respuesta);
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { iniciarSesion } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(motivo ? { [PARAMETROS_URL.motivo]: motivo } : {}),
            },
          },
        },
      ],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  }

  async function escribir(id: string, valor: string): Promise<void> {
    const entrada = buscar<HTMLInputElement>(`#${id}`) as HTMLInputElement;
    entrada.value = valor;
    entrada.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function enviar(): Promise<void> {
    buscar<HTMLFormElement>('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function llenarValido(): Promise<void> {
    await escribir('login-correo', 'lector@correo.com');
    await escribir('login-contrasena', 'unaContrasena123');
  }

  it('muestra correo, contraseña y el botón de entrar', async () => {
    await crear();
    expect(buscar('#login-correo')).not.toBeNull();
    expect(buscar('#login-contrasena')).not.toBeNull();
    expect(buscar('button[type="submit"]')?.textContent).toContain('Entrar');
    expect(buscar('.aviso')).toBeNull();
  });

  it('con campos vacíos muestra los errores y no llama al backend', async () => {
    await crear();
    await enviar();
    const texto = raiz().textContent ?? '';
    expect(texto).toContain(MENSAJES_VALIDACION.correoObligatorio);
    expect(texto).toContain(MENSAJES_VALIDACION.contrasenaObligatoria);
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it('valida el formato del correo y el mínimo de la contraseña', async () => {
    await crear();
    await escribir('login-correo', 'no-es-correo');
    await escribir('login-contrasena', 'corta');
    await enviar();
    const texto = raiz().textContent ?? '';
    expect(texto).toContain(MENSAJES_VALIDACION.correoInvalido);
    expect(texto).toContain(MENSAJES_VALIDACION.contrasenaCorta);
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it('envía las credenciales, bloquea el botón mientras espera y no permite doble envío', async () => {
    await crear();
    await llenarValido();
    await enviar();
    await enviar();
    expect(iniciarSesion).toHaveBeenCalledTimes(1);
    expect(iniciarSesion).toHaveBeenCalledWith({
      correo: 'lector@correo.com',
      contrasena: 'unaContrasena123',
    });
    expect(buscar<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('con credenciales correctas redirige al listado de noticias', async () => {
    await crear();
    await llenarValido();
    await enviar();
    respuesta.next({ token: 'abc' });
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith([RUTAS.noticias]);
  });

  it('con credenciales incorrectas muestra el error y vuelve a habilitar el botón', async () => {
    await crear();
    await llenarValido();
    await enviar();
    const error: ErrorApi = { estado: 401, mensaje: MENSAJES_ERROR_HTTP.credencialesInvalidas };
    respuesta.error(error);
    await fixture.whenStable();
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_ERROR_HTTP.credencialesInvalidas);
    expect(buscar<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('avisa que la sesión expiró cuando llega el motivo en la URL', async () => {
    await crear(MOTIVOS_LOGIN.sesionExpirada);
    expect(buscar('.aviso')?.textContent).toContain(MENSAJES_SESION.expirada);
  });

  it('muestra el mensaje de éxito cuando llega tras registrarse', async () => {
    await crear(MOTIVOS_LOGIN.registroExitoso);
    expect(buscar('.aviso')?.textContent).toContain(MENSAJES_EXITO.registro);
  });

  it('ignora un motivo desconocido en la URL', async () => {
    await crear('constructor');
    expect(buscar('.aviso')).toBeNull();
  });

  it('enlaza al registro', async () => {
    await crear();
    expect(buscar<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(`/${RUTAS.registro}`);
  });
});
