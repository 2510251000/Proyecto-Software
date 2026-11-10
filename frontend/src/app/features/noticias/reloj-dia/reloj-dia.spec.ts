import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEXTOS_RELOJ, textoDiaSinNoticias } from '../../../core/constants/dia-en-vivo.constants';
import { RelojDia } from './reloj-dia';

describe('RelojDia', () => {
  let fixture: ComponentFixture<RelojDia>;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = (selector: string) => raiz().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  async function mostrar(entradas: Record<string, unknown> = {}): Promise<void> {
    const todas = { hora: 17 + 40 / 60, dia: '2026-11-09', ...entradas };
    for (const [nombre, valor] of Object.entries(todas)) {
      fixture.componentRef.setInput(nombre, valor);
    }
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RelojDia] }).compileComponents();
    fixture = TestBed.createComponent(RelojDia);
  });

  it('muestra la hora en grande con «a. m.» o «p. m.» aparte', async () => {
    await mostrar();
    expect(texto('.hora')).toBe('5:40p. m.');
    expect(texto('.sufijo')).toBe('p. m.');

    await mostrar({ hora: 6.5 });
    expect(texto('.hora')).toBe('6:30a. m.');
  });

  it('una hora de dos dígitos va en letra más pequeña para que quepa', async () => {
    await mostrar();
    expect(raiz().querySelector('.hora')?.classList).not.toContain('larga');

    await mostrar({ hora: 10.65 });
    expect(texto('.hora')).toBe('10:39a. m.');
    expect(raiz().querySelector('.hora')?.classList).toContain('larga');
  });

  it('en vivo dice «Ahora» y no ofrece volver', async () => {
    await mostrar();
    expect(texto('.etiqueta')).toBe(TEXTOS_RELOJ.ahora);
    expect(raiz().querySelector('.volver')).toBeNull();
  });

  it('de viaje dice «Estás viendo las» y ofrece «Volver a ahora»', async () => {
    await mostrar({ enVivo: false, deViaje: true });
    expect(texto('.etiqueta')).toBe(TEXTOS_RELOJ.viendo);

    let veces = 0;
    fixture.componentInstance.volver.subscribe(() => veces++);
    const volver = raiz().querySelector<HTMLButtonElement>('.volver');
    expect(volver?.textContent).toContain(TEXTOS_RELOJ.volver);
    volver?.click();
    expect(veces).toBe(1);
  });

  it('en un día pasado sin haberse movido dice «Estás viendo las», sin botón para volver', async () => {
    await mostrar({ enVivo: false, deViaje: false });
    expect(texto('.etiqueta')).toBe(TEXTOS_RELOJ.viendo);
    expect(raiz().querySelector('.volver')).toBeNull();
  });

  it('escribe la fecha del día mostrado y el municipio activo', async () => {
    await mostrar({ municipio: 'Fusagasugá' });
    expect(texto('.fecha')).toBe('Lunes 9 de noviembre · Fusagasugá');
  });

  it('con todos los municipios escribe solo la fecha', async () => {
    await mostrar();
    expect(texto('.fecha')).toBe('Lunes 9 de noviembre');
  });

  it('explica cómo volver atrás en el día', async () => {
    await mostrar();
    expect(texto('.ayuda')).toBe(TEXTOS_RELOJ.ayuda);
  });

  it('si el día no tiene noticias, lo dice con el municipio', async () => {
    await mostrar({ sinNoticias: true, municipio: 'Soacha' });
    expect(texto('.ayuda')).toBe(textoDiaSinNoticias('Soacha'));
    expect(textoDiaSinNoticias('Soacha')).toContain('Soacha');

    await mostrar({ sinNoticias: true, municipio: null });
    expect(texto('.ayuda')).toBe(textoDiaSinNoticias(null));
  });

  describe('cambio de día', () => {
    const botones = () => [...raiz().querySelectorAll<HTMLButtonElement>('.cambiar-dia')];

    it('tiene «Día anterior» y «Día siguiente» a los lados de la fecha', async () => {
      await mostrar({ hayAnterior: true, haySiguiente: true });
      expect(botones().map((b) => b.getAttribute('aria-label'))).toEqual([
        TEXTOS_RELOJ.diaAnterior,
        TEXTOS_RELOJ.diaSiguiente,
      ]);
      expect(botones().map((b) => b.disabled)).toEqual([false, false]);
    });

    it('avisa a cuál día ir', async () => {
      await mostrar({ hayAnterior: true, haySiguiente: true });
      const pedidos: string[] = [];
      fixture.componentInstance.anterior.subscribe(() => pedidos.push('anterior'));
      fixture.componentInstance.siguiente.subscribe(() => pedidos.push('siguiente'));
      botones()[0].click();
      botones()[1].click();
      expect(pedidos).toEqual(['anterior', 'siguiente']);
    });

    it('en hoy se desactiva «Día siguiente»; sin noticias más viejas, «Día anterior»', async () => {
      await mostrar({ hayAnterior: true, haySiguiente: false });
      expect(botones().map((b) => b.disabled)).toEqual([false, true]);

      await mostrar({ hayAnterior: false, haySiguiente: true });
      expect(botones().map((b) => b.disabled)).toEqual([true, false]);
    });
  });

  it('es una región con nombre y sus íconos son decorativos', async () => {
    await mostrar({ deViaje: true });
    expect(raiz().querySelector('aside')?.getAttribute('aria-label')).toBe(TEXTOS_RELOJ.etiqueta);
    const iconos = [...raiz().querySelectorAll('svg')];
    expect(iconos).toHaveLength(4);
    expect(iconos.every((icono) => icono.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
