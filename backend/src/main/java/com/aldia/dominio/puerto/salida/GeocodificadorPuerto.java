package com.aldia.dominio.puerto.salida;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.aldia.dominio.modelo.UbicacionEncontrada;

/**
 * API externa de geocodificación. Hay dos adaptadores: Google Maps (con clave) y
 * Nominatim de OpenStreetMap (sin clave). Cuál se usa lo decide la configuración.
 */
public interface GeocodificadorPuerto {

    /** Municipios cuyo nombre coincide con el texto. */
    List<UbicacionEncontrada> buscar(String texto);

    /** El municipio que contiene el punto (geocodificación inversa). */
    Optional<UbicacionEncontrada> enCoordenadas(BigDecimal latitud, BigDecimal longitud);

    /** Vuelve a consultar un lugar por su id, para no confiar en lo que mande el navegador. */
    Optional<UbicacionEncontrada> porIdLugar(String idLugar);

    /** "google" o "nominatim". */
    String proveedor();
}
