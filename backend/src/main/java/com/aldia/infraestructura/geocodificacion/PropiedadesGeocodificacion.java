package com.aldia.infraestructura.geocodificacion;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Valores de aldia.geocodificacion en application.yml (todos salen de variables de entorno).
 */
@ConfigurationProperties(prefix = "aldia.geocodificacion")
public record PropiedadesGeocodificacion(
        String proveedor,
        String idioma,
        String paises,
        int tiempoEsperaMs,
        int maximoResultados,
        Google google,
        Nominatim nominatim
) {

    public record Google(String url, String clave) {

        public boolean tieneClave() {
            return clave != null && !clave.isBlank();
        }
    }

    public record Nominatim(String url, String agente, String correoContacto, long intervaloMinimoMs) {
    }

    /** El primer país de la lista, para Google (solo acepta uno en el filtro). */
    public String primerPais() {
        return paises == null || paises.isBlank() ? null : paises.split(",")[0].trim();
    }
}
