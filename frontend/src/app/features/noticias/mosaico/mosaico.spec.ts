import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TEXTOS_MOSAICO } from '../../../core/constants/dia-en-vivo.constants';
import { ETIQUETAS_PESTANA, TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia, PestanaPortada } from '../../../core/models/noticia.model';
import { Mosaico } from './mosaico';

const DIA = '2026-11-09';

function noticias(cantidad: number, desde = 1): Noticia[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: desde + i,
    titulo: `Noticia ${desde + i}`,
    resumen: '',
    contenido: '',
    fechaPublicacion: `${DIA}T10:00:00-05:00`,
    oficial: true,
    ciudad: 'Soacha',
  }));
}

/** Una pantalla de prueba que usa el mosaico y llena (o no) sus huecos. */
@Component({
  imports: [Mosaico],
  template: `
    <app-mosaico
      [delDia]="delDia()"
      [anteriores]="anteriores()"
      [hayMas]="hayMas()"
      [dia]="dia"
      [esHoy]="esHoy()"
      [conNoticiasDelDia]="conNoticiasDelDia()"
      [pestanaActiva]="pestana()"
      [aviso]="aviso()"
      (abrir)="abiertas.push($event)"
      (pestana)="pestana.set($event)"
      (verMas)="pedidos = pedidos + 1"
    >
      <!-- Cada hueco se llena con un solo elemento: así Angular sabe a cuál hueco va. -->
      @if (conHuecos()) {
        <section fichaMapa id="mapa">Mapa</section>
      }
      @if (conHuecos()) {
        <section fichaNivel id="nivel">Nivel</section>
      }
      @if (conHuecos()) {
        <section fichaAvisos id="avisos">Avisos</section>
      }
    </app-mosaico>
  `,
})
class PantallaDePrueba {
  readonly dia = DIA;
  readonly delDia = signal<Noticia[]>(noticias(4));
  readonly anteriores = signal<Noticia[]>([]);
  readonly hayMas = signal(false);
  readonly esHoy = signal(true);
  readonly conNoticiasDelDia = signal(true);
  readonly pestana = signal<PestanaPortada>('RECOMENDADAS');
  readonly aviso = signal<string | null>(null);
  readonly conHuecos = signal(true);
  readonly abiertas: Noticia[] = [];
  pedidos = 0;
}

