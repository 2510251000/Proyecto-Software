package com.aldia.infraestructura.geocodificacion;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;

/**
 * Elige el adaptador de geocodificación según GEO_PROVEEDOR:
 * auto (Google si hay clave, si no Nominatim), google o nominatim.
 */
@Configuration
@EnableConfigurationProperties(PropiedadesGeocodificacion.class)
public class GeocodificacionConfiguracion {

    private static final Logger LOG = LoggerFactory.getLogger(GeocodificacionConfiguracion.class);

    @Bean
    public GeocodificadorPuerto geocodificador(PropiedadesGeocodificacion propiedades, RestClient.Builder constructor) {
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofMillis(propiedades.tiempoEsperaMs()));
        fabrica.setReadTimeout(Duration.ofMillis(propiedades.tiempoEsperaMs()));
        RestClient cliente = constructor.requestFactory(fabrica).build();

        String proveedor = propiedades.proveedor() == null ? "auto" : propiedades.proveedor().trim().toLowerCase();
        boolean usarGoogle = switch (proveedor) {
            case "google" -> {
                if (!propiedades.google().tieneClave()) {
                    throw new IllegalStateException(
                            "GEO_PROVEEDOR=google necesita GOOGLE_MAPS_API_KEY en el .env");
                }
                yield true;
            }
            case "nominatim" -> false;
            case "auto" -> propiedades.google().tieneClave();
            default -> throw new IllegalStateException(
                    "GEO_PROVEEDOR debe ser auto, google o nominatim (llegó: " + proveedor + ")");
        };

        if (usarGoogle) {
            LOG.info("Geocodificación: Google Maps Geocoding API");
            return new GoogleMapsGeocodificadorAdaptador(cliente, propiedades);
        }
        LOG.info("Geocodificación: Nominatim (OpenStreetMap) en {}", propiedades.nominatim().url());
        return new NominatimGeocodificadorAdaptador(cliente, propiedades);
    }
}
