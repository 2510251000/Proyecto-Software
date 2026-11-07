import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ID_BUSQUEDA_NOTICIAS, TEXTOS_NAVEGACION } from '../../../core/constants/pantallas.constants';
import { Rol, ROLES } from '../../../core/constants/roles.constants';
import { RUTAS } from '../../../core/constants/rutas.constants';
import { Perfil } from '../../../core/models/perfil.model';
import { AuthService } from '../../../core/services/auth.service';
import { BarraMovil } from './barra-movil';

const PERFIL = { nombre: 'Laura Méndez', correo: 'laura@aldia.test' } as Perfil;

describe('BarraMovil', () => {
  async function crear(rol: Rol, perfil: Perfil | null = PERFIL): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [BarraMovil],
      providers: [provideRouter([]), { provide: AuthService, useValue: { obtenerContenidoToken: () => ({ rol }) } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(BarraMovil);
    fixture.componentRef.setInput('perfil', perfil);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('las iniciales llevan a Mi perfil', async () => {
    const barra = await crear(ROLES.usuarioComun);
    const perfil = barra.querySelector(`a[aria-label="${TEXTOS_NAVEGACION.perfil}"]`);
    expect(perfil?.getAttribute('href')).toBe(`/${RUTAS.perfil}`);
    expect(perfil?.textContent?.trim()).toBe('LM');
  });

  it('solo el administrador ve el acceso a administración', async () => {
    expect((await crear(ROLES.usuarioComun)).querySelector(`a[href="/${RUTAS.admin}"]`)).toBeNull();
    TestBed.resetTestingModule();
    expect((await crear(ROLES.administrador)).querySelector(`a[href="/${RUTAS.admin}"]`)).not.toBeNull();
  });

  it('la lupa lleva a la portada y pone el cursor en la búsqueda', async () => {
    const barra = await crear(ROLES.usuarioComun);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const campo = document.createElement('input');
    campo.id = ID_BUSQUEDA_NOTICIAS;
    document.body.append(campo);

    barra.querySelector<HTMLButtonElement>(`button[aria-label="${TEXTOS_NAVEGACION.buscar}"]`)?.click();
    // El foco se pone en un setTimeout que se programa después de navegar.
    await new Promise((listo) => setTimeout(listo, 20));

    expect(navegar).toHaveBeenCalledWith(['/', RUTAS.noticias]);
    expect(document.activeElement).toBe(campo);
    campo.remove();
  });
});
