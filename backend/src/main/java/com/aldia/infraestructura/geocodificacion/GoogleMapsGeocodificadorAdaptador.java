package com.aldia.infraestructura.geocodificacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.aldia.dominio.excepcion.ServicioUbicacionNoDisponibleExcepcion;
import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Geocodificación con la Geocoding API de Google Maps. Necesita GOOGLE_MAPS_API_KEY,
 * que solo vive en el backend (nunca llega al navegador).
 *
 * Municipio: el componente "locality" (o "administrative_area_level_2" si no hay).
 * Departamento: "administrative_area_level_1". Del lugar solo se guarda su place_id
 * y sus coordenadas, como pide la política de Google.
 */
public class GoogleMapsGeocodificadorAdaptador implements GeocodificadorPuerto {

    private static final Logger LOG = LoggerFactory.getLogger(GoogleMapsGeocodificadorAdaptador.class);
    private static final int ESCALA_COORDENADAS = 8;
    private static final String ESTADO_OK = "OK";
    private static final String SIN_RESULTADOS = "ZERO_RESULTS";

    private final RestClient cliente;
    private final PropiedadesGeocodificacion propiedades;

    public GoogleMapsGeocodificadorAdaptador(RestClient cliente, PropiedadesGeocodificacion propiedades) {
        this.cliente = cliente;
        this.propiedades = propiedades;
    }

    @Override
    public List<UbicacionEncontrada> buscar(String texto) {
        UriComponentsBuilder uri = base().queryParam("address", texto);
        String pais = propiedades.primerPais();
        if (pais != null) {
            uri.queryParam("components", "country:" + pais.toUpperCase());
        }
        Map<String, UbicacionEncontrada> sinRepetir = new LinkedHashMap<>();
        for (JsonNode resultado : consultar(uri)) {
            aUbicacion(resultado, null, null)
                    .ifPresent(u -> sinRepetir.putIfAbsent(u.ciudad() + "|" + u.departamento(), u));
        }
        List<UbicacionEncontrada> lista = new ArrayList<>(sinRepetir.values());
        return lista.subList(0, Math.min(lista.size(), propiedades.maximoResultados()));
    }

    @Override
    public Optional<UbicacionEncontrada> enCoordenadas(BigDecimal latitud, BigDecimal longitud) {
        JsonNode resultados = consultar(base()
                .queryParam("latlng", latitud.toPlainString() + "," + longitud.toPlainString())
                .queryParam("result_type", "locality|administrative_area_level_2"));
        for (JsonNode resultado : resultados) {
            Optional<UbicacionEncontrada> ubicacion = aUbicacion(resultado, latitud, longitud);
            if (ubicacion.isPresent()) {
                return ubicacion;
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<UbicacionEncontrada> porIdLugar(String idLugar) {
        JsonNode resultados = consultar(base().queryParam("place_id", idLugar));
        return resultados.isEmpty() ? Optional.empty() : aUbicacion(resultados.get(0), null, null);
    }

    @Override
    public String proveedor() {
        return "google";
    }

    private UriComponentsBuilder base() {
        return UriComponentsBuilder.fromHttpUrl(propiedades.google().url())
                .queryParam("language", propiedades.idioma())
                .queryParam("key", propiedades.google().clave());
    }

    /** Devuelve el arreglo "results". Un estado distinto de OK o ZERO_RESULTS es un error del servicio. */
    private JsonNode consultar(UriComponentsBuilder uri) {
        try {
            JsonNode respuesta = cliente.get().uri(uri.encode().build().toUri()).retrieve().body(JsonNode.class);
            String estado = respuesta == null ? "SIN_RESPUESTA" : respuesta.path("status").asText();
            if (SIN_RESULTADOS.equals(estado)) {
                return respuesta.path("results");
            }
            if (!ESTADO_OK.equals(estado)) {
                // El mensaje de Google no incluye la clave; se registra para poder diagnosticar.
                LOG.warn("Google Maps respondió {}: {}", estado,
                        respuesta == null ? "" : respuesta.path("error_message").asText());
                throw new ServicioUbicacionNoDisponibleExcepcion(null);
            }
            return respuesta.path("results");
        } catch (RestClientException ex) {
            // Solo el tipo de error: el mensaje completo trae la URL, y la URL lleva la clave.
            LOG.warn("Google Maps no respondió ({})", ex.getClass().getSimpleName());
            throw new ServicioUbicacionNoDisponibleExcepcion(ex);
        }
    }

    private Optional<UbicacionEncontrada> aUbicacion(JsonNode resultado, BigDecimal latitud, BigDecimal longitud) {
        String ciudad = componente(resultado, "locality");
        if (ciudad == null) {
            ciudad = componente(resultado, "administrative_area_level_2");
        }
        String departamento = componente(resultado, "administrative_area_level_1");
        if (ciudad == null) {
            return Optional.empty();
        }
        JsonNode ubicacion = resultado.path("geometry").path("location");
        BigDecimal lat = latitud != null ? latitud : new BigDecimal(ubicacion.path("lat").asText("0"));
        BigDecimal lng = longitud != null ? longitud : new BigDecimal(ubicacion.path("lng").asText("0"));
        return Optional.of(new UbicacionEncontrada(
                resultado.path("place_id").asText(null),
                ciudad,
                departamento != null ? departamento : ciudad,
                resultado.path("formatted_address").asText(null),
                lat.setScale(ESCALA_COORDENADAS, RoundingMode.HALF_UP),
                lng.setScale(ESCALA_COORDENADAS, RoundingMode.HALF_UP),
                proveedor()));
    }

    private static String componente(JsonNode resultado, String tipo) {
        for (JsonNode componente : resultado.path("address_components")) {
            for (JsonNode tipoComponente : componente.path("types")) {
                if (tipo.equals(tipoComponente.asText())) {
                    return componente.path("long_name").asText(null);
                }
            }
        }
        return null;
    }
}
