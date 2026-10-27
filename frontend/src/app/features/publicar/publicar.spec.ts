import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TEXTOS_PUBLICAR } from '../../core/constants/pantallas.constants';
import { ROLES } from '../../core/constants/roles.constants';
import { Noticia } from '../../core/models/noticia.model';
import { CupoDiario, Perfil } from '../../core/models/perfil.model';
import { AuthService } from '../../core/services/auth.service';
import { NoticiaService } from '../../core/services/noticia.service';
import { PerfilService } from '../../core/services/perfil.service';
import { campanaFalsa } from '../../../testing/menu-falso';
import { AlmacenNoticias } from '../noticias/almacen-noticias';
import { Publicar } from './publicar';

function perfil(cupo: CupoDiario): Perfil {
  return {
    id: 1,
    correo: 'vecina@aldia.com',
    nombre: 'Laura',
    rol: ROLES.usuarioComun,
    nivel: 'Básico',
    nivelNumero: 1,
    puntaje: 10,
    siguienteNivel: null,
    ciudad: { id: 7, nombre: 'Fusagasugá', departamento: 'Cundinamarca', latitud: 4.3, longitud: -74.3 },
    cupo,
    fechaRegistro: '2026-10-01T10:00:00',
  };
}

describe('Publicar', () => {
  let publicar: ReturnType<typeof vi.fn>;
  let respuesta: Subject<Noticia>;
  let fixture: ComponentFixture<Publicar>;

  async function crear(cupo: CupoDiario): Promise<HTMLElement> {
    respuesta = new Subject<Noticia>();
    publicar = vi.fn(() => respuesta);
    await TestBed.configureTestingModule({
      imports: [Publicar],
      providers: [
        provideRouter([]),
        { provide: PerfilService, useValue: { obtener: () => of(perfil(cupo)) } },
        { provide: NoticiaService, useValue: { publicar } },
        { provide: AlmacenNoticias, useValue: { cargar: () => undefined } },
        { provide: AuthService, useValue: { obtenerContenidoToken: () => null, cerrarSesion: () => undefined } },
        campanaFalsa(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Publicar);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  async function escribir(raiz: HTMLElement, selector: string, valor: string): Promise<void> {
    const campo = raiz.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (campo === null) {
      throw new Error(`No está ${selector}`);
    }
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('muestra cuántas publicaciones le quedan hoy', async () => {
    const raiz = await crear({ limite: 3, publicadasHoy: 1, restantes: 2, ilimitado: false });
    expect(raiz.querySelector('.aviso-cupo')?.textContent).toContain('Te quedan 2 de 3 publicaciones hoy.');
  });

  it('sin cupo lo dice y no deja publicar', async () => {
    const raiz = await crear({ limite: 3, publicadasHoy: 3, restantes: 0, ilimitado: false });
    expect(raiz.querySelector('.aviso-cupo')?.textContent).toContain(TEXTOS_PUBLICAR.cupoAgotado);
    expect(raiz.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('publica en la ciudad del perfil y abre la noticia publicada', async () => {
    const raiz = await crear({ limite: 3, publicadasHoy: 0, restantes: 3, ilimitado: false });
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await escribir(raiz, '#publicar-titulo', 'Se cayó un árbol');
    await escribir(raiz, '#publicar-contenido', 'Bloquea la vía principal.');
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));

    expect(publicar).toHaveBeenCalledWith({
      titulo: 'Se cayó un árbol',
      resumen: '',
      contenido: 'Bloquea la vía principal.',
      ciudadId: 7,
      latitud: 4.3,
      longitud: -74.3,
    });
    respuesta.next({
      id: 40,
      titulo: 'Se cayó un árbol',
      resumen: '',
      contenido: 'Bloquea la vía principal.',
      fechaPublicacion: '2026-10-18T10:00:00',
      oficial: false,
      ciudad: 'Fusagasugá',
    });
    expect(navegar).toHaveBeenCalledWith(['/', 'noticias', 40]);
  });

  it('sin titular no publica', async () => {
    const raiz = await crear({ limite: 3, publicadasHoy: 0, restantes: 3, ilimitado: false });
    raiz.querySelector('form')?.dispatchEvent(new Event('submit'));
    expect(publicar).not.toHaveBeenCalled();
  });
});
