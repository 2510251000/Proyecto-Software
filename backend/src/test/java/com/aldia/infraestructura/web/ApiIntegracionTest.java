package com.aldia.infraestructura.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.aldia.dominio.modelo.UbicacionEncontrada;
import com.aldia.dominio.puerto.salida.GeocodificadorPuerto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * Pruebas de los endpoints principales con la aplicación completa: Spring Security,
 * controladores, casos de uso, JPA y las migraciones de Flyway (incluidos los datos de
 * demostración) sobre un PostgreSQL real que se arranca solo para las pruebas.
 * No usa la base ni la contraseña del equipo, ni sale a internet (la API de mapas se reemplaza).
 */
@SpringBootTest(properties = {
        "spring.profiles.active=dev",
        "jwt.clave-secreta=clave-solo-para-pruebas-automaticas-0123456789-0123456789-0123456789-abcdef",
        "jwt.expiracion-ms=3600000",
        "cors.origenes-permitidos=http://localhost:4200",
        "spring.flyway.locations=classpath:db/migration,classpath:db/demo",
        "aldia.geocodificacion.proveedor=nominatim"
})
@AutoConfigureMockMvc
@Import(ApiIntegracionTest.GeocodificadorDePrueba.class)
class ApiIntegracionTest {

    private static final EmbeddedPostgres BASE = arrancarBase();
    private static final String CLAVE_DEMO = "Usuario12345";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    private static EmbeddedPostgres arrancarBase() {
        try {
            return EmbeddedPostgres.builder().start();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo arrancar PostgreSQL embebido", ex);
        }
    }

    @DynamicPropertySource
    static void baseDeDatos(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", () -> BASE.getJdbcUrl("postgres", "postgres"));
        registro.add("spring.datasource.username", () -> "postgres");
        registro.add("spring.datasource.password", () -> "postgres");
    }

    /** Responde como la API de mapas, sin red: Fusagasugá por coordenadas y Tocaima por búsqueda. */
    @TestConfiguration
    static class GeocodificadorDePrueba {

        static final UbicacionEncontrada FUSA = new UbicacionEncontrada("osm:R1414846", "Fusagasugá", "Cundinamarca",
                "Fusagasugá, Cundinamarca, Colombia", new BigDecimal("4.33720000"), new BigDecimal("-74.36390000"),
                "prueba");
        static final UbicacionEncontrada TOCAIMA = new UbicacionEncontrada("osm:R999", "Tocaima", "Cundinamarca",
                "Tocaima, Cundinamarca, Colombia", new BigDecimal("4.45890000"), new BigDecimal("-74.63420000"),
                "prueba");

        @Bean
        @Primary
        GeocodificadorPuerto geocodificadorDePrueba() {
            return new GeocodificadorPuerto() {
                @Override
                public List<UbicacionEncontrada> buscar(String texto) {
                    return texto.toLowerCase().startsWith("toc") ? List.of(TOCAIMA) : List.of();
                }

                @Override
                public Optional<UbicacionEncontrada> enCoordenadas(BigDecimal latitud, BigDecimal longitud) {
                    return latitud.compareTo(BigDecimal.ZERO) > 0 ? Optional.of(FUSA) : Optional.empty();
                }

                @Override
                public Optional<UbicacionEncontrada> porIdLugar(String idLugar) {
                    return Optional.ofNullable(Map.of(FUSA.idLugar(), FUSA, TOCAIMA.idLugar(), TOCAIMA).get(idLugar));
                }

                @Override
                public String proveedor() {
                    return "prueba";
                }
            };
        }
    }

    // ------------------------------------------------------------------ ayudas

    private JsonNode leer(MockHttpServletRequestBuilder peticion, int estadoEsperado) throws Exception {
        String cuerpo = mvc.perform(peticion).andExpect(status().is(estadoEsperado))
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        return cuerpo.isBlank() ? json.nullNode() : json.readTree(cuerpo);
    }

