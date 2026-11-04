import { Injectable } from '@angular/core';
import { divIcon, LayerGroup, layerGroup, map, Map as MapaLeaflet, marker, tileLayer } from 'leaflet';
import { MAPA } from '../constants/mapa.constants';
import { Coordenadas } from '../models/ubicacion.model';

/** Un mapa ya dibujado, sin exponer Leaflet: así las pruebas usan uno falso. */
export interface MapaDibujado {
  /** Pone un marcador (oficial o de la comunidad) con una ventanita que muestra `contenido`. */
  agregarMarcador(punto: Coordenadas, oficial: boolean, contenido: HTMLElement, titulo: string): void;
  quitarMarcadores(): void;
  centrar(punto: Coordenadas, zoom: number): void;
  destruir(): void;
}

/** Crea mapas de Leaflet con las teselas de OpenStreetMap. */
@Injectable({ providedIn: 'root' })
export class MapaService {
  crear(elemento: HTMLElement, centro: Coordenadas, zoom: number): MapaDibujado {
    const mapa: MapaLeaflet = map(elemento).setView([centro.latitud, centro.longitud], zoom);
    tileLayer(MAPA.urlTeselas, { maxZoom: MAPA.zoomMaximo, attribution: MAPA.atribucion }).addTo(mapa);
    const marcadores: LayerGroup = layerGroup().addTo(mapa);

    return {
      agregarMarcador: (punto, oficial, contenido, titulo) => {
        // Marcador hecho con HTML y CSS (styles.css): azul con borde ámbar si es oficial, blanco con
        // borde azul si es de la comunidad. Sin imágenes de Leaflet.
        const icono = divIcon({
          className: `marcador-noticia ${oficial ? 'marcador-oficial' : 'marcador-comunidad'}`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -14],
        });
        marker([punto.latitud, punto.longitud], { icon: icono, title: titulo, alt: titulo, keyboard: true })
          .bindPopup(contenido)
          .addTo(marcadores);
      },
      quitarMarcadores: () => marcadores.clearLayers(),
      centrar: (punto, zoomNuevo) => mapa.setView([punto.latitud, punto.longitud], zoomNuevo),
      destruir: () => mapa.remove(),
    };
  }
}
