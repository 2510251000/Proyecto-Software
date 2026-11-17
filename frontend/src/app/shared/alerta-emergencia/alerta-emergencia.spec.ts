import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TEXTOS_ALERTA } from '../../core/constants/alertas.constants';
import { AlertaPendiente } from '../../core/models/alerta.model';
import { Noticia } from '../../core/models/noticia.model';
import { NoticiaService } from '../../core/services/noticia.service';
import { Sirena } from '../../core/services/sirena';
import { VigiaAlertas } from '../../core/services/vigia-alertas';
import { alertasFalsas } from '../../../testing/menu-falso';
import { AlertaEmergencia } from './alerta-emergencia';

const PENDIENTE: AlertaPendiente = {
  notificacionId: 900,
  alerta: {
    noticiaId: 50,
    tipo: 'DESAPARICION',
    titulo: 'Se busca a Ana, 8 años',
    resumen: 'Vista por última vez en el parque',
    ciudad: 'Fusagasugá',
    ciudadId: 7,
    autorId: 1,
    fecha: new Date().toISOString(),
    activa: true,
    fechaResuelta: null,
  },
};

const NOTICIA: Noticia = {
  id: 50,
  titulo: PENDIENTE.alerta.titulo,
  resumen: '',
  contenido: 'Chaqueta roja.',
  fechaPublicacion: PENDIENTE.alerta.fecha,
  oficial: false,
  ciudad: 'Fusagasugá',
  imagenes: [{ url: '/api/noticias/50/imagenes/1', orden: 1, textoAlternativo: null }],
};

describe('AlertaEmergencia', () => {
  let sirena: {
    sonar: ReturnType<typeof vi.fn>;
    detener: ReturnType<typeof vi.fn>;
    avisarAlSistema: ReturnType<typeof vi.fn>;
    permisoSistema: () => NotificationPermission | null;
    pedirPermisoSistema: ReturnType<typeof vi.fn>;
  };

  async function crear(pendientes: AlertaPendiente[], obtener = vi.fn(() => of(NOTICIA))) {
    sirena = {
      sonar: vi.fn(),
      detener: vi.fn(),
      avisarAlSistema: vi.fn(),
      permisoSistema: () => 'default',
      pedirPermisoSistema: vi.fn(() => Promise.resolve('granted')),
    };
    TestBed.configureTestingModule({
      imports: [AlertaEmergencia],
      providers: [
        provideRouter([]),
        alertasFalsas(pendientes),
        { provide: Sirena, useValue: sirena },
        { provide: NoticiaService, useValue: { obtener } },
      ],
    });
    const fixture = TestBed.createComponent(AlertaEmergencia);
    await fixture.whenStable();
    return { fixture, raiz: fixture.nativeElement as HTMLElement };
  }

  const botones = (raiz: HTMLElement) => [...raiz.querySelectorAll<HTMLButtonElement>('button')];

  it('sin alertas no muestra nada ni suena', async () => {
    const { raiz } = await crear([]);
    expect(raiz.querySelector('[role="alertdialog"]')).toBeNull();
    expect(sirena.sonar).not.toHaveBeenCalled();
  });

  it('muestra la alerta a pantalla completa con su foto, suena y avisa al sistema', async () => {
    const { raiz } = await crear([PENDIENTE]);
    const dialogo = raiz.querySelector('[role="alertdialog"]');

    expect(dialogo?.textContent).toContain('Desaparición');
    expect(dialogo?.textContent).toContain('Se busca a Ana, 8 años');
    expect(dialogo?.textContent).toContain('Fusagasugá');
    expect(raiz.querySelector<HTMLImageElement>('.foto')?.src).toContain(
      '/api/noticias/50/imagenes/1',
    );
    expect(sirena.sonar).toHaveBeenCalledTimes(1);
    expect(sirena.avisarAlSistema).toHaveBeenCalledWith(
      expect.objectContaining({ cuerpo: 'Se busca a Ana, 8 años', etiqueta: 'alerta-50' }),
    );
    expect(document.activeElement?.textContent?.trim()).toBe(TEXTOS_ALERTA.entendido);
  });

  it('«Entendido» la cierra y calla la sirena', async () => {
    const { fixture, raiz } = await crear([PENDIENTE]);
    botones(raiz)
      .find((b) => b.textContent?.trim() === TEXTOS_ALERTA.entendido)
      ?.click();
    await fixture.whenStable();

    expect(sirena.detener).toHaveBeenCalled();
    expect(TestBed.inject(VigiaAlertas).actual()).toBeNull();
    expect(raiz.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('«Ver la alerta» la cierra y abre la noticia', async () => {
    const { fixture, raiz } = await crear(
      [PENDIENTE],
      vi.fn(() => throwError(() => new Error('sin red'))),
    );
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    expect(raiz.querySelector('.foto')).toBeNull();

    botones(raiz)
      .find((b) => b.textContent?.trim() === TEXTOS_ALERTA.verDetalles)
      ?.click();
    await fixture.whenStable();

    expect(navegar).toHaveBeenCalledWith(['/', 'noticias', 50]);
  });

  it('ofrece activar los avisos del sistema y deja de ofrecerlo', async () => {
    const { fixture, raiz } = await crear([PENDIENTE]);
    const permiso = raiz.querySelector<HTMLButtonElement>('.permiso');
    permiso?.click();
    await Promise.resolve();
    await fixture.whenStable();

    expect(sirena.pedirPermisoSistema).toHaveBeenCalled();
    expect(raiz.querySelector('.permiso')).toBeNull();
  });
});