    private MockHttpServletRequestBuilder conJson(MockHttpServletRequestBuilder peticion, Object cuerpo) throws Exception {
        return peticion.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(cuerpo));
    }

    private MockHttpServletRequestBuilder conToken(MockHttpServletRequestBuilder peticion, String token) {
        return peticion.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private String token(String correo, String contrasena) throws Exception {
        return leer(conJson(post("/api/auth/login"), Map.of("correo", correo, "contrasena", contrasena)), 200)
                .get("token").asText();
    }

    private long idCiudad(String nombre) throws Exception {
        for (JsonNode ciudad : leer(get("/api/ubicacion/ciudades"), 200)) {
            if (ciudad.get("nombre").asText().equals(nombre)) {
                return ciudad.get("id").asLong();
            }
        }
        throw new AssertionError("No está la ciudad " + nombre);
    }

    /** Registra un usuario nuevo en la ciudad indicada y devuelve su token. */
    private String usuarioNuevo(String ciudad) throws Exception {
        String correo = "prueba-" + UUID.randomUUID() + "@correo.com";
        leer(conJson(post("/api/auth/registro"), Map.of("correo", correo, "contrasena", "clave12345",
                "nombre", "Vecino de prueba", "ciudadId", idCiudad(ciudad))), 201);
        return token(correo, "clave12345");
    }

    private JsonNode publicar(String token, String titulo, long ciudadId, int estadoEsperado) throws Exception {
        return leer(conToken(conJson(post("/api/noticias"), Map.of("titulo", titulo, "resumen", "Resumen corto",
                "contenido", "Contenido de la noticia de prueba.", "ciudadId", ciudadId)), token), estadoEsperado);
    }

    private long noLeidas(String token) throws Exception {
        return leer(conToken(get("/api/notificaciones/no-leidas"), token), 200).get("cantidad").asLong();
    }

    private static List<JsonNode> lista(JsonNode arreglo) {
        List<JsonNode> elementos = new ArrayList<>();
        arreglo.forEach(elementos::add);
        return elementos;
    }

    // ------------------------------------------------------------------ pruebas

    @Test
    void lasCuentasDeDemostracionPuedenEntrar() throws Exception {
        assertThat(token("admin@aldia.com", "Admin12345")).isNotBlank();
        assertThat(token("corresponsal@aldia.com", CLAVE_DEMO)).isNotBlank();
        mvc.perform(conJson(post("/api/auth/login"), Map.of("correo", "admin@aldia.com", "contrasena", "mala")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void elRegistroPideCiudadYElPerfilMuestraNivelYCupo() throws Exception {
        mvc.perform(conJson(post("/api/auth/registro"), Map.of("correo", "sinciudad@correo.com", "contrasena", "clave12345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La ciudad es obligatoria"));

        String token = usuarioNuevo("Fusagasugá");
        JsonNode perfil = leer(conToken(get("/api/usuarios/me"), token), 200);

        assertThat(perfil.get("nivelNumero").asInt()).isEqualTo(1);
        assertThat(perfil.get("ciudad").get("nombre").asText()).isEqualTo("Fusagasugá");
        assertThat(perfil.get("cupo").get("limite").asInt()).isEqualTo(3);
        assertThat(perfil.get("cupo").get("restantes").asInt()).isEqualTo(3);
        assertThat(perfil.get("siguienteNivel").get("numero").asInt()).isEqualTo(2);
    }

    @Test
    void elListadoFiltraPorTipoYCiudadYBuscaSinImportarTildes() throws Exception {
        List<JsonNode> oficiales = lista(leer(get("/api/noticias").param("tipo", "OFICIALES"), 200));
        List<JsonNode> comunitarias = lista(leer(get("/api/noticias").param("tipo", "COMUNITARIAS"), 200));
        List<JsonNode> deZipaquira = lista(leer(get("/api/noticias").param("ciudadId",
                String.valueOf(idCiudad("Zipaquirá"))), 200));
        List<JsonNode> busqueda = lista(leer(get("/api/noticias").param("q", "GASTRONOMICA"), 200));

        assertThat(oficiales).isNotEmpty().allSatisfy(n -> assertThat(n.get("oficial").asBoolean()).isTrue());
        assertThat(comunitarias).isNotEmpty().allSatisfy(n -> assertThat(n.get("oficial").asBoolean()).isFalse());
        assertThat(deZipaquira).isNotEmpty().allSatisfy(n -> assertThat(n.get("ciudad").asText()).isEqualTo("Zipaquirá"));
        assertThat(busqueda).extracting(n -> n.get("titulo").asText())
                .contains("La feria gastronómica reunirá a cuarenta emprendedores");

        List<JsonNode> todas = lista(leer(get("/api/noticias").param("orden", "RECOMENDADAS"), 200));
        assertThat(todas).extracting(n -> n.get("titulo").asText()).doesNotContain("Publicación retirada por moderación");
        mvc.perform(get("/api/noticias").param("tipo", "INVENTADO")).andExpect(status().isBadRequest());
    }

    @Test
    void alPublicarSeAvisaALosDeLaMismaCiudadYNoALosDeOtra() throws Exception {
        String autor = usuarioNuevo("Fusagasugá");
        String vecina = token("vecina@aldia.com", CLAVE_DEMO);
        String lectorDeZipaquira = token("lector@aldia.com", CLAVE_DEMO);
        long vecinaAntes = noLeidas(vecina);
        long lectorAntes = noLeidas(lectorDeZipaquira);

        JsonNode noticia = publicar(autor, "Se cayó un árbol en la vía principal", idCiudad("Fusagasugá"), 201);

        assertThat(noticia.get("oficial").asBoolean()).isFalse();
        assertThat(noLeidas(vecina)).isEqualTo(vecinaAntes + 1);
        assertThat(noLeidas(lectorDeZipaquira)).isEqualTo(lectorAntes);
        assertThat(noLeidas(autor)).isZero();

        JsonNode aviso = leer(conToken(get("/api/notificaciones"), vecina), 200).get(0);
        assertThat(aviso.get("tipo").asText()).isEqualTo("CERCANIA");
        assertThat(aviso.get("noticiaId").asLong()).isEqualTo(noticia.get("id").asLong());

        leer(conToken(put("/api/notificaciones/" + aviso.get("id").asLong() + "/leida"), vecina), 204);
        assertThat(noLeidas(vecina)).isEqualTo(vecinaAntes);

        assertThat(leer(conToken(get("/api/usuarios/me"), autor), 200).get("puntaje").asInt()).isEqualTo(10);
    }

    @Test
    void elNivel1NoPuedePublicarMasDeTresNoticiasAlDia() throws Exception {
        String autor = usuarioNuevo("Girardot");
        long girardot = idCiudad("Girardot");

        for (int i = 1; i <= 3; i++) {
            publicar(autor, "Noticia número " + i, girardot, 201);
        }
        JsonNode rechazo = publicar(autor, "Noticia número 4", girardot, 429);

        assertThat(rechazo.get("mensaje").asText()).contains("límite de 3 noticias");
        assertThat(leer(conToken(get("/api/usuarios/me"), autor), 200).get("cupo").get("restantes").asInt()).isZero();
    }

    @Test
    void sinSesionNoSePuedePublicarNiVerNotificaciones() throws Exception {
        mvc.perform(conJson(post("/api/noticias"), Map.of("titulo", "x", "contenido", "y", "ciudadId", 1)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notificaciones")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void elAdministradorOcultaYBorraNoticiasComunitariasYAvisaAlAutor() throws Exception {
        String autor = usuarioNuevo("Chía");
        String admin = token("admin@aldia.com", "Admin12345");
        long id = publicar(autor, "Rumor sin confirmar", idCiudad("Chía"), 201).get("id").asLong();

        mvc.perform(conToken(get("/api/admin/noticias"), autor)).andExpect(status().isForbidden());

        JsonNode oculta = leer(conToken(conJson(put("/api/admin/noticias/" + id + "/estado"), Map.of("estado", "OCULTA")),
                admin), 200);
        assertThat(oculta.get("estado").asText()).isEqualTo("OCULTA");
        mvc.perform(get("/api/noticias/" + id)).andExpect(status().isNotFound());

        JsonNode aviso = leer(conToken(get("/api/notificaciones"), autor), 200).get(0);
        assertThat(aviso.get("tipo").asText()).isEqualTo("MODERACION");

        leer(conToken(delete("/api/admin/noticias/" + id), admin), 204);
        mvc.perform(conToken(conJson(put("/api/admin/noticias/" + id + "/estado"), Map.of("estado", "PUBLICADA")), admin))
                .andExpect(status().isForbidden());
    }

    @Test
    void elAdministradorGestionaUsuarios() throws Exception {
        String admin = token("admin@aldia.com", "Admin12345");
        String correo = "gestion-" + UUID.randomUUID() + "@correo.com";
        long id = leer(conJson(post("/api/auth/registro"), Map.of("correo", correo, "contrasena", "clave12345",
                "ciudadId", idCiudad("Soacha"))), 201).get("id").asLong();

        JsonNode usuarios = leer(conToken(get("/api/admin/usuarios"), admin), 200);
        assertThat(lista(usuarios)).anySatisfy(u -> {
            assertThat(u.get("correo").asText()).isEqualTo("corresponsal@aldia.com");
            assertThat(u.get("nivel").asInt()).isEqualTo(3);
        });

        JsonNode cambiado = leer(conToken(conJson(put("/api/admin/usuarios/" + id), Map.of("nivel", 2)), admin), 200);
        assertThat(cambiado.get("nivel").asInt()).isEqualTo(2);
        assertThat(cambiado.get("puntaje").asInt()).isEqualTo(50);

        leer(conToken(conJson(put("/api/admin/usuarios/" + id), Map.of("activo", false)), admin), 200);
        mvc.perform(conJson(post("/api/auth/login"), Map.of("correo", correo, "contrasena", "clave12345")))
                .andExpect(status().isForbidden());
    }

    @Test
    void laUbicacionReutilizaLasCiudadesDelCatalogoYRegistraLasNuevas() throws Exception {
        JsonNode porGps = leer(conJson(post("/api/ubicacion/resolver"),
                Map.of("latitud", 4.3372, "longitud", -74.3639)), 200);
        assertThat(porGps.get("id").asLong()).isEqualTo(idCiudad("Fusagasugá"));
        assertThat(porGps.get("proveedor").asText()).isEqualTo("prueba");

        JsonNode resultados = leer(get("/api/ubicacion/buscar").param("q", "Tocai"), 200);
        assertThat(resultados.get(0).get("ciudad").asText()).isEqualTo("Tocaima");

        JsonNode tocaima = leer(conJson(post("/api/ubicacion/resolver"),
                Map.of("idLugar", resultados.get(0).get("idLugar").asText())), 200);
        assertThat(tocaima.get("id").asLong()).isEqualTo(idCiudad("Tocaima"));

        mvc.perform(get("/api/ubicacion/buscar").param("q", "ab")).andExpect(status().isBadRequest());
        mvc.perform(conJson(post("/api/ubicacion/resolver"), Map.of("latitud", -10, "longitud", -74)))
                .andExpect(status().isNotFound());
    }
}
