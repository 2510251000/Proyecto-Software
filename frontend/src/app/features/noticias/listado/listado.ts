import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HORAS_DEL_DIA, INTERVALO_RELOJ_MS, TOLERANCIA_HORA } from '../../../core/constants/dia-en-vivo.constants';
import { TEXTOS_BUSQUEDA } from '../../../core/constants/pantallas.constants';
import { NOTICIAS_POR_TANDA, TEXTOS_PORTADA } from '../../../core/constants/portada.constants';
import { Noticia, PestanaPortada } from '../../../core/models/noticia.model';
import { PerfilService } from '../../../core/services/perfil.service';
import {
  diaAnterior,
  diaDe,
  diaInicial,
  diaSiguiente,
  horaDecimal,
  horaEnArco,
  horaInicial,
  marcasDelDia,
  momentoDe,
  noticiaDeLaHora,
  noticiasDelDia,
  repartirMosaico,
  temaDe,
} from '../../../core/utils/dia-en-vivo';
import { Boton } from '../../../shared/boton/boton';
import { Marco } from '../../../shared/marco/marco';
import { AlmacenNoticias } from '../almacen-noticias';
import { AvisosCerca } from '../avisos-cerca/avisos-cerca';
import { EsqueletoPortada } from '../esqueleto-portada/esqueleto-portada';
import { HerramientasPortada } from '../herramientas-portada/herramientas-portada';
import { LineaSol } from '../linea-sol/linea-sol';
import { ModalNoticia } from '../modal-noticia/modal-noticia';
import { Mosaico } from '../mosaico/mosaico';
import { PortadaCine } from '../portada-cine/portada-cine';
import { RelojDia } from '../reloj-dia/reloj-dia';
import { TuNivel } from '../tu-nivel/tu-nivel';
import { aplicarPestana, ConteoCiudad, FILTRO_INICIAL, FiltroPortada, filtrarNoticias } from './filtro-portada';

/**
 * La portada «El día en vivo». Aquí se coordina todo: qué día y qué hora se están mirando, y
 * de ahí salen el momento, el tema, la noticia de la portada de cine, las marcas del arco y
 * las fichas del mosaico. Las piezas solo reciben datos y avisan lo que hace el usuario.
 */
