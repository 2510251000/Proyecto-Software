package com.aldia.infraestructura.geocodificacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.aldia.dominio.excepcion.ServicioUbicacionNoDisponibleExcepcion;
import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Geocodificación con Nominatim (OpenStreetMap): gratuita y sin clave.
 *
 * Respeta su política de uso (https://operations.osmfoundation.org/policies/nominatim/):
 * se identifica con un User-Agent propio, no hace más de una petición por segundo
 * (todas pasan por {@link #consultar}, que espera lo necesario) y guarda en memoria las
 * respuestas para no repetir la misma consulta. Nada se pide mientras el usuario escribe:
 * solo cuando presiona «Buscar» o «Usar mi ubicación».
 */
public class NominatimGeocodificadorAdaptador implements GeocodificadorPuerto {

    private static final Logger LOG = LoggerFactory.getLogger(NominatimGeocodificadorAdaptador.class);
    private static final String PREFIJO_ID = "osm:";
    private static final int ESCALA_COORDENADAS = 8;
    private static final int MAXIMO_EN_CACHE = 500;
    /** En Colombia los municipios tienen place_rank 12; el 8 es Bogotá D. C. y el 16 una ciudad pequeña. */
    private static final int RANGO_MINIMO_MUNICIPIO = 8;
    private static final int RANGO_MAXIMO_MUNICIPIO = 16;
    /** Zoom 8 de la geocodificación inversa: nivel de municipio. */
    private static final int ZOOM_MUNICIPIO = 8;
    private static final Set<String> TIPOS_DE_LUGAR = Set.of("city", "town", "village", "municipality");

    private final RestClient cliente;
    private final PropiedadesGeocodificacion propiedades;
    private final Map<URI, JsonNode> cache = Collections.synchronizedMap(new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<URI, JsonNode> masVieja) {
            return size() > MAXIMO_EN_CACHE;
        }
    });
    private long ultimaPeticionMs;

    public NominatimGeocodificadorAdaptador(RestClient cliente, PropiedadesGeocodificacion propiedades) {
        this.cliente = cliente;
        this.propiedades = propiedades;
    }

    @Override
    public List<UbicacionEncontrada> buscar(String texto) {
        UriComponentsBuilder uri = base("/search")
                .queryParam("q", texto)
                .queryParam("limit", propiedades.maximoResultados() * 2);
        if (propiedades.paises() != null && !propiedades.paises().isBlank()) {
            uri.queryParam("countrycodes", propiedades.paises());
        }
        JsonNode respuesta = consultar(uri);

        Map<String, UbicacionEncontrada> sinRepetir = new LinkedHashMap<>();
        for (JsonNode lugar : respuesta) {
            if (esMunicipio(lugar)) {
                aUbicacion(lugar).ifPresent(u -> sinRepetir.putIfAbsent(u.ciudad() + "|" + u.departamento(), u));
            }
        }
        return new ArrayList<>(sinRepetir.values()).subList(0, Math.min(sinRepetir.size(), propiedades.maximoResultados()));
    }

    @Override
    public Optional<UbicacionEncontrada> enCoordenadas(BigDecimal latitud, BigDecimal longitud) {
        JsonNode respuesta = consultar(base("/reverse")
                .queryParam("lat", latitud.toPlainString())
                .queryParam("lon", longitud.toPlainString())
                .queryParam("zoom", ZOOM_MUNICIPIO));
        if (respuesta.has("error")) {
            return Optional.empty();
        }
        // Se conserva el punto exacto que mandó el usuario, no el centro del municipio.
        return aUbicacion(respuesta).map(u -> new UbicacionEncontrada(u.idLugar(), u.ciudad(), u.departamento(),
                u.descripcion(), escalar(latitud), escalar(longitud), u.proveedor()));
    }

    @Override
    public Optional<UbicacionEncontrada> porIdLugar(String idLugar) {
        if (idLugar == null || !idLugar.startsWith(PREFIJO_ID)) {
            return Optional.empty();
        }
        JsonNode respuesta = consultar(base("/lookup").queryParam("osm_ids", idLugar.substring(PREFIJO_ID.length())));
        return respuesta.isArray() && !respuesta.isEmpty() ? aUbicacion(respuesta.get(0)) : Optional.empty();
    }

    @Override
    public String proveedor() {
        return "nominatim";
    }

    private UriComponentsBuilder base(String ruta) {
        UriComponentsBuilder uri = UriComponentsBuilder.fromHttpUrl(propiedades.nominatim().url() + ruta)
                .queryParam("format", "jsonv2")
                .queryParam("addressdetails", 1)
                .queryParam("accept-language", propiedades.idioma());
        String correo = propiedades.nominatim().correoContacto();
        if (correo != null && !correo.isBlank()) {
            uri.queryParam("email", correo);
        }
        return uri;
    }

    /** Hace la petición respetando el intervalo mínimo entre peticiones, o responde desde la caché. */
    private JsonNode consultar(UriComponentsBuilder constructor) {
        URI uri = constructor.encode().build().toUri();
        JsonNode guardada = cache.get(uri);
        if (guardada != null) {
            return guardada;
        }
        synchronized (this) {
            esperarTurno();
            try {
                JsonNode respuesta = cliente.get()
                        .uri(uri)
                        .header(HttpHeaders.USER_AGENT, propiedades.nominatim().agente())
                        .retrieve()
                        .body(JsonNode.class);
                ultimaPeticionMs = System.currentTimeMillis();
                if (respuesta == null) {
                    throw new ServicioUbicacionNoDisponibleExcepcion(null);
                }
                cache.put(uri, respuesta);
                return respuesta;
            } catch (RestClientException ex) {
                ultimaPeticionMs = System.currentTimeMillis();
                LOG.warn("Nominatim no respondió: {}", ex.getMessage());
                throw new ServicioUbicacionNoDisponibleExcepcion(ex);
            }
        }
    }

    private void esperarTurno() {
        long espera = ultimaPeticionMs + propiedades.nominatim().intervaloMinimoMs() - System.currentTimeMillis();
        if (espera > 0) {
            try {
                Thread.sleep(espera);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new ServicioUbicacionNoDisponibleExcepcion(ex);
            }
        }
    }

    private static boolean esMunicipio(JsonNode lugar) {
        int rango = lugar.path("place_rank").asInt(0);
        boolean limiteAdministrativo = "boundary".equals(lugar.path("category").asText())
                && rango >= RANGO_MINIMO_MUNICIPIO && rango <= RANGO_MAXIMO_MUNICIPIO;
        boolean lugarPoblado = "place".equals(lugar.path("category").asText())
                && TIPOS_DE_LUGAR.contains(lugar.path("type").asText());
        return limiteAdministrativo || lugarPoblado;
    }

    /**
     * El municipio es el propio lugar (name); el departamento sale de address.state.
     * En Bogotá D. C. el "departamento" es el mismo distrito.
     */
    private Optional<UbicacionEncontrada> aUbicacion(JsonNode lugar) {
        String nombre = texto(lugar, "name");
        JsonNode direccion = lugar.path("address");
        String ciudad = nombre != null ? nombre : primero(direccion, "city", "town", "municipality", "village");
        String departamento = primero(direccion, "state", "region");
        if (departamento == null) {
            departamento = ciudad;
        }
        if (ciudad == null || !lugar.has("osm_type") || !lugar.has("lat")) {
            return Optional.empty();
        }
        String idLugar = PREFIJO_ID + Character.toUpperCase(lugar.path("osm_type").asText().charAt(0))
                + lugar.path("osm_id").asText();
        return Optional.of(new UbicacionEncontrada(idLugar, ciudad, departamento, texto(lugar, "display_name"),
                escalar(new BigDecimal(lugar.path("lat").asText())),
                escalar(new BigDecimal(lugar.path("lon").asText())),
                proveedor()));
    }

    private static String primero(JsonNode nodo, String... campos) {
        for (String campo : campos) {
            String valor = texto(nodo, campo);
            if (valor != null) {
                return valor;
            }
        }
        return null;
    }

    private static String texto(JsonNode nodo, String campo) {
        JsonNode valor = nodo.get(campo);
        return valor == null || valor.isNull() || valor.asText().isBlank() ? null : valor.asText();
    }

    private static BigDecimal escalar(BigDecimal valor) {
        return valor.setScale(ESCALA_COORDENADAS, RoundingMode.HALF_UP);
    }
}
