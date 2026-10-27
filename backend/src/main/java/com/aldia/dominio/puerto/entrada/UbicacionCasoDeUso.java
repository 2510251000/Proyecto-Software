package com.aldia.dominio.puerto.entrada;

import java.math.BigDecimal;
import java.util.List;

import com.aldia.dominio.modelo.Ciudad;
import com.aldia.dominio.modelo.UbicacionEncontrada;

public interface UbicacionCasoDeUso {

    List<Ciudad> listarCiudades();

    /** Consulta la API externa por nombre de municipio. */
    List<UbicacionEncontrada> buscar(String texto);

    /** Consulta la API externa con las coordenadas y deja la ciudad en el catálogo. */
    Ciudad resolverCoordenadas(BigDecimal latitud, BigDecimal longitud);

    /** Consulta la API externa con el id de un resultado de búsqueda y deja la ciudad en el catálogo. */
    Ciudad resolverLugar(String idLugar);

    /** Proveedor activo: "google" o "nominatim". */
    String proveedor();
}