describe('Mosaico', () => {
  let fixture: ComponentFixture<PantallaDePrueba>;
  const pantalla = () => fixture.componentInstance;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const fila = (clase: string) => raiz().querySelector(`.${clase}`) as HTMLElement;
  const variantes = (contenedor: HTMLElement) =>
    [...contenedor.querySelectorAll('app-ficha-noticia a')].map((a) => a.className.replace('ficha', '').trim());
  const pestanas = () => [...raiz().querySelectorAll<HTMLButtonElement>('.pestana')];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PantallaDePrueba], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(PantallaDePrueba);
    await fixture.whenStable();
  });

  describe('título', () => {
    const titulo = () => raiz().querySelector('h2.titulo')?.textContent?.trim();

    it('hoy dice «Lo demás de hoy»', () => {
      expect(titulo()).toBe(TEXTOS_MOSAICO.hoy);
    });

    it('en un día pasado nombra el día', async () => {
      pantalla().esHoy.set(false);
      await fixture.whenStable();
      expect(titulo()).toBe('Lo demás del lunes 9 de noviembre');
    });

    it('si el día no tiene más noticias dice «Lo más reciente»', async () => {
      pantalla().conNoticiasDelDia.set(false);
      await fixture.whenStable();
      expect(titulo()).toBe(TEXTOS_MOSAICO.reciente);
    });
  });

  describe('pestañas', () => {
    it('son cuatro, con nombre de grupo, y la activa lo anuncia con aria-current', () => {
      expect(raiz().querySelector('.pestanas')?.getAttribute('aria-label')).toBe(TEXTOS_BUSQUEDA.pestanas);
      expect(pestanas().map((p) => p.textContent?.trim())).toEqual(Object.values(ETIQUETAS_PESTANA));
      expect(pestanas().map((p) => p.getAttribute('aria-current'))).toEqual(['true', null, null, null]);
      expect(pestanas()[0].classList).toContain('activa');
    });

    it('al tocar una avisa cuál se eligió', async () => {
      pestanas()[2].click();
      await fixture.whenStable();
      expect(pantalla().pestana()).toBe('OFICIALES');
      expect(pestanas()[2].getAttribute('aria-current')).toBe('true');
      expect(pestanas()[0].getAttribute('aria-current')).toBeNull();
    });
  });

  describe('fichas', () => {
    it('fila 1: la primera noticia en grande, el mapa y el nivel', () => {
      expect(variantes(fila('fila-1'))).toEqual(['foto-grande']);
      expect(fila('fila-1').querySelector('.hueco-mapa #mapa')).not.toBeNull();
      expect(fila('fila-1').querySelector('.hueco-nivel #nivel')).not.toBeNull();
      expect(fila('fila-1').querySelector('h3')?.textContent).toContain('Noticia 1');
    });

    it('fila 2: una de color, dos con foto y los avisos', () => {
      expect(variantes(fila('fila-2'))).toEqual(['color', 'con-foto', 'con-foto']);
      expect(fila('fila-2').querySelector('.hueco #avisos')).not.toBeNull();
      expect([...fila('fila-2').querySelectorAll('h3')].map((h) => h.textContent?.trim())).toEqual([
        'Noticia 2',
        'Noticia 3',
        'Noticia 4',
      ]);
    });

    it('si quedan más noticias del día, van en otra fila de fichas con foto', async () => {
      expect(raiz().querySelector('.fila-mas')).toBeNull();
      pantalla().delDia.set(noticias(7));
      await fixture.whenStable();
      expect(variantes(fila('fila-mas'))).toEqual(['con-foto', 'con-foto', 'con-foto']);
      expect(fila('fila-mas').querySelector('h3')?.textContent).toContain('Noticia 5');
    });

    it('con pocas noticias llena lo que puede sin repetir', async () => {
      pantalla().delDia.set(noticias(2));
      await fixture.whenStable();
      expect(variantes(fila('fila-1'))).toEqual(['foto-grande']);
      expect(variantes(fila('fila-2'))).toEqual(['color']);

      pantalla().delDia.set([]);
      await fixture.whenStable();
      expect(raiz().querySelectorAll('.fila app-ficha-noticia')).toHaveLength(0);
      expect(raiz().querySelector('#mapa')).not.toBeNull();
    });

    it('al tocar una ficha avisa qué noticia abrir', () => {
      fila('fila-2').querySelector<HTMLAnchorElement>('a')?.click();
      expect(pantalla().abiertas.map((n) => n.id)).toEqual([2]);
    });

    it('un hueco sin nada adentro queda vacío', async () => {
      pantalla().conHuecos.set(false);
      await fixture.whenStable();
      const huecos = [...raiz().querySelectorAll('.hueco')];
      expect(huecos).toHaveLength(3);
      expect(huecos.every((hueco) => hueco.children.length === 0)).toBe(true);
    });
  });

  describe('días anteriores', () => {
    it('no sale si no hay noticias anteriores', () => {
      expect(raiz().querySelector('.anteriores')).toBeNull();
      expect(raiz().querySelector('.subtitulo')).toBeNull();
    });

    it('lista las anteriores en fichas horizontales bajo su título', async () => {
      pantalla().anteriores.set(noticias(3, 10));
      await fixture.whenStable();
      expect(raiz().querySelector('h2.subtitulo')?.textContent).toContain(TEXTOS_MOSAICO.anteriores);
      const lista = raiz().querySelector('ul.anteriores') as HTMLElement;
      expect(lista.querySelectorAll('li')).toHaveLength(3);
      expect(variantes(lista)).toEqual(['horizontal', 'horizontal', 'horizontal']);
      expect(raiz().querySelector('.ver-mas')).toBeNull();
    });

    it('«Ver más noticias» sale solo si quedan más, y avisa al tocarlo', async () => {
      pantalla().anteriores.set(noticias(3, 10));
      pantalla().hayMas.set(true);
      await fixture.whenStable();
      const boton = raiz().querySelector<HTMLButtonElement>('.ver-mas button');
      expect(boton?.textContent).toContain(TEXTOS_PORTADA.verMas);
      boton?.click();
      expect(pantalla().pedidos).toBe(1);
    });
  });

  it('si la pestaña y el municipio no dejan noticias, muestra el aviso y deja las pestañas', async () => {
    expect(raiz().querySelector('.aviso')).toBeNull();
    pantalla().delDia.set([]);
    pantalla().aviso.set(TEXTOS_PORTADA.sinFiltro);
    await fixture.whenStable();
    expect(raiz().querySelector('.aviso')?.textContent).toContain(TEXTOS_PORTADA.sinFiltro);
    expect(pestanas()).toHaveLength(4);
  });
});
