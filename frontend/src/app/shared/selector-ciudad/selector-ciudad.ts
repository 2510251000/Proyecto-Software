import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { CODIGOS_HTTP } from '../../core/constants/http.constants';
import {
  LETRAS_MINIMAS_BUSQUEDA,
  MENSAJES_UBICACION,
  TEXTOS_UBICACION,
} from '../../core/constants/ubicacion.constants';
import { ErrorApi } from '../../core/models/error-api.model';
import { Ciudad, CiudadResuelta, LugarEncontrado } from '../../core/models/ubicacion.model';
import { GeolocalizacionService } from '../../core/services/geolocalizacion.service';
import { UbicacionService } from '../../core/services/ubicacion.service';

/** Errores sin código HTTP: los del GPS del navegador. */
const ESTADO_SIN_HTTP = 0;

/**
 * Elige el municipio con la API de mapas del backend: con el GPS del navegador
 * («Usar mi ubicación») o buscando por nombre. Si la API no responde, deja elegir entre
 * los municipios que ya están registrados para no bloquear al usuario.
 */
@Component({
  selector: 'app-selector-ciudad',
  templateUrl: './selector-ciudad.html',
  styleUrl: './selector-ciudad.css',
})
export class SelectorCiudad implements OnInit {
  private readonly ubicacion = inject(UbicacionService);
  private readonly gps = inject(GeolocalizacionService);

  /** Prefijo de los id del HTML, por si hay dos selectores en la misma página. */
  readonly idPrefijo = input('ciudad');
  /** Municipio con el que arranca (por ejemplo, el del perfil). */
  readonly inicial = input<Ciudad | null>(null);
  /** Muestra «Elige tu municipio» si se intentó enviar sin elegir. */
  readonly mostrarError = input(false);
  readonly elegida = output<Ciudad>();

  protected readonly textos = TEXTOS_UBICACION;
  protected readonly mensajes = MENSAJES_UBICACION;
  protected readonly actual = signal<Ciudad | null>(null);
  protected readonly proveedor = signal<string | null>(null);
  protected readonly texto = signal('');
  protected readonly resultados = signal<LugarEncontrado[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Municipios registrados, solo si la API de mapas falló. */
  protected readonly catalogo = signal<Ciudad[]>([]);

  ngOnInit(): void {
    this.actual.set(this.inicial());
  }

  protected escribir(evento: Event): void {
    if (evento.target instanceof HTMLInputElement) {
      this.texto.set(evento.target.value);
    }
  }

  protected usarMiUbicacion(): void {
    this.consultar(this.gps.posicionActual().pipe(switchMap((punto) => this.ubicacion.resolverCoordenadas(punto))));
  }

  protected buscar(evento?: Event): void {
    evento?.preventDefault();
    const texto = this.texto().trim();
    if (texto.length < LETRAS_MINIMAS_BUSQUEDA) {
      this.error.set(MENSAJES_UBICACION.busquedaCorta);
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.ubicacion.buscar(texto).subscribe({
      next: (lugares) => {
        this.resultados.set(lugares);
        this.error.set(lugares.length === 0 ? MENSAJES_UBICACION.sinResultados : null);
        this.cargando.set(false);
      },
      error: (error: ErrorApi) => this.fallo(error),
    });
  }

  protected elegirLugar(lugar: LugarEncontrado): void {
    this.consultar(this.ubicacion.resolverLugar(lugar.idLugar));
  }

  protected elegirDelCatalogo(evento: Event): void {
    if (evento.target instanceof HTMLSelectElement) {
      const id = Number(evento.target.value);
      const ciudad = this.catalogo().find((c) => c.id === id);
      if (ciudad !== undefined) {
        this.fijar(ciudad, null);
      }
    }
  }

  protected cambiar(): void {
    this.actual.set(null);
    this.resultados.set([]);
  }

  protected nombreProveedor(clave: string): string {
    return TEXTOS_UBICACION.proveedores[clave] ?? clave;
  }

  private consultar(peticion: Observable<CiudadResuelta>): void {
    this.cargando.set(true);
    this.error.set(null);
    peticion.subscribe({
      next: (ciudad) => {
        this.cargando.set(false);
        this.fijar(ciudad, ciudad.proveedor);
      },
      error: (error: ErrorApi) => this.fallo(error),
    });
  }

  private fijar(ciudad: Ciudad, proveedor: string | null): void {
    const { id, nombre, departamento, latitud, longitud } = ciudad;
    const elegida: Ciudad = { id, nombre, departamento, latitud, longitud };
    this.actual.set(elegida);
    this.proveedor.set(proveedor);
    this.resultados.set([]);
    this.error.set(null);
    this.elegida.emit(elegida);
  }

  private fallo(error: ErrorApi): void {
    this.cargando.set(false);
    this.error.set(error.mensaje);
    const sinGpsOSinApi = error.estado === ESTADO_SIN_HTTP || error.estado === CODIGOS_HTTP.noDisponible;
    if (sinGpsOSinApi && this.catalogo().length === 0) {
      this.ubicacion.ciudades().subscribe({ next: (ciudades) => this.catalogo.set(ciudades) });
    }
  }
}
