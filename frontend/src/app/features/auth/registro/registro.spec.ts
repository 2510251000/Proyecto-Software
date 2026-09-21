import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  MENSAJES_ERROR_HTTP,
  MENSAJES_VALIDACION,
} from '../../../core/constants/mensajes.constants';
import { MOTIVOS_LOGIN, PARAMETROS_URL } from '../../../core/constants/navegacion.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { ROLES } from '../../../core/constants/roles.constants';
import { ErrorApi } from '../../../core/models/error-api.model';
import { RespuestaRegistro } from '../../../core/models/respuesta-registro.model';
import { AuthService } from '../../../core/services/auth.service';
import { Registro } from './registro';

describe('Registro', () => {
  let fixture: ComponentFixture<Registro>;
  let respuesta: Subject<RespuestaRegistro>;
  let registrar: ReturnType<typeof vi.fn>;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const buscar = <T extends Element>(selector: string) => raiz().querySelector<T>(selector);

  beforeEach(async () => {
    respuesta = new Subject<RespuestaRegistro>();
    registrar = vi.fn(() => respuesta);
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([]), { provide: AuthService, useValue: { registrar } }],
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Registro);
    await fixture.whenStable();
  });

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

  async function llenar(confirmacion = 'unaContrasena123'): Promise<void> {
    await escribir('registro-correo', 'nuevo@correo.com');
    await escribir('registro-contrasena', 'unaContrasena123');
    await escribir('registro-confirmacion', confirmacion);
  }

  it('muestra correo, contraseña, confirmación y el botón de crear cuenta', () => {
    expect(buscar('#registro-correo')).not.toBeNull();
    expect(buscar('#registro-contrasena')).not.toBeNull();
    expect(buscar('#registro-confirmacion')).not.toBeNull();
    expect(buscar('button[type="submit"]')?.textContent).toContain('Crear cuenta');
  });

  it('con campos vacíos muestra los errores y no llama al backend', async () => {
    await enviar();
    const texto = raiz().textContent ?? '';
    expect(texto).toContain(MENSAJES_VALIDACION.correoObligatorio);
    expect(texto).toContain(MENSAJES_VALIDACION.contrasenaObligatoria);
    expect(texto).toContain(MENSAJES_VALIDACION.confirmacionObligatoria);
    expect(registrar).not.toHaveBeenCalled();
  });

  it('exige el mínimo de caracteres en la contraseña', async () => {
    await escribir('registro-correo', 'nuevo@correo.com');
    await escribir('registro-contrasena', 'corta');
    await escribir('registro-confirmacion', 'corta');
    await enviar();
    expect(raiz().textContent).toContain(MENSAJES_VALIDACION.contrasenaCorta);
    expect(registrar).not.toHaveBeenCalled();
  });

  it('muestra "no coinciden" en el campo de confirmación, ligado con aria-describedby', async () => {
    await llenar('otraContrasena456');
    await enviar();
    const error = buscar<HTMLElement>('#registro-confirmacion-error');
    expect(error?.textContent).toContain(MENSAJES_VALIDACION.contrasenasDistintas);
    expect(buscar('#registro-confirmacion')?.getAttribute('aria-describedby')).toBe(
      'registro-confirmacion-error',
    );
    expect(buscar('#registro-contrasena-error')).toBeNull();
    expect(registrar).not.toHaveBeenCalled();
  });

  it('envía solo correo y contraseña, y bloquea el botón y el doble envío', async () => {
    await llenar();
    await enviar();
    await enviar();
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar).toHaveBeenCalledWith({
      correo: 'nuevo@correo.com',
      contrasena: 'unaContrasena123',
    });
    expect(buscar<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('si el registro sale bien redirige al login con el motivo de éxito', async () => {
    await llenar();
    await enviar();
    respuesta.next({ id: 3, correo: 'nuevo@correo.com', rol: ROLES.usuarioComun });
    await fixture.whenStable();
    expect(navegar).toHaveBeenCalledWith([RUTAS.login], {
      queryParams: { [PARAMETROS_URL.motivo]: MOTIVOS_LOGIN.registroExitoso },
    });
  });

  it('si falla muestra el error y vuelve a habilitar el botón', async () => {
    await llenar();
    await enviar();
    const error: ErrorApi = { estado: 403, mensaje: MENSAJES_ERROR_HTTP.generico };
    respuesta.error(error);
    await fixture.whenStable();
    expect(buscar('[role="alert"]')?.textContent).toContain(MENSAJES_ERROR_HTTP.generico);
    expect(buscar<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('enlaza al login', () => {
    expect(buscar<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(`/${RUTAS.login}`);
  });
});