@Component({
  selector: 'app-listado',
  imports: [
    AvisosCerca,
    Boton,
    EsqueletoPortada,
    HerramientasPortada,
    LineaSol,
    Marco,
    ModalNoticia,
    Mosaico,
    PortadaCine,
    RelojDia,
    TuNivel,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado implements OnInit {
  private readonly almacen = inject(AlmacenNoticias);

  // El listado vive en el almacén: la página de una noticia usa el mismo.
  protected readonly cargando = this.almacen.cargando;
  protected readonly error = this.almacen.error;
  protected readonly noticias = this.almacen.noticias;
  /** Perfil de la sesión para «Tu nivel»; null si no carga. */
  protected readonly perfil = toSignal(
    inject(PerfilService)
      .obtener()
      .pipe(catchError(() => of(null))),
    { initialValue: null },
  );
  /** Noticia que se está viendo en la vista rápida; null si está cerrada. */
  protected readonly noticiaAbierta = signal<Noticia | null>(null);
  protected readonly textosPortada = TEXTOS_PORTADA;
  protected readonly textosBusqueda = TEXTOS_BUSQUEDA;

  /** Palabra buscada (la búsqueda la hace el backend) y pestaña elegida en el mosaico. */
  protected readonly textoBuscado = signal('');
  protected readonly pestana = signal<PestanaPortada>('RECOMENDADAS');

  // Todo lo que muestra la portada sale de la misma lista, sin peticiones nuevas.
  protected readonly filtro = signal<FiltroPortada>(FILTRO_INICIAL);
  protected readonly ciudadActiva = computed(() => {
    const filtro = this.filtro();
    return filtro.tipo === 'ciudad' ? filtro.ciudad : null;
  });
  /** Las noticias del municipio elegido (o todas). De aquí salen la portada de cine, el arco y el mosaico. */
  private readonly delMunicipio = computed(() => filtrarNoticias(this.noticias(), this.filtro()));

  // El día en vivo: qué día y qué hora se están mirando, y la noticia que les toca.
  private readonly ahora = signal(Date.now());
  private readonly hoy = computed(() => diaDe(this.ahora()) ?? '');
  private readonly horaActual = computed(() => horaDecimal(this.ahora()) ?? 0);
  /** El día que eligió el usuario con «Día anterior» o «Día siguiente»; null si no ha cambiado de día. */
  private readonly diaElegido = signal<string | null>(null);
  protected readonly dia = computed(() => this.diaElegido() ?? diaInicial(this.delMunicipio(), this.hoy()));
  protected readonly esHoy = computed(() => this.dia() === this.hoy());
  protected readonly diaPrevio = computed(() => diaAnterior(this.delMunicipio(), this.dia()));
  protected readonly diaPosterior = computed(() => diaSiguiente(this.delMunicipio(), this.dia(), this.hoy()));
  /** La hora que eligió el usuario al arrastrar el sol o tocar una marca; null si no se ha movido. */
  private readonly horaElegida = signal<number | null>(null);
  protected readonly hora = computed(
    () => this.horaElegida() ?? horaInicial(this.delMunicipio(), this.dia(), this.hoy(), this.horaActual()),
  );
  /** Lo que se ve es el momento actual: hoy y sin haber movido el sol. */
  protected readonly enVivo = computed(() => this.horaElegida() === null && this.esHoy());
  /** «De viaje»: el usuario se fue a otra hora o a otro día y puede volver con «Volver a ahora». */
  protected readonly deViaje = computed(
    () => !this.enVivo() && (this.horaElegida() !== null || this.diaElegido() !== null),
  );
  /** La luz de la hora que se ve: tiñe la foto y, desde las 5:30 p. m., pone el tema de noche. */
  protected readonly momento = computed(() => momentoDe(this.hora()));
  protected readonly tema = computed(() => temaDe(this.momento()));
  protected readonly marcas = computed(() => marcasDelDia(this.delMunicipio(), this.dia()));
  protected readonly diaSinNoticias = computed(() => noticiasDelDia(this.delMunicipio(), this.dia()).length === 0);
  /** Hasta dónde llega el deslizador: la hora actual hoy; la puesta del sol en un día pasado. */
  protected readonly horaMaxima = computed(() => (this.esHoy() ? horaEnArco(this.horaActual()) : HORAS_DEL_DIA.ocaso));
  /** La noticia de la portada de cine. Las pestañas no la cambian: solo ordenan el mosaico. */
  protected readonly noticiaPortada = computed(() =>
    this.cargando() || this.error() ? null : noticiaDeLaHora(this.delMunicipio(), this.dia(), this.hora()),
  );

  // El mosaico: lo de la pestaña elegida, sin la noticia que ya está en la portada de cine.
  private readonly deLaPestana = computed(() => aplicarPestana(this.delMunicipio(), this.pestana()));
  /** true si el municipio y la pestaña elegidos no dejan ninguna noticia. */
  protected readonly sinNoticiasDelFiltro = computed(() => this.deLaPestana().length === 0);
  private readonly reparto = computed(() => {
    const enPortada = this.noticiaPortada();
    return repartirMosaico(
      this.deLaPestana().filter((noticia) => noticia.id !== enPortada?.id),
      this.dia(),
    );
  });
  protected readonly delDia = computed(() => this.reparto().delDia);
  protected readonly conNoticiasDelDia = computed(() => this.reparto().conNoticiasDelDia);
  /** «Días anteriores» se muestra por tandas, con «Ver más noticias». */
  protected readonly visibles = signal(NOTICIAS_POR_TANDA);
  protected readonly anteriores = computed(() => this.reparto().anteriores.slice(0, this.visibles()));
  protected readonly hayMas = computed(() => this.reparto().anteriores.length > this.visibles());

  /** Municipios en orden alfabético, con cuántas noticias tiene cada uno. */
  protected readonly conteo = computed<ConteoCiudad[]>(() => {
    const cantidades = new Map<string, number>();
    for (const noticia of this.noticias()) {
      cantidades.set(noticia.ciudad, (cantidades.get(noticia.ciudad) ?? 0) + 1);
    }
    return [...cantidades]
      .map(([ciudad, cantidad]) => ({ ciudad, cantidad }))
      .sort((a, b) => a.ciudad.localeCompare(b.ciudad));
  });

  constructor() {
    // Reloj en vivo: la hora real avanza sola y el sol, el momento, el tema y la noticia la siguen.
    const reloj = setInterval(() => this.ahora.set(Date.now()), INTERVALO_RELOJ_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(reloj));
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.almacen.cargar(this.textoBuscado() || undefined);
  }

  protected buscar(texto: string): void {
    this.textoBuscado.set(texto);
    this.visibles.set(NOTICIAS_POR_TANDA);
    this.volverAAhora();
    this.cargar();
  }

  /** Arrastrar el sol hasta el final de hoy es lo mismo que volver a ahora. */
  protected elegirHora(hora: number): void {
    const esAhora = this.esHoy() && hora >= this.horaMaxima() - TOLERANCIA_HORA;
    this.horaElegida.set(esAhora ? null : hora);
  }

  protected volverAAhora(): void {
    this.horaElegida.set(null);
    this.diaElegido.set(null);
  }

  /** Pasa a otro día: se abre en la hora que le toca (ahora si es hoy; su última noticia si no). */
  protected irAlDia(dia: string | null): void {
    if (dia !== null) {
      this.diaElegido.set(dia);
      this.horaElegida.set(null);
      this.visibles.set(NOTICIAS_POR_TANDA);
    }
  }

  protected elegirPestana(pestana: PestanaPortada): void {
    this.pestana.set(pestana);
    this.visibles.set(NOTICIAS_POR_TANDA);
  }

  protected abrirNoticia(noticia: Noticia): void {
    this.noticiaAbierta.set(noticia);
  }

  protected elegirCiudad(ciudad: string | null): void {
    this.filtro.set(ciudad === null ? FILTRO_INICIAL : { tipo: 'ciudad', ciudad });
    this.visibles.set(NOTICIAS_POR_TANDA);
    this.volverAAhora();
  }

  protected verMas(): void {
    this.visibles.update((cantidad) => cantidad + NOTICIAS_POR_TANDA);
  }
}
