package com.aldia.infraestructura.geocodificacion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.aldia.dominio.excepcion.ServicioUbicacionNoDisponibleExcepcion;
import com.aldia.dominio.modelo.UbicacionEncontrada;

/**
 * Los adaptadores leen respuestas reales de cada API (grabadas en src/test/resources)
 * sin salir a internet: así las pruebas no dependen de la red ni gastan cuota.
 */
class GeocodificadoresTest {

    private static final String AGENTE = "AlDia-Pruebas/1.0";
    private static final BigDecimal LAT = new BigDecimal("4.3372");
    private static final BigDecimal LNG = new BigDecimal("-74.3639");

    private static PropiedadesGeocodificacion propiedades(String claveGoogle) {
        return new PropiedadesGeocodificacion("auto", "es", "co", 1000, 5,
                new PropiedadesGeocodificacion.Google("https://maps.googleapis.com/maps/api/geocode/json", claveGoogle),
                new PropiedadesGeocodificacion.Nominatim("https://nominatim.example", AGENTE, "", 0));
    }

    private static String json(String archivo) throws IOException {
        return new ClassPathResource("geocodificacion/" + archivo).getContentAsString(StandardCharsets.UTF_8);
    }

    @Test
    void nominatimBuscaMunicipiosSeIdentificaYDescartaLosCascosUrbanos() throws IOException {
        RestClient.Builder constructor = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(constructor).build();
        servidor.expect(requestTo(Matchers.startsWith("https://nominatim.example/search")))
                .andExpect(queryParam("countrycodes", "co"))
                .andExpect(header(HttpHeaders.USER_AGENT, AGENTE))
                .andRespond(withSuccess(json("nominatim-buscar.json"), MediaType.APPLICATION_JSON));

        List<UbicacionEncontrada> resultado =
                new NominatimGeocodificadorAdaptador(constructor.build(), propiedades("")).buscar("Fusagasugá");

        assertThat(resultado).singleElement().satisfies(u -> {
            assertThat(u.ciudad()).isEqualTo("Fusagasugá");
            assertThat(u.departamento()).isEqualTo("Cundinamarca");
            assertThat(u.idLugar()).isEqualTo("osm:R1414846");
            assertThat(u.proveedor()).isEqualTo("nominatim");
        });
        servidor.verify();
    }

    @Test
    void nominatimInversaDevuelveElMunicipioConElPuntoDelUsuarioYUsaLaCache() throws IOException {
        RestClient.Builder constructor = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(constructor).build();
        servidor.expect(ExpectedCount.once(), requestTo(Matchers.startsWith("https://nominatim.example/reverse")))
                .andExpect(queryParam("zoom", "8"))
                .andRespond(withSuccess(json("nominatim-inversa.json"), MediaType.APPLICATION_JSON));
        NominatimGeocodificadorAdaptador adaptador =
                new NominatimGeocodificadorAdaptador(constructor.build(), propiedades(""));

        UbicacionEncontrada ubicacion = adaptador.enCoordenadas(LAT, LNG).orElseThrow();
        // La segunda consulta igual sale de la caché: no vuelve a molestar al servidor.
        adaptador.enCoordenadas(LAT, LNG);

        assertThat(ubicacion.ciudad()).isEqualTo("Fusagasugá");
        assertThat(ubicacion.latitud()).isEqualByComparingTo("4.3372");
        assertThat(ubicacion.longitud()).isEqualByComparingTo("-74.3639");
        servidor.verify();
    }

    @Test
    void siNominatimFallaSeAvisaQueElServicioNoEstaDisponible() {
        RestClient.Builder constructor = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(constructor).build();
        servidor.expect(requestTo(Matchers.startsWith("https://nominatim.example/reverse"))).andRespond(withServerError());

        NominatimGeocodificadorAdaptador adaptador =
                new NominatimGeocodificadorAdaptador(constructor.build(), propiedades(""));

        assertThatThrownBy(() -> adaptador.enCoordenadas(LAT, LNG))
                .isInstanceOf(ServicioUbicacionNoDisponibleExcepcion.class);
    }

    @Test
    void googleInversaLeeLocalidadDepartamentoYPlaceId() throws IOException {
        RestClient.Builder constructor = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(constructor).build();
        servidor.expect(requestTo(Matchers.startsWith("https://maps.googleapis.com/maps/api/geocode/json")))
                .andExpect(queryParam("latlng", "4.3372,-74.3639"))
                .andExpect(queryParam("key", "clave-de-prueba"))
                .andRespond(withSuccess(json("google-inversa.json"), MediaType.APPLICATION_JSON));

        UbicacionEncontrada ubicacion = new GoogleMapsGeocodificadorAdaptador(constructor.build(),
                propiedades("clave-de-prueba")).enCoordenadas(LAT, LNG).orElseThrow();

        assertThat(ubicacion.ciudad()).isEqualTo("Fusagasugá");
        assertThat(ubicacion.departamento()).isEqualTo("Cundinamarca");
        assertThat(ubicacion.idLugar()).isEqualTo("ChIJx7Qb3cRcP44RQ1u8eTPa6uE");
        assertThat(ubicacion.proveedor()).isEqualTo("google");
        servidor.verify();
    }

    @Test
    void googleConClaveInvalidaSeAvisaQueElServicioNoEstaDisponible() {
        RestClient.Builder constructor = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(constructor).build();
        servidor.expect(requestTo(Matchers.startsWith("https://maps.googleapis.com")))
                .andRespond(withSuccess("{\"results\":[],\"status\":\"REQUEST_DENIED\",\"error_message\":\"clave\"}",
                        MediaType.APPLICATION_JSON));

        GoogleMapsGeocodificadorAdaptador adaptador =
                new GoogleMapsGeocodificadorAdaptador(constructor.build(), propiedades("mala"));

        assertThatThrownBy(() -> adaptador.buscar("Fusagasugá"))
                .isInstanceOf(ServicioUbicacionNoDisponibleExcepcion.class);
    }

    @Test
    void laConfiguracionEligeElProveedor() {
        GeocodificacionConfiguracion configuracion = new GeocodificacionConfiguracion();

        assertThat(configuracion.geocodificador(propiedades(""), RestClient.builder()).proveedor())
                .isEqualTo("nominatim");
        assertThat(configuracion.geocodificador(propiedades("clave"), RestClient.builder()).proveedor())
                .isEqualTo("google");

        PropiedadesGeocodificacion googleSinClave = new PropiedadesGeocodificacion("google", "es", "co", 1000, 5,
                new PropiedadesGeocodificacion.Google("u", ""), propiedades("").nominatim());
        assertThatThrownBy(() -> configuracion.geocodificador(googleSinClave, RestClient.builder()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("GOOGLE_MAPS_API_KEY");
    }
}
